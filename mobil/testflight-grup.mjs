// TestFlight'ta "Ekip" iç test grubunu kurar, tüm derlemelere erişim verir ve Ahmet'i ekler. Tekrar çalışınca bir şey bozmaz.
import { createSign, createPrivateKey } from 'node:crypto';
const { ASC_KEY_ID: kid, ASC_ISSUER_ID: iss, ASC_KEY_P8: p8 } = process.env;
const APP = '6838797576', EPOSTA = 'ezbetahmet82@gmail.com';
const key = createPrivateKey(p8.replace(/\r/g, ''));
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = () => { const n = Math.floor(Date.now() / 1000); const v = `${b64({ alg: 'ES256', kid, typ: 'JWT' })}.${b64({ iss, iat: n, exp: n + 900, aud: 'appstoreconnect-v1' })}`; return `${v}.${createSign('SHA256').update(v).sign({ key, dsaEncoding: 'ieee-p1363' }).toString('base64url')}`; };
const api = async (yol, govde) => { const r = await fetch('https://api.appstoreconnect.apple.com' + yol, { method: govde ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + jwt(), 'Content-Type': 'application/json' }, body: govde && JSON.stringify(govde) }); const j = await r.json().catch(() => ({})); if (!r.ok) console.log(yol, r.status, JSON.stringify(j.errors?.[0]?.detail ?? '')); return j; };
let grup = (await api(`/v1/apps/${APP}/betaGroups`)).data?.find(g => g.attributes.isInternalGroup);
if (!grup) grup = (await api('/v1/betaGroups', { data: { type: 'betaGroups', attributes: { name: 'Ekip', isInternalGroup: true, hasAccessToAllBuilds: true }, relationships: { app: { data: { type: 'apps', id: APP } } } } })).data;
console.log('İç test grubu:', grup?.attributes?.name ?? 'yok');
if (grup) {
  const varMi = (await api(`/v1/betaGroups/${grup.id}/betaTesters?limit=200`)).data?.some(t => t.attributes.email?.toLowerCase() === EPOSTA);
  if (!varMi) await api('/v1/betaTesters', { data: { type: 'betaTesters', attributes: { email: EPOSTA, firstName: 'Ahmet', lastName: 'Ezbet' }, relationships: { betaGroups: { data: [{ type: 'betaGroups', id: grup.id }] } } } });
  console.log('Test eden:', EPOSTA, varMi ? '(zaten ekli)' : '(eklendi)');
}
