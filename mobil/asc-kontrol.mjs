// Apple API anahtarını dener; içeriği yazdırmaz, sadece sonucu söyler.
import { createSign, createPrivateKey } from 'node:crypto';
const { ASC_KEY_ID: kid, ASC_ISSUER_ID: iss, ASC_KEY_P8: p8 = '' } = process.env;
const satir = p8.trim().split(/\r?\n/);
console.log(`Anahtar: ${satir.length} satır, başlık ${satir[0] === '-----BEGIN PRIVATE KEY-----' ? 'doğru' : 'HATALI'}, son satır ${satir.at(-1) === '-----END PRIVATE KEY-----' ? 'doğru' : 'HATALI'}, CRLF ${/\r/.test(p8) ? 'var' : 'yok'}`);
let key;
try { key = createPrivateKey(p8.replace(/\r/g, '')); } catch (e) { console.log('Anahtar okunamadı:', e.message); process.exit(1); }
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const veri = `${b64({ alg: 'ES256', kid, typ: 'JWT' })}.${b64({ iss, iat: now, exp: now + 600, aud: 'appstoreconnect-v1' })}`;
const imza = createSign('SHA256').update(veri).sign({ key, dsaEncoding: 'ieee-p1363' }).toString('base64url');
const r = await fetch('https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=com.ezbet.kasadefteri', { headers: { Authorization: `Bearer ${veri}.${imza}` } });
const j = await r.json().catch(() => ({}));
console.log(`Apple API cevabı: HTTP ${r.status}`, r.ok ? `(uygulama bulundu: ${j.data?.length ?? 0})` : JSON.stringify(j.errors?.[0]?.title ?? ''));
if (!r.ok) process.exit(1);
