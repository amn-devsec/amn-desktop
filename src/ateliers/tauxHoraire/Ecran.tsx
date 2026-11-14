import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Carte } from '../../socle/ui/Carte';
import { PageHead, RangeeKpi } from '../../socle/ui/archetypes';
import { PastilleEtat } from '../../socle/ui/Pastilles';
import { Saisie } from '../../socle/ui/Saisie';
import { Selecteur } from '../../socle/ui/controles';
import { TuileKpi } from '../../socle/ui/Indicateurs';
import { Disposition, PageAtelier } from '../_commun/PageAtelier';
import { euros, eurosRond, nombre, versCentimes } from '../_commun/nombres';
import { EXEMPLE } from './donnees';
import { useTextes } from './i18n';
import { calculerTaux, verifier, type EntreesTaux, type ErreurTaux, type Regime } from './logique';
import { MODULE } from './module';

type Champ = 'revenu' | 'charges' | 'cotisations' | 'joursParSemaine' | 'semainesConges' | 'feriesChomes' | 'autresJoursOff' | 'heuresParJour' | 'partFacturable' | 'marge' | 'tarifActuel';

const enTexte = (e: EntreesTaux): Record<Champ, string> => ({
  revenu: String(e.revenuAnnuel / 100),
  charges: String(e.chargesFixes / 100),
  cotisations: String(e.tauxCotisations),
  joursParSemaine: String(e.joursParSemaine),
  semainesConges: String(e.semainesConges),
  feriesChomes: String(e.feriesChomes),
  autresJoursOff: String(e.autresJoursOff),
  heuresParJour: String(e.heuresParJour),
  partFacturable: String(e.partFacturable),
  marge: String(e.margeSecurite),
  tarifActuel: e.tarifActuel ? String(e.tarifActuel / 100) : '',
});

const num = (s: string) => (s.trim() === '' ? Number.NaN : Number(s.replace(',', '.')));

export default function EcranTauxHoraire() {
  const { tx, langue } = useTextes();
  const [regime, setRegime] = useState<Regime>(EXEMPLE.regime);
  const [v, setV] = useState(() => enTexte(EXEMPLE));
  const [copie, setCopie] = useState(false);

  const entrees: EntreesTaux = {
    regime,
    revenuAnnuel: versCentimes(v.revenu),
    chargesFixes: versCentimes(v.charges),
    tauxCotisations: num(v.cotisations),
    joursParSemaine: num(v.joursParSemaine),
    semainesConges: num(v.semainesConges),
    feriesChomes: num(v.feriesChomes),
    autresJoursOff: num(v.autresJoursOff),
    heuresParJour: num(v.heuresParJour),
    partFacturable: num(v.partFacturable),
    margeSecurite: num(v.marge),
    tarifActuel: v.tarifActuel.trim() === '' ? undefined : versCentimes(v.tarifActuel),
  };
  const fautes = verifier(entrees);
  const r = calculerTaux(entrees);
  const faute = (f: ErreurTaux) => (fautes.includes(f) ? tx(`erreur.${f}`) : undefined);
  const e = (c: Champ) => ({
    value: v[c],
    onChange: (ev: React.ChangeEvent<HTMLInputElement>) => {
      setV({ ...v, [c]: ev.target.value });
      setCopie(false);
    },
    inputMode: 'decimal' as const,
  });

  const resume = r
    ? [
        `${tx('res.taux')} : ${euros(r.tauxHoraire, langue)}`,
        `${tx('res.journee')} : ${euros(r.prixJournee, langue)}`,
        `${tx('res.ca')} : ${euros(r.caNecessaire, langue)}`,
        `${tx('res.heures')} : ${nombre(r.heuresFacturables, 1, langue)}`,
      ].join('\n')
    : '';

  return (
    <PageAtelier famille={MODULE.famille}>
      <PageHead
        titre={tx('nom')}
        sousTitre={tx('intro')}
        primaire={
          r
            ? {
                libelle: copie ? tx('copie') : tx('copier'),
                icone: <Copy size={14} />,
                onClick: () => {
                  void navigator.clipboard?.writeText(resume).then(() => setCopie(true));
                },
              }
            : undefined
        }
      />

      {r ? (
        <RangeeKpi libelle={tx('section.resultat')}>
          <TuileKpi famille={MODULE.famille} libelle={tx('res.taux')} valeur={euros(r.tauxHoraire, langue)} variation={tx('res.taux.court')} detail={tx('res.taux.detail')} />
          <TuileKpi
            famille={MODULE.famille}
            libelle={tx('res.journee')}
            valeur={euros(r.prixJournee, langue)}
            variation={tx('res.journee.court', { h: nombre((entrees.heuresParJour * entrees.partFacturable) / 100, 1, langue) })}
            detail={tx('res.journee.detail', { h: nombre((entrees.heuresParJour * entrees.partFacturable) / 100, 1, langue) })}
          />
          <TuileKpi famille={MODULE.famille} libelle={tx('res.ca')} valeur={euros(r.caNecessaire, langue)} variation={tx('res.ca.court', { c: eurosRond(r.cotisations, langue) })} detail={tx('res.ca.detail', { c: euros(r.cotisations, langue) })} />
          <TuileKpi
            famille={MODULE.famille}
            libelle={tx('res.heures')}
            valeur={nombre(r.heuresFacturables, 1, langue)}
            variation={tx('res.heures.court', { s: nombre(r.heuresFacturablesParSemaine, 1, langue) })}
            detail={tx('res.heures.detail', { j: r.joursTravailles, s: nombre(r.heuresFacturablesParSemaine, 1, langue) })}
          />
        </RangeeKpi>
      ) : (
        <Carte titre={tx('section.resultat')}>
          <ul aria-live="polite" className="flex flex-col gap-2">
            {fautes.map((f) => (
              <li key={f}>
                <PastilleEtat etat="critique" allegee>
                  {tx(`erreur.${f}`)}
                </PastilleEtat>
              </li>
            ))}
          </ul>
        </Carte>
      )}

      <Disposition
        droite={
          <Carte titre={tx('section.tarif')}>
            <div className="flex flex-col gap-3">
              <Saisie etiquette={tx('tarifActuel')} aide={tx('tarifActuel.aide')} suffixe="€" {...e('tarifActuel')} />
              <div aria-live="polite" className="flex flex-col items-start gap-2">
                {r?.manqueParHeure !== undefined && (
                  <>
                    <PastilleEtat etat={r.manqueParHeure > 0 ? 'attention' : 'succes'}>{tx(r.manqueParHeure > 0 ? 'res.sous' : 'res.couvert')}</PastilleEtat>
                    <p className="text-[13px] leading-relaxed text-socle-texte-doux">
                      {r.manqueParHeure > 0
                        ? tx('res.manque', { m: euros(r.manqueParHeure, langue), a: euros(r.manqueSurAnnee ?? 0, langue) })
                        : tx('res.ok', { m: euros(-r.manqueParHeure, langue) })}
                    </p>
                  </>
                )}
              </div>
            </div>
          </Carte>
        }
      >
        <div className="grid gap-3.5 md:grid-cols-2">
          <Carte titre={tx('section.vous')}>
            <div className="flex flex-col gap-3">
              <Selecteur
                etiquette={tx('regime')}
                value={regime}
                onChange={(ev) => {
                  setRegime(ev.target.value as Regime);
                  setCopie(false);
                }}
              >
                <option value="reel">{tx('regime.reel')}</option>
                <option value="micro">{tx('regime.micro')}</option>
              </Selecteur>
              <Saisie etiquette={tx('revenu')} aide={tx('revenu.aide')} suffixe="€" erreur={faute('revenu')} {...e('revenu')} />
              <Saisie etiquette={tx('charges')} aide={tx('charges.aide')} suffixe="€" erreur={faute('charges')} {...e('charges')} />
              <Saisie
                etiquette={tx('cotisations')}
                aide={tx(regime === 'reel' ? 'cotisations.aide.reel' : 'cotisations.aide.micro')}
                suffixe="%"
                erreur={faute('cotisations')}
                {...e('cotisations')}
              />
              <Saisie etiquette={tx('marge')} suffixe="%" erreur={faute('marge')} {...e('marge')} />
            </div>
          </Carte>
          <Carte titre={tx('section.temps')}>
            <div className="grid grid-cols-2 gap-3">
              <Saisie etiquette={tx('joursParSemaine')} erreur={faute('jours')} {...e('joursParSemaine')} />
              <Saisie etiquette={tx('semainesConges')} {...e('semainesConges')} />
              <Saisie etiquette={tx('feriesChomes')} {...e('feriesChomes')} />
              <Saisie etiquette={tx('autresJoursOff')} aide={tx('autresJoursOff.aide')} {...e('autresJoursOff')} />
              <Saisie etiquette={tx('heuresParJour')} suffixe="h" erreur={faute('heures')} {...e('heuresParJour')} />
              <Saisie etiquette={tx('partFacturable')} aide={tx('partFacturable.aide')} suffixe="%" erreur={faute('partFacturable')} {...e('partFacturable')} />
            </div>
          </Carte>
        </div>
      </Disposition>
    </PageAtelier>
  );
}
