# Make Flattened PDF Reference Notes

This file records how the flattened Make help-center PDF should be used during planning work.

## Primary PDF reference

File:
- `D:\My work\flowholt3 - Copy\research\make-help-center-export\assets\files\PUBLISHED-TDD_JYughqVhdcQ3sZF9_-20260408-1440__fd47c12e6a18.pdf`

Purpose:
- serve as a flattened help-center reference when a topic needs:
  - full page explanation in one place
  - UI labels captured near screenshots
  - manual lookup of a known Make section

## Current practical status

The PDF is useful as a reference artifact, but automated extraction in this environment is limited right now.

What was tried:
- headless local PDF inspection through Playwright
- heuristic text extraction by decoding compressed PDF streams

Current result:
- Chromium headless treats the local PDF as a download rather than a stable viewer surface
- heuristic text extraction did not produce usable text output from this particular file

## Local helper scripts added

- `D:\My work\flowholt3 - Copy\scripts\inspect_local_pdf.mjs`
- `D:\My work\flowholt3 - Copy\scripts\extract_pdf_text_heuristic.py`

These scripts are useful starting points if future sessions want to revisit PDF extraction with a different local toolchain.

## Recommended use in planning

Use the flattened PDF as:
- a manual section reference when the target topic is already known
- a fallback visual source if the image corpus is insufficient for a specific surface

Use the local image corpus as the first-choice visual source when:
- precise UI layouts are needed quickly
- AI agent builder surfaces are being studied
- run bar, replay, or team-management layout patterns are needed

Current high-value image references remain:
- `D:\My work\flowholt3 - Copy\research\make-help-center-export\assets\images\FaN3pV97eywk8vs0-E0rx-20260203-154010__328f8b2d1397.png`
- `D:\My work\flowholt3 - Copy\research\make-help-center-export\assets\images\E_5T95KsL1DhRC8IVy9xQ-20251010-125928__98e0efa41b6b.png`
- `D:\My work\flowholt3 - Copy\research\make-help-center-export\assets\images\Zusz0Qbp3EP67xJ3qK7cl-20251003-145143__30f711290366.png`
- `D:\My work\flowholt3 - Copy\research\make-help-center-export\assets\images\4mSSL57quEGYfR0D7Re6S-20251003-084705__3d89fb62bdb2.png`

## Planning implication

The flattened PDF should remain part of the research corpus, but current planning should not block on automated extraction from it.
