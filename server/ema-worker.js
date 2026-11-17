// みんなの絵馬 — サーバー側（Cloudflare Workers の remitech-chores に追加する部分）
//
// 使い方
// 1. Cloudflare で KV 名前空間を1つ作り、Worker に NACHA_EMA という名前で結びつける。
// 2. このファイルの handleEma を Worker に貼り、/nacha/ema で始まるリクエストをここへ渡す:
//      if (url.pathname.startsWith('/nacha/ema')) return handleEma(request, env, url, getUser);
// 3. getUser には、Worker にすでにある「Bearer トークンからユーザーを取り出す処理」を渡す。
//    返す形: { id: 'hibiki', admin: true/false } 、ログインしていなければ null。
//    （/nacha/auth/renew が使っているものと同じ処理でよい）
//
// API（ページ側 assets/ema.js が呼ぶもの）
//   GET  /nacha/ema?limit=30&before=<ms>  → { items:[{id,text,name,at}], more }  だれでも
//   POST /nacha/ema       { text }        → 201 { item }                     ログイン必須、1分に1件まで
//   POST /nacha/ema/hide  { id }          → { ok:true }                       管理者のみ

const MAX_LEN = 140;
const BIG = 9e15; // 新しい順に並ぶよう、キーには (BIG - 時刻) を入れる

function cors(req) {
  return {
    'Access-Control-Allow-Origin': req.headers.get('Origin') || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Vary': 'Origin',
  };
}
function json(req, body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(req) } });
}
function keyFor(at, id) { return 'ema:' + String(BIG - at).padStart(16, '0') + ':' + id; }

export async function handleEma(request, env, url, getUser) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });
  const kv = env.NACHA_EMA;
  const path = url.pathname.replace(/\/+$/, '');

  // 一覧: だれでも読める
  if (request.method === 'GET' && path === '/nacha/ema') {
    const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '30', 10) || 30, 1), 50);
    const before = Number(url.searchParams.get('before')) || 0;
    // キーは新しい順。before があれば、それより古いもの（キーが後ろのもの）だけを返す
    const list = await kv.list({ prefix: 'ema:', limit: before ? 1000 : limit + 1 });
    let keys = list.keys;
    if (before) keys = keys.filter(k => k.name > keyFor(before, '~'));
    const more = keys.length > limit;
    keys = keys.slice(0, limit);
    const items = (await Promise.all(keys.map(k => kv.get(k.name, 'json')))).filter(Boolean);
    return json(request, { items, more });
  }

  // 投稿: ログインした人だけ
  if (request.method === 'POST' && path === '/nacha/ema') {
    const user = await getUser(request, env);
    if (!user) return json(request, { error: 'login' }, 401);
    let body = {};
    try { body = await request.json(); } catch (e) {}
    const text = String(body.text || '').replace(/\r\n?/g, '\n').trim();
    if (!text || [...text].length > MAX_LEN) return json(request, { error: 'text' }, 400);
    const rl = 'ema-rl:' + user.id;
    if (await kv.get(rl)) return json(request, { error: 'slow' }, 429);
    await kv.put(rl, '1', { expirationTtl: 60 });
    const at = Date.now();
    const id = crypto.randomUUID().slice(0, 12);
    const item = { id, text, name: user.id, at };
    await kv.put(keyFor(at, id), JSON.stringify(item));
    return json(request, { item }, 201);
  }

  // 外す: 管理者のみ
  if (request.method === 'POST' && path === '/nacha/ema/hide') {
    const user = await getUser(request, env);
    if (!user || !user.admin) return json(request, { error: 'forbidden' }, 403);
    let body = {};
    try { body = await request.json(); } catch (e) {}
    const id = String(body.id || '');
    if (!id) return json(request, { error: 'id' }, 400);
    // id からキーを探して消す（件数が少ないうちはこれで十分）
    let cursor;
    do {
      const page = await kv.list({ prefix: 'ema:', cursor });
      const hit = page.keys.find(k => k.name.endsWith(':' + id));
      if (hit) { await kv.delete(hit.name); return json(request, { ok: true }); }
      cursor = page.list_complete ? null : page.cursor;
    } while (cursor);
    return json(request, { error: 'notfound' }, 404);
  }

  return json(request, { error: 'notfound' }, 404);
}
