---
title: "Rebuilt the site"
date: 2026-09-17
description: "An Astro rebuild with KiCad-style drawing sheets, project photos, and a log for bench notes."
---

I rebuilt the site to give my projects a better home and add a log for whatever
I'm currently building, mostly hardware with some software in the mix.

The design takes its cues from KiCad: drawing-sheet borders, title blocks,
figure numbers, and a project index. The text pages use a light paper background.
Project pages take their color from the board's soldermask, with photos and
videos showing the hardware.

It's built with Astro and generates static HTML. A little JavaScript handles
the project previews, color transitions, and photo viewer. Posts and project
write-ups are still plain Markdown files with YAML front matter.

Most of the code was written with AI coding assistants. I set the direction
and reviewed the output, including the details that make it feel like a drawing
sheet rather than a portfolio template.

The deployment workflow is set up for GitHub Actions to build the site and
publish it to GitHub Pages. Once connected, publishing a post will be a Markdown
file, a commit, and a push to main.
