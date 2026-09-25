import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, MeshBasicMaterial,
  TextureLoader, SRGBColorSpace, Color, Fog, CanvasTexture, Raycaster, Vector2, MathUtils,
  DoubleSide, RingGeometry
} from "three";



function bentPlane(w, h, radius, segs = 24) {
  const g = new PlaneGeometry(w, h, segs, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const a = x / radius;
    p.setX(i, Math.sin(a) * radius);
    p.setZ(i, -Math.cos(a) * radius);
  }
  p.needsUpdate = true;
  g.computeBoundingSphere();
  return g;
}

/* ---------- Écrans de sites dessinés en canvas ---------- */
function wrapText(x, text, maxW) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (x.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function screenTexture(p, variant, fonts) {
  const W = 1024, H = 640;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");
  const [bg, fg, ac] = p.tone;
  const display = fonts.display, body = fonts.body;

  // fenêtre navigateur
  x.fillStyle = bg; x.fillRect(0, 0, W, H);
  x.fillStyle = "#15171d"; x.fillRect(0, 0, W, 44);
  ["#ff5f57", "#febc2e", "#28c840"].forEach((col, i) => { x.fillStyle = col; x.beginPath(); x.arc(24 + i * 22, 22, 7, 0, Math.PI * 2); x.fill(); });
  x.fillStyle = "#262a33"; x.fillRect(110, 11, 520, 22);
  x.fillStyle = "#9ba0ab"; x.font = `500 13px ${body}`;
  const host = p.url ? p.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "") : p.slug + ".fr";
  x.fillText(host, 124, 27);

  // nav
  x.fillStyle = fg; x.font = `800 20px ${body}`;
  x.fillText(p.name, 40, 92);
  x.font = `500 15px ${body}`; x.globalAlpha = 0.65;
  ["Accueil", "Services", "Réalisations", "Contact"].forEach((t, i) => x.fillText(t, W - 430 + i * 100, 92));
  x.globalAlpha = 1;
  x.fillStyle = ac; x.fillRect(W - 40 - 6, 76, 6, 20);

  if (variant === 0) {
    // accueil
    x.fillStyle = fg; x.font = `900 44px ${display}`;
    const head = (p.headline || p.sector).toUpperCase();
    const lines = wrapText(x, head, 520).slice(0, 4);
    lines.forEach((l, i) => x.fillText(l, 40, 190 + i * 50));
    const y0 = 190 + lines.length * 50;
    x.font = `400 18px ${body}`; x.globalAlpha = 0.7;
    x.fillText(p.sector + " · " + p.place, 40, y0 + 10);
    x.globalAlpha = 1;
    x.fillStyle = ac; x.fillRect(40, y0 + 40, 210, 52);
    x.fillStyle = bg; x.font = `800 15px ${body}`; x.fillText("DEMANDER UN DEVIS", 58, y0 + 72);
    const g = x.createLinearGradient(620, 130, 990, 560);
    g.addColorStop(0, ac); g.addColorStop(1, fg);
    x.fillStyle = g; x.fillRect(620, 130, 364, 440);
    x.globalAlpha = 0.25; x.fillStyle = bg;
    x.beginPath(); x.moveTo(700, 570); x.lineTo(984, 300); x.lineTo(984, 570); x.fill();
    x.globalAlpha = 1;
  } else if (variant === 1) {
    // services
    x.fillStyle = fg; x.font = `900 40px ${display}`;
    x.fillText("NOS SERVICES", 40, 190);
    x.fillStyle = ac; x.fillRect(40, 210, 80, 6);
    const items = p.services || ["Conseil", "Réalisation", "Suivi"];
    items.slice(0, 3).forEach((t, i) => {
      const cx = 40 + i * 322;
      x.fillStyle = fg; x.globalAlpha = 0.07; x.fillRect(cx, 260, 298, 300); x.globalAlpha = 1;
      x.fillStyle = ac; x.fillRect(cx + 28, 290, 54, 54);
      x.fillStyle = fg; x.font = `800 24px ${body}`; x.fillText(t, cx + 28, 400);
      x.globalAlpha = 0.35;
      for (let k = 0; k < 4; k++) x.fillRect(cx + 28, 430 + k * 24, 230 - (k % 2) * 60, 9);
      x.globalAlpha = 1;
    });
  } else {
    // réalisations / galerie + avis
    x.fillStyle = fg; x.font = `900 40px ${display}`;
    x.fillText("RÉALISATIONS", 40, 190);
    for (let i = 0; i < 6; i++) {
      const cx = 40 + (i % 3) * 322, cy = 230 + Math.floor(i / 3) * 170;
      const g = x.createLinearGradient(cx, cy, cx + 298, cy + 150);
      g.addColorStop(0, ac); g.addColorStop(1, i % 2 ? fg : bg);
      x.globalAlpha = 0.5 + (i % 3) * 0.15; x.fillStyle = g; x.fillRect(cx, cy, 298, 150); x.globalAlpha = 1;
    }
    x.fillStyle = ac;
    for (let s = 0; s < 5; s++) { x.beginPath(); x.arc(46 + s * 26, 598, 9, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = fg; x.globalAlpha = 0.6; x.font = `500 16px ${body}`; x.fillText("Avis clients", 190, 604); x.globalAlpha = 1;
  }
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function floorTexture(stroke) {
  const c = document.createElement("canvas");
  c.width = c.height = 1024;
  const x = c.getContext("2d");
  const cx = 512, cy = 512;
  x.strokeStyle = stroke;
  [460, 380, 250, 120].forEach((r, i) => {
    x.lineWidth = i === 1 ? 3 : 2;
    x.setLineDash(i === 2 ? [6, 14] : []);
    x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.stroke();
  });
  x.setLineDash([]);
  for (let i = 0; i < 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const l = i % 10 === 0 ? 34 : 14;
    x.lineWidth = i % 10 === 0 ? 3 : 1.5;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * 460, cy + Math.sin(a) * 460);
    x.lineTo(cx + Math.cos(a) * (460 - l), cy + Math.sin(a) * (460 - l));
    x.stroke();
  }
  x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(cx - 380, cy); x.lineTo(cx + 380, cy); x.moveTo(cx, cy - 380); x.lineTo(cx, cy + 380); x.stroke();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* items : [{ type: "screen", project, variant } | { type: "poster", file, ratio, index }] */
export function init(canvas, items, opts = {}) {
  const base = opts.base || "assets/img/tex/";
  const fonts = opts.fonts || { display: "Tactic, Arial Black, sans-serif", body: "Archivo, Arial, sans-serif" };
  const isSmall = window.matchMedia("(max-width: 700px)").matches;
  const INK = new Color(opts.bg || "#0b0d12");
  const light = !!opts.light;

  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  } catch (e) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 1.75));
  renderer.setClearColor(INK, 1);
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  scene.fog = new Fog(INK, 7, 19);
  const camera = new PerspectiveCamera(isSmall ? 62 : 48, 1, 0.1, 60);

  const R = 7.4;
  const TH = 2.35;         // hauteur d'une rangée
  const GAP = 0.34;        // espace entre deux éléments (en unités d'arc)
  const loader = new TextureLoader();
  const texCache = {};

  function texFor(it) {
    const key = it.type === "screen" ? "s:" + it.project.slug + ":" + it.variant : "p:" + it.file;
    if (texCache[key]) return texCache[key];
    let t;
    if (it.type === "screen") {
      const cap = it.project.captures && it.project.captures[it.variant];
      if (cap) {
        t = loader.load("assets/img/web/" + cap);
        t.colorSpace = SRGBColorSpace;
        t.anisotropy = 4;
      } else t = screenTexture(it.project, it.variant, fonts);
    } else {
      t = loader.load(base + it.file + "-512.webp");
      t.colorSpace = SRGBColorSpace;
      t.anisotropy = 4;
      if (it.ratio > 1.3) {
        t.repeat.set(1, 1.25 / it.ratio);
        t.offset.set(0, (1 - 1.25 / it.ratio) / 2);
      }
    }
    texCache[key] = t;
    return t;
  }

  const geos = {};
  const geoFor = (w) => geos[w] || (geos[w] = bentPlane(w, TH, R));
  const widthOf = (it) => (it.type === "screen" ? TH * 1.6 : TH * 0.8);

  // Remplit chaque rangée jusqu'à faire le tour, puis répartit l'espace restant.
  const rings = [];
  const meshes = [];
  let cursor = 0;
  const tiers = [{ y: TH * 0.56, dir: 1, shift: 0 }, { y: -TH * 0.56, dir: -1, shift: 0.35 }];
  tiers.forEach((tier) => {
    const g = new Group();
    g.position.y = tier.y;
    const row = [];
    let arc = 0;
    const full = Math.PI * 2 * R;
    while (true) {
      const it = items[cursor % items.length];
      const w = widthOf(it);
      if (arc + w + GAP > full) break;
      row.push(it); arc += w + GAP; cursor++;
    }
    const extra = (full - arc) / row.length;
    let pos = tier.shift * R;
    row.forEach((it) => {
      const w = widthOf(it);
      const mat = new MeshBasicMaterial({ map: texFor(it), color: new Color(0.62, 0.62, 0.66), side: DoubleSide, fog: true });
      const m = new Mesh(geoFor(w), mat);
      m.rotation.y = -(pos + w / 2) / R;
      m.userData = { item: it, glow: 0 };
      g.add(m);
      meshes.push(m);
      pos += w + GAP + extra;
    });
    g.userData = { dir: tier.dir };
    scene.add(g);
    rings.push(g);
  });

  const floor = new Mesh(
    new PlaneGeometry(R * 2.1, R * 2.1),
    new MeshBasicMaterial({ map: floorTexture(light ? "rgba(31,27,36,0.9)" : "rgba(238,236,230,0.85)"), transparent: true, opacity: 0, depthWrite: false, fog: false })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -TH * 1.25;
  scene.add(floor);

  const halo = new Mesh(
    new RingGeometry(R - 0.05, R + 0.05, 160),
    new MeshBasicMaterial({ color: new Color(opts.accent || "#ff5a1f"), transparent: true, opacity: 0, side: DoubleSide, fog: false })
  );
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = -TH * 1.15;
  scene.add(halo);

  const state = {
    progress: 0, speed: 0.05, boost: 0, drag: 0,
    mouse: new Vector2(0, 0), mouseSmooth: new Vector2(0, 0),
    intro: 0, introStart: -1, running: true, hovered: null
  };

  const ray = new Raycaster();
  const ndc = new Vector2(2, 2);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize);

  let dragging = false, lastX = 0, moved = 0;
  const host = opts.host || canvas;
  host.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    state.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ndc.copy(state.mouse);
    if (dragging) {
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      moved += Math.abs(dx);
      state.drag += dx * 0.0035;
    }
  });
  host.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a,button")) return;
    dragging = true; moved = 0; lastX = e.clientX;
  });
  host.addEventListener("pointerup", () => {
    if (!dragging) return;
    dragging = false;
    if (moved < 6 && state.hovered && opts.onSelect) opts.onSelect(state.hovered.userData.item);
  });
  host.addEventListener("pointercancel", () => { dragging = false; });
  host.addEventListener("pointerleave", () => { ndc.set(2, 2); dragging = false; });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!state.running) { requestAnimationFrame(frame); return; }

    state.mouseSmooth.lerp(state.mouse, 1 - Math.pow(0.001, dt));
    state.boost *= Math.pow(0.08, dt);
    state.drag *= Math.pow(0.02, dt);
    if (state.introStart >= 0) {
      const k = MathUtils.clamp((now - state.introStart) / 2600, 0, 1);
      state.intro = 1 - Math.pow(1 - k, 3);
    }
    const intro = state.intro;
    const p = state.progress;

    const spin = (state.speed + state.boost) * dt + state.drag * dt * 6 + (1 - intro) * 1.6 * dt;
    rings.forEach((g) => { g.rotation.y += spin * g.userData.dir; });

    const e = p * p * (3 - 2 * p);
    camera.position.set(
      state.mouseSmooth.x * 0.35 * (1 - e),
      MathUtils.lerp(0.15, 14, e) + state.mouseSmooth.y * 0.25 * (1 - e),
      MathUtils.lerp(0, 4.5, e) + (1 - intro) * 3.5
    );
    camera.lookAt(state.mouseSmooth.x * 0.9 * (1 - e), MathUtils.lerp(0.1, -TH * 1.25, e), MathUtils.lerp(-R, 0, e));
    scene.fog.far = MathUtils.lerp(19, 34, e);
    scene.fog.near = MathUtils.lerp(7, 12, e);

    floor.material.opacity = MathUtils.clamp((e - 0.25) * 1.4, 0, light ? 0.22 : 0.35);
    halo.material.opacity = MathUtils.clamp((e - 0.35) * 1.4, 0, 0.9);

    let hit = null;
    if (e < 0.2 && !dragging && ndc.x < 1.5) {
      ray.setFromCamera(ndc, camera);
      const hits = ray.intersectObjects(meshes, false);
      hit = hits.length ? hits[0].object : null;
    }
    if (hit !== state.hovered) {
      state.hovered = hit;
      host.style.cursor = hit ? "pointer" : "grab";
    }
    const baseLum = light ? 0.97 : MathUtils.lerp(isSmall ? 0.45 : 0.54, 0.9, e) * (0.35 + 0.65 * intro);
    for (const m of meshes) {
      m.userData.glow += ((m === hit ? 1 : 0) - m.userData.glow) * (1 - Math.pow(0.0005, dt));
      const l = baseLum + (1 - baseLum) * m.userData.glow;
      m.material.color.setRGB(l, l, l * 1.03);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  return {
    setProgress(v) { state.progress = MathUtils.clamp(v, 0, 1); },
    kick(v) { state.boost = Math.min(state.boost + Math.abs(v), 1.2); },
    setIntro(v) { state.intro = v; state.introStart = -1; },
    playIntro(delayMs = 0) { if (state.introStart < 0 && state.intro < 1) state.introStart = performance.now() + delayMs; },
    set running(v) { state.running = v; },
    staticMode() { state.speed = 0; state.intro = 1; }
  };
}
