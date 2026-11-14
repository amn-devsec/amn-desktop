import { dureeDAppel, jourDe, ecartJours, ms, partiesParis, type Instant, type Langue } from '../../commun';
import { compteursDHistorique, etatDeSalle, historique, personnesConnectees, rappelsDuJour, salleDeLaGardeVisible, standard, type AppelEnFile, type AppelTermine, type Connecte, type SalleMin } from '../../appels';
import { traduire } from './i18n';
import type { LigneAppelVue, SalleVue, VueAppelsProps } from './VueAppels';

/**
 * H13 — COMPOSER LA VUE d'Appels et salles : le plan des salles en direct (état de chaque pièce, Standard et sa file), le
 * sous-titre, l'historique résumé et les « Rappels du jour ». Logique pure : les règles viennent de `../../appels.ts`. Le
 * combiné (l'appel en cours) est assemblé par la page, qui seule connaît l'appel ; sans salle connue, le plan n'est pas montré.
 */

export interface SalleDuPlan {
  def: SalleMin & { genre: SalleVue['genre']; ton: SalleVue['ton'] };
  connectes: readonly Connecte[];
  /** Le début de la session en cours, ou `null`. */
  debutDeSession: Instant | null;
  /** Le titre de la session en cours (« Point facturation »). */
  titreDeSession?: string;
  ecranPartage?: boolean;
  /** Ce qui s'ajoute à « Libre · » : « lien invité, sans compte ». */
  complement?: string;
  evenementsDuJour: readonly { at: Instant; titre: string }[];
}

export interface EntreesAppels {
  langue: Langue;
  maintenant: Instant;
  /** Les salles du plan ; `null` : le poste n'en connaît pas, la carte n'est pas montrée. */
  salles: readonly SalleDuPlan[] | null;
  incidentDeclare: boolean;
  roleDeSupervision: boolean;
  /** L'appel en cours de la personne, et ceux qui attendent au standard (nom lisible par identifiant). */
  appelEnCours: { nom: string; sous: string; debutAt: Instant; enLigne: boolean } | null;
  file: readonly (AppelEnFile & { nom: string; sous?: string })[];
  /** Les membres au téléphone (pour « n personnes connectées »). */
  auTelephone: readonly string[];
  appels: readonly (AppelTermine & { moment: { lieu?: string; at: Instant } })[];
  filtre: 'tout' | 'manques' | 'resume';
  /** Le correspondant de l'appel en cours, pour le sous-titre. */
  enLigneAvec: string | null;
  actions?: { onRejoindre?: (salleId: string) => void; onPreparer?: (salleId: string) => void; onReserver?: (salleId: string) => void; onCreerTaches?: (id: string) => void; onPrendre?: (id: string) => void; onRappeler?: (id: string) => void };
}

const heure = (i: Instant) => {
  const p = partiesParis(i);
  return `${String(Math.floor(p.minutes / 60)).padStart(2, '0')}:${String(p.minutes % 60).padStart(2, '0')}`;
};

export function composerAppels(e: EntreesAppels): Pick<VueAppelsProps, 'sousTitre' | 'salles' | 'historique'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const std = standard(e.file, e.maintenant);
  const auj = jourDe(e.maintenant);

  const plan: SalleVue[] = [];
  let enSalle: string[] = [];
  for (const s of e.salles ?? []) {
    if (s.def.supervision && !salleDeLaGardeVisible(e.incidentDeclare, e.roleDeSupervision)) {
      // Fermée hors incident : la salle de La Garde se voit, grisée, par la supervision seulement (jamais pour les autres).
      if (!e.roleDeSupervision) continue;
    }
    const etat = etatDeSalle(s.def, s.connectes, s.debutDeSession, s.evenementsDuJour, e.maintenant);
    enSalle = [...enSalle, ...s.connectes.map((c) => c.email)];
    const base = { id: s.def.id, nom: s.def.nom, genre: s.def.genre, ton: s.def.ton, personnes: [] as SalleVue['personnes'], places: s.def.capacite, file: [] as SalleVue['file'] };
    if (s.def.supervision) {
      plan.push({ ...base, etat: null, sous: t('salle.fermee'), info: null, action: null, pied: t('salle.garde'), fermee: !(e.incidentDeclare && e.roleDeSupervision) });
      continue;
    }
    if (etat.genre === 'en-cours') {
      const parle = etat.parle;
      plan.push({
        ...base,
        etat: t('salle.enCours'),
        sous: s.titreDeSession ? t('salle.depuis', { titre: s.titreDeSession, min: etat.depuisMin }) : '',
        info: null,
        personnes: s.connectes.map((c) => {
          const nom = c.email.split('@')[0].replace(/^./, (x) => x.toUpperCase());
          return { nom, libelle: c.email === parle ? t('salle.parle', { nom }) : nom, parle: c.email === parle };
        }),
        action: { libelle: t('salle.rejoindre'), primaire: true, onClick: e.actions?.onRejoindre ? () => e.actions?.onRejoindre?.(s.def.id) : undefined },
        pied: [t('salle.places', { n: etat.connectes, max: etat.places }), s.ecranPartage ? t('salle.ecranPartage') : ''].filter(Boolean).join(' · '),
        fermee: false,
      });
      continue;
    }
    const prochain = etat.prochainEvenement;
    plan.push({
      ...base,
      etat: null,
      sous: [t('salle.libre'), s.complement].filter(Boolean).join(' · '),
      info: prochain ? { icone: 'horloge', texte: `${heure(prochain.at)} · ${prochain.titre}` } : { icone: 'calendrier', texte: t('salle.rienDePrevu') },
      action: prochain ? { libelle: t('salle.preparer'), onClick: e.actions?.onPreparer ? () => e.actions?.onPreparer?.(s.def.id) : undefined } : { libelle: t('salle.reserver'), onClick: e.actions?.onReserver ? () => e.actions?.onReserver?.(s.def.id) : undefined },
      pied: null,
      fermee: false,
    });
  }
  if (e.salles) {
    plan.push({
      id: 'standard',
      nom: 'Standard',
      genre: 'standard',
      ton: 'echanger',
      etat: std.enAttente ? t(std.enAttente <= 1 ? 'standard.attend.1' : 'standard.attend.n', { n: std.enAttente }) : null,
      sous: std.aucunAppel && !e.appelEnCours ? t('standard.aucun') : '',
      info: null,
      action: null,
      personnes: [],
      places: 0,
      pied: null,
      fermee: false,
      file: [
        ...(e.appelEnCours ? [{ nom: e.appelEnCours.nom, avatar: e.appelEnCours.nom.slice(0, 1), sous: e.appelEnCours.sous, duree: dureeDAppel(Math.floor((ms(e.maintenant) - ms(e.appelEnCours.debutAt)) / 1000)), ambre: false, enLigne: e.appelEnCours.enLigne }] : []),
        ...e.file.map((f) => ({ nom: f.nom, avatar: f.nom.slice(0, 1), sous: f.sous ?? '', duree: std.attentes.find((a) => a.id === f.id)?.duree ?? '', ambre: true, enLigne: false })),
      ],
    });
  }

  const connectes = personnesConnectees(enSalle, e.auTelephone);
  const sousSalles = [connectes ? t(connectes <= 1 ? 'salles.connectes.1' : 'salles.connectes.n', { n: connectes }) : '', std.enAttente ? t(std.enAttente <= 1 ? 'salles.attente.1' : 'salles.attente.n', { n: std.enAttente }) : ''].filter(Boolean).join(' · ');

  const lignes = historique(e.appels);
  const compteurs = compteursDHistorique(e.appels);
  const parId = new Map(e.appels.map((a) => [a.id, a] as const));
  const visibles = lignes.filter((x) => (e.filtre === 'tout' ? true : e.filtre === 'manques' ? parId.get(x.id)?.sens === 'manque' : !!x.resumeEnUneLigne));
  const moment = (a: (typeof e.appels)[number]) => {
    const j = jourDe(a.moment.at);
    const quand = j === auj ? heure(a.moment.at) : ecartJours(j, auj) === 1 ? t('hier', { heure: heure(a.moment.at) }) : `${Number(j.slice(8, 10))}/${j.slice(5, 7)} ${heure(a.moment.at)}`;
    return a.moment.lieu ? `${a.moment.lieu} · ${quand}` : `${t(`sens.${a.sens}`)} · ${quand}`;
  };
  const lignesVue: LigneAppelVue[] = visibles.map((x) => {
    const a = parId.get(x.id)!;
    const etiquettes: LigneAppelVue['etiquettes'] = [
      ...(x.decisions ? [{ texte: t(x.decisions <= 1 ? 'decisions.1' : 'decisions.n', { n: x.decisions }) }] : []),
      ...(x.taches ? [{ texte: t(x.taches <= 1 ? 'taches.1' : 'taches.n', { n: x.taches }) }] : []),
      ...(x.aRappeler ? [{ texte: t('aRappeler'), rouge: true }] : []),
    ];
    return {
      id: x.id,
      genre: a.moment.lieu ? 'salle' : a.sens,
      titre: a.titre,
      moment: moment(a),
      duree: a.dureeSec >= 3600 || a.sens === 'manque' ? dureeDAppel(a.dureeSec).replace(/^0(\d):/, '$1:') : `${Math.max(1, Math.round(a.dureeSec / 60))} min`,
      resume: x.resumeEnUneLigne ? (a.resume ?? x.resumeEnUneLigne) : null,
      etiquettes,
      action: x.aRappeler
        ? { genre: 'bouton', libelle: t(e.file.some((f) => f.id === x.id) ? 'prendre' : 'rappeler'), onClick: e.actions?.onPrendre ? () => e.actions?.onPrendre?.(x.id) : e.actions?.onRappeler ? () => e.actions?.onRappeler?.(x.id) : undefined }
        : x.tachesCreees
          ? { genre: 'coche', libelle: t('tacheCreee') }
          : x.taches
            ? { genre: 'bouton', libelle: t('creerTaches'), primaire: true, onClick: e.actions?.onCreerTaches ? () => e.actions?.onCreerTaches?.(x.id) : undefined }
            : null,
    };
  });

  const r = rappelsDuJour(e.appels, auj);
  const parts = [e.enLigneAvec ? t('sous.ligne', { nom: e.enLigneAvec }) : '', [enSalle.length ? t('sous.salle') : '', std.enAttente ? t('sous.attend', { nom: e.file[0]?.nom ?? '' }) : ''].filter(Boolean).join(', ')].filter(Boolean);
  const sousTitre = parts.length ? parts.join(' · ').replace(/^./, (x) => x.toUpperCase()) : t('sous.calme');

  return {
    sousTitre,
    salles: e.salles ? { sous: sousSalles, plan } : null,
    historique: {
      filtres: [
        { id: 'tout', libelle: t('filtre.tout'), n: compteurs.tout, actif: e.filtre === 'tout' },
        { id: 'manques', libelle: t('filtre.manques'), n: compteurs.manques, actif: e.filtre === 'manques' },
        { id: 'resume', libelle: t('filtre.resume'), n: compteurs.avecResume, actif: e.filtre === 'resume' },
      ],
      rappels: r.sur ? { texte: r.tousRappeles ? t('rappels.tous') : t('rappels', { x: r.faits, y: r.sur }), ratio: r.faits / r.sur, vert: r.tousRappeles } : null,
      lignes: lignesVue,
    },
  };
}
