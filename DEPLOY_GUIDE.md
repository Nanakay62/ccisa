# Deployment Guide for Netlify

To host this PWA on Netlify so church members can download it:

1. **Build the Project**:
   In your terminal, run:
   ```bash
   npm run build
   ```
   This will create a `dist` folder.

2. **Deploy to Netlify**:
   - Log in to [Netlify](https://www.netlify.com/).
   - Go to "Add new site" > "Deploy manually".
   - Drag and drop the **`dist`** folder into the upload area.

3. **HTTPS Requirement**:
   PWAs and Local AI models (Transformers.js) require a secure context (HTTPS). Netlify provides this by default on their `.netlify.app` URLs.

4. **Service Worker**:
   The `sw.js` and `manifest.json` in the `public` folder are automatically included in the build, enabling the "Install to Home Screen" prompt for members.
