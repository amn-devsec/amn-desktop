import { ecartJours, jourDe, jourSemaineIso, partiesParis, tailleLisible, type Instant, type Langue } from '../../commun';
import { espaceUtilise, jaugeDExpiration, liensProteges, ongletsDePartage, pasEncoreOuvert, relanceAProposer, transferts as transfertsRecents, trierLesLiens, type LienPartage, type ReglagesDuLien, type Transfert } from '../../partages';
import { traduire } from './i18n';
import type { CarteLienVue, TransfertVue, VuePartagesProps } from './VuePartages';

/**
 * MX03 — COMPOSER LA VUE du partage de fichiers : réglages du prochain lien, onglets et leurs comptes, cartes de lien (jauge
 * d'expiration, ouvertures, destinataire), transferts, protection de tous les liens, espace utilisé et relance proposée.
 * Logique pure : les règles viennent de `../../partages.ts`. Aucune adresse de lien, aucun jeton, aucun mot de passe : un lien
 * se désigne par son nom de fichier et son destinataire ; « Copier le lien » copie sans rien mettre dans le DOM.
 */

export interface LienAffichable extends LienPartage {
  /** Ce qui précède la taille dans le détail : « Version 3 », « Signé », « Pour signature ». */
  note?: string;
  /** Les membres d'un lien interne (initiales des avatars). */
  equipe?: readonly string[];
}
export interface TransfertAffiche extends Transfert {
  nom: string;
  pourcent: number;
  /** Le correspondant : le destinataire d'un envoi, l'expéditeur d'une réception. */
  avec: string;
  tailleOctets: number;
  secondesRestantes?: number;
}
export interface EntreesPartages {
  langue: Langue;
  maintenant: Instant;
  liens: readonly LienAffichable[];
  recus: number;
  onglet: 'partages' | 'recus' | 'expires';
  transferts: readonly TransfertAffiche[];
  quotaOctets: number;
  reglages: ReglagesDuLien;
  /** Le lien est-il connu du poste ? Faux : le stockage n'est pas branché. */
  suggestionMasquee?: readonly string[];
}

const JOURS: Record<Langue, readonly string[]> = { fr: ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'], en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] };
const JOURS_LONGS: Record<Langue, readonly string[]> = { fr: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'], en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] };
const MOIS: Record<Langue, readonly string[]> = { fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'], en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] };

export function composerPartages(e: EntreesPartages): Pick<VuePartagesProps, 'sousTitre' | 'reglages' | 'onglets' | 'cartes' | 'transferts' | 'protection' | 'suggestion' | 'astuce'> {
  const l = e.langue;
  const t = (cle: string, p?: Record<string, string | number>) => traduire(l, cle as never, p);
  const auj = jourDe(e.maintenant);
  const actifs = e.liens.filter((x) => !x.revoque && (x.expireLe === null || x.expireLe >= auj));
  const bientot = actifs.filter((x) => x.expireLe !== null && jaugeDExpiration(x, auj).orange).length;
  const onglets = ongletsDePartage(e.liens, e.recus, auj);
  const expire = (x: LienPartage) => !!x.revoque || (x.expireLe !== null && x.expireLe < auj);
  const quandCourt = (at: Instant) => {
    const j = jourDe(at);
    const d = ecartJours(j, auj);
    return d === 0 ? (l === 'fr' ? 'aujourd’hui' : 'today') : d === 1 ? (l === 'fr' ? 'hier' : 'yesterday') : d < 6 ? JOURS[l][jourSemaineIso(j) - 1] : l === 'fr' ? `${Number(j.slice(8, 10))} ${MOIS.fr[Number(j.slice(5, 7)) - 1]}` : `${MOIS.en[Number(j.slice(5, 7)) - 1]} ${Number(j.slice(8, 10))}`;
  };
  const derniere = (at: Instant) => {
    const j = jourDe(at);
    const d = ecartJours(j, auj);
    return d === 0 ? (partiesParis(at).minutes < 12 * 60 ? (l === 'fr' ? 'ce matin' : 'this morning') : l === 'fr' ? 'aujourd’hui' : 'today') : d === 1 ? (l === 'fr' ? 'hier' : 'yesterday') : JOURS_LONGS[l][jourSemaineIso(j) - 1];
  };

  const visibles = e.onglet === 'expires' ? e.liens.filter(expire) : e.onglet === 'recus' ? [] : e.liens.filter((x) => !expire(x));
  const cartes: CarteLienVue[] = trierLesLiens(visibles).map((x) => {
    const lien = x as LienAffichable;
    const j = jaugeDExpiration(x, auj);
    const type = (x.fichier.split('.').pop() ?? '').slice(0, 4).toUpperCase();
    const texteExpiration = x.expireLe === null ? t('expire.sans') : j.restants === 0 ? t('expire.aujourdhui') : j.expireDemain ? t('expire.demain') : j.restants === 1 ? t('expire.jour') : t('expire.dans', { n: j.restants ?? 0 });
    return {
      id: x.id,
      type,
      nom: x.fichier,
      detail: [lien.note, tailleLisible(x.tailleOctets, l)].filter(Boolean).join(' · '),
      destinataire: { nom: x.destinataire ?? (l === 'fr' ? 'Équipe' : 'Team'), equipe: x.destinataire === null ? [...(lien.equipe ?? [])] : [], quand: quandCourt(x.creeAt) },
      ouvertures: { n: x.ouvertures, libelle: x.ouvertures === 0 ? t('ouvertures.pas') : t(x.ouvertures <= 1 ? 'ouvertures.1' : 'ouvertures.n'), dernier: x.derniereOuvertureAt ? derniere(x.derniereOuvertureAt) : null, pasEncore: pasEncoreOuvert(x, e.maintenant) || x.ouvertures === 0 },
      expiration: {
        texte: x.expireLe === null ? '' : texteExpiration,
        orange: j.orange,
        jauge: j.rapport === null ? null : { texte: t('jours', { x: j.restants ?? 0, y: j.sur }), rapport: j.rapport },
        sans: x.expireLe === null ? t('expire.interne') : null,
      },
      peutProlonger: j.peutProlonger,
    };
  }).map((c) => (c.expiration.sans ? { ...c, expiration: { ...c.expiration, texte: t('expire.sans'), sans: t('expire.interne') } } : c));

  const lignes: TransfertVue[] = transfertsRecents(e.transferts, e.maintenant).map((x) => {
    const tr = x as TransfertAffiche;
    const taille = tailleLisible(tr.tailleOctets, l);
    if (tr.sens === 'envoi') return { id: tr.id, genre: 'envoi', nom: tr.nom, pourcent: tr.pourcent, detail: [t('transfert.vers', { nom: tr.avec, taille }), tr.secondesRestantes !== undefined ? t('transfert.restantes', { n: tr.secondesRestantes }) : ''].filter(Boolean).join(' · ') };
    if (tr.verification === 'verifie') return { id: tr.id, genre: 'recu', nom: tr.nom, pourcent: 100, detail: t('transfert.recu', { nom: tr.avec }) };
    return { id: tr.id, genre: 'verification', nom: tr.nom, pourcent: tr.pourcent, detail: t('transfert.verification', { nom: tr.avec, taille }) };
  });
  const enCours = lignes.filter((x) => x.genre !== 'recu').length;

  const prot = liensProteges(actifs);
  const espace = espaceUtilise(e.liens, e.quotaOctets);
  const relance = relanceAProposer(e.liens, e.maintenant);
  const relanceVisible = relance && !(e.suggestionMasquee ?? []).includes(relance.id) ? relance : null;
  const reglages = [
    t('reglages.expire', { n: e.reglages.dureeJours }),
    e.reglages.protection === 'code par courriel' ? (l === 'fr' ? 'Code par e-mail' : 'Code by email') : e.reglages.protection === 'mot de passe' ? (l === 'fr' ? 'Mot de passe' : 'Password') : l === 'fr' ? 'Accès par compte' : 'Account access',
    t('reglages.filigrane'),
    e.reglages.telechargement ? t('reglages.telechargement') : t('reglages.lectureSeule'),
  ];

  return {
    sousTitre: `${t('sousTitre', { n: actifs.length })}${bientot ? t(bientot <= 1 ? 'sousTitre.expirent.1' : 'sousTitre.expirent.n', { n: bientot }) : ''}`,
    reglages,
    onglets: [
      { id: 'partages', libelle: t('onglet.partages', { n: onglets.partagesParMoi }), actif: e.onglet === 'partages' },
      { id: 'recus', libelle: t('onglet.recus', { n: onglets.recus }), actif: e.onglet === 'recus' },
      { id: 'expires', libelle: t('onglet.expires', { n: onglets.expires }), actif: e.onglet === 'expires' },
    ],
    cartes,
    transferts: { sous: enCours ? t('transferts.enCours', { n: enCours }) : '', lignes },
    protection: prot.actifs
      ? { pourcent: prot.pourcent, titre: prot.tousProteges ? t('protection.titre.tous') : t('protection.titre.n', { x: prot.proteges, y: prot.actifs }), texte: t('protection.texte', { n: prot.actifs }), espace: { texte: t('espace.sur', { x: tailleLisible(espace.octets, l), y: tailleLisible(e.quotaOctets, l) }), rapport: Math.min(1, espace.octets / Math.max(1, e.quotaOctets)) } }
      : null,
    suggestion: relanceVisible
      ? {
          titre: t('suggestion.relancer', { nom: relanceVisible.destinataire ?? '' }),
          texte: t('suggestion.texte', { n: Math.max(0, ecartJours(jourDe(relanceVisible.creeAt), auj)), m: Math.max(0, ecartJours(auj, relanceVisible.expireLe as string)) }),
          oui: t('suggestion.oui'),
          non: t('suggestion.non'),
        }
      : null,
    astuce: relanceVisible ? null : t('astuce.texte'),
  };
}
