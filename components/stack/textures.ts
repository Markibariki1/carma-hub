/**
 * Canvas textures for the four layers of the 3D website stack.
 * Drawn at runtime with the site's own typeface so they stay crisp and on-brand.
 * Aspect 1.6 (2048 x 1280) matches the slab footprint.
 */

export const TEX_W = 2048;
export const TEX_H = 1280;

const INK = '#14171a';
const BLUE = '#2633c9';
const FONT = "'Familjen Grotesk Variable', 'Helvetica Neue', Arial, sans-serif";

function canvas() {
  const c = document.createElement('canvas');
  c.width = TEX_W;
  c.height = TEX_H;
  return c;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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

function cover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, align = 0.5) {
  const s = Math.max(w / img.width, h / img.height);
  const sw = w / s;
  const sh = h / s;
  ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) * align, sw, sh, x, y, w, h);
}

function bars(ctx: CanvasRenderingContext2D, x: number, y: number, widths: number[], h: number, gap: number, color: string) {
  ctx.fillStyle = color;
  widths.forEach((w, i) => {
    rr(ctx, x, y + i * (h + gap), w, h, h / 2);
    ctx.fill();
  });
}

/** Top layer: the finished design (real screenshot). */
export async function designTexture() {
  const c = canvas();
  const ctx = c.getContext('2d')!;
  const img = await loadImage('/work/shang-after-1800.webp');
  cover(ctx, img, 0, 0, TEX_W, TEX_H, 0);
  return c;
}

/** Content layer: everything carried over from the old site, laid out raw. */
export async function contentTexture() {
  const c = canvas();
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fbfbf9';
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  const pieces = await Promise.all([0, 1, 2, 3, 4, 5, 6, 7].map((i) => loadImage(`/work/pieces/p${i}.webp`)));

  // Left column: page text as it arrives, before design.
  ctx.fillStyle = INK;
  ctx.font = `600 92px ${FONT}`;
  ctx.fillText('Collection', 110, 210);
  ctx.font = `500 36px ${FONT}`;
  ctx.fillStyle = '#61676d';
  ctx.fillText('117 pieces · photos · texts', 112, 280);
  bars(ctx, 112, 360, [520, 470, 540, 390, 500, 300], 22, 26, '#dcdfd9');
  bars(ctx, 112, 690, [480, 520, 260], 22, 26, '#dcdfd9');

  // Photo grid
  const gx = 760;
  const gy = 110;
  const cw = 270;
  const ch = 338;
  const g = 40;
  pieces.forEach((img, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = gx + col * (cw + g);
    const y = gy + row * (ch + 150);
    ctx.save();
    rr(ctx, x, y, cw, ch, 14);
    ctx.clip();
    cover(ctx, img, x, y, cw, ch);
    ctx.restore();
    bars(ctx, x, y + ch + 26, [cw * 0.86, cw * 0.55], 16, 16, '#d3d6d0');
  });

  // Dashed "import" frame
  ctx.setLineDash([18, 14]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = BLUE;
  rr(ctx, 60, 60, TEX_W - 120, TEX_H - 120, 28);
  ctx.stroke();
  return c;
}

/** Editor layer: a simple editor the client uses themselves. */
export async function editorTexture() {
  const c = canvas();
  const ctx = c.getContext('2d')!;
  const piece = await loadImage('/work/pieces/p0.webp');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Top bar
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, TEX_W, 110);
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 46px ${FONT}`;
  ctx.fillText('Editor', 70, 72);

  // Sidebar
  ctx.fillStyle = '#f2f3f0';
  ctx.fillRect(0, 110, 470, TEX_H - 110);
  const items = ['Start here', 'Antiques', 'Journal', 'Pages', 'Opening hours'];
  items.forEach((label, i) => {
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

  // Form
  const fx = 560;
  ctx.fillStyle = INK;
  ctx.font = `600 64px ${FONT}`;
  ctx.fillText('Alabaster Standing Buddha', fx, 230);

  const fields: [string, string][] = [
    ['Origin', 'Burma'],
    ['Period', 'Mandalay, late 19th century'],
    ['Material', 'Alabaster'],
    ['Price', 'On request'],
  ];
  fields.forEach(([label, value], i) => {
    const y = 330 + i * 170;
    ctx.fillStyle = '#61676d';
    ctx.font = `600 32px ${FONT}`;
    ctx.fillText(label, fx, y);
    ctx.strokeStyle = '#d3d6d0';
    ctx.lineWidth = 3;
    ctx.setLineDash([]);
    rr(ctx, fx, y + 20, 820, 92, 12);
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = `500 40px ${FONT}`;
    ctx.fillText(value, fx + 30, y + 80);
  });

  // Photo
  ctx.save();
  rr(ctx, 1480, 300, 470, 588, 18);
  ctx.clip();
  cover(ctx, piece, 1480, 300, 470, 588);
  ctx.restore();

  // Publish button
  ctx.fillStyle = BLUE;
  rr(ctx, 1590, 1040, 360, 120, 16);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 48px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('Publish', 1770, 1116);
  ctx.textAlign = 'left';
  ctx.fillStyle = '#61676d';
  ctx.font = `500 34px ${FONT}`;
  ctx.fillText('Changes go live the moment you publish.', fx, 1112);
  return c;
}

/** Foundation layer: hosting, updates, backups, care. */
export async function foundationTexture() {
  const c = canvas();
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#15181d';
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  // Dot grid
  ctx.fillStyle = '#2b3038';
  for (let x = 64; x < TEX_W; x += 64) {
    for (let y = 64; y < TEX_H; y += 64) {
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const nodes: [number, number, string][] = [
    [1024, 640, ''],
    [420, 300, 'Hosting'],
    [1620, 290, 'Security updates'],
    [380, 980, 'Backups'],
    [1660, 990, 'Monthly changes'],
  ];
  ctx.strokeStyle = 'rgba(120, 132, 255, 0.55)';
  ctx.lineWidth = 5;
  nodes.slice(1).forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(1024, 640);
    ctx.lineTo(x, y);
    ctx.stroke();
  });

  // Centre node: the site
  ctx.fillStyle = BLUE;
  rr(ctx, 1024 - 170, 640 - 110, 340, 220, 26);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 64px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText('Live', 1024, 664);

  nodes.slice(1).forEach(([x, y, label]) => {
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
