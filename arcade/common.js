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

  // WIREFRAME placeholders. Official/GPT art replaces these (see NA.ART below); Claude draws no characters.
  // To use real images later: set NA.ART = { nacha: "assets/nacha.png", fdo: "...", kunsim: "...", sousang: "..." } before drawing.
  NA.ART = {};
  function ph(vb, label, sub, fill, id) {
    var p = vb.split(" "), x = +p[0], y = +p[1], w = +p[2], h = +p[3];
    var img = NA.ART[id] ? '<image href="' + NA.ART[id] + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid meet"/>' : "";
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + vb + '"><rect x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (w - 6) + '" height="' + (h - 6) + '" rx="10" fill="' + (fill || "#3a2f47") + '" stroke="#9d90ad" stroke-width="2" stroke-dasharray="6 5"/>' + img +
      (img ? "" : '<text x="' + (x + w / 2) + '" y="' + (y + h / 2) + '" text-anchor="middle" font-family="Lilita One,sans-serif" font-size="' + Math.round(w / 7) + '" fill="#d9cfe6">' + label + '</text><text x="' + (x + w / 2) + '" y="' + (y + h / 2 + Math.round(w / 6)) + '" text-anchor="middle" font-family="sans-serif" font-size="' + Math.round(w / 11) + '" fill="#9d90ad">' + (sub || "(GPT image)") + '</text>') + "</svg>";
  }
  // o: jacket (tints the box so the dress-up chips still show an effect), mood, pose
  NA.nacha = function (o) { o = o || {}; return ph("-14 -8 148 188", "NACHA", (o.mood || "") + (o.pose ? " · " + o.pose : "") || "(GPT image)", o.jacket ? o.jacket + "55" : "#3a2f47", "nacha"); };
  var GN = { kunsim: "WHITE KUN SIM", fdo: "FDO KING", sousang: "PREAH SOUSANG", nacha: "NACHA" };
  NA.god = function (id) { return id === "nacha" ? NA.nacha({}) : ph("0 0 100 100", (GN[id] || id).split(" ")[0], (GN[id] || "").split(" ").slice(1).join(" ") || "(GPT image)", "#3a2f47", id); };

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

  // Training ranks (placeholder English names; official rank names TBD). Local only, no server.
  NA.RANKS = [["Novice", 0], ["Disciple", 30], ["Monk", 100], ["Senior Monk", 250], ["Master", 500], ["High Priest", 1000], ["Grand Abbot", 2000]];
  NA.trainTotal = function () { return +NA.store.get("na-train", 0) || 0; };
  NA.rankOf = function (t) { var r = 0; for (var i = 0; i < NA.RANKS.length; i++) if (t >= NA.RANKS[i][1]) r = i; return r; };
  NA.train = function (pts) {
    var before = NA.trainTotal(), total = before + pts; NA.store.set("na-train", total);
    var r = NA.rankOf(total), up = r > NA.rankOf(before), nx = NA.RANKS[r + 1];
    return { total: total, rank: NA.RANKS[r][0], up: up, line: "NACHA Points +" + pts + " · " + NA.RANKS[r][0] + (up ? " ⬆ NEW RANK!" : nx ? " (next at " + nx[1] + ")" : " (top rank)") };
  };
  // Per-game difficulty (1-5, computed from each game's own parameters) x performance (0-1) -> NACHA Points.
  NA.starsText = function (d) { var n = Math.round(Math.max(1, Math.min(5, d))); return "\u2605".repeat(n) + "\u2606".repeat(5 - n); };
  NA.award = function (gameId, difficulty, perf) {
    var d = Math.max(1, Math.min(5, difficulty)), p = Math.max(0, Math.min(1, perf));
    var pts = Math.max(1, Math.round(10 * d * (0.4 + 0.6 * p)));
    var t = NA.train(pts); t.pts = pts; t.difficulty = d;
    t.detail = "Difficulty " + NA.starsText(d) + " \u00d7 " + Math.round(p * 100) + "% clear";
    return t;
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
