import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssistant } from '../../../assistant/AssistantContext';
import { useSourcesContacts } from '../sources/depuisApp';
import { modeleContacts, type FiltreContacts, type ModeleContacts, type ProfilContact } from './modele';
import { VueContacts, type ActionsContacts } from './VueContacts';

/**
 * « FICHES CONTACTS » (MC03) — la page branchée : le carnet de personnes, écran neuf `/contacts/fiches`.
 *
 * L'application n'a pas (encore) de collection d'interlocuteurs : décision de Harun en attente (STATUT §1.28). Tant que
 * `sources.interlocuteurs` est `null`, l'écran dit « non disponible » et pourquoi, et renvoie aux clients : il n'invente
 * aucune personne. Dès que la collection existe, la liste et le profil se construisent depuis elle.
 */
function useMaintenant(pas = 60_000): number {
  const [maintenant, setMaintenant] = useState(() => Date.now());
  useEffect(() => {
    const minuteur = window.setInterval(() => setMaintenant(Date.now()), pas);
    return () => window.clearInterval(minuteur);
  }, [pas]);
  return maintenant;
}

export default function PageContacts(): React.ReactElement {
  const navigate = useNavigate();
  const { open: ouvrirAjmani } = useAssistant();
  const maintenant = useMaintenant();
  const { statut, sources } = useSourcesContacts(maintenant);
  const [selection, setSelection] = useState<string | null>(null);
  const [filtre, setFiltre] = useState<FiltreContacts>('tous');
  const [recherche, setRecherche] = useState('');
  const [masque, setMasque] = useState(false);

  const modele: ModeleContacts | null = useMemo(() => (sources && sources.interlocuteurs !== null ? modeleContacts(sources, { selectionId: selection, filtre, recherche }) : null), [sources, selection, filtre, recherche]);

  const ecrire = useCallback((p: ProfilContact) => {
    const cible = p.preference === 'téléphone' ? null : p.email;
    if (cible) window.open(`mailto:${cible}`, '_self');
  }, []);
  const actions: ActionsContacts = useMemo(
    () => ({
      nouveau: () => navigate('/clients'),
      choisir: setSelection,
      filtre: setFiltre,
      recherche: setRecherche,
      ecrire,
      appeler: (p) => { if (p.telephone) window.open(`tel:${p.telephone.replace(/\s/g, '')}`, '_self'); },
      ouvrirClient: (id) => navigate(id ? `/clients?fiche=${id}` : '/clients'),
      preparer: () => ouvrirAjmani(),
      non: () => setMasque(true),
      reessayer: () => window.location.reload(),
    }),
    [navigate, ecrire, ouvrirAjmani],
  );

  const horsLigne = typeof navigator !== 'undefined' && navigator.onLine === false;
  const m = modele && masque && modele.profil ? { ...modele, profil: { ...modele.profil, preparation: null } } : modele;
  return (
    <VueContacts
      statut={sources && sources.interlocuteurs === null ? 'indisponible' : m ? 'pret' : statut === 'pret' ? 'erreur' : 'chargement'}
      horsLigne={horsLigne}
      modele={m ?? VIDE}
      selectionId={selection}
      filtre={filtre}
      recherche={recherche}
      actions={actions}
      aujourdhui={sources?.aujourdhui ?? new Date(maintenant).toISOString().slice(0, 10)}
    />
  );
}

const VIDE: ModeleContacts = { total: 0, groupes: [], profil: null, chips: { tous: 0, favoris: 0, recents: 0 } };
