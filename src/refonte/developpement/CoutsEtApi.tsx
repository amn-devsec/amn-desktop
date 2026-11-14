import React, { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Cloud, Coins, CreditCard, Landmark, Mail, MessageCircle, PenLine, Plug, Plus, type LucideIcon } from 'lucide-react';
import { PastilleEtat, type EtatPastille } from '../../socle/ui';
import { formaterEuro } from '../../socle/formats';
import { SEUIL_SUGGESTION_FORFAIT } from '../connecteurs';
import { ABrancher, CarteDev, PageDev, SuggestionDev } from './briques';
import { moisCourt } from './commun';
import { useDonneesDeveloppement } from './donnees';
import { dire, direCompte } from './i18n';
import { partFaiteSeul, payeDuMois } from './vues';

/**
 * DEV-couts · COÛTS ET API — fiche `docs/refonte/fiches/LOT-11/DEV-couts.md`, image `DEV-couts.png`.
 *
 * Ce que l'application fait seule et ce qui coûte : part faite seul, payé du mois, économie, six mois de paiements,
 * le tableau des connecteurs branchés, le plafond et l'aide d'Ajmani sur un forfait. Les comptes sont calculés
 * (STATUT §1.17 n° 5), jamais repris de l'image. Le plafond n'a pas de valeur imposée : il est demandé au premier
 * branchement d'un outil payant (Harun, 12 nov.), dans le parcours de H21 (modèle de S9).
 */

const L = 'fr' as const;
const ICONES: Record<string, LucideIcon> = { card: CreditCard, bank: Landmark, calendar: CalendarDays, mail: Mail, cloud: Cloud, book: BookOpen, pen: PenLine, chat: MessageCircle };
const MODE: Record<string, { etat: EtatPastille; cle: Parameters<typeof dire>[1] }> = {
  local: { etat: 'succes', cle: 'couts.mode.local' },
  payant: { etat: 'attention', cle: 'couts.mode.payant' },
  'a-brancher': { etat: 'neutre', cle: 'couts.mode.aBrancher' },
};

export default function CoutsEtApi() {
  const d = useDonneesDeveloppement();
  const [annonce, setAnnonce] = useState('');
  const branche = d.source === 'exemple';

  const vue = useMemo(() => {
    const branches = d.connecteurs.filter((c) => c.mode !== 'a-brancher');
    const plusTard = d.connecteurs.filter((c) => c.mode === 'a-brancher');
    const paye = payeDuMois(d.connecteurs);
    const part = partFaiteSeul(d.connecteurs);
    const mois = [...d.paiements].sort((a, b) => a.mois.localeCompare(b.mois)).slice(-6);
    const economise = mois.at(-1)?.economiseCents ?? null;
    const forfait = branches
      .filter((c) => c.mode === 'payant' && c.consommationMois.inclus)
      .map((c) => ({ c, part: Math.round((c.consommationMois.utilise / (c.consommationMois.inclus ?? 1)) * 100) }))
      .filter((x) => x.part >= SEUIL_SUGGESTION_FORFAIT)
      .sort((a, b) => b.part - a.part)[0];
    return { branches, plusTard, paye, part, mois, economise, forfait, locaux: branches.filter((c) => c.mode === 'local').length };
  }, [d]);

  const sous = branche
    ? `${dire(L, 'couts.payes', { paye: formaterEuro(vue.paye / 100) })} · ${dire(L, 'couts.gratuits', { n: vue.locaux, t: vue.branches.length })}`
    : dire(L, 'couts.brancher.titre');
  const maxMois = Math.max(1, ...vue.mois.map((x) => x.payeCents));

  return (
    <PageDev
      titre={dire(L, 'couts.titre')}
      sousTitre={sous}
      source={d.source}
      primaire={{ libelle: dire(L, 'commun.brancher'), icone: <Plus size={15} />, disabled: true, infobulle: dire(L, 'couts.attenteH21') }}
    >
      <p className="dv-annonce" role="status" aria-live="polite">
        {annonce}
      </p>
      {!branche || d.connecteurs.length === 0 ? (
        <CarteDev>
          <ABrancher icone={<Coins size={20} />} titre={dire(L, 'couts.brancher.titre')} texte={dire(L, 'couts.brancher.texte')} />
        </CarteDev>
      ) : (
        <>
          <CarteDev className="dv-ct-bandeau" rang={0}>
            <div className="dv-ct-part">
              <span className="dv-ct-donut" role="img" aria-label={vue.part === null ? '—' : dire(L, 'couts.partLibelle', { p: vue.part })} style={{ ['--dv-part' as string]: `${vue.part ?? 0}` }}>
                <span className="dv-ct-donut__centre">
                  <span className="dv-ct-donut__pct">{vue.part === null ? '—' : `${vue.part} %`}</span>
                  <span className="dv-t3">{dire(L, 'couts.faitSeul')}</span>
                </span>
              </span>
              <span className="dv-ct-legende">
                <span>
                  <span className="dv-point" data-ton="succes" /> {dire(L, 'couts.legendeLocal')}
                </span>
                <span>
                  <span className="dv-point dv-ct-point-payant" /> {dire(L, 'couts.legendePayant')}
                </span>
              </span>
            </div>
            <div className="dv-ct-paye">
              <span className="dv-ct-libelle">{dire(L, 'couts.payeCeMois')}</span>
              <span className="dv-ct-paye__ligne">
                <span className="dv-ct-paye__montant">{formaterEuro(vue.paye / 100)}</span>
                <span className="dv-t3">{dire(L, 'couts.sansPlafond')}</span>
              </span>
              {vue.economise !== null && vue.economise > 0 && (
                <>
                  <PastilleEtat etat="succes">{dire(L, 'couts.economise', { e: formaterEuro(vue.economise / 100) })}</PastilleEtat>
                  <span className="dv-t3 dv-ct-phrase">{dire(L, 'couts.toutEnApi', { total: formaterEuro((vue.paye + vue.economise) / 100) })}</span>
                </>
              )}
            </div>
            <div className="dv-ct-mois">
              <span className="dv-ct-libelle">{dire(L, 'couts.sixMois')}</span>
              <span className="dv-ct-barres" role="img" aria-label={vue.mois.map((x) => `${x.mois} ${formaterEuro(x.payeCents / 100)}`).join(', ')}>
                {vue.mois.map((x, i) => (
                  <span key={x.mois} className="dv-ct-barre" data-courant={i === vue.mois.length - 1 || undefined} style={{ height: `${Math.max(8, Math.round((x.payeCents / maxMois) * 100))}%` }} title={formaterEuro(x.payeCents / 100)} />
                ))}
              </span>
              <span className="dv-ct-reperes dv-t4">
                <span>{vue.mois[0] ? moisCourt(`${vue.mois[0].mois}-01`, L) : ''}</span>
                <span>{vue.mois.length ? moisCourt(`${vue.mois[vue.mois.length - 1].mois}-01`, L) : ''}</span>
              </span>
            </div>
          </CarteDev>

          <div className="dv-ct-corps">
            <CarteDev className="dv-ct-table-carte" titre={dire(L, 'couts.tableTitre')} droite={direCompte(L, 'couts.connecteurs', vue.branches.length)} rang={1}>
              <table className="dv-ct-table">
                <thead>
                  <tr>
                    <th scope="col">{dire(L, 'couts.col.connecteur')}</th>
                    <th scope="col">{dire(L, 'couts.col.mode')}</th>
                    <th scope="col">{dire(L, 'couts.col.ceMois')}</th>
                    <th scope="col">{dire(L, 'couts.col.conso')}</th>
                  </tr>
                </thead>
                <tbody>
                  {vue.branches.map((c) => {
                    const Icone = ICONES[c.icone] ?? Plug;
                    const conso = c.consommationMois;
                    const ratio = conso.inclus ? Math.min(1, conso.utilise / conso.inclus) : null;
                    return (
                      <tr key={c.id}>
                        <td>
                          <span className="dv-ct-nom">
                            <span className="dv-ct-tuile" data-mode={c.mode} aria-hidden>
                              <Icone size={14} />
                            </span>
                            {c.nom}
                          </span>
                        </td>
                        <td>
                          <PastilleEtat etat={MODE[c.mode].etat}>{dire(L, MODE[c.mode].cle)}</PastilleEtat>
                        </td>
                        <td className="dv-t2">
                          {c.mode === 'local'
                            ? formaterEuro(0)
                            : c.modeleDeCout === 'commission'
                              ? dire(L, 'couts.commission')
                              : dire(L, 'couts.ceMois', { paye: formaterEuro(c.payeCeMoisCents / 100) })}
                        </td>
                        <td>
                          <span className="dv-ct-conso dv-t3">
                            {conso.inclus
                              ? dire(L, c.mode === 'payant' ? 'couts.surInclus' : 'couts.sur', { u: conso.utilise, i: conso.inclus })
                              : dire(L, 'couts.utilise', { u: conso.utilise, unite: conso.unite })}
                          </span>
                          <span className="dv-ct-jauge" aria-hidden>
                            {ratio !== null && <span data-mode={c.mode} style={{ width: `${Math.round(ratio * 100)}%` }} />}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CarteDev>

            <div className="dv-ct-droite">
              <CarteDev className="dv-ct-plafond" titre={dire(L, 'couts.plafondTitre')} rang={2}>
                <div className="dv-ct-plafond__corps">
                  <span className="dv-ct-anneau" aria-hidden>
                    <span className="dv-ct-anneau__montant">{formaterEuro(vue.paye / 100)}</span>
                    <span className="dv-t4">{dire(L, 'couts.aFixer')}</span>
                  </span>
                  <dl className="dv-ct-regles">
                    <div>
                      <dt>{dire(L, 'couts.prevenirA')}</dt>
                      <dd>80 %</dd>
                    </div>
                    <div>
                      <dt>{dire(L, 'couts.auPlafond')}</dt>
                      <dd title={dire(L, 'couts.toutSArreteAide')}>{dire(L, 'couts.toutSArrete')}</dd>
                    </div>
                  </dl>
                </div>
              </CarteDev>
              {vue.forfait ? (
                <SuggestionDev
                  className="dv-ct-suggestion"
                  texte={dire(L, 'couts.suggestion', { nom: vue.forfait.c.nom, p: vue.forfait.part })}
                  action={dire(L, 'couts.mePrevenir')}
                  onAction={() => setAnnonce(dire(L, 'couts.prevenirAttente'))}
                />
              ) : (
                <SuggestionDev className="dv-ct-suggestion" texte={dire(L, 'couts.astuce')} action={dire(L, 'couts.voirConnecteurs')} onAction={() => setAnnonce(dire(L, 'couts.attenteH21'))} />
              )}
              <CarteDev className="dv-ct-plus-tard" titre={dire(L, 'couts.plusTard')} rang={3}>
                {vue.plusTard.length === 0 ? (
                  <p className="dv-vide-ligne">{dire(L, 'couts.toutBranche')}</p>
                ) : (
                  <ul className="dv-ct-plus-tard__liste">
                    {vue.plusTard.slice(0, 2).map((c) => {
                      const Icone = ICONES[c.icone] ?? Plug;
                      return (
                        <li key={c.id}>
                          <span className="dv-ct-tuile" data-mode={c.modeleDeCout === 'gratuit' ? 'local' : 'payant'} aria-hidden>
                            <Icone size={14} />
                          </span>
                          <span className="dv-ct-plus-tard__nom">{c.nom}</span>
                          <span className="dv-t4">{dire(L, c.modeleDeCout === 'gratuit' ? 'couts.local' : 'couts.payant')}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CarteDev>
            </div>
          </div>
        </>
      )}
    </PageDev>
  );
}

