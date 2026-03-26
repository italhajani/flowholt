# Workflow Package Quickstart

FlowHolt can now export and import workflows as package JSON.

## What this does

- export a saved workflow into a reusable package file
- import that package back into FlowHolt as a new workflow
- move workflow logic more safely than copying database rows by hand

## How to export

1. Start `flowholt-web` with `npm run dev`.
2. Open `/app/workflows`.
3. In any workflow card, click `Export package`.
4. Your browser will download a `.flowholt.json` file.

## How to import

1. Open `/app/workflows`.
2. In the `Import package` card, paste the exported JSON.
3. Click `Import workflow package`.
4. FlowHolt will create a new workflow and open it in Studio.

## Simple mental model

- export = save this workflow as a portable package
- import = create a new workflow from that package
- imported workflows are created as new workflow records, not overwriting the old one
