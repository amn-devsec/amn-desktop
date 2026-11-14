import React, { useMemo, useState } from "react";
import { CalendarClock, Check, Minus, Rocket, X } from "lucide-react";
import {
  Bouton,
  DialogueConfirmation,
  PastilleEtat,
  type EtatPastille,
} from "../../socle/ui";
import {
  CarteDev,
  PageDev,
  Point,
  SuggestionDev,
  ABrancher,
  useLectureSeule,
  type TonPoint,
} from "./briques";
import {
  dateCourte,
  dateEtHeure,
  formaterDuree,
  ms,
  quandRelatif,
} from "./commun";
import {
  dureeEtape,
  enLigne,
  etapeCourante,
  etatGlobal,
  historique,
  nomCible,
  nomEtape,
  parJour,
  pastille,
  planifies as planifiesAVenir,
  quandEtQui,
  resumeSemaine,
  versionDeRetour,
  dureeTotale,
  type Cible,
  type Deploiement,
  type EtatEtape,
} from "./deploiements";
import { useDonneesDeveloppement, type DonneesDeveloppement } from "./donnees";
import { dire, direCompte } from "./i18n";

/**
 * DEV-deploiements · DÉPLOIEMENTS — fiche `docs/refonte/fiches/LOT-11/DEV-deploiements.md`, image `DEV-deploiements.png`.
 *
 * Le dernier déploiement étape par étape, l'historique avec « Revenir », les planifiés, les déploiements par jour,
 * ce qui est en ligne maintenant et l'aide d'Ajmani sur un échec. Les règles : `deploiements.ts`.
 * « Revenir » : une ligne de confirmation partout, sauf sur l'Aperçu (Harun, 12 nov. ; STATUT §1.23). La cible
 * « Interne » reste inerte (aucune distribution). Rien ne se met en ligne tant que le connecteur Hébergement
 * (LOT-12) n'est pas branché : les actions le disent au lieu de faire semblant.
 */

const L = "fr" as const;
const ICONE_ETAPE: Record<EtatEtape, React.ReactNode> = {
  reussie: <Check size={15} strokeWidth={2.6} />,
  echouee: <X size={15} strokeWidth={2.6} />,
  "en-cours": <span className="dv-dp-rond__pulse" />,
  sautee: <Minus size={15} strokeWidth={2.6} />,
  "a-venir": null,
};

const ETAT_PASTILLE: Record<string, EtatPastille> = {
  reussi: "succes",
  echec: "critique",
  "en-cours": "info",
  annule: "neutre",
  "en-attente": "neutre",
};
const TON_POINT: Record<string, TonPoint> = {
  reussi: "succes",
  echec: "critique",
  "en-cours": "info",
  annule: "neutre",
  "en-attente": "neutre",
};
const CLE_ETAT: Record<string, Parameters<typeof dire>[1]> = {
  reussi: "deps.etat.reussi",
  echec: "deps.etat.echec",
  "en-cours": "deps.etat.enCours",
  annule: "deps.etat.annule",
  "en-attente": "deps.etat.attente",
};

export default function Deploiements() {
  return <DeploiementsDev d={useDonneesDeveloppement()} />;
}

/** La vue seule, sur des données passées (l'enveloppe ci-dessus, un aperçu, un essai). */
export function DeploiementsDev({ d }: { d: DonneesDeveloppement }) {
  const m = d.maintenant;
  const branche = d.source === "exemple";
  const [aRevenir, setARevenir] = useState<Deploiement | null>(null);
  const [annonce, setAnnonce] = useState("");
  const [choisi, setChoisi] = useState<string | null>(null);
  const lectureSeule = useLectureSeule();

  const vue = useMemo(() => {
    const deps = d.deploiements as unknown as Deploiement[];
    const histo = historique(deps, m, 4);
    const dernier = histo[0] ?? null;
    const echec =
      deps
        .filter((x) => etatGlobal(x) === "echec" && ms(x.lanceA) <= m)
        .sort((a, b) => ms(b.lanceA) - ms(a.lanceA))[0] ?? null;
    return {
      deps,
      histo,
      dernier,
      echec,
      semaine: resumeSemaine(deps, m, L),
      jours: parJour(deps, m, 14, L),
      enLigne: enLigne(deps, m, L).slice(0, 4),
      planifies: planifiesAVenir(
        d.planifies.map((p) => ({
          id: p.id,
          depot: p.depot,
          quoi: p.quoi,
          cible: p.cible,
          a: p.prevuA,
        })),
        m,
        L,
      ),
    };
  }, [d, m]);

  const revenir = (x: Deploiement) => {
    if (!branche) return;
    if (x.cible === "apercu") {
      lancerRetour(x);
      return;
    }
    setARevenir(x);
  };
  const lancerRetour = (x: Deploiement) => {
    setARevenir(null);
    // Aucun hébergement branché : la page le dit, elle ne fait pas semblant d'avoir mis en ligne.
    setAnnonce(
      dire(L, "deps.exempleSansEffet", { cible: nomCible(x.cible, L) }),
    );
  };

  const maxJour = Math.max(1, ...vue.jours.map((j) => j.total));
  const sous = branche
    ? `${vue.semaine.texte} · ${dire(L, "deps.sousFin")}`
    : dire(L, "deps.brancher.titre");
  const infobulleAttente = dire(L, "deps.attenteHebergement");
  const versionRetour = aRevenir ? versionDeRetour(vue.deps, aRevenir) : null;

  return (
    <PageDev
      titre={dire(L, "deps.titre")}
      sousTitre={sous}
      source={d.source}
      secondaires={[
        {
          libelle: dire(L, "deps.planifier"),
          icone: <CalendarClock size={15} />,
          disabled: true,
          infobulle: infobulleAttente,
        },
      ]}
      primaire={{
        libelle: dire(L, "deps.deployer"),
        icone: <Rocket size={15} />,
        disabled: true,
        infobulle: infobulleAttente,
      }}
    >
      <p className="dv-annonce" role="status" aria-live="polite">
        {annonce}
      </p>
      {!branche ? (
        <CarteDev>
          <ABrancher
            icone={<Rocket size={20} />}
            titre={dire(L, "deps.brancher.titre")}
            texte={dire(L, "deps.brancher.texte")}
          />
        </CarteDev>
      ) : !vue.dernier ? (
        <CarteDev>
          <ABrancher
            icone={<Rocket size={20} />}
            titre={dire(L, "deps.titre")}
            texte={dire(L, "deps.vide")}
          />
        </CarteDev>
      ) : (
        <>
          <CarteDev
            className="dv-dp-dernier"
            rang={0}
            libelle={dire(L, "deps.etapes")}
          >
            <header className="dv-dp-dernier__tete">
              <span className="dv-dp-tuile" aria-hidden>
                <Rocket size={17} />
              </span>
              <span className="dv-dp-dernier__titres">
                <span className="dv-dp-dernier__titre">
                  <b className="dv-mono">{vue.dernier.depot}</b>{" "}
                  {dire(L, "deps.versCible", {
                    cible: nomCible(vue.dernier.cible, L),
                  })}
                </span>
                <span className="dv-t4">
                  {dire(L, "deploiement.lancePar", {
                    branche: vue.dernier.branche,
                    qui: vue.dernier.par,
                    quand: quandRelatif(vue.dernier.lanceA, m, L),
                  })}
                </span>
              </span>
              <PastilleEtat etat={ETAT_PASTILLE[etatGlobal(vue.dernier)]}>
                {pastille(vue.dernier, L).texte}
              </PastilleEtat>
            </header>
            <ol className="dv-dp-frise">
              {vue.dernier.etapes.map((e, i) => (
                <li key={e.etape} className="dv-dp-etape" data-etat={e.etat}>
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="dv-dp-lien"
                      data-fait={e.etat !== "a-venir" || undefined}
                    />
                  )}
                  <span className="dv-dp-rond" aria-hidden>
                    {ICONE_ETAPE[e.etat]}
                  </span>
                  <span className="dv-dp-etape__nom">
                    {nomEtape(e.etape, L)}
                  </span>
                  <span className="dv-dp-etape__duree dv-t4">
                    {formaterDuree(dureeEtape(e, m) ?? Number.NaN)}
                  </span>
                </li>
              ))}
            </ol>
          </CarteDev>

          <div className="dv-dp-corps">
            <div className="dv-dp-gauche">
              <CarteDev
                className="dv-dp-historique"
                titre={dire(L, "deps.historique")}
                droite={direCompte(L, "deps.derniers", vue.histo.length)}
                rang={1}
              >
                <table className="dv-dp-table">
                  <thead>
                    <tr>
                      <th scope="col" aria-label={dire(L, "deps.col.etat")} />
                      <th scope="col">{dire(L, "deps.col.projet")}</th>
                      <th scope="col">{dire(L, "deps.col.cible")}</th>
                      <th scope="col">{dire(L, "deps.col.etat")}</th>
                      <th scope="col">{dire(L, "deps.col.duree")}</th>
                      <th scope="col">{dire(L, "deps.col.quand")}</th>
                      <th scope="col" aria-label={dire(L, "deps.revenir")} />
                    </tr>
                  </thead>
                  <tbody>
                    {vue.histo.map((x) => {
                      const etat = etatGlobal(x);
                      const qq = quandEtQui(x, m, L);
                      const retour = versionDeRetour(vue.deps, x);
                      return (
                        <tr
                          key={x.id}
                          data-choisi={choisi === x.id || undefined}
                        >
                          <td>
                            <Point ton={TON_POINT[etat]} />
                          </td>
                          <td>
                            <span className="dv-mono dv-dp-table__depot">
                              {x.depot}
                            </span>
                            <span className="dv-t4 dv-dp-table__sous">
                              {x.quoi ? `${x.branche} · ${x.quoi}` : x.branche}
                            </span>
                          </td>
                          <td className="dv-t2">{nomCible(x.cible, L)}</td>
                          <td>
                            <PastilleEtat etat={ETAT_PASTILLE[etat]}>
                              {dire(L, CLE_ETAT[etat])}
                            </PastilleEtat>
                          </td>
                          <td className="dv-t2">
                            {formaterDuree(dureeTotale(x, m) ?? Number.NaN)}
                          </td>
                          <td>
                            <span className="dv-t2 dv-dp-table__quand">
                              {qq.quand}
                            </span>
                            <span className="dv-t4 dv-dp-table__sous">
                              {qq.qui}
                            </span>
                          </td>
                          <td className="dv-dp-table__action">
                            {!lectureSeule && (
                              <span
                                title={
                                  retour
                                    ? undefined
                                    : dire(L, "deploiement.aucunRetour")
                                }
                              >
                                <Bouton
                                  variante="secondaire"
                                  taille="petit"
                                  disabled={!retour || etat === "en-cours"}
                                  onClick={() => revenir(x)}
                                >
                                  {dire(L, "deps.revenir")}
                                </Bouton>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CarteDev>
              <CarteDev
                className="dv-dp-planifies"
                titre={dire(L, "deps.planifies")}
                droite={vue.planifies.texte}
                rang={2}
              >
                <ul className="dv-dp-planifies__liste">
                  {vue.planifies.aVenir.slice(0, 2).map((p) => (
                    <li key={p.id} className="dv-dp-planifie">
                      <span className="dv-dp-calendrier" aria-hidden>
                        <CalendarClock size={13} />
                      </span>
                      <span className="dv-t3 dv-dp-planifie__date">
                        {dateEtHeure(p.a, L)}
                      </span>
                      <span className="dv-dp-planifie__quoi">
                        <b className="dv-mono">{p.depot}</b> ·{" "}
                        <span className="dv-t3">{p.quoi}</span>
                      </span>
                      <PastilleEtat etat="info">
                        {nomCible(p.cible as Cible, L)}
                      </PastilleEtat>
                    </li>
                  ))}
                </ul>
              </CarteDev>
            </div>

            <div className="dv-dp-droite">
              <CarteDev
                className="dv-dp-jours"
                titre={dire(L, "deps.parJour")}
                droite={dire(L, "deps.quatorze")}
                rang={3}
              >
                <span
                  className="dv-dp-barres"
                  role="img"
                  aria-label={`${dire(L, "deps.parJourLibelle")} : ${vue.jours.map((j) => `${j.libelle} ${j.total}`).join(", ")}`}
                >
                  {vue.jours.map((j) => (
                    <span
                      key={j.jour}
                      className="dv-dp-barre"
                      data-echec={j.echec || undefined}
                      style={{
                        height: `${Math.max(6, Math.round((j.total / maxJour) * 100))}%`,
                      }}
                      title={`${j.libelle} : ${j.total}`}
                    />
                  ))}
                </span>
                <span className="dv-dp-jours__reperes dv-t4">
                  <span>{vue.jours[0]?.libelle}</span>
                  <span>{vue.jours[vue.jours.length - 1]?.libelle}</span>
                </span>
              </CarteDev>
              <CarteDev
                className="dv-dp-enligne"
                titre={dire(L, "deps.enLigne")}
                rang={4}
              >
                {vue.enLigne.length === 0 ? (
                  <p className="dv-vide-ligne">{dire(L, "deps.enLigneVide")}</p>
                ) : (
                  <ul className="dv-dp-enligne__liste">
                    {vue.enLigne.map((x) => (
                      <li key={`${x.depot}:${x.cible}`}>
                        <Point ton="succes" />
                        <span className="dv-dp-enligne__nom">
                          {x.depot} · {nomCible(x.cible, L)}
                        </span>
                        <span className="dv-mono dv-t4">{x.age}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CarteDev>
              {vue.echec ? (
                <SuggestionDev
                  className="dv-dp-suggestion"
                  texte={dire(L, "deps.suggestion", {
                    depot: vue.echec.depot,
                    cible: nomCible(vue.echec.cible, L),
                    etape: nomEtape(etapeCourante(vue.echec) ?? "tests", L),
                  })}
                  action={dire(L, "deps.voirJournal")}
                  onAction={() => setChoisi(vue.echec?.id ?? null)}
                />
              ) : (
                <SuggestionDev
                  className="dv-dp-suggestion"
                  texte={dire(L, "deps.astuce")}
                  action={dire(L, "deps.planifier")}
                  onAction={() => setAnnonce(infobulleAttente)}
                />
              )}
            </div>
          </div>
        </>
      )}

      <DialogueConfirmation
        ouvert={aRevenir !== null}
        onAnnuler={() => setARevenir(null)}
        onConfirmer={() => aRevenir && lancerRetour(aRevenir)}
        titre={
          aRevenir
            ? dire(L, "deps.revenirConfirm", {
                date: versionRetour ? dateCourte(versionRetour.lanceA, L) : "",
                cible: nomCible(aRevenir.cible, L),
              })
            : ""
        }
        texte={dire(L, "deps.revenirTexte")}
        libelleAction={dire(L, "deps.revenir")}
        recuperable
      />
    </PageDev>
  );
}
