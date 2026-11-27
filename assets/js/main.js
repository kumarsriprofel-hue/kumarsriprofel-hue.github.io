/* Profal Kumar – portfolio
 * All words, photos and projects come from content/site.json (edited through the admin panel).
 * Every value is HTML-escaped before it reaches the page, so content can never inject code.
 * Allowed formatting in text fields:  **bold**   and   *amber italic highlight*
 */
(function () {
  'use strict';

  // ---------- theme (runs first to avoid a flash) ----------
  var root = document.documentElement, THEME_KEY = 'pk-theme';
  try { var saved = localStorage.getItem(THEME_KEY); if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved); } catch (e) {}

  // ---------- safe helpers ----------
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  // escape first, then allow only **bold** and *highlight*
  function fmt(s) {
    return esc(s)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+?)\*(?!\*)/g, '$1<em class="hl">$2</em>');
  }
  // only allow http(s), mailto, tel and same-site relative links
  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return '';          // javascript:, data:, etc.
    if (u.indexOf('//') === 0) return '';                     // protocol-relative
    return u.replace(/^\/+/, '');                              // site-relative
  }
  function list(a) { return Array.isArray(a) ? a : []; }
  // Web3Forms access keys are UUIDs
  function validKey(k) { return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(k || '').trim()); }
  function chips(tags, cls) {
    tags = list(tags).filter(Boolean);
    if (!tags.length) return '';
    return '<div class="chip-row">' + tags.map(function (t) { return '<span class="chip">' + esc(t) + '</span>'; }).join('') + '</div>';
  }
  function ul(items) {
    items = list(items).filter(Boolean);
    return items.length ? '<ul>' + items.map(function (b) { return '<li>' + fmt(b) + '</li>'; }).join('') + '</ul>' : '';
  }
  function head(eyebrow, heading) {
    return '<div class="sec-head reveal"><div><span class="eyebrow">' + esc(eyebrow) + '</span><h2 class="sec-title">' + fmt(heading) + '</h2></div></div>';
  }
  var ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  var DOWN = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M12 4v12m0 0l-5-5m5 5l5-5M5 20h14"/></svg>';
  var ICONS = {
    mail: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    phone: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/></svg>',
    linkedin: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21H9z"/></svg>',
    github: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>',
    work: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/></svg>',
    education: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg>',
    teach: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M7 9h5M7 12h3M8 20l4-4 4 4M15 8l2 2"/></svg>',
    doc: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h6"/></svg>'
  };
  var PLACEHOLDER = '<svg class="ph-svg" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" fill="none" stroke="var(--green)" stroke-width="1.5" aria-hidden="true"><circle cx="150" cy="80" r="62" fill="var(--amber)" stroke="none" opacity=".25"/><rect x="95" y="40" width="110" height="95" fill="var(--bg)"/><path d="M95 59h110M95 78h110M95 97h110M95 116h110M132 40v95M168 40v95"/><path d="M85 30l25 10M215 30l-25 10" stroke="var(--amber)" stroke-width="3"/><path d="M40 135h220" stroke-dasharray="4 4"/></svg>';

  // ---------- section renderers ----------
  function renderHero(p, f) {
    var cv = safeUrl(p.cv), mail = p.email ? 'mailto:' + p.email : '';
    var socials = '';
    if (safeUrl(p.linkedin)) socials += '<a class="soc" href="' + esc(safeUrl(p.linkedin)) + '" target="_blank" rel="noopener noreferrer">' + ICONS.linkedin + 'LinkedIn</a>';
    if (safeUrl(p.github)) socials += '<a class="soc" href="' + esc(safeUrl(p.github)) + '" target="_blank" rel="noopener noreferrer">' + ICONS.github + 'GitHub</a>';
    if (mail) socials += '<a class="soc" href="' + esc(mail) + '">' + ICONS.mail + 'Email</a>';
    if (p.location) socials += '<span class="soc">📍 ' + esc(p.location) + '</span>';
    socials += '<span class="soc views-pill" data-views hidden title="Total page views (updates live)"><i class="live-dot"></i>👁 <b>0</b><em></em></span>';
    return '<section class="hero"><div class="wrap hero-grid"><div>' +
      (p.status ? '<span class="hello"><span></span><i class="dot"></i>' + esc(p.status) + '</span>' : '') +
      '<h1>Hi, I\'m <em class="hl">' + esc(p.name) + '</em></h1>' +
      '<p class="role">' + fmt(p.intro) + '</p>' +
      (f && f.enabled !== false ? '<a class="founder-chip" href="#kumar-math"><i class="fc-gear" aria-hidden="true">π</i><span>Founder of <b>Kumar Math</b></span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14m-6-6l6 6-6 6"/></svg></a>' : '') +
      '<div class="cta">' +
        (cv ? '<a class="btn dark" href="' + esc(cv) + '" download>Download CV <span class="arr">' + DOWN + '</span></a>' : '') +
        '<a class="btn ghost" href="#contact">Get in touch</a></div>' +
      '<div class="socials">' + socials + '</div></div>' +
      '<div class="portrait"><div class="blob"></div><div class="ring"></div><div class="disc"></div>' +
        '<div class="cut"><img src="' + esc(safeUrl(p.photo)) + '" alt="Portrait of ' + esc(p.name) + '" fetchpriority="high"></div>' +
        '<div class="badge-round"><svg viewBox="0 0 108 108" aria-hidden="true"><defs><path id="circ" d="M54,54 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0"/></defs>' +
          '<text font-size="9.5" font-weight="700" letter-spacing="2.2" fill="#fff"><textPath href="#circ">' + esc(p.badge_ring_text) + '</textPath></text></svg>' +
          '<b>' + esc(p.badge_center).replace(/ /g, '<br>') + '</b></div>' +
        (p.cgpa ? '<div class="gpa"><strong>' + esc(p.cgpa) + '</strong><small>' + esc(p.cgpa_label) + '</small></div>' : '') +
        (p.hero_tag_1 ? '<span class="float-pill fp1">' + esc(p.hero_tag_1) + '</span>' : '') +
        (p.hero_tag_2 ? '<span class="float-pill fp2">' + esc(p.hero_tag_2) + '</span>' : '') +
      '</div></div></section>';
  }

  function renderMarquee(m) {
    function track(items) { items = list(items); var s = items.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join(''); return '<div class="track">' + s + s + '</div>'; }
    return '<div class="band" aria-hidden="true"><div class="strip back">' + track(m.back) + '</div><div class="strip">' + track(m.main) + '</div></div>';
  }

  function renderAbout(a, p) {
    var stats = list(a.stats).map(function (s) { return '<div><strong>' + esc(s.value) + '</strong><span>' + esc(s.label) + '</span></div>'; }).join('');
    var cv = safeUrl(p.cv);
    return '<section id="about" class="about"><div class="wrap about-grid">' +
      '<div class="orbit reveal"><div class="disc"></div>' +
        '<div class="cut"><img src="' + esc(safeUrl(p.about_photo || p.photo)) + '" alt="' + esc(p.name) + '" loading="lazy"></div>' +
        list(a.photo_chips).map(function (c) { return '<span class="chip-o">' + esc(c) + '</span>'; }).join('') +
      '</div><div class="reveal">' +
        '<span class="eyebrow">' + esc(a.eyebrow) + '</span><h2>' + fmt(a.heading) + '</h2>' +
        list(a.paragraphs).map(function (t) { return '<p>' + fmt(t) + '</p>'; }).join('') +
        '<div class="stats">' + stats + '</div>' +
        '<div class="about-cta">' + (cv ? '<a class="btn amber" href="' + esc(cv) + '" download>Download CV <span class="arr">' + DOWN + '</span></a>' : '') +
        '<span class="script sign">' + esc(a.signature) + '</span></div>' +
      '</div></div></section>';
  }

  function renderSkills(s) {
    var groups = list(s.groups);
    var tabs = groups.length > 1 ? '<div class="tabs-wrap reveal"><div class="tabs" role="tablist">' + groups.map(function (g, i) {
      return '<button class="tab" role="tab" aria-selected="' + (i === 0) + '" data-tab="' + i + '">' + esc(g.name) + '</button>';
    }).join('') + '</div></div>' : '';
    var panels = groups.map(function (g, i) {
      return '<div class="tools' + (i ? ' hidden' : '') + '" data-group="' + i + '">' + list(g.items).map(function (it) {
        var pct = Math.max(0, Math.min(100, Number(it.percent) || 0));
        return '<div class="tool"><div class="ring-ico" data-w="' + pct + '"><svg viewBox="0 0 92 92" aria-hidden="true"><circle class="trk" cx="46" cy="46" r="42"/><circle class="val" cx="46" cy="46" r="42"/></svg><span class="ico">' + esc(it.short) + '</span></div>' +
          '<h3>' + esc(it.name) + '</h3><span class="lvl">' + esc(it.level) + '</span><p>' + fmt(it.description) + '</p></div>';
      }).join('') + '</div>';
    }).join('');
    return '<section id="skills"><div class="wrap center"><span class="eyebrow reveal">' + esc(s.eyebrow) + '</span>' +
      '<h2 class="sec-title reveal">' + fmt(s.heading) + '</h2>' + tabs + panels + '</div></section>';
  }

  function renderExperience(x) {
    return '<section id="experience" class="alt"><div class="wrap">' + head(x.eyebrow, x.heading) + '<div class="exp-grid">' +
      list(x.items).map(function (e) {
        return '<div class="exp reveal"><span class="ic">' + (ICONS[e.icon] || ICONS.work) + '</span>' +
          (e.when ? '<span class="when">' + esc(e.when) + '</span>' : '') +
          '<h3>' + esc(e.title) + '</h3><div class="org">' + esc(e.org) + '</div>' + ul(e.bullets) + chips(e.tags) +
          (e.note ? '<div class="thesis"><small>' + esc(e.note_label) + '</small>' + fmt(e.note) + '</div>' : '') + '</div>';
      }).join('') + '</div></div></section>';
  }

  function projectLink(pr) {
    var u = safeUrl(pr.link);
    return u ? '<a class="p-link" href="' + esc(u) + '" target="_blank" rel="noopener noreferrer">' + esc(pr.link_label || 'View project') + ' <i>' + ARROW + '</i></a>' : '';
  }
  var SPK_OFF = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M23 9l-6 6M17 9l6 6"/></svg>';
  var SPK_ON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
  function projectPic(pr) {
    var vid = safeUrl(pr.video);
    if (vid) {
      var poster = safeUrl(pr.video_poster) || safeUrl(pr.image);
      return '<div class="pic vid">' +
        '<video class="pvid" muted loop playsinline preload="none"' + (poster ? ' poster="' + esc(poster) + '"' : '') + ' src="' + esc(vid) + '" aria-label="Video: ' + esc(pr.title) + '"></video>' +
        '<button class="snd" type="button" aria-pressed="false" aria-label="Turn sound on">' + SPK_OFF + '<span>Tap for sound</span></button>' +
      '</div>';
    }
    var img = safeUrl(pr.image);
    if (!img) return '<div class="pic">' + PLACEHOLDER + '</div>';
    return '<a class="pic" href="' + esc(img) + '" target="_blank" rel="noopener" aria-label="Open full image: ' + esc(pr.title) + '">' +
      '<img src="' + esc(img) + '" alt="' + esc(pr.image_alt || pr.title) + '" loading="lazy" data-focus="' + esc(pr.image_focus || '') + '"></a>';
  }
  // ---------- slide deck (presentation viewer) ----------
  var CHEV_L = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  var CHEV_R = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';
  var FULL = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  function thumbOf(u) { return /\.(jpe?g|png|webp)$/i.test(u) ? u.replace(/\.(jpe?g|png|webp)$/i, '-thumb.jpg') : u; }
  // shared slide viewer markup (used by project cards and research cards)
  function renderViewer(slidesIn, pdfIn, title) {
    var slides = list(slidesIn).map(safeUrl).filter(Boolean);
    if (!slides.length) return '';
    var pdf = safeUrl(pdfIn), n = slides.length;
    return '<div class="viewer" tabindex="0" role="region" aria-roledescription="carousel" aria-label="Slides: ' + esc(title) + '" data-slides="' + esc(JSON.stringify(slides)) + '">' +
        '<div class="stage">' +
          '<img class="slide" src="' + esc(slides[0]) + '" alt="' + esc(title) + ' – slide 1 of ' + n + '" loading="lazy">' +
          '<button class="nav-btn prev" type="button" aria-label="Previous slide">' + CHEV_L + '</button>' +
          '<button class="nav-btn next" type="button" aria-label="Next slide">' + CHEV_R + '</button>' +
        '</div>' +
        '<div class="progress"><i></i></div>' +
        '<div class="vbar"><span class="count" aria-live="polite"><b>1</b> / ' + n + '</span><div class="vbtns">' +
          (pdf ? '<a class="vbtn" href="' + esc(pdf) + '" target="_blank" rel="noopener">' + DOWN.replace('width="16" height="16"', 'width="15" height="15"') + 'PDF</a>' : '') +
          '<button class="vbtn fs" type="button" aria-label="Full screen">' + FULL + 'Full screen</button>' +
        '</div></div>' +
        '<div class="thumbs">' + slides.map(function (s, i) {
          return '<button type="button" data-i="' + i + '" aria-label="Go to slide ' + (i + 1) + '"' + (i ? '' : ' aria-current="true"') + '><img src="' + esc(thumbOf(s)) + '" data-full="' + esc(s) + '" alt="" loading="lazy"></button>';
        }).join('') + '</div>' +
      '</div>';
  }
  function renderDeck(pr) {
    var stats = list(pr.stats).length ? '<div class="pub-stats deck-stats">' + list(pr.stats).map(function (s) { return '<div><strong>' + esc(s.value) + '</strong><span>' + esc(s.label) + '</span></div>'; }).join('') + '</div>' : '';
    return '<article class="project deck reveal">' + renderViewer(pr.slides, pr.slides_pdf, pr.title) +
      '<div class="pbody"><div class="deck-main">' +
        '<span class="kind">' + esc(pr.kind) + '</span><h3>' + esc(pr.title) + '</h3>' +
        (pr.summary ? '<p>' + fmt(pr.summary) + '</p>' : '') + ul(pr.bullets) +
      '</div><div class="deck-side">' + stats + chips(pr.tags) + projectLink(pr) + '</div></div>' +
    '</article>';
  }
  function initDecks() {
    document.querySelectorAll('.viewer').forEach(function (v) {
      var slides; try { slides = JSON.parse(v.dataset.slides || '[]'); } catch (e) { slides = []; }
      if (!slides.length) return;
      var img = v.querySelector('.slide'), prev = v.querySelector('.prev'), next = v.querySelector('.next');
      var count = v.querySelector('.count b'), bar = v.querySelector('.progress i');
      var thumbs = [].slice.call(v.querySelectorAll('.thumbs button')), i = 0, n = slides.length;
      var title = img.alt.replace(/ – slide.*$/, '');
      // fall back to the full image when there is no "-thumb" file (e.g. slides uploaded via the admin panel)
      v.querySelectorAll('.thumbs img').forEach(function (t) {
        t.addEventListener('error', function () { if (t.src.indexOf(t.dataset.full) === -1) t.src = t.dataset.full; }, { once: true });
      });
      function preload(k) { if (k >= 0 && k < n) { var p = new Image(); p.src = slides[k]; } }
      function go(k) {
        if (k < 0 || k >= n) return;
        i = k;
        img.classList.add('fade');
        img.src = slides[i];
        img.alt = title + ' – slide ' + (i + 1) + ' of ' + n;
        count.textContent = i + 1;
        bar.style.width = ((i + 1) / n * 100) + '%';
        prev.disabled = i === 0; next.disabled = i === n - 1;
        thumbs.forEach(function (t, j) { if (j === i) { t.setAttribute('aria-current', 'true'); var s = t.parentNode; s.scrollTo({ left: t.offsetLeft - s.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' }); } else t.removeAttribute('aria-current'); });
        preload(i + 1); preload(i - 1);
      }
      img.addEventListener('load', function () { img.classList.remove('fade'); });
      prev.addEventListener('click', function () { go(i - 1); });
      next.addEventListener('click', function () { go(i + 1); });
      thumbs.forEach(function (t) { t.addEventListener('click', function () { go(Number(t.dataset.i)); }); });
      v.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(i + 1); }
        else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(i - 1); }
        else if (e.key === 'Home') { e.preventDefault(); go(0); }
        else if (e.key === 'End') { e.preventDefault(); go(n - 1); }
      });
      // swipe on touch screens
      var x0 = null, stage = v.querySelector('.stage');
      stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
      stage.addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1)); });
      stage.addEventListener('pointercancel', function () { x0 = null; });
      var fs = v.querySelector('.fs');
      if (!v.requestFullscreen) fs.hidden = true;
      fs.addEventListener('click', function () {
        if (document.fullscreenElement) document.exitFullscreen(); else v.requestFullscreen().then(function () { v.focus(); }).catch(function () {});
      });
      go(0);
    });
  }

  // ---------- project videos: autoplay muted while visible; one tap turns the sound on ----------
  function initVideos() {
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('.pic.vid').forEach(function (box) {
      var v = box.querySelector('video'), btn = box.querySelector('.snd'), label = btn.querySelector('span');
      v.muted = true;
      var userPaused = false;
      function setSound(on) {
        v.muted = !on;
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', on ? 'Mute sound' : 'Turn sound on');
        btn.innerHTML = (on ? SPK_ON : SPK_OFF) + '<span>' + (on ? 'Sound on' : 'Tap for sound') + '</span>';
        btn.classList.toggle('on', on);
      }
      var first = true;
      btn.addEventListener('click', function () {
        var on = v.muted;
        if (on && first) { v.currentTime = 0; first = false; v.controls = true; }   // first unmute: start from the beginning, show the player bar
        setSound(on);
        if (v.paused) v.play().catch(function () {});
      });
      v.addEventListener('pause', function () { if (!document.hidden && v.dataset.auto !== '1') userPaused = true; v.dataset.auto = ''; });
      v.addEventListener('play', function () { userPaused = false; });
      if (reduce || !('IntersectionObserver' in window)) { v.preload = 'metadata'; v.controls = true; return; }
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { if (!userPaused) v.play().catch(function () { v.controls = true; }); }
          else if (!v.paused) { v.dataset.auto = '1'; v.pause(); }
        });
      }, { threshold: .35 }).observe(v);
    });
  }

  function renderProjects(ps) {
    var items = list(ps.items).slice().sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    return '<section id="projects"><div class="wrap">' + head(ps.eyebrow, ps.heading) + '<div class="projects">' +
      items.map(function (pr) {
        if (list(pr.slides).length) return renderDeck(pr);
        var stats = list(pr.stats).length ? '<div class="feat-stats">' + list(pr.stats).map(function (s) { return '<div><strong>' + esc(s.value) + '</strong><span>' + esc(s.label) + '</span></div>'; }).join('') + '</div>' : '';
        var body = (pr.featured ? '<span class="feat-badge">★ Featured project</span>' : '') +
          '<span class="kind">' + esc(pr.kind) + '</span><h3>' + esc(pr.title) + '</h3>' +
          (pr.summary ? '<p>' + fmt(pr.summary) + '</p>' : '') + ul(pr.bullets);
        return '<article class="project' + (pr.featured ? ' featured' : '') + (safeUrl(pr.video) ? ' has-video' : '') + ' reveal">' + projectPic(pr) +
          '<div class="pbody">' + body + (pr.featured ? stats + chips(pr.tags) + projectLink(pr) : '<div class="pfoot">' + stats + chips(pr.tags) + projectLink(pr) + '</div>') + '</div></article>';
      }).join('') + '</div></div></section>';
  }

  function renderPublications(pb) {
    var items = list(pb.items);
    if (!items.length) return '';
    return '<section id="publications" class="pt0"><div class="wrap">' + head(pb.eyebrow, pb.heading) +
      items.map(function (it) {
        var stats = list(it.stats).length ? '<div class="pub-stats">' + list(it.stats).map(function (s) { return '<div><strong>' + esc(s.value) + '</strong><span>' + esc(s.label) + '</span></div>'; }).join('') + '</div>' : '';
        var mlabel = /progress/i.test(it.status || '') ? 'Objectives & planned method' : 'Read more about the method';
        var method = list(it.method).length ? '<details><summary>' + mlabel + '</summary>' + ul(it.method) + '</details>' : '';
        var link = safeUrl(it.link) ? '<div class="pub-link"><a class="p-link" href="' + esc(safeUrl(it.link)) + '" target="_blank" rel="noopener noreferrer">Read the paper <i>' + ARROW + '</i></a></div>' : '';
        return '<article class="pub reveal"><div class="pub-ico">' + ICONS.doc + '</div><div>' +
          '<div class="pub-meta"><span class="pill">' + esc(it.type) + '</span>' +
            (it.status ? '<span class="status' + (/progress|review/i.test(it.status) ? ' live' : '') + '">' + esc(it.status) + '</span>' : '') +
            '<span>' + esc(it.venue) + '</span></div>' +
          '<h3>' + esc(it.title) + '</h3><p class="authors">' + fmt(it.authors) + ' <span>· ' + esc(it.affiliation) + '</span></p>' +
          (it.summary ? '<p class="pub-sum">' + fmt(it.summary) + '</p>' : '') + stats + method + chips(it.tags) + link + '</div>' +
          (list(it.slides).length ? '<div class="pub-deck"><h4>' + esc(it.slides_label || 'Presentation slides') + '</h4>' + renderViewer(it.slides, it.slides_pdf, it.title) + '</div>' : '') +
          '</article>';
      }).join('') + '</div></section>';
  }

  function renderContact(c, p) {
    var rows = '';
    if (p.email) rows += '<a class="c-item" href="mailto:' + esc(p.email) + '"><span class="c-ico">' + ICONS.mail + '</span><div><small>Email</small><span>' + esc(p.email) + '</span></div></a>';
    if (p.phone) rows += '<a class="c-item" href="tel:' + esc(String(p.phone).replace(/[^\d+]/g, '')) + '"><span class="c-ico">' + ICONS.phone + '</span><div><small>Phone</small><span>' + esc(p.phone) + '</span></div></a>';
    if (safeUrl(p.linkedin)) rows += '<a class="c-item" href="' + esc(safeUrl(p.linkedin)) + '" target="_blank" rel="noopener noreferrer"><span class="c-ico">' + ICONS.linkedin + '</span><div><small>LinkedIn</small><span>' + esc(String(p.linkedin).replace(/^https?:\/\/(www\.)?/, '')) + '</span></div></a>';
    if (safeUrl(p.github)) rows += '<a class="c-item" href="' + esc(safeUrl(p.github)) + '" target="_blank" rel="noopener noreferrer"><span class="c-ico">' + ICONS.github + '</span><div><small>GitHub</small><span>' + esc(String(p.github).replace(/^https?:\/\//, '')) + '</span></div></a>';
    return '<section id="contact" class="pt0"><div class="wrap"><div class="contact-box reveal"><div>' +
      '<span class="eyebrow">' + esc(c.eyebrow) + '</span><h2>' + fmt(c.heading) + '</h2><p>' + fmt(c.text) + '</p>' +
      '<div class="c-list">' + rows + '</div></div>' +
      '<form id="form" novalidate>' +
        '<label>Your name<input name="name" required maxlength="80" autocomplete="name" placeholder="Jane Doe"></label>' +
        '<label>Your email<input name="email" type="email" required maxlength="120" autocomplete="email" placeholder="jane@company.com"></label>' +
        '<label>Message<textarea name="message" required minlength="10" maxlength="2000" placeholder="Hi, I\'d like to talk about…"></textarea></label>' +
        // honeypot: invisible to people, bots fill it in and get ignored
        '<input class="hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button class="btn dark" type="submit">Send message <span class="arr"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14m-6-6l6 6-6 6"/></svg></span></button>' +
        '<div class="form-msg" role="status" aria-live="polite" hidden></div>' +
        '<small class="note">' + (validKey(c.form_key) ? 'Your message goes straight to my inbox. I usually reply within 1–2 days.' : 'Opens your email app with the message filled in.') + '</small>' +
      '</form></div></div></section>';
  }

  // ---------- behaviour ----------
  function wire(data) {
    var p = data.profile || {};
    document.getElementById('theme').addEventListener('click', function () {
      var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      var next = cur === 'dark' ? 'light' : 'dark'; root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
    });
    var links = document.getElementById('links');
    document.getElementById('menu').addEventListener('click', function () { links.classList.toggle('open'); });
    links.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { links.classList.remove('open'); }); });

    // image focus points (set through CSSOM, which the CSP allows)
    document.querySelectorAll('img[data-focus]').forEach(function (img) { if (img.dataset.focus) img.style.objectPosition = img.dataset.focus; });

    initDecks();
    initVideos();
    initFounder();

    function fillRings(scope) { scope.querySelectorAll('.ring-ico').forEach(function (r) { r.querySelector('.val').style.strokeDashoffset = 264 * (1 - r.dataset.w / 100); }); }
    document.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () {
        document.querySelectorAll('.tab').forEach(function (x) { x.setAttribute('aria-selected', x === t); });
        document.querySelectorAll('[data-group]').forEach(function (g) {
          var on = g.dataset.group === t.dataset.tab; g.classList.toggle('hidden', !on); if (on) setTimeout(function () { fillRings(g); }, 30);
        });
      });
    });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .1 });
      document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
      var sk = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { fillRings(e.target); sk.unobserve(e.target); } }); }, { threshold: .15 });
      document.querySelectorAll('[data-group]').forEach(function (g) { sk.observe(g); });
    } else {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      document.querySelectorAll('[data-group]').forEach(fillRings);
    }
    var secs = [].slice.call(document.querySelectorAll('section[id]')), navA = [].slice.call(links.querySelectorAll('a'));
    addEventListener('scroll', function () {
      var y = scrollY + 120, cur = '';
      secs.forEach(function (s) { if (s.offsetTop <= y) cur = s.id; });
      navA.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + cur); });
    }, { passive: true });

    var form = document.getElementById('form');
    var key = String((data.contact || {}).form_key || '').trim();
    if (form) form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.reportValidity()) return;
      var name = form.name.value.trim().slice(0, 80), email = form.email.value.trim().slice(0, 120), msg = form.message.value.trim().slice(0, 2000);
      var out = form.querySelector('.form-msg'), btn = form.querySelector('button[type=submit]');
      function say(text, ok) { out.textContent = text; out.className = 'form-msg ' + (ok ? 'ok' : 'err'); out.hidden = false; }
      if (form.botcheck.checked) { say('✅ Message sent! Thank you.', true); form.reset(); return; }   // bot: pretend success, send nothing
      if (!validKey(key)) {
        if (!p.email) return;
        var body = msg + '\n\n— ' + name + ' (' + email + ')';
        location.href = 'mailto:' + encodeURIComponent(p.email).replace('%40', '@') + '?subject=' + encodeURIComponent('Website message from ' + name) + '&body=' + encodeURIComponent(body);
        return;
      }
      // send straight to the inbox through Web3Forms (the access key is public by design; it only allows sending to your own email)
      var last = 0; try { last = Number(sessionStorage.getItem('pk-sent') || 0); } catch (e) {}
      if (Date.now() - last < 30000) { say('Please wait a few seconds before sending another message.', false); return; }
      btn.disabled = true; btn.classList.add('sending'); say('Sending…', true);
      var ctrl = 'AbortController' in window ? new AbortController() : null, timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);
      fetch('https://api.web3forms.com/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ access_key: key, subject: 'Website message from ' + name, from_name: 'Portfolio website', name: name, email: email, replyto: email, message: msg }),
        signal: ctrl ? ctrl.signal : undefined, credentials: 'omit', referrerPolicy: 'strict-origin-when-cross-origin'
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === false) throw new Error(j.message || r.status); }); })
        .then(function () {
          try { sessionStorage.setItem('pk-sent', String(Date.now())); } catch (e) {}
          form.reset(); say('✅ Message sent! Thank you, ' + name.split(' ')[0] + '. I\'ll reply to ' + email + ' soon.', true);
        })
        .catch(function () {
          say('⚠️ Sorry, the message could not be sent. Please email me directly' + (p.email ? ' at ' + p.email : '') + '.', false);
        })
        .then(function () { clearTimeout(timer); btn.disabled = false; btn.classList.remove('sending'); });
    });
    document.getElementById('yr').textContent = new Date().getFullYear();
  }

  // ---------- Kumar Math founder section ----------
  // gear outline with n teeth, centred at (cx, cy)
  function gearPath(cx, cy, n, rOut, rRoot) {
    var d = '', step = Math.PI * 2 / n, half = step / 2, tip = step * 0.2, base = step * 0.3;
    for (var i = 0; i < n; i++) {
      var a = i * step - Math.PI / 2;
      var pts = [[rRoot, a - base], [rOut, a - tip], [rOut, a + tip], [rRoot, a + base], [rRoot, a + half]];
      pts.forEach(function (q, j) { var x = (cx + q[0] * Math.cos(q[1])).toFixed(1), y = (cy + q[0] * Math.sin(q[1])).toFixed(1); d += (i === 0 && j === 0 ? 'M' : 'L') + x + ' ' + y + ' '; });
    }
    return d + 'Z';
  }
  function kmLogoSvg() {
    var title = 'KUMAR MATH'.split('').map(function (ch, i) { return '<tspan class="km-ch" data-i="' + i + '">' + (ch === ' ' ? '&#160;' : ch) + '</tspan>'; }).join('');
    return '<svg class="km-logo" viewBox="0 0 760 430" role="img" aria-label="Kumar Math logo: Be rational! Get real!">' +
      '<g class="km-k"><text x="60" y="292" class="km-letter">K</text></g>' +
      '<g class="km-m"><text x="470" y="292" class="km-letter">M</text></g>' +
      '<g class="km-gear"><path d="' + gearPath(380, 190, 10, 128, 100) + '" class="km-gear-body"/>' +
        '<circle cx="380" cy="190" r="70" class="km-gear-hole"/></g>' +
      '<text x="380" y="214" text-anchor="middle" class="km-pi">π</text>' +
      '<text x="380" y="372" text-anchor="middle" class="km-title">' + title + '</text>' +
      '<g class="km-tag"><text x="290" y="414" text-anchor="end">BE RATIONAL!</text><circle cx="380" cy="409" r="6" class="km-dot"/><text x="470" y="414">GET REAL!</text></g>' +
    '</svg>';
  }
  // formulas the "teacher" writes on the board
  var CHALK = [
    { t: 'sin²θ + cos²θ = 1', x: 3, y: 12, r: -4 },
    { t: 'F = ma', x: 80, y: 10, r: 3 },
    { t: '∫ x dx = x²⁄2 + C', x: 70, y: 88, r: -3 },
    { t: 'a² + b² = c²', x: 24, y: 88, r: 2 },
    { t: 'PV = nRT', x: 44, y: 95, r: -2 },
    { t: 'dy⁄dx', x: 90, y: 52, r: 6 }
  ];
  var SYMBOLS = ['π', 'Σ', '√', '∞', '∫', 'Δ', 'θ', '÷', '×', '%', 'λ', 'α', 'x²', '∂', '≈', 'μ'];
  function renderFounder(f) {
    if (!f || f.enabled === false) return '';
    var app = safeUrl(f.app_link);
    var stats = list(f.stats).map(function (s) { return '<div><strong>' + esc(s.value) + '</strong><span>' + esc(s.label) + '</span></div>'; }).join('');
    var chalk = CHALK.map(function (c, i) {
      return '<span class="chalk-f" data-i="' + i + '"><svg viewBox="0 0 320 60" aria-hidden="true"><text x="4" y="44">' + esc(c.t) + '</text></svg></span>';
    }).join('');
    return '<section id="kumar-math" class="km-sec">' +
      '<div class="board" aria-hidden="true">' + chalk +
        '<svg class="chalk-graph" viewBox="0 0 220 130"><path class="ax" d="M10 65H212M18 122V8"/><path class="ax tick" d="M60 61v8M110 61v8M160 61v8M14 25h8M14 105h8"/>' +
          '<path class="wave" d="M18 65 C 38 10, 58 10, 68 65 S 98 120, 118 65 S 148 10, 168 65 S 198 120, 210 70"/><text x="196" y="58">x</text><text x="24" y="16">y</text></svg>' +
        '<div class="floaters"></div>' +
      '</div>' +
      '<div class="wrap km-grid">' +
        '<div class="km-card reveal">' + kmLogoSvg() + '<span class="chalk-stick" aria-hidden="true"></span></div>' +
        '<div class="km-text reveal">' +
          '<span class="eyebrow">' + esc(f.eyebrow || 'Founder') + '</span>' +
          '<h2>' + fmt(f.heading) + '</h2>' +
          (f.tagline ? '<p class="km-motto">“' + esc(f.tagline) + '”</p>' : '') +
          list(f.paragraphs).map(function (t) { return '<p>' + fmt(t) + '</p>'; }).join('') +
          chips(f.subjects) +
          (stats ? '<div class="km-stats">' + stats + '</div>' : '') +
          '<div class="km-cta">' +
            (app ? '<a class="btn amber km-app" href="' + esc(app) + '" target="_blank" rel="noopener noreferrer">' + esc(f.app_label || 'Open the Kumar Math app') + ' <span class="arr">' + ARROW.replace(/14/g, '16') + '</span></a>'
                 : '<span class="km-soon">📱 App link coming soon</span>') +
          '</div>' +
        '</div>' +
      '</div></section>';
  }
  function initFounder() {
    var sec = document.getElementById('kumar-math');
    if (!sec) return;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    // positions and timings are set through CSSOM (inline style attributes are blocked by the CSP)
    sec.querySelectorAll('.chalk-f').forEach(function (el) {
      var c = CHALK[Number(el.dataset.i)];
      el.style.setProperty('--x', c.x + '%'); el.style.setProperty('--y', c.y + '%');
      el.style.setProperty('--r', c.r + 'deg'); el.style.setProperty('--d', (Number(el.dataset.i) * 0.9) + 's');
    });
    sec.querySelectorAll('.km-ch').forEach(function (el) { el.style.setProperty('--i', el.dataset.i); });
    // floating math symbols drifting up the chalkboard
    var fl = sec.querySelector('.floaters');
    if (fl && !reduce) {
      for (var i = 0; i < 18; i++) {
        var s = document.createElement('span');
        s.textContent = SYMBOLS[i % SYMBOLS.length];
        s.style.setProperty('--x', (Math.random() * 96 + 2).toFixed(1) + '%');
        s.style.setProperty('--s', (0.9 + Math.random() * 1.6).toFixed(2) + 'rem');
        s.style.setProperty('--t', (14 + Math.random() * 16).toFixed(1) + 's');
        s.style.setProperty('--delay', (-Math.random() * 25).toFixed(1) + 's');
        s.style.setProperty('--o', (0.08 + Math.random() * 0.14).toFixed(2));
        fl.appendChild(s);
      }
    }
    function play() { sec.classList.add('play'); }
    if (reduce || !('IntersectionObserver' in window)) { play(); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { play(); io.disconnect(); } }); }, { threshold: .25 });
    io.observe(sec);
  }

  // ---------- visitor counter (GoatCounter: free, open source, no cookies) ----------
  // Counting uses a tiny image request, so no third-party script ever runs on this page.
  // Add ?nocount=1 to the URL once on your own devices to stop counting your own visits (?nocount=0 to undo).
  function initCounter(a) {
    var code = String(a.goatcounter_code || '').trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(code)) return;
    var base = 'https://' + code + '.goatcounter.com';
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || location.protocol === 'file:';
    var skip = false;
    try {
      var q = new URLSearchParams(location.search).get('nocount');
      if (q === '1') localStorage.setItem('pk-nocount', '1');
      if (q === '0') localStorage.removeItem('pk-nocount');
      skip = localStorage.getItem('pk-nocount') === '1';
    } catch (e) {}
    var bot = navigator.webdriver || /bot|crawl|spider|headless|lighthouse/i.test(navigator.userAgent);
    if (!local && !skip && !bot) {
      var ref = document.referrer && document.referrer.indexOf(location.origin) !== 0 ? document.referrer : '';
      var px = new Image();
      px.referrerPolicy = 'no-referrer-when-downgrade';
      px.src = base + '/count?p=' + encodeURIComponent(location.pathname || '/') +
        '&t=' + encodeURIComponent(document.title) + '&r=' + encodeURIComponent(ref) +
        '&s=' + encodeURIComponent([screen.width, screen.height, window.devicePixelRatio || 1].join(',')) +
        '&rnd=' + Math.random().toString(36).slice(2);
    }
    if (a.show_counter === false) return;
    var label = a.counter_label || 'views';
    var spots = [].slice.call(document.querySelectorAll('[data-views]'));
    var shown = 0;
    function draw(total) {
      var n = parseInt(String(total).replace(/[^\d]/g, ''), 10);
      if (!isFinite(n)) return;
      var from = shown, t0 = performance.now(), dur = shown ? 600 : 1200;
      shown = n;
      function paint(v) { spots.forEach(function (s) { s.querySelector('b').textContent = v.toLocaleString(); s.querySelector('em').textContent = ' ' + label; s.hidden = false; }); }
      // background tabs pause animations, so show the final number straight away there
      if (document.hidden || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) { paint(n); return; }
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur);
        paint(Math.round(from + (n - from) * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
      setTimeout(function () { paint(n); }, dur + 100);   // safety net: always end on the exact number
    }
    function load() {
      fetch(base + '/counter/TOTAL.json', { cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer' })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) { if (j && j.count != null) draw(j.count); })
        .catch(function () {});
    }
    setTimeout(load, local || skip ? 0 : 1500);   // give our own visit a moment to be counted
    setInterval(function () { if (!document.hidden) load(); }, 60000);   // live refresh every minute
    document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
  }

  function render(data) {
    var p = data.profile || {};
    document.title = p.name || document.title;
    document.getElementById('logo-letter').textContent = p.logo_letter || (p.name || 'P').charAt(0);
    document.getElementById('logo-name').textContent = p.name || '';
    document.getElementById('foot-name').textContent = p.name || '';
    document.getElementById('foot-sign').textContent = p.name || '';
    document.getElementById('foot-loc').textContent = p.location || '';
    document.getElementById('app').innerHTML =
      renderHero(p, data.founder) + renderMarquee(data.marquee || {}) + renderAbout(data.about || {}, p) + renderFounder(data.founder) +
      renderSkills(data.skills || {}) + renderExperience(data.experience || {}) +
      renderProjects(data.projects || {}) + renderPublications(data.publications || {}) + renderContact(data.contact || {}, p);
    // hide nav links for empty sections
    document.querySelectorAll('#links a[href^="#"]').forEach(function (a) {
      if (!document.querySelector(a.getAttribute('href'))) a.parentNode.hidden = true;
    });
    wire(data);
    initCounter(data.analytics || {});
    if (location.hash) { var t = document.querySelector(location.hash.replace(/[^#\w-]/g, '')); if (t) t.scrollIntoView(); }
  }

  fetch('content/site.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function () {
      document.getElementById('app').innerHTML = '<div class="loading">Sorry, the page could not load. Please refresh.</div>';
    });
})();
