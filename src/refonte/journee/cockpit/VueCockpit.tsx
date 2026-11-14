import React from 'react';
import { AlertCircle, Flag, Globe, Lock, Mail, Monitor, Users, Euro } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { Avatar } from '../../../socle/ui/Pastilles';
import { formaterEuro } from '../../../socle/formats';
import { tempsDuCouloir, type Couloir, type ModeleCockpit } from './modele';
import { useMotsCockpit } from './i18n';
import '../../contacts/cibles.css';
import './cockpit.css';

/**
 * « COCKPIT D'UN CLIENT » (G08) — la console de pilotage : CINQ instruments dans une seule carte de 1108 × 664, séparés par des filets.
 * Bande haute de 304 (revenu récurrent 538, connectés 268, paiements du jour 300), bande basse de 360 (tickets ouverts 566, santé de
 * l'intégration 540). Mise en page et états, sans accès aux données ; un instrument sans donnée dit « non disponible » et pourquoi.
 * Aucune clé, aucun jeton : l'écran ne reçoit que des agrégats et des valeurs masquées.
 */
export interface ActionsCockpit { reessayer: () => void }

export interface VueCockpitProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleCockpit;
  actions: ActionsCockpit;
  /** Le nom du contact avec qui les tickets sont partagés. */
  contact?: string;
  mois?: string;
}

type Tm = ReturnType<typeof useMotsCockpit>['tm'];

export function VueCockpit({ statut, horsLigne = false, modele: m, actions, contact = '', mois = 'octobre' }: VueCockpitProps) {
  const { tm } = useMotsCockpit();
  return (
    <Page className="sc-ct-cibles">
      <PageHead titre={tm('titre', { client: m.client })} sousTitre={tm('sousTitre')} className="sc-ck__entete" extra={<span className="sc-ck-vue"><span>{tm('vue.libelle')}</span><b>{m.client}</b></span>} />
      {horsLigne && <p className="sc-ck__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-ck" aria-busy={statut === 'chargement' || undefined}>
          <div className="sc-ck-haut">
            <Revenu m={m} tm={tm} mois={mois} />
            <Connectes m={m} tm={tm} />
            <Paiements m={m} tm={tm} />
          </div>
          <div className="sc-ck-bas">
            <Tickets m={m} tm={tm} contact={contact} />
            <Sante m={m} tm={tm} />
          </div>
        </div>
      )}
    </Page>
  );
}

function Tete({ titre, source, droite }: { titre: string; source?: string; droite?: React.ReactNode }) {
  return <header className="sc-ck-tete"><h2>{titre}</h2>{source && <span className="sc-ck-source">{source}</span>}{droite && <span className="sc-ck-tete__droite">{droite}</span>}</header>;
}
function Indispo({ texte }: { texte: string }) { return <p className="sc-ck-indispo">{texte}</p>; }

const euro = (cents: number): string => formaterEuro(cents / 100);

function Revenu({ m, tm, mois }: { m: ModeleCockpit; tm: Tm; mois: string }) {
  const r = m.revenu;
  const L = 500;
  const H = 104;
  const HAUT = 16;
  return (
    <section className="sc-ck-cellule sc-ck-a" aria-label={tm('revenu.titre')}>
      <Tete titre={tm('revenu.titre')} source={tm('revenu.source')} droite={r?.objectif ? <span className="sc-ck-pilule" data-ton="succes"><i aria-hidden />{tm('revenu.objectif', { n: r.objectif.partPourcent })}</span> : undefined} />
      {!r ? <Indispo texte={tm('indispo.revenu')} /> : (
        <>
          <p className="sc-ck-valeur sc-nombre">{euro(r.cents)}</p>
          <p className="sc-ck-ligne">
            {r.ecartPourcent != null && <b className="sc-nombre" data-ton={r.ecartPourcent >= 0 ? 'succes' : 'neutre'}>{tm('revenu.ecart', { signe: r.ecartPourcent >= 0 ? '+' : '−', n: Math.abs(r.ecartPourcent) })}</b>}
            {r.objectif && <span> · {r.objectif.ecartDeRythmeJours >= 0 ? tm(r.objectif.ecartDeRythmeJours <= 1 ? 'revenu.avance.1' : 'revenu.avance.n', { n: r.objectif.ecartDeRythmeJours }) : tm(r.objectif.ecartDeRythmeJours >= -1 ? 'revenu.retard.1' : 'revenu.retard.n', { n: Math.abs(r.objectif.ecartDeRythmeJours) })}</span>}
          </p>
          <div className="sc-ck-courbe" role="img" aria-label={tm('revenu.graphique', { montant: euro(r.cents) })}>
            <svg viewBox={`0 0 ${L} ${H + 22}`} preserveAspectRatio="none">
              <defs><linearGradient id="sc-ck-aire" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--socle-etat-succes)" stopOpacity="0.28" /><stop offset="1" stopColor="var(--socle-etat-succes)" stopOpacity="0" /></linearGradient></defs>
              {r.graduations.map((g) => <g key={g.v}><line x1="34" x2={L} y1={(H - g.y * (H - HAUT))} y2={(H - g.y * (H - HAUT))} className="sc-ck-grille" /><text x="0" y={(H - g.y * (H - HAUT)) + 4} className="sc-ck-axe">{`${g.v / 1000} k`}</text></g>)}
              {r.objectifY != null && <><line x1="34" x2={L - 4} y1={(H - r.objectifY * (H - HAUT))} y2={(H - r.objectifY * (H - HAUT))} className="sc-ck-objectif" /><text x="40" y={(H - r.objectifY * (H - HAUT)) - 6} className="sc-ck-objectif__texte">{tm('revenu.objectifLigne', { montant: euro(r.objectif?.objectifCents ?? 0) })}</text></>}
              {r.courbe.length > 1 && (() => {
                const pts = r.courbe.map((p) => [34 + p.x * (L - 38), H - p.y * (H - HAUT)] as const);
                const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
                const dernier = pts[pts.length - 1];
                return <><path d={`${d} L${dernier[0]} ${H} L${pts[0][0]} ${H} Z`} fill="url(#sc-ck-aire)" /><path d={d} className="sc-ck-trait" /><circle cx={dernier[0]} cy={dernier[1]} r="4" className="sc-ck-point" /></>;
              })()}
              <text x="34" y={H + 18} className="sc-ck-axe">{tm('revenu.debut', { jour: 1 })}</text>
              <text x={L - 4} y={H + 18} textAnchor="end" className="sc-ck-axe">{tm('revenu.aujourdhui')}</text>
            </svg>
          </div>
          <dl className="sc-ck-mini">
            <div><dt>{tm('revenu.encaisse', { mois })}</dt><dd className="sc-nombre">{euro(r.encaisseDuMoisCents)}</dd></div>
            <div><dt>{tm('revenu.actifs')}</dt><dd className="sc-nombre">{r.clientsActifs}</dd></div>
            <div><dt>{tm('revenu.nouveaux')}</dt><dd className="sc-nombre" data-ton="succes">+{r.nouveaux}</dd></div>
            <div><dt>{tm('revenu.impayes')}</dt><dd className="sc-nombre" data-ton={r.impayes > 0 ? 'attention' : undefined}>{r.impayes}</dd></div>
          </dl>
        </>
      )}
    </section>
  );
}

/** Un point sur le cadran de 270° : 0 à −135° (en bas à gauche), l'échelle à +135° (en bas à droite). */
const point = (cx: number, cy: number, r: number, fraction: number): [number, number] => {
  const a = ((-225 + fraction * 270) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
const arc = (cx: number, cy: number, r: number, de: number, a: number): string => {
  const [x1, y1] = point(cx, cy, r, de);
  const [x2, y2] = point(cx, cy, r, a);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${r} ${r} 0 ${(a - de) * 270 > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

function Connectes({ m, tm }: { m: ModeleCockpit; tm: Tm }) {
  const c = m.connectes;
  return (
    <section className="sc-ck-cellule sc-ck-b" aria-label={tm('connectes.titre')}>
      <Tete titre={tm('connectes.titre')} source={tm('connectes.source')} droite={c ? <i className="sc-ck-voyant" aria-hidden /> : undefined} />
      {!c ? <Indispo texte={tm('indispo.connectes')} /> : (
        <>
          <div className="sc-ck-cadran" role="img" aria-label={tm('connectes.cadran', { n: c.courant, echelle: c.echelle })}>
            <svg viewBox="0 0 196 174">
              {Array.from({ length: Math.round(c.echelle / 2) + 1 }, (_, i) => { const f = (i * 2) / c.echelle; const [x1, y1] = point(98, 92, 80, f); const [x2, y2] = point(98, 92, 85, f); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="sc-ck-grad" />; })}
              <path d={arc(98, 92, 72, 0, 1)} className="sc-ck-cadran__fond" />
              <path d={arc(98, 92, 72, 0, Math.max(0.001, c.fraction))} className="sc-ck-cadran__arc" />
              {(() => { const [x, y] = point(98, 92, 72, c.picFraction); return <circle cx={x} cy={y} r="4" className="sc-ck-cadran__pic" />; })()}
              {c.reperes.map((v) => { const [x, y] = point(98, 92, 56, v / c.echelle); return <text key={v} x={x} y={y + 3} textAnchor="middle" className="sc-ck-repere">{v}</text>; })}
            </svg>
            <b className="sc-ck-cadran__valeur sc-nombre">{c.courant}</b>
            <span className="sc-ck-cadran__texte">{tm('connectes.personnes')}</span>
          </div>
          <div className="sc-ck-histo" aria-hidden>{c.barres.map((b, i) => <i key={i} data-dernier={i === c.barres.length - 1 ? '' : undefined} style={{ height: `${Math.max(8, b * 100)}%` }} />)}</div>
          <p className="sc-ck-pied"><span>{tm('connectes.minutes')}</span><span className="sc-nombre">{tm('connectes.jour', { n: c.aujourdhui, pic: c.picDuJour, heure: c.picHeure })}</span></p>
        </>
      )}
    </section>
  );
}

function Paiements({ m, tm }: { m: ModeleCockpit; tm: Tm }) {
  const p = m.paiements;
  return (
    <section className="sc-ck-cellule sc-ck-c" aria-label={tm('paiements.titre')}>
      <Tete titre={tm('paiements.titre')} source={tm('paiements.source')} />
      {!p ? <Indispo texte={tm('indispo.paiements')} /> : (
        <>
          <p className="sc-ck-montant"><b className="sc-nombre">{euro(p.totalCents)}</b><span>{tm(p.nombre <= 1 ? 'paiements.nombre.1' : 'paiements.nombre.n', { n: p.nombre })}</span></p>
          <div className="sc-ck-barre" aria-hidden><i style={{ flexGrow: p.reussis }} />{p.refuse && <i data-echec style={{ flexGrow: p.refuse.n }} />}</div>
          <p className="sc-ck-barre__legende"><span data-ton="succes">{tm(p.reussis <= 1 ? 'paiements.reussis.1' : 'paiements.reussis.n', { n: p.reussis })}</span>{p.refuse && <span data-ton="danger">{tm('paiements.refuse', { n: p.refuse.n, raison: p.refuse.raison })}</span>}</p>
          <ul className="sc-ck-lignes">
            {p.derniers.map((d, i) => <li key={i} data-echec={d.echec ? '' : undefined} aria-label={d.echec ? tm('paiements.echec') : undefined}><span className="sc-nombre">{d.heure}</span><span>{d.offre}</span><span className="sc-nombre sc-ck-carte4">•••• {d.carte4}</span><b className="sc-nombre">{euro(d.cents)}</b></li>)}
          </ul>
          {p.note && <p className="sc-ck-note"><Mail size={13} strokeWidth={1.8} aria-hidden />{p.note}</p>}
        </>
      )}
    </section>
  );
}

function Tickets({ m, tm, contact }: { m: ModeleCockpit; tm: Tm; contact: string }) {
  const k = m.couloirs;
  return (
    <section className="sc-ck-cellule sc-ck-d" aria-label={tm('tickets.titre')}>
      <Tete titre={tm('tickets.titre')} source={tm('tickets.source')} droite={k ? <span>{tm(k.length <= 1 ? 'tickets.resume.1' : 'tickets.resume.n', { n: k.length, nom: contact })}</span> : undefined} />
      {!k ? <Indispo texte={tm('indispo.tickets')} /> : k.length === 0 ? <Indispo texte={tm('tickets.aucun')} /> : (
        <ul className="sc-ck-couloirs">{k.map((c) => <li key={c.id}><Couloir c={c} tm={tm} /></li>)}</ul>
      )}
      {m.delaisTenusPourcent != null && (
        <footer className="sc-ck-delais"><span>{tm('tickets.delais')}</span><span className="sc-ck-delais__barre" aria-hidden><i style={{ width: `${m.delaisTenusPourcent}%` }} /></span><b className="sc-nombre">{m.delaisTenusPourcent} %</b></footer>
      )}
    </section>
  );
}

function texteTemps(c: Couloir, tm: Tm): string {
  const t = tempsDuCouloir(c.minutes, c.depasse);
  if (t.genre === 'depasse') return t.jours === 0 && t.heures === 0 ? tm('tickets.depasse.min', { m: t.minutes }) : tm('tickets.depasse', { h: t.jours * 24 + t.heures, m: String(t.minutes) });
  if (t.jours >= 1) return tm('tickets.reste.j', { n: t.jours });
  return t.heures === 0 ? tm('tickets.reste.min', { m: t.minutes }) : tm('tickets.reste.h', { h: t.heures, m: String(t.minutes) });
}

function Couloir({ c, tm }: { c: Couloir; tm: Tm }) {
  return (
    <>
      <div className="sc-ck-couloir__haut"><span className="sc-ck-id sc-nombre">{c.id}</span><span className="sc-ck-couloir__titre">{c.titre}</span>{c.urgent && <span className="sc-ck-urgent"><Flag size={11} strokeWidth={2.2} aria-hidden />{tm('tickets.urgent')}</span>}<Avatar nom={c.initiale} taille={22} /></div>
      <div className="sc-ck-couloir__bas">
        <span className="sc-nombre sc-ck-couloir__date">{c.creeLabel}</span>
        <span className="sc-ck-piste" data-depasse={c.depasse ? '' : undefined} aria-hidden><i style={{ width: `${Math.round(c.ecoule * 100)}%` }} /><b style={{ left: `${Math.round(c.ecoule * 100)}%` }} /></span>
        <span className="sc-nombre sc-ck-couloir__date">{c.echeanceLabel}</span>
        <span className="sc-nombre sc-ck-couloir__reste" data-depasse={c.depasse ? '' : undefined}>{texteTemps(c, tm)}</span>
      </div>
    </>
  );
}

const ICONE_NOEUD = { stripe: Euro, vercel: Globe, serveur: Lock, cockpit: Monitor, espace: Users } as const;
const POS: Record<string, { x: number; y: number }> = { stripe: { x: 70, y: 38 }, vercel: { x: 70, y: 128 }, serveur: { x: 262, y: 82 }, cockpit: { x: 438, y: 38 }, espace: { x: 438, y: 128 } };

function Sante({ m, tm }: { m: ModeleCockpit; tm: Tm }) {
  const s = m.sante;
  return (
    <section className="sc-ck-cellule sc-ck-e" aria-label={tm('sante.titre')}>
      <Tete titre={tm('sante.titre')} droite={s ? <span className="sc-ck-pilule" data-ton={s.global === 'ok' ? 'succes' : s.global === 'ralenti' ? 'attention' : 'danger'}><i aria-hidden />{tm(`sante.global.${s.global}` as const)}</span> : undefined} />
      {!s ? <Indispo texte={tm('indispo.sante')} /> : (
        <>
          <div className="sc-ck-flux">
            <svg viewBox="0 0 500 174" aria-hidden>
              {(['stripe', 'vercel'] as const).map((k) => <path key={k} d={`M${POS[k].x + 19} ${POS[k].y} C 180 ${POS[k].y} 180 82 ${POS.serveur.x - 19} 82`} className="sc-ck-lien" data-sens="entrant" />)}
              {(['cockpit', 'espace'] as const).map((k) => <path key={k} d={`M${POS.serveur.x + 19} 82 C 340 82 340 ${POS[k].y} ${POS[k].x - 19} ${POS[k].y}`} className="sc-ck-lien" data-sens="sortant" />)}
            </svg>
            {s.noeuds.map((n) => { const I = ICONE_NOEUD[n.cle]; const p = POS[n.cle]; return (
              <div key={n.cle} className="sc-ck-noeud" data-ton={n.ton} style={{ left: `${(p.x / 500) * 100}%`, top: p.y }}>
                <span className="sc-ck-noeud__rond"><I size={16} strokeWidth={1.8} aria-hidden /></span>
                <b>{n.libelle}</b>
                <span className="sc-nombre">{n.detail}</span>
              </div>
            ); })}
          </div>
          <div className="sc-ck-bande">
            <p className="sc-ck-pied"><span>{tm('sante.heures')}</span><span className="sc-nombre">{tm('sante.dispo', { n: String(s.disponibilitePourcent).replace('.', ',') })}</span></p>
            <div className="sc-ck-segments" aria-hidden>{s.segments.map((x, i) => <i key={i} data-etat={x} />)}</div>
            <p className="sc-ck-pied"><span className="sc-nombre">{s.debutBande}</span>{s.legende && <span className="sc-ck-legende" data-ton="attention">{s.legende}</span>}<span>{tm('sante.maintenant')}</span></p>
          </div>
          <p className="sc-ck-securite"><Lock size={13} strokeWidth={1.8} aria-hidden />{tm('sante.securite')}</p>
        </>
      )}
    </section>
  );
}
