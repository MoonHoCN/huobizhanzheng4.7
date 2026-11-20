const fs = require('fs');
const links = JSON.parse(fs.readFileSync('bond_links.json', 'utf8'));

function clean(html) {
  let s = html;
  const m = s.match(/id="mw-content-text"[\s\S]*?>([\s\S]*)/);
  if (m) s = m[1];
  s = s.replace(/<script[\s\S]*?<\/script>/gi, ' ')
       .replace(/<style[\s\S]*?<\/style>/gi, ' ')
       .replace(/<sup[\s\S]*?<\/sup>/gi, ' ')
       .replace(/<[^>]+>/g, ' ')
       .replace(/&nbsp;|&#160;/g, ' ')
       .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
       .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
       .replace(/\s+/g, ' ').trim();
  return s;
}

function extract(text) {
  const k = text.indexOf('羁绊基础效果');
  if (k < 0) return '';
  let s = text.slice(k);
  const end = s.indexOf('羁绊内队员');
  if (end >= 0) s = s.slice(0, end);
  return s.replace(/\s+/g, ' ').trim();
}

const out = {};
links.forEach(function (l, i) {
  const file = 'bond_pages/' + (i + 1) + '.html';
  if (!fs.existsSync(file)) { out[l.name] = ''; return; }
  const text = clean(fs.readFileSync(file, 'utf8'));
  const content = extract(text);
  out[l.name] = content;
  console.log('[' + (i + 1) + '/' + links.length + '] ' + l.name + ' (' + content.length + ' 字)');
});
fs.writeFileSync('bond_details.json', JSON.stringify(out, null, 2), 'utf8');
console.log('完成');
