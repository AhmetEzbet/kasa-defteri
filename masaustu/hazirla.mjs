// Web uygulamasını (depo kökü) masaüstü uygulamasının www klasörüne kopyalar; arayüz aynen kalır.
import { mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
const kok = join(import.meta.dirname, '..');
const www = join(import.meta.dirname, 'www');
rmSync(www, { recursive: true, force: true });
mkdirSync(www, { recursive: true });
let html = readFileSync(join(kok, 'index.html'), 'utf8');
const sw = "if('serviceWorker' in navigator&&location.protocol.indexOf('http')===0)navigator.serviceWorker.register('sw.js').catch(function(){});";
if (!html.includes(sw)) throw new Error('service worker satırı bulunamadı');
html = html.replace(sw, '').replace('<link rel="manifest" href="manifest.webmanifest">\n', '');
writeFileSync(join(www, 'index.html'), html);
for (const f of ['icon-192.png', 'apple-touch-icon.png']) copyFileSync(join(kok, f), join(www, f));
console.log('www hazır');
