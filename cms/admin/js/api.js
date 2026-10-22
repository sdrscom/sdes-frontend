let currentUser = null;

// The signed-in user is remembered for this browser tab so the next page can
// draw the sidebar immediately instead of waiting for /admin/api/me.
const USER_CACHE_KEY = 'sdes_cms_user';
function readCachedUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_CACHE_KEY) || 'null');
  } catch {
    return null;
  }
}
function writeCachedUser(user) {
  try {
    if (user) sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify({ id: user.id, username: user.username, role: user.role }));
    else sessionStorage.removeItem(USER_CACHE_KEY);
  } catch {}
}

async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    ...options,
  });
  if (res.status === 401 && !path.includes('/admin/api/login')) {
    writeCachedUser(null);
    window.location.href = '/index.html';
    throw new Error('Not authenticated');
  }
  return res;
}

async function apiJson(path, method, body) {
  const res = await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// Where each role lands after sign-in or when it opens a page it can't use.
const ROLE_HOME = { admin: '/dashboard.html', appointments: '/appointments.html' };
function homeFor(user) {
  return ROLE_HOME[user?.role] || '/index.html';
}

// `roles` lists who may open the current page (administrators by default).
async function requireSession(roles = ['admin']) {
  const res = await apiFetch('/admin/api/me');
  if (!res.ok) {
    window.location.href = '/index.html';
    return null;
  }
  const { user } = await res.json();
  currentUser = user;
  writeCachedUser(user);
  if (!roles.includes(user.role)) {
    window.location.href = homeFor(user);
    return null;
  }
  return user;
}

function showToast(message, isError = false) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast' + (isError ? ' error' : '');
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function timeAgo(sqlDate) {
  if (!sqlDate) return '';
  // SQLite datetime('now') is UTC without a zone marker.
  const date = new Date(String(sqlDate).replace(' ', 'T') + (String(sqlDate).endsWith('Z') ? '' : 'Z'));
  const s = Math.round((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return date.toLocaleDateString();
}

function formatBytes(n) {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

async function logout() {
  writeCachedUser(null);
  await apiFetch('/admin/api/logout', { method: 'POST' });
  window.location.href = '/index.html';
}

// ---------- Icons (Lucide-style strokes) ----------
const ICON_PATHS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  pages: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/><path d="M8 13h8M8 17h5"/>',
  news: '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>',
  gallery: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  careers: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  applications: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
  files: '<path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  external: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/>',
  chevronDown: '<path d="m6 9 6 6 6-6"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  trash: '<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  up: '<path d="m18 15-6-6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
  text: '<path d="M4 7V4h16v3M9 20h6M12 4v16"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  keyboard: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>',
  layers: '<path d="m12 2 10 5-10 5L2 7l10-5Z"/><path d="m2 17 10 5 10-5M2 12l10 5 10-5"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/><path d="M14 2v5h5"/>',
};

function icon(name, cls = 'icon') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON_PATHS[name] || ''}</svg>`;
}

// ---------- App shell ----------
// Items are for administrators unless they list other `roles`.
const NAV_GROUPS = [
  { label: 'Overview', items: [{ href: '/dashboard.html', label: 'Dashboard', icon: 'dashboard' }] },
  {
    label: 'Operations',
    items: [{ href: '/appointments.html', label: 'Appointments', icon: 'calendar', roles: ['admin', 'appointments'] }],
  },
  {
    label: 'Content',
    items: [
      { href: '/pages.html', label: 'Pages', icon: 'pages', match: ['/page-edit.html'] },
      { href: '/news.html', label: 'News', icon: 'news' },
      { href: '/gallery.html', label: 'Gallery', icon: 'gallery' },
      { href: '/careers.html', label: 'Careers', icon: 'careers' },
      { href: '/applications.html', label: 'Applications', icon: 'applications' },
    ],
  },
  { label: 'Library', items: [{ href: '/files.html', label: 'Files', icon: 'files' }] },
  { label: 'Settings', items: [{ href: '/users.html', label: 'Users', icon: 'users' }] },
];

function navGroupsFor(user) {
  const role = user?.role || 'admin';
  return NAV_GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => (i.roles || ['admin']).includes(role)) })).filter(
    (g) => g.items.length
  );
}

const FRONTEND_ORIGIN_KEY = 'sdes_cms_frontend_origin';
function frontendOrigin() {
  try {
    return localStorage.getItem(FRONTEND_ORIGIN_KEY) || 'http://localhost:5173';
  } catch {
    return 'http://localhost:5173';
  }
}
function rememberFrontendOrigin(origin) {
  if (!origin) return;
  try {
    localStorage.setItem(FRONTEND_ORIGIN_KEY, origin);
  } catch {}
}

function renderNav(active) {
  const userKey = `${currentUser?.username}|${currentUser?.role}`;
  const drawn = document.querySelector('.shell');
  if (drawn) {
    // Already drawn from the cached user; only redraw if the account changed.
    if (drawn.dataset.user !== userKey) window.location.reload();
    return;
  }
  const mount = document.getElementById('app-nav');
  if (!mount) return;
  const path = active || window.location.pathname;
  const user = currentUser?.username || '';
  const isAdmin = (currentUser?.role || 'admin') === 'admin';

  const shell = document.createElement('div');
  shell.className = 'shell';
  shell.dataset.user = userKey;
  shell.innerHTML = `
    <aside class="sidebar" aria-label="Main navigation">
      <a class="brand" href="${homeFor(currentUser) === '/index.html' ? '/dashboard.html' : homeFor(currentUser)}">
        <div class="brand-mark"><img src="/img/logo-mark.png" alt="SDES logo" /></div>
        <div class="brand-text"><strong>SDES</strong><span>Content Manager</span></div>
      </a>
      ${navGroupsFor(currentUser).map(
        (g) => `
        <div class="nav-group">
          <div class="nav-label">${g.label}</div>
          ${g.items
            .map((l) => {
              const on = l.href === path || (l.match || []).includes(path);
              return `<a href="${l.href}" class="nav-link${on ? ' active' : ''}">${icon(l.icon)}<span>${l.label}</span></a>`;
            })
            .join('')}
        </div>`
      ).join('')}
      <div class="sidebar-foot">
        <div class="site-card">
          ${isAdmin ? '<p>Saved changes show on the website the next time a page is loaded.</p>' : ''}
          <a href="${escapeHtml(frontendOrigin())}" target="_blank" rel="noopener" id="view-site-link">${icon('external')} View website</a>
        </div>
      </div>
    </aside>
    <div class="scrim" id="scrim"></div>
    <div class="shell-main">
      <header class="topbar">
        <button class="icon-btn menu-btn" id="menu-btn" aria-label="Open menu">${icon('menu')}</button>
        <div class="search">
          ${icon('search')}
          <input type="search" id="global-search" placeholder="${isAdmin ? 'Search pages, sections…' : 'Search…'}" autocomplete="off" />
          <div class="search-results" id="search-results" hidden></div>
        </div>
        <div class="topbar-actions">
          <a class="icon-btn" href="${escapeHtml(frontendOrigin())}" target="_blank" rel="noopener" title="Open website" id="view-site-icon">${icon('globe')}</a>
          <div class="user-menu">
            <button class="user-chip" id="user-chip" aria-haspopup="true">
              <span class="avatar">${escapeHtml(user.slice(0, 2) || '?')}</span>
              <span class="user-name">${escapeHtml(user)}</span>
              ${icon('chevronDown')}
            </button>
            <div class="user-dropdown" id="user-dropdown" hidden>
              ${isAdmin ? `<a href="/users.html">${icon('key')} Users &amp; passwords</a>` : ''}
              <button type="button" onclick="logout()">${icon('logout')} Log out</button>
            </div>
          </div>
        </div>
      </header>
      <main id="shell-content"></main>
    </div>
  `;

  mount.replaceWith(shell);
  // Move the page's own content into the main column.
  const content = document.getElementById('shell-content');
  document.querySelectorAll('body > .container').forEach((el) => content.appendChild(el));

  document.getElementById('menu-btn').onclick = () => document.body.classList.toggle('nav-open');
  document.getElementById('scrim').onclick = () => document.body.classList.remove('nav-open');

  const chip = document.getElementById('user-chip');
  const dropdown = document.getElementById('user-dropdown');
  chip.onclick = (e) => {
    e.stopPropagation();
    dropdown.hidden = !dropdown.hidden;
  };
  document.addEventListener('click', () => (dropdown.hidden = true));

  setupSearch();
}

function updateSiteLinks(origin) {
  rememberFrontendOrigin(origin);
  ['view-site-link', 'view-site-icon'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = origin;
  });
}

// ---------- Global search ----------
let searchIndex = null;

async function buildSearchIndex() {
  const index = navGroupsFor(currentUser).flatMap((g) =>
    g.items.map((i) => ({ label: i.label, hint: g.label, href: i.href }))
  );
  if ((currentUser?.role || 'admin') !== 'admin') return index;
  try {
    const res = await apiFetch('/admin/api/pages');
    const { data, frontendOrigin: origin } = await res.json();
    updateSiteLinks(origin);
    for (const page of data) {
      index.push({ label: page.title, hint: `Page · ${page.path}`, href: `/page-edit.html?page=${page.slug}` });
      for (const s of page.sections) {
        index.push({ label: s.label, hint: `${page.title} section`, href: `/page-edit.html?page=${page.slug}#section-${s.key}` });
      }
    }
  } catch {}
  return index;
}

function setupSearch() {
  const input = document.getElementById('global-search');
  const box = document.getElementById('search-results');
  let focused = -1;

  const render = async () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      box.hidden = true;
      return;
    }
    searchIndex = searchIndex || (await buildSearchIndex());
    const hits = searchIndex
      .filter((i) => i.label.toLowerCase().includes(q) || i.hint.toLowerCase().includes(q))
      .slice(0, 12);
    focused = -1;
    box.innerHTML = hits.length
      ? hits.map((h) => `<a href="${h.href}">${escapeHtml(h.label)}<small>${escapeHtml(h.hint)}</small></a>`).join('')
      : '<div class="none">No matches</div>';
    box.hidden = false;
  };

  input.addEventListener('input', render);
  input.addEventListener('focus', render);
  input.addEventListener('keydown', (e) => {
    const links = [...box.querySelectorAll('a')];
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      focused = (focused + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      links.forEach((l, i) => l.classList.toggle('focused', i === focused));
    } else if (e.key === 'Enter' && links.length) {
      window.location.href = links[Math.max(focused, 0)].href;
    } else if (e.key === 'Escape') {
      box.hidden = true;
      input.blur();
    }
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search')) box.hidden = true;
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });
}

// ---------- Modals ----------
function openModal({ title, body, footer = '', small = false }) {
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.innerHTML = `
    <div class="modal${small ? ' small' : ''}" role="dialog" aria-modal="true">
      <div class="modal-head"><h3>${escapeHtml(title)}</h3><button class="tool" data-close aria-label="Close">${icon('x')}</button></div>
      <div class="modal-body"></div>
      ${footer ? `<div class="modal-foot">${footer}</div>` : ''}
    </div>`;
  const bodyEl = bg.querySelector('.modal-body');
  if (typeof body === 'string') bodyEl.innerHTML = body;
  else bodyEl.appendChild(body);

  const close = () => {
    bg.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => e.key === 'Escape' && close();
  bg.addEventListener('click', (e) => {
    if (e.target === bg || e.target.closest('[data-close]')) close();
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(bg);
  return { el: bg, close };
}

function confirmDialog(message, { confirmLabel = 'Confirm', danger = false } = {}) {
  return new Promise((resolve) => {
    const modal = openModal({
      title: 'Please confirm',
      small: true,
      body: `<p style="margin:0">${escapeHtml(message)}</p>`,
      footer: `<button class="btn btn-secondary" data-close>Cancel</button>
               <button class="btn ${danger ? 'btn-danger' : ''}" data-ok>${escapeHtml(confirmLabel)}</button>`,
    });
    let answered = false;
    modal.el.querySelector('[data-ok]').onclick = () => {
      answered = true;
      modal.close();
      resolve(true);
    };
    new MutationObserver((_, obs) => {
      if (!document.body.contains(modal.el)) {
        obs.disconnect();
        if (!answered) resolve(false);
      }
    }).observe(document.body, { childList: true });
  });
}

// ---------- Files ----------
async function uploadFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await apiFetch('/admin/api/files', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data.data;
}

function isVideoUrl(url, mime) {
  return (mime || '').startsWith('video/') || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url || '');
}

function mediaTag(url, mime) {
  if (!url) return icon('image');
  return isVideoUrl(url, mime)
    ? `<video src="${escapeHtml(url)}" muted playsinline preload="metadata"></video>`
    : `<img src="${escapeHtml(url)}" alt="" loading="lazy" onerror="this.replaceWith(document.createTextNode('Preview unavailable'))" />`;
}

// Opens the library; resolves with the chosen file's URL (or null).
function pickFile({ accept = 'image' } = {}) {
  return new Promise((resolve) => {
    let chosen = null;
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <label class="dropzone" id="pick-drop">
        ${icon('upload')}<div><strong>Upload a new ${accept}</strong> or drag it here</div>
        <input type="file" accept="${accept}/*" hidden />
      </label>
      <div class="files-grid" id="pick-grid"><div class="skeleton" style="height:140px"></div></div>`;
    const modal = openModal({ title: `Choose ${accept === 'video' ? 'a video' : 'an image'}`, body: wrap });

    const finish = (url) => {
      chosen = url;
      modal.close();
    };
    new MutationObserver((_, obs) => {
      if (!document.body.contains(modal.el)) {
        obs.disconnect();
        resolve(chosen);
      }
    }).observe(document.body, { childList: true });

    const drop = wrap.querySelector('#pick-drop');
    const input = drop.querySelector('input');
    const handle = async (file) => {
      if (!file) return;
      drop.innerHTML = 'Uploading…';
      try {
        const saved = await uploadFile(file);
        finish(saved.url);
      } catch (err) {
        showToast(err.message, true);
        modal.close();
      }
    };
    input.onchange = () => handle(input.files[0]);
    drop.addEventListener('dragover', (e) => {
      e.preventDefault();
      drop.classList.add('over');
    });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      handle(e.dataTransfer.files[0]);
    });

    apiFetch('/admin/api/files')
      .then((r) => r.json())
      .then(({ data }) => {
        const files = data.filter((f) => (f.mime || '').startsWith(accept + '/'));
        const grid = wrap.querySelector('#pick-grid');
        grid.innerHTML = files.length
          ? files
              .map(
                (f) => `
              <div class="file-card selectable" data-url="${escapeHtml(f.url)}">
                <div class="frame">${mediaTag(f.url, f.mime)}</div>
                <div class="body"><div class="name">${escapeHtml(f.filename)}</div><div class="meta">${formatBytes(f.size)}</div></div>
              </div>`
              )
              .join('')
          : `<p class="empty-msg" style="grid-column:1/-1">No ${accept}s in the library yet. Upload one above.</p>`;
        grid.querySelectorAll('[data-url]').forEach((el) => (el.onclick = () => finish(el.dataset.url)));
      });
  });
}

// Draw the sidebar and top bar straight away from the remembered user, so
// moving between pages doesn't flash a blank or unstyled screen. The page's
// own requireSession() still verifies the session with the server.
(function drawShellFromCache() {
  if (!document.getElementById('app-nav')) return;
  const cached = readCachedUser();
  if (!cached) return;
  currentUser = cached;
  renderNav();
})();
