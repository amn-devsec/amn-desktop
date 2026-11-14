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
  overflow: hidden;
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
.dv-ens-milieu > .dv-carte { height: 150px; padding: 14px 18px; }
.dv-ens-milieu .dv-carte__tete { margin-bottom: 8px; }
.dv-ens-milieu .dv-a-regarder__ligne { min-height: 31px; font-size: 13px; }
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
`;
