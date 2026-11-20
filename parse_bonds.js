const fs = require('fs');
const s = fs.readFileSync('sr_bond_tmp.html', 'utf8');
const parts = s.split(/<div class="divsort"/);
let rows = [];
for (const p of parts.slice(1)) {
  const head = p.match(/ data-param1="([^"]*)" data-param2="([^"]*)" data-param3="([^"]*)" data-param5="([^"]*)"/);
  const nm = p.match(/<span class="bond-span"[^>]*>([^<]+)<\/span>/);
  const anchor = p.match(/href="[^"]*#(入画奇航|零和博弈)"/);
  if (head && nm && anchor) {
    rows.push({ mode: anchor[1], cat: head[1], min: +head[2], max: +head[3], name: nm[1].trim() });
  }
}
fs.writeFileSync('sr_bonds.json', JSON.stringify(rows, null, 2), 'utf8');
console.log('羁绊总数:', rows.length, '| 入画奇航:', rows.filter(r=>r.mode==='入画奇航').length, '| 零和博弈:', rows.filter(r=>r.mode==='零和博弈').length);
