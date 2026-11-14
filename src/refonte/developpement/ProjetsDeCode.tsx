import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Plus, Plug } from 'lucide-react';
import { MiniCourbe, PastilleEtat } from '../../socle/ui';
import { ABrancher, CarteDev, GrandChiffre, ListeARegarder, PageDev } from './briques';
import { dateCourte } from './commun';
import { planifies as planifiesAVenir, resumeSemaine, type Deploiement as DeploiementLogique } from './deploiements';
import { useDonneesDeveloppement } from './donnees';
import { dire, direCompte } from './i18n';
import { ROUTES_DEV } from './chemins';
import { aRegarder, carteDActivite, commitsDeLaSemaine, lignesDuDepot, pastilleDepot, partTestsVerts, ticketsDuDepot, trierDepots } from './vues';

/**
 * DEV-projets · PROJETS DE CODE — fiche `docs/refonte/fiches/LOT-11/DEV-projets.md`, image `DEV-projets.png`.
 *
 * Le bandeau (commits de la semaine, déploiements, part de dépôts verts, carte d'activité sur 31 semaines), les
 * cartes de dépôt (3 × 2, en échec d'abord), « À regarder aujourd'hui » et « Prochaines versions ». Les dépôts
 * viennent du connecteur Code (LOT-12) : sans lui, l'écran dit qu'il est à brancher, il n'invente rien.
 */

const L = 'fr' as const;
const CARTES_MONTREES = 6;

export default function ProjetsDeCode() {
  const d = useDonneesDeveloppement();
  const aller = useNavigate();
  const m = d.maintenant;
  const branche = d.source === 'exemple';

  const vue = useMemo(() => {
    const deps = d.deploiements as unknown as DeploiementLogique[];
    const depots = trierDepots(d.depots);
    const echecs = d.depots.filter((x) => x.tests.etat === 'echec').length;
    const regarder = aRegarder({ depots: d.depots, deploiements: deps, services: [], ouverts: d.ticketsOuverts, bloquants: d.ticketsBloquants, maintenant: m }, L);
    const versions = planifiesAVenir(d.planifies.map((p) => ({ id: p.id, depot: p.depot, quoi: p.quoi, cible: p.cible, a: p.prevuA })), m, L).aVenir.slice(0, 3);
    return { depots, echecs, regarder, versions, semaine: resumeSemaine(deps, m, L), carte: carteDActivite(d.depots), verts: partTestsVerts(d.depots) };
  }, [d, m]);

  const sous = !branche
    ? dire(L, 'projets.brancher.titre')
    : [direCompte(L, 'projets.suivis', d.depots.length), vue.echecs ? direCompte(L, 'projets.echecs', vue.echecs) : dire(L, 'projets.toutVert')].join(' · ');

  const sousVersion = (depotNom: string) => {
    const dep = d.depots.find((x) => x.nom === depotNom);
    if (!dep) return dire(L, 'projets.pret');
    const t = ticketsDuDepot(dep, d.ticketsOuverts, d.ticketsBloquants);
    if (t.ouverts > 0) return direCompte(L, 'projets.restants', t.ouverts);
    return dep.tests.etat === 'echec' ? dire(L, 'projets.aReprendre') : dire(L, 'projets.pret');
  };

  return (
    <PageDev
      titre={dire(L, 'projets.titre')}
      sousTitre={sous}
      source={d.source}
      secondaires={[{ libelle: dire(L, 'projets.importer'), icone: <Plus size={15} />, onClick: () => aller('/settings') }]}
      primaire={{ libelle: dire(L, 'projets.nouveau'), icone: <Plus size={15} />, onClick: () => aller('/projets'), raccourci: '⌘N' }}
    >
      {!branche ? (
        <CarteDev>
          <ABrancher
            icone={<Plug size={20} />}
            titre={dire(L, 'projets.brancher.titre')}
            texte={dire(L, 'projets.brancher.texte')}
            action={<button type="button" className="dv-lien" onClick={() => aller('/settings')}>{dire(L, 'commun.brancher')}</button>}
          />
        </CarteDev>
      ) : d.depots.length === 0 ? (
        <CarteDev>
          <ABrancher icone={<GitBranch size={20} />} titre={dire(L, 'projets.vide.titre')} texte={dire(L, 'projets.vide.texte')} />
        </CarteDev>
      ) : (
        <>
          <CarteDev className="dv-pj-bandeau" rang={0} libelle={dire(L, 'projets.carte')}>
            <div className="dv-pj-chiffres">
              <GrandChiffre valeur={commitsDeLaSemaine(d.depots)} libelle={dire(L, 'projets.commits')} />
              <GrandChiffre valeur={vue.semaine.total} libelle={dire(L, 'projets.deploiements')} />
              <GrandChiffre valeur={vue.verts === null ? '—' : `${vue.verts} %`} libelle={dire(L, 'projets.testsVerts')} second />
            </div>
            <div className="dv-pj-carte" role="img" aria-label={dire(L, 'projets.carte')}>
              {vue.carte.map((s) => (
                <span key={s.semaine} className="dv-pj-colonne" title={dire(L, 'projets.semaine', { n: s.semaine + 1, c: s.total })}>
                  {Array.from({ length: 7 }, (_, k) => (
                    <span key={k} className="dv-pj-case" data-niveau={7 - k <= s.cases ? Math.min(4, 1 + Math.floor((s.cases - 1) / 2)) : 0} />
                  ))}
                </span>
              ))}
            </div>
          </CarteDev>

          <section className="dv-pj-grille" aria-label={dire(L, 'projets.grille')}>
            {vue.depots.slice(0, CARTES_MONTREES).map((dep, i) => {
              const p = pastilleDepot(dep, L);
              const l = lignesDuDepot(dep, m, ticketsDuDepot(dep, d.ticketsOuverts, d.ticketsBloquants), L);
              return (
                <article key={dep.id} className="dv-carte dv-pj-depot" data-teinte={dep.tests.etat === 'echec' ? 'echec' : dep.teinte % 8} data-coin={i % 2 ? 'gauche' : 'droite'}>
                  <header className="dv-pj-depot__tete">
                    <span className="dv-pj-tuile" aria-hidden>
                      <GitBranch size={14} />
                    </span>
                    <span className="dv-pj-depot__noms">
                      <span className="dv-pj-depot__nom dv-mono">{dep.nom}</span>
                      <span className="dv-pj-depot__desc">{dep.description}</span>
                    </span>
                    <PastilleEtat etat={p.ton}>{p.texte}</PastilleEtat>
                  </header>
                  <span className="dv-pj-langages" role="img" aria-label={dire(L, 'depot.langages', { nom: dep.nom })}>
                    {dep.langages.map((lg) => (
                      <span key={lg.nom} className="dv-pj-langage" data-langue={lg.nom.toLowerCase()} style={{ flexGrow: lg.part }} />
                    ))}
                  </span>
                  <span className="dv-pj-liste dv-t4">{dep.langages.map((lg) => lg.nom).join(' · ')}</span>
                  <span className="dv-pj-bas">
                    <span className="dv-pj-bas__textes">
                      <span className="dv-mono dv-t2 dv-pj-tronque">{l.branche}</span>
                      <span className="dv-t4 dv-pj-tronque">{l.cible}</span>
                    </span>
                    <MiniCourbe valeurs={dep.commitsParSemaine.slice(-7)} libelle={dire(L, 'depot.activite', { nom: dep.nom })} ton="famille" largeur={94} hauteur={26} />
                  </span>
                </article>
              );
            })}
          </section>

          <div className="dv-pj-bas-page">
            <CarteDev className="dv-pj-regarder" titre={dire(L, 'regarder.titre')} droite={direCompte(L, 'commun.points', vue.regarder.length)} rang={1}>
              <ListeARegarder
                libelleOuvrir={dire(L, 'commun.ouvrir')}
                vide={dire(L, 'regarder.vide')}
                points={vue.regarder.slice(0, 3).map((r) => ({
                  cle: r.cle,
                  ton: r.ton,
                  nom: r.nom,
                  texte: r.texte,
                  ouvrir: () => aller(r.vers.ecran === 'tickets' ? '/tasks' : ROUTES_DEV[r.vers.ecran]),
                }))}
              />
            </CarteDev>
            <CarteDev className="dv-pj-versions" titre={dire(L, 'projets.versions')} rang={2}>
              {vue.versions.length === 0 ? (
                <p className="dv-vide-ligne">{dire(L, 'projets.versionsVide')}</p>
              ) : (
                <ul className="dv-pj-versions__liste">
                  {vue.versions.map((v) => (
                    <li key={v.id}>
                      <button type="button" className="dv-pj-version" onClick={() => aller(ROUTES_DEV.deploiements)}>
                        <span className="dv-pj-version__date dv-t3">{dateCourte(v.a, L)}</span>
                        <span className="dv-pj-version__textes">
                          <span className="dv-pj-version__titre">
                            {v.depot}, {v.quoi}
                          </span>
                          <span className="dv-t4">{sousVersion(v.depot)}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CarteDev>
          </div>
        </>
      )}
    </PageDev>
  );
}
