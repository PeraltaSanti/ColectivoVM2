/**
 * ColectivoVM2 - Worker ADMIN (panel /admin) con promos por rubro/local
 *
 * Endpoints:
 *  - GET  /admin                    (HTML)
 *  - GET  /api/admin/promos         (listar)
 *  - POST /api/admin/promos         (crear: form-data, incluye file opcional)
 *  - PATCH /api/admin/promos/:id    (editar campos)
 *  - DELETE /api/admin/promos/:id   (borrar)
 *  - GET /api/admin/img/:key        (servir imagen desde R2, útil para el panel)
 *
 * Bindings esperados:
 *  - D1:  DB  (o colectivovm2_db)
 *  - R2:  PROMOS_BUCKET (o colectivovm2_bucket)
 *
 * Seguridad:
 *  - Ideal: proteger la ruta /admin con Cloudflare Access.
 *  - Opcional: setear ADMIN_EMAILS="..." para que solo esos emails puedan usar el panel.
 */

function html(body, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'text/html; charset=utf-8');
  return new Response(body, { ...init, headers });
}

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function getBindings(env) {
  const DB = env.DB || env.colectivovm2_db;
  const BUCKET = env.PROMOS_BUCKET || env.BUCKET || env.colectivovm2_bucket;
  return { DB, BUCKET };
}

function guessContentType(key) {
  const k = String(key || '').toLowerCase();
  if (k.endsWith('.webp')) return 'image/webp';
  if (k.endsWith('.png')) return 'image/png';
  if (k.endsWith('.jpg') || k.endsWith('.jpeg')) return 'image/jpeg';
  if (k.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

function slug(s) {
  return String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'promo';
}

function getAccessEmail(request) {
  return request.headers.get('Cf-Access-Authenticated-User-Email')
    || request.headers.get('cf-access-authenticated-user-email')
    || '';
}

function isAllowed(request, env) {
  // Si usás Cloudflare Access, esto normalmente ya está validado antes de llegar acá.
  // Esto agrega un "doble check" opcional.
  const allow = String(env.ADMIN_EMAILS || '').trim();
  if (!allow) return true;
  const email = getAccessEmail(request);
  const list = allow.split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  return email && list.includes(email.toLowerCase());
}

async function listPromos(env) {
  const { DB } = getBindings(env);
  if (!DB) return [];
  const { results } = await DB.prepare(
    `SELECT id, rubro, local, title, subtitle, url, image_key, priority, active, created_at
     FROM promos
     ORDER BY active DESC, priority DESC, id DESC`
  ).all();
  return results || [];
}

async function createPromo(request, env) {
  const { DB, BUCKET } = getBindings(env);
  if (!DB) return json({ ok: false, error: 'D1 not configured' }, { status: 500 });

  const form = await request.formData();
  const rubro = String(form.get('rubro') || 'Otros').trim() || 'Otros';
  const local = String(form.get('local') || '').trim();
  const title = String(form.get('title') || '').trim();
  const subtitle = String(form.get('subtitle') || '').trim();
  const url = String(form.get('url') || '').trim();
  const priority = Number(form.get('priority') || 0);
  const active = String(form.get('active') || '1') === '1' ? 1 : 0;

  if (!local) return json({ ok: false, error: 'Falta "Local"' }, { status: 400 });
  if (!title && !subtitle) return json({ ok: false, error: 'Poné al menos Título o Subtítulo' }, { status: 400 });

  let image_key = '';
  const file = form.get('image');
  if (file && typeof file === 'object' && 'arrayBuffer' in file) {
    if (!BUCKET) return json({ ok: false, error: 'R2 not configured (PROMOS_BUCKET)' }, { status: 500 });

    const ext = (() => {
      const name = String(file.name || '').toLowerCase();
      if (name.endsWith('.webp')) return 'webp';
      if (name.endsWith('.png')) return 'png';
      if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'jpg';
      if (name.endsWith('.svg')) return 'svg';
      return 'bin';
    })();

    const key = `promos/${Date.now()}_${slug(local)}_${slug(title || subtitle)}.${ext}`;
    const buf = await file.arrayBuffer();
    await BUCKET.put(key, buf, {
      httpMetadata: {
        contentType: file.type || guessContentType(key),
      }
    });
    image_key = key;
  }

  const created_at = new Date().toISOString();

  await DB.prepare(
    `INSERT INTO promos (rubro, local, title, subtitle, url, image_key, priority, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(rubro, local, title, subtitle, url, image_key, priority, active, created_at).run();

  return json({ ok: true });
}

async function patchPromo(request, env, id) {
  const { DB } = getBindings(env);
  if (!DB) return json({ ok: false, error: 'D1 not configured' }, { status: 500 });

  const body = await request.json().catch(() => ({}));

  const fields = {
    rubro: body.rubro,
    local: body.local,
    title: body.title,
    subtitle: body.subtitle,
    url: body.url,
    priority: body.priority,
    active: body.active,
  };

  const sets = [];
  const vals = [];

  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    sets.push(`${k} = ?`);
    vals.push(k === 'priority' ? Number(v) : (k === 'active' ? (v ? 1 : 0) : String(v)));
  }

  if (!sets.length) return json({ ok: true });

  vals.push(id);
  await DB.prepare(`UPDATE promos SET ${sets.join(', ')} WHERE id = ?`).bind(...vals).run();
  return json({ ok: true });
}

async function deletePromo(env, id) {
  const { DB } = getBindings(env);
  if (!DB) return json({ ok: false, error: 'D1 not configured' }, { status: 500 });
  await DB.prepare('DELETE FROM promos WHERE id = ?').bind(id).run();
  return json({ ok: true });
}

async function serveAdminImg(request, env) {
  const { BUCKET } = getBindings(env);
  if (!BUCKET) return new Response('R2 not configured', { status: 404 });

  const url = new URL(request.url);
  const prefix = '/api/admin/img/';
  const key = decodeURIComponent(url.pathname.slice(prefix.length));
  if (!key) return new Response('Not found', { status: 404 });

  const obj = await BUCKET.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  try { obj.writeHttpMetadata(headers); } catch (_) {}
  if (!headers.get('Content-Type')) headers.set('Content-Type', guessContentType(key));
  headers.set('Cache-Control', 'no-store');

  return new Response(obj.body, { headers });
}

const ADMIN_HTML = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ColectivoVM2 Admin - Promos</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;margin:0;background:#0b1220;color:#e7eefc}
    header{padding:18px 18px;border-bottom:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03)}
    h1{margin:0;font-size:20px}
    main{padding:18px;max-width:960px;margin:0 auto}
    .card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:16px;margin-bottom:14px}
    label{display:block;font-size:12px;opacity:.85;margin:10px 0 6px}
    input,select,textarea{width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.25);color:#e7eefc}
    button{padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.16);background:#0a84ff;color:white;cursor:pointer;font-weight:700}
    button.secondary{background:rgba(255,255,255,.08)}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .grid{display:grid;grid-template-columns:1fr;gap:10px}
    .item{display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center}
    img{width:120px;height:80px;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05)}
    .muted{opacity:.75;font-size:12px}
    .pill{display:inline-block;padding:3px 8px;border-radius:999px;font-size:12px;border:1px solid rgba(255,255,255,.14);opacity:.9}
    .danger{background:rgba(255,0,0,.12);border-color:rgba(255,0,0,.22)}
    .ok{background:rgba(0,200,120,.12);border-color:rgba(0,200,120,.22)}
    @media(max-width:720px){.row{grid-template-columns:1fr}.item{grid-template-columns:1fr}}
  </style>
</head>
<body>
<header><h1>ColectivoVM2 Admin — Promos (Rubro → Local)</h1></header>
<main>
  <div class="card">
    <h2 style="margin:0 0 10px;font-size:16px">Crear promo</h2>
    <form id="f" enctype="multipart/form-data">
      <div class="row">
        <div>
          <label>Rubro (categoría)</label>
          <input name="rubro" placeholder="Ej: Comida, Ropa, Salud..." required />
        </div>
        <div>
          <label>Local (comercio)</label>
          <input name="local" placeholder="Ej: BlackTucán" required />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Título</label>
          <input name="title" placeholder="Ej: 2x1 en hamburguesas" />
        </div>
        <div>
          <label>Subtítulo</label>
          <input name="subtitle" placeholder="Ej: Solo viernes" />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Link (Instagram/WhatsApp/Web)</label>
          <input name="url" placeholder="https://..." />
        </div>
        <div>
          <label>Prioridad</label>
          <input name="priority" type="number" value="0" />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Imagen (opcional)</label>
          <input name="image" type="file" accept="image/*" />
          <div class="muted" style="margin-top:6px">Tip: si no subís imagen, la app la muestra como tarjeta con texto.</div>
        </div>
        <div>
          <label>Activo</label>
          <select name="active">
            <option value="1" selected>Si</option>
            <option value="0">No</option>
          </select>
        </div>
      </div>

      <div style="display:flex;gap:10px;align-items:center;margin-top:12px">
        <button type="submit">Guardar promo</button>
        <button type="button" class="secondary" id="refresh">Actualizar lista</button>
        <span id="msg" class="muted"></span>
      </div>
    </form>
  </div>

  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <h2 style="margin:0;font-size:16px">Promos cargadas</h2>
      <span class="muted" id="count"></span>
    </div>
    <div id="list" class="grid" style="margin-top:12px"></div>
  </div>
</main>

<script>
  const $ = (id)=>document.getElementById(id);

  async function load() {
    const res = await fetch('/api/admin/promos');
    const data = await res.json();
    const list = $('list');
    list.innerHTML='';

    $('count').textContent = data.length + ' items';

    for (const p of data) {
      const div = document.createElement('div');
      div.className='item';

      const img = document.createElement('img');
      img.alt = p.title || 'promo';
      img.src = p.image_key ? ('/api/admin/img/' + encodeURIComponent(p.image_key)) : '';
      if (!p.image_key) img.style.display='none';

      const meta = document.createElement('div');
      const active = p.active ? '<span class="pill ok">Activa</span>' : '<span class="pill danger">Inactiva</span>';
      meta.innerHTML =
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:6px">' +
          active +
          '<span class="pill">' + escapeHtml(p.rubro || 'Otros') + '</span>' +
          '<span class="pill">' + escapeHtml(p.local || '') + '</span>' +
          '<span class="muted">prio: ' + Number(p.priority||0) + '</span>' +
        '</div>' +
        '<div style="font-weight:800">' + escapeHtml(p.title || '(sin título)') + '</div>' +
        '<div class="muted">' + escapeHtml(p.subtitle || '') + '</div>' +
        (p.url ? ('<div class="muted"><a href="' + escapeHtml(p.url) + '" target="_blank" rel="noopener noreferrer" style="color:#8dc0ff">Abrir link</a></div>') : '<div class="muted"></div>') +
        '<div style="margin-top:8px;display:flex;gap:8px">' +
          '<button class="secondary" data-del="' + p.id + '">Eliminar</button>' +
        '</div>';

      div.appendChild(img);
      div.appendChild(meta);
      list.appendChild(div);
    }

    list.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-del');
        if (!confirm('Eliminar promo #' + id + '?')) return;
        await fetch('/api/admin/promos/' + id, { method: 'DELETE' });
        await load();
      });
    });
  }

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#039;'}[m]));
  }

  $('f').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('msg').textContent='Guardando...';
    const fd = new FormData(e.target);
    const res = await fetch('/api/admin/promos', { method: 'POST', body: fd });
    const out = await res.json().catch(()=>({}));
    if (!res.ok) {
      $('msg').textContent='Error: ' + (out.error || res.status);
      return;
    }
    $('msg').textContent='OK. Actualizando...';
    e.target.reset();
    await load();
    $('msg').textContent='Listo.';
  });

  $('refresh').addEventListener('click', load);
  load().catch(err => $('msg').textContent='Error: ' + err.message);
</script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Si querés el doble-check por email (opcional)
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/admin/')) {
      if (!isAllowed(request, env)) return new Response('Forbidden', { status: 403 });
    }

    // Panel
    if (url.pathname === '/admin') {
      return html(ADMIN_HTML);
    }

    // Imágenes para el panel
    if (url.pathname.startsWith('/api/admin/img/')) {
      return serveAdminImg(request, env);
    }

    // API CRUD
    if (url.pathname === '/api/admin/promos' && request.method === 'GET') {
      const data = await listPromos(env);
      return json(data, { headers: { 'Cache-Control': 'no-store' } });
    }

    if (url.pathname === '/api/admin/promos' && request.method === 'POST') {
      const res = await createPromo(request, env);
      return res;
    }

    const mDel = url.pathname.match(/^\/api\/admin\/promos\/(\d+)$/);
    if (mDel && request.method === 'DELETE') {
      return deletePromo(env, mDel[1]);
    }

    // (Opcional) PATCH - no usado por el HTML actual, pero queda listo.
    if (mDel && request.method === 'PATCH') {
      return patchPromo(request, env, mDel[1]);
    }

    return new Response('Not found', { status: 404 });
  }
};
