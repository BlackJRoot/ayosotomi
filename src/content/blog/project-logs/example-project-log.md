---
title: "[Template] Setting Up a Home Network Monitor"
description: "Reference example — a project-log post structure to copy from when writing a real one."
publishedAt: 2026-07-31
category: "project-log"
tags: ["homelab", "example"]
draft: true
---

<!--
  TEMPLATE — this is a fully worked example showing the shape of a good
  project-log post, not a real write-up. It is draft: true, so it will
  NOT appear anywhere on the live site (writing index, homepage, RSS)
  until you flip draft to false above. Copy this file, rename it, edit
  the frontmatter and body, then set draft: false when it's ready to
  publish for real.
-->

A project-log post is a build diary — what you did, why, what went wrong, and what's next. It doesn't need to be polished; the rough edges are the point.

## What I set up

A quick paragraph on the actual thing: what you built, and in a sentence or two, what it does. Example: "Spent the weekend getting a lightweight network monitor running on a spare Raspberry Pi — mostly so I'd actually know when something on the home network drops offline instead of finding out the hard way."

## Why

One or two sentences on the motivation. Was there a specific annoyance that pushed you to do this? A problem you kept hitting? Curiosity about a tool? This section grounds the log in something real.

## How it went

The actual walkthrough — not a polished tutorial, just what happened, in order. Include the decisions you made and why, any commands or config that mattered, and don't smooth over the messy parts.

```bash
docker run -d --name monitor -p 8080:8080 example/network-monitor
```

## What went wrong (and the fix)

This is often the most useful section for future-you. Name the actual error, what you tried that didn't work, and what finally fixed it. Example: "The container kept restarting because the config volume wasn't mounted read-write — took an embarrassingly long time to notice."

## What's next

A short list or sentence on what you'd still like to do — the natural hook for a follow-up post later.
