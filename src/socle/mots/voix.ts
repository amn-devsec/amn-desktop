/**
 * LE GUIDE DE VOIX DU SOCLE (PLAN-10NOV §7 « Facilité et chaleur » ; 06-V4 §4 « Tutoiement »).
 * ═══════════════════════════════════════════════════════════════════════════════════════════
 *
 * Comment l'interface parle. Chaque lot l'applique à ses textes ; `check:voix` le vérifie sur les mots du socle,
 * `check:tutoiement` sur tout le périmètre passé au tutoiement.
 *
 * 1. **Tutoiement dans toute l'interface** : « Demande à Ajmani », « Ta journée », « Rien ne part sans ton accord ».
 *    Table des textes des maquettes : `_data/tutoiement.json` du dossier v4.
 * 2. **Vouvoiement gardé** dans tout texte destiné à un client : courriels, devis, factures, relances, réponses
 *    automatiques, page publique, et tout message reçu d'un client. Un « vous » pluriel qui désigne un groupe
 *    (« Combien êtes-vous ? », l'équipe) reste juste.
 * 3. **Phrases courtes et simples**, aucun reproche, aucune urgence inventée, aucun point d'exclamation, aucun
 *    code d'erreur montré : ce qui s'est passé, puis ce que l'on peut faire (« Rien n'est perdu. Réessaie dans un
 *    instant. »).
 * 4. **Une phrase d'encouragement** quand une tâche est finie : une seule, sans confettis ni son (`encouragement`).
 * 5. **Salutations** : selon l'heure, et neutres par défaut — elles saluent sans rien affirmer
 *    (`src/lib/homeGreetings.ts` : `GREETINGS_NEUTRES`, et `GREETINGS_SEREINES` seulement quand le calme est
 *    certifié). Jamais de robot, de mascotte ni de personnage.
 */

export type LangueVoix = 'fr' | 'en';

/** Une tournure : ce que l'on n'écrit pas (motif), ce que l'on écrit à la place, et un exemple pris dans le socle. */
export interface Tournure {
  cle: string;
  /** Le motif qui la repère dans un texte de l'interface (français). */
  motif: RegExp;
  eviter: string;
  preferer: string;
  exemple: string;
}

/** Les mots qui finissent en « -ez » sans être un verbe conjugué au vouvoiement. */
const PAS_UN_VERBE = new Set(['chez', 'assez', 'nez', 'rez']);

export const TOURNURES: readonly Tournure[] = [
  {
    cle: 'vouvoiement',
    motif: /\b(vous|votre|vos)\b/i,
    eviter: '« vous », « votre », « vos »',
    preferer: '« tu », « ton » / « ta », « tes » (« toi » après une préposition)',
    exemple: 'Rien ne t’attend. Boîte à zéro.',
  },
  {
    cle: 'imperatif-de-politesse',
    // Un verbe au vouvoiement (« Ajoutez », « Réessayez », « Veuillez ») ; « rendez-vous » est un nom.
    motif: /(?<![\p{L}’'-])\p{L}+ez\b(?!-vous)/u,
    eviter: 'l’impératif en « -ez » (« Ajoutez », « Réessayez », « Veuillez… »)',
    preferer: 'l’impératif au tutoiement, sans formule (« Ajoute », « Réessaie »)',
    exemple: 'Ajoute ton premier client ou importe un fichier.',
  },
  {
    cle: 'exclamation',
    motif: /!/,
    eviter: 'le point d’exclamation',
    preferer: 'un point : le fait suffit',
    exemple: 'C’est fait.',
  },
  {
    cle: 'formule-servile',
    motif: /\b(bien sûr|avec plaisir|n’hésitez pas|n'hésitez pas|n’hésite pas|n'hésite pas)\b/i,
    eviter: '« Bien sûr », « Avec plaisir », « N’hésite pas »',
    preferer: 'aller droit au fait',
    exemple: 'Je prépare un devis type pour ton métier.',
  },
  {
    cle: 'code-erreur',
    motif: /\b(erreur|error)\s*(?:[:#]\s*)?\d{3,}\b|\bcode\s+\d{3,}\b/i,
    eviter: 'un code d’erreur montré à la personne',
    preferer: 'ce qui s’est passé, puis ce que l’on peut faire',
    exemple: 'La connexion n’a pas pu aboutir. Réessaie dans un instant.',
  },
];

/** Les « vous » pluriels qui restent justes au tutoiement : ils parlent d'un groupe (l'équipe), pas à la personne. */
export const VOUS_PLURIELS: readonly string[] = ['Combien êtes-vous ?', 'Combien êtes-vous ?'];

/** Les mots du tutoiement : dans un texte destiné à un client, ils sont une faute (le client est vouvoyé). */
const TUTOIEMENT = /\b(?:tu|ton|ta|tes|toi|te)\b|\bt[’'](?=\p{L})/iu;

export interface EcartDeVoix {
  regle: string;
  extrait: string;
}

/**
 * Les écarts d'un texte au guide de voix. `zone` : « interface » (tutoiement, par défaut) ou « client »
 * (vouvoiement : le tutoiement y est la faute). Pur.
 */
export function ecartsDeVoix(texte: string, zone: 'interface' | 'client' = 'interface'): EcartDeVoix[] {
  const ecarts: EcartDeVoix[] = [];
  let t = texte.replace(/[Rr]endez-vous/g, 'rdv');
  for (const p of VOUS_PLURIELS) t = t.split(p).join('');
  for (const r of TOURNURES) {
    if (zone === 'client' && (r.cle === 'vouvoiement' || r.cle === 'imperatif-de-politesse')) continue;
    const m = r.motif.exec(t);
    if (!m) continue;
    if (r.cle === 'imperatif-de-politesse' && PAS_UN_VERBE.has(m[0].toLowerCase())) {
      const autre = [...t.matchAll(new RegExp(r.motif.source, 'gu'))].find((x) => !PAS_UN_VERBE.has(x[0].toLowerCase()));
      if (!autre) continue;
      ecarts.push({ regle: r.cle, extrait: autre[0] });
      continue;
    }
    ecarts.push({ regle: r.cle, extrait: m[0] });
  }
  if (zone === 'client') {
    const m = TUTOIEMENT.exec(t);
    if (m) ecarts.push({ regle: 'tutoiement-chez-un-client', extrait: m[0] });
  }
  return ecarts;
}

/** Une phrase quand une tâche est finie : courte, sans point d'exclamation, sans emphase. */
export const ENCOURAGEMENTS: Readonly<Record<LangueVoix, readonly string[]>> = {
  fr: ['C’est fait.', 'Une de moins.', 'C’est rangé.', 'Encore une de faite.', 'Bien avancé.'],
  en: ['Done.', 'One less.', 'Filed away.', 'Another one done.', 'Good progress.'],
};

/** L'encouragement à dire après la n-ième tâche finie de la journée : une seule phrase, qui ne se répète pas d'affilée. Pur. */
export function encouragement(n: number, langue: LangueVoix = 'fr'): string {
  const liste = ENCOURAGEMENTS[langue];
  const i = Number.isFinite(n) ? Math.abs(Math.trunc(n)) % liste.length : 0;
  return liste[i];
}
