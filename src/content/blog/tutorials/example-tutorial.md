---
title: "[Template] Running a Local DNS Sinkhole with Docker"
description: "Reference example — a tutorial post structure to copy from when writing a real one."
publishedAt: 2026-07-31
category: "tutorial"
tags: ["docker", "homelab", "example"]
draft: true
---

<!--
  TEMPLATE — this is a fully worked example showing the shape of a good
  tutorial post, not a real write-up. It is draft: true, so it will NOT
  appear anywhere on the live site (writing index, homepage, RSS) until
  you flip draft to false above. Copy this file, rename it, edit the
  frontmatter and body, then set draft: false when it's ready to publish.
-->

A tutorial is different from a project-log: it's written for someone else to follow, step by step, toward a specific working result. Open with what the reader will have by the end, and why it's worth their time.

A DNS sinkhole blocks ads and trackers for every device on a network by intercepting the domains they try to reach — no per-device app needed. Running it in a container keeps it easy to rebuild or move later.

## The setup

Walk through the actual steps in order. Code blocks for anything the reader needs to type or paste — this is what makes a tutorial usable rather than just descriptive.

```yaml
services:
  sinkhole:
    image: example/dns-sinkhole:latest
    container_name: sinkhole
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "8080:80/tcp"
    environment:
      TZ: "Europe/Zurich"
    volumes:
      - ./config:/config
    restart: unless-stopped
```

Explain each meaningful line briefly — a reader following along wants to know *why* a step matters, not just what to type.

## Wiring it up

The step that turns "a thing running in a container" into "a thing actually doing something" — in this example, pointing your router's DHCP settings at the new DNS server so every device on the network picks it up automatically.

## Confirming it works

How the reader checks their own setup succeeded. A dashboard to look at, a command to run, a specific thing to expect. Tutorials should end with a way to verify success, not just an assumption that it worked.

## Common snags

Optional, but valuable: the one or two things that are likely to trip someone up, and how to get past them.
