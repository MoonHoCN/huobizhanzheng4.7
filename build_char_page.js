const fs = require('fs');
const data = JSON.parse(fs.readFileSync('sr_characters.json', 'utf8'));

function decode(s) {
  return String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}
['入画奇航', '零和博弈'].forEach(function (mode) {
  data.modes[mode].forEach(function (r) {
    r.name = decode(r.name);
    r.bonds = decode(r.bonds);
    r.tag = decode(r.tag);
  });
});

const CAMP = ['仙舟','狼狩','夜之半神','昼之半神','贝洛伯格','列车同行','银河学者','星间旅人','盛会之星','巡海游侠','星核猎手','公司','命运圣杯','幻月游戏','开拓银轨','仙舟舰队','云上五骁','千星商会','黄金大饭店','奇兽花园','少女乐队','梦境交织','小小巨人'];
const STYLE = ['击破','追击','能量','群攻','燃血','减益','持续伤害','战技点','量子同频','治疗','护盾','欢愉','连击','反击','召唤','守护'];
const SOLO = ['命运卜者','大守护者','魔术师','挚爱之人','救世主','头号玩家','领航员','双龙吟','黑市主理人','盗火行者','幻乐之主','机心巧匠'];

const payload = JSON.stringify({
  modes: data.modes,
  camp: CAMP,
  style: STYLE,
  solo: SOLO,
  fetchedAt: data.fetchedAt
}).replace(/</g, '\\u003c');

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>货币战争 · 角色资料库</title>
<style>
  :root {
    --bg: #f5f4fc; --card: #fff; --ink: #2b2745; --soft: #6d6890; --faint: #9a95b5;
    --primary: #6d54d6; --primary-2: #8b6cf0; --soft-bg: #efeaff; --line: #e9e6f5;
    --shadow: 0 6px 22px rgba(88,66,160,.09); --shadow-h: 0 12px 32px rgba(88,66,160,.16);
  }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; background:linear-gradient(135deg,#eef0ff,#f7f3ff 45%,#fdf4fb); color:var(--ink);
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif; font-size:14px; }
  .wrap { max-width:1360px; margin:0 auto; padding:28px 24px 64px; }
  h1 { margin:0 0 6px; font-size:26px; background:linear-gradient(100deg,#5b43c4,#8b5cf6 55%,#c026d3);
    -webkit-background-clip:text; background-clip:text; color:transparent; }
  .sub { color:var(--soft); font-size:13px; margin-bottom:18px; }
  .notice { background:#fff8e8; border:1px solid #fde3a7; border-left:4px solid #f59e0b; border-radius:10px;
    padding:11px 14px; font-size:12.5px; color:#7c4a03; margin-bottom:18px; line-height:1.7; }
  .notice b { color:#b45309; }
  .panel { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:12px;
    box-shadow:var(--shadow); margin-bottom:20px; }
  .row { display:flex; flex-wrap:wrap; gap:9px; align-items:center; margin-bottom:9px; }
  .row:last-child { margin-bottom:0; }
  .row .cap { color:var(--faint); font-size:11px; min-width:48px; }
  .seg { display:inline-flex; background:#f3f1fb; border-radius:8px; padding:3px; }
  .seg button { border:0; background:transparent; color:var(--soft); cursor:pointer; padding:6px 14px;
    border-radius:6px; font-size:12px; font-weight:600; }
  .seg button.on { background:#fff; color:var(--primary); box-shadow:0 1px 5px rgba(88,66,160,.15); }
  .chip { border:1px solid var(--line); background:#fff; color:var(--soft); cursor:pointer;
    padding:5px 10px; border-radius:16px; font-size:11.5px; transition:.12s; }
  .chip:hover { border-color:var(--primary-2); color:var(--primary); }
  .chip.on { background:var(--primary); color:#fff; border-color:var(--primary); }
  .search { flex:1; min-width:180px; border:1px solid var(--line); border-radius:9px; padding:8px 12px;
    font-size:13px; outline:none; color:var(--ink); background:#fcfbff; }
  .search:focus { border-color:var(--primary-2); box-shadow:0 0 0 3px var(--soft-bg); }
  .btn { border:1px solid var(--line); background:#fff; color:var(--soft); padding:7px 12px; border-radius:8px;
    cursor:pointer; font-size:11.5px; }
  .btn:hover { border-color:var(--primary-2); color:var(--primary); }
  .meta { color:var(--faint); font-size:12px; margin:2px 0 14px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(228px,1fr)); gap:12px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:14px; padding:13px;
    box-shadow:var(--shadow); transition:.18s; }
  .card:hover { box-shadow:var(--shadow-h); transform:translateY(-2px); }
  .card.hidden { display:none; }
  .top { display:flex; align-items:center; gap:10px; padding-bottom:9px; border-bottom:1px solid #f1eef8; }
  .face { width:40px; height:40px; flex:0 0 40px; border-radius:10px; display:flex; align-items:center;
    justify-content:center; font-size:17px; font-weight:700; color:#fff; background:linear-gradient(135deg,var(--primary-2),#c026d3); }
  .nm { font-weight:700; font-size:14px; line-height:1.2; }
  .ver { font-size:10.5px; color:var(--faint); margin-top:3px; }
  .cost { margin-left:auto; text-align:center; flex:0 0 34px; }
  .cost .n { font-size:18px; font-weight:800; color:var(--primary); line-height:1; }
  .cost .u { font-size:9px; color:var(--faint); }
  .line { display:flex; gap:5px; flex-wrap:wrap; margin-top:9px; align-items:center; }
  .tag { font-size:10px; padding:2px 7px; border-radius:5px; border:1px solid; white-space:nowrap; }
  .t-camp { background:#f3efff; color:#6d28d9; border-color:#e3d9fb; }
  .t-style { background:#eaf4ff; color:#1d4ed8; border-color:#d3e5fd; }
  .t-solo { background:#fff0f7; color:#be185d; border-color:#fbd4e8; }
  .t-pos { background:#f3f4f6; color:#4b5563; border-color:#e5e7eb; }
  .t-role { background:#ecfdf5; color:#047857; border-color:#c9f0dc; }
  .t-expert { background:#fff7ed; color:#c2410c; border-color:#fed7aa; }
  .empty { grid-column:1/-1; text-align:center; color:var(--faint); padding:48px; font-size:13px; }
  .src { margin-top:24px; font-size:11px; color:var(--faint); line-height:1.8; }
  .src a { color:var(--primary); text-decoration:none; }
</style>
</head>
<body>
<div class="wrap">
  <h1>货币战争 · 角色资料库</h1>
  <div class="sub">崩坏：星穹铁道 · 数据来源 BWiki 角色一览（货币），按费用 / 站位 / 羁绊 / 定位筛选</div>
  <div class="notice">
    <b>注意版本差异：</b>4.7 版本（2026-11-11 上线）推出新赛季「入画奇航」，<b>羁绊、费用、前后台定位、角色赋能全部重制</b>。
    你之前截图里的清单属于旧赛季「零和博弈」。切换上方赛季可查看两版数据，做任务清单时请确认对应的是哪个赛季。
  </div>

  <div class="panel">
    <div class="row">
      <span class="cap">赛季</span>
      <div class="seg" id="modeSeg"><button data-m="入画奇航" class="on">入画奇航（4.7 当前）</button><button data-m="零和博弈">零和博弈（旧赛季）</button></div>
      <input class="search" id="search" placeholder="搜索角色名或羁绊…">
    </div>
    <div class="row"><span class="cap">费用</span><span id="fCost"></span></div>
    <div class="row"><span class="cap">站位</span><span id="fPos"></span></div>
    <div class="row"><span class="cap">定位</span><span id="fTag"></span></div>
    <div class="row"><span class="cap">羁绊</span><span id="fBond"></span>
      <button class="btn" id="clearBtn">清除筛选</button>
    </div>
  </div>

  <div class="meta" id="meta"></div>
  <div class="grid" id="grid"></div>

  <div class="src">
    数据来源：<a href="https://wiki.biligame.com/sr/?curid=25489" target="_blank">Bilibili 游戏 Wiki · 角色一览（货币）</a><br>
    抓取时间：<span id="fetchTime"></span> · 本页为静态快照，游戏版本更新后需重新抓取。
  </div>
</div>

<script>
const DATA = __PAYLOAD__;
let mode = '入画奇航';
let kw = '', selCost = [], selPos = [], selTag = [], selBond = [];

function esc(s) { return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

function uniq(arr) { return Array.from(new Set(arr)).filter(Boolean); }

function bondClass(b) {
  if (DATA.camp.indexOf(b) >= 0) return 't-camp';
  if (DATA.style.indexOf(b) >= 0) return 't-style';
  if (DATA.solo.indexOf(b) >= 0) return 't-solo';
  return 't-camp';
}
function posText(p) { return p === '前' ? '前台' : (p === '后' ? '后台' : '前后台'); }

function buildFilters() {
  const list = DATA.modes[mode];
  const costs = uniq(list.map(function(r){ return r.cost; })).sort(function(a,b){ return parseInt(a)-parseInt(b); });
  const poss = uniq(list.map(function(r){ return r.pos; }));
  const tags = uniq(list.map(function(r){ return r.tag.split(',').map(function(x){return x.trim();}); }).flat());
  const bonds = uniq(list.map(function(r){ return r.bonds.split(',').map(function(x){return x.trim();}); }).flat())
    .sort(function(a,b){ return a.localeCompare(b,'zh-CN'); });

  function make(host, values, arr, labelFn) {
    document.getElementById(host).innerHTML = values.map(function(v){
      return '<button class="chip' + (arr.indexOf(v)>=0?' on':'') + '" data-v="' + esc(v) + '">' + (labelFn?labelFn(v):esc(v)) + '</button>';
    }).join('');
  }
  make('fCost', costs, selCost, function(v){ return v + '费'; });
  make('fPos', poss, selPos, posText);
  make('fTag', tags, selTag);
  make('fBond', bonds, selBond);
}

function bindChips(host, arr) {
  document.getElementById(host).addEventListener('click', function(e){
    const b = e.target.closest('.chip'); if (!b) return;
    const v = b.getAttribute('data-v');
    const i = arr.indexOf(v);
    if (i >= 0) arr.splice(i,1); else arr.push(v);
    render();
  });
}

function render() {
  buildFilters();
  const list = DATA.modes[mode];
  const shown = list.filter(function(r){
    const tags = r.tag.split(',').map(function(x){return x.trim();});
    const bonds = r.bonds.split(',').map(function(x){return x.trim();});
    if (selCost.length && selCost.indexOf(r.cost) < 0) return false;
    if (selPos.length && selPos.indexOf(r.pos) < 0) return false;
    if (selTag.length && !selTag.some(function(x){ return tags.indexOf(x)>=0; })) return false;
    if (selBond.length && !selBond.some(function(x){ return bonds.indexOf(x)>=0; })) return false;
    if (kw && (r.name + ' ' + r.bonds + ' ' + r.tag).toLowerCase().indexOf(kw) < 0) return false;
    return true;
  });
  document.getElementById('meta').textContent = '共 ' + list.length + ' 名角色，当前显示 ' + shown.length + ' 名。';
  const grid = document.getElementById('grid');
  if (!shown.length) { grid.innerHTML = '<div class="empty">没有符合条件的角色</div>'; return; }
  grid.innerHTML = shown.map(function(r){
    const tags = r.tag.split(',').map(function(x){return x.trim();});
    const bonds = r.bonds.split(',').map(function(x){return x.trim();});
    return '<div class="card">' +
      '<div class="top"><div class="face">' + esc(r.name.slice(0,1)) + '</div>' +
        '<div><div class="nm">' + esc(r.name) + '</div><div class="ver">实装 ' + esc(r.ver) + '</div></div>' +
        '<div class="cost"><div class="n">' + esc(r.cost) + '</div><div class="u">费用</div></div></div>' +
      '<div class="line"><span class="tag t-pos">' + posText(r.pos) + '</span>' +
        tags.map(function(t){ return '<span class="tag t-role">' + esc(t) + '</span>'; }).join('') +
        (r.expert === '是' ? '<span class="tag t-expert">专家顾问</span>' : '') + '</div>' +
      '<div class="line">' + bonds.map(function(b){ return '<span class="tag ' + bondClass(b) + '">' + esc(b) + '</span>'; }).join('') + '</div>' +
    '</div>';
  }).join('');
}

document.getElementById('modeSeg').addEventListener('click', function(e){
  const b = e.target.closest('button'); if (!b) return;
  mode = b.getAttribute('data-m');
  selCost = []; selPos = []; selTag = []; selBond = [];
  [].forEach.call(this.querySelectorAll('button'), function(x){ x.classList.toggle('on', x === b); });
  render();
});
document.getElementById('search').addEventListener('input', function(e){ kw = e.target.value.trim().toLowerCase(); render(); });
document.getElementById('clearBtn').onclick = function(){
  selCost = []; selPos = []; selTag = []; selBond = []; kw = '';
  document.getElementById('search').value = '';
  render();
};
bindChips('fCost', selCost); bindChips('fPos', selPos); bindChips('fTag', selTag); bindChips('fBond', selBond);
document.getElementById('fetchTime').textContent = new Date(DATA.fetchedAt).toLocaleString('zh-CN');
render();
</script>
</body>
</html>`;

fs.writeFileSync('sr_characters.html', html.replace('__PAYLOAD__', payload), 'utf8');
console.log('生成 sr_characters.html:', fs.statSync('sr_characters.html').size, 'bytes');
