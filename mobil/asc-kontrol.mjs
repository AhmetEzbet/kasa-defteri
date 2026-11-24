// Apple API anahtarını dener; içeriği yazdırmaz, sadece sonucu söyler.
import { createSign, createPrivateKey } from 'node:crypto';
const { ASC_KEY_ID: kid, ASC_ISSUER_ID: iss, ASC_KEY_P8: p8 = '' } = process.env;
const satir = p8.trim().split(/\r?\n/);
console.log(`Anahtar: ${satir.length} satır, başlık ${satir[0] === '-----BEGIN PRIVATE KEY-----' ? 'doğru' : 'HATALI'}, son satır ${satir.at(-1) === '-----END PRIVATE KEY-----' ? 'doğru' : 'HATALI'}, CRLF ${/\r/.test(p8) ? 'var' : 'yok'}`);
let key;
try { key = createPrivateKey(p8.replace(/\r/g, '')); } catch (e) { console.log('Anahtar okunamadı:', e.message); process.exit(1); }
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const dene = async k => {
  const now = Math.floor(Date.now() / 1000);
  const veri = `${b64({ alg: 'ES256', kid: k, typ: 'JWT' })}.${b64({ iss, iat: now, exp: now + 600, aud: 'appstoreconnect-v1' })}`;
  const imza = createSign('SHA256').update(veri).sign({ key, dsaEncoding: 'ieee-p1363' }).toString('base64url');
  const r = await fetch('https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=com.ezbet.kasadefteri', { headers: { Authorization: `Bearer ${veri}.${imza}` } });
  console.log(`Key ${k}: HTTP ${r.status}`);
  return r.ok;
};
let bulunan = null;
for (const k of [kid, 'J5VBQ72FCS', 'XT42UQBMMF']) if (await dene(k)) { bulunan = k; break; }
if (!bulunan) { console.log('Anahtar hiçbir Key ID ile eşleşmedi.'); process.exit(1); }
console.log(`Eşleşen Key ID: ${bulunan}`);
if (process.env.GITHUB_ENV) (await import('node:fs')).appendFileSync(process.env.GITHUB_ENV, `ASC_KEY_ID=${bulunan}\n`);
