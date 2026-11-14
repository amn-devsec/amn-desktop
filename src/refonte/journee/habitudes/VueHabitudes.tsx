import React from 'react';
import { Activity, AlertCircle, BookOpen, Library, Mail, PauseCircle, Plus, Sun, Target, Zap, Check } from 'lucide-react';
import { Bouton } from '../../../socle/ui/Bouton';
import { Page, PageHead } from '../../../socle/ui/archetypes';
import { BlocEtat } from '../../../socle/ui/situations';
import { SuggestionAjmani } from '../../../socle/ui/controles';
import { SEMAINES, type CaseGrille, type LigneHabitude, type ModeleRegularite, type MomentDuJour } from './modele';
import { useMotsHabitudes } from './i18n';
import '../../contacts/cibles.css';
import './habitudes.css';

/**
 * « HABITUDES » (MJ02) — la grille de régularité. Mise en page et états, sans accès aux données. Disposition (fiche MJ02, zone principale de 1108 px) :
 * en-tête de page, carte « Régularité » de 768 × 664 (titre 52, en-tête de colonnes 44, six lignes d'habitude, « Journées complètes » 62, pied 40 ;
 * cases de 14 × 26, 28 colonnes, 8 px de plus entre deux semaines) et colonne de 320 : « Aujourd'hui » 200, « Selon le jour » (s'étire), suggestion 175.
 * Une case jamais en rouge : « pas fait » est un fond neutre, le jour courant est une bande légère.
 */
export interface ActionsHabitudes {
  nouvelle: () => void;
  bibliotheque: () => void;
  filtre: (f: MomentDuJour | 'toutes') => void;
  cocher: (id: string) => void;
  reserver: () => void;
  garder: () => void;
  ajouter: (cle: 'planifier' | 'boite' | 'marcher') => void;
  reessayer: () => void;
}

export interface VueHabitudesProps {
  statut: 'pret' | 'chargement' | 'erreur';
  horsLigne?: boolean;
  modele: ModeleRegularite;
  filtre: MomentDuJour | 'toutes';
  actions: ActionsHabitudes;
  lecture?: boolean;
}

const ICONES: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = { sun: Sun, soleil: Sun, pause: PauseCircle, book: BookOpen, livre: BookOpen, zap: Zap, eclair: Zap, activity: Activity, pouls: Activity, mail: Mail, enveloppe: Mail };
type Tm = ReturnType<typeof useMotsHabitudes>['tm'];

export function VueHabitudes({ statut, horsLigne = false, modele: m, filtre, actions, lecture = false }: VueHabitudesProps) {
  const { tm, langue } = useMotsHabitudes();
  const fmt = (j: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { ...o, timeZone: 'UTC' }).format(new Date(`${j}T12:00:00Z`));
  const lettre = (i: number) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 9, 26 + i, 12))).toUpperCase();
  const jourLong = (i: number) => new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2026, 9, 26 + i, 12)));
  const a = m.aujourdhui;
  const sousTitre = m.vide ? tm('sousTitre.vide') : m.regularite.pourcent != null ? tm('sousTitre.fait', { faites: a.faites, prevues: a.prevues, pourcent: m.regularite.pourcent }) : tm('sousTitre.faitSans', { faites: a.faites, prevues: a.prevues });
  const dernierJour = m.parJour.jours.find((j) => j.plusBas);

  return (
    <Page className="sc-ct-cibles">
      <PageHead
        titre={tm('titre')}
        sousTitre={sousTitre}
        className="sc-hb__entete"
        secondaires={[{ libelle: tm('action.bibliotheque'), onClick: actions.bibliotheque, icone: <Library size={14} strokeWidth={1.9} /> }]}
        primaire={lecture ? undefined : { libelle: tm('action.nouvelle'), onClick: actions.nouvelle, icone: <Plus size={14} strokeWidth={2.2} /> }}
      />
      {horsLigne && <p className="sc-hb__hors-ligne" role="status">{tm('etat.horsLigne')}</p>}
      {statut === 'erreur' ? (
        <BlocEtat icone={<AlertCircle size={20} strokeWidth={1.7} />} ton="attention" annonce="alert" titre={tm('etat.erreur')} actions={<Bouton variante="secondaire" onClick={actions.reessayer}>{tm('etat.reessayer')}</Bouton>} />
      ) : (
        <div className="sc-hb" aria-busy={statut === 'chargement' || undefined}>
          <section className="sc-hb-carte sc-hb-grille" aria-label={tm('grille.libelle')}>
            <header className="sc-hb-grille__tete">
              <h2>{tm('grille.titre')}</h2><span className="sc-hb-periode">{tm('grille.periode')}</span>
              <div className="sc-hb-chips" role="group" aria-label={tm('filtre.libelle')}>
                {(['toutes', 'matin', 'journee', 'soir'] as const).map((f) => <button key={f} type="button" aria-pressed={filtre === f} onClick={() => actions.filtre(f)}>{tm(`filtre.${f}` as const)}</button>)}
              </div>
            </header>
            {m.vide && statut === 'pret' ? (
              <div className="sc-hb-vide">
                <BlocEtat icone={null} ton="neutre" titre={tm('vide.titre')} texte={tm('vide.texte')} actions={<Bouton variante="secondaire" onClick={actions.bibliotheque}>{tm('vide.bibliotheque')}</Bouton>} />
                <ul>
                  {(['planifier', 'boite', 'marcher'] as const).map((k) => (
                    <li key={k}>
                      <span>{tm(`vide.${k}` as const)}</span>
                      {!lecture && <button type="button" onClick={() => actions.ajouter(k)}>{tm('vide.ajouter')}</button>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <>
                <div className="sc-hb-colonnes" aria-hidden>
                  <span className="sc-hb-colonnes__libelle">{tm('grille.habitude')}</span>
                  <div className="sc-hb-semaines">
                    {m.semaines.map((s, i) => (
                      <div key={s} className="sc-hb-semaine">
                        <span className="sc-hb-semaine__titre">{i === 0 ? tm('grille.semaine', { jour: fmt(s, { day: 'numeric', month: 'short' }) }) : fmt(s, { day: 'numeric', month: 'short' })}</span>
                        <span className="sc-hb-semaine__jours">{Array.from({ length: 7 }, (_, k) => <b key={k} data-aujourdhui={i === SEMAINES - 1 && k === 4 ? '' : undefined}>{lettre(k)}</b>)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sc-hb-lignes">
                  {m.lignes.map((l) => <Ligne key={l.id} l={l} tm={tm} fmt={fmt} onCocher={actions.cocher} lecture={lecture} signale={m.proposition && m.proposition.habitudeId === l.id ? m.proposition.jourSemaine : null} />)}
                </div>
                <div className="sc-hb-synthese">
                  <span className="sc-hb-synthese__texte"><b>{tm('completes.titre')}</b><span>{tm('completes.texte', { n: m.completes.nbCompletes, total: m.completes.nbJoursPasses })}</span></span>
                  <div className="sc-hb-semaines sc-hb-cases">
                    {Array.from({ length: SEMAINES }, (_, w) => (
                      <div key={w} className="sc-hb-semaine__cases">
                        {m.completes.jours.slice(w * 7, w * 7 + 7).map((c) => <i key={c.jour} className="sc-hb-case" data-etat={c.aVenir ? (c.aujourdhui ? 'a-faire' : 'a-venir') : 'complete'} style={!c.aVenir ? { opacity: Math.max(0.2, c.opacite) } : undefined} />)}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            <footer className="sc-hb-pied">
              <span className="sc-hb-legende"><i data-etat="fait" aria-hidden />{tm('pied.fait')}</span>
              <span className="sc-hb-legende"><i data-etat="pas-fait" aria-hidden />{tm('pied.pasFait')}</span>
              <span className="sc-hb-legende"><i data-etat="non-prevu" aria-hidden />{tm('pied.nonPrevu')}</span>
              <span className="sc-hb-legende"><i data-etat="a-venir" aria-hidden />{tm('pied.aVenir')}</span>
              {m.regularite.pourcent != null && (
                <span className="sc-hb-regularite"><span>{tm('pied.regularite')}</span><b className="sc-nombre">{m.regularite.pourcent} %</b>
                  {m.regularite.ecartPoints != null && <span className="sc-nombre" data-ton={m.regularite.ecartPoints >= 0 ? 'succes' : 'neutre'}>{m.regularite.ecartPoints === 0 ? tm('pied.pointsEgal') : tm('pied.points', { signe: m.regularite.ecartPoints > 0 ? '+' : '−', n: Math.abs(m.regularite.ecartPoints) })}</span>}
                </span>
              )}
            </footer>
          </section>

          <div className="sc-hb-droite">
            <section className="sc-hb-carte sc-hb-aujourdhui" aria-label={tm('aujourdhui.titre')}>
              <div className="sc-hb-aujourdhui__haut">
                <svg className="sc-hb-anneau" viewBox="0 0 64 64" role="img" aria-label={tm('aujourdhui.anneau', { faites: a.faites, prevues: a.prevues })}>
                  <circle cx="32" cy="32" r="28" className="sc-hb-anneau__fond" />
                  <circle cx="32" cy="32" r="28" className="sc-hb-anneau__arc" strokeDasharray={`${a.prevues ? (a.faites / a.prevues) * 175.9 : 0} 175.9`} transform="rotate(-90 32 32)" />
                  <text x="32" y="37" textAnchor="middle" className="sc-nombre">{a.faites}/{a.prevues}</text>
                </svg>
                <div><h2>{a.complete ? tm('aujourdhui.complete') : tm('aujourdhui.titre')}</h2><p>{a.prevues === 0 ? tm('aujourdhui.rien') : a.complete ? tm('aujourdhui.completeTexte') : tm(a.prevues - a.faites <= 1 ? 'aujourdhui.reste.1' : 'aujourdhui.reste.n', { n: a.prevues - a.faites })}</p></div>
              </div>
              <ul className="sc-hb-restantes">
                {a.restantes.map((r) => {
                  const Icone = ICONES[r.icone] ?? Target;
                  return (
                    <li key={r.id}>
                      <span className="sc-hb-tuile"><Icone size={14} strokeWidth={1.8} /></span>
                      <span className="sc-hb-restantes__corps"><b>{r.nom}{r.genre === 'mesure' && <i className="sc-hb-voyant" aria-hidden />}</b>{r.genre === 'mesure' ? <span className="sc-hb-restantes__mesure"><span className="sc-hb-barre" aria-hidden><i style={{ width: `${r.part * 100}%` }} /></span><span className="sc-nombre">{r.valeurTexte}</span></span> : <span>{r.detail}</span>}</span>
                      {r.genre === 'case' && !lecture && <button type="button" className="sc-hb-rond" aria-label={tm('case.cocher', { habitude: r.nom })} onClick={() => actions.cocher(r.id)} />}
                    </li>
                  );
                })}
              </ul>
            </section>
            <section className="sc-hb-carte sc-hb-selon" aria-label={tm('selon.titre')}>
              <header><h2>{tm('selon.titre')}</h2><span>{tm('selon.unite')}</span></header>
              <div className="sc-hb-barres">
                {m.parJour.jours.map((j, i) => (
                  <div key={i} className="sc-hb-barre-jour" data-bas={j.plusBas ? '' : undefined}>
                    <span className="sc-nombre">{j.pourcent ?? '—'}</span>
                    <i style={{ height: `${j.pourcent ?? 0}%` }} />
                    <b>{lettre(i)}</b>
                  </div>
                ))}
              </div>
              <p>{m.parJour.moyenne == null ? tm('selon.vide') : dernierJour ? tm('selon.phrase', { jour: jourLong(dernierJour.jourSemaine - 1), pourcent: dernierJour.pourcent ?? 0, moyenne: m.parJour.moyenne }) : tm('selon.phraseOk', { moyenne: m.parJour.moyenne })}</p>
            </section>
            <section className="sc-hb-suggestion" aria-label={tm('suggestion.astuce.titre')}>
              {m.proposition && !lecture ? (
                <SuggestionAjmani titre={tm('suggestion.titre', { jour: jourLong(m.proposition.jourSemaine - 1) })} texte={tm('suggestion.texte', { habitude: m.proposition.nom, jour: jourLong(m.proposition.jourSemaine - 1) })} primaire={{ libelle: tm('suggestion.reserver'), onClick: actions.reserver }} secondaire={{ libelle: tm('suggestion.garder'), onClick: actions.garder }} />
              ) : (
                <div className="sc-hb-astuce"><span>{tm('suggestion.astuce.titre')}</span><p>{tm('suggestion.astuce.texte')}</p></div>
              )}
            </section>
          </div>
        </div>
      )}
    </Page>
  );
}

function Ligne({ l, tm, fmt, onCocher, lecture, signale }: { signale: number | null; l: LigneHabitude; tm: Tm; fmt: (j: string, o: Intl.DateTimeFormatOptions) => string; onCocher: (id: string) => void; lecture: boolean }) {
  const Icone = ICONES[l.icone] ?? Target;
  const s = l.serie;
  return (
    <div className="sc-hb-ligne">
      <div className="sc-hb-ligne__id">
        <span className="sc-hb-tuile sc-hb-tuile--grande"><Icone size={15} strokeWidth={1.8} /></span>
        <span className="sc-hb-ligne__texte">
          <b>{l.nom}</b>
          <span>{l.rythme}</span>
          <span className="sc-hb-serie">
            {s.reprend ? tm('serie.reprend') : <><span className="sc-nombre">{tm(s.unite === 'jours' ? (s.valeur <= 1 ? 'serie.jours.1' : 'serie.jours.n') : (s.valeur <= 1 ? 'serie.semaines.1' : 'serie.semaines.n'), { n: s.valeur })}</span><i className="sc-hb-palier" aria-hidden><i style={{ width: `${s.part * 100}%` }} /></i><span className="sc-hb-cible" title={tm('serie.palier', { n: s.palier, unite: tm(`serie.unite.${s.unite}` as const) })}><Target size={11} strokeWidth={1.9} aria-hidden /><span className="sc-nombre">{tm(`serie.paliercourt.${s.unite}` as const, { n: s.palier })}</span></span></>}
          </span>
        </span>
      </div>
      <div className="sc-hb-semaines sc-hb-cases">
        {Array.from({ length: SEMAINES }, (_, w) => (
          <div key={w} className="sc-hb-semaine__cases">
            {l.cases.slice(w * 7, w * 7 + 7).map((c, k) => <Case key={c.jour} c={c} l={l} tm={tm} fmt={fmt} onCocher={onCocher} lecture={lecture} signale={signale === k + 1 && c.etat === 'pas-fait'} />)}
          </div>
        ))}
      </div>
    </div>
  );
}

function Case({ c, l, tm, fmt, onCocher, lecture, signale }: { signale: boolean; c: CaseGrille; l: LigneHabitude; tm: Tm; fmt: (j: string, o: Intl.DateTimeFormatOptions) => string; onCocher: (id: string) => void; lecture: boolean }) {
  const libelle = tm('case.libelle', { habitude: l.nom, jour: fmt(c.jour, { weekday: 'long', day: 'numeric', month: 'long' }), etat: tm(`case.${c.etat}` as const) });
  const cochable = c.aujourdhui && c.etat === 'a-faire' && l.cochable && !lecture;
  if (cochable) return <button type="button" className="sc-hb-case" data-etat="a-faire" data-aujourdhui="" aria-label={tm('case.cocher', { habitude: l.nom })} onClick={() => onCocher(l.id)}><Plus size={10} strokeWidth={2.4} aria-hidden /></button>;
  return (
    <span className="sc-hb-case" data-etat={c.etat} data-aujourdhui={c.aujourdhui ? '' : undefined} data-signale={signale ? '' : undefined} role="img" aria-label={libelle}>
      {c.etat === 'en-cours' && <i style={{ height: `${Math.round((c.part ?? 0) * 100)}%` }} aria-hidden />}
      {c.etat === 'fait' && c.aujourdhui && <Check size={9} strokeWidth={3} aria-hidden />}
    </span>
  );
}
