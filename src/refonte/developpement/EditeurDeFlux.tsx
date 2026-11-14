import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Check, Clock3, Euro, Filter, Mail, Play, Workflow, type LucideIcon } from 'lucide-react';
import { PastilleEtat } from '../../socle/ui';
import { useCollection, useSync } from '../../state/SyncContext';
import {
  basculerFlux,
  defautsDuFlux,
  depuisAutomation,
  modeDuFlux,
  traduireConnecteurs,
  versAutomation,
  type AutomationEtendue,
  type BlocAction,
  type BlocQuand,
  type BlocSi,
  type CleConnecteurs,
  type Flux,
  type ModeBloc,
  type TypeQuand,
} from '../connecteurs';
import { ABrancher, CarteDev, PageDev, SuggestionDev, useLectureSeule } from './briques';
import { useDonneesDeveloppement } from './donnees';
import { dire } from './i18n';
import { executionsDuMois, resumeFlux, texteDerniereExecution } from './journal';

/**
 * DEV-editeur · ÉDITEUR DE FLUX — fiche `docs/refonte/fiches/LOT-11/DEV-editeur.md`, image `DEV-editeur.png`.
 *
 * Un flux en blocs Quand / Si / Alors / Sinon / Puis, au format de S9 (`connecteurs/flux.ts`, STATUT §1.17 n° 7),
 * rangé comme une règle du moteur de H20 (collection `automations`) : pas de troisième moteur. « Éditeur de flux »
 * partout, h1 compris (§1.17 n° 4). Un flux enregistré garde son état ; un flux neuf naît en pause.
 */

const L = 'fr' as const;
const tc = (cle: string, vars?: Record<string, string | number>) => traduireConnecteurs(L, cle as CleConnecteurs, vars);

/** Les déclencheurs de la palette (fiche §4) : leur type de S9 et leur icône. */
const PALETTE: { type: TypeQuand; icone: LucideIcon; ton: string; heure?: string }[] = [
  { type: 'courriel-recu', icone: Mail, ton: 'info' },
  { type: 'rendez-vous-cree', icone: CalendarDays, ton: 'attention' },
  { type: 'paiement-recu', icone: Euro, ton: 'succes' },
  { type: 'horaire', icone: Clock3, ton: 'violet', heure: '08:00' },
];

type Role = 'quand' | 'si' | 'alors' | 'sinon' | 'puis';
interface BlocPlace {
  id: string;
  role: Role;
  titre: string;
  detail: string;
  mode: ModeBloc;
  x: number;
  y: number;
  icone: LucideIcon;
}

const COLONNES = [21, 247, 473];
/** Rangées du canevas (px) : la première, puis la seconde à 184, puis tous les 160 (cotes de la fiche). */
const rangee = (k: number) => (k === 0 ? 49 : 233 + (k - 1) * 160);

function titreQuand(q: BlocQuand): string {
  return tc(`quand.${q.type}`, { heure: q.parametres.heure ?? '08:00' });
}
function detailQuand(q: BlocQuand): string {
  return q.parametres.boite ? dire(L, 'edit.surBoite', { boite: q.parametres.boite }) : '';
}
function titreSi(s: BlocSi): string {
  return tc(`si.${s.type}`, { mots: (s.parametres.mots ?? []).join(', '), montant: String((s.parametres.montantCents ?? 0) / 100) });
}
function titreAction(a: BlocAction): string {
  return tc(`action.${a.type}`, { dossier: a.parametres.dossier ?? '' });
}
function detailAction(a: BlocAction): string {
  const morceaux: string[] = [];
  if (a.parametres.titre) morceaux.push(`« ${a.parametres.titre} »`);
  if (a.parametres.modeleId) morceaux.push(`« ${a.parametres.modeleId} »`);
  if (a.parametres.echeanceJours !== undefined) morceaux.push(a.parametres.echeanceJours === 1 ? dire(L, 'temps.demain') : dire(L, 'edit.dansJours', { n: a.parametres.echeanceJours }));
  return morceaux.join(' · ');
}

/** La place de chaque bloc sur le canevas : Quand, Si, puis la branche « oui » en colonne, « non » sous le Si. */
export function placer(f: Flux): { blocs: BlocPlace[]; liens: { de: string; a: string; ton: string; sens: 'h' | 'v' }[] } {
  const blocs: BlocPlace[] = [{ id: f.quand.id, role: 'quand', titre: titreQuand(f.quand), detail: detailQuand(f.quand), mode: f.quand.mode, x: COLONNES[0], y: rangee(0), icone: Mail }];
  const liens: { de: string; a: string; ton: string; sens: 'h' | 'v' }[] = [];
  const colAlors = f.si ? 2 : 1;
  if (f.si) {
    blocs.push({ id: f.si.id, role: 'si', titre: titreSi(f.si), detail: '', mode: f.si.mode, x: COLONNES[1], y: rangee(0), icone: Filter });
    liens.push({ de: f.quand.id, a: f.si.id, ton: 'info', sens: 'h' });
  }
  let precedent = f.si ? f.si.id : f.quand.id;
  f.alors.forEach((a, k) => {
    blocs.push({ id: a.id, role: k === 0 ? 'alors' : 'puis', titre: titreAction(a), detail: detailAction(a), mode: a.mode, x: COLONNES[colAlors], y: rangee(k), icone: k === 0 ? Check : Workflow });
    liens.push({ de: precedent, a: a.id, ton: k === 0 ? (f.si ? 'attention' : 'info') : k === 1 ? 'succes' : 'violet', sens: k === 0 ? 'h' : 'v' });
    precedent = a.id;
  });
  let precSinon = f.si?.id ?? null;
  f.sinon.forEach((a, k) => {
    blocs.push({ id: a.id, role: k === 0 ? 'sinon' : 'puis', titre: titreAction(a), detail: detailAction(a), mode: a.mode, x: COLONNES[1], y: rangee(k + 1), icone: Filter });
    if (precSinon) liens.push({ de: precSinon, a: a.id, ton: 'attention', sens: 'v' });
    precSinon = a.id;
  });
  return { blocs, liens };
}

const LARG_BLOC = 204;
const MILIEU_BLOC = 48;
/** Les liens verticaux partent du bas du plus petit bloc : sous un bloc plus haut, la ligne passe derrière lui. */
const HAUT_MIN_BLOC = 97;

export default function EditeurDeFlux() {
  const d = useDonneesDeveloppement();
  const { upsert } = useSync();
  const aller = useNavigate();
  const lectureSeule = useLectureSeule();
  const regles = useCollection<AutomationEtendue>('automations');
  const m = d.maintenant;

  const flux = useMemo(() => {
    const liste: Flux[] = [];
    for (const [i, r] of regles.entries()) {
      try {
        liste.push(depuisAutomation(r.id, dire(L, 'edit.regle', { n: i + 1 }), r));
      } catch {
        // une règle mal rangée est ignorée ici ; H20 la montre telle qu'elle est
      }
    }
    return liste;
  }, [regles]);

  const [choisi, setChoisi] = useState<string | null>(null);
  const [brouillon, setBrouillon] = useState<Flux | null>(null);
  const [annonce, setAnnonce] = useState('');
  const courant = brouillon ?? flux.find((f) => f.id === choisi) ?? flux[0] ?? null;
  const modifie = brouillon !== null;
  const defauts = courant ? defautsDuFlux(courant) : [];

  const resume = resumeFlux(
    flux.map((f) => ({ etat: f.etat === 'actif' ? 'Active' : f.etat === 'en-pause' ? 'En pause' : 'Brouillon' })),
    L,
  );
  const execMois = courant ? executionsDuMois(d.executions, m, courant.id) : 0;
  const plan = courant ? placer(courant) : null;
  const mode = courant ? modeDuFlux(courant) : 'local';

  const modifier = (f: Flux) => {
    setBrouillon(f);
    setAnnonce('');
  };
  const choisirQuand = (type: TypeQuand, heure?: string) => {
    if (!courant) return;
    modifier({ ...courant, quand: { ...courant.quand, type, parametres: heure ? { heure } : {} } });
  };
  const enregistrer = () => {
    if (!courant) return;
    const regle = versAutomation(courant, new Date(m).toISOString(), courant.nom);
    if (!regle) {
      setAnnonce(dire(L, 'edit.defauts'));
      return;
    }
    void upsert('automations', courant.id, regle as unknown as Record<string, unknown>).then(() => {
      setBrouillon(null);
      setChoisi(courant.id);
      setAnnonce(dire(L, 'edit.enregistre'));
    });
  };

  const sous = `${dire(L, 'edit.sous')} · ${resume.texte}`;

  return (
    <PageDev
      titre={dire(L, 'edit.titre')}
      sousTitre={sous}
      source={d.source}
      secondaires={[{ libelle: dire(L, 'edit.tester'), icone: <Play size={15} />, disabled: true, infobulle: dire(L, 'edit.testerAttente') }]}
      primaire={{ libelle: dire(L, 'edit.enregistrer'), icone: <Check size={15} />, onClick: enregistrer, disabled: !modifie, raccourci: '⌘S' }}
    >
      <p className="dv-annonce" role="status" aria-live="polite">
        {annonce}
      </p>
      <div className="dv-ed-corps">
        {!courant || !plan ? (
          <CarteDev className="dv-ed-canevas-carte">
            <ABrancher icone={<Workflow size={20} />} titre={dire(L, 'edit.vide.titre')} texte={dire(L, 'edit.vide.texte')} />
          </CarteDev>
        ) : (
          <CarteDev
            className="dv-ed-canevas-carte"
            titre={courant.nom}
            droite={`${dire(L, courant.etat === 'actif' ? 'edit.actif' : courant.etat === 'en-pause' ? 'edit.enPause' : 'edit.brouillon')} · ${dire(L, execMois > 1 ? 'edit.executions.n' : 'edit.executions.1', { n: execMois })}`}
            rang={0}
          >
            <div className="dv-ed-canevas" role="group" aria-label={dire(L, 'edit.canevas')}>
              <svg className="dv-ed-liens" aria-hidden>
                {plan.liens.map((l) => {
                  const a = plan.blocs.find((b) => b.id === l.de);
                  const b = plan.blocs.find((x) => x.id === l.a);
                  if (!a || !b) return null;
                  const d1 =
                    l.sens === 'h'
                      ? `M${a.x + LARG_BLOC},${a.y + MILIEU_BLOC} L${b.x},${b.y + MILIEU_BLOC}`
                      : `M${a.x + LARG_BLOC / 2},${a.y + HAUT_MIN_BLOC} L${b.x + LARG_BLOC / 2},${b.y}`;
                  return <path key={`${l.de}-${l.a}`} d={d1} className="dv-ed-lien" data-ton={l.ton} />;
                })}
              </svg>
              {plan.blocs.map((b) => (
                <div key={b.id} className="dv-ed-bloc" data-role={b.role} style={{ left: b.x, top: b.y }} tabIndex={0} aria-label={`${dire(L, `edit.role.${b.role}` as Parameters<typeof dire>[1])} : ${b.titre}`}>
                  <span className="dv-ed-bloc__tete">
                    <span className="dv-ed-bloc__tuile" aria-hidden>
                      <b.icone size={12} />
                    </span>
                    <span className="dv-ed-bloc__role">{dire(L, `edit.role.${b.role}` as Parameters<typeof dire>[1])}</span>
                    <span className="dv-ed-bloc__mode">{dire(L, b.mode === 'api' ? 'edit.modeApi' : 'edit.modeLocal')}</span>
                  </span>
                  <span className="dv-ed-bloc__titre">{b.titre}</span>
                  {b.detail && <span className="dv-ed-bloc__detail">{b.detail}</span>}
                </div>
              ))}
              <span className="dv-ed-puces">
                {defauts.length > 0 && <PastilleEtat etat="attention">{dire(L, 'edit.aCorriger', { n: defauts.length })}</PastilleEtat>}
                <PastilleEtat etat="info">{texteDerniereExecution(d.executions, m, courant.id, L)}</PastilleEtat>
              </span>
            </div>
          </CarteDev>
        )}

        <div className="dv-ed-droite">
          <CarteDev className="dv-ed-palette" titre={dire(L, 'edit.ajouter')} rang={1}>
            <ul className="dv-ed-palette__liste">
              {PALETTE.map((p) => (
                <li key={p.type}>
                  <button type="button" className="dv-ed-palette__bloc" data-ton={p.ton} onClick={() => choisirQuand(p.type, p.heure)} disabled={!courant || lectureSeule}>
                    <span className="dv-ed-palette__tuile" aria-hidden>
                      <p.icone size={13} />
                    </span>
                    {p.type === 'horaire' ? tc('quand.horaire', { heure: p.heure ?? '08:00' }) : tc(`quand.${p.type}`)}
                  </button>
                </li>
              ))}
            </ul>
          </CarteDev>
          <CarteDev className="dv-ed-mode" titre={dire(L, 'edit.commentCaTourne')} rang={2}>
            <div className="dv-ed-options" role="radiogroup" aria-label={dire(L, 'edit.commentCaTourne')}>
              {(['local', 'api'] as const).map((md) => (
                <button
                  key={md}
                  type="button"
                  role="radio"
                  aria-checked={mode === md}
                  className="dv-ed-option"
                  data-choisi={mode === md || undefined}
                  disabled={!courant || lectureSeule}
                  onClick={() => courant && modifier(basculerFlux(courant, md))}
                >
                  <span className="dv-point" data-ton={md === 'local' ? 'succes' : 'attention'} aria-hidden />
                  <span className="dv-ed-option__textes">
                    <span className="dv-ed-option__titre">{dire(L, md === 'local' ? 'edit.local.titre' : 'edit.api.titre')}</span>
                    <span className="dv-t4">{dire(L, md === 'local' ? 'edit.local.sous' : 'edit.api.sous')}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="dv-t4 dv-ed-mode__note">{dire(L, 'edit.changer')}</p>
          </CarteDev>
          <SuggestionDev className="dv-ed-suggestion" texte={dire(L, 'edit.astuce')} action={dire(L, 'edit.voirAutomatisations')} onAction={() => aller('/outils/automatisations')} />
        </div>
      </div>
    </PageDev>
  );
}
