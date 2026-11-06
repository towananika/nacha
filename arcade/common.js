/* NACHA mini games: shared art + helpers. All art is drawn here (own SVG), no official images are embedded. */
(function () {
  "use strict";
  var NA = window.NA = {};
  NA.X = "https://x.com/nacha_project";
  NA.IG = "https://www.instagram.com/nacha_project/";
  NA.HANDLE = "@nacha_project";

  /* ---------- storage ---------- */
  NA.store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- characters ---------- */
  NA.GODS = [
    { id: "nacha",   name: "NACHA",         line: "Gives dreams, hope and courage." },
    { id: "kunsim",  name: "White Kun Sim", line: "Leads the team with kindness." },
    { id: "sousang", name: "Preah Sousang", line: "Brings a calm smile and long life." },
    { id: "fdo",     name: "Fdo King",      line: "Burns worries away with sacred fire." }
  ];

  var C = { skin: "#f8d3b0", skinD: "#eab994", hair: "#2b1b18", hairHi: "#4b3029", gold: "#e6b43a", ink: "#1b1416" };

  function bow(x, y, col, sway, flip) {
    // red bow at the bun base + ribbon tails
    var s = flip ? -1 : 1;
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<path d="M0 0 C' + (-14 * s) + ' ' + (4 + sway) + ' ' + (-24 * s) + ' ' + (16 + sway) + ' ' + (-34 * s) + ' ' + (22 + sway * 1.4) +
      ' L' + (-28 * s) + ' ' + (26 + sway * 1.4) + ' C' + (-20 * s) + ' ' + (14 + sway) + ' ' + (-10 * s) + ' ' + (10) + ' 0 6 Z" fill="' + col + '"/>' +
      '<path d="M0 0 L' + (-8 * s) + ' -7 L' + (-8 * s) + ' 7 Z M0 0 L' + (8 * s) + ' -7 L' + (8 * s) + ' 7 Z" fill="' + col + '"/>' +
      '<circle r="3.4" fill="#a82a21"/></g>';
  }

  function sleeve(x, y, ang, o, hand) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + ang + ')">' +
      '<path d="M-9 -2 Q-12 18 -11 32 L11 32 Q12 18 9 -2 Z" fill="' + o.jacket + '"/>' +
      '<path d="M-11 31 L11 31 L11 36 L-11 36 Z" fill="' + o.ink2 + '"/><path d="M-11 31 H11" stroke="' + o.trim + '" stroke-width="2"/>' +
      '<path d="M-3 6 q7 4 1 9 q-6 5 2 11" stroke="' + o.trim + '" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      (hand === false ? "" : '<circle cx="0" cy="40" r="6.5" fill="' + C.skin + '"/>') + '</g>';
  }

  function leg(x, lift, o) {
    var top = 118, bot = 156 - lift;
    return '<path d="M' + (x - 14) + ' ' + top + ' L' + (x + 14) + ' ' + top + ' L' + (x + 17) + ' ' + bot + ' L' + (x - 17) + ' ' + bot + ' Z" fill="' + o.pants + '"/>' +
      '<path d="M' + x + ' ' + (top + 8) + ' L' + x + ' ' + (bot - 4) + '" stroke="#ffffff14" stroke-width="2"/>' +
      '<ellipse cx="' + x + '" cy="' + (bot + 4) + '" rx="17" ry="9" fill="#17110f"/>' +
      '<ellipse cx="' + x + '" cy="' + (bot + 10) + '" rx="17" ry="3.6" fill="#f3ece2"/>';
  }

  // o: jacket, trim, ribbon, pants, tassel, mood (smirk|smile|pout|sleepy|stern), pose (down|wave|cross|phone|cheer), leg (stand|a|b|jump), tail (0..1), cap
  NA.nacha = function (o) {
    o = Object.assign({ jacket: "#c8372d", trim: "#e6b43a", ribbon: "#df3b2f", pants: "#1a1a1d", tassel: "#fbf6ee", ink2: "#1a1a1d",
      mood: "smirk", pose: "down", leg: "stand", tail: 0, charm: true }, o || {});
    var sw = Math.sin(o.tail * 6.283) * 5;
    var lL = 0, lR = 0;
    if (o.leg === "a") lR = 14; else if (o.leg === "b") lL = 14; else if (o.leg === "jump") { lL = 10; lR = 16; }
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -8 148 188">';
    // ribbon tails (behind)
    s += bow(36, 20, o.ribbon, sw, false) + bow(88, 20, o.ribbon, sw * 0.8, false);
    // legs
    s += leg(46, lL, o) + leg(74, lR, o);
    // jacket skirts
    s += '<path d="M34 100 L86 100 L96 132 Q60 142 24 132 Z" fill="' + o.jacket + '"/>' +
      '<path d="M24 132 Q60 142 96 132" stroke="' + o.trim + '" stroke-width="3" fill="none"/>' +
      '<path d="M60 108 L60 138" stroke="' + o.trim + '" stroke-width="2"/>';
    // arms (behind torso when down)
    if (o.pose === "down" || o.pose === "wave" || o.pose === "phone" || o.pose === "cheer") {
      s += sleeve(34, 72, 12, o);
    }
    // torso
    s += '<path d="M34 66 Q60 58 86 66 L92 108 Q60 116 28 108 Z" fill="' + o.jacket + '"/>' +
      '<path d="M50 62 L70 62 L66 72 L54 72 Z" fill="' + o.jacket + '" stroke="' + o.trim + '" stroke-width="2"/>' +
      '<path d="M54 74 q6 4 12 0 M57 84 q3 3 6 0 M57 93 q3 3 6 0" stroke="' + o.trim + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
      '<path d="M34 66 L28 108 M86 66 L92 108" stroke="' + o.trim + '" stroke-width="2.4"/>';
    // sash + knot + tassel
    s += '<rect x="29" y="98" width="62" height="11" rx="2" fill="' + o.ink2 + '"/><path d="M29 100 H91 M29 107 H91" stroke="' + o.trim + '" stroke-width="1.4"/>' +
      '<circle cx="60" cy="104" r="6" fill="' + o.trim + '"/><circle cx="60" cy="104" r="2.6" fill="#b8431f"/>' +
      '<path d="M60 108 L55 134 L65 134 Z" fill="' + o.tassel + '" stroke="#e5dccd" stroke-width="1"/><circle cx="60" cy="109" r="2.2" fill="' + o.trim + '"/>';
    if (o.charm) s += '<g transform="translate(86 112) rotate(10)"><rect x="-6" y="0" width="12" height="16" rx="2" fill="#c8372d" stroke="' + o.trim + '" stroke-width="1.2"/><circle cx="0" cy="8" r="3" fill="none" stroke="' + o.trim + '" stroke-width="1.2"/></g>';
    // front arm
    if (o.pose === "down") s += sleeve(86, 72, -12, o);
    else if (o.pose === "wave") s += sleeve(86, 72, -150, o);
    else if (o.pose === "cheer") s += sleeve(86, 72, -165, o) + sleeve(34, 72, 165, o);
    else if (o.pose === "phone") {
      s += sleeve(86, 72, -125, o);
      s += '<g transform="translate(100 60) rotate(12)"><rect x="-8" y="-15" width="16" height="28" rx="3" fill="#25272b"/><rect x="-6" y="-12" width="12" height="22" rx="1.5" fill="#f2e8da"/><path d="M0 -8 q-3 -4 -1 -6 q2 0 1 3 q1 -3 3 -3 q2 2 -1 6 Z" fill="' + o.jacket + '" transform="translate(0 7) scale(.8)"/></g>';
    } else if (o.pose === "cross") {
      s += '<g transform="translate(60 84) rotate(-8)"><rect x="-30" y="-8" width="60" height="16" rx="8" fill="' + o.jacket + '"/><path d="M-30 0 h6 M24 0 h6" stroke="' + o.trim + '" stroke-width="2"/>' +
        '<rect x="-30" y="-8" width="9" height="16" rx="4" fill="' + o.ink2 + '"/><rect x="21" y="-8" width="9" height="16" rx="4" fill="' + o.ink2 + '"/></g>' +
        '<circle cx="34" cy="90" r="6" fill="' + C.skin + '"/><circle cx="86" cy="80" r="6" fill="' + C.skin + '"/>';
    }
    // head: buns
    s += '<circle cx="27" cy="12" r="16" fill="' + C.hair + '"/><circle cx="93" cy="12" r="16" fill="' + C.hair + '"/>' +
      '<path d="M18 6 q8 -8 18 -2" stroke="' + C.hairHi + '" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M84 4 q8 -6 18 2" stroke="' + C.hairHi + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
    // face
    s += '<circle cx="23" cy="44" r="6" fill="' + C.skin + '"/><circle cx="97" cy="44" r="6" fill="' + C.skin + '"/>' +
      '<path d="M22 40 C22 14 98 14 98 40 C98 62 80 70 60 70 C40 70 22 62 22 40 Z" fill="' + C.skin + '"/>';
    // hair cap + bangs
    s += '<path d="M20 42 C16 10 104 10 100 42 L96 32 L88 46 L80 28 L70 44 L60 26 L50 44 L40 28 L32 46 L24 32 Z" fill="' + C.hair + '"/>' +
      '<path d="M44 20 q10 -6 24 -2" stroke="' + C.hairHi + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
    // bun ribbons on top of buns
    s += '<path d="M12 22 Q27 30 42 20 L42 27 Q27 36 12 28 Z" fill="' + o.ribbon + '"/><path d="M78 20 Q93 30 108 22 L108 28 Q93 36 78 27 Z" fill="' + o.ribbon + '"/>';
    // eyes + brows + mouth
    var m = o.mood, eyeY = 48, browL, browR, mouth, eyes;
    var eye = function (cx, closed) {
      if (closed) return '<path d="M' + (cx - 8) + ' ' + eyeY + ' q8 7 16 0" stroke="' + C.ink + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
      return '<ellipse cx="' + cx + '" cy="' + eyeY + '" rx="8.6" ry="10" fill="#fff"/><ellipse cx="' + cx + '" cy="' + (eyeY + 1) + '" rx="7" ry="8.8" fill="#e8851f"/>' +
        '<ellipse cx="' + cx + '" cy="' + (eyeY + 2) + '" rx="4" ry="5.6" fill="#5a2a10"/><circle cx="' + (cx - 2.6) + '" cy="' + (eyeY - 3) + '" r="2.6" fill="#fff"/><circle cx="' + (cx + 2.5) + '" cy="' + (eyeY + 4) + '" r="1.3" fill="#fff"/>';
    };
    var closed = (m === "sleepy");
    eyes = eye(44, closed) + eye(76, closed);
    if (m === "pout") { browL = "M34 36 L52 41"; browR = "M86 36 L68 41"; mouth = '<path d="M54 61 q6 -5 12 0" stroke="#8a4a3a" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; }
    else if (m === "smile") { browL = "M34 37 L52 38"; browR = "M86 37 L68 38"; mouth = '<path d="M50 57 q10 10 20 0 q-10 4 -20 0 Z" fill="#a64a3a" stroke="#8a3a2a" stroke-width="1.6" stroke-linejoin="round"/>'; }
    else if (m === "stern") { browL = "M33 34 L52 42"; browR = "M87 34 L68 42"; mouth = '<path d="M53 61 h14" stroke="#8a4a3a" stroke-width="2.6" stroke-linecap="round"/>'; }
    else if (m === "sleepy") { browL = "M35 38 L52 38"; browR = "M85 38 L68 38"; mouth = '<path d="M55 60 q5 3 10 0" stroke="#8a4a3a" stroke-width="2.6" fill="none" stroke-linecap="round"/>'; }
    else { browL = "M34 36 L52 40"; browR = "M86 36 L68 40"; mouth = '<path d="M52 58 q10 8 17 -2" stroke="#8a4a3a" stroke-width="2.8" fill="none" stroke-linecap="round"/>'; }
    s += '<path d="' + browL + '" stroke="' + C.hair + '" stroke-width="4.4" stroke-linecap="round"/><path d="' + browR + '" stroke="' + C.hair + '" stroke-width="4.4" stroke-linecap="round"/>' +
      eyes + '<ellipse cx="36" cy="58" rx="5" ry="3" fill="#f2998a" opacity=".55"/><ellipse cx="84" cy="58" rx="5" ry="3" fill="#f2998a" opacity=".55"/>' + mouth;
    if (m === "sleepy") s += '<text x="98" y="22" font-family="Lilita One,sans-serif" font-size="16" fill="#e9c9a4">z</text><text x="106" y="12" font-family="Lilita One,sans-serif" font-size="11" fill="#e9c9a4">z</text>';
    return s + "</svg>";
  };

  // busts of the other three gods (viewBox 100x100)
  NA.god = function (id) {
    var h = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">';
    if (id === "nacha") {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -8 120 104" preserveAspectRatio="xMidYMid slice"><rect x="0" y="0" width="120" height="120" fill="#f3c98a"/>' +
        NA.nacha({ mood: "smile" }).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "") + "</svg>";
    }
    if (id === "kunsim") {
      h += '<rect width="100" height="100" fill="#f3d6e6"/>' +
        '<path d="M14 100 Q16 70 50 66 Q84 70 86 100 Z" fill="#fff7fb" stroke="#f0bcd3" stroke-width="2"/><path d="M36 100 Q50 80 64 100" fill="#f7c6dc"/>' +
        '<path d="M18 50 Q14 14 50 12 Q86 14 82 50 L84 76 Q70 84 66 72 L34 72 Q30 84 16 76 Z" fill="#1d2549"/>' +
        '<path d="M26 44 Q50 70 74 44 Q76 30 50 28 Q24 30 26 44 Z" fill="#f9dcc4"/>' +
        '<path d="M20 44 Q18 20 50 18 Q82 20 80 44 Q70 26 50 28 Q30 26 20 44 Z" fill="#1d2549"/>' +
        '<ellipse cx="40" cy="46" rx="5" ry="6" fill="#fff"/><ellipse cx="60" cy="46" rx="5" ry="6" fill="#fff"/><circle cx="40" cy="47" r="3.6" fill="#3a8ee0"/><circle cx="60" cy="47" r="3.6" fill="#3a8ee0"/><circle cx="39" cy="45" r="1.2" fill="#fff"/><circle cx="59" cy="45" r="1.2" fill="#fff"/>' +
        '<path d="M45 58 q5 4 10 0" stroke="#c0736a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M28 22 Q50 2 72 22" stroke="#e6b43a" stroke-width="5" fill="none"/><circle cx="50" cy="10" r="5" fill="#e6b43a"/><circle cx="50" cy="10" r="2" fill="#5ab4e8"/>' +
        '<g transform="translate(80 94) scale(.75)"><path d="M0 0 q-14 -4 -16 -16 q12 2 16 16 q4 -14 16 -16 q-2 12 -16 16 Z" fill="#f7a8c8" stroke="#e57aa5" stroke-width="1.4"/></g>';
    } else if (id === "sousang") {
      h += '<rect width="100" height="100" fill="#cfe3d4"/>' +
        '<path d="M10 100 Q14 70 50 66 Q86 70 90 100 Z" fill="#3c5a49"/><path d="M40 70 L50 100 L60 70" fill="#2c4538"/>' +
        '<path d="M32 40 Q50 80 68 40 L72 58 Q70 92 50 96 Q30 92 28 58 Z" fill="#f4f0ea"/>' +
        '<path d="M28 44 Q26 16 50 14 Q74 16 72 44 Q66 28 50 28 Q34 28 28 44 Z" fill="#f4f0ea"/>' +
        '<ellipse cx="50" cy="42" rx="19" ry="17" fill="#f6d9bd"/>' +
        '<path d="M36 40 q5 -4 10 0 M54 40 q5 -4 10 0" stroke="#4a3a30" stroke-width="2.4" fill="none" stroke-linecap="round"/>' +
        '<path d="M44 50 q6 5 12 0" stroke="#b5685a" stroke-width="2" fill="none" stroke-linecap="round"/>' +
        '<path d="M30 40 q-4 -8 6 -12 M70 40 q4 -8 -6 -12" stroke="#f4f0ea" stroke-width="5" fill="none" stroke-linecap="round"/>' +
        '<g fill="#c8372d"><circle cx="38" cy="74" r="3.2"/><circle cx="46" cy="79" r="3.2"/><circle cx="55" cy="80" r="3.2"/><circle cx="63" cy="75" r="3.2"/></g>' +
        '<path d="M86 30 Q92 60 84 98" stroke="#8a5a2c" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="86" cy="28" r="6" fill="#8a5a2c"/><circle cx="86" cy="40" r="3" fill="#e6b43a"/>';
    } else {
      h += '<rect width="100" height="100" fill="#3a1a2a"/>' +
        '<path d="M8 100 Q10 40 24 20 Q20 44 34 50 Q28 20 44 6 Q42 30 54 40 Q56 16 72 4 Q70 30 82 36 Q94 56 92 100 Z" fill="#ff7a1a" opacity=".9"/>' +
        '<path d="M22 100 Q22 78 50 74 Q78 78 78 100 Z" fill="#3b2a4d"/><path d="M26 92 Q50 84 74 92" stroke="#e6b43a" stroke-width="3" fill="none"/><path d="M34 100 L38 82 M66 100 L62 82" stroke="#e6b43a" stroke-width="2.4"/>' +
        '<ellipse cx="50" cy="46" rx="21" ry="22" fill="#8a5232"/>' +
        '<g fill="#2a1710"><circle cx="30" cy="30" r="9"/><circle cx="42" cy="22" r="9"/><circle cx="56" cy="21" r="9"/><circle cx="69" cy="29" r="9"/><circle cx="73" cy="42" r="6"/><circle cx="27" cy="42" r="6"/></g>' +
        '<path d="M36 40 L46 44 M64 40 L54 44" stroke="#2a1710" stroke-width="3.6" stroke-linecap="round"/>' +
        '<ellipse cx="41" cy="48" rx="5" ry="5.4" fill="#ffd85a"/><ellipse cx="59" cy="48" rx="5" ry="5.4" fill="#ffd85a"/><circle cx="41" cy="48.6" r="2.4" fill="#4a1d0a"/><circle cx="59" cy="48.6" r="2.4" fill="#4a1d0a"/>' +
        '<path d="M44 60 h12" stroke="#4a1d0a" stroke-width="2.6" stroke-linecap="round"/><path d="M50 30 l-3 -8 l6 0 Z" fill="#c8372d"/>';
    }
    return h + "</svg>";
  };

  NA.dataURL = function (svg) { return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg); };
  NA.loadSVG = function (svg) {
    var vb = /viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/.exec(svg);
    if (vb && !/^<svg[^>]*\swidth=/.test(svg)) svg = svg.replace("<svg ", '<svg width="' + (vb[3] * 8) + '" height="' + (vb[4] * 8) + '" ');
    return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(i); }; i.src = NA.dataURL(svg); });
  };

  /* ---------- backdrop: sunrise sky, Angkor-style towers, clouds, red leaves ---------- */
  function tower(ctx, x, base, w, h, col) {
    ctx.fillStyle = col;
    var tiers = 5, tw = w, y = base;
    ctx.beginPath(); ctx.rect(x - w * 0.55, base - h * 0.08, w * 1.1, h * 0.08); ctx.fill();
    for (var i = 0; i < tiers; i++) {
      var th = h * (0.84 / tiers);
      ctx.beginPath();
      ctx.moveTo(x - tw / 2, y - h * 0.08); ctx.lineTo(x - tw / 2 + 3, y - h * 0.08 - th); ctx.lineTo(x + tw / 2 - 3, y - h * 0.08 - th); ctx.lineTo(x + tw / 2, y - h * 0.08);
      ctx.closePath(); ctx.fill();
      y -= th; tw *= 0.78;
    }
    ctx.beginPath(); ctx.ellipse(x, base - h * 0.92, w * 0.07, h * 0.1, 0, 0, 6.283); ctx.fill();
  }
  var THEMES = {
    sun:   { stops: ["#4b3270", "#b8587a", "#f59a6a", "#fcd9a2"], glow: "#fff2c4", disc: "#fff0c8", discY: 0.56, towers: ["#7a4c80", "#5b3470", "#3f2158"], cloud: "rgba(255,240,220,.55)" },
    night: { stops: ["#0d0818", "#2a1033", "#6b1f3a", "#b13a35"], glow: "#ff9a7a", disc: "#e8483a", discY: 0.42, towers: ["#4a1d3a", "#2e1230", "#1a0b1f"], cloud: "rgba(255,170,150,.18)" },
    cream: { flat: "#fbf1df", towers: ["#e9d3b0", "#dcc197", "#cdb084"], disc: "#f6cdbd", discY: 0.38, cloud: "rgba(255,255,255,.7)" }
  };
  NA.drawBG = function (ctx, w, h, scroll, t, theme) {
    var T = THEMES[theme || "sun"] || THEMES.sun;
    if (T.flat) { ctx.fillStyle = T.flat; ctx.fillRect(0, 0, w, h); }
    else {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, T.stops[0]); g.addColorStop(0.35, T.stops[1]); g.addColorStop(0.62, T.stops[2]); g.addColorStop(1, T.stops[3]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      var sxg = w * 0.68, syg = h * T.discY, sg = ctx.createRadialGradient(sxg, syg, 10, sxg, syg, w * 0.7);
      sg.addColorStop(0, T.glow); sg.addColorStop(0.25, T.glow + "66"); sg.addColorStop(1, T.glow + "00");
      ctx.fillStyle = sg; ctx.fillRect(0, 0, w, h);
    }
    var sx = w * 0.68, sy = h * T.discY;
    ctx.fillStyle = T.disc; ctx.beginPath(); ctx.arc(sx, sy, T.flat ? 120 : 34, 0, 6.283); ctx.fill();
    var layers = [{ f: 0.05, col: T.towers[0], s: 0.8, base: 0.64 }, { f: 0.12, col: T.towers[1], s: 1, base: 0.7 }, { f: 0.22, col: T.towers[2], s: 1.25, base: 0.78 }];
    layers.forEach(function (L) {
      var per = 300 * L.s, off = -((scroll * L.f) % per);
      for (var x = off - per; x < w + per; x += per) {
        tower(ctx, x + per * 0.5, h * L.base, 58 * L.s, 150 * L.s, L.col);
        tower(ctx, x + per * 0.05, h * L.base, 34 * L.s, 84 * L.s, L.col);
      }
      ctx.fillStyle = L.col; ctx.fillRect(0, h * L.base - 1, w, h);
    });
    ctx.fillStyle = T.cloud;
    for (var i = 0; i < 6; i++) {
      var cx = ((i * 190 - (scroll * 0.04 + t * 6)) % (w + 220) + (w + 220)) % (w + 220) - 110, cy = h * (0.18 + (i % 3) * 0.11);
      ctx.beginPath(); ctx.ellipse(cx, cy, 60, 14, 0, 0, 6.283); ctx.ellipse(cx - 30, cy + 4, 34, 11, 0, 0, 6.283); ctx.ellipse(cx + 34, cy + 3, 38, 11, 0, 0, 6.283); ctx.fill();
    }
  };
  NA.leaves = function (n, w, h) { var a = []; for (var i = 0; i < n; i++) a.push({ x: Math.random() * w, y: Math.random() * h, v: 20 + Math.random() * 30, r: Math.random() * 6, s: 3 + Math.random() * 3 }); return a; };
  NA.drawLeaves = function (ctx, L, w, h, dt) {
    ctx.fillStyle = "#d63a2c";
    L.forEach(function (p) {
      p.y += p.v * dt; p.x -= p.v * 0.8 * dt; p.r += dt * 2;
      if (p.y > h + 10) { p.y = -10; p.x = Math.random() * w + 40; }
      if (p.x < -10) p.x = w + 10;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.beginPath(); ctx.ellipse(0, 0, p.s, p.s * 0.55, 0, 0, 6.283); ctx.fill(); ctx.restore();
    });
  };

  /* ---------- gods collection (shared across games) ---------- */
  NA.unlocked = function () { try { return JSON.parse(NA.store.get("na-gods") || '["nacha"]'); } catch (e) { return ["nacha"]; } };
  NA.unlock = function (id) { var u = NA.unlocked(); if (u.indexOf(id) >= 0) return false; u.push(id); NA.store.set("na-gods", JSON.stringify(u)); return true; };
  NA.godsStrip = function (newId) {
    var u = NA.unlocked();
    return '<div class="gods">' + NA.GODS.map(function (g) {
      var on = u.indexOf(g.id) >= 0;
      return '<div class="god' + (on ? "" : " lock") + (g.id === newId ? " new" : "") + '"><i><img alt="" src="' + NA.dataURL(NA.god(g.id)) + '"></i>' + (on ? g.name : "???") + '</div>';
    }).join("") + '</div>';
  };

  /* ---------- follow + share ---------- */
  NA.followRow = function () {
    return '<div class="follow">Like it? Follow NACHA</div><div class="row">' +
      '<a class="btn x" href="' + NA.X + '" target="_blank" rel="noopener">Follow on X</a>' +
      '<a class="btn ig" href="' + NA.IG + '" target="_blank" rel="noopener">Follow on IG</a></div>';
  };
  NA.toast = function (msg) {
    var t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("on"); setTimeout(function () { t.classList.remove("on"); }, 1700);
  };
  NA.canvasToBlob = function (c) { return new Promise(function (r) { c.toBlob(r, "image/png"); }); };
  NA.share = function (canvas, text, name) {
    var url = location.href.split("#")[0];
    return NA.canvasToBlob(canvas).then(function (blob) {
      var file = blob && new File([blob], name || "nacha.png", { type: "image/png" });
      if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], text: text, url: url }).catch(function (e) { if (!e || e.name !== "AbortError") throw e; });
      }
      if (navigator.share) return navigator.share({ text: text, url: url }).catch(function () {});
      if (blob) {
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name || "nacha.png";
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
        NA.toast("Image saved");
      }
    });
  };

  // result card 1080x1350. opts: { big, label, line, sub, svg (character svg), bgSvg? }
  NA.card = function (opts) {
    var c = document.createElement("canvas"); c.width = 1080; c.height = 1350;
    var x = c.getContext("2d");
    NA.drawBG(x, 1080, 1350, 120, 0, opts.theme);
    var F = '"Lilita One", -apple-system, "Segoe UI", sans-serif';
    x.textAlign = "center";
    x.fillStyle = opts.theme === "cream" ? "#c8372d" : "#f4c430"; x.font = "88px " + F; x.shadowColor = opts.theme === "cream" ? "transparent" : "#d35400"; x.shadowOffsetY = 6; x.fillText("NACHA", 540, 130); x.shadowOffsetY = 0; x.shadowColor = "transparent";
    return NA.loadSVG(opts.svg).then(function (img) {
      var ih = 760, iw = ih * (img.width && img.height ? img.width / img.height : 0.9);
      if (opts.frame) {
        var fs = 640, fx = 540 - fs / 2, fy = 230;
        x.save(); x.shadowColor = "rgba(0,0,0,.35)"; x.shadowOffsetY = 14; x.fillStyle = "#f4c430"; roundRect(x, fx - 10, fy - 10, fs + 20, fs + 20, 70); x.fill(); x.restore();
        x.save(); roundRect(x, fx, fy, fs, fs, 60); x.clip(); x.drawImage(img, fx, fy, fs, fs); x.restore();
      } else x.drawImage(img, 540 - iw / 2, 200, iw, ih);
      x.fillStyle = "rgba(21,10,26,.78)"; roundRect(x, 90, 990, 900, 250, 40); x.fill();
      x.fillStyle = "#f4c430"; x.font = "100px " + F; x.fillText(opts.big, 540, 1100);
      x.fillStyle = "#f6dfbf"; x.font = "40px " + F; x.fillText(opts.label || "", 540, 1160);
      x.fillStyle = "#fff"; x.font = "36px " + F; wrapText(x, opts.line || "", 540, 1210, 820, 44);
      x.fillStyle = "#f6dfbf"; x.font = "34px " + F; x.fillText(NA.HANDLE, 540, 1310);
      return c;
    });
  };
  function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function wrapText(x, text, cx, y, maxW, lh) {
    var words = text.split(" "), line = "";
    words.forEach(function (w) { var t = line ? line + " " + w : w; if (x.measureText(t).width > maxW && line) { x.fillText(line, cx, y); y += lh; line = w; } else line = t; });
    x.fillText(line, cx, y);
  }

  NA.fontReady = function () { return (document.fonts && document.fonts.load) ? document.fonts.load('40px "Lilita One"').catch(function () {}) : Promise.resolve(); };
})();
