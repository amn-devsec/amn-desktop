/**
 * LOT-11 · LA FEUILLE DE L'ESPACE DÉVELOPPEMENT — en texte, injectée une fois par `PageDev` (`useFeuilleDev`).
 *
 * Pourquoi pas un fichier `.css` importé : les gardes qui assemblent le registre avec esbuild (`check:navigation`)
 * suivent les écrans neufs jusqu'à leurs imports, et esbuild n'y charge pas de CSS. Le texte reste une feuille
 * ordinaire ; `check:developpement` y refuse toute couleur écrite à la main.
 */
export const FEUILLE_DEVELOPPEMENT = `
/*
  LOT-11 · ESPACE DÉVELOPPEMENT — la mise en page des sept écrans.

  Couleurs : jetons du socle seulement. La paire de la famille arrive par la coquille (\`--fam-a\` / \`--fam-b\`,
  posées par \`data-famille-active="developpement"\`) ; les états par \`--socle-etat-*\` ; les teintes de catégorie
  (langages, blocs) par les paires des autres familles (\`--socle-fam-<id>-a\`). Aucune couleur écrite à la main.

  Cotes : celles des fiches (\`docs/refonte/fiches/LOT-11/\`, rubrique 3), relatives à la zone principale
  (contenu de 1108 px à x = 40, en-tête de page jusqu'à y = 83, premières cartes à y = 97).
*/

.dv-page { --dv-ecart: 14px; gap: var(--dv-ecart); padding-bottom: 16px; }
.dv-entete { min-height: 59px; }
.dv-entete .sc-page__actions { align-self: flex-start; margin-top: 20px; }
.dv-entete .sc-page__sous-titre { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.dv-exemple { display: inline-flex; }

.dv-mono { font-family: var(--socle-police-mono); font-variant-numeric: tabular-nums; }
.dv-t2 { color: var(--socle-texte-courant); }
.dv-t3 { color: var(--socle-texte-2); }
.dv-t4 { color: var(--socle-texte-3); }

/* ── La carte néon de l'espace (06 §3 règle 2) ── */
.dv-carte {
  position: relative;
  box-sizing: border-box;
  min-width: 0;
  /* Le contenu reste rogné au bord de la carte, mais une zone de clic de 34 px (§1.39) peut en déborder de 4 px. */
  overflow: clip;
  overflow-clip-margin: 4px;
  border: 1px solid var(--socle-bord-carte);
  border-radius: var(--socle-rayon-carte);
  background:
    radial-gradient(260px 160px at 100% 0%, color-mix(in srgb, var(--fam-a) 8%, transparent), transparent 70%),
    linear-gradient(180deg, var(--socle-carte-haut), var(--socle-carte-bas));
  box-shadow: inset 0 1px 0 var(--socle-reflet-carte), var(--socle-ombre-carte);
  padding: 18px 20px;
  color: var(--socle-texte-courant);
}
.dv-carte[data-coin='gauche'] {
  background:
    radial-gradient(260px 160px at 0% 100%, color-mix(in srgb, var(--fam-b) 8%, transparent), transparent 70%),
    linear-gradient(180deg, var(--socle-carte-haut), var(--socle-carte-bas));
}
.dv-carte__tete { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.dv-carte__titre { margin: 0; font-size: 15px; font-weight: 600; color: var(--socle-texte-1); }
.dv-carte__droite { font-size: 12.5px; color: var(--socle-texte-3); white-space: nowrap; }

/* ── Cibles de 34 px (STATUT §1.39) : le dessin suit la fiche, la zone de clic invisible fait au moins 34 px de haut
   et de large, centrée sur la cible (même procédé que les actions de PageHead au socle). ── */
:is(.dv-page, .dv-ms-fiche) [data-socle='bouton'],
.dv-ens-poste__nom,
.dv-ens-jeton,
.dv-ms-puce { position: relative; }
:is(.dv-page, .dv-ms-fiche) [data-socle='bouton']::after,
.dv-ens-poste__nom::after,
.dv-ens-jeton::after,
.dv-ms-puce::after { content: ''; position: absolute; top: 50%; left: 50%; width: max(100%, 34px); height: max(100%, 34px); transform: translate(-50%, -50%); }

/* ── Points, grands chiffres ── */
.dv-point {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dv-ton, var(--socle-texte-3));
  box-shadow: 0 0 6px var(--dv-ton, transparent);
}
[data-ton='succes'] { --dv-ton: var(--socle-etat-succes); }
[data-ton='attention'] { --dv-ton: var(--socle-etat-attention); }
[data-ton='critique'] { --dv-ton: var(--socle-etat-critique); }
[data-ton='info'] { --dv-ton: var(--socle-etat-info); }
.dv-point[data-ton='neutre'] { box-shadow: none; }

.dv-grand { display: flex; flex-direction: column; gap: 4px; }
.dv-grand__valeur {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.05;
  letter-spacing: -0.02em;
  background: linear-gradient(180deg, var(--socle-blanc), var(--fam-a));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.dv-grand__valeur[data-second] { background-image: linear-gradient(180deg, var(--socle-blanc), var(--fam-b)); }
.dv-grand__libelle { font-size: 13px; color: var(--socle-texte-2); }

/* ── « À regarder aujourd'hui » ── */
.dv-a-regarder { list-style: none; margin: 0; padding: 0; }
.dv-a-regarder__ligne {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 53px;
  border-top: 1px solid var(--socle-bord-ligne);
  font-size: 13.5px;
  color: var(--socle-texte-2);
}
.dv-a-regarder__ligne:first-child { border-top: 0; }
.dv-a-regarder__texte { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dv-a-regarder__texte b { color: var(--socle-texte-1); font-weight: 600; }
.dv-vide-ligne { margin: 0; padding: 12px 0; font-size: 13px; color: var(--socle-texte-2); }

/* ── Suggestion d'Ajmani de colonne (06 §3 règle 12 : bord en dégradé a → b) ── */
.dv-suggestion {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid transparent;
  border-radius: var(--socle-rayon-carte);
  background:
    linear-gradient(180deg, var(--socle-suggestion-haut), var(--socle-suggestion-bas)) padding-box,
    linear-gradient(135deg, var(--fam-a), var(--fam-b)) border-box;
  padding: 16px;
}
.dv-suggestion__texte { display: flex; gap: 10px; margin: 0; font-size: 13.5px; line-height: 1.5; color: var(--socle-texte-courant); }
.dv-suggestion__etincelle { flex: none; color: var(--fam-b); margin-top: 2px; }
.dv-suggestion__bouton {
  min-height: 36px;
  border: 0;
  border-radius: var(--socle-rayon-bouton);
  background: linear-gradient(135deg, var(--fam-a), var(--fam-b));
  color: var(--socle-primaire-encre);
  font-weight: 600;
  font-size: 13.5px;
  text-align: left;
  padding: 0 16px;
  cursor: pointer;
  box-shadow: 0 6px 18px -8px var(--fam-a);
}
.dv-suggestion__bouton:focus-visible { outline: 2px solid var(--socle-texte-1); outline-offset: 2px; }

.dv-a-brancher { margin-top: 8px; }

/* ═══ DEV-ensemble ═══════════════════════════════════════════════════════ */
.dv-ens-chaine { height: 210px; padding: 14px 17px 0; display: flex; flex-direction: column; }
.dv-ens-chaine .dv-carte__tete { margin-bottom: 0; }
.dv-ens-chaine__sous { margin-left: 8px; font-size: 12.5px; font-weight: 400; color: var(--socle-texte-3); }
.dv-ens-postes { position: relative; display: grid; grid-template-columns: repeat(4, 262px); gap: 9px; margin-top: 10px; flex: 1; }
.dv-ens-tapis {
  position: absolute;
  left: 131px;
  right: 131px;
  top: 15px;
  height: 4px;
  border-radius: 2px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--fam-a) 70%, transparent), color-mix(in srgb, var(--fam-b) 70%, transparent));
  box-shadow: 0 0 8px color-mix(in srgb, var(--fam-a) 40%, transparent);
}
.dv-ens-poste { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; min-width: 0; }
.dv-ens-noeud {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--socle-carte-bas);
  border: 2px solid var(--dv-ton, var(--socle-bord-carte));
  box-shadow: 0 0 10px color-mix(in srgb, var(--dv-ton, transparent) 50%, transparent);
  color: var(--dv-ton, var(--socle-texte-2));
}
.dv-ens-poste__nom { background: none; border: 0; padding: 0; cursor: pointer; margin-top: 6px; font-size: 13px; font-weight: 600; color: var(--socle-texte-1); }
.dv-ens-poste__chiffre { margin-top: 2px; font-size: 24px; font-weight: 700; line-height: 1.1; background: linear-gradient(180deg, var(--socle-blanc), var(--fam-a)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.dv-ens-poste__lib { font-size: 12px; color: var(--socle-texte-3); margin-bottom: 2px; }
.dv-ens-jeton {
  box-sizing: border-box;
  width: 246px;
  min-height: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  padding: 0 10px;
  border: 1px solid var(--socle-bord-sous-carte);
  border-radius: var(--socle-rayon-sous-carte);
  background: var(--socle-sous-carte);
  font-size: 12.5px;
  color: var(--socle-texte-courant);
  text-align: left;
  cursor: pointer;
}
.dv-ens-jeton:hover { border-color: var(--socle-bord-survol); }
.dv-ens-jeton__texte { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dv-ens-jeton[data-vide] { border-style: dashed; color: var(--socle-texte-3); cursor: default; }
.dv-ens-milieu { display: grid; grid-template-columns: 547px 547px; gap: 14px; }
.dv-ens-milieu > .dv-carte { min-height: 150px; padding: 14px 18px; }
.dv-ens-milieu .dv-carte__tete { margin-bottom: 8px; }
/* 35 px par ligne (plus le filet) : deux zones de clic de 34 px voisines ne se recouvrent pas (§1.39). */
.dv-ens-milieu .dv-a-regarder__ligne { min-height: 35px; font-size: 13px; }
.dv-ens-seul { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: center; }
.dv-ens-seul__bloc { display: flex; align-items: center; gap: 12px; background: none; border: 0; padding: 0; color: inherit; text-align: left; cursor: pointer; }
.dv-ens-seul__grand { display: block; font-size: 20px; font-weight: 700; color: var(--socle-texte-1); }
.dv-ens-seul__petit { font-size: 12.5px; color: var(--socle-texte-2); }
.dv-ens-modules { height: 266px; padding: 14px 17px; }
.dv-ens-modules .dv-carte__tete { margin-bottom: 10px; }
.dv-ens-groupes { display: grid; grid-template-columns: repeat(4, 261px); gap: 10px; }
.dv-ens-groupe { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.dv-ens-groupe__nom { margin: 0 0 3px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--socle-texte-3); }

@container (max-width: 1100px) {
  .dv-ens-postes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dv-ens-tapis { display: none; }
  .dv-ens-chaine { height: auto; padding-bottom: 0; }
  .dv-ens-milieu, .dv-ens-groupes { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dv-ens-modules { height: auto; }
  .dv-ens-jeton { width: 100%; }
}
@container (max-width: 700px) {
  .dv-ens-postes, .dv-ens-milieu, .dv-ens-groupes { grid-template-columns: 1fr; }
}

.dv-lien { background: none; border: 0; padding: 0; color: var(--fam-a); font: inherit; font-weight: 600; cursor: pointer; }

/* ═══ DEV-projets ════════════════════════════════════════════════════════ */
.dv-pj-bandeau { height: 120px; padding: 0 20px 0 22px; display: flex; align-items: center; justify-content: space-between; }
.dv-pj-chiffres { display: flex; gap: 60px; }
.dv-pj-carte { display: flex; gap: 3px; }
.dv-pj-colonne { display: flex; flex-direction: column; gap: 3px; }
.dv-pj-case { width: 10px; height: 10px; border-radius: 2px; background: color-mix(in srgb, var(--fam-b) 9%, var(--socle-carte-bas)); }
.dv-pj-case[data-niveau='1'] { background: color-mix(in srgb, var(--fam-b) 22%, transparent); }
.dv-pj-case[data-niveau='2'] { background: color-mix(in srgb, var(--fam-b) 42%, transparent); }
.dv-pj-case[data-niveau='3'] { background: color-mix(in srgb, var(--fam-b) 66%, transparent); }
.dv-pj-case[data-niveau='4'] { background: color-mix(in srgb, var(--fam-b) 90%, transparent); box-shadow: 0 0 5px color-mix(in srgb, var(--fam-b) 45%, transparent); }

.dv-pj-grille { display: grid; grid-template-columns: repeat(3, 360px); gap: 15px 14px; }
.dv-pj-depot { height: 144px; padding: 14px 16px 12px; display: flex; flex-direction: column; }
/* La teinte de la carte : celle de sa tuile d'icône (une paire de famille du socle), attention si les tests échouent. */
.dv-pj-depot[data-teinte='0'] { --fam-a: var(--socle-fam-jour-a); }
.dv-pj-depot[data-teinte='1'] { --fam-a: var(--socle-fam-ecrire-a); }
.dv-pj-depot[data-teinte='2'] { --fam-a: var(--socle-fam-argent-a); }
.dv-pj-depot[data-teinte='3'] { --fam-a: var(--socle-fam-creer-a); }
.dv-pj-depot[data-teinte='4'] { --fam-a: var(--socle-fam-ecrire-a); }
.dv-pj-depot[data-teinte='5'] { --fam-a: var(--socle-texte-3); }
.dv-pj-depot[data-teinte='6'] { --fam-a: var(--socle-fam-contacts-a); }
.dv-pj-depot[data-teinte='7'] { --fam-a: var(--socle-fam-echanger-a); }
.dv-pj-depot[data-teinte='echec'] { --fam-a: var(--socle-etat-attention); }
.dv-pj-depot { --fam-b: var(--fam-a); }
.dv-pj-depot__tete { display: flex; align-items: flex-start; gap: 12px; }
.dv-pj-tuile {
  flex: none;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  color: var(--fam-a);
  border: 1px solid color-mix(in srgb, var(--fam-a) 42%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--fam-a) 26%, transparent), color-mix(in srgb, var(--fam-a) 6%, transparent));
}
.dv-pj-depot__noms { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.dv-pj-depot__nom { font-size: 14px; font-weight: 600; color: var(--socle-texte-1); }
.dv-pj-depot__desc { font-size: 13px; color: var(--socle-texte-2); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dv-pj-langages { display: flex; gap: 2px; height: 5px; margin-top: 12px; }
.dv-pj-langage { height: 5px; border-radius: 3px; background: var(--socle-texte-3); }
.dv-pj-langage[data-langue='typescript'] { background: var(--socle-etat-info); }
.dv-pj-langage[data-langue='css'] { background: var(--socle-fam-ecrire-a); }
.dv-pj-langage[data-langue='html'] { background: var(--socle-fam-creer-a); }
.dv-pj-langage[data-langue='python'] { background: var(--socle-etat-attention); }
.dv-pj-liste { margin-top: 8px; font-size: 12px; }
.dv-pj-bas { margin-top: auto; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; }
.dv-pj-bas__textes { min-width: 0; display: flex; flex-direction: column; gap: 3px; font-size: 12px; }
.dv-pj-tronque { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dv-pj-bas-page { display: grid; grid-template-columns: 638px 456px; gap: 14px; }
.dv-pj-bas-page > .dv-carte { height: 204px; }
.dv-pj-versions__liste { list-style: none; margin: 0; padding: 0; }
.dv-pj-version { width: 100%; display: flex; gap: 18px; align-items: flex-start; min-height: 48px; padding: 4px 0; background: none; border: 0; border-top: 1px solid var(--socle-bord-ligne); color: inherit; text-align: left; cursor: pointer; }
.dv-pj-versions__liste li:first-child .dv-pj-version { border-top: 0; }
.dv-pj-version__date { flex: none; width: 52px; font-size: 13px; }
.dv-pj-version__textes { display: flex; flex-direction: column; gap: 2px; font-size: 12px; min-width: 0; }
.dv-pj-version__titre { font-size: 13.5px; font-weight: 500; color: var(--socle-texte-1); }

@container (max-width: 1100px) {
  .dv-pj-grille { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dv-pj-bas-page { grid-template-columns: 1fr; }
  .dv-pj-carte { display: none; }
}
@container (max-width: 700px) {
  .dv-pj-grille { grid-template-columns: 1fr; }
  .dv-pj-chiffres { gap: 24px; }
}

.dv-annonce { margin: 0; min-height: 0; font-size: 13px; color: var(--socle-texte-2); }
.dv-annonce:empty { display: none; }

/* ═══ DEV-deploiements ═══════════════════════════════════════════════════ */
.dv-dp-dernier { height: 171px; padding: 16px 22px; }
.dv-dp-dernier__tete { display: flex; align-items: center; gap: 12px; }
.dv-dp-tuile {
  flex: none; width: 40px; height: 40px; display: grid; place-items: center; border-radius: 11px; color: var(--fam-a);
  border: 1px solid color-mix(in srgb, var(--fam-a) 42%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--fam-a) 26%, transparent), color-mix(in srgb, var(--fam-a) 6%, transparent));
}
.dv-dp-dernier__titres { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; font-size: 12.5px; }
.dv-dp-dernier__titre { font-size: 15px; font-weight: 600; color: var(--socle-texte-1); }
.dv-dp-frise { list-style: none; margin: 14px 0 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); }
.dv-dp-etape { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.dv-dp-lien {
  position: absolute; top: 15px; right: calc(50% + 28px); width: calc(100% - 56px); height: 2px; border-radius: 1px;
  background: var(--socle-piste);
}
.dv-dp-lien[data-fait] { background: linear-gradient(90deg, var(--fam-a), var(--fam-b)); box-shadow: 0 0 6px color-mix(in srgb, var(--fam-a) 45%, transparent); }
.dv-dp-rond {
  width: 32px; height: 32px; border-radius: 50%; display: grid; place-items: center;
  border: 2px solid var(--socle-bord-carte); color: var(--socle-texte-3); background: var(--socle-carte-bas);
}
.dv-dp-etape[data-etat='reussie'] .dv-dp-rond { border: 0; color: var(--socle-primaire-encre); background: linear-gradient(135deg, var(--fam-a), var(--fam-b)); box-shadow: 0 0 10px color-mix(in srgb, var(--fam-b) 45%, transparent); }
.dv-dp-etape[data-etat='echouee'] .dv-dp-rond { border-color: var(--socle-etat-critique); color: var(--socle-etat-critique); box-shadow: 0 0 10px color-mix(in srgb, var(--socle-etat-critique) 40%, transparent); }
.dv-dp-etape[data-etat='en-cours'] .dv-dp-rond { border-color: var(--fam-a); }
.dv-dp-rond__pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--fam-a); }
.dv-dp-etape__nom { font-size: 13.5px; font-weight: 600; color: var(--socle-texte-1); }
.dv-dp-etape__duree { font-size: 12px; }
.dv-dp-corps { display: grid; grid-template-columns: 732px 360px; gap: 16px; }
.dv-dp-gauche, .dv-dp-droite { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.dv-dp-historique { height: 313px; padding: 16px 18px; }
.dv-dp-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.dv-dp-table th { text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--socle-texte-3); padding: 0 6px 8px; }
.dv-dp-table td { height: 54px; padding: 0 6px; border-top: 1px solid var(--socle-bord-ligne); vertical-align: middle; }
.dv-dp-table td:first-child { width: 14px; }
.dv-dp-table tr[data-choisi] td { background: var(--socle-ligne-survol); }
.dv-dp-table__depot { display: block; font-size: 13px; font-weight: 600; color: var(--socle-texte-1); }
.dv-dp-table__sous { display: block; font-size: 12.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px; }
.dv-dp-table__quand { display: block; white-space: nowrap; }
.dv-dp-table__action { text-align: right; }
.dv-dp-planifies { height: 147px; padding: 16px 18px; }
.dv-dp-planifies__liste { list-style: none; margin: 0; padding: 0; }
.dv-dp-planifie { display: flex; align-items: center; gap: 12px; min-height: 46px; border-top: 1px solid var(--socle-bord-ligne); font-size: 13.5px; }
.dv-dp-planifie:first-child { border-top: 0; }
.dv-dp-calendrier { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 8px; color: var(--socle-fam-ecrire-a); border: 1px solid color-mix(in srgb, var(--socle-fam-ecrire-a) 42%, transparent); background: color-mix(in srgb, var(--socle-fam-ecrire-a) 12%, transparent); }
.dv-dp-planifie__date { width: 112px; flex: none; }
.dv-dp-planifie__quoi { flex: 1; min-width: 0; color: var(--socle-texte-1); }
.dv-dp-jours { height: 140px; padding: 16px 18px 10px; }
.dv-dp-jours .dv-carte__tete { margin-bottom: 6px; }
.dv-dp-barres { display: flex; align-items: flex-end; gap: 6px; height: 56px; }
.dv-dp-barre { flex: 1; min-height: 4px; border-radius: 4px 4px 2px 2px; background: linear-gradient(180deg, color-mix(in srgb, var(--fam-a) 70%, transparent), color-mix(in srgb, var(--fam-a) 18%, transparent)); }
.dv-dp-barre[data-echec] { background: var(--socle-etat-critique); box-shadow: 0 0 8px color-mix(in srgb, var(--socle-etat-critique) 50%, transparent); }
.dv-dp-jours__reperes { display: flex; justify-content: space-between; font-size: 11px; margin-top: 2px; }
.dv-dp-enligne { height: 168px; padding: 16px 18px; }
.dv-dp-enligne__liste { list-style: none; margin: 0; padding: 0; }
.dv-dp-enligne__liste li { display: flex; align-items: center; gap: 10px; min-height: 27px; border-top: 1px solid var(--socle-bord-ligne); font-size: 13.5px; }
.dv-dp-enligne__liste li:first-child { border-top: 0; }
.dv-dp-enligne__nom { flex: 1; min-width: 0; color: var(--socle-texte-courant); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.dv-dp-suggestion { height: 137px; }

@container (max-width: 1100px) {
  .dv-dp-corps { grid-template-columns: 1fr; }
  .dv-dp-droite { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dv-dp-historique, .dv-dp-planifies, .dv-dp-dernier { height: auto; }
}
@container (max-width: 700px) {
  .dv-dp-frise { grid-template-columns: 1fr; gap: 8px; }
  .dv-dp-lien { display: none; }
  .dv-dp-droite { grid-template-columns: 1fr; }
}

/* ═══ DEV-serveur ════════════════════════════════════════════════════════ */
.dv-sv-jauges { display: grid; grid-template-columns: repeat(4, 267px); gap: 14px; }
.dv-sv-jauge { height: 117px; padding: 0 16px 0 18px; display: flex; align-items: center; gap: 16px; }
.dv-sv-anneau { position: relative; flex: none; width: 88px; height: 88px; }
.dv-sv-anneau svg { display: block; }
.dv-sv-piste { fill: none; stroke: var(--socle-piste); stroke-width: 8; }
.dv-sv-arc { fill: none; stroke-width: 8; stroke-linecap: round; filter: drop-shadow(0 0 5px var(--dv-jauge-a)); }
.dv-sv-stop-a { stop-color: var(--dv-jauge-a); }
.dv-sv-stop-b { stop-color: var(--dv-jauge-b); }
/* Une teinte fixe par mesure (fiche DEV-serveur §5) : jamais la gravité, que le texte dit. */
.dv-sv-anneau[data-jauge='processeur'] { --dv-jauge-a: var(--socle-fam-ecrire-a); --dv-jauge-b: var(--socle-etat-info); }
.dv-sv-anneau[data-jauge='memoire'] { --dv-jauge-a: var(--socle-etat-info); --dv-jauge-b: var(--socle-etat-succes); }
.dv-sv-anneau[data-jauge='disque'] { --dv-jauge-a: var(--socle-fam-echanger-a); --dv-jauge-b: var(--socle-etat-critique); }
.dv-sv-anneau[data-jauge='reseau'] { --dv-jauge-a: var(--socle-fam-creer-a); --dv-jauge-b: var(--socle-etat-critique); }
.dv-sv-anneau__pct { position: absolute; inset: 0; display: grid; place-items: center; font-size: 17px; font-weight: 600; color: var(--socle-texte-1); }
.dv-sv-jauge__textes { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.dv-sv-jauge__libelle { font-size: 11px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--socle-texte-3); }
.dv-sv-jauge__valeur { font-size: 24px; font-weight: 700; color: var(--socle-texte-1); white-space: nowrap; }
.dv-sv-jauge__sur { font-size: 12.5px; font-weight: 400; color: var(--socle-texte-2); }
.dv-sv-jauge__ligne { font-size: 12.5px; }
.dv-sv-corps { display: grid; grid-template-columns: 742px 350px; gap: 16px; }
.dv-sv-gauche, .dv-sv-droite { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.dv-sv-charge { height: 199px; padding: 16px 20px 12px; }
.dv-sv-legende { display: inline-flex; align-items: center; gap: 6px; }
.dv-sv-legende .dv-point:last-of-type { margin-left: 10px; }
.dv-sv-courbes { display: block; width: 100%; height: 110px; overflow: visible; }
.dv-sv-ligne { fill: none; stroke-width: 2; }
.dv-sv-ligne[data-serie='processeur'] { stroke: var(--socle-etat-info); filter: drop-shadow(0 0 4px var(--socle-etat-info)); }
.dv-sv-ligne[data-serie='memoire'] { stroke: var(--socle-etat-succes); filter: drop-shadow(0 0 4px var(--socle-etat-succes)); }
.dv-sv-aire-mem-haut { stop-color: var(--socle-etat-succes); stop-opacity: 0.32; }
.dv-sv-aire-proc-haut { stop-color: var(--socle-etat-info); stop-opacity: 0.22; }
.dv-sv-aire-bas { stop-color: var(--socle-carte-bas); stop-opacity: 0; }
.dv-sv-reperes { display: flex; justify-content: space-between; margin-top: 8px; font-size: 11px; }
.dv-sv-services { height: 315px; padding: 16px 20px; }
.dv-sv-tuiles { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 225px); gap: 12px 13px; }
.dv-sv-tuile {
  height: 105px; box-sizing: border-box; padding: 12px 14px; display: flex; flex-direction: column; gap: 4px;
  border: 1px solid var(--socle-bord-sous-carte); border-radius: var(--socle-rayon-sous-carte); background: var(--socle-sous-carte);
}
.dv-sv-tuile[data-ton='attention'] { border-color: color-mix(in srgb, var(--socle-etat-attention) 38%, transparent); }
.dv-sv-tuile[data-ton='critique'] { border-color: color-mix(in srgb, var(--socle-etat-critique) 38%, transparent); }
.dv-sv-tuile__nom { display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; color: var(--socle-texte-1); }
.dv-sv-tuile__detail { font-size: 12.5px; }
.dv-sv-tuile__bas { margin-top: auto; display: flex; align-items: center; justify-content: space-between; }
.dv-sv-tuile__dispo { font-size: 16px; font-weight: 700; color: var(--dv-ton, var(--socle-texte-1)); }
.dv-sv-sauvegardes { height: 144px; padding: 16px 20px; }
.dv-sv-lignes { margin: 0; display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
.dv-sv-lignes div { display: flex; justify-content: space-between; gap: 10px; }
.dv-sv-lignes dt { color: var(--socle-texte-courant); }
.dv-sv-lignes dd { margin: 0; font-weight: 600; color: var(--dv-ton, var(--socle-texte-1)); }
.dv-sv-cout { height: 147px; padding: 18px 20px; display: flex; flex-direction: column; gap: 4px; }
.dv-sv-cout__libelle { font-size: 11px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--socle-texte-3); }
.dv-sv-cout__ligne { display: flex; align-items: baseline; gap: 10px; }
.dv-sv-cout__montant { font-size: 44px; font-weight: 700; line-height: 1.05; background: linear-gradient(180deg, var(--socle-blanc), var(--fam-b)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.dv-sv-cout__texte { font-size: 12.5px; line-height: 1.45; }
.dv-sv-suggestion { min-height: 138px; }

@container (max-width: 1100px) {
  .dv-sv-jauges { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dv-sv-corps { grid-template-columns: 1fr; }
  .dv-sv-droite { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dv-sv-services { height: auto; }
}
@container (max-width: 700px) {
  .dv-sv-jauges, .dv-sv-droite { grid-template-columns: 1fr; }
  .dv-sv-tuiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

/* ═══ DEV-editeur ════════════════════════════════════════════════════════ */
.dv-ed-corps { display: grid; grid-template-columns: 752px 340px; gap: 16px; }
.dv-ed-canevas-carte { height: 661px; padding: 16px 18px 18px; }
.dv-ed-canevas {
  position: relative; height: 595px; border-radius: 12px; overflow: hidden;
  border: 1px solid var(--socle-bord-sous-carte);
  background-color: var(--socle-sous-carte);
  background-image: radial-gradient(circle, color-mix(in srgb, var(--socle-texte-1) 7%, transparent) 1px, transparent 1.2px);
  background-size: 20px 20px;
}
.dv-ed-liens { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.dv-ed-lien { fill: none; stroke-width: 2; stroke: var(--dv-ton, var(--socle-texte-3)); filter: drop-shadow(0 0 4px var(--dv-ton, transparent)); }
.dv-ed-lien[data-ton='violet'] { --dv-ton: var(--socle-fam-ecrire-a); }
.dv-ed-bloc {
  position: absolute; width: 204px; min-height: 97px; box-sizing: border-box; padding: 12px 13px;
  display: flex; flex-direction: column; gap: 4px;
  border-radius: 12px; border: 1px solid color-mix(in srgb, var(--dv-bloc) 45%, transparent);
  background: linear-gradient(180deg, var(--socle-carte-haut), var(--socle-carte-bas));
  box-shadow: 0 0 18px -6px color-mix(in srgb, var(--dv-bloc) 55%, transparent);
}
.dv-ed-bloc:focus-visible { outline: 2px solid var(--socle-texte-1); outline-offset: 2px; }
.dv-ed-bloc[data-role='quand'] { --dv-bloc: var(--socle-etat-info); }
.dv-ed-bloc[data-role='si'] { --dv-bloc: var(--socle-etat-attention); }
.dv-ed-bloc[data-role='alors'] { --dv-bloc: var(--socle-etat-succes); }
.dv-ed-bloc[data-role='sinon'] { --dv-bloc: var(--socle-texte-3); }
.dv-ed-bloc[data-role='puis'] { --dv-bloc: var(--socle-fam-ecrire-a); }
.dv-ed-bloc__tete { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.dv-ed-bloc__tuile { width: 24px; height: 24px; display: grid; place-items: center; border-radius: 7px; color: var(--dv-bloc); border: 1px solid color-mix(in srgb, var(--dv-bloc) 42%, transparent); background: color-mix(in srgb, var(--dv-bloc) 14%, transparent); }
.dv-ed-bloc__role { flex: 1; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--dv-bloc); }
.dv-ed-bloc__mode { font-size: 11px; padding: 1px 7px; border-radius: 6px; color: var(--socle-etat-succes); background: color-mix(in srgb, var(--socle-etat-succes) 14%, transparent); border: 1px solid color-mix(in srgb, var(--socle-etat-succes) 38%, transparent); }
.dv-ed-bloc__titre { font-size: 14px; font-weight: 600; color: var(--socle-texte-1); }
.dv-ed-bloc__detail { font-size: 12.5px; color: var(--socle-texte-2); line-height: 1.4; }
.dv-ed-puces { position: absolute; left: 20px; bottom: 16px; display: flex; gap: 8px; }
.dv-ed-droite { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.dv-ed-palette { height: 270px; padding: 18px 20px; }
.dv-ed-palette__liste { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.dv-ed-palette__bloc {
  width: 100%; height: 44px; display: flex; align-items: center; gap: 12px; padding: 0 12px; box-sizing: border-box;
  border: 1px solid var(--socle-bord-sous-carte); border-radius: var(--socle-rayon-sous-carte); background: var(--socle-sous-carte);
  color: var(--socle-texte-courant); font: inherit; font-size: 13.5px; text-align: left; cursor: pointer;
}
.dv-ed-palette__bloc:hover:not(:disabled) { border-color: var(--socle-bord-survol); }
.dv-ed-palette__bloc[data-ton='info'] { --dv-p: var(--socle-etat-info); }
.dv-ed-palette__bloc[data-ton='attention'] { --dv-p: var(--socle-fam-creer-a); }
.dv-ed-palette__bloc[data-ton='succes'] { --dv-p: var(--socle-etat-succes); }
.dv-ed-palette__bloc[data-ton='violet'] { --dv-p: var(--socle-fam-ecrire-a); }
.dv-ed-palette__tuile { width: 26px; height: 26px; display: grid; place-items: center; border-radius: 7px; color: var(--dv-p); border: 1px solid color-mix(in srgb, var(--dv-p) 42%, transparent); background: color-mix(in srgb, var(--dv-p) 12%, transparent); }
.dv-ed-mode { height: 213px; padding: 18px 20px; }
.dv-ed-options { display: flex; flex-direction: column; gap: 10px; }
.dv-ed-option {
  width: 100%; min-height: 53px; display: flex; align-items: center; gap: 12px; padding: 0 14px; box-sizing: border-box;
  border: 1px solid var(--socle-bord-sous-carte); border-radius: var(--socle-rayon-sous-carte); background: var(--socle-sous-carte);
  color: inherit; font: inherit; text-align: left; cursor: pointer;
}
.dv-ed-option[data-choisi] { border-color: var(--fam-b); box-shadow: 0 0 12px -4px var(--fam-b); }
.dv-ed-option__textes { display: flex; flex-direction: column; gap: 2px; font-size: 12px; }
.dv-ed-option__titre { font-size: 13.5px; font-weight: 600; color: var(--socle-texte-1); }
.dv-ed-mode__note { margin: 10px 0 0; font-size: 12.5px; }
.dv-ed-suggestion { min-height: 138px; }

@container (max-width: 1100px) {
  .dv-ed-corps { grid-template-columns: 1fr; }
  .dv-ed-droite { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@container (max-width: 820px) {
  .dv-ed-canevas-carte { height: auto; }
  .dv-ed-canevas { height: auto; display: flex; flex-direction: column; gap: 8px; padding: 12px; }
  .dv-ed-bloc { position: static; width: auto; }
  .dv-ed-liens { display: none; }
  .dv-ed-puces { position: static; }
  .dv-ed-droite { grid-template-columns: 1fr; }
}

/* ═══ DEV-couts ══════════════════════════════════════════════════════════ */
.dv-ct-bandeau { height: 165px; padding: 0 24px; display: grid; grid-template-columns: 279px 520px 1fr; align-items: center; }
.dv-ct-part { display: flex; align-items: center; gap: 18px; }
.dv-ct-donut {
  --dv-part: 0;
  position: relative; flex: none; width: 128px; height: 128px; border-radius: 50%;
  background: conic-gradient(var(--socle-etat-succes) calc(var(--dv-part) * 1%), var(--socle-fam-creer-a) 0);
  filter: drop-shadow(0 0 6px color-mix(in srgb, var(--socle-etat-succes) 35%, transparent));
}
.dv-ct-donut::after { content: ''; position: absolute; inset: 12px; border-radius: 50%; background: var(--socle-carte-haut); }
.dv-ct-donut__centre { position: absolute; inset: 0; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; }
.dv-ct-donut__pct { font-size: 26px; font-weight: 700; color: var(--socle-texte-1); }
.dv-ct-legende { display: flex; flex-direction: column; gap: 10px; font-size: 13.5px; color: var(--socle-texte-courant); }
.dv-ct-legende > span { display: inline-flex; align-items: center; gap: 8px; }
.dv-ct-point-payant { --dv-ton: var(--socle-fam-creer-a); }
.dv-ct-libelle { font-size: 11px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--socle-texte-3); }
.dv-ct-paye { display: flex; flex-direction: column; align-items: flex-start; gap: 6px; }
.dv-ct-paye__ligne { display: flex; align-items: baseline; gap: 10px; font-size: 13.5px; }
.dv-ct-paye__montant { font-size: 52px; font-weight: 700; line-height: 1; background: linear-gradient(180deg, var(--socle-blanc), var(--fam-b)); -webkit-background-clip: text; background-clip: text; color: transparent; }
.dv-ct-phrase { font-size: 12.5px; }
.dv-ct-mois { display: flex; flex-direction: column; gap: 6px; }
.dv-ct-barres { display: flex; align-items: flex-end; gap: 6px; height: 80px; }
.dv-ct-barre { flex: 1; border-radius: 3px 3px 1px 1px; background: linear-gradient(180deg, color-mix(in srgb, var(--fam-a) 80%, transparent), color-mix(in srgb, var(--fam-a) 35%, transparent)); }
.dv-ct-barre[data-courant] { background: var(--socle-etat-succes); box-shadow: 0 0 8px color-mix(in srgb, var(--socle-etat-succes) 45%, transparent); }
.dv-ct-reperes { display: flex; justify-content: space-between; font-size: 11px; }
.dv-ct-corps { display: grid; grid-template-columns: 732px 360px; gap: 16px; }
.dv-ct-table-carte { height: 480px; padding: 16px 18px; }
.dv-ct-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.dv-ct-table th { text-align: left; font-size: 11px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; color: var(--socle-texte-3); padding: 0 8px 8px; }
.dv-ct-table td { height: 48px; padding: 0 8px; border-top: 1px solid var(--socle-bord-ligne); vertical-align: middle; }
.dv-ct-nom { display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; color: var(--socle-texte-1); }
.dv-ct-tuile { flex: none; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; color: var(--dv-t, var(--fam-a)); border: 1px solid color-mix(in srgb, var(--dv-t, var(--fam-a)) 42%, transparent); background: color-mix(in srgb, var(--dv-t, var(--fam-a)) 12%, transparent); }
.dv-ct-tuile[data-mode='local'] { --dv-t: var(--socle-etat-info); }
.dv-ct-tuile[data-mode='payant'] { --dv-t: var(--socle-fam-creer-a); }
.dv-ct-conso { display: block; font-size: 12.5px; margin-bottom: 5px; }
.dv-ct-jauge { display: block; width: 170px; height: 4px; border-radius: 2px; background: var(--socle-piste); overflow: hidden; }
.dv-ct-jauge > span { display: block; height: 100%; border-radius: 2px; background: var(--socle-etat-succes); }
.dv-ct-jauge > span[data-mode='payant'] { background: var(--socle-fam-creer-a); }
.dv-ct-droite { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.dv-ct-plafond { height: 167px; padding: 16px 20px; }
.dv-ct-plafond__corps { display: flex; align-items: center; gap: 18px; }
.dv-ct-anneau { flex: none; width: 96px; height: 96px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 8px solid var(--socle-piste); box-sizing: border-box; font-size: 11px; text-align: center; }
.dv-ct-anneau__montant { font-size: 17px; font-weight: 700; color: var(--socle-texte-1); }
.dv-ct-regles { margin: 0; flex: 1; display: flex; flex-direction: column; gap: 10px; font-size: 13.5px; }
.dv-ct-regles div { display: flex; justify-content: space-between; gap: 8px; }
.dv-ct-regles dt { color: var(--socle-texte-courant); }
.dv-ct-regles dd { margin: 0; font-weight: 600; color: var(--socle-texte-1); text-align: right; }
.dv-ct-suggestion { min-height: 139px; }
.dv-ct-plus-tard { height: 146px; padding: 16px 20px; }
.dv-ct-plus-tard__liste { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.dv-ct-plus-tard__liste li { display: flex; align-items: center; gap: 12px; font-size: 13.5px; }
.dv-ct-plus-tard__nom { flex: 1; color: var(--socle-texte-courant); }

@container (max-width: 1100px) {
  .dv-ct-bandeau { height: auto; padding: 16px 20px; grid-template-columns: 1fr 1fr; gap: 16px; }
  .dv-ct-corps { grid-template-columns: 1fr; }
  .dv-ct-table-carte { height: auto; }
  .dv-ct-droite { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@container (max-width: 700px) {
  .dv-ct-bandeau, .dv-ct-droite { grid-template-columns: 1fr; }
}

/* ═══ DEV-modeles-sites (cotes du prototype) ═════════════════════════════ */
.dv-ms-outils { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.dv-ms-recherche {
  flex: 1 1 240px; max-width: 360px; height: 40px; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 0 12px;
  border: 1px solid var(--socle-bord-bouton); border-radius: var(--socle-rayon-champ); background: var(--socle-champ); color: var(--socle-texte-3);
}
.dv-ms-recherche:focus-within { border-color: var(--fam-a); }
.dv-ms-recherche input { flex: 1; align-self: stretch; min-width: 0; background: none; border: 0; outline: 0; color: var(--socle-texte-1); font: inherit; font-size: 14px; }
.dv-ms-puces { display: flex; flex-wrap: wrap; gap: 8px; }
.dv-ms-puce { border: 1px solid var(--socle-bord-bouton); background: none; border-radius: 99px; padding: 5px 12px; font: inherit; font-size: 12.5px; color: var(--socle-texte-courant); cursor: pointer; }
.dv-ms-puce em { font-style: normal; font-family: var(--socle-police-mono); margin-left: 6px; opacity: 0.65; font-size: 11.5px; }
.dv-ms-puce[aria-pressed='true'] { border-color: transparent; color: var(--socle-primaire-encre); font-weight: 600; background: linear-gradient(135deg, var(--fam-a), var(--fam-b)); }
.dv-ms-compte { margin: 0; font-size: 12.5px; color: var(--socle-texte-3); }
.dv-ms-aucun { margin: 0; padding: 40px; border: 1px dashed var(--socle-pointille); border-radius: 12px; text-align: center; color: var(--socle-texte-2); }
.dv-ms-grille { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 16px; }
.dv-ms-tuile {
  display: flex; flex-direction: column; padding: 0; overflow: hidden; text-align: left; font: inherit; color: inherit; cursor: pointer;
  border: 1px solid var(--socle-bord-carte); border-radius: 12px; background: linear-gradient(180deg, var(--socle-carte-haut), var(--socle-carte-bas));
  transition: border-color 150ms, transform 150ms;
}
.dv-ms-tuile:hover { border-color: var(--socle-bord-survol); transform: translateY(-2px); }
.dv-ms-tuile:focus-visible { outline: 2px solid var(--socle-texte-1); outline-offset: 2px; }
.dv-ms-apercu { position: relative; display: block; aspect-ratio: 16 / 10; overflow: hidden; border-bottom: 1px solid var(--socle-bord-carte); background: var(--socle-decor-2); }
.dv-ms-apercu iframe { position: absolute; left: 0; top: 0; width: 1280px; height: 800px; border: 0; transform-origin: 0 0; pointer-events: none; background: var(--socle-blanc); }
.dv-ms-info { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px 14px; }
.dv-ms-ligne { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; }
.dv-ms-ligne .dv-mono { font-size: 11.5px; }
.dv-ms-nom { font-size: 14.5px; font-weight: 600; color: var(--socle-texte-1); }
.dv-ms-etiquettes { display: flex; flex-wrap: wrap; gap: 6px; }
.dv-ms-etiquette { font-size: 11.5px; color: var(--socle-texte-2); border: 1px solid var(--socle-bord-carte); border-radius: 5px; padding: 1px 7px; }
.dv-ms-etiquette[data-ajoute] { color: var(--socle-fam-creer-a); border-color: color-mix(in srgb, var(--socle-fam-creer-a) 38%, transparent); }
.dv-ms-fiche { position: fixed; inset: 0; z-index: 50; display: flex; flex-direction: column; background: var(--socle-fond-page); }
.dv-ms-barre { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--socle-bord-carte); }
.dv-ms-barre__titres { margin-right: auto; min-width: 0; display: flex; flex-direction: column; font-size: 11.5px; }
.dv-ms-barre__titres b { font-size: 15px; color: var(--socle-texte-1); }
.dv-ms-annonce { padding: 0 16px; }
.dv-ms-scene { flex: 1; min-height: 0; display: flex; justify-content: center; overflow: auto; background: var(--socle-decor-2); }
.dv-ms-scene iframe { width: 100%; height: 100%; border: 0; background: var(--socle-blanc); }
.dv-ms-scene[data-appareil='telephone'] { padding: 16px 0; }
.dv-ms-scene[data-appareil='telephone'] iframe { width: 390px; max-width: 100%; border-radius: 14px; border: 1px solid var(--socle-bord-bouton); }
.dv-ms-codewrap { flex: 1; min-height: 0; display: flex; flex-direction: column; }
.dv-ms-cbar { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; margin: 0; padding: 8px 16px; border-bottom: 1px solid var(--socle-bord-carte); font-size: 12.5px; color: var(--socle-texte-3); }
.dv-ms-code { flex: 1; min-height: 0; overflow: auto; display: grid; grid-template-columns: auto minmax(0, 1fr); background: var(--socle-decor-1); font-family: var(--socle-police-mono); font-size: 12.5px; line-height: 1.65; }
.dv-ms-gouttiere { position: sticky; left: 0; padding: 14px 12px 14px 16px; text-align: right; white-space: pre; user-select: none; color: var(--socle-texte-3); border-right: 1px solid var(--socle-bord-carte); background: var(--socle-decor-1); }
.dv-ms-code pre { margin: 0; padding: 14px 20px; white-space: pre; tab-size: 2; color: var(--socle-texte-courant); }
.dv-ms-code [data-jeton='balise'] { color: var(--socle-etat-info); }
.dv-ms-code [data-jeton='attribut'] { color: var(--socle-fam-creer-a); }
.dv-ms-code [data-jeton='valeur'] { color: var(--socle-etat-succes); }
.dv-ms-code [data-jeton='commentaire'] { color: var(--socle-texte-3); }
.dv-ms-form { display: flex; flex-direction: column; gap: 14px; }
.dv-ms-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: var(--socle-texte-2); }
.dv-ms-form input, .dv-ms-form textarea { background: var(--socle-champ); border: 1px solid var(--socle-bord-champ); border-radius: var(--socle-rayon-champ); color: var(--socle-texte-1); padding: 9px 11px; font: inherit; }
.dv-ms-form textarea { font-family: var(--socle-police-mono); font-size: 12px; min-height: 220px; resize: vertical; }
.dv-ms-deux { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.dv-ms-faute { margin: 0; color: var(--socle-etat-attention); font-size: 13px; }
.dv-ms-actions { display: flex; justify-content: flex-end; gap: 10px; }
@container (max-width: 820px) { .dv-ms-deux { grid-template-columns: 1fr; } }
`;
