import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCollection } from '../../../../state/SyncContext';
import { useOrders } from '../../../../state/useOrders';
import { useVideoProductions } from '../../../../state/useVideoProductions';
import { usePageCoquille } from '../../../coquille/page';
import { compte } from '../../i18n';
import { jourParis } from '../../commun';
import { compter } from '../../commandes';
import { construireLigne, elementsDeProduction, livraisonsALHeure, palierDesCommandes, SEIZE_MODULES, MODULE_MASQUE } from '../../ligneDeProduction';
import { chantiersASurveiller, resumeDesChantiers } from '../../chantiers';
import { articlesASurveiller, sousSeuilSansCommande } from '../../stock';
import { articleDepuisStock, chantierDepuisMontage, commandeDepuisReel, videoDepuisProduction, type MontageReel, type StockReel } from '../../reel';
import { useMots } from './textes';
import { VueHubCreer, type TuileHub } from './VueHubCreer';

/**
 * F50 · CRÉER ET PRODUIRE, VUE D'ENSEMBLE — branchée sur les données réelles (`assemblies`, `orders`, `videoProductions`,
 * `stockItems`). Substituée à `/ensemble/creer` (`substitutions/declarations/creer.tsx`). Ce que les modules ne portent pas
 * encore (contrôles ouverts, budgets, échéances) n'est pas simulé : les postes concernés restent vides.
 */
export function HubCreer({ maintenant = Date.now() }: { maintenant?: number }) {
  const { tm, langue } = useMots();
  const aujourdhui = jourParis(maintenant);
  const montages = useCollection<Omit<MontageReel, 'id'>>('assemblies');
  const stock = useCollection<Omit<StockReel, 'id'>>('stockItems');
  const { orders } = useOrders();
  const { videos } = useVideoProductions();
  const navigate = useNavigate();
  usePageCoquille({ famille: 'creer', sousPage: 'ensemble', miettes: [{ libelle: tm('titre') }, { libelle: tm('ligne.titre') }], ajmani: tm('ajmani') });

  const donnees = useMemo(() => {
    const chantiers = montages.map((m) => chantierDepuisMontage(m as MontageReel, aujourdhui));
    const commandes = orders.map((o) => commandeDepuisReel(o));
    const videosE = videos.map((v) => videoDepuisProduction(v));
    const elements = elementsDeProduction({ chantiers, controlesOuverts: [], commandes, videos: videosE, retoursParVideo: {}, aujourdhui });
    const articles = stock.map((s) => articleDepuisStock(s as StockReel));
    return { chantiers, commandes, elements, ligne: construireLigne(elements), articles };
  }, [montages, orders, videos, stock, aujourdhui]);

  const k = compter(donnees.commandes, aujourdhui, maintenant);
  const surveiller = articlesASurveiller(donnees.articles).length;
  const rc = resumeDesChantiers(donnees.chantiers, aujourdhui);
  const aSurv = chantiersASurveiller(donnees.chantiers, aujourdhui).length;
  const enCoursVideo = donnees.elements.filter((e) => e.couloir === 'contenus' && e.poste !== 'livre').length;

  const tuiles: TuileHub[] = SEIZE_MODULES.filter((m) => m.id !== MODULE_MASQUE).map((m) => ({
    id: m.id,
    groupe: m.groupe,
    actif: true,
    mesure:
      m.id === 'chantiers' ? tm(aSurv > 0 ? 'mesure.chantiers' : 'mesure.chantiers.aucun', { actifs: rc.enCours, surveiller: aSurv })
      : m.id === 'commandes' ? tm('mesure.commandes', { n: k.enCours, aExpedier: k.aExpedier })
      : m.id === 'stock' ? compte(langue, 'stock.surveiller', surveiller)
      : m.id === 'video' ? tm('mesure.video', { n: enCoursVideo })
      : m.id === 'modeles-sites' ? tm('mesure.lien')
      : undefined,
    compte: m.id === 'stock' ? surveiller : m.id === 'commandes' ? k.aExpedier : undefined,
  }));

  const sousTitre = `${compte(langue, 'ligne.travaux', donnees.ligne.toutEnCours, { moment: langue === 'fr' ? 'maintenant' : 'right now' })} · ${compte(langue, 'ligne.livrees', k.livreesCeMois)}`;
  return (
    <VueHubCreer
      ligne={donnees.ligne}
      elements={donnees.elements}
      sousTitre={sousTitre}
      tuiles={tuiles}
      palier={palierDesCommandes(k.livreesCeMois, 0)}
      aLHeure={livraisonsALHeure([], aujourdhui)}
      articlesSansCommande={sousSeuilSansCommande(donnees.articles, []).length}
      onNouveauChantier={() => navigate('/montage')}
    />
  );
}

export default HubCreer;
