---
title: "Ayosotomi.com"
description: "This site — a minimalist personal digital home built with Astro, Tailwind, and Cloudflare Pages."
status: "active"
tech: ["Astro", "TypeScript", "Tailwind CSS 4", "Cloudflare Pages"]
startedAt: 2026-07-23
githubUrl: "https://github.com/BlackJRoot/ayosotomi"
demoUrl: "https://ayosotomi.pages.dev"
---

<!-- DRAFT: personalize this write-up in your own voice before it goes live. -->

## What

A single, owned home for writing, homelab/Docker/cybersecurity write-ups, and a living "Now" page — replacing a fragmented presence across Substack, GitHub, and social platforms.

## Why

Three audiences at once: friends who want to keep up, potential clients assessing capability, and homelab newcomers looking for relatable tutorials. One URL, no algorithm deciding who sees it.

## How

Astro 7 + TypeScript (strict), Tailwind CSS 4 with a CSS-first `@theme` config, Markdown content via Astro Content Collections with Zod-validated frontmatter, deployed to Cloudflare Pages as plain static assets — no backend, no database, no user accounts.

## Learned

Tailwind 4 dropped `tailwind.config.mjs` in favor of CSS-first configuration. Cloudflare's newer "Workers Builds" pipeline will silently bolt on a Workers adapter and unused KV/Images bindings if you don't explicitly choose the classic Pages project type.

## Next

Writing and Projects sections, dark mode, newsletter signup, comments.
