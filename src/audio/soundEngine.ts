import type { SoundItem, SynthPreset } from '../data/soundsCatalog';

const SAMPLE_RATE = 44100;
const bufferCache = new Map<string, AudioBuffer>();
const peaksCache = new Map<string, number[]>();

let liveAudioCtx: AudioContext | null = null;
let currentSource: AudioBufferSourceNode | null = null;
let progressRaf: number | null = null;

function getLiveAudioContext(): AudioContext {
  if (!liveAudioCtx) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    liveAudioCtx = new Ctx();
  }
  if (liveAudioCtx.state === 'suspended') {
    void liveAudioCtx.resume();
  }
  return liveAudioCtx;
}

function createNoiseBuffer(ctx: BaseAudioContext, duration: number): AudioBuffer {
  const length = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 1337;
  for (let i = 0; i < length; i++) {
    seed = (seed * 16807) % 2147483647;
    data[i] = ((seed - 1) / 2147483646) * 2 - 1;
  }
  return buffer;
}

function createSoftClipCurve(amount = 2.5): Float32Array<ArrayBuffer> {
  const samples = 1024;
  const buffer = new ArrayBuffer(samples * 4);
  const curve = new Float32Array(buffer);
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = Math.tanh(x * amount);
  }
  return curve;
}

function synthesizePreset(
  ctx: OfflineAudioContext,
  preset: SynthPreset,
  duration: number,
  pitch = 1
): void {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.85, 0);
  master.connect(ctx.destination);

  const p = pitch;

  switch (preset) {
    case 'vine_boom': {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const shaper = ctx.createWaveShaper();
      shaper.curve = createSoftClipCurve(3.0);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(145 * p, 0);
      osc.frequency.exponentialRampToValueAtTime(46 * p, 0.14);
      osc.frequency.exponentialRampToValueAtTime(30 * p, duration);

      gain.gain.setValueAtTime(0.001, 0);
      gain.gain.linearRampToValueAtTime(1.0, 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, duration - 0.03);

      // Punchy click transient
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.08);
      const nf = ctx.createBiquadFilter();
      nf.type = 'lowpass';
      nf.frequency.setValueAtTime(600, 0);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.45, 0);
      ng.gain.exponentialRampToValueAtTime(0.001, 0.06);
      noise.connect(nf).connect(ng).connect(master);
      noise.start(0);

      osc.connect(shaper).connect(gain).connect(master);
      osc.start(0);
      osc.stop(duration);
      break;
    }

    case 'sad_trombone': {
      const notes = [
        { freq: 311.13 * p, start: 0.0, len: 0.42 },
        { freq: 293.66 * p, start: 0.48, len: 0.42 },
        { freq: 277.18 * p, start: 0.96, len: 0.42 },
        { freq: 261.63 * p, start: 1.44, len: 1.0, slideTo: 233.08 * p },
      ];
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.freq, n.start);
        if (n.slideTo) {
          osc.frequency.linearRampToValueAtTime(n.slideTo, n.start + n.len * 0.9);
          // Subtle vibrato on the final note
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.frequency.setValueAtTime(5.5, n.start);
          lfoGain.gain.setValueAtTime(5, n.start);
          lfo.connect(lfoGain).connect(osc.frequency);
          lfo.start(n.start + 0.15);
          lfo.stop(n.start + n.len);
        }

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, n.start);
        filter.frequency.linearRampToValueAtTime(1350, n.start + 0.09);
        filter.frequency.linearRampToValueAtTime(620, n.start + n.len);
        filter.Q.setValueAtTime(3.2, n.start);

        g.gain.setValueAtTime(0.001, n.start);
        g.gain.linearRampToValueAtTime(0.42, n.start + 0.04);
        g.gain.setValueAtTime(0.38, n.start + n.len - 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, n.start + n.len);

        osc.connect(filter).connect(g).connect(master);
        osc.start(n.start);
        osc.stop(n.start + n.len);
      });
      break;
    }

    case 'airhorn': {
      const blasts = [
        { start: 0.0, len: 0.24 },
        { start: 0.3, len: 0.24 },
        { start: 0.62, len: 0.98 },
      ];
      const freqs = [349.23, 440.0, 523.25];
      blasts.forEach((b) => {
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          const filter = ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(f * p * (1 + (idx - 1) * 0.004), b.start);
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1400, b.start);
          filter.Q.setValueAtTime(0.9, b.start);

          g.gain.setValueAtTime(0.001, b.start);
          g.gain.linearRampToValueAtTime(0.24, b.start + 0.015);
          g.gain.setValueAtTime(0.22, b.start + b.len - 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, b.start + b.len);

          osc.connect(filter).connect(g).connect(master);
          osc.start(b.start);
          osc.stop(b.start + b.len);
        });
      });
      break;
    }

    case 'record_scratch': {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520 * p, 0);
      osc.frequency.exponentialRampToValueAtTime(180 * p, 0.22);
      osc.frequency.linearRampToValueAtTime(320 * p, 0.34);
      osc.frequency.exponentialRampToValueAtTime(38 * p, 0.92);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, 0);
      filter.frequency.exponentialRampToValueAtTime(240, 0.92);
      filter.Q.setValueAtTime(2.5, 0);

      g.gain.setValueAtTime(0.001, 0);
      g.gain.linearRampToValueAtTime(0.55, 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, 0.95);

      // Vinyl needle drag noise
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.95);
      const nf = ctx.createBiquadFilter();
      nf.type = 'highpass';
      nf.frequency.setValueAtTime(2200, 0);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.18, 0);
      ng.gain.exponentialRampToValueAtTime(0.001, 0.92);
      noise.connect(nf).connect(ng).connect(master);
      noise.start(0);

      osc.connect(filter).connect(g).connect(master);
      osc.start(0);
      osc.stop(0.96);
      break;
    }

    case 'dramatic_chord': {
      const chord = [130.81, 155.56, 196.0, 233.08, 311.13];
      chord.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = idx < 2 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(f * p, 0);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, 0);
        filter.frequency.exponentialRampToValueAtTime(2400, 0.25);
        filter.frequency.exponentialRampToValueAtTime(480, duration);

        g.gain.setValueAtTime(0.001, 0);
        g.gain.linearRampToValueAtTime(0.22, 0.06);
        g.gain.exponentialRampToValueAtTime(0.001, duration - 0.05);

        osc.connect(filter).connect(g).connect(master);
        osc.start(0);
        osc.stop(duration);
      });
      break;
    }

    case 'fail_buzzer': {
      const freqs = [110 * p, 116.54 * p, 164.81 * p];
      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, 0);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(980, 0);

        g.gain.setValueAtTime(0.001, 0);
        g.gain.linearRampToValueAtTime(0.28, 0.015);
        g.gain.setValueAtTime(0.25, duration - 0.14);
        g.gain.exponentialRampToValueAtTime(0.001, duration - 0.02);

        osc.connect(filter).connect(g).connect(master);
        osc.start(0);
        osc.stop(duration);
      });
      break;
    }

    case 'lofi_rhodes': {
      const chords = [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0],  // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 349.23], // G7
      ];
      chords.forEach((notes, barIdx) => {
        const start = barIdx * 2.0;
        notes.forEach((freq, noteIdx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          const t = start + noteIdx * 0.03;
          osc.frequency.setValueAtTime(freq * p, t);
          g.gain.setValueAtTime(0.001, t);
          g.gain.linearRampToValueAtTime(0.16, t + 0.04);
          g.gain.exponentialRampToValueAtTime(0.04, start + 1.85);
          g.gain.exponentialRampToValueAtTime(0.001, start + 1.98);
          osc.connect(g).connect(master);
          osc.start(t);
          osc.stop(start + 2.0);
        });
      });
      // Subtle warm lo-fi vinyl crackle bed
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, duration);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass';
      nf.frequency.setValueAtTime(1600, 0);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.015, 0);
      noise.connect(nf).connect(ng).connect(master);
      noise.start(0);
      break;
    }

    case 'vlog_groove': {
      const step = 0.25;
      const arp = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 392.0];
      const totalSteps = Math.floor(duration / step);
      for (let i = 0; i < totalSteps; i++) {
        const t = i * step;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(arp[i % arp.length] * p, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.2, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + step * 0.85);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + step);

        // Kick on even beats
        if (i % 2 === 0) {
          const k = ctx.createOscillator();
          const kg = ctx.createGain();
          k.type = 'sine';
          k.frequency.setValueAtTime(125, t);
          k.frequency.exponentialRampToValueAtTime(45, t + 0.12);
          kg.gain.setValueAtTime(0.45, t);
          kg.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
          k.connect(kg).connect(master);
          k.start(t);
          k.stop(t + 0.17);
        }
      }
      break;
    }

    case 'doc_tension': {
      const step = 0.5;
      const bassNotes = [110, 110, 116.54, 110, 98, 98, 103.83, 98];
      const count = Math.floor(duration / step);
      for (let i = 0; i < count; i++) {
        const t = i * step;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassNotes[i % bassNotes.length] * p, t);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(480, t);
        filter.frequency.exponentialRampToValueAtTime(180, t + 0.4);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.28, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(filter).connect(g).connect(master);
        osc.start(t);
        osc.stop(t + 0.46);
      }
      // Atmospheric pad
      [220, 329.63].forEach((f) => {
        const pad = ctx.createOscillator();
        const pg = ctx.createGain();
        pad.type = 'sine';
        pad.frequency.setValueAtTime(f * p, 0);
        pg.gain.setValueAtTime(0.001, 0);
        pg.gain.linearRampToValueAtTime(0.11, 1.0);
        pg.gain.setValueAtTime(0.11, duration - 1.0);
        pg.gain.exponentialRampToValueAtTime(0.001, duration);
        pad.connect(pg).connect(master);
        pad.start(0);
        pad.stop(duration);
      });
      break;
    }

    case 'tech_ambient': {
      const padFreqs = [196.0, 293.66, 392.0, 493.88];
      padFreqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(f * p, 0);
        g.gain.setValueAtTime(0.001, 0);
        g.gain.linearRampToValueAtTime(0.13, 1.2);
        g.gain.setValueAtTime(0.12, duration - 1.2);
        g.gain.exponentialRampToValueAtTime(0.001, duration);
        osc.connect(g).connect(master);
        osc.start(0);
        osc.stop(duration);
      });
      // Soft glass pings every 2s
      [0.5, 2.5, 4.5, 6.5].forEach((t, i) => {
        if (t >= duration) return;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime((i % 2 === 0 ? 783.99 : 987.77) * p, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.11, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + 1.25);
      });
      break;
    }

    case 'acoustic_pluck': {
      const pattern = [261.63, 329.63, 392.0, 493.88, 392.0, 329.63, 293.66, 392.0];
      const step = 0.5;
      const steps = Math.floor(duration / step);
      for (let i = 0; i < steps; i++) {
        const t = i * step;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(pattern[i % pattern.length] * p, t);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2200, t);
        filter.frequency.exponentialRampToValueAtTime(420, t + 0.45);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.28, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.48);
        osc.connect(filter).connect(g).connect(master);
        osc.start(t);
        osc.stop(t + 0.5);
      }
      break;
    }

    case 'late_night_chill': {
      const chords = [
        [146.83, 220.0, 261.63, 329.63],
        [130.81, 196.0, 246.94, 293.66],
      ];
      chords.forEach((chord, idx) => {
        const start = idx * 4.0;
        chord.forEach((f) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f * p, start);
          g.gain.setValueAtTime(0.001, start);
          g.gain.linearRampToValueAtTime(0.15, start + 0.35);
          g.gain.exponentialRampToValueAtTime(0.001, start + 3.9);
          osc.connect(g).connect(master);
          osc.start(start);
          osc.stop(start + 3.95);
        });
      });
      break;
    }

    case 'whoosh': {
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, duration);
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.8, 0);
      filter.frequency.setValueAtTime(160 * p, 0);
      filter.frequency.exponentialRampToValueAtTime(2600 * p, duration * 0.45);
      filter.frequency.exponentialRampToValueAtTime(220 * p, duration);

      g.gain.setValueAtTime(0.001, 0);
      g.gain.linearRampToValueAtTime(0.7, duration * 0.4);
      g.gain.exponentialRampToValueAtTime(0.001, duration - 0.02);

      noise.connect(filter).connect(g).connect(master);
      noise.start(0);
      noise.stop(duration);
      break;
    }

    case 'cash_register': {
      // Mechanical drawer latch
      const noise = ctx.createBufferSource();
      noise.buffer = createNoiseBuffer(ctx, 0.14);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass';
      nf.frequency.setValueAtTime(1800, 0);
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.45, 0);
      ng.gain.exponentialRampToValueAtTime(0.001, 0.12);
      noise.connect(nf).connect(ng).connect(master);
      noise.start(0);

      // Cha-ching metallic bell harmonics
      [0.14, 0.25].forEach((start, idx) => {
        const base = (idx === 0 ? 1567.98 : 2093.0) * p;
        [1, 1.5, 2.42].forEach((mult, mIdx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(base * mult, start);
          g.gain.setValueAtTime(0.001, start);
          g.gain.linearRampToValueAtTime(0.28 / (mIdx + 1), start + 0.005);
          g.gain.exponentialRampToValueAtTime(0.001, start + 0.85);
          osc.connect(g).connect(master);
          osc.start(start);
          osc.stop(start + 0.9);
        });
      });
      break;
    }

    case 'ui_pop': {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340 * p, 0);
      osc.frequency.exponentialRampToValueAtTime(880 * p, 0.07);
      osc.frequency.exponentialRampToValueAtTime(480 * p, 0.14);

      g.gain.setValueAtTime(0.001, 0);
      g.gain.linearRampToValueAtTime(0.75, 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, duration - 0.02);

      osc.connect(g).connect(master);
      osc.start(0);
      osc.stop(duration);
      break;
    }

    case 'notify_chime': {
      const notes = [
        { freq: 659.25 * p, start: 0.0 },
        { freq: 987.77 * p, start: 0.16 },
      ];
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.freq, n.start);
        g.gain.setValueAtTime(0.001, n.start);
        g.gain.linearRampToValueAtTime(0.45, n.start + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, n.start + 0.95);
        osc.connect(g).connect(master);
        osc.start(n.start);
        osc.stop(n.start + 1.0);
      });
      break;
    }

    case 'glitch_zap': {
      const steps = 8;
      const stepLen = (duration - 0.05) / steps;
      const freqs = [920, 210, 1480, 340, 1120, 160, 1840, 410];
      for (let i = 0; i < steps; i++) {
        const t = i * stepLen;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = i % 2 === 0 ? 'square' : 'sawtooth';
        osc.frequency.setValueAtTime(freqs[i % freqs.length] * p, t);
        g.gain.setValueAtTime(0.24, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + stepLen * 0.9);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + stepLen);
      }
      break;
    }

    case 'cinematic_hit': {
      const sub = ctx.createOscillator();
      const sg = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(110 * p, 0);
      sub.frequency.exponentialRampToValueAtTime(32 * p, 0.8);
      sg.gain.setValueAtTime(0.001, 0);
      sg.gain.linearRampToValueAtTime(0.95, 0.01);
      sg.gain.exponentialRampToValueAtTime(0.001, duration - 0.05);
      sub.connect(sg).connect(master);
      sub.start(0);
      sub.stop(duration);

      const tail = ctx.createBufferSource();
      tail.buffer = createNoiseBuffer(ctx, duration);
      const tf = ctx.createBiquadFilter();
      tf.type = 'lowpass';
      tf.frequency.setValueAtTime(1800, 0);
      tf.frequency.exponentialRampToValueAtTime(220, duration);
      const tg = ctx.createGain();
      tg.gain.setValueAtTime(0.45, 0);
      tg.gain.exponentialRampToValueAtTime(0.001, duration - 0.05);
      tail.connect(tf).connect(tg).connect(master);
      tail.start(0);
      tail.stop(duration);
      break;
    }
  }
}

export async function renderSoundBuffer(sound: SoundItem): Promise<AudioBuffer> {
  const cacheKey = sound.audioUrl
    ? `${sound.id}:${sound.audioUrl}`
    : `${sound.id}:${sound.synthPreset ?? 'ui_pop'}:${sound.durationSec}:${sound.pitchMultiplier ?? 1}`;
  const existing = bufferCache.get(cacheKey);
  if (existing) return existing;

  if (sound.audioUrl) {
    const response = await fetch(sound.audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const ctx = getLiveAudioContext();
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    bufferCache.set(cacheKey, decoded);
    return decoded;
  }

  const length = Math.ceil(SAMPLE_RATE * sound.durationSec);
  const offline = new OfflineAudioContext(1, length, SAMPLE_RATE);
  synthesizePreset(offline, sound.synthPreset ?? 'ui_pop', sound.durationSec, sound.pitchMultiplier ?? 1);
  const rendered = await offline.startRendering();
  bufferCache.set(cacheKey, rendered);
  return rendered;
}

export async function getSoundWaveform(sound: SoundItem, barCount = 44): Promise<number[]> {
  const cacheKey = `${sound.id}:${barCount}`;
  const cached = peaksCache.get(cacheKey);
  if (cached) return cached;

  const buffer = await renderSoundBuffer(sound);
  const channel = buffer.getChannelData(0);
  const step = Math.max(1, Math.floor(channel.length / barCount));
  const rawPeaks: number[] = [];

  for (let i = 0; i < barCount; i++) {
    const start = i * step;
    const end = Math.min(channel.length, start + step);
    let max = 0;
    for (let j = start; j < end; j++) {
      const abs = Math.abs(channel[j]);
      if (abs > max) max = abs;
    }
    rawPeaks.push(max);
  }

  const peakMax = Math.max(...rawPeaks, 0.01);
  const normalized = rawPeaks.map((v) => Math.max(0.14, Math.min(1, v / peakMax)));
  peaksCache.set(cacheKey, normalized);
  return normalized;
}

export function stopCurrentPlayback(): void {
  if (progressRaf !== null) {
    cancelAnimationFrame(progressRaf);
    progressRaf = null;
  }
  if (currentSource) {
    try {
      currentSource.onended = null;
      currentSource.stop();
      currentSource.disconnect();
    } catch {
      // Ignore if already stopped
    }
    currentSource = null;
  }
}

export async function playSoundPreview(
  sound: SoundItem,
  startRatio = 0,
  onProgress: (ratio: number) => void,
  onComplete: () => void
): Promise<void> {
  stopCurrentPlayback();
  const ctx = getLiveAudioContext();
  const buffer = await renderSoundBuffer(sound);

  const clampedRatio = Math.max(0, Math.min(0.98, startRatio));
  const offsetSec = clampedRatio * buffer.duration;
  const remainingSec = Math.max(0.05, buffer.duration - offsetSec);

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  currentSource = source;

  const startTime = ctx.currentTime;

  const tick = () => {
    if (currentSource !== source) return;
    const elapsed = ctx.currentTime - startTime;
    const currentRatio = Math.min(1, (offsetSec + elapsed) / buffer.duration);
    onProgress(currentRatio);
    if (elapsed < remainingSec) {
      progressRaf = requestAnimationFrame(tick);
    }
  };

  source.onended = () => {
    if (currentSource === source) {
      stopCurrentPlayback();
      onProgress(0);
      onComplete();
    }
  };

  source.start(0, offsetSec);
  progressRaf = requestAnimationFrame(tick);
}

function encodeWavFromBuffer(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const samples = buffer.getChannelData(0);
  const byteLength = 44 + samples.length * 2;
  const arrayBuffer = new ArrayBuffer(byteLength);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, 16, true); // 16-bit
  writeStr(36, 'data');
  view.setUint32(40, samples.length * 2, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

export async function downloadSoundWav(sound: SoundItem): Promise<void> {
  const slug = sound.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (sound.audioUrl) {
    const link = document.createElement('a');
    link.href = sound.audioUrl;
    const ext = sound.fileName?.split('.').pop()?.toLowerCase() || sound.format.toLowerCase() || 'wav';
    link.download = `${slug || 'soundshub-audio'}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  const buffer = await renderSoundBuffer(sound);
  const wavBlob = encodeWavFromBuffer(buffer);
  const url = URL.createObjectURL(wavBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${slug || 'soundshub-audio'}.wav`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
