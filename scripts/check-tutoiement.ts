/**
 * Contrôle du TUTOIEMENT (06-V4 §4, STATUT §1.14 n° 2) — l'interface tutoie ; le vouvoiement ne reste que dans les
 * textes destinés à un client. Sans navigateur.
 *
 * Dans le PÉRIMÈTRE passé au tutoiement (le socle, la coquille, les neuf écrans de LOT-00, leurs aperçus), chaque
 * chaîne de caractères du code (commentaires exclus) est lue avec le guide de voix (`src/socle/mots/voix.ts`) :
 * aucun « vous », « votre » ou « vos », aucun impératif en « -ez », hors des ZONES CLIENT écrites ci-dessous. Un lot
 * qui passe ses écrans au tutoiement ajoute son dossier au périmètre ; une zone client s'écrit ici, avec sa raison.
 *
 *   npm run check:tutoiement
 */
import fs from 'node:fs';
import path from 'node:path';
import { assert, charger, creerEssais, lire, racine, sansCommentaires } from './lib/essai-socle.ts';

const { dit, fin } = creerEssais('Tutoiement (v4)');

type Ecart = { regle: string; extrait: string };
const V = await charger<{
  ecartsDeVoix: (t: string, zone?: 'interface' | 'client') => Ecart[];
  VOUS_PLURIELS: readonly string[];
}>({ code: "export * from '../src/socle/mots/voix';" });

/** Ce qui est passé au tutoiement. Un lot y ajoute son dossier quand il passe ses textes au tutoiement. */
export const PERIMETRE = ['src/socle', 'src/refonte/coquille', 'src/refonte/compteurs', 'src/refonte/systeme', 'src/refonte/journee', 'src/refonte/ecrire', 'src/refonte/echanger', 'scripts/apercu'];

/**
 * LES ZONES CLIENT : des textes destinés à un client, qui gardent le vouvoiement (courriels, devis, factures,
 * relances, réponses automatiques, page publique, messages reçus). Chacune : le fichier, le début du texte, la raison.
 */
export const ZONES_CLIENT: readonly { fichier: string; debut: string; raison: string }[] = [
  { fichier: 'scripts/apercu/ecrans/MR02.tsx', debut: 'Votre informatique, sereine.', raison: 'le contenu du site public montré dans l’aperçu de MR02 : il s’adresse aux visiteurs du client, donc au vouvoiement' },
  { fichier: 'scripts/apercu/ecrans/G05-ajmani.tsx', debut: 'Bonjour, sauf erreur de notre part', raison: 'le brouillon de relance montré par l’aperçu de G05 : il part chez le client' },
  { fichier: 'src/refonte/ecrire/redaction.ts', debut: 'dans l’attente de votre retour', raison: 'ME02 reconnaît la formule de politesse d’un texte écrit pour un client, pour proposer « Plus direct » : un motif à reconnaître, jamais affiché' },
  { fichier: 'src/refonte/ecrire/redaction.ts', debut: "dans l'attente de votre retour", raison: 'même motif, écrit avec l’apostrophe droite que la personne peut taper' },
  { fichier: 'src/refonte/ecrire/redaction.ts', debut: 'à votre entière disposition', raison: 'ME02 reconnaît la formule de politesse d’un texte écrit pour un client : un motif à reconnaître, jamais affiché' },
  { fichier: 'scripts/apercu/ecrans/ME02.tsx', debut: 'Votre devis pour le parc informatique', raison: 'le brouillon de courriel montré par l’aperçu de ME02 : il part chez le client' },
  { fichier: 'scripts/apercu/ecrans/ME02.tsx', debut: 'Bonjour Karim,', raison: 'le brouillon de courriel montré par l’aperçu de ME02 : il part chez le client' },
  { fichier: 'scripts/apercu/ecrans/ME02.tsx', debut: 'Je me permets de revenir vers vous', raison: 'le brouillon de courriel montré par l’aperçu de ME02 : il part chez le client' },
  { fichier: 'scripts/apercu/ecrans/ME02.tsx', debut: 'Je reviens vers vous', raison: 'le brouillon de courriel montré par l’aperçu de ME02 : il part chez le client' },
  { fichier: 'scripts/apercu/ecrans/ME02.tsx', debut: ' au sujet du devis D-2026-117', raison: 'le brouillon de courriel montré par l’aperçu de ME02 : il part chez le client' },
  { fichier: 'scripts/apercu/ecrans/ME02.tsx', debut: ' si le devis vous convient.', raison: 'le brouillon de courriel montré par l’aperçu de ME02 : il part chez le client' },
  { fichier: 'scripts/apercu/ecrans/ME04.tsx', debut: '18 messages, le dernier en avril', raison: 'l’extrait d’un message REÇU d’un client, montré par l’aperçu de ME04 : il garde le vouvoiement de son auteur' },
  { fichier: 'scripts/apercu/ecrans/H12.tsx', debut: 'Bonjour Menna, le devis', raison: 'la relance préparée montrée par l’aperçu de H12 : elle part chez le client' },
  { fichier: 'scripts/apercu/ecrans/G07.tsx', debut: 'Il a encore redémarré ce matin', raison: 'un message REÇU d’un client, montré par l’aperçu de G07 : il garde le vouvoiement de son auteur' },
  { fichier: 'scripts/apercu/ecrans/G07.tsx', debut: 'Pouvez-vous nous renvoyer', raison: 'un message REÇU d’un client, montré par l’aperçu de G07 : il garde le vouvoiement de son auteur' },
  { fichier: 'scripts/apercu/ecrans/G07.tsx', debut: 'Je vous envoie la photo', raison: 'un message REÇU d’un client, montré par l’aperçu de G07 : il garde le vouvoiement de son auteur' },
  { fichier: 'scripts/apercu/ecrans/G07.tsx', debut: 'Merci de votre retour.', raison: 'un message REÇU d’un client, montré par l’aperçu de G07 : il garde le vouvoiement de son auteur' },
  { fichier: 'scripts/apercu/ecrans/G07.tsx', debut: 'Bonjour Madame Roux, je passe jeudi', raison: 'le brouillon d’Ajmani montré par l’aperçu de G07 : il part chez le client' },
  { fichier: 'scripts/apercu/ecrans/MX01.tsx', debut: 'Merci, c’était très clair', raison: 'un courriel REÇU d’un client, montré par l’aperçu de MX01 : il garde le vouvoiement de son auteur' },
  { fichier: 'scripts/apercu/ecrans/MX01.tsx', debut: 'Je vous envoie les 12 photos', raison: 'un courriel REÇU d’un client, montré par l’aperçu de MX01 : il garde le vouvoiement de son auteur' },
  { fichier: 'scripts/apercu/ecrans/MX01.tsx', debut: 'Votre versement de 2 400', raison: 'un courriel REÇU d’un service de paiement, montré par l’aperçu de MX01 : il garde le vouvoiement de son auteur' },
  { fichier: 'scripts/apercu/ecrans/MX06.tsx', debut: 'Bonjour {prénom},', raison: 'le modèle de réponse automatique d’une règle, montré par l’aperçu de MX06 : il part chez le client' },
];

/**
 * LES LEXIQUES DE SAISIE : des mots que la personne peut TAPER (Ajmani les reconnaît), pas des textes affichés. Leur
 * forme au vouvoiement reste reconnue, à côté de la forme tutoyée. Chacun : le fichier et les mots.
 */
export const LEXIQUES_SAISIE: readonly { fichier: string; mots: readonly string[]; tutoyes: readonly string[] }[] = [
  { fichier: 'src/refonte/systeme/ajmani/intentions.ts', mots: ['relancez', 'trouvez', 'cherchez', 'ouvrez', 'allez', 'creez'], tutoyes: ['relance', 'trouve', 'cherche', 'ouvre', 'va', 'cree'] },
  { fichier: 'src/refonte/systeme/ajmani/niveaux.ts', mots: ['validez', 'confirmez', 'continuez'], tutoyes: ['valide', 'confirme', 'continue'] },
];

/**
 * LES CITATIONS : le guide de voix cite ce qu'il interdit (« vous », « Ajoutez »…). Ses textes affichés (les
 * encouragements, les exemples) sont tenus par `check:voix`, qui les passe au guide lui-même.
 */
export const CITATIONS: readonly { fichier: string; raison: string }[] = [
  { fichier: 'src/socle/mots/voix.ts', raison: 'le guide de voix cite les tournures qu’il interdit ; check:voix tient ses textes affichés' },
];

/** Les chaînes du code, commentaires exclus, avec leur fichier. */
function chaines(fichier: string): string[] {
  const src = sansCommentaires(lire(fichier));
  const sortie: string[] = [];
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`/g)) sortie.push(m[1] ?? m[2] ?? m[3] ?? '');
  return sortie.map((s) => s.replace(/\\u00a0/gi, ' ').replace(/\\u202f/gi, ' '));
}

function fichiers(dossier: string): string[] {
  const abs = path.join(racine, dossier);
  if (!fs.existsSync(abs)) return [];
  const sortie: string[] = [];
  for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
    const rel = `${dossier}/${e.name}`;
    if (e.isDirectory()) sortie.push(...fichiers(rel));
    else if (/\.(ts|tsx|mts)$/.test(e.name)) sortie.push(rel);
  }
  return sortie.sort();
}

const TOUS = PERIMETRE.flatMap(fichiers).filter((f) => !CITATIONS.some((c) => c.fichier === f));
const lexique = new Map(LEXIQUES_SAISIE.map((l) => [l.fichier, new Set(l.mots)]));
const estClient = (f: string, s: string) => ZONES_CLIENT.some((z) => z.fichier === f && s.startsWith(z.debut));
/** Les règles du tutoiement (le reste du guide de voix est tenu par `check:voix` et les gardes des écrans). */
const VOUVOIEMENT = new Set(['vouvoiement', 'imperatif-de-politesse']);

await dit(`aucun « vous », « votre », « vos » ni impératif en « -ez » dans le périmètre (${PERIMETRE.join(', ')}), hors zones client`, () => {
  assert.ok(TOUS.length > 150, `${TOUS.length} fichiers lus seulement`);
  const fautes: string[] = [];
  for (const f of TOUS) {
    for (const s of chaines(f)) {
      if (estClient(f, s)) continue;
      if (lexique.get(f)?.has(s)) continue;
      for (const e of V.ecartsDeVoix(s)) if (VOUVOIEMENT.has(e.regle)) fautes.push(`${f} › « ${s.slice(0, 90)} » (${e.extrait})`);
    }
  }
  assert.deepEqual(fautes, [], `${fautes.length} texte(s) au vouvoiement :\n${fautes.join('\n')}`);
});

await dit('les citations sont nommées, existent et ne sont que le guide de voix', () => {
  assert.deepEqual(CITATIONS.map((c) => c.fichier), ['src/socle/mots/voix.ts']);
  for (const c of CITATIONS) assert.ok(fs.existsSync(path.join(racine, c.fichier)), c.fichier);
});

await dit('les zones client existent et gardent le vouvoiement : aucun tutoiement dans un texte destiné à un client', () => {
  for (const z of ZONES_CLIENT) {
    assert.ok(z.raison.trim().length > 10, `${z.fichier} : la raison de la zone client`);
    const textes = chaines(z.fichier).filter((s) => s.startsWith(z.debut));
    assert.ok(textes.length > 0, `${z.fichier} : « ${z.debut}… » introuvable (zone client morte : retirez-la)`);
    for (const t of textes) {
      assert.deepEqual(V.ecartsDeVoix(t, 'client').filter((e) => e.regle === 'tutoiement-chez-un-client'), [], `${z.fichier} : un client est tutoyé`);
      assert.match(t, /\b(vous|votre|vos)\b/i, `${z.fichier} : le texte client vouvoie`);
    }
  }
});

await dit('les lexiques de saisie : seuls des mots isolés, présents dans leur fichier, chacun avec sa forme tutoyée', () => {
  for (const l of LEXIQUES_SAISIE) {
    const presentes = new Set(chaines(l.fichier));
    assert.equal(l.mots.length, l.tutoyes.length, l.fichier);
    l.mots.forEach((mot, i) => {
      assert.match(mot, /^[a-z]+ez$/, `${l.fichier} : « ${mot} » n'est pas un mot isolé`);
      assert.ok(presentes.has(mot), `${l.fichier} : « ${mot} » n'y est plus (retirez-le du lexique)`);
      assert.ok(presentes.has(l.tutoyes[i]), `${l.fichier} : la forme tutoyée « ${l.tutoyes[i]} » manque à côté de « ${mot} »`);
    });
  }
});

await dit('le « vous » pluriel permis ne sert qu’à l’équipe : « Combien êtes-vous ? » (H47), et rien d’autre', () => {
  assert.deepEqual([...new Set(V.VOUS_PLURIELS.map((p) => p.replace(/\u00a0/g, ' ')))], ['Combien êtes-vous ?']);
  assert.deepEqual(V.ecartsDeVoix('Combien êtes-vous ?'), []);
  assert.ok(V.ecartsDeVoix('Combien voulez-vous ?').length > 0, 'un autre « vous » reste une faute');
});

fin();
