import React, { useEffect, useMemo, useRef } from 'react';
import { choisirJalons, type MoisRelation, type ModeleFiche } from './modele';
import { useMotsFiche } from './i18n';
import { euros } from '../commun';

/**
 * « La relation » (G04, `RelationLanes`) — la frise de toute la relation, un mois par colonne, deux couloirs :
 * « Échanges » (un point par mois, rayon = 1,6 + 0,55 × nombre) et « Devis et factures » (un carré par facture, un
 * losange par devis). Une lecture, pas un diagramme de Gantt : aucune barre de durée.
 *
 * Les couloirs « Tickets » et « La Garde » de la maquette ne sont pas tracés : l'application n'a ni tickets datés ni
 * historique de surveillance par client. Au-delà de 36 mois la frise défile à l'horizontale, « aujourd'hui » à droite.
 */
const LARGEUR_LIBELLES = 112;
const LARGEUR_TRACE = 644;
const MAX_MOIS_VISIBLES = 36;
const Y_JALON_TITRE = 17;
const Y_JALON_DATE = 32;
const Y_JALON_POINT = 36;
const Y_COULOIRS = [64, 100] as const;
const Y_ANNEES = 156;

export function FriseRelation({ relation, langue }: { relation: ModeleFiche['relation']; langue: 'fr' | 'en' }) {
  const { tm } = useMotsFiche();
  const { mois, jalons: candidats } = relation;
  const n = mois.length;
  const pas = n <= 1 ? 0 : Math.min(LARGEUR_TRACE / (MAX_MOIS_VISIBLES - 1), LARGEUR_TRACE / (n - 1));
  const largeurTrace = pas * Math.max(0, n - 1);
  const largeur = LARGEUR_LIBELLES + 14 + largeurTrace + 18;
  const x = (i: number) => LARGEUR_LIBELLES + 14 + i * pas;
  const hauteur = 176;
  const jalons = useMemo(() => choisirJalons(candidats, pas, 150), [candidats, pas]);
  const maxEchanges = Math.max(1, ...mois.map((m) => m.echanges));
  const defile = useRef<HTMLDivElement>(null);
  useEffect(() => { if (defile.current) defile.current.scrollLeft = defile.current.scrollWidth; }, [n]);

  const nomMois = (cle: string): string => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${cle}-01T12:00:00Z`));
  const total = relation.totaux;

  return (
    <div className="sc-fc-frise">
      <div className="sc-fc-frise__entete">
        <h2 className="sc-fc-carte__titre">{tm('relation.titre')}</h2>
        <span className="sc-fc-frise__periode">{tm('relation.periode', { debut: nomMois(mois[0]?.cle ?? '1970-01') })}</span>
        <span className="sc-fc-frise__totaux sc-nombre">
          {tm('relation.totaux', {
            mois: tm(total.mois === 1 ? 'relation.mois.1' : 'relation.mois.n', { n: total.mois }),
            echanges: tm(total.echanges === 1 ? 'relation.echanges.1' : 'relation.echanges.n', { n: total.echanges }),
            factures: `${tm(total.factures === 1 ? 'relation.factures.1' : 'relation.factures.n', { n: total.factures })}${total.enAttente > 0 ? `, ${tm(total.enAttente === 1 ? 'relation.factures.attente.1' : 'relation.factures.attente.n', { n: total.enAttente })}` : total.factures > 0 ? `, ${tm('relation.factures.payees')}` : ''}`,
          })}
        </span>
      </div>
      <div className="sc-fc-frise__defile" ref={defile}>
        <svg
          className="sc-fc-frise__svg"
          width={largeur}
          height={hauteur}
          viewBox={`0 0 ${largeur} ${hauteur}`}
          role="img"
          aria-label={tm('relation.graphique', { mois: total.mois, echanges: total.echanges, factures: total.factures })}
        >
          {Y_COULOIRS.map((y, i) => (
            <text key={y} x={0} y={y + 4} className="sc-fc-frise__couloir">{tm(i === 0 ? 'relation.couloir.echanges' : 'relation.couloir.argent')}</text>
          ))}
          {Y_COULOIRS.map((y) => <line key={y} x1={LARGEUR_LIBELLES} x2={x(n - 1) + 6} y1={y} y2={y} className="sc-fc-frise__rail" />)}

          {mois.map((m, i) => (m.cle.endsWith('-01') && i > 0 ? <line key={m.cle} x1={x(i) - pas / 2} x2={x(i) - pas / 2} y1={52} y2={Y_ANNEES - 12} className="sc-fc-frise__annee-trait" /> : null))}
          {mois.map((m, i) => (m.cle.endsWith('-01') || i === 0 ? <text key={`a-${m.cle}`} x={x(i)} y={Y_ANNEES} className="sc-fc-frise__axe">{m.cle.slice(0, 4)}</text> : null))}
          <text x={x(n - 1)} y={Y_ANNEES} textAnchor="end" className="sc-fc-frise__axe">{tm('relation.aujourdhui')}</text>
          <line x1={x(n - 1)} x2={x(n - 1)} y1={Y_JALON_POINT + 4} y2={Y_ANNEES - 12} className="sc-fc-frise__aujourdhui" />

          {jalons.map((j) => {
            const fin = x(j.indice) > largeur - 150;
            return (
              <g key={`${j.genre}-${j.jour}-${j.titre}`}>
                <text x={x(j.indice)} y={Y_JALON_TITRE} textAnchor={fin ? 'end' : 'middle'} className="sc-fc-frise__jalon">{courtTitre(j.genre === 'premier' ? tm('relation.jalon.premier') : j.titre)}</text>
                <text x={x(j.indice)} y={Y_JALON_DATE} textAnchor={fin ? 'end' : 'middle'} className="sc-fc-frise__jalon-date">{nomMois(mois[j.indice]?.cle ?? mois[0].cle)}</text>
                <circle cx={x(j.indice)} cy={Y_JALON_POINT} r={3} className="sc-fc-frise__jalon-point" />
              </g>
            );
          })}

          {mois.map((m, i) => <MarquesDuMois key={m.cle} m={m} cx={x(i)} yEchanges={Y_COULOIRS[0]} yArgent={Y_COULOIRS[1]} max={maxEchanges} nomMois={nomMois(m.cle)} />)}
        </svg>
      </div>
      <ul className="sc-fc-frise__legende">
        <li className="sc-fc-frise__leg" data-marque="echange">{tm('relation.legende.echanges')}</li>
        <li className="sc-fc-frise__leg" data-marque="signe">{tm('relation.legende.signe')}</li>
        <li className="sc-fc-frise__leg" data-marque="payee">{tm('relation.legende.payee')}</li>
        <li className="sc-fc-frise__leg" data-marque="attente">{tm('relation.legende.attente')}</li>
      </ul>
    </div>
  );
}

function MarquesDuMois({ m, cx, yEchanges, yArgent, max, nomMois }: { m: MoisRelation; cx: number; yEchanges: number; yArgent: number; max: number; nomMois: string }) {
  const { tm, langue } = useMotsFiche();
  const montant = (c: number) => euros(c, langue);
  const marques: React.ReactNode[] = [];
  m.factures.forEach((f, k) => {
    const dx = (k - (m.factures.length - 1) / 2) * 8;
    marques.push(
      <rect key={`f-${f.numero}`} x={cx + dx - 3.5} y={yArgent - 3.5} width={7} height={7} rx={1.5} className="sc-fc-frise__facture" data-etat={f.etat}>
        <title>{tm('relation.bulle.facture', { numero: f.numero, montant: montant(f.cents), etat: tm(`relation.etat.${f.etat}` as const) })}</title>
      </rect>,
    );
  });
  m.devis.forEach((d, k) => {
    const dx = m.factures.length ? 7 + k * 8 : k * 8;
    marques.push(
      <rect key={`d-${d.numero}`} x={cx + dx - 4} y={yArgent - 4} width={8} height={8} transform={`rotate(45 ${cx + dx} ${yArgent})`} className="sc-fc-frise__devis" data-etat={d.etat}>
        <title>{tm('relation.bulle.devis', { numero: d.numero, montant: montant(d.cents), etat: tm(`relation.etat.${d.etat}` as const) })}</title>
      </rect>,
    );
  });
  const r = m.echanges === 0 ? 1.2 : Math.min(7, 1.6 + 0.55 * m.echanges);
  return (
    <g>
      <circle cx={cx} cy={yEchanges} r={r} className="sc-fc-frise__echange" style={{ opacity: m.echanges === 0 ? 0.35 : 0.45 + 0.55 * (m.echanges / max) }}>
        <title>{tm(m.echanges === 1 ? 'relation.bulle.echanges.1' : 'relation.bulle.echanges.n', { n: m.echanges, mois: nomMois })}</title>
      </circle>
      {marques}
    </g>
  );
}

/** Un titre de jalon tient sur une ligne : 22 caractères, puis une ellipse. */
const courtTitre = (t: string): string => (t.length > 22 ? `${t.slice(0, 21).trimEnd()}…` : t);
