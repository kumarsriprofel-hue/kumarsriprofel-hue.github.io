/* 3D Structure Lab — a tiny dependency-free 3D renderer (Canvas 2D) for an interactive
 * multi-storey RC frame and a Warren truss bridge.
 *  - Drag / touch the structure: it deflects, members are coloured by drift / force.
 *  - Let go: it vibrates freely (damped) and returns to its original shape.
 *  - Earthquake: ground shaking excites the building (base-excited damped oscillator).
 * Exposes window.PKLab.init(rootElement).
 */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) { return [Math.round(lerp(c1[0], c2[0], t)), Math.round(lerp(c1[1], c2[1], t)), Math.round(lerp(c1[2], c2[2], t))]; }
  function rgb(c, a) { return a == null ? 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')' : 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  var GREEN = [47, 179, 109], AMBER = [245, 165, 36], RED = [226, 72, 58], BLUE = [64, 140, 230];
  // 0 → green, 0.5 → amber, 1+ → red
  function ramp(t) { t = clamp(t, 0, 1.3); return t < 0.5 ? mix(GREEN, AMBER, t / 0.5) : mix(AMBER, RED, clamp((t - 0.5) / 0.5, 0, 1)); }

  // ---------- models ----------
  var BLD = { nx: 3, ny: 2, bx: 6, by: 5, floors: 6, h: 3.2 };          // 3 × 2 bays, G+5, 6 m × 5 m bays, 3.2 m storeys
  BLD.H = BLD.floors * BLD.h;
  var BRG = { panels: 6, L: 30, ht: 4.2, w: 7 };                        // 30 m Warren truss, 7 m deck

  function Lab(root) {
    this.root = root;
    this.cv = root.querySelector('canvas');
    this.ctx = this.cv.getContext('2d');
    this.mode = 'building';
    this.yaw = -0.65; this.pitch = 0.42;
    this.s = 0; this.v = 0;           // normalised response (−1.3 … 1.3) and its velocity
    this.target = 0; this.dragging = false;
    this.dir = [1, 0];                 // push direction in plan (building)
    this.loadAt = 0.5;                 // load position along span (bridge, 0..1)
    this.quake = 0; this.quakeT = 0; this.ground = 0;
    this.visible = false; this.last = 0; this.idle = 0;
    this.reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.bind();
    this.resize();
  }

  Lab.prototype.colors = function () {
    var cs = getComputedStyle(this.root);
    return {
      ink: cs.getPropertyValue('--ink').trim() || '#18211b',
      ink2: cs.getPropertyValue('--ink-2').trim() || '#5c645e',
      line: cs.getPropertyValue('--line').trim() || '#e6e6df',
      amber: cs.getPropertyValue('--amber').trim() || '#f5a524',
      green: cs.getPropertyValue('--green').trim() || '#1f3a2b',
      dark: document.documentElement.getAttribute('data-theme') === 'dark' ||
        (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches)
    };
  };

  Lab.prototype.resize = function () {
    var r = this.cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.W = Math.max(280, r.width); this.Hc = Math.max(240, r.height);
    this.cv.width = Math.round(this.W * dpr); this.cv.height = Math.round(this.Hc * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.f = Math.min(this.W, this.Hc * 1.5) * 1.05;
  };

  // ---------- camera ----------
  Lab.prototype.project = function (p) {
    var tx = p[0] - this.cx, ty = p[1] - this.cy, tz = p[2] - this.cz;
    var c = Math.cos(this.yaw), s = Math.sin(this.yaw);
    var x1 = tx * c - ty * s, y1 = tx * s + ty * c;
    var cp = Math.cos(this.pitch), sp = Math.sin(this.pitch);
    var y2 = y1 * cp - tz * sp, z2 = y1 * sp + tz * cp;
    var depth = y2 + this.dist;
    var k = this.f / depth;
    return [this.W / 2 + x1 * k, this.Hc * 0.56 - z2 * k, depth];
  };

  // ---------- geometry: building ----------
  Lab.prototype.buildingGeom = function (col) {
    var B = BLD, segs = [], quads = [], self = this;
    var draw = 3.2;                                   // visual exaggeration of drift
    var roofReal = this.s * 0.48;                     // real roof drift (m); |s| = 1 → 0.48 m (ratio 0.025)
    this.roofReal = roofReal;
    var g = this.ground;
    function phi(k) { return Math.sin(Math.PI * k / (2 * B.floors)); }  // first-mode shape
    function node(i, j, k) {
      var u = roofReal * draw * phi(k);
      return [i * B.bx - B.nx * B.bx / 2 + self.dir[0] * u + g, j * B.by - B.ny * B.by / 2 + self.dir[1] * u, k * B.h];
    }
    var maxRatio = 0;
    for (var k = 1; k <= B.floors; k++) {
      var ratio = Math.abs(roofReal * (phi(k) - phi(k - 1))) / B.h;
      maxRatio = Math.max(maxRatio, ratio);
      var c = ramp(ratio / 0.020);
      for (var i = 0; i <= B.nx; i++) for (var j = 0; j <= B.ny; j++)
        segs.push({ a: node(i, j, k - 1), b: node(i, j, k), w: 3.2, c: rgb(c) });           // columns
      for (i = 0; i < B.nx; i++) for (j = 0; j <= B.ny; j++)
        segs.push({ a: node(i, j, k), b: node(i + 1, j, k), w: 2, c: rgb(c, .9) });       // beams x
      for (i = 0; i <= B.nx; i++) for (j = 0; j < B.ny; j++)
        segs.push({ a: node(i, j, k), b: node(i, j + 1, k), w: 2, c: rgb(c, .9) });       // beams y
      quads.push({ p: [node(0, 0, k), node(B.nx, 0, k), node(B.nx, B.ny, k), node(0, B.ny, k)],
        fill: k === B.floors ? rgb(ramp(ratio / 0.020), col.dark ? .28 : .22) : (col.dark ? 'rgba(255,255,255,.06)' : 'rgba(31,58,43,.06)') });
    }
    this.maxRatio = maxRatio;
    // ground slab + footings
    var pad = 4;
    quads.push({ p: [[-B.nx * B.bx / 2 - pad + g, -B.ny * B.by / 2 - pad, 0], [B.nx * B.bx / 2 + pad + g, -B.ny * B.by / 2 - pad, 0],
      [B.nx * B.bx / 2 + pad + g, B.ny * B.by / 2 + pad, 0], [-B.nx * B.bx / 2 - pad + g, B.ny * B.by / 2 + pad, 0]],
      fill: col.dark ? 'rgba(255,255,255,.05)' : 'rgba(31,58,43,.08)', ground: true });
    // load arrow at roof level
    var arrow = null;
    if (Math.abs(this.s) > 0.02 && !this.quake) {
      var top = node(0, B.ny / 2, B.floors), sgn = this.s > 0 ? 1 : -1;
      var from = [top[0] - self.dir[0] * sgn * 7, top[1] - self.dir[1] * sgn * 7, top[2]];
      arrow = { a: from, b: top, label: 'F' };
    }
    this.cx = 0; this.cy = 0; this.cz = B.H * 0.42; this.dist = 52;
    return { segs: segs, quads: quads, arrow: arrow };
  };

  // ---------- geometry: Warren truss bridge ----------
  Lab.prototype.bridgeGeom = function (col) {
    var R = BRG, segs = [], quads = [];
    var n = R.panels, L = R.L, dx = L / n, a = clamp(this.loadAt, 0.12, 0.88) * L;
    var defReal = Math.max(0, this.s) * 0.06 + Math.min(0, this.s) * 0.02;   // 60 mm max down (rebound up to 20 mm)
    this.defReal = defReal;
    var draw = 32;
    function w(x) { var t = x <= a ? Math.sin(Math.PI * x / (2 * a)) : Math.sin(Math.PI * (L - x) / (2 * (L - a))); return -defReal * draw * t; }
    function P(x, y, z) { return [x - L / 2, y, z + w(x)]; }
    var force = clamp(Math.abs(defReal) / 0.06, 0, 1.2);
    var tens = rgb(mix([170, 180, 175], RED, force)), comp = rgb(mix([170, 180, 175], BLUE, force)), diag = rgb(mix([170, 180, 175], AMBER, force));
    if (col.dark) { tens = rgb(mix([120, 135, 128], RED, force)); comp = rgb(mix([120, 135, 128], BLUE, force)); diag = rgb(mix([120, 135, 128], AMBER, force)); }
    [-R.w / 2, R.w / 2].forEach(function (y) {
      for (var i = 0; i < n; i++) segs.push({ a: P(i * dx, y, 0), b: P((i + 1) * dx, y, 0), w: 3.4, c: tens });                // bottom chord (tension)
      for (i = 0; i < n - 1; i++) segs.push({ a: P((i + .5) * dx, y, R.ht), b: P((i + 1.5) * dx, y, R.ht), w: 3.4, c: comp }); // top chord (compression)
      for (i = 0; i < n; i++) {
        segs.push({ a: P(i * dx, y, 0), b: P((i + .5) * dx, y, R.ht), w: 2.4, c: diag });
        segs.push({ a: P((i + .5) * dx, y, R.ht), b: P((i + 1) * dx, y, 0), w: 2.4, c: diag });
      }
    });
    for (var i = 0; i <= n; i++) segs.push({ a: P(i * dx, -R.w / 2, 0), b: P(i * dx, R.w / 2, 0), w: 1.6, c: rgb(col.dark ? [150, 160, 155] : [120, 130, 125], .8) });       // floor beams
    for (i = 0; i < n; i++) segs.push({ a: P((i + .5) * dx, -R.w / 2, R.ht), b: P((i + .5) * dx, R.w / 2, R.ht), w: 1.4, c: rgb(col.dark ? [150, 160, 155] : [120, 130, 125], .6) }); // top bracing
    for (i = 0; i < n; i++) quads.push({ p: [P(i * dx, -R.w / 2, 0), P((i + 1) * dx, -R.w / 2, 0), P((i + 1) * dx, R.w / 2, 0), P(i * dx, R.w / 2, 0)], fill: col.dark ? 'rgba(255,255,255,.07)' : 'rgba(31,58,43,.09)' });
    // abutments
    [0, L].forEach(function (x) {
      var s = x === 0 ? -1 : 1;
      quads.push({ p: [[x - L / 2, -R.w / 2 - 1, 0], [x - L / 2 + s * 4, -R.w / 2 - 1, 0], [x - L / 2 + s * 4, R.w / 2 + 1, 0], [x - L / 2, R.w / 2 + 1, 0]], fill: col.dark ? 'rgba(255,255,255,.12)' : 'rgba(31,58,43,.16)' });
      quads.push({ p: [[x - L / 2, -R.w / 2 - 1, 0], [x - L / 2, R.w / 2 + 1, 0], [x - L / 2, R.w / 2 + 1, -3], [x - L / 2, -R.w / 2 - 1, -3]], fill: col.dark ? 'rgba(255,255,255,.1)' : 'rgba(31,58,43,.13)' });
    });
    var arrow = null;
    if (this.s > 0.02) { var q = P(a, 0, 0); arrow = { a: [q[0], q[1], q[2] + 9], b: [q[0], q[1], q[2] + .4], label: 'P' }; }
    this.cx = 0; this.cy = 0; this.cz = 1.5; this.dist = 46;
    return { segs: segs, quads: quads, arrow: arrow };
  };

  // ---------- render ----------
  Lab.prototype.draw = function () {
    var ctx = this.ctx, col = this.colors(), self = this;
    ctx.clearRect(0, 0, this.W, this.Hc);
    var G = this.mode === 'building' ? this.buildingGeom(col) : this.bridgeGeom(col);
    // ground grid
    ctx.lineWidth = 1; ctx.strokeStyle = col.dark ? 'rgba(255,255,255,.06)' : 'rgba(31,58,43,.08)';
    for (var gx = -30; gx <= 30; gx += 5) {
      this.line(this.project([gx + (this.mode === 'building' ? this.ground : 0), -24, this.mode === 'building' ? 0 : -3]), this.project([gx + (this.mode === 'building' ? this.ground : 0), 24, this.mode === 'building' ? 0 : -3]));
    }
    for (var gy = -24; gy <= 24; gy += 5) {
      this.line(this.project([-30 + (this.mode === 'building' ? this.ground : 0), gy, this.mode === 'building' ? 0 : -3]), this.project([30 + (this.mode === 'building' ? this.ground : 0), gy, this.mode === 'building' ? 0 : -3]));
    }
    // painter's algorithm
    var items = [];
    G.quads.forEach(function (q) {
      var pts = q.p.map(function (p) { return self.project(p); });
      var d = pts.reduce(function (s, p) { return s + p[2]; }, 0) / pts.length;
      items.push({ d: q.ground ? 1e9 : d, quad: pts, fill: q.fill });
    });
    G.segs.forEach(function (s) {
      var a = self.project(s.a), b = self.project(s.b);
      items.push({ d: (a[2] + b[2]) / 2, a: a, b: b, w: s.w, c: s.c });
    });
    items.sort(function (p, q) { return q.d - p.d; });
    items.forEach(function (it) {
      if (it.quad) {
        ctx.beginPath(); ctx.moveTo(it.quad[0][0], it.quad[0][1]);
        for (var i = 1; i < it.quad.length; i++) ctx.lineTo(it.quad[i][0], it.quad[i][1]);
        ctx.closePath(); ctx.fillStyle = it.fill; ctx.fill();
      } else {
        var k = clamp(46 / it.a[2], .6, 1.6);
        ctx.lineCap = 'round'; ctx.lineWidth = it.w * k; ctx.strokeStyle = it.c;
        self.line(it.a, it.b);
      }
    });
    // load arrow
    if (G.arrow) {
      var A = this.project(G.arrow.a), B = this.project(G.arrow.b), ang = Math.atan2(B[1] - A[1], B[0] - A[0]);
      ctx.strokeStyle = col.amber; ctx.fillStyle = col.amber; ctx.lineWidth = 4; ctx.lineCap = 'round';
      this.line(A, B);
      ctx.beginPath(); ctx.moveTo(B[0], B[1]);
      ctx.lineTo(B[0] - 14 * Math.cos(ang - .45), B[1] - 14 * Math.sin(ang - .45));
      ctx.lineTo(B[0] - 14 * Math.cos(ang + .45), B[1] - 14 * Math.sin(ang + .45)); ctx.closePath(); ctx.fill();
      ctx.font = '700 15px "Plus Jakarta Sans", sans-serif'; ctx.fillText(G.arrow.label, A[0] - 6, A[1] - 8);
    }
    // ground shake marks
    if (this.quake && this.mode === 'building') {
      ctx.strokeStyle = col.amber; ctx.lineWidth = 2.5;
      var base = this.project([this.ground, BLD.ny * BLD.by / 2 + 5, 0]);
      for (var i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(base[0], base[1], 10 + i * 9 + (this.quakeT * 60) % 9, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); }
    }
    this.updateReadout();
  };
  Lab.prototype.line = function (a, b) { var c = this.ctx; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };

  // ---------- readouts ----------
  Lab.prototype.updateReadout = function () {
    var R = this.root, set = function (k, v) { var el = R.querySelector('[data-r="' + k + '"]'); if (el && el.textContent !== v) el.textContent = v; };
    var st = R.querySelector('.lab-status'), ok;
    if (this.mode === 'building') {
      var mm = Math.abs(this.roofReal * 1000), ratio = this.maxRatio || 0;
      ok = ratio <= 0.020;
      set('l1', 'Roof drift'); set('v1', mm.toFixed(0) + ' mm');
      set('l2', 'Max storey drift ratio'); set('v2', ratio.toFixed(4));
      set('l3', 'Limit (BNBC 2020)'); set('v3', '0.020');
    } else {
      var d = Math.abs(this.defReal * 1000), Ld = d > 0.5 ? Math.round(BRG.L * 1000 / d) : null;
      ok = !Ld || Ld >= 800;
      set('l1', 'Deflection'); set('v1', d.toFixed(1) + ' mm');
      set('l2', 'Span / deflection'); set('v2', Ld ? 'L/' + Ld : '—');
      set('l3', 'Limit (live load)'); set('v3', 'L/800');
    }
    var phase = this.quake ? 'Earthquake shaking' : this.dragging ? (this.mode === 'building' ? 'Pushing the frame' : 'Loading the deck') :
      Math.abs(this.s) > 0.01 || Math.abs(this.v) > 0.01 ? 'Free vibration · 7% damping' : 'At rest · original shape';
    set('phase', phase);
    if (st) { st.textContent = ok ? '✓ Within limit' : '⚠ Over limit'; st.classList.toggle('bad', !ok); }
  };

  // ---------- physics ----------
  Lab.prototype.step = function (dt) {
    dt = Math.min(dt, 1 / 30);
    var w = TAU * (this.mode === 'building' ? 0.9 : 1.4), z = 0.07;
    if (this.dragging) {
      var ns = lerp(this.s, this.target, 1 - Math.pow(0.0005, dt));
      this.v = (ns - this.s) / dt; this.s = ns;
    } else {
      var ag = 0;
      if (this.quake) {
        this.quakeT += dt;
        var T = this.quakeT, env = Math.sin(Math.PI * clamp(T / 6, 0, 1));
        var fq = 0.7 + 0.07 * T;                                          // frequency sweep through resonance
        ag = 2.2 * env * Math.sin(TAU * fq * T) * w * w;
        this.ground = 0.9 * env * Math.sin(TAU * fq * T);
        if (T >= 6) { this.quake = 0; this.ground = 0; this.root.classList.remove('quaking'); }
      }
      var a = -w * w * this.s - 2 * z * w * this.v - ag * 0.24;
      this.v += a * dt; this.s += this.v * dt;
      this.s = clamp(this.s, -1.35, 1.35);
    }
    // gentle auto-rotate while idle
    var moving = this.dragging || this.quake || Math.abs(this.s) > 0.004 || Math.abs(this.v) > 0.01;
    if (!moving && !this.reduce) { this.yaw += dt * 0.12; }
    if (!moving && Math.abs(this.s) < 0.004) { this.s = 0; this.v = 0; }
  };

  Lab.prototype.loop = function (t) {
    if (!this.visible) { this.raf = 0; return; }
    var dt = this.last ? (t - this.last) / 1000 : 0.016; this.last = t;
    this.step(dt); this.draw();
    this.raf = requestAnimationFrame(this.loop.bind(this));
  };
  Lab.prototype.start = function () { if (!this.raf) { this.last = 0; this.raf = requestAnimationFrame(this.loop.bind(this)); } };

  // ---------- interaction ----------
  Lab.prototype.bind = function () {
    var self = this, cv = this.cv, x0 = 0, y0 = 0, pid = null;
    function local(e) { var r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    cv.addEventListener('pointerdown', function (e) {
      var p = local(e); x0 = p[0]; y0 = p[1]; pid = e.pointerId;
      self.dragging = true; self.quake = 0; self.ground = 0; self.root.classList.remove('quaking');
      cv.setPointerCapture(pid);
      if (self.mode === 'building') {
        self.dir = [Math.cos(self.yaw), -Math.sin(self.yaw)];          // camera "right" vector in plan
        self.target = self.s;
      } else {
        self.loadAt = clamp(p[0] / self.W, 0.1, 0.9);
        self.target = Math.max(self.s, 0.35);
      }
      self.root.classList.add('touched');
      self.start();
    });
    cv.addEventListener('pointermove', function (e) {
      if (!self.dragging || e.pointerId !== pid) return;
      var p = local(e);
      if (self.mode === 'building') self.target = clamp((p[0] - x0) / (self.W * 0.32), -1.3, 1.3);
      else { self.loadAt = clamp(p[0] / self.W, 0.1, 0.9); self.target = clamp(0.35 + (p[1] - y0) / (self.Hc * 0.35), 0, 1.3); }
    });
    function end(e) { if (e.pointerId !== pid) return; self.dragging = false; pid = null; }
    cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    // keyboard: arrows push / load, space = release
    cv.addEventListener('keydown', function (e) {
      var k = e.key;
      if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'ArrowDown' || k === 'ArrowUp') {
        e.preventDefault(); self.dragging = false; self.quake = 0;
        if (self.mode === 'building') { self.dir = [Math.cos(self.yaw), -Math.sin(self.yaw)]; self.v += (k === 'ArrowRight' || k === 'ArrowUp' ? 1 : -1) * 3.5; }
        else self.v += (k === 'ArrowDown' || k === 'ArrowRight' ? 1 : -0.6) * 4;
        self.start();
      }
    });
    this.root.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        self.mode = b.dataset.mode; self.s = 0; self.v = 0; self.quake = 0; self.ground = 0;
        self.root.querySelectorAll('[data-mode]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        self.root.classList.toggle('is-bridge', self.mode === 'bridge');
        cv.style.touchAction = self.mode === 'bridge' ? 'none' : 'pan-y';
        cv.setAttribute('aria-label', self.mode === 'bridge'
          ? 'Interactive 3D Warren truss bridge. Press and drag down on the deck to load it; release to watch it spring back. Arrow keys also work.'
          : 'Interactive 3D six-storey frame building. Drag left or right to push it; release to watch it vibrate back to its original shape. Arrow keys also work.');
        self.start();
      });
    });
    var q = this.root.querySelector('[data-act="quake"]');
    if (q) q.addEventListener('click', function () {
      if (self.mode !== 'building') self.root.querySelector('[data-mode="building"]').click();
      self.dragging = false; self.quake = 1; self.quakeT = 0; self.dir = [1, 0];   // ground shakes along world x
      self.root.classList.add('quaking'); self.start();
    });
    var r = this.root.querySelector('[data-act="reset"]');
    if (r) r.addEventListener('click', function () { self.s = 0; self.v = 0; self.quake = 0; self.ground = 0; self.dragging = false; self.root.classList.remove('quaking'); self.start(); });
    window.addEventListener('resize', function () { self.resize(); self.draw(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (en) { self.visible = en.isIntersecting; if (self.visible) self.start(); }); }, { threshold: .05 }).observe(this.root);
    } else { this.visible = true; this.start(); }
    this.draw();
  };

  window.PKLab = { init: function (root) { if (root && !root._lab) root._lab = new Lab(root); return root && root._lab; } };
})();
