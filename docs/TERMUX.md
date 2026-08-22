# Android / Termux workflow

Termux is the Git control point; GitHub Actions can perform build/deploy steps that depend on platform binaries unavailable on Android ARM64.

## Phone setup

```sh
pkg update
pkg install git nodejs-lts gh
cd ~/projects
unzip silk-road-2.0.0-production.zip
cd silk-road-2
npm install
git init
git add .
git commit -m "Release candidate: Silk Road 2.0"
```

Run pure checks that work on the device:

```sh
npm run check
npm run test
```

Wrangler/workerd and Playwright browser binaries may be unsupported on Android ARM64. That does not block production: push the repository and let GitHub Actions run Linux CI and the manual Cloudflare deployment workflow.

## GitHub publication

```sh
gh auth status
gh repo create silk-road-2 --public --source=. --remote=origin --push
git remote -v
```

Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as repository secrets. Provision D1/R2 and replace the D1 ID in `wrangler.jsonc` before triggering production deployment.

## Update rhythm

```sh
git status
git add <focused-files>
git commit -m "<subsystem>: <specific change>"
git push
```

Do not commit `.env`, `.dev.vars`, Wrangler state, `node_modules`, build output or Playwright artifacts.
