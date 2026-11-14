import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { BarreProgression, TuileKpi } from '../../socle/ui/Indicateurs';
import { Carte } from '../../socle/ui/Carte';
import { Etiquette, PastilleEtat } from '../../socle/ui/Pastilles';
import { PageHead, RangeeKpi } from '../../socle/ui/archetypes';
import { Saisie } from '../../socle/ui/Saisie';
import { Disposition, PageAtelier } from '../_commun/PageAtelier';
import { euros, eurosRond, nombre, versCentimes } from '../_commun/nombres';
import { BESOIN, OFFRES, POIDS } from './donnees';
import { useTextes } from './i18n';
import { comparer, CRITERES, verifier, verifierOffre, type Critere, type Offre } from './logique';
import { MODULE } from './module';

type ChampOffre = 'fournisseur' | 'prix' | 'delai' | 'garantie' | 'qualite' | 'acompte';
type LigneTexte = { id: string } & Record<ChampOffre, string>;

const enTexte = (o: Offre): LigneTexte => ({
  id: o.id,
  fournisseur: o.fournisseur,
  prix: String(o.prixHT / 100),
  delai: String(o.delaiJours),
  garantie: String(o.garantieMois),
  qualite: String(o.qualite),
  acompte: String(o.acomptePct),
});
const num = (s: string) => (s.trim() === '' ? Number.NaN : Number(s.replace(',', '.')));
const versOffre = (l: LigneTexte): Offre => ({
  id: l.id,
  fournisseur: l.fournisseur,
  prixHT: versCentimes(l.prix),
  delaiJours: num(l.delai),
  garantieMois: num(l.garantie),
  qualite: num(l.qualite),
  acomptePct: num(l.acompte),
});

const COLONNES: readonly ChampOffre[] = ['fournisseur', 'prix', 'delai', 'garantie', 'qualite', 'acompte'];

export default function EcranComparateurDevis() {
  const { tx, langue } = useTextes();
  const [lignes, setLignes] = useState<LigneTexte[]>(() => OFFRES.map(enTexte));
  const [poids, setPoids] = useState<Record<Critere, string>>(() => Object.fromEntries(CRITERES.map((c) => [c, String(POIDS[c])])) as Record<Critere, string>);
  const [copie, setCopie] = useState(false);

  const offres = lignes.map(versOffre);
  const p = Object.fromEntries(CRITERES.map((c) => [c, num(poids[c])])) as Record<Critere, number>;
  const fautes = verifier(offres, p);
  const r = comparer(offres, p);
  const changer = (id: string, champ: ChampOffre, valeur: string) => {
    setLignes(lignes.map((l) => (l.id === id ? { ...l, [champ]: valeur } : l)));
    setCopie(false);
  };

  const texte = r
    ? [`${tx('besoin')} : ${BESOIN}`, ...r.map((n) => `${n.rang}. ${n.offre.fournisseur} — ${nombre(n.total, 1, langue)}/100 — ${euros(n.offre.prixHT, langue)}`)].join('\n')
    : '';
  const moinsCher = r ? [...r].sort((a, b) => a.offre.prixHT - b.offre.prixHT)[0] : null;
  const aVerifier = r ? r.filter((n) => n.anormalementBasse).length : 0;

  return (
    <PageAtelier famille={MODULE.famille}>
      <PageHead
        titre={tx('nom')}
        sousTitre={`${tx('besoin')} · ${BESOIN}`}
        primaire={
          r
            ? {
                libelle: copie ? tx('copie') : tx('copier'),
                icone: <Copy size={14} />,
                onClick: () => {
                  void navigator.clipboard?.writeText(texte).then(() => setCopie(true));
                },
              }
            : undefined
        }
      />

      {r && moinsCher && (
        <RangeeKpi>
          <TuileKpi famille={MODULE.famille} libelle={tx('kpi.tete')} valeur={`${nombre(r[0].total, 1, langue)}/100`} variation={r[0].offre.fournisseur} />
          <TuileKpi famille={MODULE.famille} libelle={tx('res.moinsCher')} valeur={eurosRond(moinsCher.offre.prixHT, langue)} variation={moinsCher.offre.fournisseur} />
          <TuileKpi
            famille={MODULE.famille}
            libelle={tx('kpi.alertes')}
            valeur={String(aVerifier)}
            ton={aVerifier > 0 ? 'attention' : 'succes'}
            variation={aVerifier > 0 ? tx('kpi.alertes.court') : tx('kpi.alertes.aucune')}
            detail={tx('kpi.alertes.detail')}
          />
        </RangeeKpi>
      )}

      <Disposition
        droite={
          <Carte titre={tx('section.poids')}>
            <div className="flex flex-col gap-3">
              {CRITERES.map((c) => (
                <Saisie key={c} etiquette={tx(`critere.${c}`)} inputMode="decimal" value={poids[c]} onChange={(e) => setPoids({ ...poids, [c]: e.target.value })} />
              ))}
              <p className="text-[12.5px] leading-relaxed text-socle-texte-doux">{tx('poids.aide')}</p>
            </div>
          </Carte>
        }
      >
        <Carte titre={tx('section.offres')}>
          <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[620px] border-collapse text-[13.5px]">
              <thead>
                <tr>
                  {COLONNES.map((c) => (
                    <th key={c} scope="col" className={`px-1.5 pb-2 text-[12px] font-semibold text-socle-texte-doux ${c === 'fournisseur' ? 'text-left' : 'text-right'}`}>
                      {tx(`col.${c}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => {
                  const erreurs = verifierOffre(versOffre(l));
                  return (
                    <tr key={l.id}>
                      {COLONNES.map((c) => (
                        <td key={c} className="px-1.5 py-1">
                          <input
                            data-socle="champ"
                            aria-label={`${tx(`col.${c}`)} — ${l.fournisseur || l.id}`}
                            aria-invalid={erreurs.includes(c) || undefined}
                            inputMode={c === 'fournisseur' ? undefined : 'decimal'}
                            value={l[c]}
                            onChange={(e) => changer(l.id, c, e.target.value)}
                            className={`sc-champ__controle ${c === 'fournisseur' ? 'min-w-[190px] text-left' : 'min-w-[84px] text-right tabular-nums'}`}
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Carte>

        <Carte titre={tx('section.classement')}>
          {r ? (
            <ol aria-live="polite" className="flex flex-col gap-3">
              {r.map((n) => (
                <li key={n.offre.id} className="flex flex-col gap-2 border-t border-socle-bord pt-3 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <span className="text-[14.5px] font-semibold text-socle-texte">
                      <span className="mr-2 tabular-nums text-socle-texte-doux">{n.rang}.</span>
                      {n.offre.fournisseur}
                    </span>
                    <span className="text-[14px] tabular-nums text-socle-texte">
                      <span className="font-semibold">{nombre(n.total, 1, langue)}</span>
                      <span className="text-socle-texte-doux">/100 · {euros(n.offre.prixHT, langue)}</span>
                    </span>
                  </div>
                  <BarreProgression valeur={n.total / 100} libelle={`${n.offre.fournisseur} : ${nombre(n.total, 1, langue)}/100`} />
                  <div className="flex flex-wrap items-center gap-1.5">
                    {CRITERES.map((c) => (
                      <Etiquette key={c} compacte>
                        {tx(`critere.${c}`)} {nombre(n.notes[c], 0, langue)}
                      </Etiquette>
                    ))}
                    <Etiquette compacte>{n.ecartAuMoinsCher === 0 ? tx('res.ecart0') : `+${euros(n.ecartAuMoinsCher, langue)}`}</Etiquette>
                  </div>
                  {n.anormalementBasse && (
                    <div className="flex flex-col items-start gap-1.5">
                      <PastilleEtat etat="attention">{tx('res.anormal.titre')}</PastilleEtat>
                      <p className="text-[12.5px] leading-relaxed text-socle-texte-doux">{tx('res.anormal', { p: n.sousLaMoyennePct })}</p>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <ul aria-live="polite" className="flex flex-col gap-2">
              {fautes.map((f, i) => (
                <li key={i}>
                  <PastilleEtat etat="critique" allegee>
                    {f === 'nombre' || f === 'poids' ? tx(`erreur.${f}`) : tx('erreur.offre', { f: lignes.find((l) => l.id === f.offre)?.fournisseur || f.offre })}
                  </PastilleEtat>
                </li>
              ))}
            </ul>
          )}
        </Carte>
      </Disposition>
    </PageAtelier>
  );
}
