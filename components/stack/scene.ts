/**
 * The 3D "website in layers" scene. Four glass slabs (foundation, content,
 * editor, design) that assemble on load, pull apart on scroll, step forward one
 * by one to tell the workflow, and click back together at the end.
 *
 * Kept framework-free: the React component owns the DOM and passes a
 * progress getter in; this module owns three.js and the render loop.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { designTexture, contentTexture, editorTexture, foundationTexture } from './textures';

export type FrameInfo = {
  progress: number;
  /** 0..1 activation per workflow step (content, design, editor, foundation). */
  steps: number[];
  /** Screen position (px, relative to canvas) of each layer's label anchor, bottom → top. */
  labels: { x: number; y: number; visible: number }[];
  explode: number;
};

type Options = {
  getProgress: () => number;
  onFrame: (f: FrameInfo) => void;
  reducedMotion: boolean;
};

const W = 4;
const D = 2.5;
const H = 0.09;
const LAYERS = 4; // bottom → top: foundation, content, editor, design
/** Workflow order → layer index. */
export const STEP_LAYER = [1, 3, 2, 0];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Scroll choreography, all in section progress 0..1. */
export function choreography(p: number) {
  const explode = smooth(0.07, 0.22, p) * (1 - smooth(0.86, 0.96, p));
  const s = ((p - 0.25) / 0.6) * 4; // step clock 0..4
  const steps = [0, 1, 2, 3].map((k) => smooth(0.62, 0.22, Math.abs(s - (k + 0.5))));
  return { explode, steps };
}

function roundedPlane(w: number, d: number, r: number) {
  const shape = new THREE.Shape();
  const x = -w / 2;
  const y = -d / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.quadraticCurveTo(x + w, y, x + w, y + r);
  shape.lineTo(x + w, y + d - r);
  shape.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  shape.lineTo(x + r, y + d);
  shape.quadraticCurveTo(x, y + d, x, y + d - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);
  const geo = new THREE.ShapeGeometry(shape, 8);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + d / 2) / d);
  }
  geo.rotateX(-Math.PI / 2);
  return geo;
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(20,23,26,0.55)');
  g.addColorStop(0.55, 'rgba(20,23,26,0.18)');
  g.addColorStop(1, 'rgba(20,23,26,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export function createScene(canvas: HTMLCanvasElement, opts: Options) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-4, 8, 6);
  scene.add(key);
  scene.add(new THREE.AmbientLight(0xffffff, 0.35));

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  const rig = new THREE.Group(); // position on screen
  const group = new THREE.Group(); // rotation
  rig.add(group);
  scene.add(rig);

  const slabGeo = new RoundedBoxGeometry(W, H, D, 4, 0.06);
  const topGeo = roundedPlane(W - 0.04, D - 0.04, 0.05);

  const glass = () =>
    new THREE.MeshPhysicalMaterial({
      color: 0xf6f7f4,
      roughness: 0.28,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
      transparent: true,
    });
  const dark = () =>
    new THREE.MeshPhysicalMaterial({
      color: 0x1b1f25,
      roughness: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.2,
      transparent: true,
    });

  const layers = Array.from({ length: LAYERS }, (_, i) => {
    const holder = new THREE.Group();
    const slab = new THREE.Mesh(slabGeo, i === 0 ? dark() : glass());
    const topMat = new THREE.MeshBasicMaterial({ color: i === 0 ? 0x15181d : 0xffffff, transparent: true, toneMapped: false });
    const top = new THREE.Mesh(topGeo, topMat);
    top.position.y = H / 2 + 0.002;
    holder.add(slab, top);
    group.add(holder);
    return { holder, slab, top, topMat };
  });

  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(W * 1.9, D * 2.2),
    new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false, toneMapped: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  group.add(shadow);

  // Textures load after the webfont so canvas text uses Familjen Grotesk.
  const makers = [foundationTexture, contentTexture, editorTexture, designTexture];
  let disposed = false;
  (document.fonts?.ready ?? Promise.resolve()).then(() =>
    makers.forEach((make, i) =>
      make()
        .then((c) => {
          if (disposed) return;
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
          layers[i].topMat.map = tex;
          layers[i].topMat.color.set(0xffffff);
          layers[i].topMat.needsUpdate = true;
        })
        .catch(() => {}),
    ),
  );

  // Layout state
  let width = 1;
  let height = 1;
  let mobile = false;
  function resize() {
    const r = canvas.getBoundingClientRect();
    width = Math.max(1, r.width);
    height = Math.max(1, r.height);
    mobile = width < 760;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // Pointer parallax (desktop only)
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const start = performance.now();
  let smoothP = opts.getProgress();
  const v = new THREE.Vector3();
  let raf = 0;
  let running = false;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const t = (now - start) / 1000;
    smoothP = lerp(smoothP, opts.getProgress(), opts.reducedMotion ? 1 : 0.14);
    const p = smoothP;
    const { explode, steps } = choreography(p);

    pointer.x = lerp(pointer.x, pointer.tx, 0.05);
    pointer.y = lerp(pointer.y, pointer.ty, 0.05);

    // Camera framing differs for phones (stack on top, text below).
    const outro = smooth(0.88, 0.97, p);
    if (mobile) {
      // Phones: stack centred in the upper part of the screen, text below it.
      const cy = 1.5 * lerp(0.135, 1.08, explode);
      const dist = 19.5 + explode * 2.5;
      const tilt = 0.42;
      camera.position.set(0, cy + dist * Math.sin(tilt), dist * Math.cos(tilt));
      camera.lookAt(0, cy, 0);
      camera.setViewOffset(width, height, 0, height * 0.21, width, height);
      rig.position.set(0, 0, 0);
    } else {
      camera.clearViewOffset();
      // Pull back on narrower desktop windows so the stack never runs off the right edge.
      const fit = Math.max(1, 1.65 / camera.aspect);
      camera.position.set(0, (4.4 + explode * 1.6) * fit, (9.6 + explode * 3) * fit);
      camera.lookAt(0, 0.45 + explode * 1.45, 0);
      rig.position.set(lerp(1.7, 1.95, explode) + outro * 0.1, 0, 0);
    }

    const idle = opts.reducedMotion ? 0 : Math.sin(t * 0.35) * 0.05 * (1 - explode);
    group.rotation.y = -0.62 + p * 0.5 + idle + pointer.x * 0.08;
    group.rotation.x = 0.05 + pointer.y * 0.04;

    const spacingA = 0.135;
    const spacingE = 1.08;
    const spacing = lerp(spacingA, spacingE, explode);
    const focus = Math.max(...steps);

    layers.forEach((L, i) => {
      // Assemble-on-load: layers drop in from above, bottom first.
      const drop = opts.reducedMotion ? 1 : easeOutCubic(clamp((now - start - 200 - i * 150) / 900));
      const stepIdx = STEP_LAYER.indexOf(i);
      const active = steps[stepIdx] ?? 0;
      const y = i * spacing + (1 - drop) * 3;
      L.holder.position.set(active * 0.35, y, active * 0.9);
      const dim = 1 - focus * (1 - active) * 0.72;
      const alpha = drop * dim;
      L.topMat.opacity = alpha;
      (L.slab.material as THREE.MeshPhysicalMaterial).opacity = alpha * 0.96;
    });

    shadow.position.y = -0.12;
    const s = 1 + explode * 0.25;
    shadow.scale.set(s, s, 1);
    (shadow.material as THREE.MeshBasicMaterial).opacity = (0.9 - explode * 0.55) * easeOutCubic(clamp((now - start - 200) / 900));

    renderer.render(scene, camera);

    // Label anchors: front-left corner of each slab, projected to screen.
    const labels = layers.map((L) => {
      v.set(-W / 2, H / 2, D / 2);
      L.holder.localToWorld(v);
      v.project(camera);
      return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height, visible: explode };
    });
    opts.onFrame({ progress: p, steps, labels, explode });
  }

  function play() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(frame);
  }
  function pause() {
    running = false;
    cancelAnimationFrame(raf);
  }

  return {
    play,
    pause,
    dispose() {
      disposed = true;
      pause();
      ro.disconnect();
      window.removeEventListener('pointermove', onPointer);
      layers.forEach((L) => {
        L.topMat.map?.dispose();
        L.topMat.dispose();
        (L.slab.material as THREE.Material).dispose();
      });
      slabGeo.dispose();
      topGeo.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
