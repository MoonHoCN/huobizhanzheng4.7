const fs = require('fs');
const chars = JSON.parse(fs.readFileSync('sr_characters.json', 'utf8'));
const bonds = JSON.parse(fs.readFileSync('sr_bonds.json', 'utf8'));
let details = {};
try { details = JSON.parse(fs.readFileSync('bond_details.json', 'utf8')); } catch (e) {}

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '\\u0026').replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
    .replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

// 内嵌为 JSON 字符串（安全转义）
const payload = JSON.stringify({
  chars: chars.modes,
  bonds: bonds,
  details: details
}).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>货币战争 · 阵容选择器</title>
<style>
  :root{
    --bg:#f5f4fc;--card:#fff;--ink:#2b2745;--soft:#6d6890;--faint:#9a95b5;
    --primary:#6d54d6;--primary2:#8b6cf0;--softbg:#efeaff;--line:#e9e6f5;
    --ok:#10b981;--warn:#f59e0b;--gem:#7c3aed;--danger:#ef4444;
    --shadow:0 6px 22px rgba(88,66,160,.09);--shadowh:0 12px 30px rgba(88,66,160,.16);
  }
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;background:linear-gradient(135deg,#eef0ff,#f7f3ff 45%,#fdf4fb);color:var(--ink);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;font-size:13px}
  .wrap{max-width:1500px;margin:0 auto;padding:22px 22px 60px}
  .top{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-bottom:16px}
  h1{margin:0;font-size:22px;background:linear-gradient(100deg,#5b43c4,#8b5cf6 55%,#c026d3);
    -webkit-background-clip:text;background-clip:text;color:transparent}
  .top .spacer{flex:1}
  .seg{display:inline-flex;background:#f3f1fb;border-radius:9px;padding:3px}
  .seg button{border:0;background:transparent;color:var(--soft);cursor:pointer;padding:6px 13px;border-radius:7px;font-size:12px;font-weight:600}
  .seg button.on{background:#fff;color:var(--primary);box-shadow:0 1px 5px rgba(88,66,160,.15)}
  .gembox{display:flex;align-items:center;gap:8px;background:#fff;border:1px solid var(--line);border-radius:10px;padding:6px 12px;box-shadow:var(--shadow)}
  .gembox .g{font-size:18px}
  .gembox .num{font-size:17px;font-weight:800;color:var(--gem);min-width:24px;text-align:center;cursor:pointer;border-bottom:1px dashed #c4b5fd}
  .gembox .lab{font-size:11px;color:var(--faint)}
  .btn{border:1px solid var(--line);background:#fff;color:var(--ink);padding:8px 13px;border-radius:9px;cursor:pointer;font-size:12px;font-weight:600;transition:.15s;white-space:nowrap}
  .btn:hover{border-color:var(--primary2);color:var(--primary);background:var(--softbg)}
  .btn.pri{background:var(--primary);color:#fff;border-color:var(--primary)}
  .btn.pri:hover{background:var(--primary2);color:#fff}
  .btn.danger:hover{border-color:var(--danger);color:var(--danger);background:#fef2f2}
  .addpanel{display:none;position:absolute;right:0;top:44px;background:#fff;border:1px solid var(--line);border-radius:12px;padding:12px;box-shadow:var(--shadowh);z-index:30;min-width:230px}
  .addpanel.show{display:block}
  .addpanel h4{margin:0 0 4px;font-size:13px}
  .addpanel p{margin:0 0 10px;font-size:11px;color:var(--faint)}
  .addpanel .op{display:flex;gap:8px;margin-bottom:8px}
  .addpanel .op .btn{flex:1;padding:8px 6px;font-size:12px}
  .addwrap{position:relative}

  .layout{display:grid;grid-template-columns:270px minmax(0,1fr) 310px;gap:16px;align-items:start}
  @media(max-width:1180px){.layout{grid-template-columns:240px minmax(0,1fr)}.roster{grid-column:1/-1}}
  @media(max-width:760px){.layout{grid-template-columns:1fr}}

  .panel{background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow)}
  .panel h2{font-size:13px;margin:0;padding:12px 14px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:7px}
  .panel h2 .badge{margin-left:auto;font-size:10px;color:var(--faint);font-weight:500}

  /* 羁绊面板 */
  .bonds{position:sticky;top:16px;max-height:calc(100vh - 32px);display:flex;flex-direction:column}
  .preview-hint{margin:10px 12px 4px;padding:9px 11px;border-radius:9px;background:linear-gradient(135deg,#f0fdf6,#f7fefb);border:1px solid #c9f0dc;font-size:11.5px;line-height:1.6;color:#065f46;min-height:52px}
  .preview-hint b{color:#047857}
  .preview-hint.idle{background:#faf9ff;border-color:var(--line);color:var(--faint)}
  .bondlist{overflow-y:auto;padding:6px 10px 12px;flex:1}
  .bondlist::-webkit-scrollbar{width:6px}
  .bondlist::-webkit-scrollbar-thumb{background:#ddd8ef;border-radius:6px}
  .bond{display:flex;align-items:center;gap:8px;padding:7px 6px;border-bottom:1px dashed #f0edf8;border-radius:7px;cursor:help;transition:background .12s}
  .bond:hover{background:#f4f1fd}
  .bond.active{background:linear-gradient(90deg,#ecfdf5,#f6fefb);border-left:3px solid var(--ok);padding-left:3px}
  .bond.active:hover{background:linear-gradient(90deg,#d8f7ea,#eefdf6)}
  .bond .bn{font-size:11.5px;font-weight:600;width:66px;flex:0 0 66px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .bond.active .bn{color:#047857}
  .tiers{display:flex;gap:3px;flex:1}
  .tier{min-width:17px;height:18px;border-radius:4px;border:1px solid #e3def2;background:#f7f5fd;color:#a49ebb;font-size:9.5px;font-weight:700;display:flex;align-items:center;justify-content:center}
  .tier.on{background:var(--ok);border-color:var(--ok);color:#fff}
  .tier.preview{background:#fff;border-color:var(--ok);color:var(--ok);box-shadow:0 0 0 2px #d1fae5}
  .bond .cnt{font-size:10px;color:var(--faint);width:26px;text-align:right;flex:0 0 26px}
  .bond.active .cnt{color:var(--ok);font-weight:700}
  .bond.will .bn::after{content:'★';color:var(--ok);margin-left:3px}

  /* 羁绊内容提示框 */
  .btip{position:fixed;z-index:90;width:400px;max-width:calc(100vw - 32px);background:#fff;border:1px solid var(--line);
    border-radius:13px;box-shadow:0 16px 44px rgba(43,39,69,.22);padding:0;display:none;overflow:hidden}
  .btip.show{display:block}
  .btip .bh{padding:11px 14px;background:linear-gradient(135deg,#6d54d6,#a855f7);color:#fff}
  .btip .bh .t{font-size:14px;font-weight:700}
  .btip .bh .s{font-size:10.5px;opacity:.9;margin-top:3px}
  .btip .bb{padding:12px 14px;max-height:340px;overflow-y:auto;font-size:11.5px;line-height:1.85;color:var(--ink)}
  .btip .bb::-webkit-scrollbar{width:6px}
  .btip .bb::-webkit-scrollbar-thumb{background:#ddd8ef;border-radius:6px}
  .btip .sec{font-weight:700;color:var(--primary);font-size:11px;margin:2px 0 5px}
  .btip .sec + .sec{margin-top:12px}
  .btip .on-txt{color:var(--ok);font-weight:700}
  .btip .none{color:var(--faint);text-align:center;padding:18px 0}
  .bondcat{font-size:10px;color:var(--faint);padding:9px 4px 3px;font-weight:700;letter-spacing:.5px}

  /* 阵容区 */
  .board{padding-bottom:8px}
  .boardsec{padding:14px}
  .boardsec + .boardsec{border-top:1px solid var(--line)}
  .sectitle{display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px;margin-bottom:11px}
  .sectitle .pill{font-size:10px;font-weight:600;color:var(--primary);background:var(--softbg);padding:2px 8px;border-radius:10px}
  .sectitle .hint{margin-left:auto;font-size:10.5px;color:var(--faint);font-weight:400}
  .slots{display:grid;gap:10px}
  .slots.front{grid-template-columns:repeat(auto-fit,minmax(128px,1fr))}
  .slots.back{grid-template-columns:repeat(auto-fit,minmax(118px,1fr))}
  .slot{min-height:104px;border:1.5px dashed #d9d2ef;border-radius:12px;background:#fcfbff;cursor:pointer;
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;position:relative;transition:.15s;padding:8px;text-align:center}
  .slot:hover{border-color:var(--primary2);background:var(--softbg)}
  .slot.target{border-color:var(--primary);box-shadow:0 0 0 3px #e6dcff;background:#fff}
  .slot .plus{font-size:22px;color:#c9c3e4;line-height:1}
  .slot .ph{font-size:10px;color:var(--faint)}
  .slot.filled{border-style:solid;border-color:#e4def5;background:#fff;cursor:default;justify-content:flex-start;gap:6px;box-shadow:var(--shadow)}
  .slot.filled:hover{transform:translateY(-2px);box-shadow:var(--shadowh)}
  .slot .avatar{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:700;background:linear-gradient(135deg,var(--primary2),#c026d3)}
  .slot .nm{font-size:12px;font-weight:700;line-height:1.2;word-break:break-all}
  .slot .costline{font-size:10px;color:var(--gem);font-weight:700}
  .slot .bonds-mini{display:flex;flex-wrap:wrap;gap:3px;justify-content:center}
  .slot .bm{font-size:9px;padding:1px 5px;border-radius:4px;background:var(--softbg);color:var(--primary)}
  .slot .rm{position:absolute;top:5px;right:6px;border:0;background:transparent;color:#c9c3e4;cursor:pointer;font-size:15px;line-height:1}
  .slot .rm:hover{color:var(--danger)}
  .slot .posbadge{position:absolute;top:5px;left:6px;font-size:8.5px;color:var(--faint);background:#f3f1fb;padding:1px 5px;border-radius:4px}
  .slot.filled{cursor:grab}
  .slot.filled:active{cursor:grabbing}
  .slot.dragover{border-color:var(--primary)!important;background:var(--softbg)!important;box-shadow:0 0 0 3px #e6dcff!important}
  .slot.dragover-bad{border-color:var(--danger)!important;background:#fef2f2!important;box-shadow:0 0 0 3px #fee2e2!important}
  .slot.dragging{opacity:.4}
  .role{cursor:grab}
  .role:active{cursor:grabbing}

  /* 角色库 */
  .roster{position:sticky;top:16px;max-height:calc(100vh - 32px);display:flex;flex-direction:column}
  .roster .tools{padding:10px 12px;border-bottom:1px solid var(--line);display:flex;flex-direction:column;gap:8px}
  .roster input,.roster select{width:100%;border:1px solid var(--line);border-radius:8px;padding:7px 9px;font-size:12px;outline:none;color:var(--ink);background:#fcfbff}
  .roster input:focus,.roster select:focus{border-color:var(--primary2)}
  .roster .filters{display:flex;gap:6px}
  .roster .filters select{flex:1}
  .roster .count{font-size:10.5px;color:var(--faint)}
  .rolist{overflow-y:auto;padding:8px;flex:1}
  .rolist::-webkit-scrollbar{width:6px}
  .rolist::-webkit-scrollbar-thumb{background:#ddd8ef;border-radius:6px}
  .role{display:flex;align-items:center;gap:9px;padding:8px;border:1px solid var(--line);border-radius:10px;margin-bottom:7px;cursor:pointer;transition:.13s;background:#fff}
  .role:hover{border-color:var(--primary2);background:var(--softbg);transform:translateX(2px)}
  .role.used{opacity:.42;cursor:not-allowed;filter:grayscale(.5)}
  .role.mismatch{opacity:.5}
  .role.act{border-color:var(--primary);box-shadow:0 0 0 2px #e6dcff}
  .role .av{width:32px;height:32px;flex:0 0 32px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:13px;background:linear-gradient(135deg,var(--primary2),#c026d3)}
  .role .info{min-width:0;flex:1}
  .role .rn{font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .role .rb{font-size:9.5px;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px}
  .role .rc{font-size:12px;font-weight:800;color:var(--fc,var(--gem));flex:0 0 auto}
  .role .rp{font-size:9px;color:var(--faint);flex:0 0 auto}
  .tipbar{margin:0 12px 8px;font-size:10.5px;color:var(--faint);line-height:1.5}

  /* 费用配色：1灰 2绿 3蓝 4紫 5黄 */
  .f1{--fc:#94a3b8;--fg:#64748b}
  .f2{--fc:#22c55e;--fg:#15803d}
  .f3{--fc:#3b82f6;--fg:#1d4ed8}
  .f4{--fc:#a855f7;--fg:#7e22ce}
  .f5{--fc:#eab308;--fg:#b45309}
  .ah{--fc:#ef4444;--fg:#b91c1c}
  .role{border-left:3px solid var(--fc,var(--line))}
  .role .av,.slot .avatar{background:linear-gradient(135deg,var(--fc,var(--primary2)),var(--fg,#c026d3))}
  .slot.filled{border-color:var(--fc,#e4def5)}
  .slot .costline{color:var(--fc,var(--gem))}
  .legend{display:flex;gap:5px;flex-wrap:wrap}
  .legend .lg{font-size:9.5px;font-weight:700;color:#fff;background:var(--fc);padding:1px 7px;border-radius:5px}

  .toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%) translateY(20px);background:#2b2745;color:#fff;padding:10px 20px;border-radius:10px;font-size:12.5px;opacity:0;pointer-events:none;transition:.25s;z-index:80;box-shadow:0 8px 24px rgba(0,0,0,.2)}
  .toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
  .src{font-size:10.5px;color:var(--faint);margin-top:18px;line-height:1.7}
  .src a{color:var(--primary);text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <h1>货币战争 · 阵容选择器</h1>
    <div class="seg" id="seasonSeg"><button data-s="入画奇航" class="on">入画奇航</button><button data-s="零和博弈">零和博弈</button></div>
    <div class="spacer"></div>
    <div class="gembox">
      <span class="g">💎</span><span class="num" id="gemNum" title="点击修改宝石数量">15</span><span class="lab">宝石</span>
    </div>
    <div class="addwrap">
      <button class="btn pri" id="addSlotBtn">＋ 添加放置位</button>
      <div class="addpanel" id="addPanel">
        <h4>添加放置位</h4>
        <p>每增加一个位置消耗 3 宝石</p>
        <div class="op"><button class="btn" data-add="front">前排 +1</button><button class="btn" data-add="back">后排 +1</button></div>
        <div style="font-size:10px;color:var(--faint)" id="slotLimit"></div>
      </div>
    </div>
    <button class="btn danger" id="resetBtn">清空阵容</button>
  </div>

  <div class="layout">
    <aside class="panel bonds">
      <h2>羁绊面板 <span class="badge" id="bondCount">0 个羁绊</span></h2>
      <div class="preview-hint idle" id="previewHint">从右侧角色库悬停角色，可预览加入后激活的羁绊</div>
      <div class="bondlist" id="bondList"></div>
    </aside>

    <main class="panel board">
      <div class="boardsec">
        <div class="sectitle"><span>前排</span><span class="pill" id="frontPill">4 位</span><span class="hint">只能放置「前 / 前后台」角色</span></div>
        <div class="slots front" id="frontSlots"></div>
      </div>
      <div class="boardsec">
        <div class="sectitle"><span>后排</span><span class="pill" id="backPill">6 位</span><span class="hint">只能放置「后 / 前后台」角色</span></div>
        <div class="slots back" id="backSlots"></div>
      </div>
    </main>

    <aside class="panel roster">
      <h2>角色库 <span class="badge" id="roleCount">61 人</span></h2>
      <div class="tools">
        <input type="text" id="roleSearch" placeholder="搜索角色或羁绊…">
        <div class="filters">
          <select id="fCost"><option value="">全部费用</option></select>
          <select id="fPos"><option value="">全部站位</option><option value="前">前</option><option value="后">后</option><option value="前后">前后</option></select>
          <select id="fBond"><option value="">全部羁绊</option></select>
        </div>
        <div class="count" id="rosterNote">点击中间空位后，再点角色即可上阵</div>
        <div class="legend"><span class="lg f1">1费</span><span class="lg f2">2费</span><span class="lg f3">3费</span><span class="lg f4">4费</span><span class="lg f5">5费</span></div>
      </div>
      <div class="rolist" id="roster"></div>
      <div class="tipbar">每个角色只能上阵一次 · 悬停角色预览羁绊变化</div>
    </aside>
  </div>

  <div class="src">
    数据来源：<a href="https://wiki.biligame.com/sr/?curid=25489" target="_blank">BWiki 角色一览（货币）</a> ·
    <a href="https://wiki.biligame.com/sr/%E7%BE%81%E7%BB%8A%E4%B8%80%E8%A7%88" target="_blank">羁绊一览</a>
    · 档位由激活线/满级线推算，实际效果以游戏内为准。阵容与宝石自动保存在本地。
  </div>
</div>
<div class="toast" id="toast"></div>
<div class="btip" id="bondTip">
  <div class="bh"><div class="t" id="btName"></div><div class="s" id="btSub"></div></div>
  <div class="bb" id="btBody"></div>
</div>

<script>
const DATA = __PAYLOAD__;
const KEY = 'starrail_selector_v1';
const GEM_COST = 3;
const LIMIT = { front: 6, back: 12 };

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && d.front && d.back) return d;
  } catch (e) {}
  return null;
}
let st = load() || {
  season: '入画奇航', gems: 15,
  front: [null, null, null, null],
  back: [null, null, null, null, null, null]
};

function save() { localStorage.setItem(KEY, JSON.stringify(st)); }
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(function(){ t.classList.remove('show'); }, 1700);
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
  });
}
function chars() { return DATA.chars[st.season] || []; }
function bonds() { return (DATA.bonds || []).filter(function(b){ return b.mode === st.season; }); }
function charByName(n) { return chars().find(function(c){ return c.name === n; }); }
function bondList(c) { return c ? c.bonds.split(',').map(function(x){ return x.trim(); }).filter(Boolean) : []; }
function posOk(c, row) {
  if (!c) return false;
  return row === 'front' ? (c.pos === '前' || c.pos === '前后') : (c.pos === '后' || c.pos === '前后');
}
function usedNames() {
  const s = new Set();
  st.front.concat(st.back).forEach(function(n){ if (n) s.add(n); });
  return s;
}

let activeSlot = null;   // {row, idx}
let previewName = null;  // 悬停预览的角色名

function tiersOf(b) {
  if (b.min === b.max) return [b.min];
  const a = [];
  for (let v = b.min; v <= b.max; v += 2) a.push(v);
  if (a[a.length - 1] !== b.max) a.push(b.max);
  return a;
}

function currentCounts() {
  const m = {};
  st.front.concat(st.back).forEach(function(n){
    if (!n) return;
    const c = charByName(n);
    bondList(c).forEach(function(b){ m[b] = (m[b] || 0) + 1; });
  });
  return m;
}

function renderBonds() {
  const cur = currentCounts();
  const pv = Object.assign({}, cur);
  let will = [];
  if (previewName) {
    const pc = charByName(previewName);
    bondList(pc).forEach(function(b){
      pv[b] = (pv[b] || 0) + 1;
      const info = bonds().find(function(x){ return x.name === b; });
      if (info && (cur[b] || 0) < info.min && pv[b] >= info.min) will.push(b);
    });
  }
  const bl = bonds().filter(function(b){ return (cur[b.name] || 0) > 0 || (pv[b.name] || 0) > 0; });
  bl.sort(function(a, b){
    const aa = (cur[a.name] || 0) >= a.min ? 2 : (cur[a.name] || 0) === a.min - 1 ? 1 : 0;
    const bb = (cur[b.name] || 0) >= b.min ? 2 : (cur[b.name] || 0) === b.min - 1 ? 1 : 0;
    return bb - aa || (pv[b.name] || 0) - (pv[a.name] || 0);
  });
  const cats = ['阵营羁绊', '流派羁绊', '独立羁绊', '特殊羁绊'];
  let html = '';
  cats.forEach(function(cat){
    const list = bl.filter(function(b){ return b.cat === cat; });
    if (!list.length) return;
    html += '<div class="bondcat">' + cat + '</div>';
    list.forEach(function(b){
      const c0 = cur[b.name] || 0, c1 = pv[b.name] || 0;
      const tiers = tiersOf(b);
      const active = c0 >= b.min;
      html += '<div class="bond' + (active ? ' active' : '') + (will.indexOf(b.name) >= 0 ? ' will' : '') + '" data-bond="' + esc(b.name) + '">' +
        '<span class="bn" title="' + esc(b.name) + '">' + esc(b.name) + '</span><div class="tiers">';
      tiers.forEach(function(t){
        let cls = 'tier';
        if (c0 >= t) cls += ' on';
        else if (previewName && c1 >= t && c0 < t) cls += ' preview';
        html += '<span class="' + cls + '">' + t + '</span>';
      });
      html += '</div><span class="cnt">' + c0 + (previewName && c1 !== c0 ? '→' + c1 : '') + '</span></div>';
    });
  });
  document.getElementById('bondList').innerHTML = html || '<div style="padding:16px;text-align:center;color:var(--faint);font-size:11px">上阵角色后显示羁绊</div>';
  document.getElementById('bondCount').textContent = bl.length + ' 个羁绊';

  const hint = document.getElementById('previewHint');
  if (previewName) {
    const pc = charByName(previewName);
    let txt = '<b>' + esc(previewName) + '</b> 贡献：' + (bondList(pc).join('、') || '无');
    if (will.length) txt += '<br>将激活 → <b>' + will.map(esc).join('、') + '</b>';
    else txt += '<br>暂无新激活的羁绊';
    hint.innerHTML = txt; hint.classList.remove('idle');
  } else {
    hint.textContent = '从右侧角色库悬停角色，可预览加入后激活的羁绊';
    hint.classList.add('idle');
  }
}

function renderSlots() {
  ['front', 'back'].forEach(function(row){
    const host = document.getElementById(row + 'Slots');
    let html = '';
    st[row].forEach(function(n, i){
      const on = activeSlot && activeSlot.row === row && activeSlot.idx === i;
      if (!n) {
        html += '<div class="slot' + (on ? ' target' : '') + '" data-row="' + row + '" data-idx="' + i + '">' +
          '<div class="plus">＋</div><div class="ph">空位 ' + (i + 1) + '</div></div>';
      } else {
        const c = charByName(n);
        const bl = bondList(c);
        html += '<div class="slot filled f' + costTier(c ? c.cost : 1) + (n.indexOf('阿哈') >= 0 ? ' ah' : '') + '" draggable="true" data-row="' + row + '" data-idx="' + i + '" data-name="' + esc(n) + '" title="拖动可换排/换位；点右上角 × 移除">' +
          '<button class="rm" data-rm="' + i + '" data-row="' + row + '">×</button>' +
          '<span class="posbadge">' + esc(c ? c.pos : '') + '</span>' +
          '<div class="avatar">' + esc(n.slice(0, 1)) + '</div>' +
          '<div class="nm">' + esc(n) + '</div>' +
          '<div class="costline">' + esc(c ? c.cost : '') + '费</div>' +
          '<div class="bonds-mini">' + bl.slice(0, 3).map(function(b){ return '<span class="bm">' + esc(b) + '</span>'; }).join('') + '</div>' +
        '</div>';
      }
    });
    host.innerHTML = html;
    host.style.gridTemplateColumns = 'repeat(auto-fit,minmax(' + (row === 'front' ? '128px' : '118px') + ',1fr))';
    document.getElementById(row + 'Pill').textContent = st[row].length + ' 位';
  });
  document.getElementById('gemNum').textContent = st.gems;
  const limit = document.getElementById('slotLimit');
  if (limit) limit.textContent = '当前上限：前排 ' + LIMIT.front + ' / 后排 ' + LIMIT.back;
}

// 费用→档位：多费用角色（如 "4, 5, 7"）取最低档，钳制到 1-5
function costTier(cost){
  const s = String(cost || '');
  let lo = 6;
  for (let i = 0; i < s.length; i++){
    const ch = s.charAt(i);
    if (ch >= '0' && ch <= '9' && +ch < lo) lo = +ch;
  }
  if (lo === 6) return 1;
  return Math.max(1, Math.min(5, lo));
}

function renderRoster() {
  const kw = document.getElementById('roleSearch').value.trim().toLowerCase();
  const fc = document.getElementById('fCost').value;
  const fp = document.getElementById('fPos').value;
  const fb = document.getElementById('fBond').value;
  const used = usedNames();
  let list = chars().filter(function(c){
    if (fc && c.cost !== fc) return false;
    if (fp && c.pos !== fp) return false;
    if (fb && bondList(c).indexOf(fb) < 0) return false;
    if (kw && (c.name + ' ' + c.bonds + ' ' + c.tag).toLowerCase().indexOf(kw) < 0) return false;
    return true;
  });
  const host = document.getElementById('roster');
  if (!list.length) { host.innerHTML = '<div style="padding:20px;text-align:center;color:var(--faint)">无匹配角色</div>'; return; }
  host.innerHTML = list.map(function(c){
    const isUsed = used.has(c.name);
    let mismatch = false;
    if (activeSlot) mismatch = !posOk(c, activeSlot.row);
    const isActive = previewName === c.name;
    return '<div class="role f' + costTier(c.cost) + (c.name.indexOf('阿哈') >= 0 ? ' ah' : '') + (isUsed ? ' used' : '') + (mismatch ? ' mismatch' : '') + (isActive ? ' act' : '') + '" draggable="' + (isUsed ? 'false' : 'true') + '" data-name="' + esc(c.name) + '">' +
      '<div class="av">' + esc(c.name.slice(0, 1)) + '</div>' +
      '<div class="info"><div class="rn">' + esc(c.name) + '</div><div class="rb">' + esc(c.bonds) + '</div></div>' +
      '<div style="text-align:right"><div class="rc">' + esc(c.cost) + '费</div><div class="rp">' + esc(c.pos) + '</div></div>' +
    '</div>';
  }).join('');
  document.getElementById('roleCount').textContent = list.length + ' / ' + chars().length + ' 人';
}

function renderAll() { renderSlots(); renderBonds(); renderRoster(); }

// 初始化筛选下拉
function initFilters() {
  const cs = document.getElementById('fCost');
  const bsReset = document.getElementById('fBond');
  cs.innerHTML = '<option value="">全部费用</option>';
  bsReset.innerHTML = '<option value="">全部羁绊</option>';
  const costs = Array.from(new Set(chars().map(function(c){ return c.cost; })));
  costs.sort(function(a, b){ return parseInt(a) - parseInt(b); });
  costs.forEach(function(v){ const o = document.createElement('option'); o.value = v; o.textContent = v + '费'; cs.appendChild(o); });
  const bs = bsReset;
  const bnames = Array.from(new Set(chars().map(function(c){ return bondList(c); }).flat())).sort(function(a,b){ return a.localeCompare(b, 'zh-CN'); });
  bnames.forEach(function(v){ const o = document.createElement('option'); o.value = v; o.textContent = v; bs.appendChild(o); });
}

// 事件
document.getElementById('seasonSeg').addEventListener('click', function(e){
  const b = e.target.closest('button'); if (!b) return;
  st.season = b.getAttribute('data-s');
  st.front = st.front.map(function(){ return null; });
  st.back = st.back.map(function(){ return null; });
  activeSlot = null; previewName = null;
  document.getElementById('bondTip').classList.remove('show');
  [].forEach.call(this.querySelectorAll('button'), function(x){ x.classList.toggle('on', x === b); });
  save(); initFilters(); renderAll();
  toast('已切换到「' + st.season + '」，阵容已清空');
});

document.getElementById('frontSlots').addEventListener('click', function(e){
  const rm = e.target.closest('[data-rm]');
  if (rm) { st.front[+rm.getAttribute('data-rm')] = null; save(); renderAll(); return; }
  const s = e.target.closest('.slot'); if (!s) return;
  activeSlot = { row: 'front', idx: +s.getAttribute('data-idx') };
  previewName = null; renderAll();
  document.getElementById('rosterNote').textContent = '为前排第 ' + (activeSlot.idx + 1) + ' 位选择角色（前台/前后台）';
});
document.getElementById('backSlots').addEventListener('click', function(e){
  const rm = e.target.closest('[data-rm]');
  if (rm) { st.back[+rm.getAttribute('data-rm')] = null; save(); renderAll(); return; }
  const s = e.target.closest('.slot'); if (!s) return;
  activeSlot = { row: 'back', idx: +s.getAttribute('data-idx') };
  previewName = null; renderAll();
  document.getElementById('rosterNote').textContent = '为后排第 ' + (activeSlot.idx + 1) + ' 位选择角色（后台/前后台）';
});

// ===== 拖放：槽位之间换位/换排，角色库拖入槽位 =====
let drag = null; // {from:'slot'|'roster', row, idx, name}
document.addEventListener('dragstart', function(e){
  const slot = e.target.closest('.slot.filled');
  const role = e.target.closest('.role[draggable="true"]');
  if (slot) {
    drag = { from: 'slot', row: slot.getAttribute('data-row'), idx: +slot.getAttribute('data-idx'), name: slot.getAttribute('data-name') };
    slot.classList.add('dragging');
  } else if (role) {
    drag = { from: 'roster', name: role.getAttribute('data-name') };
    role.style.opacity = '.4';
  } else { drag = null; return; }
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', drag.name); } catch (err) {}
  document.getElementById('bondTip').classList.remove('show');
});
document.addEventListener('dragend', function(){
  document.querySelectorAll('.slot.dragging').forEach(function(x){ x.classList.remove('dragging'); });
  document.querySelectorAll('.role[style*="opacity"]').forEach(function(x){ x.style.opacity = ''; });
  document.querySelectorAll('.slot.dragover,.slot.dragover-bad').forEach(function(x){ x.classList.remove('dragover','dragover-bad'); });
  drag = null;
});
function clearDropHint() {
  document.querySelectorAll('.slot.dragover,.slot.dragover-bad').forEach(function(x){ x.classList.remove('dragover','dragover-bad'); });
}
['front', 'back'].forEach(function(row){
  const host = document.getElementById(row + 'Slots');
  host.addEventListener('dragover', function(e){
    if (!drag) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    clearDropHint();
    const slot = e.target.closest('.slot');
    if (!slot) return;
    const c = charByName(drag.name);
    const ok = posOk(c, row); // 目标排放不下则标红
    slot.classList.add(ok ? 'dragover' : 'dragover-bad');
  });
  host.addEventListener('dragleave', function(e){
    if (!host.contains(e.relatedTarget)) clearDropHint();
  });
  host.addEventListener('drop', function(e){
    if (!drag) return;
    e.preventDefault();
    const slot = e.target.closest('.slot');
    clearDropHint();
    if (!slot) return;
    const idx = +slot.getAttribute('data-idx');
    const c = charByName(drag.name);
    if (!posOk(c, row)) { toast(c.pos + '台角色不能放在' + (row === 'front' ? '前' : '后') + '排'); return; }
    if (drag.from === 'slot') {
      if (drag.row === row && drag.idx === idx) return; // 原地不动
      // 槽位之间：目标若有人则交换
      const other = st[row][idx];
      st[drag.row][drag.idx] = other;
      st[row][idx] = drag.name;
      // 交换后，若来源角色与新位置站位冲突则回滚（同排互换天然合法，跨排需检查）
      const moved = charByName(other);
      if (other && !posOk(moved, drag.row)) {
        st[drag.row][drag.idx] = drag.name;
        st[row][idx] = other;
        toast('交换后站位冲突，已取消');
        return;
      }
      save(); renderAll();
      toast(other ? '已交换位置' : '已移动到' + (row === 'front' ? '前' : '后') + '排');
    } else if (drag.from === 'roster') {
      if (usedNames().has(drag.name)) { toast('该角色已上阵'); return; }
      const replaced = st[row][idx];
      st[row][idx] = drag.name;
      save(); renderAll();
      toast(replaced ? '已替换 ' + replaced : '已加入' + (row === 'front' ? '前' : '后') + '排');
    }
    activeSlot = null; previewName = null;
  });
});

const rosterHost = document.getElementById('roster');
rosterHost.addEventListener('mouseover', function(e){
  const r = e.target.closest('.role'); if (!r) return;
  const n = r.getAttribute('data-name');
  if (previewName !== n) { previewName = n; renderBonds(); }
});
rosterHost.addEventListener('mouseleave', function(){
  if (previewName) { previewName = null; renderBonds(); }
});
rosterHost.addEventListener('click', function(e){
  const r = e.target.closest('.role'); if (!r) return;
  const n = r.getAttribute('data-name');
  const c = charByName(n);
  if (usedNames().has(n)) { toast('该角色已上阵'); return; }
  if (!activeSlot) { toast('先点击中间的一个空位'); return; }
  if (!posOk(c, activeSlot.row)) { toast(c.pos + '台角色不能放在' + (activeSlot.row === 'front' ? '前' : '后') + '排'); return; }
  st[activeSlot.row][activeSlot.idx] = n;
  activeSlot = null; previewName = null;
  save(); renderAll();
  document.getElementById('rosterNote').textContent = '点击中间空位后，再点角色即可上阵';
});

['roleSearch', 'fCost', 'fPos', 'fBond'].forEach(function(id){
  document.getElementById(id).addEventListener('input', renderRoster);
  document.getElementById(id).addEventListener('change', renderRoster);
});

// 宝石
const addPanel = document.getElementById('addPanel');
document.getElementById('addSlotBtn').onclick = function(e){ e.stopPropagation(); addPanel.classList.toggle('show'); renderSlots(); };
document.addEventListener('click', function(e){ if (!addPanel.contains(e.target) && e.target.id !== 'addSlotBtn') addPanel.classList.remove('show'); });
addPanel.addEventListener('click', function(e){
  const b = e.target.closest('[data-add]'); if (!b) return;
  const row = b.getAttribute('data-add');
  if (st.gems < GEM_COST) { toast('宝石不足，需要 ' + GEM_COST + ' 颗'); return; }
  if (st[row].length >= LIMIT[row]) { toast(row === 'front' ? '前排已达上限 ' + LIMIT.front : '后排已达上限 ' + LIMIT.back); return; }
  st.gems -= GEM_COST;
  st[row].push(null);
  save(); renderSlots();
  toast('已添加 1 个' + (row === 'front' ? '前排' : '后排') + '位置，消耗 ' + GEM_COST + ' 宝石');
});
document.getElementById('gemNum').onclick = function(){
  const v = prompt('设置宝石数量：', st.gems);
  if (v === null) return;
  const n = parseInt(v, 10);
  if (isNaN(n) || n < 0) { toast('请输入非负整数'); return; }
  st.gems = n; save(); renderSlots();
};

// 羁绊内容提示框
const bondTip = document.getElementById('bondTip');
const bondListHost = document.getElementById('bondList');
function formatDetail(txt) {
  if (!txt) return '<div class="none">暂无该羁绊的详细说明</div>';
  let t = txt.replace('羁绊基础效果', '').replace('羁绊分级效果', '|||分级|||');
  const parts = t.split('|||分级|||');
  const base = parts[0].trim();
  const levels = parts[1] ? parts[1].trim() : '';
  let html = '<div class="sec">基础效果</div><div>' + esc(base) + '</div>';
  if (levels) html += '<div class="sec">分级效果</div><div>' + esc(levels).split(String.fromCharCode(10)).join('<br>') + '</div>';
  return html;
}
function showBondTip(name, el) {
  const info = bonds().find(function(b){ return b.name === name; });
  const cnt = currentCounts()[name] || 0;
  document.getElementById('btName').textContent = name;
  document.getElementById('btSub').textContent = (info ? info.cat + ' · 激活 ' + info.min + ' / 满级 ' + info.max : '') + ' · 当前 ' + cnt + ' 人' + (cnt >= (info ? info.min : 99) ? ' · 已激活' : '');
  document.getElementById('btBody').innerHTML = formatDetail(DATA.details[name] || '');
  bondTip.classList.add('show');
  const r = el.getBoundingClientRect();
  const tw = bondTip.offsetWidth, th = bondTip.offsetHeight;
  let left = r.right + 14;
  if (left + tw > window.innerWidth - 10) left = r.left - tw - 14;
  if (left < 10) left = 10;
  let top = r.top - 10;
  if (top + th > window.innerHeight - 10) top = window.innerHeight - th - 10;
  if (top < 10) top = 10;
  bondTip.style.left = left + 'px';
  bondTip.style.top = top + 'px';
}
bondListHost.addEventListener('mouseover', function(e){
  const row = e.target.closest('[data-bond]');
  if (row) showBondTip(row.getAttribute('data-bond'), row);
});
bondListHost.addEventListener('mouseleave', function(){ bondTip.classList.remove('show'); });

document.getElementById('resetBtn').onclick = function(){
  if (!confirm('清空当前阵容的 10 个位置？宝石和已扩展的位置保留。')) return;
  st.front = st.front.map(function(){ return null; });
  st.back = st.back.map(function(){ return null; });
  activeSlot = null; previewName = null;
  save(); renderAll();
};

initFilters();
renderAll();
</script>
</body>
</html>`;

fs.writeFileSync('selector.html', html.replace('__PAYLOAD__', payload), 'utf8');
console.log('生成 selector.html:', fs.statSync('selector.html').size, 'bytes');
