/**
 * Canvas textures for the four layers of the 3D website stack.
 *
 * The sample site is a made-up joinery ("Albrecht Holzwerk") drawn entirely in
 * code, so the hero shows the kind of business Carma builds for without leaning
 * on any real client. Text is drawn with the site's own typeface and follows
 * the page language. Aspect 1.6 (2048 x 1280) matches the slab footprint.
 */
import type { Lang } from '@/content/types';

export const TEX_W = 2048;
export const TEX_H = 1280;

const INK = '#14171a';
const BLUE = '#2633c9';
const FONT = "'Familjen Grotesk Variable', 'Helvetica Neue', Arial, sans-serif";

const COPY = {
  en: {
    nav: ['Furniture', 'Kitchens', 'Workshop', 'Contact'],
    book: 'Book a visit',
    headline: ['Furniture', 'made to fit.'],
    lede: 'Tables, kitchens and shelving, built in our workshop.',
    cta: 'See our work',
    since: 'Master joiners since 1987',
    cards: ['Tables', 'Kitchens', 'Shelving'],
    contentTitle: 'Your content',
    contentSub: 'Texts, photos, opening hours, logo',
    hours: ['Opening hours', 'Mon–Fri  7–17', 'Sat  9–13'],
    editorItems: ['Home', 'Furniture', 'References', 'Opening hours', 'Contact'],
    product: 'Solid oak dining table',
    fields: [
      ['Wood', 'Oak, oiled'],
      ['Size', '220 × 95 cm'],
      ['Delivery', '6–8 weeks'],
      ['Price', 'from €2,400'],
    ],
    publish: 'Publish',
    publishNote: 'Changes go live the moment you publish.',
    nodes: ['Hosting', 'Security updates', 'Backups', 'Monthly changes'],
  },
  de: {
    nav: ['Möbel', 'Küchen', 'Werkstatt', 'Kontakt'],
    book: 'Termin vereinbaren',
    headline: ['Möbel,', 'die passen.'],
    lede: 'Tische, Küchen und Regale aus unserer eigenen Werkstatt.',
    cta: 'Arbeiten ansehen',
    since: 'Meisterbetrieb seit 1987',
    cards: ['Tische', 'Küchen', 'Regale'],
    contentTitle: 'Ihre Inhalte',
    contentSub: 'Texte, Fotos, Öffnungszeiten, Logo',
    hours: ['Öffnungszeiten', 'Mo–Fr  7–17 Uhr', 'Sa  9–13 Uhr'],
    editorItems: ['Startseite', 'Möbel', 'Referenzen', 'Öffnungszeiten', 'Kontakt'],
    product: 'Esstisch Eiche massiv',
    fields: [
      ['Holz', 'Eiche, geölt'],
      ['Maße', '220 × 95 cm'],
      ['Lieferzeit', '6–8 Wochen'],
      ['Preis', 'ab 2.400 €'],
    ],
    publish: 'Veröffentlichen',
    publishNote: 'Änderungen sind sofort nach dem Veröffentlichen online.',
    nodes: ['Hosting', 'Sicherheits-Updates', 'Backups', 'Monatliche Änderungen'],
  },
} as const;

/** Wood tones: [light, dark] for oak, walnut, ash, smoked oak. */
const WOODS: [string, string][] = [
  ['#c99a66', '#9a6a3d'],
  ['#8a5a3b', '#4f301d'],
  ['#e2c9a2', '#b8976b'],
  ['#6e5543', '#3a2a20'],
];

function canvas() {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  return c;
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function bars(ctx: CanvasRenderingContext2D, x: number, y: number, widths: number[], h: number, gap: number, color: string) {
  ctx.fillStyle = color;
  widths.forEach((w, i) => {
    rr(ctx, x, y + i * (h + gap), w, h, h / 2);
    ctx.fill();
  });
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** A close-up "photo" of a wood surface: grain lines, a knot or two, soft light. */
function wood(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, tone: number, seed: number, radius = 18) {
  const [light, darkTone] = WOODS[tone % WOODS.length];
  const rand = rng(seed);
  ctx.save();
  rr(ctx, x, y, w, h, radius);
  ctx.clip();

  const base = ctx.createLinearGradient(x, y, x + w, y + h);
  base.addColorStop(0, light);
  base.addColorStop(1, darkTone);
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);

  // Grain: long, slightly wavy strokes running across the board.
  const lines = Math.round(h / 7);
  for (let i = 0; i < lines; i++) {
    const yy = y + (i / lines) * h + rand() * 6;
    const amp = 4 + rand() * 10;
    const freq = 0.004 + rand() * 0.004;
    const phase = rand() * Math.PI * 2;
    ctx.beginPath();
    for (let xx = x - 10; xx <= x + w + 10; xx += 16) {
      const yv = yy + Math.sin(xx * freq + phase) * amp + Math.sin(xx * freq * 3.1 + phase) * amp * 0.25;
      if (xx === x - 10) ctx.moveTo(xx, yv);
      else ctx.lineTo(xx, yv);
    }
    const darkLine = rand() > 0.45;
    ctx.strokeStyle = darkLine ? `rgba(40, 22, 10, ${0.06 + rand() * 0.16})` : `rgba(255, 240, 215, ${0.04 + rand() * 0.1})`;
    ctx.lineWidth = 1 + rand() * (darkLine ? 4 : 3);
    ctx.stroke();
  }

  // Knots
  const knots = 1 + Math.floor(rand() * 2);
  for (let k = 0; k < knots; k++) {
    const kx = x + w * (0.2 + rand() * 0.6);
    const ky = y + h * (0.2 + rand() * 0.6);
    for (let r = 5; r > 0; r--) {
      ctx.beginPath();
      ctx.ellipse(kx, ky, r * 12, r * 4.5, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(45, 25, 12, ${0.12 + (5 - r) * 0.05})`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  // Window light falling across the surface.
  const lightGrad = ctx.createRadialGradient(x + w * 0.3, y + h * 0.15, 0, x + w * 0.3, y + h * 0.15, Math.max(w, h));
  lightGrad.addColorStop(0, 'rgba(255, 246, 228, 0.32)');
  lightGrad.addColorStop(0.6, 'rgba(255, 246, 228, 0)');
  lightGrad.addColorStop(1, 'rgba(20, 10, 4, 0.28)');
  ctx.fillStyle = lightGrad;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/** A simple table silhouette standing on the wood photo, so it reads as furniture. */
function table(ctx: CanvasRenderingContext2D, cx: number, base: number, w: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(30, 18, 10, 0.18)';
  ctx.beginPath();
  ctx.ellipse(cx, base + 6, w * 0.55, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  const top = base - w * 0.42;
  const g = ctx.createLinearGradient(0, top, 0, top + 36);
  g.addColorStop(0, '#f6eadb');
  g.addColorStop(1, '#d9c3a5');
  ctx.fillStyle = g;
  rr(ctx, cx - w / 2, top, w, 36, 8);
  ctx.fill();
  ctx.fillStyle = '#cdb18c';
  [-0.42, 0.42].forEach((f) => {
    ctx.beginPath();
    ctx.moveTo(cx + f * w - 12, top + 36);
    ctx.lineTo(cx + f * w + 12, top + 36);
    ctx.lineTo(cx + f * w * 1.04 + 8, base);
    ctx.lineTo(cx + f * w * 1.04 - 8, base);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

function wordmark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px ${FONT}`;
  ctx.fillText('Albrecht', x, y);
  const w = ctx.measureText('Albrecht').width;
  ctx.font = `400 ${size}px ${FONT}`;
  ctx.fillText(' Holzwerk', x + w, y);
}

/** Top layer: the finished design. */
export async function designTexture(lang: Lang) {
  const t = COPY[lang];
  const c = canvas();
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#f3efe8';
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Navigation
  wordmark(ctx, 96, 118, 50, '#221a14');
  ctx.font = `500 34px ${FONT}`;
  ctx.fillStyle = '#4c4038';
  let nx = 900;
  t.nav.forEach((n) => {
    ctx.fillText(n, nx, 116);
    nx += ctx.measureText(n).width + 64;
  });
  ctx.font = `600 32px ${FONT}`;
  const bw = ctx.measureText(t.book).width + 72;
  ctx.fillStyle = '#221a14';
  rr(ctx, TEX_W - 96 - bw, 72, bw, 70, 35);
  ctx.fill();
  ctx.fillStyle = '#f3efe8';
  ctx.fillText(t.book, TEX_W - 96 - bw + 36, 118);

  // Headline block
  ctx.fillStyle = '#221a14';
  ctx.font = `600 146px ${FONT}`;
  t.headline.forEach((line, i) => ctx.fillText(line, 92, 400 + i * 146));
  ctx.fillStyle = '#5d5047';
  ctx.font = `400 42px ${FONT}`;
  ctx.fillText(t.lede, 98, 680);

  ctx.font = `600 36px ${FONT}`;
  const cw = ctx.measureText(t.cta).width + 88;
  ctx.fillStyle = '#9a5b2e';
  rr(ctx, 98, 750, cw, 92, 46);
  ctx.fill();
  ctx.fillStyle = '#fff8ef';
  ctx.fillText(t.cta, 142, 808);

  // Hero photo with a table
  wood(ctx, 1110, 200, 842, 690, 0, 7, 28);
  table(ctx, 1531, 800, 520);

  // "Since" badge
  ctx.font = `600 30px ${FONT}`;
  const sw = ctx.measureText(t.since).width + 64;
  ctx.fillStyle = '#fffaf2';
  rr(ctx, 1150, 236, sw, 66, 33);
  ctx.fill();
  ctx.fillStyle = '#4c4038';
  ctx.fillText(t.since, 1182, 280);

  // Category cards
  t.cards.forEach((label, i) => {
    const x = 96 + i * 350;
    wood(ctx, x, 950, 320, 210, i + 1, 31 + i * 11, 18);
    ctx.fillStyle = '#221a14';
    ctx.font = `600 34px ${FONT}`;
    ctx.fillText(label, x, 1214);
  });
  ctx.fillStyle = '#e3dccf';
  rr(ctx, 1150, 950, 802, 210, 18);
  ctx.fill();
  bars(ctx, 1200, 1000, [560, 420, 500], 20, 26, '#cbbfad');
  return c;
}

/** Content layer: everything the client already has, before design. */
export async function contentTexture(lang: Lang) {
  const t = COPY[lang];
  const c = canvas();
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fbfbf9';
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  ctx.fillStyle = INK;
  ctx.font = `600 92px ${FONT}`;
  ctx.fillText(t.contentTitle, 110, 210);
  ctx.font = `500 36px ${FONT}`;
  ctx.fillStyle = '#61676d';
  ctx.fillText(t.contentSub, 112, 280);
  bars(ctx, 112, 360, [520, 470, 540, 390, 500, 300], 22, 26, '#dcdfd9');

  // Opening hours card
  ctx.strokeStyle = '#d3d6d0';
  ctx.lineWidth = 3;
  rr(ctx, 112, 720, 540, 230, 16);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.font = `600 38px ${FONT}`;
  ctx.fillText(t.hours[0], 150, 790);
  ctx.font = `500 34px ${FONT}`;
  ctx.fillStyle = '#3a3f44';
  ctx.fillText(t.hours[1], 150, 852);
  ctx.fillText(t.hours[2], 150, 906);

  // Logo, as it came in
  wordmark(ctx, 116, 1080, 44, '#221a14');

  // Unsorted photos
  const gx = 760;
  const gy = 110;
  const pw = 270;
  const ph = 338;
  const g = 40;
  for (let i = 0; i < 8; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = gx + col * (pw + g);
    const y = gy + row * (ph + 150);
    wood(ctx, x, y, pw, ph, i, 101 + i * 17, 14);
    bars(ctx, x, y + ph + 26, [pw * 0.86, pw * 0.55], 16, 16, '#d3d6d0');
  }

  ctx.setLineDash([18, 14]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = BLUE;
  rr(ctx, 60, 60, TEX_W - 120, TEX_H - 120, 28);
  ctx.stroke();
  ctx.setLineDash([]);
  return c;
}

/** Editor layer: the simple editor the client uses themselves. */
export async function editorTexture(lang: Lang) {
  const t = COPY[lang];
  const c = canvas();
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, TEX_W, 110);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 46px ${FONT}`;
  ctx.fillText('Editor', 70, 72);

  ctx.fillStyle = '#f2f3f0';
  ctx.fillRect(0, 110, 470, TEX_H - 110);
  t.editorItems.forEach((label, i) => {
    const y = 190 + i * 104;
    if (i === 1) {
      ctx.fillStyle = BLUE;
      rr(ctx, 40, y - 56, 390, 84, 14);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = '#3a3f44';
    }
    ctx.font = `600 40px ${FONT}`;
    ctx.fillText(label, 80, y);
  });

  const fx = 560;
  ctx.fillStyle = INK;
  ctx.font = `600 64px ${FONT}`;
  ctx.fillText(t.product, fx, 230);

  t.fields.forEach(([label, value], i) => {
    const y = 330 + i * 170;
    ctx.fillStyle = '#61676d';
    ctx.font = `600 32px ${FONT}`;
    ctx.fillText(label, fx, y);
    ctx.strokeStyle = '#d3d6d0';
    ctx.lineWidth = 3;
    rr(ctx, fx, y + 20, 820, 92, 12);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `500 40px ${FONT}`;
    ctx.fillText(value, fx + 30, y + 80);
  });

  wood(ctx, 1480, 300, 470, 588, 0, 7, 18);
  table(ctx, 1715, 820, 300);

  ctx.font = `700 46px ${FONT}`;
  const pw = Math.max(360, ctx.measureText(t.publish).width + 96);
  ctx.fillStyle = BLUE;
  rr(ctx, 1950 - pw, 1040, pw, 120, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(t.publish, 1950 - pw / 2, 1116);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#61676d';
  ctx.font = `500 32px ${FONT}`;
  ctx.fillText(t.publishNote, fx, 1112);
  return c;
}

/** Foundation layer: hosting, updates, backups, care. */
export async function foundationTexture(lang: Lang) {
  const t = COPY[lang];
  const c = canvas();
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#15181d';
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  ctx.fillStyle = '#2b3038';
  for (let x = 64; x < TEX_W; x += 64) {
    for (let y = 64; y < TEX_H; y += 64) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const nodes: [number, number, string][] = [
    [420, 300, t.nodes[0]],
    [1620, 290, t.nodes[1]],
    [380, 980, t.nodes[2]],
    [1660, 990, t.nodes[3]],
  ];
  ctx.strokeStyle = 'rgba(120, 132, 255, 0.55)';
  ctx.lineWidth = 5;
  nodes.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(1024, 640);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  ctx.fillStyle = BLUE;
  rr(ctx, 1024 - 170, 640 - 110, 340, 220, 26);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 64px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('Live', 1024, 664);

  nodes.forEach(([x, y, label]) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e9eae6';
    ctx.font = `600 44px ${FONT}`;
    ctx.fillText(label, x, y + (y < 640 ? -62 : 96));
  });
  ctx.textAlign = 'left';
  return c;
}
