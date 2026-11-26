/* Edit mode for the course landing template. Loaded only when the page is opened with ?edit.
   No server: edits change the JSON in memory. "Muat turun content.json" saves the file. */
(function () {
'use strict';
var P = window.__clp; if (!P || !P.edit) return;
var C = P.get(), app = document.getElementById('app');
var dirty = {}, structural = 0, undoSnap = null, drawerOpen = false;
var hist = [], lastJSON = JSON.stringify(C), origJSON = lastJSON, lastPath = null, lastAt = 0;

/* ---------- helpers ---------- */
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function M(ms, en) { return (C.course && C.course.language === 'ms') ? ms : en; }
function $(sel, root) { return (root || document).querySelector(sel); }
function $$(sel, root) { return [].slice.call((root || document).querySelectorAll(sel)); }
function getAt(path) { var o = C, k = path.split('.'); for (var i = 0; i < k.length; i++) { if (o == null) return undefined; o = o[k[i]]; } return o; }
function parentAt(path, make) {
  var o = C, k = path.split('.');
  for (var i = 0; i < k.length - 1; i++) {
    if (o[k[i]] == null || typeof o[k[i]] !== 'object') { if (!make) return null; o[k[i]] = /^\d+$/.test(k[i + 1]) ? [] : {}; }
    o = o[k[i]];
  }
  return { o: o, key: k[k.length - 1] };
}
function setAt(path, val) { var p = parentAt(path, true); p.o[p.key] = val; }
function delAt(path) { var p = parentAt(path, false); if (p) delete p.o[p.key]; }
function listAt(path, make) { var v = getAt(path); if (!Array.isArray(v)) { if (!make) return []; v = []; setAt(path, v); } return v; }
function mark(path) { dirty[path || ('#' + Math.random())] = 1; lastPath = path || null; updateStatus(); }
function snapshot() { undoSnap = JSON.stringify(C); }
function count() { return Object.keys(dirty).length; }
var T = {
  ms: { edit: 'Edit mode', changes: 'unsaved changes', none: 'No changes', settings: 'Page setup', schedule: 'Schedule panel', check: 'Check', download: (window.__clpSource === 'js' ? 'Download content.js' : 'Download content.json'), exit: 'Exit', add: '+ Add', remove: 'Delete', link: 'Link', undo: 'Undo', close: 'Close' }
};
function tr(k) { return T.ms[k] || k; }

/* ---------- styles ---------- */
var css = document.createElement('style');
css.textContent = [
':root{--clp-h:52px}',
'body{padding-top:var(--clp-h)}',
'.topbar{top:var(--clp-h)!important}',
'#clp-bar{position:fixed;top:0;left:0;right:0;height:var(--clp-h);z-index:3000;background:#12263F;color:#fff;display:flex;align-items:center;gap:8px;padding:0 12px;font:14px/1.2 system-ui,sans-serif;overflow-x:auto}',
'#clp-bar b{white-space:nowrap}#clp-bar .st{margin-left:4px;color:#FCD9A0;white-space:nowrap}#clp-bar .sp{flex:1}',
'#clp-bar button,.clp-btn{font:inherit;border:1px solid #fff6;background:transparent;color:#fff;border-radius:8px;padding:7px 11px;cursor:pointer;white-space:nowrap}',
'#clp-bar button:disabled{opacity:.4;cursor:default}',
'#clp-bar button.pri{background:#fff;color:#12263F;font-weight:700}',
'#clp-bar button:focus-visible,.clp-btn:focus-visible,.clp-x:focus-visible,.clp-add:focus-visible{outline:3px solid #FCD9A0;outline-offset:2px}',
'#app [data-p]{outline:1px dashed #0F766E88;outline-offset:2px;border-radius:3px;min-width:2ch;cursor:text}',
'#app [data-p]:empty::before{content:attr(aria-label);opacity:.5;font-style:italic}',
'#app [data-p]:hover{background:#0F766E14}#app [data-p]:focus{outline:2px solid #0F766E;background:#fff8}',
'#app [data-item]{position:relative}',
'.clp-note{box-sizing:border-box;position:absolute;top:0;right:0;z-index:30;width:max-content;max-width:min(280px,100%);border-radius:10px;font:12.5px/1.45 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.18)}',
'.clp-note>b{display:block;margin:0;padding:3px 10px;font-weight:700;font-size:12px;cursor:pointer;border-radius:10px;white-space:nowrap}',
'.clp-note>b:focus-visible{outline:3px solid #12263F;outline-offset:2px}',
'.clp-note .nbody{display:none;padding:0 10px 8px}',
'.clp-note.open .nbody,.clp-note:hover .nbody{display:block}',
'.clp-note.open,.clp-note:hover{width:280px;z-index:60}',
'.clp-note.dir{background:#DCFCE7;color:#14532D;border:1px solid #86EFAC}',
'.clp-note.auto{background:#DBEAFE;color:#1E3A8A;border:1px solid #93C5FD}',
'.clp-note.mix{background:#FEF3C7;color:#78350F;border:1px solid #FCD34D}',
'.clp-note button{font:inherit;margin-top:5px;margin-right:4px;border:1px solid currentColor;background:#fff;color:inherit;border-radius:6px;padding:2px 9px;cursor:pointer}',
'.clp-note button:focus-visible{outline:3px solid #12263F;outline-offset:2px}',
'#app .head,#app section.sec,#app .hero{position:relative}',
'.clp-note.nb{top:10px;right:16px}',
'.strip>.clp-auto{background:#DBEAFE!important;border-color:#93C5FD!important;color:#1E3A8A!important;cursor:pointer}.strip>.clp-auto .l{color:#1E3A8A!important}.strip>.clp-auto:focus-visible{outline:3px solid #12263F;outline-offset:2px}',
'.clp-tag{display:inline-block;margin-left:8px;padding:1px 8px;border-radius:999px;background:#fff;color:#1E3A8A;border:1px solid #93C5FD;font-size:11px;font-weight:700}',
'body.clp-nonotes .clp-note{display:none!important}',
'@media (max-width:760px){#app .head{display:block}#app .head>.clp-note{margin:0 0 10px}}',
'.clp-x,.clp-lk{position:absolute;top:-10px;z-index:5;width:28px;height:28px;border-radius:50%;border:1px solid #0003;background:#fff;color:#12263F;cursor:pointer;font:16px/1 system-ui;display:grid;place-items:center;padding:0}',
'.clp-x{right:-8px;color:#B91C1C}.clp-lk{right:26px}',
'.clp-add{display:inline-block;margin:10px 0;padding:8px 14px;border:2px dashed #0F766E;border-radius:10px;background:#fff;color:#0F766E;cursor:pointer;font:600 14px system-ui}',
'#clp-toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#12263F;color:#fff;padding:10px 14px;border-radius:10px;z-index:3500;display:none;gap:10px;align-items:center;font:14px system-ui}',
'#clp-toast button{font:inherit;background:#fff;border:0;border-radius:6px;padding:4px 10px;cursor:pointer}',
'.clp-ov{position:fixed;inset:0;background:#0008;z-index:3200;display:flex;justify-content:flex-end}',
'.clp-ov.mid{justify-content:center;align-items:center}',
'.clp-pan{background:#fff;color:#12263F;width:min(520px,100%);height:100%;overflow:auto;padding:18px 18px 40px;font:14px/1.45 system-ui,sans-serif;box-sizing:border-box}',
'.clp-ov.mid .clp-pan{height:auto;max-height:92vh;border-radius:14px;width:min(1000px,96vw)}',
'.clp-pan h2{font-size:18px;margin:0 0 10px}.clp-pan h3{font-size:14px;margin:18px 0 6px;color:#0F766E;text-transform:uppercase;letter-spacing:.04em}',
'.clp-pan label{display:block;font-weight:600;margin:8px 0 3px}.clp-pan input[type=text],.clp-pan input[type=url],.clp-pan input[type=email],.clp-pan input[type=date],.clp-pan select,.clp-pan textarea{width:100%;box-sizing:border-box;padding:7px 8px;border:1px solid #98A2B3;border-radius:7px;font:inherit}',
'.clp-pan .row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.clp-pan .row>*{flex:1;min-width:120px}',
'.clp-pan .clp-chk{display:flex;gap:8px;align-items:center;font-weight:500}.clp-pan .clp-chk input{width:auto}',
'.clp-pan .clp-btn{border-color:#98A2B3;color:#12263F}.clp-pan .clp-btn.pri{background:#12263F;color:#fff}',
'.clp-pan table{border-collapse:collapse;width:100%;font-size:13px}.clp-pan th,.clp-pan td{border-bottom:1px solid #E4E7EC;padding:4px;text-align:left;vertical-align:middle}',
'.clp-pan td input,.clp-pan td select{padding:5px 6px}',
'.clp-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.clp-tabs button{border:1px solid #98A2B3;background:#fff;border-radius:999px;padding:5px 12px;cursor:pointer;font:inherit}.clp-tabs button[aria-selected=true]{background:#12263F;color:#fff}',
'.clp-warn{color:#92400E;font-size:12px}.clp-err{color:#B91C1C}',
'.clp-pan ul.ck{padding-left:18px}'
].join('\n');
document.head.appendChild(css);

/* ---------- bar ---------- */
var bar = document.createElement('div');
bar.id = 'clp-bar'; bar.setAttribute('role', 'toolbar'); bar.setAttribute('aria-label', 'Edit mode');
bar.innerHTML = '<b>' + tr('edit') + '</b><span class="st" id="clp-st" role="status" aria-live="polite"></span><button type="button" id="clp-undo" data-a="undo" disabled>' + tr('undo') + '</button><span class="sp"></span>' +
  '<button type="button" data-a="settings">' + tr('settings') + '</button><button type="button" data-a="schedule">' + tr('schedule') + '</button><button type="button" data-a="assess">Assessment panel</button><button type="button" data-a="check">' + tr('check') + '</button><button type="button" data-a="notes" aria-pressed="false">Hide notes</button>' +
  '<button type="button" class="pri" data-a="download">' + tr('download') + '</button><button type="button" data-a="exit">' + tr('exit') + '</button>';
document.body.insertBefore(bar, document.body.firstChild);
var toast = document.createElement('div'); toast.id = 'clp-toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
function commit() {
  var cur = JSON.stringify(C); if (cur === lastJSON) return;
  var now = Date.now(), same = lastPath && hist.length && lastPath === commit.p && now - lastAt < 1500;
  if (!same) { hist.push(lastJSON); if (hist.length > 60) hist.shift(); }
  commit.p = lastPath; lastAt = now; lastJSON = cur; lastPath = null;
}
function doUndo() {
  if (!hist.length) return;
  var prev = hist.pop(); replaceC(JSON.parse(prev)); lastJSON = prev; commit.p = null;
  if (prev === origJSON) { dirty = {}; structural = 0; } else structural++;
  toast.style.display = 'none'; updateStatus(); refresh();
}
function updateStatus() { commit(); var ub = $('#clp-undo'); if (ub) ub.disabled = !hist.length; var n = count() + structural; $('#clp-st').textContent = n ? (n + ' ' + tr('changes')) : tr('none'); }
updateStatus();
function say(msg, undo) {
  toast.innerHTML = '<span>' + esc(msg) + '</span>' + (undo ? '<button type="button" data-a="undo">' + tr('undo') + '</button>' : '');
  toast.style.display = 'flex'; clearTimeout(say.t); say.t = setTimeout(function () { toast.style.display = 'none'; }, undo ? 8000 : 3500);
}
toast.addEventListener('click', function (e) {
  if (e.target.getAttribute('data-a') === 'undo') doUndo();
});
function replaceC(n) { var o = P.get(); Object.keys(o).forEach(function (k) { delete o[k]; }); Object.keys(n).forEach(function (k) { o[k] = n[k]; }); C = o; }

/* ---------- re-render ---------- */
function refresh(keepFocus) {
  var y = window.scrollY, errs = P.rerender();
  window.scrollTo(0, y);
  if (errs.length) say('Error: ' + errs[0]);
  return errs;
}
var rt = null;
function refreshSoon() { clearTimeout(rt); rt = setTimeout(function () { refresh(); }, 350); }

/* ---------- inline text ---------- */
var REQUIRED = { 'course.code': 1, 'course.title': 1, 'lecturer.name': 1 };
app.addEventListener('input', function (e) {
  var el = e.target.closest('[data-p]'); if (!el) return;
  var path = el.getAttribute('data-p'), v = el.textContent.replace(/\s+/g, ' ').trim();
  if (v === '' && REQUIRED[path]) return;
  if (v === '') { if (path === 'course.welcome') setAt(path, ''); else delAt(path); } else setAt(path, v);
  mark(path);
});
app.addEventListener('focusout', function (e) {
  var el = e.target.closest && e.target.closest('[data-p]'); if (!el) return;
  var path = el.getAttribute('data-p');
  if (REQUIRED[path] && el.textContent.trim() === '') { el.textContent = getAt(path) || ''; say('This field is required.'); }
  if (dirty[path]) refreshSoon();
});
var pendSel = null;
function selAll(el) { var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
app.addEventListener('focusin', function (e) {
  var el = e.target.closest && e.target.closest('[data-p]'); if (!el || !el.textContent) return;
  pendSel = el; selAll(el); setTimeout(function () { if (pendSel === el) pendSel = null; }, 500);
});
app.addEventListener('mouseup', function () { if (pendSel) { selAll(pendSel); pendSel = null; } }, true);
app.addEventListener('keydown', function (e) {
  var el = e.target.closest && e.target.closest('[data-p]'); if (!el) return;
  if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
});
app.addEventListener('paste', function (e) {
  var el = e.target.closest && e.target.closest('[data-p]'); if (!el) return;
  e.preventDefault();
  var txt = (e.clipboardData || window.clipboardData).getData('text/plain').replace(/\s+/g, ' ');
  document.execCommand('insertText', false, txt);
});
app.addEventListener('click', function (e) {
  var a = e.target.closest('a'); if (a && !e.target.closest('.clp-x,.clp-lk')) e.preventDefault();
  if (e.target.closest('.chk')) { e.stopImmediatePropagation(); e.preventDefault(); }
}, true);

/* ---------- item controls ---------- */
var TEMPLATES = {
  'startHere.steps': function () { return { title: M('Langkah baharu', 'New step'), sub: '', link: '', label: '' }; },
  'quickLinks': function () { return { title: M('Pautan baharu', 'New link'), hint: '', link: '' }; },
  'rules.items': function () { return { title: M('Peraturan baharu', 'New rule'), text: '' }; },
  'support': function () { return { title: M('Sokongan baharu', 'New support item'), text: '', link: '' }; },
  'workflow.steps': function () { return { when: '', title: M('Langkah baharu', 'New step'), text: '' }; }
};
var LINKABLE = { 'startHere.steps': 1, 'quickLinks': 1, 'support': 1 };
function listOf(itemPath) { return itemPath.replace(/\.\d+$/, ''); }
function decorate() {
  $$('[data-item]', app).forEach(function (it) {
    var path = it.getAttribute('data-item'), lp = listOf(path), idx = +path.split('.').pop();
    var x = document.createElement('button'); x.type = 'button'; x.className = 'clp-x'; x.textContent = '×';
    x.setAttribute('aria-label', tr('remove') + ' ' + (getAt(path + '.title') || path)); x.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); snapshot(); listAt(lp).splice(idx, 1); structural++; updateStatus(); refresh(); say('Item deleted.', true); });
    it.appendChild(x);
    if (LINKABLE[lp]) {
      var l = document.createElement('button'); l.type = 'button'; l.className = 'clp-lk'; l.textContent = '🔗';
      l.setAttribute('aria-label', tr('link') + ': ' + (getAt(path + '.title') || path)); l.title = 'Link: ' + (getAt(path + '.link') || 'none');
      l.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); linkPicker(path); });
      it.appendChild(l);
    }
  });
  $$('[data-list]', app).forEach(function (ul) {
    var lp = ul.getAttribute('data-list'); if (!TEMPLATES[lp]) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'clp-add'; b.textContent = tr('add');
    b.setAttribute('aria-label', tr('add') + ' (' + lp + ')');
    b.addEventListener('click', function () {
      snapshot();
      if (lp === 'rules.items' && !getAt('rules')) C.rules = { items: [] };
      var arr = listAt(lp, true); arr.push(TEMPLATES[lp]()); structural++; updateStatus(); refresh();
      var fresh = $('[data-item="' + lp + '.' + (arr.length - 1) + '"] [data-p]'); if (fresh) { fresh.focus(); var r = document.createRange(); r.selectNodeContents(fresh); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    });
    ul.insertAdjacentElement('afterend', b);
  });
}
var NOTES = {
  home: ['mix', 'Edit here + Page setup', 'Click any text above to edit it. Class group and Session come from the Schedule panel. Banner style and image: Page setup.', [['schedule', 'Open Schedule panel']]],
  start: ['dir', 'Edit here', 'Click a step to edit it. Use the link icon to choose its button link.'],
  links: ['mix', 'Edit here + Page setup', 'Edit titles and hints here. Link addresses are in Page setup.', [['settings', 'Open Page setup']]],
  schedule: ['auto', 'Automatic', 'Tiles come from the Schedule panel. Click the heading to edit it.', [['schedule', 'Open Schedule panel']]],
  experiments: ['auto', 'Automatic', 'Lab names, CE/OE and dates come from the Schedule panel. Click the heading to edit it.', [['experiments', 'Open Experiments']]],
  workflow: ['dir', 'Edit here', 'Click any text to edit it. Add or remove steps with the small buttons.'],
  assessment: ['auto', 'Automatic', 'Percentages, reports and rubrics come from the Assessment panel. Click the heading to edit it.', [['assess', 'Open Assessment panel']]],
  rules: ['dir', 'Edit here', 'Click any text to edit it. Add or remove items with the small buttons.'],
  lecturer: ['mix', 'Edit here + Page setup', 'Name, position and affiliation: edit here. Email, photo and video: Page setup.', [['settings', 'Open Page setup']]]
};
function notes() {
  Object.keys(NOTES).forEach(function (id) {
    var sec = $('#' + id, app); if (!sec || $('.clp-note', sec) || (sec.previousElementSibling && sec.previousElementSibling.classList.contains('clp-note'))) return;
    var n = NOTES[id], d = document.createElement('aside'), head = $('.head', sec), wrap = $('.wrap', sec);
    d.className = 'clp-note ' + n[0] + (head ? '' : ' nb'); d.setAttribute('role', 'note'); d.setAttribute('contenteditable', 'false');
    d.innerHTML = '<b tabindex="0" role="button" aria-expanded="false">ⓘ ' + n[1] + '</b><div class="nbody">' + esc(n[2]) + (n[3] ? '<br>' + n[3].map(function (x) { return '<button type="button" data-open="' + x[0] + '">' + x[1] + '</button>'; }).join('') : '') + '</div>';
    var strip = id === 'home' ? $('.strip', sec) : null;
    if (strip) strip.parentNode.insertBefore(d, strip); else if (head) head.insertBefore(d, head.firstChild); else sec.insertBefore(d, sec.firstChild);
  });
}
app.addEventListener('click', function (e) {
  var nb = e.target.closest && e.target.closest('.clp-note > b');
  if (nb) { var nn = nb.parentNode, op = nn.classList.toggle('open'); nb.setAttribute('aria-expanded', op ? 'true' : 'false'); return; }
  var b = e.target.closest && e.target.closest('[data-open]'); if (!b) return;
  e.preventDefault(); e.stopPropagation();
  var w = b.getAttribute('data-open');
  if (w === 'settings') settings(); else if (w === 'schedule') schedulePanel(); else if (w === 'experiments') schedulePanel('exp'); else if (w === 'assess') assessmentPanel();
}, true);
/* ---------- photo drop + delete group ---------- */
var photoUrl = null, photoPath = 'assets/lecturer.jpg';
function extras() {
  var ph = $('#ph', app);
  if (ph) {
    ph.setAttribute('title', 'Drag a photo here, or click to choose one'); ph.style.cursor = 'pointer'; ph.style.outline = '2px dashed #0F766E88'; ph.style.outlineOffset = '3px';
    if (photoUrl && getAt('lecturer.photo') === photoPath) { var old = $('img', ph); if (old) old.remove(); var im = document.createElement('img'); im.src = photoUrl; im.alt = ''; ph.insertBefore(im, ph.firstChild); }
  }
  var hasG = C.schedule && C.schedule.groups && C.schedule.groups.length;
  $$('.strip > div:not(.wc)', app).forEach(function (d) {
    var v = $('.v', d), l = $('.l', d); if (!v || !l || v.hasAttribute('data-p') || d.hasAttribute('data-open')) return;
    d.classList.add('clp-auto'); d.setAttribute('data-open', hasG ? 'schedule' : 'settings'); d.setAttribute('role', 'button'); d.tabIndex = 0;
    d.setAttribute('title', hasG ? 'Set in the Schedule panel (click to open)' : 'Set in Page setup (click to open)');
    var tg = document.createElement('span'); tg.className = 'clp-tag'; tg.textContent = (hasG ? 'Schedule panel' : 'Page setup') + ' ↗'; l.appendChild(tg);
  });
  $$('.pick', app).forEach(function (b) {
    if ($('.clp-x', b)) return; b.style.position = 'relative';
    var x = document.createElement('span'); x.className = 'clp-x'; x.setAttribute('role', 'button'); x.tabIndex = 0; x.textContent = '×';
    x.setAttribute('data-delgroup', b.getAttribute('data-k')); x.setAttribute('aria-label', tr('remove') + ' ' + b.getAttribute('data-k')); b.appendChild(x);
  });
}
function delGroup(id) {
  var S = C.schedule; if (!S || !S.groups) return;
  if (S.groups.length <= 1) { say('There must be at least one group.'); return; }
  var i = S.groups.findIndex(function (g) { return g.id === id; }); if (i < 0) return;
  S.groups.splice(i, 1); structural++; updateStatus(); refresh(); say('Group deleted.', true);
}
app.addEventListener('click', function (e) {
  var x = e.target.closest && e.target.closest('[data-delgroup]');
  if (x) { e.preventDefault(); e.stopPropagation(); delGroup(x.getAttribute('data-delgroup')); return; }
  if (e.target.closest && e.target.closest('#ph')) { e.preventDefault(); e.stopPropagation(); fileIn.click(); }
}, true);
app.addEventListener('keydown', function (e) {
  var oa = e.target.classList && e.target.classList.contains('clp-auto') ? e.target : null;
  if (oa && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); oa.click(); return; }
  var x = e.target.closest && e.target.closest('[data-delgroup]');
  if (x && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); delGroup(x.getAttribute('data-delgroup')); }
}, true);
var fileIn = document.createElement('input'); fileIn.type = 'file'; fileIn.accept = 'image/*'; fileIn.hidden = true; document.body.appendChild(fileIn);
fileIn.addEventListener('change', function () { if (fileIn.files[0]) takePhoto(fileIn.files[0]); fileIn.value = ''; });
function isFiles(e) { return e.dataTransfer && [].indexOf.call(e.dataTransfer.types || [], 'Files') >= 0; }
document.addEventListener('dragover', function (e) { if (isFiles(e)) e.preventDefault(); });
document.addEventListener('drop', function (e) {
  if (!isFiles(e)) return; e.preventDefault();
  if (e.target.closest && e.target.closest('#ph') && e.dataTransfer.files[0]) takePhoto(e.dataTransfer.files[0]);
});
function takePhoto(f) {
  if (!/^image\//.test(f.type)) { say('Choose an image file (JPG or PNG).'); return; }
  var src = URL.createObjectURL(f), im = new Image();
  im.onload = function () {
    var k = Math.min(1, 400 / Math.max(im.width, im.height)), cv = document.createElement('canvas');
    cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k);
    var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height); cx.drawImage(im, 0, 0, cv.width, cv.height);
    URL.revokeObjectURL(src);
    cv.toBlob(function (bl) {
      if (!bl) { say('Could not read that image.'); return; }
      if (photoUrl) URL.revokeObjectURL(photoUrl);
      photoUrl = URL.createObjectURL(bl); setAt('lecturer.photo', photoPath); mark('lecturer.photo'); refresh();
      toast.innerHTML = '<span>Photo ready (' + Math.max(1, Math.round(bl.size / 1024)) + ' KB). Save it, then upload it to the assets folder.</span><a href="' + photoUrl + '" download="lecturer.jpg" style="font:inherit;background:#fff;color:#12263F;border-radius:6px;padding:4px 10px;text-decoration:none">Save lecturer.jpg</a>';
      toast.style.display = 'flex'; clearTimeout(say.t); say.t = setTimeout(function () { toast.style.display = 'none'; }, 30000);
    }, 'image/jpeg', 0.88);
  };
  im.onerror = function () { URL.revokeObjectURL(src); say('Could not read that image.'); };
  im.src = src;
}
var decorate0 = decorate; decorate = function () { decorate0(); notes(); extras(); };
P.afterRender = function () { decorate(); };
decorate();

/* ---------- overlay helper ---------- */
var lastFocus = null;
function overlay(html, mid, onClose) {
  lastFocus = document.activeElement;
  var ov = document.createElement('div'); ov.className = 'clp-ov' + (mid ? ' mid' : ''); ov.innerHTML = '<div class="clp-pan" role="dialog" aria-modal="true" tabindex="-1">' + html + '</div>';
  document.body.appendChild(ov);
  var pan = $('.clp-pan', ov);
  function close() { ov.remove(); document.removeEventListener('keydown', onKey, true); if (onClose) onClose(); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); close(); }
    if (e.key === 'Tab') { var f = $$('button,input,select,textarea,a[href]', pan).filter(function (x) { return !x.disabled && x.offsetParent !== null; }); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
  }
  document.addEventListener('keydown', onKey, true);
  ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
  ov.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('[data-close]')) close(); });
  var first = $('input,select,textarea,button', pan); if (first) first.focus(); else pan.focus();
  return { ov: ov, pan: pan, close: close };
}

/* ---------- link picker ---------- */
function linkPicker(itemPath) {
  var cur = getAt(itemPath + '.link') || '', keys = Object.keys(C.links || {}), anchors = P.anchors();
  var opts = [['', '(No link)']];
  keys.forEach(function (k) { opts.push([k, k + ' → ' + C.links[k]]); });
  if (C.lecturer && C.lecturer.email) opts.push(['email', 'Lecturer email']);
  anchors.forEach(function (a) { opts.push([a, 'Section ' + a]); });
  var known = opts.some(function (o) { return o[0] === cur; });
  var html = '<h2>Choose link</h2><fieldset style="border:0;padding:0;margin:0">' + opts.map(function (o, i) {
    return '<label class="clp-chk"><input type="radio" name="lk" value="' + esc(o[0]) + '"' + (o[0] === cur ? ' checked' : '') + '> ' + esc(o[1]) + '</label>';
  }).join('') + '<label class="clp-chk"><input type="radio" name="lk" value="__custom"' + (!known ? ' checked' : '') + '> Other URL:</label></fieldset>' +
    '<input type="url" id="lk-custom" placeholder="https://..." value="' + (!known ? esc(cur) : '') + '">' +
    '<label for="lk-label">Button text (optional)</label><input type="text" id="lk-label" value="' + esc(getAt(itemPath + '.label') || '') + '">' +
    '<p class="row" style="margin-top:14px"><button type="button" class="clp-btn pri" data-ok>Save</button><button type="button" class="clp-btn" data-close>Cancel</button></p>';
  var o = overlay(html, true);
  $('[data-ok]', o.pan).addEventListener('click', function () {
    var v = ($('input[name=lk]:checked', o.pan) || {}).value || '';
    if (v === '__custom') v = $('#lk-custom', o.pan).value.trim();
    snapshot();
    if (v) setAt(itemPath + '.link', v); else delAt(itemPath + '.link');
    var lab = $('#lk-label', o.pan).value.trim(); if (lab) setAt(itemPath + '.label', lab); else delAt(itemPath + '.label');
    mark(itemPath + '.link'); o.close(); refresh();
  });
}

/* ---------- settings drawer ---------- */
function field(path, label, type, extra) {
  var v = getAt(path); return '<label for="f-' + path + '">' + esc(label) + '</label><input id="f-' + path + '" data-f="' + path + '" type="' + (type || 'text') + '" value="' + esc(v == null ? '' : v) + '"' + (extra || '') + '>';
}
function check(path, label) { return '<label class="clp-chk"><input type="checkbox" data-c="' + path + '"' + (getAt(path) === true ? ' checked' : '') + '> ' + esc(label) + '</label>'; }
var STARTER = {
  schedule: function () { if (!C.schedule) C.schedule = { kicker: M('Semester anda', 'Your semester'), title: M('Jadual saya', 'My schedule'), groups: [{ id: M('KUMPULAN-A', 'GROUP-A'), day: M('Isnin', 'Monday'), time: M('9 pagi – 12 tengah hari', '9 am – 12 pm'), dates: ['2027-03-01'], holidays: {} }], plan: [{ type: 'brief', week: 1 }] }; },
  experiments: function () { STARTER.schedule(); if (!C.experiments) C.experiments = { word: 'Lab', title: M('Eksperimen anda', 'Your experiments'), items: [{ name: M('Eksperimen 1', 'Experiment 1'), short: M('Eksperimen 1', 'Experiment 1'), openEnded: false, co: 'CO1', report: 'TR', reportLabel: M('Laporan 1', 'Report 1') }] }; },
  workflow: function () { if (!C.workflow) C.workflow = { kicker: '', title: M('Aliran kerja', 'How it works'), steps: [{ when: M('Minggu 1', 'Week 1'), title: M('Langkah pertama', 'First step'), text: '' }] }; },
  assessment: function () { if (!C.assessment) C.assessment = { title: M('Penilaian', 'Assessment'), weights: [{ label: M('Ujian', 'Test'), percent: 50, detail: '' }, { label: M('Tugasan', 'Coursework'), percent: 50, detail: '' }] }; },
  rules: function () { if (!C.rules) C.rules = { title: M('Peraturan', 'Important rules'), items: [{ title: M('Peraturan pertama', 'First rule'), text: '' }] }; }
};
var SECS = [['schedule', 'Weekly schedule'], ['experiments', 'Experiments'], ['workflow', 'Workflow'], ['assessment', 'Assessment'], ['rules', 'Rules']];
function settings() {
  if (getAt('design.themeToggle') === undefined) { C.design = C.design || {}; C.design.themeToggle = true; }
  if (getAt('footer.credit') === undefined) { C.footer = C.footer || {}; C.footer.credit = false; }
  var html = '<h2>Page setup</h2>' +
    '<h3>Course</h3>' +
    '<label for="f-course.language">Page language</label><select id="f-course.language" data-f="course.language"><option value="en">English</option><option value="ms">Bahasa Melayu</option></select>' +
    '<h3>Appearance</h3>' + '<label for="f-design.theme">Theme</label><select id="f-design.theme" data-f="design.theme"><option value="light">Light</option><option value="dark">Dark emerald</option></select>' +
    '<label for="f-design.hero.style">Banner style</label><select id="f-design.hero.style" data-f="design.hero.style"><option value="art">Illustration</option><option value="image">Image</option><option value="none">None</option></select>' +
    '<div data-imgfields>' + field('design.hero.image', 'Banner image file (e.g. assets/banner.jpg)') + field('design.hero.alt', 'Image description (for screen readers)') + '</div>' +
    '<h3>Lecturer</h3>' + field('lecturer.email', 'Email', 'email') + field('lecturer.photo', 'Photo file (e.g. assets/lecturer.jpg)') + field('lecturer.introVideo', 'Video link (embed)', 'url') +
    '<h3>Sections shown</h3>' + SECS.map(function (s) { return check('sections.' + s[0], s[1]); }).join('') +
    '<h3>Link addresses</h3><p style="font-size:13px;margin:0 0 8px;color:#475569">Write each web address once here. On the page, click the link icon on a card or step to choose it.</p><div id="lkbox"></div>' +
    '<h3>Other</h3>' + field('analytics.goatcounter', 'GoatCounter code (leave empty if unused)') + check('feedback.enabled', 'Show the "was this page helpful?" question') + field('footer.text', 'Footer text (empty = automatic)') + check('design.themeToggle', 'Show the light/dark button in the header (students choose; their choice is saved in their browser)') + check('footer.credit', 'Show the small template credit in the footer (Rahida Wati Sharudin, FKK, UiTM)') +
    '<h3>PrepWISE (optional)</h3>' + check('prepwise.enabled', 'Enable PrepWISE card') + field('prepwise.url', 'URL', 'url') + field('prepwise.label', 'Label') + field('prepwise.text', 'Description') +
    '<p class="row" style="margin-top:18px"><button type="button" class="clp-btn pri" data-close>Done</button></p>';
  var o = overlay(html, false);
  var sel = $('[data-f="course.language"]', o.pan); sel.value = getAt('course.language') === 'ms' ? 'ms' : 'en';
  var th = $('[data-f="design.theme"]', o.pan); th.value = getAt('design.theme') === 'dark' ? 'dark' : 'light';
  var hs = $('[data-f="design.hero.style"]', o.pan); hs.value = getAt('design.hero.style') || 'art';
  var imgBox = $('[data-imgfields]', o.pan);
  function showImg() { imgBox.hidden = hs.value !== 'image'; }
  hs.addEventListener('change', showImg); showImg();
  $$('[data-f]', o.pan).forEach(function (el) {
    el.addEventListener('change', function () {
      var p = el.getAttribute('data-f'), v = el.value.trim();
      if (el.tagName === 'INPUT' && v === '') delAt(p); else setAt(p, v);
      if (p === 'design.theme' && P.resetTheme) P.resetTheme();
      mark(p); refresh();
    });
  });
  $$('[data-c]', o.pan).forEach(function (el) {
    el.addEventListener('change', function () {
      var p = el.getAttribute('data-c'), m = p.match(/^sections\.(\w+)$/);
      snapshot();
      if (m && el.checked && STARTER[m[1]]) STARTER[m[1]]();
      setAt(p, el.checked); mark(p);
      var errs = refresh(); if (errs.length) { setAt(p, !el.checked); el.checked = !el.checked; refresh(); }
    });
  });
  function drawLinks() {
    var box = $('#lkbox', o.pan), keys = Object.keys(C.links || {});
    box.innerHTML = keys.map(function (k) { return '<div class="row"><code style="flex:0 0 120px">' + esc(k) + '</code><input type="url" data-lk="' + esc(k) + '" value="' + esc(C.links[k]) + '" aria-label="URL ' + esc(k) + '"><button type="button" class="clp-btn" style="flex:0 0 auto" data-rm="' + esc(k) + '" aria-label="Delete ' + esc(k) + '">×</button></div>'; }).join('') +
      '<div class="row" style="margin-top:8px"><input type="text" id="nk" placeholder="name (e.g. syllabus)" aria-label="New link name"><input type="url" id="nu" placeholder="https://..." aria-label="New link URL"><button type="button" class="clp-btn" style="flex:0 0 auto" id="nadd">+ Add</button></div><p class="clp-warn" id="lkmsg"></p>';
    $$('[data-lk]', box).forEach(function (i) { i.addEventListener('change', function () { C.links[i.getAttribute('data-lk')] = i.value.trim(); mark('links.' + i.getAttribute('data-lk')); refresh(); }); });
    $$('[data-rm]', box).forEach(function (b) { b.addEventListener('click', function () {
      var k = b.getAttribute('data-rm'), used = JSON.stringify(C).split('"' + k + '"').length - 1 - 1;
      var refs = JSON.stringify(C, function (kk, v) { return kk === 'links' ? undefined : v; }).split('"' + k + '"').length - 1;
      if (refs) { $('#lkmsg', box).textContent = 'Link "' + k + '" is still used in ' + refs + ' place(s). Change those first.'; return; }
      snapshot(); delete C.links[k]; structural++; updateStatus(); drawLinks(); refresh();
    }); });
    $('#nadd', box).addEventListener('click', function () {
      var k = $('#nk', box).value.trim(), u = $('#nu', box).value.trim();
      if (!/^[A-Za-z][\w-]*$/.test(k)) { $('#lkmsg', box).textContent = 'Name must be letters/numbers without spaces (e.g. syllabus).'; return; }
      if (C.links[k]) { $('#lkmsg', box).textContent = 'That name already exists.'; return; }
      if (!/^https?:\/\//i.test(u)) { $('#lkmsg', box).textContent = 'URL must start with https://'; return; }
      snapshot(); C.links[k] = u; structural++; updateStatus(); drawLinks(); refresh();
    });
  }
  C.links = C.links || {}; drawLinks();
}

/* ---------- schedule panel ---------- */
var DAYS = { sunday: 0, ahad: 0, monday: 1, isnin: 1, tuesday: 2, selasa: 2, wednesday: 3, rabu: 3, thursday: 4, khamis: 4, friday: 5, jumaat: 5, saturday: 6, sabtu: 6 };
var DAYMS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var TYPES = [['brief', 'Briefing'], ['lab', 'Lab'], ['consult', 'Consultation'], ['submit', 'Report submission'], ['test', 'Test'], ['break', 'Break / holiday'], ['other', 'Other']];
function addDays(s, n) { var d = P.iso(s); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
function wd(s) { var d = P.iso(s); return isNaN(d.getTime()) ? -1 : d.getDay(); }
function schedulePanel(t0) {
  if (!C.schedule) { STARTER.schedule(); }
  var S = C.schedule, tab = t0 || 'g:0', o;
  function groupsOf() { return S.groups; }
  function PL(g) { return Array.isArray(g.plan) ? g.plan : S.plan; }
  function affected(g) { return Array.isArray(g.plan) ? [g] : S.groups.filter(function (x) { return !Array.isArray(x.plan); }); }
  function allPlans() { var a = [S.plan]; S.groups.forEach(function (x) { if (Array.isArray(x.plan)) a.push(x.plan); }); return a; }
  function render() {
    var gi = tab.indexOf('g:') === 0 ? +tab.slice(2) : -1, g = S.groups[gi];
    var html = '<h2>Schedule panel</h2><div class="clp-tabs" role="tablist">' +
      S.groups.map(function (x, i) { return '<button type="button" role="tab" data-tab="g:' + i + '" aria-selected="' + (tab === 'g:' + i) + '">' + esc(x.id || ('Kumpulan ' + (i + 1))) + '</button>'; }).join('') +
      '<button type="button" data-addg>+ Group</button><button type="button" role="tab" data-tab="exp" aria-selected="' + (tab === 'exp') + '">Experiments</button></div>';
    if (tab === 'exp') html += expHtml(); else if (g) html += groupHtml(g, gi);
    html += '<p class="row" style="margin-top:16px"><button type="button" class="clp-btn pri" data-close>Done</button></p>';
    var keep = o ? o.pan.scrollTop : 0;
    if (o) { o.pan.innerHTML = html; } else { o = overlay(html, true, function () { refresh(); }); }
    o.pan.scrollTop = keep; wire(gi, g);
  }
  function groupHtml(g, gi) {
    var meta = '<div class="row"><div><label for="g-id">Group ID</label><input type="text" id="g-id" data-g="id" value="' + esc(g.id) + '"></div><div><label for="g-day">Day</label><input type="text" id="g-day" data-g="day" value="' + esc(g.day || '') + '"></div><div><label for="g-time">Time</label><input type="text" id="g-time" data-g="time" value="' + esc(g.time || '') + '"></div><div><label for="g-tt">Official timetable link</label><select id="g-tt" data-g="timetable"><option value="">(none)</option>' + Object.keys(C.links || {}).map(function (k) { return '<option' + (g.timetable === k ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select></div></div>';
    var others = S.groups.map(function (x, i) { return i === gi ? '' : '<option value="' + i + '">' + esc(x.id) + '</option>'; }).join('');
    var tools = '<div class="row" style="margin:10px 0"><button type="button" class="clp-btn" data-fill>Fill weekly dates from the first row</button><button type="button" class="clp-btn" data-delg>Delete this group</button></div>' +
      (others ? '<div class="row" style="margin:6px 0;align-items:center"><span style="flex:0 0 auto">Copy all dates from</span><select data-copyfrom aria-label="Copy dates from group" style="flex:0 1 160px">' + others + '</select><span style="flex:0 0 auto">and add</span><input type="text" data-copyn value="3" style="max-width:60px" aria-label="Days to add"><span style="flex:0 0 auto">days</span><button type="button" class="clp-btn" data-copy>Copy dates</button></div>' : '<p class="clp-warn">To add another class group, click "+ Group" above, then rename it in "Group ID".</p>');
    var expOpts = '<option value="">—</option>' + (C.experiments && C.experiments.items || []).map(function (e, i) { return '<option value="' + (i + 1) + '">' + esc((C.experiments.word || 'Lab') + ' ' + (i + 1)) + '</option>'; }).join('');
    var lock = gi > 0 && !Array.isArray(g.plan);
    var rows = PL(g).map(function (p, i) {
      var d = g.dates[i] || '', w = d ? wd(d) : -1, want = DAYS[String(g.day || '').toLowerCase()], warn = '';
      if (d && want != null && w >= 0 && w !== want && !p.noDate) warn = '<div class="clp-warn">⚠ ' + DAYMS[w] + ', not ' + esc(g.day) + '</div>';
      if (i > 0 && d && g.dates[i - 1] && d < g.dates[i - 1]) warn += '<div class="clp-warn">⚠ Earlier than the row above</div>';
      var needExp = (p.type === 'lab' || p.type === 'consult');
      return '<tr data-r="' + i + '"><td>' + (i + 1) + '</td><td><input type="text" data-p="week" value="' + (p.week == null ? '' : p.week) + '" style="width:48px" aria-label="Week, row ' + (i + 1) + '"></td>' +
        '<td><select data-p="type" aria-label="Type, row ' + (i + 1) + '">' + TYPES.map(function (t) { return '<option value="' + t[0] + '"' + (p.type === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></td>' +
        '<td>' + (needExp ? '<select data-p="experiment" aria-label="Experiment, row ' + (i + 1) + '">' + expOpts.replace('value="' + p.experiment + '"', 'value="' + p.experiment + '" selected') + '</select>' + (p.experiment && C.experiments && C.experiments.items[p.experiment - 1] ? '<select data-p="exptype" aria-label="CE or OE, row ' + (i + 1) + '" style="margin-top:3px"><option value="CE"' + (!C.experiments.items[p.experiment - 1].openEnded ? ' selected' : '') + '>CE</option><option value="OE"' + (C.experiments.items[p.experiment - 1].openEnded ? ' selected' : '') + '>OE</option></select>' : '') : '') + '</td>' +
        '<td><select data-p="submit" aria-label="Submit report, row ' + (i + 1) + '"><option value="">—</option>' + (C.experiments && C.experiments.items || []).map(function (e, k) { return '<option value="' + (k + 1) + '"' + (p.submit === k + 1 ? ' selected' : '') + '>Report ' + (k + 1) + '</option>'; }).join('') + '</select></td>' +
        '<td>' + (p.type === 'other' ? '<input type="text" data-p="label" value="' + esc(p.label || '') + '" placeholder="Label (e.g. Midterm)" aria-label="Label, row ' + (i + 1) + '" style="margin-bottom:3px">' : '') + '<input type="text" data-p="note" value="' + esc(p.note || '') + '" aria-label="Note, row ' + (i + 1) + '"></td>' +
        '<td><input type="date" data-d value="' + esc(d) + '" aria-label="Date, row ' + (i + 1) + '">' + warn + '</td>' +
        '<td><input type="text" data-h value="' + esc((g.holidays && g.holidays[i]) || '') + '" placeholder="holiday?" style="width:90px" aria-label="Holiday, row ' + (i + 1) + '"></td>' +
        '<td style="white-space:nowrap"><button type="button" class="clp-btn" data-ins="' + i + '" aria-label="Insert row after ' + (i + 1) + '">＋</button> <button type="button" class="clp-btn" data-del="' + i + '" aria-label="Delete row ' + (i + 1) + '">×</button></td></tr>';
    }).join('');
    if (lock) rows = rows.replace(/<select data-p=/g, '<select disabled data-p=').replace(/<input type="text" data-p=/g, '<input type="text" disabled data-p=').replace(/<td style="white-space:nowrap">.*?<\/td><\/tr>/g, '<td></td></tr>');
    var own = gi > 0 ? '<label class="clp-chk" style="margin:8px 0"><input type="checkbox" data-own' + (Array.isArray(g.plan) ? ' checked' : '') + '> This group has its own order of sessions</label>' + (lock ? '<p class="clp-warn">Types and labs follow ' + esc(S.groups[0].id) + '. Only the dates can be changed here.</p>' : '') : '';
    return meta + own + tools + '<p class="clp-warn">Choose the lab, then set it as CE (closed-ended, fixed procedure) or OE (open-ended, students plan their own). The choice applies to every row of the same lab.</p><div style="overflow:auto"><table><thead><tr><th>#</th><th>Wk</th><th>Type</th><th>Lab</th><th>Submit report</th><th>Note</th><th>Date</th><th>Holiday</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div>' + (lock ? '' : '<button type="button" class="clp-btn" data-addrow style="margin-top:8px">+ Add row</button>');
  }
  function expHtml() {
    var items = (C.experiments && C.experiments.items) || [], rep = ((C.assessment && C.assessment.reports) || []).map(function (r) { return r.code; });
    var rows = items.map(function (e, i) {
      return '<tr data-e="' + i + '"><td>' + (i + 1) + '</td><td><input type="text" data-k="name" value="' + esc(e.name) + '" aria-label="Experiment name ' + (i + 1) + '"></td><td><input type="text" data-k="short" value="' + esc(e.short || '') + '" aria-label="Short name ' + (i + 1) + '"></td>' +
        '<td><select data-k="openEnded" aria-label="Type ' + (i + 1) + '"><option value="0"' + (!e.openEnded ? ' selected' : '') + '>Closed-ended</option><option value="1"' + (e.openEnded ? ' selected' : '') + '>Open-ended</option></select></td>' +
        '<td><input type="text" data-k="co" value="' + esc(e.co || '') + '" style="width:80px" aria-label="CO ' + (i + 1) + '"></td><td><input type="text" data-k="report" value="' + esc(e.report || '') + '" style="width:60px" aria-label="Report code ' + (i + 1) + '"></td>' +
        '<td><input type="text" data-k="reportLabel" value="' + esc(e.reportLabel || '') + '" aria-label="Report label ' + (i + 1) + '"></td>' +
        '<td><select data-k="manual" aria-label="Manual ' + (i + 1) + '"><option value="">(none)</option>' + Object.keys(C.links || {}).map(function (k) { return '<option' + (e.manual === k ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select></td>' +
        '<td><button type="button" class="clp-btn" data-edel="' + i + '" aria-label="Delete experiment ' + (i + 1) + '">×</button></td></tr>';
    }).join('');
    return '<p class="clp-warn">Lab numbers follow the order of this list; schedule rows refer to these numbers.</p><div style="overflow:auto"><table><thead><tr><th>#</th><th>Name</th><th>Short</th><th>Type</th><th>CO</th><th>Report code</th><th>Report label</th><th>Manual</th><th></th></tr></thead><tbody>' + rows + '</tbody></table></div><button type="button" class="clp-btn" data-addexp style="margin-top:8px">+ Add experiment</button>' + (rep.length ? '' : '<p class="clp-warn">Report codes (TR/LR) link to the Assessment section.</p>');
  }
  function wire(gi, g) {
    var pan = o.pan;
    $$('[data-tab]', pan).forEach(function (b) { b.addEventListener('click', function () { tab = b.getAttribute('data-tab'); render(); }); });
    var ag = $('[data-addg]', pan); if (ag) ag.addEventListener('click', function () { snapshot(); var n = { id: M('KUMPULAN-', 'GROUP-') + (S.groups.length + 1), day: '', time: '', dates: S.plan.map(function () { return ''; }), holidays: {} }; S.groups.push(n); structural++; updateStatus(); tab = 'g:' + (S.groups.length - 1); render(); });
    if (tab === 'exp') {
      $$('tr[data-e]', pan).forEach(function (tr0) {
        var i = +tr0.getAttribute('data-e'), e = C.experiments.items[i];
        $$('[data-k]', tr0).forEach(function (el) { el.addEventListener('change', function () { var k = el.getAttribute('data-k'), v = el.value.trim(); if (k === 'openEnded') e.openEnded = v === '1'; else if (v === '') delete e[k]; else e[k] = v; mark('experiments.items.' + i + '.' + k); }); });
      });
      $$('[data-edel]', pan).forEach(function (b) { b.addEventListener('click', function () {
        var n = +b.getAttribute('data-edel') + 1, used = allPlans().some(function (pl) { return pl.some(function (p) { return p.experiment === n || p.submit === n; }); });
        if (used) { say('Experiment ' + n + ' is still used in the schedule. Change those rows first.'); return; }
        snapshot(); C.experiments.items.splice(n - 1, 1);
        allPlans().forEach(function (pl) { pl.forEach(function (p) { if (p.experiment > n) p.experiment--; if (p.submit > n) p.submit--; }); });
        structural++; updateStatus(); render();
      }); });
      var ae = $('[data-addexp]', pan); if (ae) ae.addEventListener('click', function () { snapshot(); if (!C.experiments) STARTER.experiments(); else C.experiments.items.push({ name: M('Eksperimen baharu', 'New experiment'), short: M('Baharu', 'New'), openEnded: false, co: '', report: '', reportLabel: '' }); structural++; updateStatus(); render(); });
      return;
    }
    if (!g) return;
    $$('[data-g]', pan).forEach(function (el) { el.addEventListener('change', function () { var k = el.getAttribute('data-g'), v = el.value.trim(); if (k === 'id' && !v) { el.value = g.id; return; } if (v === '') delete g[k]; else g[k] = v; mark('schedule.groups.' + gi + '.' + k); if (k === 'id' || k === 'day') render(); }); });
    $$('tr[data-r]', pan).forEach(function (tr0) {
      var i = +tr0.getAttribute('data-r'), p = PL(g)[i];
      $$('[data-p]', tr0).forEach(function (el) { el.addEventListener('change', function () {
        var k = el.getAttribute('data-p'), v = el.value.trim();
        if (k === 'week') { p.week = v === '' ? null : (+v || null); }
        else if (k === 'type') { p.type = v; if (v !== 'lab' && v !== 'consult') delete p.experiment; if (v === 'break') p.week = null; }
        else if (k === 'experiment' || k === 'submit') { if (v) p[k] = +v; else delete p[k]; }
        else if (k === 'exptype') { var ex = C.experiments && C.experiments.items[p.experiment - 1]; if (ex) ex.openEnded = (v === 'OE'); mark('experiments.items.' + (p.experiment - 1) + '.openEnded'); }
        else if (k === 'note') { if (v) p.note = v; else delete p.note; }
        else if (k === 'label') { if (v) { p.label = v; if (!p.legend) p.legend = v; } else delete p.label; }
        mark('schedule.plan.' + i + '.' + k); render();
      }); });
      $('[data-d]', tr0).addEventListener('change', function (e) { g.dates[i] = e.target.value; mark('schedule.groups.' + gi + '.dates.' + i); render(); });
      $('[data-h]', tr0).addEventListener('change', function (e) { g.holidays = g.holidays || {}; var v = e.target.value.trim(); if (v) g.holidays[i] = v; else delete g.holidays[i]; mark('schedule.groups.' + gi + '.holidays'); });
    });
    function shiftHolidays(from, delta) { affected(g).forEach(function (x) { var n = {}; Object.keys(x.holidays || {}).forEach(function (k) { var j = +k; if (delta > 0 ? j > from : j >= from) n[j + delta] = x.holidays[k]; else if (delta < 0 && j < from) n[j] = x.holidays[k]; else if (delta > 0) n[j] = x.holidays[k]; }); x.holidays = n; }); }
    $$('[data-ins]', pan).forEach(function (b) { b.addEventListener('click', function () {
      snapshot(); var i = +b.getAttribute('data-ins'), prev = PL(g)[i];
      PL(g).splice(i + 1, 0, { type: 'lab', week: prev && prev.week ? prev.week + 1 : null });
      affected(g).forEach(function (x) { var prevd = x.dates[i]; x.dates.splice(i + 1, 0, prevd ? addDays(prevd, 7) : ''); });
      shiftHolidays(i, 1); structural++; updateStatus(); render();
    }); });
    $$('[data-del]', pan).forEach(function (b) { b.addEventListener('click', function () {
      if (PL(g).length <= 1) { say('There must be at least one row.'); return; }
      snapshot(); var i = +b.getAttribute('data-del'); PL(g).splice(i, 1); affected(g).forEach(function (x) { x.dates.splice(i, 1); }); shiftHolidays(i, -1); structural++; updateStatus(); render();
    }); });
    var ar = $('[data-addrow]', pan); if (ar) ar.addEventListener('click', function () { snapshot(); var last = PL(g)[PL(g).length - 1]; PL(g).push({ type: 'lab', week: last && last.week ? last.week + 1 : null }); affected(g).forEach(function (x) { var ld = x.dates[x.dates.length - 1]; x.dates.push(ld ? addDays(ld, 7) : ''); }); structural++; updateStatus(); render(); });
    $('[data-fill]', pan).addEventListener('click', function () { if (!g.dates[0]) { say('Enter the first row date first.'); return; } snapshot(); for (var i = 1; i < g.dates.length; i++) g.dates[i] = addDays(g.dates[0], 7 * i); structural++; updateStatus(); render(); });
    var cp = $('[data-copy]', pan); if (cp) cp.addEventListener('click', function () { var src = S.groups[+$('[data-copyfrom]', pan).value], n = parseInt($('[data-copyn]', pan).value, 10) || 0; if (src.dates.length !== g.dates.length) { say('These groups have a different number of rows, so dates cannot be copied.'); return; } snapshot(); g.dates = src.dates.map(function (d) { return d ? addDays(d, n) : ''; }); structural++; updateStatus(); render(); });
    var ow = $('[data-own]', pan); if (ow) ow.addEventListener('change', function () {
      if (ow.checked) { snapshot(); g.plan = JSON.parse(JSON.stringify(S.plan)); structural++; updateStatus(); render(); return; }
      if (!window.confirm('Remove the own session order of ' + g.id + '? It will follow ' + S.groups[0].id + ' again and its own rows will be lost.')) { ow.checked = true; return; }
      snapshot(); delete g.plan; var n = S.plan.length; while (g.dates.length > n) g.dates.pop(); while (g.dates.length < n) g.dates.push('');
      Object.keys(g.holidays || {}).forEach(function (k) { if (+k >= n) delete g.holidays[k]; });
      structural++; updateStatus(); render();
    });
    $('[data-delg]', pan).addEventListener('click', function () { if (S.groups.length <= 1) { say('There must be at least one group.'); return; } snapshot(); S.groups.splice(gi, 1); tab = 'g:0'; structural++; updateStatus(); render(); });
  }
  render();
}

/* ---------- assessment panel ---------- */
function assessmentPanel() {
  if (!C.assessment) STARTER.assessment();
  var A = C.assessment, o;
  if (!Array.isArray(A.weights)) A.weights = [];
  if (!Array.isArray(A.reports)) A.reports = [];
  function inp(attrs, val, label, w) { return '<input type="text" ' + attrs + ' value="' + esc(val == null ? '' : val) + '" aria-label="' + esc(label) + '"' + (w ? ' style="width:' + w + 'px"' : '') + '>'; }
  function render() {
    var sum = A.weights.reduce(function (a, w) { return a + (+w.percent || 0); }, 0);
    var html = '<h2>Assessment panel</h2><h3>Mark weights</h3><table><thead><tr><th>Label</th><th>%</th><th>Details</th><th></th></tr></thead><tbody>' +
      A.weights.map(function (w, i) { return '<tr data-w="' + i + '"><td>' + inp('data-k="label"', w.label, 'Weight label ' + (i + 1)) + '</td><td>' + inp('data-k="percent"', w.percent, 'Percent ' + (i + 1), 60) + '</td><td>' + inp('data-k="detail"', w.detail, 'Details ' + (i + 1)) + '</td><td><button type="button" class="clp-btn" data-wdel="' + i + '" aria-label="Delete weight ' + (i + 1) + '">×</button></td></tr>'; }).join('') +
      '</tbody></table><p class="' + (sum === 100 ? '' : 'clp-warn') + '">Total: ' + sum + '%' + (sum === 100 ? ' ✔' : ' ⚠ should be 100%') + '</p><button type="button" class="clp-btn" data-wadd>+ Add weight</button><p class="clp-warn">Use {testDate} in details to insert the test date automatically.</p>' +
      '<h3>Report cards / rubrics</h3>' + A.reports.map(function (r, i) { return reportHtml(r, i); }).join('') + '<button type="button" class="clp-btn" data-radd>+ Add report</button>' +
      '<p class="row" style="margin-top:16px"><button type="button" class="clp-btn pri" data-close>Done</button></p>';
    var keep = o ? o.pan.scrollTop : 0;
    if (o) o.pan.innerHTML = html; else o = overlay(html, true, function () { refresh(); });
    o.pan.scrollTop = keep; wire();
  }
  function reportHtml(r, i) {
    var crit = Array.isArray(r.criteria) ? r.criteria : [], cs = crit.reduce(function (a, c) { return a + (+c[1] || 0); }, 0), sc = +r.scale || cs;
    var lk = Object.keys(C.links || {});
    return '<fieldset data-r="' + i + '" style="border:1px solid #98A2B3;border-radius:10px;margin:10px 0;padding:10px"><legend><b>' + esc(r.code || 'Report ' + (i + 1)) + '</b></legend>' +
      '<div class="row"><div><label>Code</label>' + inp('data-rk="code"', r.code, 'Report code') + '</div><div><label>Name</label>' + inp('data-rk="name"', r.name, 'Report name') + '</div><div><label>Mode (e.g. Individual)</label>' + inp('data-rk="mode"', r.mode, 'Mode') + '</div>' +
      '<div><label>Mode colour</label><select data-rk="modeTone" aria-label="Mode colour"><option value="blue"' + (r.modeTone !== 'pink' ? ' selected' : '') + '>Blue</option><option value="pink"' + (r.modeTone === 'pink' ? ' selected' : '') + '>Pink</option></select></div>' +
      '<div><label>Related labs (text)</label>' + inp('data-rk="labs"', r.labs, 'Related labs') + '</div><div><label>Scale (full marks)</label>' + inp('data-rk="scale"', r.scale, 'Scale', 70) + '</div></div>' +
      '<table style="margin-top:8px"><thead><tr><th>Criteria</th><th>Marks</th><th></th></tr></thead><tbody>' + crit.map(function (c, j) { return '<tr data-c="' + j + '"><td><input type="text" data-ck="0" value="' + esc(c[0]) + '" aria-label="Criterion ' + (j + 1) + '"></td><td><input type="text" data-ck="1" value="' + esc(c[1]) + '" style="width:60px" aria-label="Marks ' + (j + 1) + '"></td><td><button type="button" class="clp-btn" data-cdel="' + j + '" aria-label="Delete criterion ' + (j + 1) + '">×</button></td></tr>'; }).join('') + '</tbody></table>' +
      '<p>Criteria total: ' + cs + (cs !== sc ? ' (converted to a scale of ' + sc + ')' : '') + ' <button type="button" class="clp-btn" data-cadd>+ Criterion</button></p>' +
      '<div><b>Link buttons</b></div>' + (r.buttons || []).map(function (b, j) { return '<div class="row" data-b="' + j + '"><input type="text" data-bk="label" value="' + esc(b.label) + '" aria-label="Button label ' + (j + 1) + '"><select data-bk="link" aria-label="Button link ' + (j + 1) + '"><option value="">(choose)</option>' + lk.map(function (k) { return '<option' + (b.link === k ? ' selected' : '') + '>' + esc(k) + '</option>'; }).join('') + '</select><button type="button" class="clp-btn" style="flex:0 0 auto" data-bdel="' + j + '" aria-label="Delete button ' + (j + 1) + '">×</button></div>'; }).join('') +
      '<button type="button" class="clp-btn" data-badd style="margin-top:6px">+ Button</button> <button type="button" class="clp-btn" data-rdel style="margin-top:6px">Delete this report</button></fieldset>';
  }
  function wire() {
    var pan = o.pan;
    $$('tr[data-w]', pan).forEach(function (tr0) { var i = +tr0.getAttribute('data-w'), w = A.weights[i];
      $$('[data-k]', tr0).forEach(function (el) { el.addEventListener('change', function () { var k = el.getAttribute('data-k'), v = el.value.trim(); if (k === 'percent') w.percent = v === '' ? 0 : (+v || 0); else if (v === '') delete w[k]; else w[k] = v; mark('assessment.weights.' + i + '.' + k); render(); }); }); });
    $$('[data-wdel]', pan).forEach(function (b) { b.addEventListener('click', function () { snapshot(); A.weights.splice(+b.getAttribute('data-wdel'), 1); structural++; updateStatus(); render(); }); });
    $('[data-wadd]', pan).addEventListener('click', function () { snapshot(); A.weights.push({ label: M('Baharu', 'New'), percent: 0, detail: '' }); structural++; updateStatus(); render(); });
    $('[data-radd]', pan).addEventListener('click', function () { snapshot(); A.reports.push({ code: 'R' + (A.reports.length + 1), name: M('Laporan baharu', 'New report'), mode: 'Individual', modeTone: 'blue', labs: '', scale: 100, criteria: [[M('Kriteria 1', 'Criterion 1'), 100]], buttons: [] }); structural++; updateStatus(); render(); });
    $$('fieldset[data-r]', pan).forEach(function (fs) {
      var i = +fs.getAttribute('data-r'), r = A.reports[i];
      $$('[data-rk]', fs).forEach(function (el) { el.addEventListener('change', function () { var k = el.getAttribute('data-rk'), v = el.value.trim(); if (k === 'scale') { if (v === '') delete r.scale; else r.scale = +v || 0; } else if (v === '') delete r[k]; else r[k] = v; mark('assessment.reports.' + i + '.' + k); render(); }); });
      $$('tr[data-c]', fs).forEach(function (tr0) { var j = +tr0.getAttribute('data-c'); $$('[data-ck]', tr0).forEach(function (el) { el.addEventListener('change', function () { var k = +el.getAttribute('data-ck'); r.criteria[j][k] = k === 1 ? (+el.value || 0) : el.value.trim(); mark('assessment.reports.' + i + '.criteria'); render(); }); }); });
      $$('[data-cdel]', fs).forEach(function (b) { b.addEventListener('click', function () { snapshot(); r.criteria.splice(+b.getAttribute('data-cdel'), 1); structural++; updateStatus(); render(); }); });
      $('[data-cadd]', fs).addEventListener('click', function () { snapshot(); (r.criteria = r.criteria || []).push([M('Kriteria baharu', 'New criterion'), 0]); structural++; updateStatus(); render(); });
      $$('div[data-b]', fs).forEach(function (d) { var j = +d.getAttribute('data-b'); $$('[data-bk]', d).forEach(function (el) { el.addEventListener('change', function () { r.buttons[j][el.getAttribute('data-bk')] = el.value.trim(); mark('assessment.reports.' + i + '.buttons'); }); }); });
      $$('[data-bdel]', fs).forEach(function (b) { b.addEventListener('click', function () { snapshot(); r.buttons.splice(+b.getAttribute('data-bdel'), 1); structural++; updateStatus(); render(); }); });
      $('[data-badd]', fs).addEventListener('click', function () { snapshot(); (r.buttons = r.buttons || []).push({ label: M('Butang', 'Button'), link: '' }); structural++; updateStatus(); render(); });
      $('[data-rdel]', fs).addEventListener('click', function () { snapshot(); A.reports.splice(i, 1); structural++; updateStatus(); render(); });
    });
  }
  render();
}

/* ---------- checker ---------- */
function checker() {
  var errs = P.validate(), items = [], S = C.schedule;
  var tx = JSON.stringify(C);
  Object.keys(C.links || {}).forEach(function (k) { if (!C.links[k]) items.push('Link "' + k + '" is empty.'); });
  function chkLinks(arr, base) { (arr || []).forEach(function (x, i) { if (x.link && !(C.links && C.links[x.link]) && x.link !== 'email' && !/^(#|https?:|mailto:|tel:)/i.test(x.link)) items.push(base + ' ' + (i + 1) + ': link "' + x.link + '" does not exist.'); }); }
  chkLinks(C.startHere && C.startHere.steps, 'Start here'); chkLinks(C.quickLinks, 'Quick links'); chkLinks(C.support, 'Support');
  (C.quickLinks || []).concat((C.startHere && C.startHere.steps) || []).forEach(function (x) { if (x.link && x.link.charAt(0) === '#' && P.anchors().indexOf(x.link) < 0) items.push('Link "' + x.link + '" points to a section that is switched off.'); });
  if (S && S.plan && C.experiments && C.experiments.items) {
    C.experiments.items.forEach(function (e, i) { S.groups.forEach(function (g) { var pl = Array.isArray(g.plan) ? g.plan : S.plan; if (!pl.some(function (p) { return p.type === 'lab' && p.experiment === i + 1; })) items.push('Experiment ' + (i + 1) + ' has no "Lab" row for ' + g.id + '.'); }); });
    S.groups.forEach(function (g) { g.dates.forEach(function (d, i) { var w = DAYS[String(g.day || '').toLowerCase()]; if (d && w != null && wd(d) !== w && !(Array.isArray(g.plan) ? g.plan : S.plan)[i].noDate) items.push(g.id + ' row ' + (i + 1) + ': ' + d + ' is a ' + DAYMS[wd(d)] + ', not ' + g.day + '.'); }); });
  }
  if (C.assessment && Array.isArray(C.assessment.weights) && C.assessment.weights.length) { var ws = C.assessment.weights.reduce(function (a, w) { return a + (+w.percent || 0); }, 0); if (ws !== 100) items.push('Assessment weights add up to ' + ws + '%, not 100%.'); }
    (P.warnings() || []).forEach(function (w) { items.push(w); });
  var html = '<h2>Check</h2>' + (errs.length ? '<h3 class="clp-err">Must fix</h3><ul class="ck">' + errs.map(function (m) { return '<li class="clp-err">' + esc(m) + '</li>'; }).join('') + '</ul>' : '<p>✔ No errors that block the page.</p>') +
    (items.length ? '<h3>Please review</h3><ul class="ck">' + items.map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul>' : '<p>✔ No warnings.</p>') + '<p class="row"><button type="button" class="clp-btn pri" data-close>Close</button></p>';
  overlay(html, true);
}

/* ---------- download ---------- */
function ser(v, ind) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  var pad = new Array(ind + 1).join('  '), inner = pad + '  ';
  var flatItems = Array.isArray(v) ? v.map(function (x) { return JSON.stringify(x); }) : Object.keys(v).map(function (k) { return JSON.stringify(k) + ': ' + JSON.stringify(v[k]); });
  var flat = Array.isArray(v) ? '[' + flatItems.join(', ') + ']' : (flatItems.length ? '{ ' + flatItems.join(', ') + ' }' : '{}');
  if (flat.length <= 100) return flat;
  if (Array.isArray(v)) return '[\n' + v.map(function (x) { return inner + ser(x, ind + 1); }).join(',\n') + '\n' + pad + ']';
  return '{\n' + Object.keys(v).map(function (k) { return inner + JSON.stringify(k) + ': ' + ser(v[k], ind + 1); }).join(',\n') + '\n' + pad + '}';
}
function download() {
  var errs = P.validate();
  if (errs.length && !window.confirm('Errors found:\n- ' + errs.join('\n- ') + '\n\nDownload anyway?')) return;
  var text = ser(C, 0) + '\n';
  try { JSON.parse(text); } catch (e) { text = JSON.stringify(C, null, 2) + '\n'; }
  var js = window.__clpSource === 'js', fname = js ? 'content.js' : 'content.json';
  if (js) text = "/* Course content. Edit with index.html?edit and press 'Download content.js', then replace this file. */\nwindow.__courseContent = " + text.trim() + ";\n";
  var blob = new Blob([text], { type: js ? 'text/javascript' : 'application/json' }), a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = fname; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  dirty = {}; structural = 0; updateStatus(); window.__clpLast = text;
  say(fname + ' downloaded. If the browser warns about the file, choose Keep. Then replace the old file in your folder (or upload it to GitHub).');
}

/* ---------- bar actions + leave guard ---------- */
bar.addEventListener('click', function (e) {
  var a = e.target.getAttribute && e.target.getAttribute('data-a'); if (!a) return;
  if (a === 'undo') doUndo(); else if (a === 'settings') settings(); else if (a === 'schedule') schedulePanel(); else if (a === 'assess') assessmentPanel(); else if (a === 'check') checker(); else if (a === 'notes') { var h = document.body.classList.toggle('clp-nonotes'); e.target.setAttribute('aria-pressed', h ? 'true' : 'false'); e.target.textContent = h ? 'Show notes' : 'Hide notes'; } else if (a === 'download') download();
  else if (a === 'exit') { if ((count() + structural) && !window.confirm('You have unsaved changes. Exit anyway?')) return; window.onbeforeunload = null; location.search = location.search.replace(/([?&])edit(=[^&]*)?(&|$)/, '$1').replace(/[?&]$/, ''); }
});
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && !e.target.closest('input,textarea,select,[data-p]') && hist.length) { e.preventDefault(); doUndo(); }
});
window.onbeforeunload = function (e) { if (count() + structural) { e.preventDefault(); e.returnValue = ''; return ''; } };
window.__clpEditor = { ser: ser, download: download };
})();
