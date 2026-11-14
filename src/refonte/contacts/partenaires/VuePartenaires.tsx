import React, { useMemo, useState } from 'react';
import { AlertCircle, Briefcase, Calculator, Camera, FileText, Globe, Languages, MessageSquare, Package, Palette, Phone, Plus, Send, Shield, Store, Truck, Users, KeyRound } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BarreProgression } from '../../../socle/ui/Indicateurs';
import { SuggestionAjmani } from '../../../socle/ui/controles';
import { BlocEtat } from '../../../socle/ui/situations';
import { FilterChips } from '../../../socle/ui/vivant';
import { cheminLien, CENTRE, largeurDuLibelle, ORBITES, placer, RAYON_DISQUE, ZONE } from './geometrie';
import { gardeLeFiltre, type FiltreReseau, type ModeleReseau, type NoeudPartenaire } from './modele';
import { useMotsPartenaires } from './i18n';
import './partenaires.css';
import '../cibles.css';

/**
 * « PARTENAIRES » (MC05) — la carte du réseau : AMN au centre bas, les partenaires sur trois orbites selon la fréquence des
 * échanges, l'épaisseur du lien selon la force de la relation. Mise en page et états, sans accès aux données.
 *
 * Disposition (fiche MC05, zone principale de 1108 px) : en-tête (titre, sous-titre, « Inviter un partenaire », primaire
 * « Ajouter »), surface « Ton réseau » de 768 × 664 (zone graphique de 732 × 520, pied de légende), colonne droite de 320 :
 * partenaire sélectionné 252, « Recommandations » 173, suggestion 211, écart 14.
 */
export interface ActionsPartenaires {
  ajouter: () => void;
  inviter: () => void;
  ecrire: (n: NoeudPartenaire) => void;
  voirAcces: (n: NoeudPartenaire) => void;
  comparer: (n: NoeudPartenaire) => void;
  plusTard: () => void;
  ouvrirFournisseurs: () => void;
  reessayer: () => void;
}

export interface VuePartenairesProps {
  /** `indisponible` : l'application n'a pas de collection de partenaires. */
  statut: 'pret' | 'chargement' | 'erreur' | 'indisponible';
  horsLigne?: boolean;
  modele: ModeleReseau | null;
  actions: ActionsPartenaires;
  lecture?: boolean;
  selectionInitiale?: string | null;
}

const ICONES: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  truck: Truck, users: Users, palette: Palette, calculator: Calculator, store: Store, languages: Languages, camera: Camera, package: Package, globe: Globe, file: FileText, shield: Shield, phone: Phone,
};
const Icone = ({ nom, taille = 17 }: { nom: string; taille?: number }) => { const C = ICONES[nom] ?? Briefcase; return <C size={taille} strokeWidth={1.8} />; };

export function VuePartenaires({ statut, horsLigne = false, modele, actions, lecture = false, selectionInitiale = null }: VuePartenairesProps) {
  const { tm } = useMotsPartenaires();
  const [filtre, setFiltre] = useState<FiltreReseau>('tous');
  const [choix, setChoix] = useState<string | null>(selectionInitiale);
  const m = modele;
  const choisi = m ? m.noeuds.find((n) => n.id === choix) ?? null : null;
  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={tm('sousTitre', { n: m?.total ?? 0 })}
        secondaires={lecture || statut !== 'pret' ? [] : [{ libelle: tm('action.inviter'), onClick: actions.inviter, icone: <Send size={14} strokeWidth={2} /> }]}
        primaire={lecture || statut !== 'pret' ? undefined : { libelle: tm('action.ajouter'), onClick: actions.ajouter, icone: <Plus size={14} strokeWidth={2.2} /> }}
        className="sc-pa__entete"
      />
      {horsLigne && <p className="sc-pa__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'indisponible' ? (
        <BlocEtat icone={<Users size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.indisponible.titre')} texte={tm('etat.indisponible.texte')} actions={<Bouton variante="secondaire" onClick={actions.ouvrirFournisseurs}>{tm('etat.indisponible.action')}</Bouton>} />
      ) : statut === 'erreur' || !m ? (
        statut === 'chargement' ? <div className="sc-pa" aria-busy="true"><div className="sc-pa-carte sc-pa-surface" /></div> : (
          <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
        )
      ) : (
        <div className="sc-pa">
          <section className="sc-pa-carte sc-pa-surface" aria-label={tm('reseau.titre')}>
            <div className="sc-pa-surface__tete">
              <h2 className="sc-pa-carte__titre">{tm('reseau.titre')}</h2>
              <FilterChips
                libelle={tm('reseau.puces')}
                puces={[{ cle: 'tous', libelle: tm('reseau.tous') }, { cle: 'renouveler', libelle: tm('reseau.renouveler'), compteur: m.chips.renouveler }]}
                valeur={filtre}
                onChange={(c) => setFiltre(c as FiltreReseau)}
              />
              <span className="sc-pa-surface__compte sc-nombre">{tm(m.total === 1 ? 'reseau.compte.1' : 'reseau.compte.n', { n: m.total, k: m.actifs })}</span>
            </div>
            <div className="sc-pa-zone">
              {m.total === 0 && <div className="sc-pa-zone__vide">
                <BlocEtat icone={<Users size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('etat.vide.titre')} texte={tm('etat.vide.texte')} actions={lecture ? <span /> : <Bouton variante="primaire" onClick={actions.ajouter}>{tm('action.ajouter')}</Bouton>} /></div>}
              <Reseau m={m} filtre={filtre} choixId={choisi?.id ?? null} onChoisir={(id) => setChoix((cur) => (cur === id ? null : id))} />
            </div>
            <div className="sc-pa-pied">
              <span className="sc-pa-pied__trait"><i /><i data-gras /></span><span>{tm('legende.epaisseur')}</span>
              <span className="sc-pa-pied__recos">{tm('legende.recos')}</span>
              <span className="sc-pa-pied__droite">{tm('legende.frequence')}</span>
            </div>
          </section>
          <div className="sc-pa-droite">
            <Carte n={choisi} actions={actions} lecture={lecture} />
            <section className="sc-pa-carte sc-pa-recos" aria-label={tm('recos.titre')}><h2 className="sc-pa-carte__titre">{tm('recos.titre')}</h2><p className="sc-pa-vide">{tm('recos.indisponible')}</p></section>
            <Suggestion m={m} actions={actions} />
          </div>
        </div>
      )}
    </Page>
  );
}

function ligne2(n: NoeudPartenaire, tm: ReturnType<typeof useMotsPartenaires>['tm'], jour: (j: string) => string): { texte: string; ton: 'neutre' | 'attention' | 'critique' } {
  if (n.etat === 'renouveler' && n.finContratLe) return { texte: tm((n.joursAvantFin ?? 0) < 0 ? 'noeud.fin.echu' : 'noeud.fin', { jour: jour(n.finContratLe) }), ton: 'critique' };
  if (n.etat === 'pause') return { texte: tm('noeud.pause', { categorie: n.categorie }), ton: 'attention' };
  return { texte: n.categorie, ton: 'neutre' };
}

function Reseau({ m, filtre, choixId, onChoisir }: { m: ModeleReseau; filtre: FiltreReseau; choixId: string | null; onChoisir: (id: string) => void }) {
  const { tm, langue } = useMotsPartenaires();
  const jour = (j: string) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${j}T12:00:00Z`));
  const poses = useMemo(
    () => placer(m.noeuds.map((n) => ({ id: n.id, orbite: n.orbite, largeurLibelle: largeurDuLibelle(n.nomCourt === n.nom ? n.nom : n.nom, ligne2(n, tm, jour).texte) }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [m.noeuds, langue],
  );
  const parId = new Map(poses.map((p) => [p.id, p]));
  const demi = (o: keyof typeof ORBITES) => `M ${CENTRE.x - ORBITES[o].rx} ${CENTRE.y} A ${ORBITES[o].rx} ${ORBITES[o].ry} 0 0 1 ${CENTRE.x + ORBITES[o].rx} ${CENTRE.y}`;
  const ordre = [...m.noeuds].sort((a, b) => ({ semaine: 0, mois: 1, rare: 2 })[a.orbite] - ({ semaine: 0, mois: 1, rare: 2 })[b.orbite] || a.nom.localeCompare(b.nom, 'fr'));
  return (
    <svg className="sc-pa-svg" viewBox={`0 0 ${ZONE.largeur} ${ZONE.hauteur}`} role="group" aria-label={tm('reseau.graphique', { n: m.total })}>
      {(['semaine', 'mois', 'rare'] as const).map((o) => (
        <g key={o}>
          <path d={demi(o)} className="sc-pa-orbite" fill="none" />
          <text x={CENTRE.x + ORBITES[o].rx - 6} y={CENTRE.y + 20} textAnchor="end" className="sc-pa-orbite__libelle">{tm(`orbite.${o}` as const)}</text>
        </g>
      ))}
      {ordre.map((n) => {
        const p = parId.get(n.id);
        if (!p) return null;
        const choisi = n.id === choixId;
        return <path key={`l-${n.id}`} d={cheminLien(p)} className="sc-pa-lien" data-choisi={choisi ? '' : undefined} data-pointille={n.pointille ? '' : undefined} data-pale={gardeLeFiltre(n, filtre) ? undefined : ''} style={{ strokeWidth: n.epaisseur }} fill="none" />;
      })}
      <g className="sc-pa-centre">
        <circle cx={CENTRE.x} cy={CENTRE.y} r={46} className="sc-pa-centre__halo" />
        <circle cx={CENTRE.x} cy={CENTRE.y} r={38} className="sc-pa-centre__disque" />
        <text x={CENTRE.x} y={CENTRE.y - 2} textAnchor="middle" className="sc-pa-centre__haut">{tm('reseau.centre.haut')}</text>
        <text x={CENTRE.x} y={CENTRE.y + 13} textAnchor="middle" className="sc-pa-centre__bas">{tm('reseau.centre.bas')}</text>
      </g>
      {ordre.map((n) => {
        const p = parId.get(n.id);
        if (!p) return null;
        const choisi = n.id === choixId;
        const l2 = ligne2(n, tm, jour);
        return (
          <g key={n.id} className="sc-pa-noeud" data-etat={n.etat} data-choisi={choisi ? '' : undefined} data-pale={gardeLeFiltre(n, filtre) ? undefined : ''}>
            <g
              tabIndex={0}
              role="button"
              aria-pressed={choisi}
              aria-label={tm('noeud.info', { nom: n.nom, force: n.force, echanges: n.echanges90j })}
              className="sc-pa-noeud__disque"
              onClick={() => onChoisir(n.id)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChoisir(n.id); } }}
            >
              {choisi && <circle cx={p.x} cy={p.y} r={RAYON_DISQUE + 6} className="sc-pa-noeud__anneau" />}
              <circle cx={p.x} cy={p.y} r={RAYON_DISQUE} />
              <foreignObject x={p.x - 9} y={p.y - 9} width={18} height={18} pointerEvents="none"><div className="sc-pa-noeud__icone"><Icone nom={n.icone} /></div></foreignObject>
              <title>{tm('noeud.info', { nom: n.nom, force: n.force, echanges: n.echanges90j })}</title>
            </g>
            <g pointerEvents="none" className="sc-pa-noeud__libelle">
              <rect x={p.x - largeurDuLibelle(n.nom, l2.texte) / 2} y={p.cote === 'haut' ? p.y - RAYON_DISQUE - 36 : p.y + RAYON_DISQUE + 4} width={largeurDuLibelle(n.nom, l2.texte)} height={32} rx={6} />
              <text x={p.x} y={p.cote === 'haut' ? p.y - RAYON_DISQUE - 21 : p.y + RAYON_DISQUE + 19} textAnchor="middle" className="sc-pa-noeud__nom">{n.nom}</text>
              <text x={p.x} y={p.cote === 'haut' ? p.y - RAYON_DISQUE - 8 : p.y + RAYON_DISQUE + 32} textAnchor="middle" className="sc-pa-noeud__ligne" data-ton={l2.ton}>{l2.texte}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

function Carte({ n, actions, lecture }: { n: NoeudPartenaire | null; actions: ActionsPartenaires; lecture: boolean }) {
  const { tm } = useMotsPartenaires();
  if (!n) return <section className="sc-pa-carte sc-pa-selection"><p className="sc-pa-vide sc-pa-selection__rien">{tm('carte.vide')}</p></section>;
  return (
    <section className="sc-pa-carte sc-pa-selection" aria-label={n.nom}>
      <header className="sc-pa-selection__tete">
        <span className="sc-pa-selection__tuile" aria-hidden><Icone nom={n.icone} taille={18} /></span>
        <div className="sc-pa-selection__texte"><h2 className="sc-pa-selection__nom">{n.nom}</h2><p><span className="sc-pa-etat" data-etat={n.etat}><i aria-hidden />{tm(`carte.etat.${n.etat}` as const)}</span>{n.description}</p></div>
      </header>
      <div className="sc-pa-force"><span>{tm('carte.force')}</span><span className="sc-nombre">{n.force} %</span></div>
      <BarreProgression valeur={n.force / 100} ton="succes" hauteur={5} libelle={`${tm('carte.force')} ${n.force} %`} />
      <dl className="sc-pa-lignes">
        <div><dt>{tm('carte.dernier')}</dt><dd className="sc-pa-lignes__vide">{tm('carte.indisponible')}</dd></div>
        <div><dt>{tm('carte.acces')}</dt><dd className="sc-pa-lignes__vide">{tm('carte.indisponible')}</dd></div>
        <div><dt>{tm('carte.rythme')}</dt><dd>{n.rythmeParMois == null ? '—' : tm('carte.rythme.valeur', { n: n.rythmeParMois })}</dd></div>
      </dl>
      <div className="sc-pa-selection__boutons">
        <Bouton variante="secondaire" taille="petit" icone={<MessageSquare size={13} strokeWidth={2} />} onClick={() => actions.ecrire(n)}>{tm('carte.ecrire')}</Bouton>
        {!lecture && <Bouton variante="secondaire" taille="petit" icone={<KeyRound size={13} strokeWidth={2} />} onClick={() => actions.voirAcces(n)}>{tm('carte.acces.voir')}</Bouton>}
      </div>
    </section>
  );
}

function Suggestion({ m, actions }: { m: ModeleReseau; actions: ActionsPartenaires }) {
  const { tm } = useMotsPartenaires();
  const s = m.suggestion;
  return (
    <section className="sc-pa-suggestion" aria-label={tm('suggestion.astuce.titre')}>
      {s && s.joursAvantFin != null ? (
        <SuggestionAjmani
          titre={tm('suggestion.titre', { nom: s.nomCourt })}
          texte={tm(s.joursAvantFin === 1 ? 'suggestion.texte.1' : 'suggestion.texte.n', { n: s.joursAvantFin })}
          primaire={{ libelle: tm('suggestion.comparer'), onClick: () => actions.comparer(s) }}
          secondaire={{ libelle: tm('suggestion.plusTard'), onClick: actions.plusTard }}
        />
      ) : (
        <div className="sc-pa-astuce"><span className="sc-pa-astuce__titre">{tm('suggestion.astuce.titre')}</span><p>{tm('suggestion.astuce.texte')}</p></div>
      )}
    </section>
  );
}
