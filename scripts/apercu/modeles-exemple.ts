/**
 * Huit modèles de sites FICTIFS pour les aperçus `DEV-modeles-sites` et `DEV-modeles-sites-code`.
 *
 * Noms, secteurs et étiquettes suivent l'image v4 ; les pages sont écrites ici, simplement, pour l'aperçu (les pages
 * de la maquette n'entrent pas dans le dépôt, et les modèles livrés attendent la relecture de Harun). Rien ici
 * n'entre dans l'application.
 */
import type { ModeleSite } from '../../src/refonte/developpement/modeles';

interface Gabarit {
  id: string;
  nom: string;
  secteur: string;
  etiquettes: string[];
  titre: string;
  accroche: string;
  bouton: string;
  liens: string[];
  fond: string;
  carte: string;
  encre: string;
  doux: string;
  accent: string;
  police: string;
  offres: [string, string][];
}

/** Une page complète, un seul fichier, sans dépendance. */
function page(g: Gabarit): string {
  return [
    '<!doctype html>',
    '<html lang="fr">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>${g.nom}, ${g.secteur.toLowerCase()}</title>`,
    '<style>',
    `  :root{--fond:${g.fond};--carte:${g.carte};--encre:${g.encre};--doux:${g.doux};--accent:${g.accent}}`,
    '  *{box-sizing:border-box;margin:0}',
    `  body{font:16px/1.6 ${g.police};background:var(--fond);color:var(--encre)}`,
    '  header{display:flex;justify-content:space-between;align-items:center;padding:20px 6vw}',
    '  .marque{font-weight:700;letter-spacing:.02em}',
    '  nav a{color:var(--doux);text-decoration:none;font-size:14px;margin-left:24px}',
    '  .bouton{display:inline-block;background:var(--accent);color:var(--fond);padding:12px 22px;border-radius:6px;text-decoration:none;font-weight:600}',
    '  .tete{display:grid;grid-template-columns:1.3fr 1fr;gap:6vw;padding:8vw 6vw 6vw;align-items:center}',
    '  h1{font-size:clamp(32px,5vw,60px);line-height:1.08;letter-spacing:-.02em}',
    '  .tete p{color:var(--doux);margin:18px 0 28px;max-width:46ch}',
    '  .visuel{aspect-ratio:4/3;border-radius:14px;background:linear-gradient(135deg,var(--carte),var(--accent))}',
    '  .offres{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:0 6vw 6vw}',
    '  .offre{background:var(--carte);border-radius:10px;padding:24px}',
    '  .offre h3{font-size:17px;margin-bottom:8px}',
    '  .offre p{color:var(--doux);font-size:14px}',
    '  footer{padding:24px 6vw;color:var(--doux);font-size:13px}',
    '  @media(max-width:800px){.tete,.offres{grid-template-columns:1fr}nav{display:none}}',
    '</style>',
    '</head>',
    '<body>',
    '<header>',
    `  <span class="marque">${g.nom}</span>`,
    `  <nav>${g.liens.map((l) => `<a href="#">${l}</a>`).join('')}</nav>`,
    '</header>',
    '<section class="tete">',
    '  <div>',
    `    <h1>${g.titre}</h1>`,
    `    <p>${g.accroche}</p>`,
    `    <a class="bouton" href="#">${g.bouton}</a>`,
    '  </div>',
    '  <div class="visuel" role="img" aria-label=""></div>',
    '</section>',
    '<section class="offres">',
    ...g.offres.map(([t, p]) => `  <div class="offre"><h3>${t}</h3><p>${p}</p></div>`),
    '</section>',
    `<footer>${g.nom} · modèle d’exemple pour l’aperçu</footer>`,
    '</body>',
    '</html>',
  ].join('\n');
}

const GABARITS: Gabarit[] = [
  { id: 'exemple-optique', nom: 'Optique Lumière', secteur: 'Commerce local', etiquettes: ['Serif', 'Clair', 'Boutique'], titre: 'Des lunettes choisies une par une.', accroche: 'Un magasin de quartier, des montures sélectionnées et un examen de vue sur rendez-vous.', bouton: 'Prendre rendez-vous', liens: ['La boutique', 'Marques', 'Tarifs', 'Contact'], fond: '#f3ede3', carte: '#e7dccb', encre: '#1d1a16', doux: '#6b6257', accent: '#1d1a16', police: 'Georgia,serif', offres: [['Examen de vue', 'Trente minutes, sur rendez-vous.'], ['Ajustage', 'Offert, à vie.'], ['Réparation', 'Le jour même, le plus souvent.']] },
  { id: 'exemple-atelier', nom: 'Atelier Marceau', secteur: 'Artisan', etiquettes: ['Sombre', 'Mobilier', 'Sobre'], titre: 'Le meuble qui épouse votre pièce.', accroche: 'Bibliothèques, cuisines et dressings faits sur mesure, dessinés avec vous.', bouton: 'Demander un devis gratuit', liens: ['Réalisations', 'Méthode', 'Devis'], fond: '#17130f', carte: '#2a2219', encre: '#f2ebe2', doux: '#a99c8c', accent: '#d08a3e', police: 'system-ui,sans-serif', offres: [['Prise de cotes', 'Chez vous, sans engagement.'], ['Dessin', 'Deux propositions, une retouche.'], ['Pose', 'Par l’atelier, en une journée.']] },
  { id: 'exemple-table', nom: 'La Table de Marcel', secteur: 'Restauration', etiquettes: ['Chaud', 'Menu', 'Réservation'], titre: 'La cuisine du marché, comme à la maison.', accroche: 'Une carte courte qui change chaque semaine, et une salle de vingt couverts.', bouton: 'Réserver une table', liens: ['Carte', 'Le lieu', 'Réserver'], fond: '#1c0f0b', carte: '#3a1d12', encre: '#f5e8dc', doux: '#c3a593', accent: '#e0893b', police: 'Georgia,serif', offres: [['Le midi', 'Formule entrée, plat, café.'], ['Le soir', 'La carte de la semaine.'], ['Groupes', 'La salle entière, sur demande.']] },
  { id: 'exemple-prestige', nom: 'Prestige Drive', secteur: 'Automobile', etiquettes: ['Sombre', 'Location', 'Premium'], titre: 'Prenez le volant de la voiture que vous méritez.', accroche: 'Location avec ou sans chauffeur, à la journée ou au week-end.', bouton: 'Voir les disponibilités', liens: ['Flotte', 'Conditions', 'Contact'], fond: '#0c0c0e', carte: '#1d1d22', encre: '#f1f1f3', doux: '#9a9aa3', accent: '#c9a45c', police: 'system-ui,sans-serif', offres: [['À la journée', 'Kilométrage inclus.'], ['Le week-end', 'Du vendredi au lundi.'], ['Avec chauffeur', 'Sur réservation.']] },
  { id: 'exemple-veillance', nom: 'Veillance', secteur: 'Services B2B', etiquettes: ['Sombre', 'Technique', 'Offres'], titre: 'Savoir ce qui est exposé avant les autres.', accroche: 'Audit externe, suivi continu et formation des équipes pour les petites entreprises.', bouton: 'Demander un audit', liens: ['Offres', 'Méthode', 'Contact'], fond: '#0d1214', carte: '#141b1e', encre: '#e8eeee', doux: '#8b9a9c', accent: '#7fd1a6', police: 'system-ui,sans-serif', offres: [['Audit externe', 'Un rapport lisible en une semaine.'], ['Audit et correction', 'Nous corrigeons avec vous.'], ['Veille continue', 'Un point chaque mois.']] },
  { id: 'exemple-portfolio', nom: 'Lina Bardet', secteur: 'Portfolio', etiquettes: ['Clair', 'Minimal', 'Une page'], titre: 'Je construis des interfaces rapides et lisibles.', accroche: 'Développeuse indépendante. Disponible pour des missions à partir de janvier.', bouton: 'Écrivez-moi', liens: ['Projets', 'À propos', 'Contact'], fond: '#f6f6f4', carte: '#e9e9e5', encre: '#141414', doux: '#6a6a66', accent: '#3a5bd9', police: 'system-ui,sans-serif', offres: [['Sites', 'Rapides, accessibles, sobres.'], ['Applications', 'Du prototype à la mise en ligne.'], ['Audit', 'Performance et accessibilité.']] },
  { id: 'exemple-barbier', nom: 'Maison Karim', secteur: 'Beauté', etiquettes: ['Sombre', 'Salon', 'Réservation'], titre: 'Coupe, barbe et soin, sans attendre.', accroche: 'Un salon de quartier, des rendez-vous à l’heure et des produits choisis.', bouton: 'Prendre rendez-vous', liens: ['Prestations', 'Le salon', 'Rendez-vous'], fond: '#121010', carte: '#241f1d', encre: '#f3eeea', doux: '#a39a93', accent: '#c58b5a', police: 'Georgia,serif', offres: [['Coupe', 'Trente minutes.'], ['Barbe', 'Taille et soin.'], ['Formule', 'Coupe et barbe.']] },
  { id: 'exemple-souffle', nom: 'Studio Souffle', secteur: 'Bien-être', etiquettes: ['Clair', 'Doux', 'Planning'], titre: 'Respirer, bouger, ralentir.', accroche: 'Cours de yoga et de respiration en petits groupes, du lundi au samedi.', bouton: 'Voir le planning', liens: ['Cours', 'Planning', 'Tarifs'], fond: '#eef1ec', carte: '#dde5da', encre: '#1e2a22', doux: '#5f6e64', accent: '#4f7a5e', police: 'system-ui,sans-serif', offres: [['Cours découverte', 'Le premier est offert.'], ['Carte de dix', 'Valable six mois.'], ['Abonnement', 'Cours illimités.']] },
];

export const MODELES_EXEMPLE: ModeleSite[] = GABARITS.map((g) => ({ id: g.id, nom: g.nom, secteur: g.secteur, etiquettes: g.etiquettes, html: page(g), origine: 'livre' }));
