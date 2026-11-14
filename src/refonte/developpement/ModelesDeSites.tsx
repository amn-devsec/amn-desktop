import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Bouton, Modale, Segmente } from '../../socle/ui';
import { PageDev, useFeuilleDev } from './briques';
import { useDonneesDeveloppement, type DonneesDeveloppement } from './donnees';
import { dire, direCompte } from './i18n';
import { CLE_STOCKAGE, ecrireAjoutes, fauteDAjout, filtrer, jetonsHtml, lignes, lireAjoutes, MODELES_LIVRES, NOM_MAX, poids, puces, SECTEUR_MAX, type ModeleSite } from './modeles';

/**
 * DEV-modeles-sites · MODÈLES DE SITES — fiche `docs/refonte/fiches/LOT-11/DEV-modeles-sites.md`, images
 * `DEV-modeles-sites.png` et `-code.png`, prototype `sources-neon/DEV-modeles-sites.html` (sa logique et ses textes
 * font foi, au tutoiement ; son habillage passe au néon de la famille Développement, §1.17 n° 3).
 *
 * L'aperçu d'un modèle s'affiche toujours dans un cadre isolé, scripts coupés (`sandbox` vide) : le code collé n'est
 * jamais inséré dans la page de l'application. Le code s'affiche en texte, coloré, sans être interprété.
 */

const L = 'fr' as const;

function lireStockage(): ModeleSite[] {
  try {
    return lireAjoutes(window.localStorage.getItem(CLE_STOCKAGE));
  } catch {
    return [];
  }
}

/** Un aperçu réduit : la page rendue à 1280 × 800 dans un cadre isolé, mise à l'échelle de la tuile. */
function Apercu({ html, titre }: { html: string; titre: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [echelle, setEchelle] = useState(0.28);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(() => setEchelle(el.clientWidth / 1280));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <span ref={ref} className="dv-ms-apercu">
      <iframe title={titre} sandbox="" srcDoc={html} tabIndex={-1} style={{ transform: `scale(${echelle})` }} />
    </span>
  );
}

export default function ModelesDeSites() {
  return <ModelesDev d={useDonneesDeveloppement()} />;
}

/**
 * La vue seule. Un aperçu passe ses modèles d'exemple (`ajoutesInitiaux`, à la place de ceux de ce poste) et peut
 * ouvrir un modèle d'emblée (`ouvertInitial`, `vueInitiale`) ; l'enveloppe ci-dessus ne passe que les données.
 */
export function ModelesDev({
  d,
  ajoutesInitiaux,
  ouvertInitial,
  vueInitiale = 'apercu',
}: {
  d: DonneesDeveloppement;
  ajoutesInitiaux?: ModeleSite[];
  ouvertInitial?: string;
  vueInitiale?: 'apercu' | 'code';
}) {
  // La fiche d'un modèle ouvert se rend sans `PageDev` : la feuille du lot doit être posée ici aussi.
  useFeuilleDev();
  const [ajoutes, setAjoutes] = useState<ModeleSite[]>(() => ajoutesInitiaux ?? lireStockage());
  const [secteur, setSecteur] = useState('');
  const [recherche, setRecherche] = useState('');
  const [ouvert, setOuvert] = useState<ModeleSite | null>(() => (ouvertInitial ? ([...MODELES_LIVRES, ...(ajoutesInitiaux ?? [])].find((m) => m.id === ouvertInitial) ?? null) : null));
  const [vue, setVue] = useState<'apercu' | 'code'>(vueInitiale);
  const [appareil, setAppareil] = useState<'ordinateur' | 'telephone'>('ordinateur');
  const [annonce, setAnnonce] = useState('');
  const [dialogue, setDialogue] = useState(false);
  const [saisie, setSaisie] = useState({ nom: '', secteur: '', html: '' });
  const [faute, setFaute] = useState<string | null>(null);
  const codeRef = useRef<HTMLPreElement>(null);

  const tous = useMemo(() => [...MODELES_LIVRES, ...ajoutes], [ajoutes]);
  const listePuces = puces(tous);
  const montres = filtrer(tous, secteur, recherche);

  useEffect(() => {
    if (!ouvert) return undefined;
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && !dialogue && setOuvert(null);
    window.addEventListener('keydown', echap);
    return () => window.removeEventListener('keydown', echap);
  }, [ouvert, dialogue]);

  const ajouter = () => {
    const f = fauteDAjout(saisie.nom, saisie.secteur, saisie.html);
    if (f) {
      setFaute(dire(L, `mod.faute.${f}` as Parameters<typeof dire>[1]));
      return;
    }
    const neuf: ModeleSite = { id: `ajoute-${Date.now()}`, nom: saisie.nom.trim(), secteur: saisie.secteur.trim(), etiquettes: ['Ajouté'], html: saisie.html, origine: 'ajoute' };
    const suite = [...ajoutes, neuf];
    let garde = true;
    try {
      window.localStorage.setItem(CLE_STOCKAGE, ecrireAjoutes(suite));
    } catch {
      garde = false;
    }
    setAjoutes(suite);
    setSecteur('');
    setDialogue(false);
    setSaisie({ nom: '', secteur: '', html: '' });
    setFaute(null);
    setAnnonce(dire(L, garde ? 'mod.ajoute' : 'mod.ajouteSession'));
  };

  const copier = async (m: ModeleSite) => {
    try {
      await navigator.clipboard.writeText(m.html);
      setAnnonce(dire(L, 'mod.copie', { n: lignes(m.html) }));
    } catch {
      setVue('code');
      requestAnimationFrame(() => {
        const pre = codeRef.current;
        if (!pre) return;
        const r = document.createRange();
        r.selectNodeContents(pre);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(r);
      });
      setAnnonce(dire(L, 'mod.selectionne'));
    }
  };

  if (ouvert) {
    const n = lignes(ouvert.html);
    return (
      <div className="dv-ms-fiche" role="dialog" aria-modal="true" aria-label={ouvert.nom}>
        <header className="dv-ms-barre">
          <Bouton variante="secondaire" icone={<ArrowLeft size={15} />} onClick={() => setOuvert(null)} autoFocus>
            {dire(L, 'mod.retour')}
          </Bouton>
          <span className="dv-ms-barre__titres">
            <b>{ouvert.nom}</b>
            <span className="dv-mono dv-t4">
              {ouvert.secteur} · {dire(L, 'mod.lignes', { n })} · {poids(ouvert.html)}
            </span>
          </span>
          <Segmente libelle={dire(L, 'mod.vue')} options={[{ cle: 'apercu', libelle: dire(L, 'mod.apercu') }, { cle: 'code', libelle: dire(L, 'mod.code') }]} valeur={vue} onChange={(c) => setVue(c as 'apercu' | 'code')} />
          {vue === 'apercu' && (
            <Segmente libelle={dire(L, 'mod.appareil')} options={[{ cle: 'ordinateur', libelle: dire(L, 'mod.ordinateur') }, { cle: 'telephone', libelle: dire(L, 'mod.telephone') }]} valeur={appareil} onChange={(c) => setAppareil(c as 'ordinateur' | 'telephone')} />
          )}
          <Bouton variante="primaire" onClick={() => void copier(ouvert)}>
            {dire(L, 'mod.copier')}
          </Bouton>
        </header>
        <p className="dv-annonce dv-ms-annonce" role="status" aria-live="polite">
          {annonce}
        </p>
        {vue === 'apercu' ? (
          <div className="dv-ms-scene" data-appareil={appareil}>
            <iframe title={dire(L, 'mod.apercuDuModele')} sandbox="" srcDoc={ouvert.html} />
          </div>
        ) : (
          <div className="dv-ms-codewrap">
            <p className="dv-ms-cbar">
              <span className="dv-mono">
                {dire(L, 'mod.lignes', { n })} · {poids(ouvert.html)}
              </span>
              <span>{dire(L, 'mod.unFichier')}</span>
            </p>
            <div className="dv-ms-code">
              <span className="dv-ms-gouttiere" aria-hidden>
                {Array.from({ length: n }, (_, i) => `${i + 1}\n`).join('')}
              </span>
              <pre ref={codeRef} tabIndex={0}>
                {ouvert.html.split('\n').map((ligne, i) => (
                  <React.Fragment key={i}>
                    {jetonsHtml(ligne).map((j, k) => (
                      <span key={k} data-jeton={j.genre}>
                        {j.texte}
                      </span>
                    ))}
                    {'\n'}
                  </React.Fragment>
                ))}
              </pre>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <PageDev
      titre={dire(L, 'mod.titre')}
      sousTitre={dire(L, 'mod.sous')}
      source={d.source}
      primaire={{ libelle: dire(L, 'mod.ajouter'), onClick: () => setDialogue(true) }}
    >
      <p className="dv-annonce" role="status" aria-live="polite">
        {annonce}
      </p>
      <div className="dv-ms-outils">
        <label className="dv-ms-recherche">
          <Search size={15} aria-hidden />
          <input type="search" value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder={dire(L, 'mod.chercher')} aria-label={dire(L, 'mod.chercherLibelle')} />
        </label>
        <span className="dv-ms-puces" role="group" aria-label={dire(L, 'mod.secteurs')}>
          {listePuces.map((p) => (
            <button key={p.cle || 'tous'} type="button" className="dv-ms-puce" aria-pressed={secteur === p.cle} onClick={() => setSecteur(p.cle)}>
              {p.cle ? p.libelle : dire(L, 'mod.tous')}
              <em>{p.compte}</em>
            </button>
          ))}
        </span>
      </div>
      <p className="dv-ms-compte">{direCompte(L, 'mod.compte', montres.length)}</p>
      {montres.length === 0 ? (
        <p className="dv-ms-aucun">{tous.length === 0 ? dire(L, 'mod.vide') : dire(L, 'mod.aucun')}</p>
      ) : (
        <div className="dv-ms-grille">
          {montres.map((m) => (
            <button key={m.id} type="button" className="dv-ms-tuile" onClick={() => setOuvert(m)} aria-label={dire(L, 'mod.ouvrir', { nom: m.nom })}>
              <Apercu html={m.html} titre="" />
              <span className="dv-ms-info">
                <span className="dv-ms-ligne">
                  <span className="dv-ms-nom">{m.nom}</span>
                  <span className="dv-mono dv-t4">{poids(m.html)}</span>
                </span>
                <span className="dv-ms-ligne">
                  <span className="dv-ms-etiquettes">
                    {m.etiquettes.map((e) => (
                      <span key={e} className="dv-ms-etiquette" data-ajoute={m.origine === 'ajoute' || undefined}>
                        {m.origine === 'ajoute' ? dire(L, 'mod.etiquetteAjoute') : e}
                      </span>
                    ))}
                  </span>
                  <span className="dv-mono dv-t4">{m.secteur}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      )}

      <Modale ouverte={dialogue} onFermer={() => setDialogue(false)} titre={dire(L, 'mod.ajouterTitre')} taille="grande">
        <form
          className="dv-ms-form"
          onSubmit={(e) => {
            e.preventDefault();
            ajouter();
          }}
        >
          <p className="dv-t3">{dire(L, 'mod.consigne')}</p>
          <div className="dv-ms-deux">
            <label>
              {dire(L, 'mod.nom')}
              <input required maxLength={NOM_MAX} value={saisie.nom} onChange={(e) => setSaisie({ ...saisie, nom: e.target.value })} placeholder={dire(L, 'mod.nomIndicatif')} />
            </label>
            <label>
              {dire(L, 'mod.secteur')}
              <input required maxLength={SECTEUR_MAX} list="dv-ms-secteurs" value={saisie.secteur} onChange={(e) => setSaisie({ ...saisie, secteur: e.target.value })} placeholder={dire(L, 'mod.secteurIndicatif')} />
            </label>
          </div>
          <datalist id="dv-ms-secteurs">
            {listePuces.filter((p) => p.cle).map((p) => (
              <option key={p.cle} value={p.cle} />
            ))}
          </datalist>
          <label>
            {dire(L, 'mod.codeHtml')}
            <textarea required value={saisie.html} onChange={(e) => setSaisie({ ...saisie, html: e.target.value })} placeholder="<!doctype html> ..." />
          </label>
          {faute && <p className="dv-ms-faute">{faute}</p>}
          <span className="dv-ms-actions">
            <Bouton variante="secondaire" type="button" onClick={() => setDialogue(false)}>
              {dire(L, 'commun.annuler')}
            </Bouton>
            <Bouton variante="primaire" type="submit">
              {dire(L, 'mod.enregistrer')}
            </Bouton>
          </span>
        </form>
      </Modale>
    </PageDev>
  );
}
