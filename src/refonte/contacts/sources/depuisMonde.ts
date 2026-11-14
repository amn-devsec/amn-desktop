import type { Monde } from '../../donnees/types';
import type { AttenteClient, Echange, SourcesContacts } from './types';

/**
 * Les jeux fictifs de SIM, rangés dans la forme des sources de LOT-02 (aperçus et contrôles seulement).
 * `maintenant` : l'instant du monde ; `moi` : la personne « connectée » de l'équipe.
 */
export function depuisMonde(m: Monde): SourcesContacts {
  const moi = m.equipe.find((x) => x.moi) ?? m.equipe[0];
  const conv = new Map(m.conversations.map((c) => [c.id, c]));
  // « Ils attendent une réponse » : le dernier message d'une conversation CLIENT, quand il vient du client et n'a pas de réponse.
  const attentes: AttenteClient[] = [];
  for (const c of m.conversations) {
    if (c.type !== 'client' || c.nonLus === 0) continue;
    const client = c.clientId != null ? m.clients.find((x) => x.id === c.clientId) : undefined;
    attentes.push({
      clientId: c.clientId,
      clientNom: client ? client.company || client.name : c.nom,
      extrait: c.apercu,
      depuisMs: Date.parse(c.dernierMessageAt),
      canal: 'message',
    });
  }
  // Un courriel de client reçu et non lu attend lui aussi une réponse.
  for (const c of m.courriels) {
    if (c.dossier !== 'réception' || c.lu || c.clientId == null) continue;
    const client = m.clients.find((x) => x.id === c.clientId);
    attentes.push({ clientId: c.clientId, clientNom: client ? client.company || client.name : c.organisation || c.expediteurNom, extrait: c.objet, depuisMs: Date.parse(c.at), canal: 'courriel' });
  }
  const echanges: Echange[] = [
    ...m.evenements.filter((e) => !e.systeme && e.clientId != null && e.confirmation !== 'manqué').map((e) => ({ clientId: e.clientId as number, at: e.startAt })),
    ...m.courriels.filter((c) => c.clientId != null).map((c) => ({ clientId: c.clientId as number, at: c.at })),
    ...m.clients.map((c) => ({ clientId: c.id, at: c.dernierEchangeAt })),
  ];
  void conv;
  return {
    maintenant: m.contexte.maintenant,
    aujourdhui: m.contexte.aujourdhui,
    moi: { prenom: moi.prenom, email: moi.email },
    clients: m.clients,
    devis: m.devis,
    factures: m.factures,
    avis: m.avis,
    evenements: m.evenements,
    prospects: m.prospects,
    relances: m.relances,
    fidelite: m.fidelite,
    fournisseurs: m.fournisseurs,
    achats: m.achats,
    partenaires: m.partenaires,
    equipe: m.equipe,
    taches: m.taches,
    presence: true,
    interlocuteurs: m.interlocuteurs,
    attentes,
    echanges,
  };
}
