import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Carte } from '../../socle/ui/Carte';
import { CaseACocher } from '../../socle/ui/Taches';
import { PageHead, RangeeKpi } from '../../socle/ui/archetypes';
import { PastilleEtat, type EtatPastille } from '../../socle/ui/Pastilles';
import { Saisie } from '../../socle/ui/Saisie';
import { TuileKpi } from '../../socle/ui/Indicateurs';
import { Disposition, PageAtelier } from '../_commun/PageAtelier';
import { AUJOURDHUI_BAC_A_SABLE, dateLisible, euros, eurosRond, versCentimes } from '../_commun/nombres';
import { ECHEANCIERS } from './donnees';
import { useTextes } from './i18n';
import {
  NOMBRE_MAX,
  NOMBRE_MIN,
  ajusterPayees,
  basculerPayee,
  echeances,
  synthese,
  verifier,
  type Echeance,
  type Echeancier,
  type EtatEcheance,
  type ErreurEcheancier,
} from './logique';
import { MODULE } from './module';

interface Brouillon {
  montant: string;
  acompte: string;
  nombre: string;
  date: string;
}

const enBrouillon = (e: Echeancier): Brouillon => ({
  montant: String(e.montantTTC / 100),
  acompte: e.acompte ? String(e.acompte / 100) : '',
  nombre: String(e.nombre),
  date: e.premiereDate,
});

const appliquer = (e: Echeancier, b: Brouillon): Echeancier =>
  ajusterPayees({
    ...e,
    montantTTC: versCentimes(b.montant.trim() === '' ? Number.NaN : b.montant),
    acompte: b.acompte.trim() === '' ? 0 : versCentimes(b.acompte),
    nombre: b.nombre.trim() === '' ? Number.NaN : Number(b.nombre),
    premiereDate: b.date,
  });

const ETAT: Record<EtatEcheance, EtatPastille> = { payee: 'succes', aVenir: 'neutre', enRetard: 'critique' };

export default function EcranEcheancier() {
  const { tx, langue } = useTextes();
  const [liste, setListe] = useState<Echeancier[]>(ECHEANCIERS);
  const [brouillons, setBrouillons] = useState<Record<string, Brouillon>>(() => Object.fromEntries(ECHEANCIERS.map((e) => [e.id, enBrouillon(e)])));
  const [choisi, setChoisi] = useState(ECHEANCIERS[0].id);
  const [copie, setCopie] = useState(false);

  const courants = liste.map((e) => appliquer(e, brouillons[e.id]));
  const syntheses = courants.map((e) => synthese(e, AUJOURDHUI_BAC_A_SABLE));
  const valides = syntheses.filter((s): s is NonNullable<typeof s> => s !== null);
  const totalReste = valides.reduce((s, x) => s + x.resteDu, 0);
  const totalRetard = valides.reduce((s, x) => s + x.enRetard, 0);
  const nbRetard = valides.reduce((s, x) => s + x.nbEnRetard, 0);
  const totalEncaisse = valides.reduce((s, x) => s + x.encaisse, 0);
  const enCours = valides.filter((s) => !s.solde).length;

  const indice = Math.max(0, courants.findIndex((e) => e.id === choisi));
  const e = courants[indice];
  const b = brouillons[e.id];
  const s = syntheses[indice];
  const lignes = echeances(e, AUJOURDHUI_BAC_A_SABLE);
  const fautes = verifier(e);
  const vars = { min: NOMBRE_MIN, max: NOMBRE_MAX };
  const faute = (f: ErreurEcheancier) => (fautes.includes(f) ? tx(`erreur.${f}`, vars) : undefined);
  const champ = (c: keyof Brouillon) => ({
    value: b[c],
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) => {
      setBrouillons({ ...brouillons, [e.id]: { ...b, [c]: ev.target.value } });
      setCopie(false);
    },
  });
  const basculer = (i: number) => setListe(liste.map((x) => (x.id === e.id ? { ...x, payees: basculerPayee(e, i).payees } : x)));
  const libelleEtat = (x: Echeance) => (x.etat === 'enRetard' ? tx('etat.enRetard', { j: x.retard }) : tx(`etat.${x.etat}`));

  const pourLeClient = lignes
    ? [
        tx('client.titre', { ref: e.reference, objet: e.objet }),
        tx('client.total', { t: euros(e.montantTTC, langue) }),
        ...(e.acompte ? [tx('client.acompte', { a: euros(e.acompte, langue) })] : []),
        ...lignes.map((x) =>
          tx('client.ligne', { r: x.rang, m: euros(x.montant, langue), d: dateLisible(x.date, langue), etat: x.etat === 'payee' ? tx('client.payee') : '' }),
        ),
      ].join('\n')
    : '';

  return (
    <PageAtelier famille={MODULE.famille}>
      <PageHead
        titre={tx('nom')}
        sousTitre={tx('intro')}
        primaire={
          lignes
            ? {
                libelle: copie ? tx('copie') : tx('copier'),
                icone: <Copy size={14} />,
                onClick: () => {
                  void navigator.clipboard?.writeText(pourLeClient).then(() => setCopie(true));
                },
              }
            : undefined
        }
      />

      <RangeeKpi>
        <TuileKpi famille={MODULE.famille} libelle={tx('total.reste')} valeur={eurosRond(totalReste, langue)} variation={tx('total.reste.court', { n: enCours })} detail={tx('total.reste.detail', { n: enCours })} />
        <TuileKpi
          famille={MODULE.famille}
          libelle={tx('total.retard')}
          valeur={eurosRond(totalRetard, langue)}
          ton={nbRetard > 0 ? 'critique' : 'succes'}
          variation={nbRetard === 0 ? tx('total.retard.aucun') : nbRetard === 1 ? tx('total.retard.court.un') : tx('total.retard.court', { n: nbRetard })}
          detail={nbRetard === 0 ? tx('total.retard.aucun') : nbRetard === 1 ? tx('total.retard.detail.un') : tx('total.retard.detail', { n: nbRetard })}
        />
        <TuileKpi famille={MODULE.famille} libelle={tx('total.encaisse')} valeur={eurosRond(totalEncaisse, langue)} variation={tx('total.encaisse.court')} detail={tx('total.encaisse.detail')} />
      </RangeeKpi>

      <Disposition
        droite={
          <Carte titre={tx('section.liste')}>
            <ul className="-m-1 flex flex-col gap-2">
              {courants.map((x, i) => {
                const sx = syntheses[i];
                return (
                  <li key={x.id}>
                    <Carte
                      compacte
                      active={x.id === e.id}
                      aria-label={`${x.client} — ${x.reference}`}
                      onClick={() => {
                        setChoisi(x.id);
                        setCopie(false);
                      }}
                      titre={x.client}
                      surtitre={`${x.reference} · ${x.objet}`}
                    >
                      {sx && (sx.solde ? <PastilleEtat etat="succes">{tx('carte.solde')}</PastilleEtat> : <PastilleEtat etat={sx.nbEnRetard > 0 ? 'critique' : 'neutre'}>{tx('carte.reste', { m: euros(sx.resteDu, langue) })}</PastilleEtat>)}
                    </Carte>
                  </li>
                );
              })}
            </ul>
          </Carte>
        }
      >
        <Carte titre={e.client} surtitre={`${e.reference} · ${e.objet}`}>
          <div className="flex flex-col gap-4">
            {s && (
              <p className="text-[13px] leading-relaxed text-socle-texte-doux">
                <span className="mr-2 text-[22px] font-semibold tabular-nums text-socle-texte">{euros(s.resteDu, langue)}</span>
                {tx('res.reste')}. {tx('res.reste.detail', { e: euros(s.encaisse, langue), t: euros(e.montantTTC, langue) })}{' '}
                {s.prochaine ? tx('res.prochaine', { m: euros(s.prochaine.montant, langue), d: dateLisible(s.prochaine.date, langue) }) : ''}
              </p>
            )}
            <div className="grid min-w-0 gap-3 sm:grid-cols-2">
              <Saisie etiquette={tx('montant')} suffixe="€" inputMode="decimal" erreur={faute('montant')} {...champ('montant')} />
              <Saisie etiquette={tx('acompte')} aide={tx('acompte.aide')} suffixe="€" inputMode="decimal" erreur={faute('acompte')} {...champ('acompte')} />
              <Saisie etiquette={tx('nombre')} aide={tx('nombre.aide', vars)} inputMode="numeric" erreur={faute('nombre') ?? faute('tropPetit')} {...champ('nombre')} />
              <Saisie etiquette={tx('date')} aide={tx('date.aide')} type="date" erreur={faute('date')} {...champ('date')} />
            </div>
          </div>
        </Carte>

        <Carte titre={tx('section.echeances')}>
          {lignes ? (
            <div aria-live="polite" className="-mx-[18px] -mb-4">
              <ol>
                {lignes.map((x, i) => (
                  <li key={x.rang} className="grid grid-cols-[1.75rem_minmax(0,1fr)_auto_auto] items-center gap-3 border-t border-socle-bord px-[18px] py-3">
                    <span className="text-[13px] tabular-nums text-socle-texte-doux">{x.rang}</span>
                    <span className="flex min-w-0 flex-col">
                      <span className="text-[14px] font-semibold tabular-nums text-socle-texte">{euros(x.montant, langue)}</span>
                      <span className="text-[12.5px] text-socle-texte-doux">{dateLisible(x.date, langue)}</span>
                    </span>
                    <PastilleEtat etat={ETAT[x.etat]}>{libelleEtat(x)}</PastilleEtat>
                    <CaseACocher coche={x.etat === 'payee'} onChange={() => basculer(i)} libelle={tx('marquer', { r: x.rang })} />
                  </li>
                ))}
              </ol>
              <p className="border-t border-socle-bord px-[18px] py-3 text-[12.5px] leading-relaxed text-socle-texte-doux">{tx('regle')}</p>
            </div>
          ) : (
            <ul aria-live="polite" className="flex flex-col gap-2">
              {fautes.map((f) => (
                <li key={f}>
                  <PastilleEtat etat="critique" allegee>
                    {tx(`erreur.${f}`, vars)}
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
