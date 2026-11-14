import React, { useMemo, useRef, useState } from 'react';
import { euros } from '../commun';
import type { Colonne } from '../pipeline';
import { colonneVoisine, COLONNES_OUVERTES, jourDepuis, type ModeleEntonnoir, type Pastille } from './modele';
import { cheminBande, largeurLibelle, nomCourt, PASTILLES_TAUX_X, placerEtape, ZONE } from './geometrie';
import { useMotsPipeline } from './i18n';

/**
 * L'ENTONNOIR (MC01, `FunnelBand` + `DealBubble` + `StageRate`) — un SVG de 1070 × 300 : la bande, ses séparateurs et son
 * axe médian pointillé, les pastilles (rayon = 9 + 0,34 × √montant), leurs libellés, les pastilles de taux de passage.
 * Une pastille se glisse (pointeur) vers une autre étape ou vers la sortie, ou se déplace aux flèches ← → ; l'écriture du
 * mouvement est celle de l'appelant (`onDeplacer`).
 */
export interface EntonnoirProps {
  modele: ModeleEntonnoir;
  aujourdhui: string;
  selectionId: string | null;
  onSelection: (id: string | null) => void;
  onDeplacer: (id: string, vers: Colonne) => void;
  lecture?: boolean;
}

const COLONNE_DE_X = (x: number): Colonne | null => (x < 0 ? null : x < ZONE.etape ? 'Nouveau' : x < 2 * ZONE.etape ? 'Rendez-vous' : x < ZONE.bande ? 'Devis envoyé' : x >= ZONE.sortieX - 20 ? 'Signé' : null);

export function Entonnoir({ modele, aujourdhui, selectionId, onSelection, onDeplacer, lecture = false }: EntonnoirProps) {
  const { tm, langue } = useMotsPipeline();
  const svg = useRef<SVGSVGElement>(null);
  const [glisse, setGlisse] = useState<{ id: string; x: number; y: number; cible: Colonne | null } | null>(null);
  const montant = (c: number | null) => (c == null ? tm('pastille.aEstimer') : euros(c, langue));

  const posees = useMemo(() => modele.etapes.flatMap((e, i) => {
    const ronds = [...e.pastilles.map((x) => ({ id: x.id, rayon: x.rayon, libelle: largeurLibelle(x.nom, montant(x.montantCents)) })), ...(e.regroupees.length ? [{ id: `plus-${e.colonne}`, rayon: 15, libelle: 40 }] : [])];
    const p = placerEtape(ronds, i);
    return p.filter((q) => !q.id.startsWith('plus-')).map((q) => ({ ...q, pastille: e.pastilles.find((x) => x.id === q.id) as Pastille }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [modele.etapes, langue]);
  const plus = useMemo(() => modele.etapes.flatMap((e, i) => (e.regroupees.length ? [{ e, p: placerEtape([...e.pastilles.map((x) => ({ id: x.id, rayon: x.rayon, libelle: largeurLibelle(x.nom, montant(x.montantCents)) })), { id: `plus-${e.colonne}`, rayon: 15, libelle: 40 }], i).find((q) => q.id === `plus-${e.colonne}`) }] : [])), // eslint-disable-next-line react-hooks/exhaustive-deps
  [modele.etapes, langue]);

  const versSvg = (e: React.PointerEvent): { x: number; y: number } => {
    const el = svg.current;
    if (!el) return { x: 0, y: 0 };
    const pt = el.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = el.getScreenCTM();
    const r = m ? pt.matrixTransform(m.inverse()) : pt;
    return { x: r.x, y: r.y };
  };

  return (
    <svg ref={svg} className="sc-mc-entonnoir" viewBox={`0 0 ${ZONE.largeur} ${ZONE.hauteur}`} role="group" aria-label={tm('surface.graphique', { n: modele.total, montant: euros(modele.enJeuCents, langue) })}>
      <defs>
        <linearGradient id="sc-mc-bande" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" className="sc-mc-bande__depart" />
          <stop offset="1" className="sc-mc-bande__fin" />
        </linearGradient>
      </defs>
      <path d={cheminBande()} fill="url(#sc-mc-bande)" className="sc-mc-bande" />
      {[ZONE.etape, 2 * ZONE.etape].map((x) => <line key={x} x1={x} x2={x} y1={ZONE.axeY - 140} y2={ZONE.axeY + 140} className="sc-mc-separateur" />)}
      <line x1={6} x2={764} y1={ZONE.axeY} y2={ZONE.axeY} className="sc-mc-axe" />

      {glisse?.cible && <rect x={glisse.cible === 'Signé' ? ZONE.sortieX : (COLONNES_OUVERTES.indexOf(glisse.cible as never)) * ZONE.etape} y={glisse.cible === 'Signé' ? 10 : ZONE.axeY - 140} width={glisse.cible === 'Signé' ? ZONE.sortieLargeur : ZONE.etape} height={glisse.cible === 'Signé' ? ZONE.sortieHauteur : 280} rx={10} className="sc-mc-cible"><title>{tm('deplacer.zone', { etape: tm(`etape.${glisse.cible}` as const) })}</title></rect>}

      {modele.etapes.map((e, i) => e.nb === 0 ? <text key={e.colonne} x={i * ZONE.etape + ZONE.etape / 2} y={ZONE.axeY + 4} textAnchor="middle" className="sc-mc-rien">{tm('etape.rien')}</text> : null)}

      {PASTILLES_TAUX_X.map((x, i) => {
        const e = modele.etapes[i];
        const pct = e?.taux == null ? null : Math.round(e.taux * 100);
        return (
          <g key={x} className="sc-mc-taux" role="img" aria-label={pct == null ? tm('taux.vide') : tm('taux.pastille', { n: pct })}>
            <rect x={x - 34} y={ZONE.axeY - 12} width={68} height={24} rx={12} />
            <text x={x - 6} y={ZONE.axeY + 4} textAnchor="middle">{pct == null ? '—' : `${pct} %`}</text>
            <path d={`M ${x + 14} ${ZONE.axeY - 3} l 3.5 3 l -3.5 3`} fill="none" />
          </g>
        );
      })}

      {plus.map(({ e, p }) => p && (
        <g key={`plus-${e.colonne}`} className="sc-mc-plus">
          <circle cx={p.x} cy={p.y} r={15} className="sc-mc-pastille sc-mc-pastille--plus"><title>{e.regroupees.map((x) => `${x.nom} · ${x.montantCents == null ? tm('pastille.aEstimer') : euros(x.montantCents, langue)}`).join('\n')}</title></circle>
          <text x={p.x} y={p.y + 4} textAnchor="middle" className="sc-mc-pastille__initiale" pointerEvents="none">+ {e.regroupees.length}</text>
        </g>
      ))}

      {posees.map(({ pastille: p, x, y, rayon }) => {
        const enGlisse = glisse?.id === p.id;
        const cx = enGlisse ? glisse.x : x;
        const cy = enGlisse ? glisse.y : y;
        const select = selectionId === p.id;
        return (
          <g
            key={p.id}
            role="presentation"
            className="sc-mc-deal"
            data-selection={select ? '' : undefined}
            data-glisse={enGlisse ? '' : undefined}
            onClick={() => onSelection(select ? null : p.id)}
            onPointerDown={(ev) => {
              if (lecture || ev.button !== 0) return;
              (ev.currentTarget as Element).setPointerCapture(ev.pointerId);
              const pt = versSvg(ev);
              setGlisse({ id: p.id, x: pt.x, y: pt.y, cible: null });
            }}
            onPointerMove={(ev) => {
              if (!glisse || glisse.id !== p.id) return;
              const pt = versSvg(ev);
              setGlisse({ id: p.id, x: pt.x, y: pt.y, cible: COLONNE_DE_X(pt.x) });
            }}
            onPointerUp={(ev) => {
              if (!glisse || glisse.id !== p.id) return;
              const pt = versSvg(ev);
              const vers = COLONNE_DE_X(pt.x);
              setGlisse(null);
              if (vers && vers !== p.colonne) onDeplacer(p.id, vers);
            }}
            onPointerCancel={() => setGlisse(null)}
          >
            {/* Zone de clic invisible de 34 px au moins (STATUT §1.39) : les événements remontent à ce groupe. */}
            <circle cx={cx} cy={cy} r={Math.max(rayon, 21)} className="sc-ct-zone" />
            {select && <circle cx={cx} cy={cy} r={rayon + 6} className="sc-mc-halo" />}
            <circle
              cx={cx}
              cy={cy}
              r={rayon}
              className="sc-mc-pastille"
              data-vide={p.montantCents == null ? '' : undefined}
              tabIndex={0}
              role="button"
              aria-pressed={select}
              aria-label={tm('pastille.clavier', { nom: p.nom, etape: tm(`etape.${p.colonne}` as const), montant: montant(p.montantCents) })}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); onSelection(select ? null : p.id); }
                if (lecture) return;
                const vers = ev.key === 'ArrowRight' ? colonneVoisine(p.colonne, 1) : ev.key === 'ArrowLeft' ? colonneVoisine(p.colonne, -1) : null;
                if (vers) { ev.preventDefault(); onDeplacer(p.id, vers); }
              }}
            >
              <title>{tm('pastille.info', { nom: p.nom, montant: montant(p.montantCents), etape: tm(`etape.${p.colonne}` as const), responsable: p.responsable ? tm('pastille.responsable', { nom: p.responsable }) : '', n: jourDepuis(p.depuis, aujourdhui) })}</title>
            </circle>
            <text x={cx} y={cy + 4} textAnchor="middle" className={p.grande && p.montantCents != null ? 'sc-mc-pastille__montant' : 'sc-mc-pastille__initiale'} pointerEvents="none">{p.grande && p.montantCents != null ? euros(p.montantCents, langue) : p.initiale}</text>
            {!enGlisse && (
              <g pointerEvents="none" className="sc-mc-libelle">
                <text x={cx} y={cy + rayon + 15} textAnchor="middle" className="sc-mc-libelle__nom">{nomCourt(p.nom)}</text>
                {!(p.grande && p.montantCents != null) && <text x={cx} y={cy + rayon + 29} textAnchor="middle" className="sc-mc-libelle__montant">{p.montantCents == null ? tm('pastille.aEstimer') : euros(p.montantCents, langue)}</text>}
                {p.sansReponse != null && <text x={cx} y={cy + rayon + (p.grande && p.montantCents != null ? 30 : 44)} textAnchor="middle" className="sc-mc-libelle__retard"><tspan className="sc-mc-libelle__point">● </tspan>{tm('pastille.sansReponse', { n: p.sansReponse })}</text>}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
