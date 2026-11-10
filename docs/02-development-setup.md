# Development Setup

This document describes how to prepare the local development environment, install project
dependencies, run the development server, and execute production builds.

1. Prerequisites

Before working with the project, make sure the following software is installed:

- Node.js 24.12.0 — the exact version required by the project.
- npm — the package manager used to install dependencies.
- Git — recommended for working with the repository and tracking source changes.
- A code editor, such as Visual Studio Code.

### Node.js version

The required Node.js version is defined in the root .nvmrc file: `24.12.0`
<br>The project includes a version-checking script (`nodeCheck.js`).
<br>It compares the currently running Node.js version with the version specified in `.nvmrc`.

The comparison is exact, not based on semantic version compatibility.
<br>For example, Node.js `24.12.1` will not pass a check requiring `24.12.0`.

The `dev`, `build`, `pipesDev`, and `pipesBuild` npm scripts execute this check before
starting their Gulp tasks.

### Installing the required Node.js version

A Node.js version manager is recommended because it allows different projects to use different
Node.js versions.

If you use `nvm`, run:
`nvm install 24.12.0`
<br>`nvm use 24.12.0`

Verify the active version: `node --version`
<br>Expected output: `v24.12.0`

If you do not use a version manager, install `Node.js 24.12.0` manually and make sure that your
terminal uses that installation.

Important: The package.json description still mentions Node.js 22.2.0, but this is outdated metadata.
The authoritative version for development is the value in .nvmrc, which is also enforced by
`nodeCheck.js`.

2. Installing dependencies
   Clone the repository:
   `git clone https://github.com/vkomolov/roller-service-pages.git`

Navigate to the project directory:
`cd roller-service-pages`

Make sure that the required Node.js version is active, then install dependencies: `npm ci`

### Why npm ci?

The repository includes package-lock.json, which records the resolved dependency tree.
<br>`npm ci` installs dependencies according to the lockfile and is therefore preferable
for reproducible project setup.

Unlike npm install, npm ci:

- uses the dependency versions recorded in package-lock.json;
- removes an existing node_modules directory before installation;
- does not modify package.json or package-lock.json;
- fails if the lockfile and package.json are inconsistent.

Use `npm install` when you intentionally need to change dependencies and update the lockfile.

3. Available npm scripts

The project's `package.json` defines the following scripts:

| Command              | Description                                                                |
|----------------------|----------------------------------------------------------------------------|
| `npm run node:check` | Checks whether the active Node.js version matches `.nvmrc`.                |
| `npm run dev`        | Runs the development build, starts BrowserSync, and enables file watchers. |
| `npm run build`      | Runs the production build and starts a BrowserSync preview.                |
| `npm run pipesDev`   | Executes the development build pipeline without starting BrowserSync.      |
| `npm run pipesBuild` | Executes the production build pipeline without starting BrowserSync.       |
| `npm run clean`      | Removes the generated `dist` directory.                                    |

The distinction between build and pipesBuild is important: the former also starts a local preview
server, while the latter only executes the build pipeline.

4. Running the development environment
   <br>Start the development environment: `npm run dev`

This command performs the following operations:

1. Checks the active Node.js version.
2. Cleans the previous dist directory.
3. Copies and processes static assets.
4. Compiles SCSS stylesheets.
5. Bundles JavaScript using Webpack.
6. Compiles HTML pages and their language versions.
7. Starts BrowserSync.
8. Registers file watchers for supported source files.
9.

BrowserSync opens the Ukrainian home page by default: `/uk/index.html`

The development server serves files from the generated `dist` directory.

### Automatic rebuilds

During development, Gulp watches the following source files and directories:

| Source                    | Action                                                        |
|---------------------------|---------------------------------------------------------------|
| HTML files                | Recompile HTML and reload the browser.                        |
| SCSS files                | Recompile styles and reload the browser.                      |
| JavaScript files          | Rebuild JavaScript bundles and reload the browser.            |
| Images                    | Process images and reload the browser.                        |
| Monochrome SVG icons      | Regenerate the monochrome SVG sprite and reload the browser.  |
| Multicolour SVG icons     | Regenerate the multicolour SVG sprite and reload the browser. |
| Fonts                     | Copy updated font files and reload the browser.               |
| JSON and other data files | Copy updated data, recompile HTML, and reload the browser.    |

Changes to source files are processed through the corresponding Gulp tasks rather than by
serving the source directory directly.

Note: The project configuration does not explicitly document a fixed BrowserSync port.
Use the address displayed in the terminal or opened by BrowserSync instead of assuming a
particular port.

5. Building the production version

To execute the production build and start its local preview: `npm run build`

The command performs the Node.js version check and then runs the production Gulp pipeline.

The pipeline:

1. Cleans the existing dist directory.
2. Processes static assets.
3. Compiles and optimizes stylesheets.
4. Creates production JavaScript bundles.
5. Compiles the HTML pages for the configured languages.
6. Starts BrowserSync to preview the generated website.
7.

The production output is written to: `dist/`

### Build without BrowserSync

If you only need to generate production files without starting a preview server, use:
`npm run pipesBuild`

Similarly, the development pipeline can be executed without starting BrowserSync:
`npm run pipesDev`

These commands are useful when the build needs to be run independently,
for example, in an automated environment.

6. Cleaning generated files

To remove the generated output: `npm run clean`.

This command invokes the Gulp distClean task.
<br>It removes the dist directory but does not remove installed dependencies or source files.
<br>The clean script does not execute the Node.js version check.

7. Project configuration files
   The following root-level files are relevant to the development environment:

| File                | Responsibility                                            |
|---------------------|-----------------------------------------------------------|
| `.nvmrc`            | Defines the required Node.js version.                     |
| `package.json`      | Declares project metadata, dependencies, and npm scripts. |
| `package-lock.json` | Records the resolved npm dependency tree.                 |
| `nodeCheck.js`      | Validates the active Node.js version.                     |
| `gulpfile.js`       | Defines the main Gulp build and development workflows.    |
| `tsconfig.json`     | Provides TypeScript configuration for the project.        |

The project uses ES modules in Node.js, as indicated by the following package.json setting:

```
{
  "type": "module"
}
```

Consequently, the Gulp configuration and its JavaScript modules use native import and export syntax.

8. Troubleshooting

#### Node.js version mismatch

Symptom:
<br>The command terminates with an error similar to:

```
Error: Node version mismatch.
Required: 24.12.0, but current: 24.12.1.
Solution:
Activate the exact required version:
nvm use 24.12.0
Then verify it:
node --version
```

Run the check independently if necessary: `npm run node:check`

#### Dependencies are missing or inconsistent

Symptom:
<br>Gulp or another project dependency cannot be found, or dependency installation fails.
<br>Solution:
<br>Make sure the correct Node.js version is active, then reinstall dependencies: `npm ci`
<br>If the problem persists, inspect the npm error output before changing dependency versions
or modifying the lockfile.

#### Changes are not reflected in the browser

Symptom:
<br>A source file has been modified, but the browser still displays the previous version.

Checks:

1. Make sure npm run dev is still running.
2. Check the terminal for Gulp task errors.
3. Verify that the modified file belongs to one of the configured watch paths.
4. Check whether the corresponding task completed successfully.
5. Reload the page manually if BrowserSync did not refresh it.

#### Production build does not start

Checks:

1. Verify the active Node.js version.
2. Confirm that dependencies are installed.
3. Run the version check separately: `npm run node:check`
4. Execute the build pipeline without BrowserSync: `npm run pipesBuild`
5. Inspect the first reported Gulp, Sass, or Webpack error rather than treating subsequent
   errors as independent problems.

9. Recommended development workflow
   A typical workflow for working on the project is:

#### 1. Activate the required Node.js version

`nvm use 24.12.0`

#### 2. Install dependencies (initial setup or after dependency changes)

`npm ci`

#### 3. Start the development environment

`npm run dev`

After completing development work:

#### 4. Generate and preview the production version

`npm run build`

For build-only execution without a local preview server:
`npm run pipesBuild`

Related documentation

- `docs/01-project-overview.md` — Project Overview
- `docs/03-gulp-build-system.md` — Gulp Build System
- `docs/04-html-templates-and-localization.md` — HTML Templates and Localization
- `docs/10-dist-and-deployment.md` — Deployment
