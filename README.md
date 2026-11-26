# Profal Kumar – Portfolio

Live site: https://kumarsriprofel-hue.github.io/

## How to change anything (no coding)

1. Go to **https://app.pagescms.org** and click **Sign in with GitHub**.
2. Open the repository **kumarsriprofel-hue.github.io**.
3. Click **Website content**. Edit any section with the forms, upload photos or a new CV, then click **Save**.
4. The live site updates automatically in about 1 minute.

Formatting you can use in any text box: `**bold**` and `*amber highlight*`.

## How it works

- `content/site.json` – all words, photos and projects (this is what the admin panel edits)
- `index.html` – page shell
- `assets/css/style.css` – design and colours
- `assets/js/main.js` – builds the page from the content file
- `.pages.yml` – admin panel form setup

## Security

- Static site on GitHub Pages: no server or database that can be hacked, and HTTPS is always on.
- A strict Content Security Policy only lets this site's own scripts run.
- All content is HTML-escaped before it is shown, and only safe link types are allowed.
- Only GitHub accounts with write access to this repository can edit the site.
  **Turn on two-factor authentication** on your GitHub account: Settings → Password and authentication.
