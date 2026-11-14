import React from 'react';
import { ArrowRight, CalendarDays, Check, Image as ImageIcon, Truck, Wrench } from 'lucide-react';
import { PageHead, Segmente, SuggestionCompact } from '../../../../socle/ui';
import { formaterEuro } from '../../commun';
import { useMots } from './textes';
import type { ChantierVue, EtapeVue, ModeleChantiers } from './modele';
import '../../creer.css';

export interface VueChantiersProps {
  modele: ModeleChantiers;
  vue: 'plans' | 'liste' | 'carte';
  onVue: (v: 'plans' | 'liste' | 'carte') => void;
  onOuvrir: (id: string) => void;
  onNouveau?: () => void;
  /** Coche ou décoche une étape du chantier ouvert (sans droit d'écriture : absent, le rail est en lecture). */
  onEtape?: (chantierId: string, indice: number) => void;
  /** « Voir la tournée » : la règle « livraison après la pose prévue » du chantier ouvert (`modele.ouvert.prochaine.livraison`). */
  onDecaler?: () => void;
  onIgnorer?: () => void;
  suggestionMasquee?: boolean;
}

const initiale = (n: string) => (n.trim()[0] ?? '·').toUpperCase();

function Jauge({ pct }: { pct: number }) {
  const longueur = Math.PI * 76;
  const p = Math.min(100, Math.max(0, pct));
  return (
    <svg className="cr-jauge" width="168" height="94" viewBox="0 0 168 94" role="img" aria-label={`${p} %`}>
      <defs><linearGradient id="cr-jauge-degrade" x1="0" x2="1"><stop offset="0" stopColor="var(--fam-a)" /><stop offset="1" stopColor="var(--fam-b)" /></linearGradient></defs>
      <path d="M8 86 A76 76 0 0 1 160 86" fill="none" stroke="var(--socle-anneau-fond)" strokeWidth="9" strokeLinecap="round" />
      {p > 0 && <path d="M8 86 A76 76 0 0 1 160 86" fill="none" stroke="url(#cr-jauge-degrade)" strokeWidth="9" strokeLinecap="round" strokeDasharray={`${(longueur * p) / 100} ${longueur}`} style={{ filter: 'drop-shadow(0 0 5px var(--fam-a))' }} />}
    </svg>
  );
}

function Equipe({ equipe }: { equipe: readonly string[] }) {
  return <span className="cr-equipe">{equipe.slice(0, 2).map((p) => <span key={p} className="cr-avatar">{initiale(p)}</span>)}</span>;
}

function PastilleRythme({ c }: { c: ChantierVue }) {
  const { tm } = useMots();
  const ton = c.rythme === 'en-phase' ? 'succes' : c.rythme === 'a-surveiller' ? 'attention' : 'gris';
  return <span className="cr-rythme" data-ton={ton}>● {tm(`rythme.${c.rythme}` as never)}</span>;
}

function Rail({ etapes, onEtape }: { etapes: EtapeVue[]; onEtape?: (i: number) => void }) {
  const { tm } = useMots();
  return (
    <ol className="cr-rail" style={{ ['--n' as string]: etapes.length }}>
      {etapes.map((e, i) => (
        <li key={`${e.nom}-${i}`} className="cr-rail__etape" data-etat={e.etat}>
          {onEtape ? (
            <button type="button" className="cr-rail__noeud sc-focus" onClick={() => onEtape(i)} aria-pressed={e.etat === 'faite'} aria-label={e.nom}>{e.etat === 'faite' ? <Check size={14} aria-hidden /> : e.etat === 'encours' ? <Wrench size={13} aria-hidden /> : null}</button>
          ) : (
            <span className="cr-rail__noeud">{e.etat === 'faite' ? <Check size={14} aria-hidden /> : e.etat === 'encours' ? <Wrench size={13} aria-hidden /> : null}</span>
          )}
          <b title={e.court.tronque ? e.nom : undefined}>{e.court.court}</b>
          <small className="cr-mono">{e.quand}</small>
          {e.partPct !== null && <small className="cr-rail__part">{tm('etape.enCours', { n: e.partPct })}</small>}
          <Equipe equipe={e.equipe} />
        </li>
      ))}
    </ol>
  );
}

function Ouvert({ c, onOuvrir, onEtape }: { c: ChantierVue; onOuvrir: (id: string) => void; onEtape?: (chantierId: string, i: number) => void }) {
  const { tm } = useMots();
  return (
    <section className="cr-carte cr-ouvert" data-mvt="entree" aria-label={c.nom}>
      <header className="cr-ouvert__tete">
        <span className="cr-carre">{c.initiale}</span>
        <div>
          <h2>{c.nom} <span className="cr-pastille" data-ton={c.statut === 'En retard' ? 'attention' : 'info'}>{tm(`statut.${c.statut}` as never)}</span></h2>
          <p>{[c.objet, c.finPrevue ? `fin prévue le ${c.finPrevue}` : null].filter(Boolean).join(' · ')}</p>
        </div>
        <div className="cr-ouvert__actions">
          <button type="button" className="cr-bouton-verre"><ImageIcon size={14} aria-hidden /> {tm('photos')}</button>
          <button type="button" className="cr-bouton-verre" onClick={() => onOuvrir(c.id)}><ArrowRight size={14} aria-hidden /> {tm('ouvrir')}</button>
        </div>
      </header>
      <div className="cr-ouvert__corps">
        {c.etapes.length > 0 ? <Rail etapes={c.etapes} onEtape={onEtape ? (i) => onEtape(c.id, i) : undefined} /> : <p className="cr-t3">{tm('definir')}</p>}
        <div className="cr-budget">
          {c.budgetPct !== null ? (
            <>
              <Jauge pct={c.budgetPct} />
              <div className="cr-budget__centre"><b className="cr-mono">{c.budgetPct} %</b><small>{tm('budget.consomme')}</small></div>
              <p className="cr-mono cr-budget__montants">{tm('budget.sur', { depense: formaterEuro(c.depenseCents / 100), budget: formaterEuro(c.budgetCents / 100) })}</p>
              <p className="cr-budget__av">{tm('budget.avancement', { n: c.avancement })} <PastilleRythme c={c} /></p>
            </>
          ) : (
            <>
              <Jauge pct={0} />
              <div className="cr-budget__centre cr-budget__centre--vide"><small>{tm('budget.nonRenseigne')}</small></div>
              <p className="cr-budget__montants"><small className="cr-t3">{tm('budget.ajouter')}</small></p>
              <p className="cr-budget__av">{tm('budget.avancement', { n: c.avancement })}</p>
            </>
          )}
        </div>
      </div>
      <footer className="cr-prochaine">
        <span className="cr-prochaine__icone"><CalendarDays size={15} aria-hidden /></span>
        <div>
          <small>{tm('prochaine.titre')}</small>
          <p>{c.prochaine ? `${c.prochaine.jour}, ${c.prochaine.heure} · ${c.prochaine.libelle}` : tm('prochaine.aucune')}</p>
        </div>
        {c.prochaine && <Equipe equipe={c.prochaine.equipe} />}
        {c.prochaine?.livraison && <span className="cr-prochaine__livraison"><Truck size={13} aria-hidden /> {tm('prochaine.livraison', { objet: 'matériel', jour: c.prochaine.livraison })}</span>}
      </footer>
    </section>
  );
}

function Ligne({ c, onOuvrir }: { c: ChantierVue; onOuvrir: (id: string) => void }) {
  const { tm } = useMots();
  const cours = c.indiceEnCours;
  const nom = cours >= 0 ? c.etapes[cours]?.nom : c.etapes[0]?.nom;
  return (
    <button type="button" className="cr-carte cr-site" data-mvt="entree" onClick={() => onOuvrir(c.id)}>
      <span className="cr-carre">{c.initiale}</span>
      <span className="cr-site__nom"><b>{c.nom}</b><small>{c.objet}</small></span>
      <span className="cr-site__rail">
        <span className="cr-mini">{c.etapes.map((e, i) => <i key={i} data-etat={e.etat} />)}</span>
        <small>{c.etapes.length === 0 ? tm('definir') : cours >= 0 ? tm('ligne.etape', { n: cours + 1, total: c.etapes.length, nom: nom ?? '' }) : tm('ligne.debut', { jour: '', nom: nom ?? '' })}</small>
      </span>
      <span className="cr-site__budget">
        {c.budgetPct !== null ? (
          <>
            <span className="cr-site__budget-tete"><small>{tm('budget.libelle')}</small><b className="cr-mono">{c.budgetPct} %</b></span>
            <span className="cr-site__barre"><i data-ambre={c.budgetAmbre} style={{ width: `${Math.min(100, c.budgetPct)}%` }} /></span>
            <PastilleRythme c={c} />
          </>
        ) : <small>{tm('budget.nonRenseigne')}</small>}
      </span>
      <span className="cr-site__prochaine">{c.prochaine ? (<><small>{tm('ligne.prochaine')}</small><b>{c.prochaine.jour}</b></>) : <small>{tm('prochaine.aucune')}</small>}</span>
    </button>
  );
}

export function VueChantiers(p: VueChantiersProps) {
  const { tm } = useMots();
  const { modele: m } = p;
  const sous = `${m.resume.enCours} chantier${m.resume.enCours >= 2 ? 's' : ''} en cours et ${m.resume.aDemarrer} à démarrer`;
  return (
    <div className="cr-page" data-famille="creer" data-ecran="H16">
      <PageHead
        titre={tm('titre')}
        sousTitre={sous}
        extra={<Segmente libelle={tm('vue.libelle')} valeur={p.vue} onChange={(v) => p.onVue(v as 'plans' | 'liste' | 'carte')} options={[{ cle: 'plans', libelle: tm('vue.plans') }, { cle: 'liste', libelle: tm('vue.liste') }, { cle: 'carte', libelle: tm('vue.carte') }]} />}
        primaire={{ libelle: tm('nouveau'), onClick: p.onNouveau ?? (() => undefined), raccourci: 'N' }}
      />
      {m.ouvert === null ? (
        <section className="cr-carte" style={{ padding: 32 }}><h2 style={{ margin: 0 }}>{tm('vide.titre')}</h2><p className="cr-t3">{tm('vide.texte')}</p></section>
      ) : (
        <div className="cr-chantiers">
          <div className="cr-chantiers__gauche">
            <Ouvert c={m.ouvert} onOuvrir={p.onOuvrir} onEtape={p.onEtape} />
            {m.autres.map((c) => <Ligne key={c.id} c={c} onOuvrir={p.onOuvrir} />)}
          </div>
          <aside className="cr-chantiers__droite">
            <section className="cr-carte cr-agenda" data-mvt="entree" aria-label={tm('agenda.titre')}>
              <header><b>{tm('agenda.titre')}</b><small>{tm('agenda.sous', { n: m.nbAgenda })}</small></header>
              <div className="cr-bilan">
                <span className="cr-bilan__anneau" style={{ ['--pct' as string]: m.bilan.prevues ? (m.bilan.bouclees / m.bilan.prevues) * 100 : 0 }} />
                <div><b>{m.bilan.bouclees} étapes sur {m.bilan.prevues} bouclées</b><small>{m.bilan.toutesALHeure ? tm('bilan.toutes') : tm('bilan.retard')}</small></div>
              </div>
              {m.agenda.length === 0 ? <p className="cr-t3" style={{ padding: 14 }}>{tm('agenda.rien')}</p> : m.agenda.map((j) => (
                <div key={j.jour}>
                  <h3 className="cr-agenda__jour">{j.titre}</h3>
                  {j.lignes.map((l, i) => (
                    <div key={i} className="cr-agenda__ligne"><span className="cr-mono cr-t3">{l.heure ?? '·'}</span><span className="cr-agenda__texte"><b>{l.site}</b><small>{l.libelle}</small></span>{l.type === 'livraison' && <Truck size={14} aria-hidden />}</div>
                  ))}
                </div>
              ))}
            </section>
            {m.ouvert.prochaine?.livraison && !p.suggestionMasquee && (
              <section className="cr-sugg" data-mvt="entree" aria-label={tm('suggestion.titre')}>
                <SuggestionCompact
                  texte={tm('suggestion.texte', { jour: m.ouvert.prochaine.livraison })}
                  libelleOui={tm('suggestion.decaler')}
                  libelleNon={tm('suggestion.ignorer')}
                  onOui={p.onDecaler ?? (() => undefined)}
                  onNon={p.onIgnorer ?? (() => undefined)}
                />
              </section>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
