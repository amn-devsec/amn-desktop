import React from 'react';
import { ArrowRight, CalendarCheck, ContactRound, HeartHandshake, LifeBuoy, Link2, Send, Star, Target, Trophy, Truck, UsersRound, Users, Workflow } from 'lucide-react';
import { CountBadge, ModuleGroupGrid, ModuleTile } from '../../../socle/ui';
import { formaterEuro } from '../../../socle/ui/graphiques';
import { Link } from 'react-router-dom';
import type { GroupeHub, TuileHub } from './modele';
import { useMotsHub, type CleHub } from './i18n';

/** Les glyphes des modules de la famille (lucide, 14 px dans leur carré teinté par `IconTile`). */
const ICONES: Record<string, React.ReactNode> = {
  clients: <Users size={14} strokeWidth={2} />,
  contactsFiches: <ContactRound size={14} strokeWidth={2} />,
  loyalty: <Trophy size={14} strokeWidth={2} />,
  reviews: <Star size={14} strokeWidth={2} />,
  aftersales: <LifeBuoy size={14} strokeWidth={2} />,
  pipeline: <Target size={14} strokeWidth={2} />,
  pipelineCommercial: <Workflow size={14} strokeWidth={2} />,
  reminders: <Send size={14} strokeWidth={2} />,
  rdvClients: <CalendarCheck size={14} strokeWidth={2} />,
  referrals: <HeartHandshake size={14} strokeWidth={2} />,
  suppliers: <Truck size={14} strokeWidth={2} />,
  partenaires: <Link2 size={14} strokeWidth={2} />,
  directory: <UsersRound size={14} strokeWidth={2} />,
};

const CLE_GROUPE: Record<GroupeHub['cle'], CleHub> = { clients: 'groupe.clients', developper: 'groupe.developper', autour: 'groupe.autour' };

/** « Les N modules » : trois colonnes de groupes, une tuile par module de la famille, « Ajouter un module » à la fin. */
export function CarteModules({ groupes, versTous }: { groupes: GroupeHub[]; versTous: string }) {
  const { tm } = useMotsHub();
  const total = groupes.reduce((n, g) => n + g.tuiles.length, 0);

  const mesure = (t: TuileHub): string | undefined => {
    if (!t.disponible) return tm('tuile.indisponible');
    if (!t.mesure) return undefined;
    const params = { ...t.mesure.params };
    if (typeof params.montant === 'number') params.montant = formaterEuro(params.montant / 100);
    return tm(t.mesure.cle as CleHub, params);
  };

  return (
    <section className="sc-ct-carte sc-ct-modules" aria-labelledby="ct-modules-titre" data-famille="contacts">
      <header className="sc-ct-carte__entete">
        <h2 id="ct-modules-titre" className="sc-ct-carte__titre">
          {tm('modules.titre', { n: total })}
        </h2>
        <span className="sc-ct-carte__sous">{tm('modules.sousTitre')}</span>
        <Link to={versTous} className="sc-ct-modules__tous sc-focus">
          {tm('modules.tous')}
          <ArrowRight aria-hidden size={12} strokeWidth={2} />
        </Link>
      </header>
      <div className="sc-ct-modules__colonnes">
        {groupes.map((g, i) => {
          const tuiles = g.tuiles.map((t) => (
            <div key={t.id} className="sc-ct-tuile" data-ton={t.mesure?.ton ?? 'neutre'} data-indisponible={!t.disponible || undefined}>
              <ModuleTile
                vers={t.vers}
                nom={tm(`tuile.nom.${t.nom}` as CleHub)}
                icone={ICONES[t.id] ?? <Users size={14} strokeWidth={2} />}
                famille="contacts"
                sousTexte={mesure(t)}
                accessoire={t.compte ? <CountBadge n={t.compte} /> : undefined}
              />
            </div>
          ));
          return i === groupes.length - 1 ? (
            <ModuleGroupGrid key={g.cle} titre={tm(CLE_GROUPE[g.cle])} effectif={g.tuiles.length} colonnes={1} versAjouter={versTous} libelleAjouter={tm('modules.ajouter')}>
              {tuiles}
            </ModuleGroupGrid>
          ) : (
            <ModuleGroupGrid key={g.cle} titre={tm(CLE_GROUPE[g.cle])} effectif={g.tuiles.length} colonnes={1}>
              {tuiles}
            </ModuleGroupGrid>
          );
        })}
      </div>
    </section>
  );
}
