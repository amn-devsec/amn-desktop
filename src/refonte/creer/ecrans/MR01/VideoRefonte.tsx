import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../../../../state/SyncContext';
import { useVideoProductions } from '../../../../state/useVideoProductions';
import { usePageCoquille } from '../../../coquille/page';
import { jourParis } from '../../commun';
import { compte, traduire as traduireLogique } from '../../i18n';
import { enregistreIl, serieUneVideoParSemaine, sousTitreDePage, etapeNormalisee } from '../../video';
import { videoDepuisProduction } from '../../reel';
import { lignesDeLaListe } from './modele';
import { useMots } from './textes';
import { VueVideo, type VideoOuverte } from './VueVideo';

interface MontageReel { kind: 'montage'; titre: string; plans?: { nom: string; dureeS: number; garde?: boolean }[]; etat?: string }

/**
 * MR01 · VIDÉO — la liste vient des productions (`videoProductions`) ; le montage (`videoEdits`) est relié par le titre :
 * s'il existe un montage du même titre, ses plans nourrissent la frise (en lecture : pas de moteur de montage dans le
 * dépôt). Sous-titres, voix off, musique, commentaires de relecture et version n'existent pas : « non disponible »
 * (STATUT §1.27 n° 4 et 6). Rien n'est publié d'ici : « Préparer la publication » ouvre la production.
 */
export function VideoRefonte({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm, langue } = useMots();
  const navigate = useNavigate();
  const { videos } = useVideoProductions();
  const montages = useCollection<MontageReel>('videoEdits');
  const aujourdhui = jourParis(maintenant);
  const [actifId, setActifId] = useState<string | null>(null);
  usePageCoquille({ famille: 'creer', sousPage: 'video', miettes: [{ libelle: tm('titre') }] });

  const entrees = useMemo(() => videos.map((v) => videoDepuisProduction(v)), [videos]);
  const actif = entrees.find((v) => v.id === actifId) ?? entrees.find((v) => etapeNormalisee(v.etape) !== 'Publiée') ?? entrees[0] ?? null;
  const ouverte = useMemo<VideoOuverte | null>(() => {
    if (!actif) return null;
    const montage = montages.find((m) => m.kind === 'montage' && m.titre === actif.titre);
    let t = 0;
    const plans = (montage?.plans ?? []).map((p, i) => { const pl = { id: `p${i}`, nom: p.nom, debut: t, fin: t + p.dureeS }; t += p.dureeS; return pl; });
    return { id: actif.id, titre: actif.titre, dureeSec: t, plans, sousTitres: [], voix: [], musique: null, retours: [], tete: 0, planSelectionneId: plans[0]?.id ?? null, publiee: etapeNormalisee(actif.etape) === 'Publiée' };
  }, [actif, montages]);

  const publications = entrees.filter((v) => v.publieeLe).map((v) => v.publieeLe as string);
  const retours = ouverte?.retours ?? [];
  const sous = actif ? sousTitreDePage(actif, retours) : null;
  const sousTitre = !actif || !sous ? '' : [
    sous.etat.type === 'presque-prete' ? traduireLogique(langue, 'video.sousTitre.presque', { titre: actif.titre }) : traduireLogique(langue, 'video.sousTitre.etape', { titre: actif.titre, etape: traduireLogique(langue, `video.etape.${sous.etat.etape}` as 'video.etape.Idée') }),
    sous.retoursATraiter > 0 ? compte(langue, 'video.retours', sous.retoursATraiter) : null,
  ].filter(Boolean).join(' · ');
  const maj = videos.map((v) => Date.parse(v.updatedAt)).filter(Number.isFinite).sort().pop() ?? maintenant;
  const e = enregistreIl(maj, maintenant);
  const enregistre = e.type === 'instant' ? traduireLogique(langue, 'video.enregistre.instant') : traduireLogique(langue, `video.enregistre.${e.type}` as 'video.enregistre.minutes', { n: e.n });
  return (
    <VueVideo
      sousTitre={sousTitre}
      videos={lignesDeLaListe(entrees, langue)}
      actifId={actif?.id ?? null}
      onChoisir={setActifId}
      serie={serieUneVideoParSemaine(publications, aujourdhui)}
      ouverte={ouverte}
      enregistre={enregistre}
      onNouvelle={() => navigate('/productions-video')}
      onPublication={() => navigate('/productions-video')}
    />
  );
}

export default VideoRefonte;
