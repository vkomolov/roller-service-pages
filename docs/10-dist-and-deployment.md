# Dist and Deployment

`dist/` is the generated static website. It is recreated by the Gulp pipeline and should not
be edited as the source of truth. The current build is configured for Cloudflare Pages-style
redirects and generates Ukrainian and Russian URL trees.

## 1. Output structure

The build produces a structure similar to:

```text
dist/
├── _redirects
├── robots.txt
├── uk/
│   ├── index.html
│   └── ...
├── ru/
│   ├── index.html
│   └── ...
├── css/
│   ├── index.css
│   ├── index.min.css
│   ├── critical.css
│   └── critical.min.css
├── js/
│   ├── index.bundle.js
│   ├── vendor.bundle.js
│   └── [asynchronous chunks]
└── assets/
    ├── data/
    ├── fonts/
    └── img/
```

Exact files depend on source assets and Webpack output. The HTML resource tags use absolute
root paths such as `/css/index.min.css`, `/js/index.bundle.js`, and `/assets/...`; deployment
must serve the site at the domain root unless those URL assumptions are changed consistently.

## 2. Redirects and language routes

`src/_redirects` is copied into the root of `dist/`. Its current rules redirect `/` to `/uk/`
with HTTP 302 and serve `/uk/*` and `/ru/*` paths. Check the generated file after editing and
confirm behavior with the hosting provider's redirect syntax.

The generated language pages are in `dist/uk/` and `dist/ru/`. The development preview opens
`/uk/index.html` by default; that is a BrowserSync setting, not a production redirect rule.

## 3. Build and preview

- `npm run pipesBuild` runs the production pipeline without a local server.
- `npm run build` runs the production pipeline and starts a BrowserSync preview.
- `npm run clean` removes `dist/`, `zip/`, and `src/temp/`.

Before deploying, run a clean production build (`npm run pipesBuild` already begins by
cleaning). Check that both language directories contain all expected pages, assets resolve,
and `_redirects` and `robots.txt` are present at the output root. Deploy the contents of
`dist/`, not the source tree or the repository root.

## 4. Cloudflare Pages and SEO settings

The checked-in `_redirects` format is intended for Cloudflare Pages. Hosting configuration
outside this repository (custom domains, build commands, output directory, caching, and
environment settings) must agree with the static output: the build command is normally
`npm run pipesBuild` and the output directory is `dist`.

Review these source settings before public deployment:

- `rootUrl` in `gulp/settings.js` is currently `https://roller-service.pages.dev/`.
- `robotsParams` in `gulp/paths.js` is currently `noindex, nofollow` and is rendered into
  page metadata.
- `src/robots.txt` allows crawling; `Allow: /` does not override the HTML `noindex` directive.
- Canonical and alternate-language links are generated based on the configured root URL and
  language list.

If the live domain or indexing policy changes, update the source configuration, build, and
inspect the generated `<head>` metadata and redirects before publishing. Do not change only
the generated HTML.

## 5. Deployment checklist

- Use the required Node.js version and install from `package-lock.json`.
- Run `npm run pipesBuild` and check for task errors.
- Confirm `/uk/`, `/ru/`, and the root redirect work on the deployed host.
- Check a representative page in each language, including canonical, alternate, title,
  description, and robots metadata.
- Verify CSS, JavaScript chunks, fonts, sprites, and image URLs return successfully.
- Confirm the deployment output directory is exactly `dist/`.
- Confirm the robots/indexing setting is intentional for the target environment.

## 6. Troubleshooting

- **Root URL does not redirect:** inspect the deployed `_redirects` file and hosting provider
  support/configuration.
- **Only one language is available:** check `alternateLanguages`, language JSON files, and
  the generated directories.
- **Assets 404 on a custom path:** the site currently uses root-relative URLs; host at the
  domain root or deliberately revise all resource/canonical path handling.
- **Search engines do not index pages:** inspect the generated robots meta tag; the current
  value is `noindex, nofollow`.
- **Changes disappear after rebuilding:** modify source files, not `dist/`, which is
  deleted and recreated by the pipeline.
