import { declarerFamille, vue } from '../declarer';

/**
 * CRÉER ET PRODUIRE — fabriquer, livrer, stocker, puis vidéo, visuels, publication, événements.
 *
 * Décision validée : les Événements vivent ici. Regroupés : Vidéo (Montage,
 * Production) ; Visuels et marque ; Ma page publique (Mini-page, Portfolio).
 *
 * RAPATRIÉS LE 14 NOV. (STATUT §1.27 n° 1, liste de la note de LOT-06) : les modules dont l'écran est un
 * écran de LOT-06 reviennent ici, avec les actions Fabriquer, Livrer et Stocker (les trois premiers groupes
 * de F50). Chantiers (Montage, Interventions = « Bons d'intervention ») et Qualité et contrôles ; Commandes
 * et Tournées (et itinéraires) ; Stock (et prévision), Matériel (et flotte) et Boutique en ligne. Ils
 * venaient d'Outils (terrain, stock) et d'Argent (vendre). Le registre refusant les vues en double, ce qui
 * est l'écran d'un autre lot reste dans sa famille et F50 le montre en tuile de lien : Salles (Appels et
 * salles, Échanger), Médias (Documents, Écrire). Les écrans qui n'existent pas encore (Catalogue produits,
 * Réservations sur `/reservations`, Photos de chantier sur `/photos-chantier`) s'ajoutent ici avec leur écran
 * (`nouveau`) quand LOT-06 les construit ; « Fabrication » reste masqué tant qu'il n'existe pas.
 */

export default declarerFamille({
  id: 'creer',
  ordre: 6,
  teinte: 'creer',
  nom: { fr: 'Créer et produire', en: 'Create and produce' },
  actions: {
    fabriquer: { fr: 'Fabriquer', en: 'Make' },
    livrer: { fr: 'Livrer', en: 'Deliver' },
    stocker: { fr: 'Stocker', en: 'Stock' },
    video: { fr: 'Vidéo et son', en: 'Video and audio' },
    visuels: { fr: 'Images et visuels', en: 'Images and visuals' },
    publier: { fr: 'Publier', en: 'Publish' },
    evenements: { fr: 'Événements', en: 'Events' },
  },
  modules: [
    {
      nom: { fr: 'Chantiers', en: 'Job sites' },
      action: 'fabriquer',
      niveau: 'courant',
      vues: [
        vue('assembly', '/montage', ['suivre un chantier', 'cocher une étape de montage'], ['montage', 'chantier', 'étape', 'pose'], {
          en: { verbes: ['follow a job site', 'tick off an assembly step'], motsCles: ['assembly', 'job site', 'step', 'installation'] },
        }),
        vue('interventions', '/interventions', ['faire un compte rendu d’intervention', 'photographier avant et après'], ['intervention', 'déplacement', 'compte rendu', 'photo'], {
          en: { verbes: ['write an intervention report', 'photograph before and after'], motsCles: ['intervention', 'call-out', 'report', 'photo', 'field service'] },
        }),
      ],
    },
    {
      action: 'fabriquer',
      niveau: 'courant',
      vues: [
        vue('checklists', '/controles', ['faire un contrôle qualité', 'cocher une check-list'], ['contrôle', 'qualité', 'check-list', 'liste'], {
          en: { verbes: ['do a quality check', 'tick off a checklist'], motsCles: ['inspection', 'quality', 'checklist', 'control'] },
        }),
      ],
    },
    {
      action: 'livrer',
      niveau: 'courant',
      vues: [
        vue('orders', '/commandes', ['voir les commandes', 'traiter une commande', 'expédier une commande'], ['commande', 'vente', 'site', 'expédition'], {
          en: { verbes: ['see orders', 'process an order'], motsCles: ['order', 'sale', 'website', 'shipping'] },
        }),
      ],
    },
    {
      nom: { fr: 'Tournées et itinéraires', en: 'Rounds and routes' },
      action: 'livrer',
      niveau: 'courant',
      vues: [
        vue('rounds', '/tournees', ['préparer une tournée', 'livrer'], ['tournée', 'livraison', 'arrêt'], {
          en: { verbes: ['prepare a delivery round', 'deliver'], motsCles: ['round', 'delivery', 'stop', 'route'] },
        }),
        vue('itineraries', '/itineraires', ['optimiser un itinéraire', 'préparer les arrêts de demain'], ['itinéraire', 'trajet', 'route', 'carte'], {
          en: { verbes: ['optimize a route', 'prepare tomorrow’s stops'], motsCles: ['route', 'itinerary', 'trip', 'map', 'directions'] },
        }),
      ],
    },
    {
      nom: { fr: 'Stock et prévision', en: 'Stock and forecast' },
      action: 'stocker',
      niveau: 'courant',
      vues: [
        vue('stock', '/stock', ['vérifier le stock', 'ajouter du stock'], ['stock', 'inventaire', 'rupture', 'article', 'entrepôt'], {
          en: { verbes: ['check stock', 'add stock'], motsCles: ['stock', 'inventory', 'out of stock', 'item', 'warehouse'] },
        }),
        vue('stockForecast', '/prevision-stock', ['savoir quand commander', 'prévoir une rupture'], ['prévision', 'stock', 'réassort', 'commande'], {
          en: { verbes: ['know when to reorder', 'predict a stock-out'], motsCles: ['forecast', 'stock', 'restock', 'reorder'] },
        }),
      ],
    },
    {
      nom: { fr: 'Matériel et flotte', en: 'Equipment and fleet' },
      action: 'stocker',
      niveau: 'courant',
      vues: [
        vue('equipment', '/materiel', ['réserver du matériel', 'voir qui a le matériel'], ['matériel', 'outil', 'réservation', 'prêt'], {
          en: { verbes: ['book equipment', 'see who has the equipment'], motsCles: ['equipment', 'tools', 'booking', 'loan'] },
        }),
        vue('fleet', '/flotte', ['suivre un véhicule', 'noter le kilométrage'], ['flotte', 'véhicule', 'voiture', 'camion', 'kilométrage'], {
          en: { verbes: ['track a vehicle', 'log the mileage'], motsCles: ['fleet', 'vehicle', 'car', 'van', 'mileage'] },
        }),
      ],
    },
    {
      action: 'stocker',
      niveau: 'courant',
      vues: [
        vue('shop', '/boutique', ['vendre en ligne', 'voir les paniers abandonnés'], ['boutique', 'e-commerce', 'panier', 'produit'], {
          en: { verbes: ['sell online', 'see abandoned carts'], motsCles: ['shop', 'store', 'e-commerce', 'cart', 'product'] },
        }),
      ],
    },
    {
      nom: { fr: 'Vidéo', en: 'Video' },
      action: 'video',
      niveau: 'courant',
      vues: [
        vue('video', '/montage-video', ['monter une vidéo', 'couper une vidéo'], ['vidéo', 'montage', 'clip', 'reel', 'film', 'sous-titres'], {
          en: { verbes: ['edit a video', 'cut a video'], motsCles: ['video', 'editing', 'clip', 'reel', 'subtitles'] },
        }),
        vue('videoProductions', '/productions-video', ['suivre une vidéo', 'planifier un tournage'], ['vidéo', 'production', 'tournage'], {
          en: { verbes: ['track a video', 'plan a shoot'], motsCles: ['video', 'production', 'shoot', 'filming'] },
        }),
      ],
    },
    {
      action: 'video',
      niveau: 'avance',
      vues: [
        vue('podcast', '/podcast', ['publier un épisode', 'découper un épisode'], ['podcast', 'audio', 'épisode'], {
          en: { verbes: ['publish an episode', 'cut an episode'], motsCles: ['podcast', 'audio', 'episode'] },
        }),
      ],
    },
    {
      nom: { fr: 'Visuels et marque', en: 'Visuals and brand' },
      action: 'visuels',
      niveau: 'courant',
      vues: [
        vue('adVisuals', '/visuels-pub', ['créer un visuel', 'décliner une publicité'], ['visuel', 'pub', 'publicité', 'bannière', 'format', 'affiche'], {
          en: { verbes: ['create a visual', 'adapt an ad'], motsCles: ['visual', 'ad', 'advertising', 'banner', 'format', 'poster'] },
        }),
        vue('brand', '/identite-visuelle', ['décliner mon logo', 'préparer ma charte'], ['logo', 'charte', 'identité', 'marque'], {
          en: { verbes: ['resize my logo', 'prepare my brand guidelines'], motsCles: ['logo', 'brand guidelines', 'identity', 'brand'] },
        }),
      ],
    },
    {
      action: 'visuels',
      niveau: 'avance',
      vues: [
        vue('productShots', '/images-produits', ['photographier un produit', 'changer le décor d’une photo'], ['photo', 'produit', 'packshot', 'détourage'], {
          en: { verbes: ['photograph a product', 'change a photo’s background'], motsCles: ['product photo', 'packshot', 'background', 'cutout'] },
        }),
      ],
    },
    {
      action: 'publier',
      niveau: 'courant',
      vues: [
        vue('postPlanner', '/planificateur', ['programmer un post', 'planifier les réseaux sociaux'], ['post', 'réseaux sociaux', 'instagram', 'linkedin', 'publication', 'calendrier éditorial', 'facebook', 'tiktok'], {
          en: { verbes: ['schedule a post', 'plan social media'], motsCles: ['post', 'social media', 'instagram', 'linkedin', 'publication', 'content calendar'] },
        }),
      ],
    },
    {
      nom: { fr: 'Ma page publique', en: 'My public page' },
      action: 'publier',
      niveau: 'courant',
      vues: [
        vue('minisite', '/mini-page', ['publier ma page', 'mettre à jour ma vitrine'], ['site', 'vitrine', 'page publique', 'web', 'site internet'], {
          en: { verbes: ['publish my page', 'update my showcase'], motsCles: ['website', 'showcase', 'public page', 'web', 'mini-site'] },
        }),
        vue('portfolio', '/portfolio', ['montrer mes réalisations', 'ajouter une réalisation'], ['portfolio', 'réalisations', 'photos', 'book'], {
          en: { verbes: ['show my work', 'add a project to my portfolio'], motsCles: ['portfolio', 'work', 'photos', 'showcase'] },
        }),
      ],
    },
    {
      action: 'evenements',
      niveau: 'courant',
      vues: [
        vue('evenements', '/evenements', ['organiser un événement', 'vendre des entrées', 'calculer le seuil de rentabilité'], ['événement', 'jauge', 'soirée', 'atelier'], {
          en: { verbes: ['organize an event', 'sell event tickets', 'work out the break-even point'], motsCles: ['event', 'capacity', 'party', 'workshop', 'break-even'] },
        }),
      ],
    },
  ],
});
