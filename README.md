# FreeFiles

A lightweight, single-file HTML5, CSS3, and vanilla JavaScript file-indexing and download portal. Designed for zero-dependency static hosting on **GitHub Pages**, **Cloudflare Pages**, or **Netlify**.

## Features

- **Simple, Approachable Interface**: Clean file rows showing file name, file size, a 3–4 line description, and direct download button.
- **Instant Search & Category Filtering**: Filter files live by title, description, format, or category (`Audio & Packs`, `Software & Tools`, `PDFs & Guides`, `Templates`).
- **Light Mode Default + Dark Mode Toggle**: Starts in Light Mode by default with persistent Light/Dark switching.
- **File Details & SHA-256 Verification**: Click any file row to inspect full release notes, copyable SHA-256 checksums, and mirror download links.
- **Sponsor & Google AdSense Support**: Ships with clean native sponsor cards out of the box and supports one-switch Google AdSense integration.
- **Built-In JSON Entry Generator**: Click `+ Add File Entry` in the footer to generate ready-to-paste entries for `filesData`.

## Deploying to GitHub Pages

1. Push `index.html` (and optionally `README.md`) to your GitHub repository.
2. Open **Settings → Pages** in your GitHub repository.
3. Under **Build and deployment**, select **Deploy from a branch**, choose `main` (root `/`), and click **Save**.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

## Configuration (`index.html`)

Open `index.html` and edit the configuration block near the top of `<script>`:

- **Branding & Contact**: Update `BRAND_NAME` and `CONTACT_EMAIL`.
- **Google AdSense**: Change `AD_CONFIG.provider` from `"sponsors"` to `"adsense"`, and enter your `adsenseClientId` (`ca-pub-...`) and `adsenseSlots` (`leaderboard`, `sidebar`, `infeed`).
- **Custom Sponsors / Affiliate Links**: Edit `AD_CONFIG.sponsors` to point to your own affiliate links or direct sponsors.
- **Adding Files**: Use the `+ Add File Entry` button in the footer to generate a JSON object and paste it into the `filesData` array.
