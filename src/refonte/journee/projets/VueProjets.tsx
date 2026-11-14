import React from 'react';
import { AlertCircle, CalendarDays, Clock, FileText, Folder, Globe, LineChart, Phone, Plus, ShieldCheck } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { Avatar } from '../../../socle/ui/Pastilles';
import { CarteCases, Segmente, SuggestionAjmani, type LigneCase } from '../../../socle/ui/controles';
import { HAUTEUR_COULOIR, LARGEUR_FRISE, type Couloir, type FenetreFrise, type JalonPlace, type ModeleFeuille } from './modele';
import { useMotsProjets } from './i18n';
import '../../contacts/cibles.css';
import './projets.css';

/**
 * « PROJETS » (MJ01) — la feuille de route. Mise en page et états, sans accès aux données. Disposition (fiche MJ01, zone principale de 1108 px) :
 * en-tête de page, carte « Feuille de route » de 1108 × 434 (titre 52, colonne des projets 262 + frise de 826 pour 70 jours, en-tête de frise 46,
 * six couloirs de 48, pied 40), puis trois cartes de 216 : « Prochains jalons » 391, « Pour finir la semaine » 344, suggestion d'Ajmani 344.
 */
export interface ActionsProjets {
  nouveau: () => void;
  modele: () => void;
  ouvrir: (id: string) => void;
  filtre: (f: 'tous' | 'enRetard' | 'miens') => void;
  fenetre: (f: FenetreFrise) => void;
  lier: () => void;
  plusTard: () => void;
  cocher: (id: string, fait: boolean) => void;
  ajouterDates: (id: string) => void;
  reessayer: () => void;
}

export interface VueProjetsProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleFeuille;
  filtre: 'tous' | 'enRetard' | 'miens';
  fenetre: FenetreFrise;
  /** « Samedi 30 » de la ligne d'aujourd'hui. */
  jourCourt: string;
  taches: readonly (LigneCase & { dureeMin?: number })[];
  suggestion: { a: string; b: string } | null;
  actions: ActionsProjets;
  lecture?: boolean;
}

const ICONES: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = { calendar: CalendarDays, calendrier: CalendarDays, globe: Globe, file: FileText, 'file-text': FileText, document: FileText, chart: LineChart, 'bar-chart': LineChart, graphique: LineChart, phone: Phone, mobile: Phone, shield: ShieldCheck, bouclier: ShieldCheck };
type Tm = ReturnType<typeof useMotsProjets>['tm'];

export function VueProjets(p: VueProjetsProps) {
  const { tm, langue } = useMotsProjets();
  const m = p.modele;
  const fmt = (j: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { ...o, timeZone: 'UTC' }).format(new Date(`${j}T12:00:00Z`));
  const retard = m.nbEnRetard > 0 ? tm(m.nbEnRetard === 1 ? 'sousTitre.retard.1' : 'sousTitre.retard.n', { n: m.nbEnRetard }) : tm('sousTitre.aucun');
  const sousTitre = tm(m.nbActifs <= 1 ? 'sousTitre.actifs.1' : 'sousTitre.actifs.n', { n: m.nbActifs, retard });
  const periode = tm('frise.periode', { debut: fmt(m.debut, { day: 'numeric', month: 'short' }), fin: fmt(m.fin, { day: 'numeric', month: 'short' }) });
  const duree = (min: number) => `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`;
  const restantes = p.taches.filter((t) => !t.fait);
  const minutes = restantes.reduce((s, t) => s + (t.dureeMin ?? 0), 0);

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        className="sc-pj__entete"
        secondaires={[{ libelle: tm('action.modele'), onClick: p.actions.modele, icone: <FileText size={14} strokeWidth={1.9} /> }]}
        primaire={p.lecture ? undefined : { libelle: tm('action.nouveau'), onClick: p.actions.nouveau, icone: <Plus size={14} strokeWidth={2.2} /> }}
      />
      {p.horsLigne && <p className="sc-pj__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {p.statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={p.actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-pj" aria-busy={p.statut === 'chargement' || undefined}>
          <section className="sc-pj-carte sc-pj-route" aria-label={tm('frise.titre')}>
            <header className="sc-pj-route__tete">
              <h2>{tm('frise.titre')}</h2><span className="sc-pj-periode">{periode}</span>
              <div className="sc-pj-route__droite">
                <div className="sc-pj-chips" role="group" aria-label={tm('filtre.libelle')}>
                  {(['tous', 'enRetard', 'miens'] as const).map((f) => <button key={f} type="button" aria-pressed={p.filtre === f} onClick={() => p.actions.filtre(f)}>{tm(`filtre.${f}` as const)}</button>)}
                </div>
                <Segmente libelle={tm('fenetre.libelle')} options={[{ cle: 'mois', libelle: tm('fenetre.mois') }, { cle: 'trimestre', libelle: tm('fenetre.trimestre') }]} valeur={p.fenetre} onChange={(k) => p.actions.fenetre(k as FenetreFrise)} taille="compact" />
              </div>
            </header>
            {m.vide && p.statut === 'pret' ? (
              <div className="sc-pj-vide"><BlocEtat icone={<Folder size={20} strokeWidth={1.7} />} ton="neutre" titre={tm('vide.titre')} texte={tm('vide.texte')} actions={<><Bouton variante="primaire" onClick={p.actions.nouveau}>{tm('vide.nouveau')}</Bouton><Bouton variante="secondaire" onClick={p.actions.modele}>{tm('vide.modeles')}</Bouton></>} /></div>
            ) : (
              <div className="sc-pj-corps">
                <div className="sc-pj-colonne">
                  <div className="sc-pj-colonne__tete">{tm('frise.projet')}</div>
                  <ul>{m.couloirs.map((c) => <li key={c.id}><Projet c={c} tm={tm} onOuvrir={p.actions.ouvrir} /></li>)}</ul>
                </div>
                <div className="sc-pj-frise" style={{ width: LARGEUR_FRISE }}>
                  <div className="sc-pj-frise__tete" aria-hidden>
                    {m.semaines.map((s) => <span key={s.jour} className="sc-nombre" data-mois={s.debutDeMois ? '' : undefined} style={{ left: s.x }}>{s.debutDeMois ? fmt(s.jour, { day: 'numeric', month: 'short' }) : Number(s.jour.slice(8))}</span>)}
                  </div>
                  <div className="sc-pj-frise__corps" style={{ height: Math.max(HAUTEUR_COULOIR * 6, m.couloirs.length * HAUTEUR_COULOIR) }}>
                    {m.weekends.map((w, i) => <i key={i} className="sc-pj-weekend" style={{ left: w.x, width: w.largeur }} aria-hidden />)}
                    {m.semaines.map((s) => <i key={s.jour} className="sc-pj-semaine" data-mois={s.debutDeMois ? '' : undefined} style={{ left: s.x }} aria-hidden />)}
                    {m.couloirs.map((c, i) => <Piste key={c.id} c={c} i={i} tm={tm} fmt={fmt} onAjouter={p.actions.ajouterDates} lecture={!!p.lecture} />)}
                    {m.lien && (
                      <svg className="sc-pj-lien" viewBox={`0 0 ${LARGEUR_FRISE} ${m.couloirs.length * HAUTEUR_COULOIR}`} aria-hidden>
                        <path d={`M${m.lien.x1} ${m.lien.y1} C ${m.lien.x1 + 40} ${m.lien.y1 + 20}, ${m.lien.x2 - 40} ${m.lien.y2 - 20}, ${m.lien.x2} ${m.lien.y2}`} />
                      </svg>
                    )}
                    {m.lien && <span className="sc-pj-lien__etiquette" style={{ left: m.lien.etiquetteX, top: m.lien.etiquetteY - 9 }}>{tm('lien.propose')}</span>}
                    {m.aujourdhuiX != null && (
                      <div className="sc-pj-aujourdhui" style={{ left: m.aujourdhuiX }} aria-hidden>
                        <i /><span>{tm('frise.aujourdhui', { jour: p.jourCourt })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <footer className="sc-pj-route__pied">
              <span className="sc-pj-legende"><i data-genre="avancement" aria-hidden />{tm('legende.avancement')}</span>
              <span className="sc-pj-legende"><i data-genre="atteint" aria-hidden />{tm('legende.atteint')}</span>
              <span className="sc-pj-legende"><i data-genre="avenir" aria-hidden />{tm('legende.avenir')}</span>
              {m.lien && <span className="sc-pj-legende"><i data-genre="lien" aria-hidden />{tm('legende.lien')}</span>}
              <span className="sc-pj-termines"><span>{tm('termines.titre')}</span><b className="sc-nombre">{m.terminesTrimestre.objectif ? tm('termines.sur', { n: m.terminesTrimestre.n, objectif: m.terminesTrimestre.objectif }) : tm('termines.valeur', { n: m.terminesTrimestre.n })}</b>{m.terminesTrimestre.objectif ? <span className="sc-pj-termines__barre" aria-hidden><i style={{ width: `${Math.min(100, (m.terminesTrimestre.n / m.terminesTrimestre.objectif) * 100)}%` }} /></span> : null}</span>
            </footer>
          </section>

          <div className="sc-pj-bas">
            <section className="sc-pj-carte sc-pj-prochains" aria-label={tm('prochains.titre')}>
              <header><h2>{tm('prochains.titre')}</h2><span>{tm('prochains.parDate')}</span></header>
              {m.prochains.length === 0 ? (
                <p className="sc-pj-vide-texte">{tm('prochains.rien')}{m.aucunProchain ? <><br />{tm('prochains.apres', { titre: m.aucunProchain.titre, jour: fmt(m.aucunProchain.jour, { day: 'numeric', month: 'short' }) })}</> : null}</p>
              ) : (
                <ul>{m.prochains.map((j) => (
                  <li key={j.id}>
                    <span className="sc-nombre sc-pj-prochains__date">{fmt(j.jour, { day: 'numeric', month: 'short' })}</span>
                    <span className="sc-pj-prochains__corps"><b>{j.titre}</b><span>{j.projet}</span></span>
                    <span className="sc-pj-prochains__etat" data-genre={j.etat.genre}>{j.etat.genre === 'retard' ? tm(j.etat.jours <= 1 ? 'prochains.retard.1' : 'prochains.retard.n', { n: j.etat.jours }) : j.etat.genre === 'aujourdhui' ? tm('prochains.aujourdhui') : j.etat.genre === 'jour' ? fmt(j.jour, { weekday: 'long' }) : ''}</span>
                  </li>
                ))}</ul>
              )}
            </section>
            <div className="sc-pj-finir">
              {p.taches.length > 0 ? (
                <CarteCases titre={tm('finir.titre')} lignes={p.taches.map(({ id, libelle, fait }) => ({ id, libelle, fait }))} onChange={p.actions.cocher} lecture={p.lecture} />
              ) : <section className="sc-pj-carte"><h2 className="sc-pj-h2">{tm('finir.titre')}</h2><p className="sc-pj-vide-texte">{tm('finir.vide')}</p></section>}
              {p.taches.length > 0 && <p className="sc-pj-aide"><Clock size={13} strokeWidth={1.8} aria-hidden />{minutes > 0 ? tm('finir.aide', { duree: duree(minutes) }) : tm('finir.aideSans', { n: restantes.length })}</p>}
            </div>
            <section className="sc-pj-suggestion" aria-label={tm('suggestion.astuce.titre')}>
              {p.suggestion && !p.lecture ? (
                <SuggestionAjmani titre={tm('suggestion.titre')} texte={tm('suggestion.texte', p.suggestion)} primaire={{ libelle: tm('suggestion.lier'), onClick: p.actions.lier }} secondaire={{ libelle: tm('suggestion.plusTard'), onClick: p.actions.plusTard }} />
              ) : (
                <div className="sc-pj-astuce"><span>{tm('suggestion.astuce.titre')}</span><p>{tm('suggestion.astuce.texte')}</p></div>
              )}
            </section>
          </div>
        </div>
      )}
    </Page>
  );
}

function Projet({ c, tm, onOuvrir }: { c: Couloir; tm: Tm; onOuvrir: (id: string) => void }) {
  const Icone = ICONES[c.icone] ?? Folder;
  return (
    <button type="button" className="sc-pj-projet" data-statut={c.statut} aria-label={tm('couloir.ouvrir', { nom: c.nom, avancement: c.avancement })} onClick={() => onOuvrir(c.id)}>
      <span className="sc-pj-projet__icone"><Icone size={15} strokeWidth={1.8} /></span>
      <span className="sc-pj-projet__corps">
        <b>{c.nom}</b>
        <span className="sc-pj-projet__bas">
          <span className="sc-pj-avatars" aria-hidden>{c.membres.slice(0, 3).map((n) => <Avatar key={n} nom={n} taille={18} />)}</span>
          <span className="sc-nombre">{c.avancement} %</span>
          <span className="sc-pj-statut">{tm(`couloir.statut.${c.statut}` as const)}</span>
        </span>
      </span>
    </button>
  );
}

function Piste({ c, i, tm, fmt, onAjouter, lecture }: { c: Couloir; i: number; tm: Tm; fmt: (j: string, o: Intl.DateTimeFormatOptions) => string; onAjouter: (id: string) => void; lecture: boolean }) {
  const b = c.barre;
  return (
    <div className="sc-pj-piste" style={{ top: i * HAUTEUR_COULOIR, height: HAUTEUR_COULOIR }} data-statut={c.statut}>
      {c.sansDates && <span className="sc-pj-sansdates">{tm('couloir.sansDates')}{!lecture && <button type="button" onClick={() => onAjouter(c.id)}>{tm('couloir.ajouterDates')}</button>}</span>}
      {c.horsFenetre && <span className="sc-pj-hors" data-cote={c.horsFenetre.cote}>{tm(c.horsFenetre.cote === 'gauche' ? 'couloir.horsGauche' : 'couloir.horsDroite', { jour: fmt(c.horsFenetre.jour, { day: 'numeric', month: 'short' }) })}</span>}
      {b && (
        <span className="sc-pj-barre" data-gauche={b.coupeAGauche ? '' : undefined} data-droite={b.coupeADroite ? '' : undefined} style={{ left: b.x, width: b.largeur }}>
          <i style={{ width: b.rempli }} />
        </span>
      )}
      {c.jalons.map((j) => <Jalon key={j.id} j={j} tm={tm} fmt={fmt} />)}
    </div>
  );
}

function Jalon({ j, tm, fmt }: { j: JalonPlace; tm: Tm; fmt: (j: string, o: Intl.DateTimeFormatOptions) => string }) {
  const jour = fmt(j.jour, { day: 'numeric', month: 'short' });
  return (
    <>
      <span className="sc-pj-jalon" data-etat={j.etat} style={{ left: j.x }} role="img" aria-label={tm(`jalon.${j.etat}` as const, { titre: j.titre, jour })}><i aria-hidden /></span>
      <span className="sc-pj-jalon__libelle" data-etat={j.etat} data-droite={j.aDroite ? '' : undefined} style={j.aDroite ? { right: LARGEUR_FRISE - j.x - 8 } : { left: j.x - 8 }}>{j.titre}</span>
    </>
  );
}
