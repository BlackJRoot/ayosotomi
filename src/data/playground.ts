// Data for the (unlisted) /playground page. Edit this file as the lab
// changes -- the page rebuilds from it, nothing else to touch.

export interface Service {
  name: string;
  note: string; // a few words on what it does
  // Extra tech worth calling out (VPN protocol, database, integration).
  // Deliberately NOT "Docker" -- everything here runs on Docker, the page
  // says so once in the intro, so a Docker pill on every card is noise.
  tech?: string[];
}

export interface PublicService extends Service {
  url: string; // only for internet-reachable services -- rendered with a LIVE badge
}

// Internet-reachable services with public URLs. Empty until the lab has
// some -- the "Public Services" section only renders when this has entries.
export const publicServices: PublicService[] = [];

// Everything running behind the firewall, grouped by Docker stack
// (mirrors the compose layout on the server).
export const stacks: { name: string; services: Service[] }[] = [
  {
    name: 'photos-stack',
    services: [{ name: 'Immich', note: 'Photo backups' }],
  },
  {
    name: 'media-stack',
    services: [{ name: 'Jellyfin', note: 'Media streaming' }],
  },
  {
    name: 'download-stack',
    services: [
      { name: 'Sonarr', note: 'TV show indexing' },
      { name: 'Radarr', note: 'Movie indexing' },
      { name: 'Prowlarr', note: 'Indexer management' },
      { name: 'qBittorrent', note: 'Download client' },
      { name: 'Gluetun', note: 'VPN gateway (Proton)', tech: ['WireGuard'] },
      { name: 'Seerr', note: 'Media requests' },
      { name: 'Doplarr', note: 'Discord movie requests', tech: ['Discord'] },
    ],
  },
  {
    name: 'automation-stack',
    services: [{ name: 'n8n', note: 'Workflow automation' }],
  },
  {
    name: 'monitoring-stack',
    services: [
      { name: 'Uptime Kuma', note: 'Service monitoring', tech: ['MariaDB'] },
    ],
  },
];

// Stat tiles. Services/stacks are counted from the data above; containers
// is manual (from `docker ps -q | wc -l` on the lab machine) -- update it
// when the lab changes. Keep these honest.
export const containersRunning = 15;

// "Open Source Homelab" callout at the bottom of the page.
// PLACEHOLDER: points at the GitHub profile until the sanitized homelab
// repo exists -- swap in the real repo URL then. Remember to scrub
// secrets (gluetun/auth, common.env, */config) before publishing.
export const homelabRepoUrl: string | null = 'https://github.com/BlackJRoot';
