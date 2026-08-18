// Split-panel OG card generator (replaces astro-og-canvas, 2026-08-18).
// Left third: dark identity column — sprig + wordmark. Right panel:
// either the post's cover image, pre-blurred by sharp with a dark scrim
// baked over it (Treatment 1: text is always cream on a predictable
// dark surface, so any future cover stays legible), or plain Dawn Light
// cream for pages without covers. Satori renders the layout to SVG,
// resvg rasterizes to PNG. Runs only at build time.
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const WIDTH = 1200;
const HEIGHT = 630;
const LEFT_W = 396;

// Dawn Light tokens (light theme; the card is theme-independent).
const CREAM = '#FAF6F1';
const CREAM_SOFT = 'rgba(232,226,219,0.88)';
const DARK = '#2A2623';
const TEXT = '#3D3632';
const SEC = '#6F6660';
const ACCENT = '#C4956A';

const FONT_DIR = join(process.cwd(), 'node_modules');
const fontFiles = {
  newsreader: '@fontsource/newsreader/files/newsreader-latin-500-normal.woff',
  inter: '@fontsource/inter/files/inter-latin-400-normal.woff',
  mono: '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff',
};

let fontsPromise: Promise<
  { name: string; data: Buffer; weight: 400 | 500; style: 'normal' }[]
> | null = null;

function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(FONT_DIR, fontFiles.newsreader)).then((data) => ({
      name: 'Newsreader',
      data,
      weight: 500 as const,
      style: 'normal' as const,
    })),
    readFile(join(FONT_DIR, fontFiles.inter)).then((data) => ({
      name: 'Inter',
      data,
      weight: 400 as const,
      style: 'normal' as const,
    })),
    readFile(join(FONT_DIR, fontFiles.mono)).then((data) => ({
      name: 'JetBrains Mono',
      data,
      weight: 400 as const,
      style: 'normal' as const,
    })),
  ]);
  return fontsPromise;
}

// The homepage sprig, as a data URI for satori's <img>.
const SPRIG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120" fill="none" stroke="${ACCENT}" stroke-width="4" stroke-linecap="round"><path d="M40 118 C40 90 40 60 40 20"/><path d="M40 70 C24 64 18 50 20 38 C34 40 42 54 40 70Z"/><path d="M40 54 C56 48 62 34 60 22 C46 24 38 38 40 54Z"/><path d="M40 90 C26 86 20 74 22 64 C34 66 42 78 40 90Z"/></svg>`
)}`;

export interface CardInput {
  title: string;
  description: string;
  label: string; // mono category label, e.g. "essay", "project", "now"
  coverPath?: string; // absolute path to a cover image on disk
}

async function blurredCover(path: string): Promise<string> {
  // Pre-crop to the right panel's exact aspect, blur, darken slightly,
  // and inline as JPEG -- satori just paints it 1:1.
  const buf = await sharp(path)
    .resize(WIDTH - LEFT_W, HEIGHT, { fit: 'cover' })
    .blur(16)
    .modulate({ brightness: 0.96 })
    .jpeg({ quality: 68 })
    .toBuffer();
  return `data:image/jpeg;base64,${buf.toString('base64')}`;
}

function el(
  type: string,
  style: Record<string, unknown>,
  children?: unknown
): Record<string, unknown> {
  return { type, props: { style, ...(children !== undefined && { children }) } };
}

export async function renderCard(input: CardInput): Promise<Buffer> {
  const fonts = await loadFonts();
  const hasCover = Boolean(input.coverPath);
  const cover = input.coverPath ? await blurredCover(input.coverPath) : null;

  const titleSize =
    input.title.length > 60 ? 44 : input.title.length > 38 ? 52 : 60;

  const rightChildren: unknown[] = [];
  if (cover) {
    rightChildren.push(
      el('img', {
        position: 'absolute',
        top: 0,
        left: 0,
        width: WIDTH - LEFT_W,
        height: HEIGHT,
      }, undefined)
    );
    // satori img needs src on props, not style — patch it in:
    (rightChildren[0] as { props: Record<string, unknown> }).props.src = cover;
    rightChildren.push(
      el('div', {
        position: 'absolute',
        top: 0,
        left: 0,
        width: WIDTH - LEFT_W,
        height: HEIGHT,
        backgroundImage:
          'linear-gradient(100deg, rgba(30,27,24,0.84) 0%, rgba(30,27,24,0.64) 55%, rgba(30,27,24,0.46) 100%)',
      })
    );
  }
  rightChildren.push(
    el(
      'div',
      {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        padding: '0 64px',
      },
      [
        el(
          'div',
          {
            fontFamily: 'JetBrains Mono',
            fontSize: 20,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: ACCENT,
          },
          input.label
        ),
        el(
          'div',
          {
            fontFamily: 'Newsreader',
            fontSize: titleSize,
            lineHeight: 1.18,
            marginTop: 18,
            color: hasCover ? CREAM : TEXT,
          },
          input.title
        ),
        el(
          'div',
          {
            fontFamily: 'Inter',
            fontSize: 27,
            lineHeight: 1.45,
            marginTop: 22,
            color: hasCover ? CREAM_SOFT : SEC,
          },
          input.description
        ),
      ]
    )
  );

  const tree = el(
    'div',
    { display: 'flex', width: '100%', height: '100%', fontFamily: 'Inter' },
    [
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: LEFT_W,
          height: '100%',
          backgroundColor: DARK,
          gap: 36,
        },
        [
          (() => {
            const img = el('img', { width: 104, height: 156 });
            (img as { props: Record<string, unknown> }).props.src = SPRIG;
            return img;
          })(),
          el(
            'div',
            {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              color: '#E8E2DB',
              fontSize: 21,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              lineHeight: 1.8,
            },
            ['Ayomiposi', 'Sotomi'].map((line) => el('div', {}, line))
          ),
        ]
      ),
      el(
        'div',
        {
          display: 'flex',
          position: 'relative',
          width: WIDTH - LEFT_W,
          height: '100%',
          backgroundColor: hasCover ? DARK : CREAM,
        },
        rightChildren
      ),
    ]
  );

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts,
  });
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } })
    .render()
    .asPng() as Buffer;
}
