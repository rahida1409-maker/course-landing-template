/* Course landing page template: loads content.json and renders the page.
   Lecturers edit content.json only. See README. */
(function () {
'use strict';
window.__courseLanding = true;

/* ---------- Text defaults (English and Bahasa Melayu). Override any in content.json "strings". ---------- */
var STR = {
  en: {
    skip: 'Skip to content', welcome: 'Welcome to', startHere: 'Start here', quickLinks: 'Quick links', open: 'Open',
    soon: 'Link coming soon', firstThings: 'First things first', shortcuts: 'Shortcuts',
    lecturer: 'Your lecturer', courseLecturer: 'Course lecturer', contactSupport: 'Contact and support',
    schedule: 'My schedule', scheduleKick: 'Your semester', experiments: 'Your experiments', workflow: 'How it works',
    assessment: 'Assessment', assessmentKick: 'How you are graded', rules: 'Important rules', rulesKick: 'Please remember',
    thisWeek: 'This week', seeAll: 'See all weeks', startsOn: 'Semester starts', ended: 'This semester has ended',
    week: 'Week', wk: 'Wk', brk: 'Break', brief: 'Briefing', consult: 'Consult', submit: 'Submit', test: 'Test',
    forLab: 'For', lab: 'Lab', labManual: 'Lab manual', manualSoon: 'Manual coming soon', manualNote: 'Manual',
    classGroup: 'Class group', session: 'Session', venue: 'Venue', semester: 'Semester', code: 'Course code',
    legendBrief: 'Briefing / consultation', legendSubmit: 'Report submission', legendBreak: 'Break', legendTest: 'Test',
    legendCE: 'Lab (closed-ended)', legendOE: 'Lab (open-ended)', ce: 'Closed-ended', oe: 'Open-ended',
    chooseGroup: 'Choose your class group', publicHoliday: 'Public holiday', markStepDone: 'Mark step done',
    helpful: 'Was this page helpful?', yes: 'Yes', no: 'Not really', thanks: 'Thank you for your feedback!',
    analyticsNote: 'This page records anonymous usage statistics (no personal data).',
    toDark: 'Switch to dark mode', toLight: 'Switch to light mode',
    creditBy: 'Template by Rahida Wati Sharudin · Faculty of Chemical Engineering, UiTM',
    video: 'Short introduction video', videoTitle: 'Short introduction video', photoOf: 'Photo of'
  },
  ms: {
    skip: 'Langkau ke kandungan', welcome: 'Selamat datang ke', startHere: 'Mula di sini', quickLinks: 'Pautan pantas', open: 'Buka',
    soon: 'Pautan akan datang', firstThings: 'Perkara pertama', shortcuts: 'Pintasan',
    lecturer: 'Pensyarah anda', courseLecturer: 'Pensyarah kursus', contactSupport: 'Hubungan dan sokongan',
    schedule: 'Jadual saya', scheduleKick: 'Semester anda', experiments: 'Eksperimen anda', workflow: 'Cara ia berjalan',
    assessment: 'Penilaian', assessmentKick: 'Bagaimana anda dinilai', rules: 'Peraturan penting', rulesKick: 'Sila ingat',
    thisWeek: 'Minggu ini', seeAll: 'Lihat semua minggu', startsOn: 'Semester bermula', ended: 'Semester ini telah tamat',
    week: 'Minggu', wk: 'Mg', brk: 'Cuti', brief: 'Taklimat', consult: 'Konsultasi', submit: 'Hantar', test: 'Ujian',
    forLab: 'Untuk', lab: 'Makmal', labManual: 'Manual makmal', manualSoon: 'Manual akan datang', manualNote: 'Manual',
    classGroup: 'Kumpulan kelas', session: 'Sesi', venue: 'Tempat', semester: 'Semester', code: 'Kod kursus',
    legendBrief: 'Taklimat / konsultasi', legendSubmit: 'Hantar laporan', legendBreak: 'Cuti', legendTest: 'Ujian',
    legendCE: 'Makmal (tertutup)', legendOE: 'Makmal (terbuka)', ce: 'Tertutup', oe: 'Terbuka',
    chooseGroup: 'Pilih kumpulan kelas anda', publicHoliday: 'Cuti umum', markStepDone: 'Tandakan langkah selesai',
    helpful: 'Adakah halaman ini membantu?', yes: 'Ya', no: 'Kurang', thanks: 'Terima kasih atas maklum balas anda!',
    analyticsNote: 'Halaman ini merekod statistik penggunaan tanpa nama (tiada data peribadi).',
    toDark: 'Tukar ke mod gelap', toLight: 'Tukar ke mod cerah',
    creditBy: 'Templat oleh Rahida Wati Sharudin · Fakulti Kejuruteraan Kimia, UiTM',
    video: 'Video pengenalan ringkas', videoTitle: 'Video pengenalan ringkas', photoOf: 'Foto'
  }
};
var MON = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  ms: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis']
};
var BAR_LIGHT = ['#12263F', '#0F766E', '#1D4ED8', '#92400E', '#6D28D9'], BAR_DARK = ['#14532D', '#0F766E', '#155E75', '#854D0E', '#5B21B6'];
function barColors() { return document.documentElement.getAttribute('data-theme') === 'dark' ? BAR_DARK : BAR_LIGHT; }
var TONES = ['#0F766E', '#1D4ED8', '#92400E', '#6D28D9', '#BE123C', '#4A5B70'];
var SECTION_ORDER = ['schedule', 'experiments', 'workflow', 'assessment', 'rules'];

var app = document.getElementById('app');
var C = null, T = null, L = 'en', warnings = [];
var state = { group: null };
var EDIT = /[?&]edit(=|&|$)/.test(location.search);
function dp(path, ph) { return EDIT ? ' data-p="' + esc(path) + '" contenteditable="true" spellcheck="true" role="textbox" aria-label="' + esc(ph || path.split('.').pop()) + '"' : ''; }
function di(path) { return EDIT ? ' data-item="' + esc(path) + '"' : ''; }
function dl(path) { return EDIT ? ' data-list="' + esc(path) + '"' : ''; }

/* ---------- Helpers ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }
function has(o, k) { return o && Object.prototype.hasOwnProperty.call(o, k); }
function warn(m) { warnings.push(m); if (window.console) console.warn('[content.json] ' + m); }
function slug(s) { return String(s || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function safeUrl(u) {
  u = String(u || '').trim();
  if (!u) return '';
  if (/^(javascript|data|vbscript):/i.test(u)) return '';
  return u;
}
function isExternal(u) { return /^https?:\/\//i.test(u); }
function store(k, v) {
  try { if (v === undefined) return window.localStorage.getItem(slug(C.course.code) + ':' + k); window.localStorage.setItem(slug(C.course.code) + ':' + k, v); } catch (e) {}
  return null;
}
function t(k) { return (C.strings && has(C.strings, k)) ? C.strings[k] : (T[k] != null ? T[k] : k); }

/* ---------- Links ---------- */
function resolve(l) {
  if (!l) return '';
  l = String(l);
  if (l === 'email') return (C.lecturer && C.lecturer.email) ? 'mailto:' + C.lecturer.email : '';
  if (has(C.links, l)) return safeUrl(C.links[l]);
  if (/^(#|https?:|mailto:|tel:|\.{0,2}\/)/i.test(l) || /\.[a-z0-9]{2,5}$/i.test(l)) return safeUrl(l);
  warn('Link "' + l + '" is not defined under "links".');
  return '';
}
function anchorOk(u) { return u.charAt(0) !== '#' || !!document.getElementById(u.slice(1)) || sectionsOn.indexOf(u.slice(1)) > -1 || u === '#start' || u === '#links' || u === '#lecturer' || u === '#home'; }
function linkEl(url, key, label, cls, hint) {
  if (!url) return '<span class="' + cls + ' off" aria-disabled="true">' + esc(label) + '</span>';
  var ext = isExternal(url);
  return '<a class="' + cls + '" href="' + esc(url) + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : '') + (key ? ' data-track="' + esc(key) + '"' : '') + '>' + esc(label) + (ext ? ' &#8599;' : '') + '</a>';
}

/* ---------- Dates ---------- */
function iso(s) { var p = String(s).split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function fmt(d) { return d.getDate() + ' ' + MON[L][d.getMonth()]; }
function mondayOf(d) { var x = new Date(d.getTime()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }

/* ---------- Accent colour (keeps text readable) ---------- */
function rgbOf(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join(''); var n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum(c) { var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2]; }
function ratio(a, b) { var hi = Math.max(a, b), lo = Math.min(a, b); return (hi + 0.05) / (lo + 0.05); }
function hex(c) { return '#' + c.map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join(''); }
function themeToggleOn() { return !(C.design && C.design.themeToggle === false); }
function isDarkNow() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
function themeBtn() {
  if (!themeToggleOn()) return '';
  var d = isDarkNow(), ic = d
    ? '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
    : '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  return '<button type="button" class="themebtn" data-theme-toggle title="' + esc(t(d ? 'toLight' : 'toDark')) + '" aria-label="' + esc(t(d ? 'toLight' : 'toDark')) + '">' + ic + '</button>';
}
function applyAccent() {
  var th = (C.design && C.design.theme) || 'light', isDark;
  if (th !== 'light' && th !== 'dark') warn('design.theme must be light or dark.');
  var pick = themeToggleOn() ? store('theme') : null;
  if (pick === 'light' || pick === 'dark') th = pick;
  isDark = th === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  var h = (C.design && C.design.accent) || '#0F766E';
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) { warn('design.accent must be a hex colour like #0F766E.'); h = '#0F766E'; }
  if (isDark && h.toLowerCase() === '#0f766e') h = '#6EE7B7';
  var rgb = rgbOf(h), white = lum([255, 255, 255]), dark = lum([18, 38, 63]);
  var ink = ratio(lum(rgb), white) >= ratio(lum(rgb), dark) ? '#FFFFFF' : '#12263F';
  var txt = rgb.slice(), i = 0;
  if (isDark) { var bg = lum([12, 18, 16]); while (ratio(lum(txt), bg) < 4.5 && i++ < 30) txt = txt.map(function (v) { return Math.min(255, Math.round(v + (255 - v) * 0.15)); }); }
  else while (ratio(lum(txt), white) < 4.5 && i++ < 30) txt = txt.map(function (v) { return Math.round(v * 0.9); });
  var r = document.documentElement.style;
  r.setProperty('--accent', h); r.setProperty('--accent-ink', ink); r.setProperty('--accent-text', hex(txt));
}

/* ---------- Errors ---------- */
function fatal(title, body) {
  app.innerHTML = '<div class="msg" role="alert"><h1>' + esc(title) + '</h1>' + body + '</div>';
}
function jsonError(text, err) {
  var m = String(err && err.message || err), line = 0, col = 0, pos;
  var lc = m.match(/line (\d+) column (\d+)/i);
  if (lc) { line = +lc[1]; col = +lc[2]; }
  else if ((pos = m.match(/position (\d+)/i))) { var before = text.slice(0, +pos[1]); line = before.split('\n').length; col = +pos[1] - before.lastIndexOf('\n'); }
  var lines = text.split('\n'), out = '';
  if (line) {
    for (var i = Math.max(1, line - 2); i <= Math.min(lines.length, line + 1); i++) out += (i === line ? '> ' : '  ') + ('   ' + i).slice(-4) + ' | ' + lines[i - 1] + '\n';
  }
  fatal('content.json has a mistake' + (line ? ' near line ' + line : ''),
    '<p>The page could not read <b>content.json</b>. Usually a comma is missing or extra, or a quote mark is missing. The mistake is on the line marked below <b>or the line just before it</b> (often a missing comma at the end of the line above).</p>' +
    (out ? '<pre>' + esc(out) + '</pre>' : '') + '<p>Detail: ' + esc(m) + '</p>' +
    '<p>Tip: paste the file into <b>jsonlint.com</b> to find the exact spot.</p>');
}

/* ---------- Validation ---------- */
function validate() {
  var errs = [];
  if (!C || typeof C !== 'object') return ['content.json must be an object { ... }.'];
  if (!C.course || !C.course.code) errs.push('course.code is required.');
  if (!C.course || !C.course.title) errs.push('course.title is required.');
  if (!C.lecturer || !C.lecturer.name) errs.push('lecturer.name is required.');
  var s = C.sections || {};
  if (s.schedule || s.experiments) {
    if (!C.schedule || !Array.isArray(C.schedule.groups) || !C.schedule.groups.length) errs.push('schedule.groups is needed when "schedule" or "experiments" is on.');
    else if (!Array.isArray(C.schedule.plan) || !C.schedule.plan.length) errs.push('schedule.plan is needed when "schedule" or "experiments" is on.');
    else C.schedule.groups.forEach(function (g, i) {
      if (!g.id) errs.push('schedule.groups[' + i + '].id is missing.');
      var gp = (Array.isArray(g.plan) && g.plan.length) ? g.plan : C.schedule.plan, gpn = (gp === C.schedule.plan) ? 'schedule.plan' : 'schedule.groups[' + i + '].plan';
      if (!Array.isArray(g.dates) || g.dates.length !== gp.length) errs.push('schedule.groups[' + i + '].dates must have exactly ' + gp.length + ' dates (one for each entry in ' + gpn + ').');
      else g.dates.forEach(function (d, j) { if (isNaN(iso(d).getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(d)) errs.push('schedule.groups[' + i + '].dates[' + j + '] "' + d + '" must look like 2027-01-31.'); });
    });
  }
  if (s.experiments && !(C.experiments && Array.isArray(C.experiments.items) && C.experiments.items.length)) errs.push('experiments.items is needed when "experiments" is on.');
  if (s.assessment && !(C.assessment && (Array.isArray(C.assessment.weights) || Array.isArray(C.assessment.reports)))) errs.push('assessment.weights or assessment.reports is needed when "assessment" is on.');
  return errs;
}

/* ---------- Analytics (GoatCounter, optional) ---------- */
var gcOn = false;
function initAnalytics() {
  var code = C.analytics && String(C.analytics.goatcounter || '').trim();
  if (!code || !/^[a-z0-9-]+$/i.test(code)) return;
  gcOn = true;
  var s = document.createElement('script');
  s.async = true; s.src = '//gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', 'https://' + code + '.goatcounter.com/count');
  s.setAttribute('data-goatcounter-settings', '{"no_onload":true}');
  if (!EDIT) document.head.appendChild(s);
}
function gc(o) { if (!gcOn || EDIT) return; var n = 0; (function go() { if (window.goatcounter && window.goatcounter.count) { try { window.goatcounter.count(o); } catch (e) {} } else if (n++ < 40) setTimeout(go, 250); })(); }
function ev(name) { gc({ path: 'click/' + name, title: name, event: true }); }

/* ---------- Plan helpers ---------- */
var sectionsOn = [];
var plan = [], groups = [], exps = [], reports = {}, labIdx = {}, consIdx = {}, subIdx = {};
function prep() {
  var S = C.schedule || {};
  plan = Array.isArray(S.plan) ? S.plan : [];
  groups = Array.isArray(S.groups) ? S.groups : [];
  exps = (C.experiments && C.experiments.items) || [];
  reports = {};
  ((C.assessment && C.assessment.reports) || []).forEach(function (r) { reports[r.code] = r; });
  indexPlan();
}
function indexPlan() {
  labIdx = {}; consIdx = {}; subIdx = {};
  plan.forEach(function (p, i) {
    if (p.type === 'lab') labIdx[p.experiment] = i;
    if (p.type === 'consult') consIdx[p.experiment] = i;
    if (p.submit) subIdx[p.submit] = i;
  });
}
function useGroup(g) {
  var S = C.schedule || {};
  plan = (g && Array.isArray(g.plan) && g.plan.length) ? g.plan : (Array.isArray(S.plan) ? S.plan : []);
  indexPlan();
}
function exp(n) { return exps[n - 1] || { name: t('lab') + ' ' + n }; }
function word() { return (C.experiments && C.experiments.word) || t('lab'); }
function reportLabel(n) { var e = exp(n); return e.reportLabel || ('Report ' + n); }
function weekText(p) { return p.week ? t('week') + ' ' + p.week : t('brk'); }
function dateText(g, i) { return (plan[i].noDate || !g.dates[i]) ? '' : fmt(iso(g.dates[i])); }
function currentIndex(g) {
  var today = new Date(); today = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  var starts = g.dates.map(function (s) { return mondayOf(iso(s)); }), cur = -1, i;
  for (i = 0; i < starts.length; i++) if (today >= starts[i]) cur = i;
  if (starts.length && today >= new Date(starts[starts.length - 1].getTime() + 7 * 86400000)) cur = -2;
  return cur;
}
function testDate(g) {
  for (var i = 0; i < plan.length; i++) if (plan[i].type === 'test' && g.dates[i]) return fmt(iso(g.dates[i])) + ' ' + iso(g.dates[i]).getFullYear();
  return '';
}
function fill(s, g) { return String(s == null ? '' : s).replace(/\{testDate\}/g, g ? testDate(g) : '').replace(/\{group\}/g, g ? g.id : '').replace(/\{session\}/g, g ? [g.day, g.time].filter(Boolean).join(', ') : ''); }

/* ---------- Pieces ---------- */
function section(id, alt, kick, title, intro, inner, pfx) {
  var P = !!(pfx && EDIT);
  return '<section class="sec' + (alt ? ' alt' : '') + '" id="' + id + '" aria-labelledby="t-' + id + '"><div class="wrap">' +
    '<div class="head">' + ((kick || P) ? '<p class="kick"' + (P ? dp(pfx + '.kicker', 'Subtitle') : '') + '>' + esc(kick) + '</p>' : '') + '<h2 id="t-' + id + '"' + (P ? dp(pfx + '.title', 'Section title') : '') + '>' + esc(title) + '</h2>' +
    ((intro || P) ? '<p class="intro"' + (P ? dp(pfx + '.intro', 'Section intro') : '') + '>' + esc(intro) + '</p>' : '') + '</div>' + inner + '</div></section>';
}
function heroArt() {
  var P = 'M52 240 C 120 256 120 192 178 192 C 238 192 236 126 196 116 C 150 104 170 60 300 60';
  function node(x, y, r, fill, icon) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (r + 8) + '" style="fill:var(--accent);opacity:var(--art-glow)" opacity=".0"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" style="fill:var(' + fill + ');stroke:var(--ns);stroke-width:2.5"/>' + icon;
  }
  function ico(d, w) { return '<path d="' + d + '" fill="none" style="stroke:var(--ni)" stroke-width="' + (w || 3.5) + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function pill(x, y, w) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="16" rx="8" style="fill:var(--art-pill);stroke:var(--art-pills)" stroke-width="1.5"/>'; }
  return '<svg viewBox="0 0 360 300" width="360" height="300" aria-hidden="true"><rect width="360" height="300" rx="24" style="fill:var(--art-bg)"/>' +
    '<path d="' + P + '" fill="none" style="stroke:var(--art-path);opacity:var(--art-glow)" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="' + P + '" fill="none" style="stroke:var(--art-path)" stroke-width="3.5" stroke-dasharray="2 10" stroke-linecap="round"/>' +
    pill(78, 262, 70) + pill(208, 216, 56) + pill(228, 142, 50) +
    node(52, 240, 22, '--n1', ico('M45 250V231M45 231h15l-4 6 4 6H45', 3)) +
    node(178, 192, 20, '--n2', ico('M169 192l6 6 11-12')) +
    node(196, 116, 20, '--n3', ico('M187 116l6 6 11-12')) +
    node(300, 60, 25, '--n4', '<path d="M300 45l4.5 9.5 10 1.3-7.4 7 2 10.2-9.1-5.2-9.1 5.2 2-10.2-7.4-7 10-1.3z" style="fill:var(--ni)"/>') +
    '<circle cx="62" cy="64" r="9" style="fill:var(--art-dot)"/><circle cx="96" cy="42" r="5" style="fill:var(--art-pill)"/><circle cx="320" cy="236" r="7" style="fill:var(--art-pill)"/></svg>';
}
function initials(n) { return String(n || '?').replace(/^(dr|prof|prof\.|ts|ir|encik|puan|en|pn)\.?\s+/i, '').trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('') || '?'; }

function renderNav(ids) {
  var labels = { start: t('startHere'), links: t('quickLinks'), schedule: (C.schedule && C.schedule.navLabel) || t('schedule'), experiments: (C.experiments && C.experiments.navLabel) || t('experiments'), workflow: (C.workflow && C.workflow.navLabel) || t('workflow'), assessment: t('assessment'), rules: t('rules'), lecturer: t('lecturer') };
  var co = C.course;
  return '<header class="topbar"><nav class="nav" aria-label="Sections"><a class="brand" href="#home"><i aria-hidden="true"></i><b>' + esc(co.code) + '</b> <small>' + esc(co.title) + '</small></a><div class="tabs">' +
    ids.map(function (id) { return '<a href="#' + id + '" data-sec="' + id + '">' + esc(labels[id] || id) + '</a>'; }).join('') + themeBtn() + '</div></nav></header>';
}

function renderHero(g, cur) {
  var co = C.course, hero = (C.design && C.design.hero) || {}, style = hero.style || 'art';
  if (['art', 'image', 'none'].indexOf(style) < 0) { warn('design.hero.style must be art, image or none.'); style = 'art'; }
  var cls = 'hero ' + (style === 'image' ? 'art' : style);
  var cta = '<a class="btn primary" href="#start" data-track="start-here">' + esc(t('startHere')) + '</a>' +
    '<a class="btn ghost" href="#links">' + esc(t('quickLinks')) + '</a>';
  var h = '<section class="' + cls + '" id="home" aria-labelledby="h1"' + (style === 'image' ? ' data-img="' + esc(safeUrl(hero.image)) + '"' : '') + '><div class="wrap"><div class="hero-text">' +
    '<p class="welcome"' + dp('course.welcome', 'Greeting') + '>' + esc(co.welcome || t('welcome')) + '</p><p class="code"' + dp('course.code', 'Course code') + '>' + esc(co.code) + '</p><h1 id="h1"' + dp('course.title', 'Course title') + '>' + esc(co.title) + '</h1>' +
    ((co.faculty || co.institution || EDIT) ? '<p class="fac"><span' + dp('course.faculty', 'Faculty') + '>' + esc(co.faculty || '') + '</span>' + ((co.faculty && co.institution) || EDIT ? ' · ' : '') + '<span' + dp('course.institution', 'Institution') + '>' + esc(co.institution || '') + '</span></p>' : '') +
    ((co.lead || EDIT) ? '<p class="lead"' + dp('course.lead', 'Intro sentence') + '>' + esc(co.lead || '') + '</p>' : '') + '<div class="cta">' + cta + '</div></div>' +
    (style === 'image' ? '' : '<div class="hero-art">' + (style === 'art' ? heroArt() : '') + '</div>') + '</div>';
  h += renderStrip(g, cur) + '</section>';
  return h;
}
function renderStrip(g, cur) {
  var co = C.course, items = [];
  if (g) { items.push([t('classGroup'), g.id]); items.push([t('session'), [g.day, g.time].filter(Boolean).join(', ')]); }
  else { items.push([t('code'), co.code]); if (co.session) items.push([t('session'), co.session]); }
  if (co.venue || EDIT) items.push([t('venue'), co.venue || '', 'course.venue']);
  if (co.semester || EDIT) items.push([t('semester'), co.semester || '', 'course.semester']);
  var h = '<div class="strip">' + items.map(function (i) { return '<div><div class="l">' + esc(i[0]) + '</div><div class="v"' + (i[2] ? dp(i[2], i[0]) : '') + '>' + esc(i[1]) + '</div></div>'; }).join('');
  if (g && sectionsOn.indexOf('schedule') > -1) h += weekCard(g, cur);
  return h + '</div>';
}
function weekCard(g, cur) {
  var h = '<aside class="wc" aria-label="' + esc(t('thisWeek')) + '"><div class="k">' + esc(t('thisWeek')) + ' · ' + esc(g.id) + '</div>';
  if (cur === -1) h += '<div class="wk">' + esc(t('startsOn')) + ' ' + fmt(iso(g.dates[0])) + '</div>';
  else if (cur === -2) h += '<div class="wk">' + esc(t('ended')) + '</div>';
  else {
    var p = plan[cur], d = dateText(g, cur), info = tileInfo(p);
    h += '<div class="wk">' + esc(weekText(p)) + (d ? ' · ' + d : '') + '</div>';
    var line = info.main + (info.name ? ' · ' + info.name : '');
    if (p.type === 'consult') line = t('consult') + ' · ' + t('forLab') + ' ' + word() + ' ' + p.experiment;
    h += '<div class="ln">' + esc(line) + '</div>';
    if (p.type === 'lab') h += '<div class="chips">' + chipsFor(p.experiment) + '</div>';
    if (p.submit) h += '<div class="due">' + esc(t('submit') + ' ' + reportLabel(p.submit)) + '</div>';
  }
  return h + '<a class="all" href="#schedule">' + esc(t('seeAll')) + '</a></aside>';
}
function chipsFor(n) {
  var e = exp(n), r = reports[e.report], h = '<span class="chip ' + (e.openEnded ? 'pink' : 'blue') + '">' + esc(e.openEnded ? t('oe') : t('ce')) + '</span>';
  if (r && r.chip) h += '<span class="chip soft">' + esc(r.chip) + '</span>';
  if (e.co) h += '<span class="chip soft">' + esc(e.co) + '</span>';
  return h;
}

function renderStart() {
  var S = C.startHere || {}, steps = Array.isArray(S.steps) ? S.steps : [];
  var done = []; try { done = JSON.parse(store('done') || '[]'); } catch (e) {}
  var list = steps.map(function (s, i) {
    var u = resolve(s.link), label = s.label || t('open'), okLink = !u || anchorOk(u);
    return '<li class="step' + (done.indexOf(i) > -1 ? ' done' : '') + '" data-i="' + i + '"' + di('startHere.steps.' + i) + '><span class="n" aria-hidden="true">' + (i + 1) + '</span><div class="t"><b' + dp('startHere.steps.' + i + '.title', 'Step title') + '>' + esc(s.title) + '</b>' + ((s.sub || EDIT) ? '<small' + dp('startHere.steps.' + i + '.sub', 'Step description') + '>' + esc(EDIT ? (s.sub || '') : fill(s.sub, currentGroup())) + '</small>' : '') + '</div>' +
      (s.link && okLink ? linkEl(u, s.link, label, 'go') : '') +
      '<button class="chk" type="button" role="checkbox" aria-checked="' + (done.indexOf(i) > -1) + '" aria-label="' + esc(t('markStepDone') + ': ' + s.title) + '"><svg viewBox="0 0 24 24" fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 13l5 5L20 5"/></svg></button></li>';
  }).join('');
  var pw = C.prepwise || {}, pwUrl = safeUrl(pw.url);
  if (pw.enabled === true && pwUrl) {
    list += '<li class="step prepwise"><div class="t"><b>' + esc(pw.label || 'PrepWISE') + '</b>' + (pw.text ? '<small>' + esc(pw.text) + '</small>' : '') + '</div>' + linkEl(pwUrl, 'prepwise', t('open') + ' ' + (pw.label || 'PrepWISE'), 'go') + '</li>';
  } else if (pw.enabled === true) warn('prepwise.enabled is true but prepwise.url is empty, so the PrepWISE card is hidden.');
  return '<section class="sec" id="start" aria-labelledby="t-start"><div class="wrap"><div class="start"><div><p class="kick"' + dp('startHere.kicker', 'Subtitle') + '>' + esc(S.kicker || t('firstThings')) + '</p><h2 id="t-start"' + dp('startHere.title', 'Section title') + '>' + esc(S.title || t('startHere')) + '</h2>' +
    ((S.intro || EDIT) ? '<p class="intro"' + dp('startHere.intro', 'Intro') + '>' + esc(S.intro || '') + '</p>' : '') + '</div><ol class="steps"' + dl('startHere.steps') + '>' + list + '</ol></div></div></section>';
}

function renderLinks() {
  var items = Array.isArray(C.quickLinks) ? C.quickLinks : [], out = '';
  items.forEach(function (q, qi) {
    var u = resolve(q.link);
    if (u && !anchorOk(u) && !EDIT) return;
    var inner = '<span class="t"' + dp('quickLinks.' + qi + '.title', 'Link title') + '>' + esc(q.title) + '</span>' + ((q.hint || EDIT) ? '<span class="h"' + dp('quickLinks.' + qi + '.hint', 'Hint') + '>' + esc(q.hint || '') + '</span>' : '') + '<span class="o">' + esc(u ? t('open') : t('soon')) + '</span>';
    out += u ? '<a class="ql"' + di('quickLinks.' + qi) + ' href="' + esc(u) + '"' + (isExternal(u) ? ' target="_blank" rel="noopener noreferrer"' : '') + ' data-track="' + esc(q.link) + '">' + inner + '</a>' : '<div class="ql off"' + di('quickLinks.' + qi) + ' aria-disabled="true">' + inner + '</div>';
  });
  return section('links', true, (C.quickLinksIntro && C.quickLinksIntro.kicker) || t('shortcuts'), (C.quickLinksIntro && C.quickLinksIntro.title) || t('quickLinks'), (C.quickLinksIntro && C.quickLinksIntro.intro) || '', '<div class="qgrid"' + dl('quickLinks') + '>' + out + '</div>', 'quickLinksIntro');
}

/* Schedule */
function tileInfo(p) {
  var o = { color: 'var(--c-muted)', main: '', name: '', sym: '', subs: [], cls: '' };
  var ty = p.type;
  if (ty === 'brief') { o.color = 'var(--c-violet)'; o.main = t('brief'); o.sym = 'Bf'; o.name = p.note || ''; }
  else if (ty === 'lab') { var e = exp(p.experiment); o.color = e.openEnded ? 'var(--c-oe)' : 'var(--c-ce)'; o.main = word() + ' ' + p.experiment; o.name = e.short || e.name; o.sym = 'L' + p.experiment; }
  else if (ty === 'consult') { o.color = 'var(--c-violet)'; o.main = t('consult'); o.sym = 'Cs'; o.subs.push(t('forLab') + ' ' + word() + ' ' + p.experiment); }
  else if (ty === 'submit') { o.color = 'var(--c-submit)'; o.main = t('submit'); o.sym = 'Sb'; }
  else if (ty === 'test') { o.color = 'var(--c-test)'; o.main = t('test'); o.sym = 'Ts'; o.name = p.note || ''; }
  else if (ty === 'break') { o.color = 'var(--c-break)'; o.main = t('brk'); o.sym = 'Br'; o.name = p.note || ''; }
  else { o.main = p.label || '—'; o.sym = String(p.label || '—').slice(0, 2); o.name = p.note || ''; if (p.muted) o.cls = ' dash'; }
  if (p.submit) o.subs.push((ty === 'submit' ? '' : t('submit') + ' ') + reportLabel(p.submit));
  return o;
}
function renderSchedule(g, cur) {
  var S = C.schedule, picker = '';
  if (groups.length > 1) {
    picker = '<div class="picker" role="group" aria-label="' + esc(t('chooseGroup')) + '">' + groups.map(function (x) {
      return '<button type="button" class="pick" data-k="' + esc(x.id) + '" aria-pressed="' + (x.id === g.id) + '"><strong>' + esc(x.id) + '</strong><span>' + esc([x.day, x.time].filter(Boolean).join(', ')) + '</span></button>';
    }).join('') + '</div>';
  }
  var tiles = plan.map(function (p, i) {
    var o = tileInfo(p), d = dateText(g, i), hol = g.holidays && g.holidays[i];
    return '<li class="tile' + o.cls + (i === cur ? ' is-now' : '') + '" style="--c:' + o.color + '"><span class="d">' + esc(p.week ? t('wk') + ' ' + p.week : t('brk')) + (d ? ' · ' + d : '') + '</span>' +
      '<span class="sym" aria-hidden="true">' + esc(o.sym) + '</span><span class="m">' + esc(o.main) + '</span>' + (o.name ? '<span class="nm">' + esc(o.name) + '</span>' : '') +
      o.subs.map(function (s) { return '<span class="s">' + esc(s) + '</span>'; }).join('') + (hol ? '<span class="h">' + esc(hol === true ? t('publicHoliday') : hol) + '</span>' : '') +
      (i === cur ? '<span class="now">' + esc(t('thisWeek')) + '</span>' : '') + '</li>';
  }).join('');
  var has = {}; plan.forEach(function (p) { has[p.type] = true; if (p.type === 'lab') has[exp(p.experiment).openEnded ? 'oe' : 'ce'] = true; if (p.submit) has.submit = true; });
  var leg = [];
  if (has.ce) leg.push(['var(--c-ce)', t('legendCE')]);
  if (has.oe) leg.push(['var(--c-oe)', t('legendOE')]);
  if (has.brief || has.consult) leg.push(['var(--c-violet)', t('legendBrief')]);
  if (has.submit) leg.push(['var(--c-submit)', t('legendSubmit')]);
  plan.forEach(function (p) { var lt = p.legend || p.label; if (p.type === 'other' && lt && !leg.some(function (x) { return x[1] === lt; })) leg.push([p.muted ? '' : 'var(--c-muted)', lt, p.muted]); });
  if (has['break']) leg.push(['var(--c-break)', t('legendBreak')]);
  if (has.test) leg.push(['var(--c-test)', t('legendTest')]);
  var legend = '<div class="legend" aria-label="Colour key">' + leg.map(function (x) { return '<span><i' + (x[2] ? ' class="dash"' : ' style="--c:' + x[0] + '"') + '></i>' + esc(x[1]) + '</span>'; }).join('') + '</div>';
  var note = '';
  var tts = groups.filter(function (x) { return resolve(x.timetable); }).map(function (x) { return linkEl(resolve(x.timetable), x.timetable, x.id + (x.day ? ' (' + x.day + ')' : ''), '', ''); });
  if (S.note || tts.length) note = '<p class="note">' + (tts.length ? esc(S.timetableLabel || 'Official timetable') + ': ' + tts.join(' &middot; ') + '. ' : '') + esc(S.note || '') + '</p>';
  return section('schedule', true, S.kicker || t('scheduleKick'), S.title || t('schedule'), S.intro || '', picker + '<ol class="wks" aria-label="Weekly plan">' + tiles + '</ol>' + legend + note, 'schedule');
}
function renderExperiments(g) {
  var E = C.experiments, cards = '';
  exps.forEach(function (e, k) {
    var n = k + 1, wi = labIdx[n];
    if (wi === undefined) { warn('Experiment ' + n + ' is not placed in schedule.plan (type "lab", experiment ' + n + ').'); return; }
    var d = iso(g.dates[wi]), color = e.openEnded ? 'var(--c-oe)' : 'var(--c-ce)', inf = [];
    if (consIdx[n] !== undefined) inf.push('<b>' + esc(t('consult')) + '</b> ' + fmt(iso(g.dates[consIdx[n]])));
    if (subIdx[n] !== undefined) inf.push('<b>' + esc(t('submit') + ' ' + reportLabel(n)) + '</b> ' + fmt(iso(g.dates[subIdx[n]])) + (g.holidays && g.holidays[subIdx[n]] ? ' (' + esc(t('publicHoliday').toLowerCase()) + ')' : ''));
    var mu = resolve(e.manual);
    cards += '<li class="lab" style="--c:' + color + '"><span class="atom" aria-hidden="true">' + (e.openEnded ? 'OE' : 'CE') + '</span><div><div class="wk">' + esc((e.openEnded ? 'OE' : 'CE') + ' · ' + word() + ' ' + n + ' · ' + weekText(plan[wi]) + ' · ' + d.getDate() + ' ' + MON[L][d.getMonth()] + ' ' + d.getFullYear()) + '</div>' +
      '<h3>' + esc(e.name) + '</h3><div class="chips">' + chipsFor(n) + '</div>' + (inf.length ? '<p class="inf">' + inf.join(' &nbsp;·&nbsp; ') + '</p>' : '') +
      (mu ? linkEl(mu, e.manual, e.manualLabel || t('labManual'), 'mn') : '<span class="mn off">' + esc(t('manualSoon')) + '</span>') + '</div></li>';
  });
  return section('experiments', false, E.kicker || (t('classGroup') + ' ' + g.id), E.title || t('experiments'), E.intro || '', '<ol class="labs">' + cards + '</ol>', 'experiments');
}
function renderWorkflow() {
  var W = C.workflow, steps = Array.isArray(W.steps) ? W.steps : [], cmp = W.compare, h = '';
  h += '<ol class="flow"' + dl('workflow.steps') + '>' + steps.map(function (s, i) { var q = 'workflow.steps.' + i; return '<li' + di(q) + '>' + ((s.when || EDIT) ? '<div class="when"' + dp(q + '.when', 'When') + '>' + esc(s.when || '') + '</div>' : '') + '<h3' + dp(q + '.title', 'Title') + '>' + esc(s.title) + '</h3>' + ((s.text || EDIT) ? '<p' + dp(q + '.text', 'Text') + '>' + esc(s.text || '') + '</p>' : '') + '</li>'; }).join('') + '</ol>';
  if (cmp && Array.isArray(cmp.columns)) {
    h += '<div class="vs">' + (cmp.title ? '<h3>' + esc(cmp.title) + '</h3>' : '') + '<div class="vs-cols">' + cmp.columns.map(function (c) {
      var img = safeUrl(c.image);
      return '<div class="vs-col">' + (img ? '<img src="' + esc(img) + '" alt="' + esc(c.alt || '') + '" onerror="this.remove()">' : '') + '<b>' + esc(c.title) + '</b>' + (c.summary ? '<span>' + esc(c.summary) + '</span>' : '') +
        '<ol>' + (c.steps || []).map(function (s, i) { return '<li><i aria-hidden="true">' + (i + 1) + '</i>' + esc(s) + '</li>'; }).join('') + '</ol></div>';
    }).join('') + '</div></div>';
  }
  return section('workflow', false, W.kicker || '', W.title || t('workflow'), W.intro || '', h, 'workflow');
}
function renderAssessment(g) {
  var A = C.assessment, h = '', ws = Array.isArray(A.weights) ? A.weights : [];
  if (ws.length) {
    h += '<div class="mark" role="img" aria-label="' + esc(ws.map(function (w) { return w.label + ' ' + w.percent + '%'; }).join(', ')) + '">' +
      ws.map(function (w, i) { return '<div style="flex:' + (+w.percent || 1) + ' 1 0;background:' + barColors()[i % barColors().length] + '">' + esc(w.percent) + '%</div>'; }).join('') + '</div>' +
      '<div class="mk-legend">' + ws.map(function (w, i) { return '<div style="flex-grow:' + (+w.percent || 1) + '"><i style="background:' + barColors()[i % barColors().length] + '"></i><p><b' + dp('assessment.weights.' + i + '.label', 'Label') + '>' + esc(w.label) + '</b><span' + dp('assessment.weights.' + i + '.detail', 'Details') + '>' + esc(EDIT ? (w.detail || '') : fill(w.detail, g)) + '</span></p></div>'; }).join('') + '</div>';
  }
  var rs = Array.isArray(A.reports) ? A.reports : [];
  if (rs.length) {
    h += '<div class="rt-grid">' + rs.map(function (r) {
      var crit = Array.isArray(r.criteria) ? r.criteria : [], max = +r.scale || Math.max.apply(null, crit.map(function (c) { return +c[1] || 0; }).concat([1]));
      var tone = r.modeTone === 'pink' ? 'pink' : 'blue';
      return '<article class="rt"><div class="rt-code">' + esc(r.code) + '</div><h3>' + esc(r.name) + '</h3><div class="chips">' + (r.mode ? '<span class="chip ' + tone + '">' + esc(r.mode) + '</span>' : '') + (r.labs ? '<span class="chip soft">' + esc(r.labs) + '</span>' : '') + '</div>' +
        (crit.length ? '<ul class="bars" aria-label="' + esc(r.name) + '">' + crit.map(function (c) { return '<li><span>' + esc(c[0]) + '</span><span class="bar" aria-hidden="true"><i style="width:' + ((+c[1] || 0) / max * 100) + '%"></i></span><span class="mv">' + esc(c[1]) + '</span></li>'; }).join('') + '</ul>' : '') +
        ((r.buttons && r.buttons.length) ? '<div class="btnrow">' + r.buttons.map(function (b) { var u = resolve(b.link); return u ? linkEl(u, b.link, b.label, '', '') : ''; }).join('') + '</div>' : '') + '</article>';
    }).join('') + '</div>';
  }
  return section('assessment', false, A.kicker || t('assessmentKick'), A.title || t('assessment'), A.intro || '', h, 'assessment');
}
function renderRules() {
  var R = C.rules, items = Array.isArray(R.items) ? R.items : (Array.isArray(R) ? R : []);
  return section('rules', true, R.kicker || t('rulesKick'), R.title || t('rules'), R.intro || '', '<ol class="rules"' + dl('rules.items') + '>' + items.map(function (r, i) {
    var q = 'rules.items.' + i;
    return '<li class="rule"' + di(q) + ' style="--c:' + TONES[i % TONES.length] + '"><div class="no">' + ('0' + (i + 1)).slice(-2) + '</div><h3' + dp(q + '.title', 'Rule title') + '>' + esc(r.title) + '</h3>' + ((r.text || EDIT) ? '<p' + dp(q + '.text', 'Rule text') + '>' + esc(r.text || '') + '</p>' : '') + '</li>';
  }).join('') + '</ol>', 'rules');
}
function renderLecturer() {
  var l = C.lecturer, photo = safeUrl(l.photo), vid = safeUrl(l.introVideo);
  var ph = '<div class="ph" id="ph" role="img" aria-label="' + esc(t('photoOf') + ' ' + l.name) + '">' + (photo ? '<img src="' + esc(photo) + '" alt="" onerror="this.remove()">' : '') + '<span aria-hidden="true">' + esc(initials(l.name)) + '</span></div>';
  if (photo) ph = ph.replace('<span aria-hidden="true">', '<span aria-hidden="true" class="ini">');
  var card = '<div class="lec-card">' + ph + '<div><span class="tag">' + esc(t('courseLecturer')) + '</span><h3' + dp('lecturer.name', 'Lecturer name') + '>' + esc(l.name) + '</h3>' +
    ((l.role || l.affiliation || EDIT) ? '<p><span' + dp('lecturer.role', 'Position') + '>' + esc(l.role || '') + '</span>' + ((l.role && l.affiliation) || EDIT ? ' · ' : '') + '<span' + dp('lecturer.affiliation', 'Affiliation') + '>' + esc(l.affiliation || '') + '</span></p>' : '') + (l.email ? '<a href="mailto:' + esc(l.email) + '" data-track="email-lecturer">' + esc(l.email) + '</a>' : '') + '</div></div>';
  var v = vid ? '<div class="vid"><iframe title="' + esc(t('videoTitle')) + '" src="' + esc(vid) + '" allow="fullscreen" allowfullscreen loading="lazy"></iframe></div>' : '';
  var sup = Array.isArray(C.support) ? C.support : [];
  var tubes = (sup.length || EDIT) ? '<div class="tubes"' + dl('support') + '>' + sup.map(function (s, i) {
    var u = s.link ? resolve(s.link) : '', c = TONES[i % TONES.length], inner = '<i style="background:' + c + '"></i><b' + dp('support.' + i + '.title', 'Support title') + '>' + esc(s.title) + '</b><span' + dp('support.' + i + '.text', 'Support text') + '>' + esc(s.text) + '</span>';
    return u ? '<a class="tb"' + di('support.' + i) + ' href="' + esc(u) + '"' + (isExternal(u) ? ' target="_blank" rel="noopener noreferrer"' : '') + ' data-track="' + esc(s.link === 'email' ? 'email-lecturer' : s.link) + '">' + inner + '</a>' : '<div class="tb"' + di('support.' + i) + '>' + inner + '</div>';
  }).join('') + '</div>' : '';
  var kick = (C.supportIntro && C.supportIntro.kicker) || t('contactSupport');
  return section('lecturer', false, kick, (C.supportIntro && C.supportIntro.title) || t('lecturer'), '', '<div class="lec">' + card + v + '</div>' + tubes +
    (gcOn && (!C.feedback || C.feedback.enabled !== false) ? '<div class="fb" id="fb" role="group" aria-label="Page feedback"><span id="fbq">' + esc(t('helpful')) + '</span><button type="button" data-fb="helpful">' + esc(t('yes')) + '</button><button type="button" data-fb="not-helpful">' + esc(t('no')) + '</button></div>' : ''), 'supportIntro');
}
function renderFooter() {
  var co = C.course, txt = (C.footer && C.footer.text) || [co.code + ' ' + co.title, [co.faculty, co.institution].filter(Boolean).join(', '), co.semester].filter(Boolean).join(' · ');
  var F = C.footer || {}, credit = '';
  if (F.credit === true) {
    var ctext = F.creditText || t('creditBy'), curl = safeUrl(F.creditUrl || 'https://doi.org/10.5281/zenodo.24213008');
    credit = '<p class="credit">' + (curl ? '<a href="' + esc(curl) + '" target="_blank" rel="noopener">' + esc(ctext) + '</a>' : esc(ctext)) + '</p>';
  }
  return '<footer><div class="wrap"><p>' + esc(txt) + (gcOn ? ' · ' + esc(t('analyticsNote')) : '') + '</p>' + credit + '</div></footer>';
}

/* ---------- Render ---------- */
function currentGroup() {
  if (!groups.length) return null;
  var g = groups.filter(function (x) { return x.id === state.group; })[0] || groups[0];
  useGroup(g);
  return g;
}
function render() {
  var g = currentGroup(), cur = g ? currentIndex(g) : -1;
  var s = C.sections || {};
  sectionsOn = SECTION_ORDER.filter(function (k) { return s[k] === true; });
  var ids = ['start', 'links'].concat(sectionsOn, ['lecturer']);
  var html = renderNav(ids);
  if (warnings.length && /[?&]debug\b/.test(location.search)) html += '<div class="warn" role="status"><b>content.json notes:</b> ' + warnings.map(esc).join(' · ') + '</div>';
  html += '<main id="main" tabindex="-1">' + renderHero(g, cur) + renderStart() + renderLinks();
  if (sectionsOn.indexOf('schedule') > -1) html += renderSchedule(g, cur);
  if (sectionsOn.indexOf('experiments') > -1) html += renderExperiments(g);
  if (sectionsOn.indexOf('workflow') > -1) html += renderWorkflow();
  if (sectionsOn.indexOf('assessment') > -1) html += renderAssessment(g);
  if (sectionsOn.indexOf('rules') > -1) html += renderRules();
  html += renderLecturer() + '</main>' + renderFooter();
  app.innerHTML = html;
  document.title = C.course.code + ' · ' + C.course.title;
  document.documentElement.lang = L;
  [].forEach.call(document.querySelectorAll('main > section.sec'), function (el, i) { el.classList.toggle('alt', i % 2 === 1); });
  var heroEl = document.getElementById('home');
  if (heroEl && heroEl.getAttribute('data-img')) {
    var src = heroEl.getAttribute('data-img'), im = new Image();
    im.onload = function () { heroEl.style.backgroundImage = 'url("' + src.replace(/"/g, '%22') + '")'; heroEl.classList.add('img'); };
    im.onerror = function () { heroEl.classList.remove('img'); heroEl.querySelector('.wrap').insertAdjacentHTML('beforeend', '<div class="hero-art">' + heroArt() + '</div>'); warn('design.hero.image "' + src + '" could not be loaded. Using the default art.'); };
    im.src = src;
  }
  observe();
  if (EDIT && window.__clp && window.__clp.afterRender) window.__clp.afterRender();
}

/* ---------- Behaviour ---------- */
var io = null, seen = {};
function observe() {
  if (!('IntersectionObserver' in window)) return;
  if (io) io.disconnect();
  io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var id = en.target.id;
        [].forEach.call(document.querySelectorAll('.tabs a'), function (a) { if (a.getAttribute('data-sec') === id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
        if (!seen[id]) { seen[id] = 1; gc({ path: '/section/' + id, title: C.course.code + ' · ' + id }); }
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  [].forEach.call(document.querySelectorAll('main > section'), function (s) { io.observe(s); });
}
document.addEventListener('click', function (e) {
  var tb = e.target.closest && e.target.closest('[data-theme-toggle]');
  if (tb) { store('theme', isDarkNow() ? 'light' : 'dark'); applyAccent(); var y0 = window.pageYOffset; render(); window.scrollTo(0, y0); var nb = document.querySelector('[data-theme-toggle]'); if (nb) nb.focus(); return; }
  var tr = e.target.closest && e.target.closest('[data-track]');
  if (tr) ev(tr.getAttribute('data-track'));
  var p = e.target.closest && e.target.closest('.pick');
  if (p) { state.group = p.getAttribute('data-k'); store('group', state.group); ev('group-' + state.group); var y = window.pageYOffset; render(); window.scrollTo(0, y); var np = document.querySelector('.pick[data-k="' + state.group.replace(/"/g, '') + '"]'); if (np) np.focus({ preventScroll: true }); return; }
  var c = e.target.closest && e.target.closest('.chk');
  if (c) {
    var li = c.closest('.step'), v = c.getAttribute('aria-checked') !== 'true';
    c.setAttribute('aria-checked', v ? 'true' : 'false'); li.classList.toggle('done', v);
    var d = []; [].forEach.call(document.querySelectorAll('.step[data-i]'), function (x) { if (x.classList.contains('done')) d.push(+x.getAttribute('data-i')); });
    store('done', JSON.stringify(d)); ev('checklist-step-' + (+li.getAttribute('data-i') + 1));
  }
  var f = e.target.closest && e.target.closest('[data-fb]');
  if (f) { ev('feedback-' + f.getAttribute('data-fb')); var box = document.getElementById('fb'); box.classList.add('done'); document.getElementById('fbq').textContent = t('thanks'); }
});

/* ---------- Start ---------- */
function setup() {
  L = (C.course.language === 'ms') ? 'ms' : 'en';
  T = STR[L];
  C.links = C.links || {};
  if (Array.isArray(C.rules)) C.rules = { items: C.rules };
  warnings = [];
  prep();
  applyAccent();
  if (!groups.some(function (x) { return x.id === state.group; })) state.group = groups[0] && groups[0].id;
}
window.__clp = {
  edit: EDIT, afterRender: null,
  get: function () { return C; },
  rerender: function () { var errs = validate(); if (errs.length) return errs; setup(); render(); return []; },
  validate: validate, warnings: function () { return warnings; }, resolve: resolve,
  anchors: function () { return ['#home', '#start', '#links'].concat(sectionsOn.map(function (k) { return '#' + k; }), ['#lecturer']); },
  iso: iso, str: function () { return T; },
  resetTheme: function () { try { window.localStorage.removeItem(slug(C.course.code) + ':theme'); } catch (e) {} }
};
function loadEditor() {
  if (window.__clpLoaded) return;
  window.__clpLoaded = true;
  var s = document.createElement('script');
  s.src = 'js/editor.js';
  s.onerror = function () { warn('js/editor.js was not found, so edit mode is unavailable.'); };
  document.head.appendChild(s);
}
function start(text, preview) {
  try { C = JSON.parse(text); } catch (err) { jsonError(text, err); return; }
  var errs = validate();
  if (errs.length) { fatal('content.json needs a few fixes', '<ul>' + errs.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>'); return; }
  setup();
  initAnalytics();
  var saved = store('group');
  if (saved && groups.some(function (x) { return x.id === saved; })) state.group = saved;
  var skip = document.querySelector('.skip'); if (skip) skip.textContent = t('skip');
  render();
  if (preview) app.insertAdjacentHTML('afterbegin', '<div class="warn" role="status"><b>Preview from your computer.</b> Reload (F5) and choose content.json again after each edit.</div>');
  if (EDIT) loadEditor();
}
var file = (new URLSearchParams(location.search).get('content') || 'content.json');
if (!/^[\w.-]+\.json$/.test(file)) file = 'content.json';
var hasParam = !!new URLSearchParams(location.search).get('content');
window.__clpSource = (window.__courseContent && !hasParam) ? 'js' : 'json';
if (window.__courseContent && !hasParam) {
  start(JSON.stringify(window.__courseContent), false);
} else if (location.protocol === 'file:') {
  app.innerHTML = '<div class="msg pv" style="border-color:var(--accent)"><h1 style="color:var(--ink)">Preview on your computer</h1>' +
    '<p>Browsers do not let a page read <b>content.json</b> by itself when it is opened from a folder. To preview here, choose your <b>content.json</b> below. After each edit, reload this page (F5) and choose the file again.</p>' +
    '<p><label for="pickjson"><b>Choose content.json</b></label><br><input type="file" id="pickjson" accept=".json,application/json"></p>' +
    '<p>To publish for students, use GitHub Pages (see README). Or run <b>python3 -m http.server</b> in this folder and open <b>http://localhost:8000</b>.</p></div>';
  document.getElementById('pickjson').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () { start(String(r.result).replace(/^\uFEFF/, ''), true); };
    r.onerror = function () { fatal('Could not read the file', '<p>Please choose content.json again.</p>'); };
    r.readAsText(f);
  });
} else {
  fetch(file, { cache: 'no-cache' }).then(function (r) {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.text();
  }).then(start).catch(function (err) {
    fatal('Could not load ' + file, '<p>Check that <b>' + esc(file) + '</b> is in the same folder as index.html and that its name is spelled exactly right.</p><p>Detail: ' + esc(err.message || err) + '</p>');
  });
}
})();
