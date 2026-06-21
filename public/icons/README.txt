Add real icons here before shipping:

- icon-192.png (192x192)
- icon-512.png (512x512)

Referenced by vite.config.ts (PWA manifest) and index.html. Without these,
the app still runs fine in the browser, but install-to-homescreen / Lighthouse
PWA checks will fail.
