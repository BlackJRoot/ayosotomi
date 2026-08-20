---
title: "Building a Media Server With Jellyfin: A Docker-Based Homelab Tutorial"
description: Set up a self-hosted Jellyfin media server with Docker on your
  homelab — from Docker Compose config to hardware transcoding, step by step.
publishedAt: 2026-08-21
updatedAt: 2026-08-21
category: tutorial
tags:
  - Docker
  - Homelab
  - Jellyfin
draft: false
---
Imagine you've got a pile of movies, shows, or personal videos scattered across hard drives and you're tired of constantly plugging a USB stick into your TV every time you want to watch something. Sound familiar? A self-hosted media server fixes that, and it's also one of the best entry points into homelabbing. It's useful from day one, and it teaches you concepts such as Docker, networking, and Linux administration along the way, without needing any of that to already be true.

In this tutorial, I'll walk you through setting up [Jellyfin](https://jellyfin.org/), a free open-source media server, using Docker on Linux. I'll be running mine on my HP 240 G7 laptop I've repurposed for a mini home-server. It comes with an Intel Core i3-1005G1 CPU, integrated Iris Plus graphics, and 16 GB RAM. None of what we will be doing today is tied to that specific hardware, though - if you've got an old desktop, a mini PC, or a beefier NAS box, the same steps apply. I'll make sure to flag the couple of places where your hardware changes a command.

I'm assuming you're reasonably comfortable with the Linux terminal already. You don't need to be on the sysadmin level, but I won't be explaining what `cd`, `mkdir`, or `sudo` does.

## What you'll need

---

- **A Linux machine** - this will serve as the host machine and must be able to stay on most of the time: an old laptop, a mini PC, a dedicated server box. It doesn't need to be powerful, and integrated graphics are fine.
- **Docker Engine and Docker Compose** installed.
- **Your media library** - your actual movie/shows/video files, stored somewhere the machine can read.
- **Basic terminal knowledge** - we'll spend time editing text files and running commands, no GUI required.
- **A fixed local IP address** for the server, so it doesn't wander around your network every time your router hands out a new DHCP lease. (More on this below).

Nothing here needs to be expensive. Jellyfin is designed to run comfortably on modest hardware. The only bottleneck you're most likely going to hit is transcoding (explained below), not raw horsepower.

## Quick glossary, for anyone new to self-hosting

---

If you've done Docker before, skip this section. If not, here are the handful of terms this tutorial leans on:

- **Container** - a lightweight, isolated environment that runs a single application (in our case, Jellyfin) along with everything it needs to run, without installing that software directly onto your main system. Think of it as a sealed box for the app.
- **Docker** - the tool that creates and manages containers.
- **Docker Compose** - a way of describing one or more containers, their settings, and how they relate to each other, in a single YAML file (`docker-compose.yml`), instead of typing long `docker run` commands by hand every time.
- **Bind mount** - a way of exposing a folder from your host machine (say, `/home/user/Videos`) into a container, so the container can read and write files that actually live on your real file-system.
- **PUID/PGID** - the user ID and the group ID the container should run as. Getting this right avoids a whole category of "permission denied" errors, because the container needs to read/write files owned by your actual Linux user, not some default user baked into the image.
- **Transcoding** - converting a video file from one format/resolution/bitrate to another, on the go, so a device that can't play the original file (or your network can't handle its bitrate) can still stream it. This is the single most CPU-intensive thing a media server does.
- **Hardware acceleration** - offloading transcoding work to your GPU instead of your CPU. On Intel chips, this is done via **Quick Sync**; AMD and NVIDIA have their own equivalents (VA-API and NVENC respectively).

With that out of the way, let's build the thing.

## Step 1: Install Docker and Docker Compose

---

If you don't already have Docker installed, open up your terminal and paste in the code:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

That last line adds your user to the `docker` group so you don't have to type `sudo` before every docker command. Log out and back in (or reboot) for it to take effect.

Docker Compose ships as a plugin with recent docker installs. Confirm it's there:

```bash
docker compose version
```

If that returns a version number, you're set.

## Step 2: Plan your folder structure before you touch a config file

---

This is the step most people skip and regret. Decide now where your Docker configs live and where your actual media lives, and keep them separate.

A layout that scales well as you add more services later would look something like this:

```
~/docker/
  media-stack/
    docker-compose.yml
  common.env
~/Videos/
  Movies/
  Tv_Shows/
  Anime/
```

Config and container definitions live under `~/docker/`, grouped by "stack" (media, downloads, monitoring, and whatever you eventually add). Actual media files live wherever makes sense for your storage: an internal drive, an external drive, a mounted network share. In my case, that's `/home/void/Videos/{Movies,Tv_Shows,Anime}`.

Keeping these separate means you can wipe and rebuild a container's config without touching your media, and vice versa. It's genuinely useful the first time you break something and want to start a stack over from scratch without losing your library.

Create a shared `common.env` file for any values every service in your setup will want:

```bash
# ~/docker/common.env
TZ=Africa/Lagos
PUID=1000
PGID=1000
```

Set `TZ` to your own timezone, and confirm your actual UID/GID with:

```bash
id
```

which will print something like `uid=1000(you) gid=1000(you)`. Use those numbers.

## Step 3: Write the Docker Compose file

---

Inside `~/docker/media-stack/`, create `docker-compose.yml`:

```yaml
services:
  jellyfin:
    image: jellyfin/jellyfin:latest
    container_name: jellyfin
    env_file:
      - ../common.env
    ports:
      - "8096:8096"
    volumes:
      - ./config:/config
      - ./cache:/cache
      - /home/void/Videos/Movies:/media/movies
      - /home/void/Videos/Tv_Shows:/media/tv
      - /home/void/Videos/Anime:/media/anime
    devices:
      - /dev/dri:/dev/dri
    restart: unless-stopped
    networks:
      - media-net

networks:
  media-net:
    driver: bridge
```

I'll explain what each line of code means here so you don't get worked up trying to understand it.

- `image` pulls the official Jellyfin container image straight from Docker Hub. You're not installing anything onto your host OS, just downloading a pre-built self-contained version of the app.
- `env_file` pulls in that shared `common.env` we made earlier: timezone and user IDs, without repeating them in every service we'll eventually add.
- `ports: 8096:8096` maps port 8096 on our host machine to port 8096 inside the container, which is Jellyfin's default web interface port. This is an explicit mapping rather than `network_mode: host`. I prefer each service only expose exactly the port it needs, instead of handing a container full access to the host's network stack.
- `volumes` is where bind mounts happen. `./config:/config` and `./cache:/cache` create local folders (inside `media-stack/`) that persist Jellyfin's settings and metadata cache between container restarts. Without these, we'd lose our entire configuration every time we recreate the container. The three media lines map our real folders into the container at predictable paths.
- `devices: /dev/dri:/dev/dri` exposes our GPU's render device to the container, which is what makes hardware-accelerated transcoding possible. We'll talk more on this in the next step.
- `networks` puts Jellyfin on its own named Docker network rather than the shared default. If we're only ever running Jellyfin alone, this would barely matter. But the moment you add a second stack (a download client, a monitoring tool), keeping stacks on separate networks stops them from quietly interfering with each other, at the small cost of needing to reference other stacks by IP rather than by container name if they ever need to talk to each other.

## Step 4: Bring up the stack

---

Alright, it's time to bring up the stack.

```bash
cd ~/docker/media-stack
docker compose up -d
```

The `-d` runs it detached, in the background. You can check it's actually running with:

```bash
docker compose ps
```

## Step 5: First-time setup

---

Once you get the confirmation that everything is up and running, open up your browser and go to `http://<your-server-ip>:8096`. In my case, `http://192.168.18.8:8096`. If you haven't already pinned your server to a fixed IP on your router (usually called a MAC-to-IP binding in your router's admin panel), do that now - otherwise the address can change after a reboot or router restart, and every device you've set up to connect to it will silently stop working.

The setup wizard will ask for:

1. A display name for the server and an admin account.
2. Your media libraries - point it at `/media/movies`, `/media/tv`, `/media/anime` (the *container* paths from your compose file, not the host paths).
3. Preferred metadata language and remote access preferences (leave remote access off for now - that's a separate, security-relevant conversation).

Jellyfin will scan your entire library and start pulling down posters, descriptions, and cast info. This step is also where inconsistent file naming will bite you. Jellyfin, like most media servers, expects a reasonably standard naming convention to correctly identify what it's looking at:

```
Movies/
  Movie Name (2023)/
    Movie Name (2023).mkv
Tv_Shows/
  Show Name/
    Season 01/
      Show Name - S01E01 - Episode Title.mkv
```

If your files are named inconsistently, it's worth renaming them before your first scan rather than fighting mismatched metadata after the fact.

## Wrapping up Part 1

---

At this point, you've got a real, working media server. Jellyfin is running in Docker, your library is scanned and browsable, and assuming your naming held up, it's showing correct posters and metadata. That's genuinely the hard part done. Everything from here is refinement.

A couple of things I deliberately left out of this post, on purpose:

- **Hardware transcoding**: We exposed the GPU's render device to the container back in Step 3, but exposing it isn't the same as turning it on. Actually enabling Quick Sync inside Jellyfin's dashboard, and understanding when you even need it, deserves its own post rather than a rushed paragraph at the end of this one.
- **Remote access**: Right now, our server only exists on our local network, which is the safest possible starting point. Opening it up to the outside world touches reverse proxies, TLS, and enough security tradeoffs that it's worth treating as a dedicated topic.

Both are coming in Part 2. For now, sit with what we've built, throw a few more shows at it, try it from a different device on your network, get comfortable with `docker compose logs jellyfin` when something inevitably looks off. That comfort is worth more right now than rushing ahead.