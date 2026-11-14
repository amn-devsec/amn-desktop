/** MR01 · VIDÉO — le modèle de la liste : ligne d'état, ton, pourcentage. Pur, sans React. */
import { jourDeSemaine, JOURS_COURTS, type Jour, type Langue } from '../../commun';
import { avancementVideo, etapeNormalisee, ligneEtat, vuesLibelle, type VideoEntree } from '../../video';
import { traduire } from './textes';
import type { LigneVideo } from './VueVideo';

export function lignesDeLaListe(videos: readonly VideoEntree[], langue: Langue): LigneVideo[] {
  return videos.map((v) => {
    const l = ligneEtat(v);
    const etape = etapeNormalisee(v.etape);
    let etat: string;
    let ton: LigneVideo['ton'] = 'info';
    if (l.type === 'vues') { etat = vuesLibelle(l.vues, langue === 'fr' ? 'vue' : 'view', langue === 'fr' ? 'vues' : 'views'); ton = 'succes'; }
    else if (l.type === 'prochaine') {
      etat = etape === 'Idée' ? traduire(langue, 'etat.idee') : traduire(langue, 'etat.aTourner', { jour: JOURS_COURTS[langue][jourDeSemaine(l.le)].replace('.', '') });
      ton = etape === 'Idée' ? 'gris' : 'attention';
    } else { etat = etape; ton = etape === 'Idée' ? 'gris' : 'info'; }
    return { id: v.id, titre: v.titre, etat, ton, pct: avancementVideo(v) };
  });
}

export const jourSemaineCourt = (j: Jour, langue: Langue): string => JOURS_COURTS[langue][jourDeSemaine(j)];
