// Construit à la main un modèle ONNX minimal (Sigmoid sur un tenseur [1,4]) : aucun téléchargement.
import fs from 'node:fs';
const varint = (n) => { const o = []; let v = BigInt(n); do { let b = Number(v & 0x7fn); v >>= 7n; if (v) b |= 0x80; o.push(b); } while (v); return Buffer.from(o); };
const champ = (num, type, val) => Buffer.concat([varint((num << 3) | type), type === 0 ? varint(val) : Buffer.concat([varint(val.length), val])]);
const str = (num, s) => champ(num, 2, Buffer.from(s));
const msg = (num, ...parts) => champ(num, 2, Buffer.concat(parts));
const dim = (v) => msg(1, champ(1, 0, v));
const typeF = msg(2, msg(1, champ(1, 0, 1), msg(2, dim(1), dim(4))));
const valeur = (num, nom) => msg(num, str(1, nom), typeF);
const noeud = msg(1, str(1, 'x'), str(2, 'y'), str(3, 'sig'), str(4, 'Sigmoid'));
const graphe = msg(7, noeud, str(2, 'essai'), valeur(11, 'x'), valeur(12, 'y'));
const modele = Buffer.concat([champ(1, 0, 8), msg(8, str(1, ''), champ(2, 0, 17)), graphe]);
fs.writeFileSync(new URL('./sigmoid.onnx', import.meta.url), modele);
console.log('sigmoid.onnx', modele.length, 'octets');
