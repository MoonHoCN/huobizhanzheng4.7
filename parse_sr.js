const fs = require('fs');
const s = fs.readFileSync('sr_wiki_tmp.html', 'utf8');

const re = /<tr class="divsort" data-param1="([^"]*)" data-param2="([^"]*)" data-param3="([^"]*)" data-param4="([^"]*)" data-param5="([^"]*)" data-param6="([^"]*)" data-param7="([^"]*)" data-param8="([^"]*)">([\s\S]*?)<\/tr>/g;
let m;
const rows = [];
function decode(x) {
  return String(x).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
}
while ((m = re.exec(s)) !== null) {
  const body = m[9];
  const nm = body.match(/title="货币战争\/([^"#]+)"/);
  rows.push({
    mode: body.indexOf('#入画奇航') >= 0 ? '入画奇航' : '零和博弈',
    name: nm ? decode(nm[1].trim()) : '?',
    tag: m[1],
    pos: m[2],
    bonds: decode(m[4]),
    cost: m[6],
    ver: m[7],
    expert: m[8]
  });
}

const out = {
  source: 'https://wiki.biligame.com/sr/?curid=25489',
  fetchedAt: new Date().toISOString(),
  modes: {}
};
['入画奇航', '零和博弈'].forEach(function (mode) {
  out.modes[mode] = rows.filter(function (r) { return r.mode === mode; })
    .map(function (r) { delete r.mode; return r; });
});

fs.writeFileSync('sr_characters.json', JSON.stringify(out, null, 2), 'utf8');
console.log('入画奇航:', out.modes['入画奇航'].length, '人');
console.log('零和博弈:', out.modes['零和博弈'].length, '人');
console.log('--- 入画奇航 全名单 ---');
out.modes['入画奇航'].forEach(function (r, i) {
  console.log(String(i + 1).padStart(2) + '. ' + r.name + ' | ' + r.cost + '费 | ' + r.pos + '台 | ' + r.bonds + ' | ' + r.tag + ' | ' + r.ver + (r.expert === '是' ? ' | 专家顾问' : ''));
});
