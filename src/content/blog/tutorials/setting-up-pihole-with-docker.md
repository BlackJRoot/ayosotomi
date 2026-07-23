---
title: "Setting Up Pi-hole with Docker"
description: "A beginner-friendly walkthrough of running Pi-hole in a Docker container for network-wide ad blocking."
publishedAt: 2026-06-15
category: "tutorial"
tags: ["docker", "pihole", "homelab", "networking"]
draft: true
---

<!-- DRAFT: personalize this in your own voice before publishing. -->

Pi-hole blocks ads and trackers for every device on your network by acting as a DNS sinkhole — no per-device ad blocker needed. Running it in Docker keeps it isolated and easy to rebuild if you ever move it to new hardware.

## The compose file

```yaml
services:
  pihole:
    image: pihole/pihole:latest
    container_name: pihole
    ports:
      - "53:53/tcp"
      - "53:53/udp"
      - "8080:80/tcp"
    environment:
      TZ: "Europe/Zurich"
      FTLCONF_webserver_api_password: "change-me"
    volumes:
      - ./etc-pihole:/etc/pihole
      - ./etc-dnsmasq.d:/etc/dnsmasq.d
    restart: unless-stopped
```

Bring it up with `docker compose up -d`, then visit `http://<host-ip>:8080/admin` and log in with the password you set above.

## Point your router at it

In your router's DHCP settings, set the DNS server to the host machine's local IP. Every device that picks up DHCP will start resolving through Pi-hole automatically — no per-device configuration.

## Watch it work

The admin dashboard shows queries in real time. Expect the block percentage to climb over the first day or two as Pi-hole's default blocklists warm up.
