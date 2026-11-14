import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VuePaiements } from './VuePaiements';

/**
 * MA03 · PAIEMENTS EN LIGNE — la page branchée, montée à la place de `/acompte` (substitution de LOT-04).
 *
 * Les paiements en ligne arrivent du serveur, qui reçoit les événements du service de paiement ; les instances de
 * connecteurs vivent dans H21 (LOT-07). Aujourd'hui, ni l'un ni l'autre n'est servi à l'application : la page dit donc
 * honnêtement « pas connecté » et renvoie aux réglages, sans rien inventer. Le jour où le serveur pousse les paiements
 * et où H21 tient ses instances, seule cette page change : la vue et ses calculs sont prêts (voir l'aperçu MA03).
 */
function useMaintenant(pas = 5_000): Date {
  const [maintenant, setMaintenant] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setMaintenant(new Date()), pas);
    return () => window.clearInterval(t);
  }, [pas]);
  return maintenant;
}

export default function PagePaiements() {
  const navigate = useNavigate();
  const maintenant = useMaintenant();
  const [majLe] = useState(() => new Date().toISOString());
  const enLigne = typeof navigator === 'undefined' ? true : navigator.onLine !== false;
  const rien = () => undefined;
  return (
    <VuePaiements
      statut="pret"
      connexion={{ etat: 'non-connecte', dernierTest: null }}
      paiements={[]}
      versements={null}
      maintenant={maintenant}
      majLe={majLe}
      enLigne={enLigne}
      peutEcrire={false}
      actions={{ creerLien: rien, reglages: () => navigate('/settings'), envoyerLien: rien, ouvrir: rien, reessayer: rien }}
    />
  );
}
