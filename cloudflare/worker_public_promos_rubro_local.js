/**
 * ColectivoVM2 - Worker PUBLIC (promos rubro/local)
 *
 * Endpoints:
 *  - GET /api/public/promos
 *  - GET /api/public/img/:key   (sirve imágenes desde R2)
 *
 * Bindings esperados:
 *  - D1:  DB  (o colectivovm2_db)
 *  - R2:  PROMOS_BUCKET (o colectivovm2_bucket)
 *
 * Nota:
 *  - Dejar /api/public/ads como está hoy si ya te funciona.
 *    Si querés, podés mergear este archivo dentro de tu worker actual.
 */

function json(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json; charset=utf-8');
  // CORS para que lo consuma Cloudflare Pages
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return new Response(JSON.stringify(data), { ...init, headers });
}

function corsPreflight() {
  return new Response('', {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
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

async function handlePublicPromos(request, env) {
  const { DB } = getBindings(env);
  if (!DB) return json([], { status: 200 });

  const url = new URL(request.url);
  const origin = url.origin;

  const stmt = DB.prepare(
    `SELECT id, rubro, local, title, subtitle, url, image_key, priority, active
     FROM promos
     WHERE active = 1
     ORDER BY priority DESC, id DESC`
  );

  const { results } = await stmt.all();
  const out = (results || []).map(r => {
    const image_key = r.image_key || '';
    return {
      id: r.id,
      rubro: r.rubro || 'Otros',
      local: r.local || '',
      title: r.title || '',
      subtitle: r.subtitle || '',
      url: r.url || '',
      image_key,
      // La app usa imageUrl si existe
      imageUrl: image_key ? `${origin}/api/public/img/${encodeURIComponent(image_key)}` : '',
      priority: Number(r.priority || 0),
      active: r.active ? 1 : 0,
    };
  });

  // Cache corto: si actualizás promos desde el Admin, en 1 min se refleja
  return json(out, { headers: { 'Cache-Control': 'public, max-age=60' } });
}

async function handlePublicImg(request, env) {
  const { BUCKET } = getBindings(env);
  if (!BUCKET) return new Response('R2 not configured', { status: 404 });

  const url = new URL(request.url);
  const prefix = '/api/public/img/';
  const key = decodeURIComponent(url.pathname.slice(prefix.length));
  if (!key) return new Response('Not found', { status: 404 });

  const obj = await BUCKET.get(key);
  if (!obj) return new Response('Not found', { status: 404 });

  const headers = new Headers();
  // metadata (si el upload lo guardó)
  try { obj.writeHttpMetadata(headers); } catch (_) {}
  if (!headers.get('Content-Type')) headers.set('Content-Type', guessContentType(key));

  headers.set('Cache-Control', 'public, max-age=86400, immutable');
  headers.set('Access-Control-Allow-Origin', '*');

  return new Response(obj.body, { headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') return corsPreflight();

    // Promos JSON
    if (url.pathname === '/api/public/promos') {
      return handlePublicPromos(request, env);
    }

    // Imágenes
    if (url.pathname.startsWith('/api/public/img/')) {
      return handlePublicImg(request, env);
    }

    // Si ya tenés /api/public/ads funcionando en otro worker,
    // podés dejarlo afuera y devolver 404 acá.
    return new Response('Not found', { status: 404 });
  }
};
