---
title: "Building Ayosotomi.com, Step by Step"
description: "Notes from scaffolding this site: Astro 7, Tailwind 4's CSS-first config, and a couple of Cloudflare deploy detours."
publishedAt: 2026-07-23
category: "project-log"
tags: ["astro", "tailwind", "cloudflare", "meta"]
draft: false
---

<!-- DRAFT: personalize this in your own voice before publishing. -->

Phase 1 was the boring-but-necessary part: scaffold Astro, wire up Tailwind, get *something* live so every change after has a real URL to check against.

A couple of things didn't go exactly to plan. The stack docs assumed Astro 5 and a `tailwind.config.mjs` file — by the time I scaffolded, Astro was on 7 and Tailwind 4 had moved to CSS-first configuration, so design tokens live in an `@theme` block inside `global.css` instead.

The bigger surprise was Cloudflare. The first deploy connected through Cloudflare's newer Workers Builds pipeline, which silently ran `astro add cloudflare` inside the build container and provisioned a KV namespace and an Images binding the site doesn't use — none of that landed in git, so it would have quietly re-happened on every future build. Reconnecting through the classic Cloudflare Pages project type fixed it: plain static asset upload, no adapter, no bindings.

Phase 2 is the content layer — Zod schemas for `blog`, `projects`, and `now`, then the pages that read from them.
