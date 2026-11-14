import { dateCourte, jourDe, partiesParis, quandRelatif, ms, type Instant, type Langue } from '../../commun';
import { avancementDuCircuit, delaiMoyenDeSignature, enAttenteDeSignature, etapeDeSignataire, etatDeDemande, pisteDePreuve, planDeRelance, segmentsDeTicket, type DemandeMin, type SignataireMin } from '../../signatures';
import { libelleDeDemande, sousTitreDeSignatures } from '../../phrases';
import { traduire } from './i18n';
import type { SignataireVue, TicketVue, TraceVue, VueSignaturesProps } from './VueSignatures';

/**
 * H12 — COMPOSER LA VUE de Signatures : les tickets, le circuit, la relance préparée, la preuve conservée. Logique pure :
 * les règles viennent de `../../signatures.ts` et `../../phrases.ts`.
 */

export interface SignataireAffiche extends SignataireMin {
  nom: string;
  fonction: string;
}
export interface DemandeAffichee extends Omit<DemandeMin, 'signataires'> {
  titre: string;
  client: string;
  signataires: readonly SignataireAffiche[];
  /** Instants des relances automatiques déjà parties pour le signataire en cours. */
  relancesEnvoyees: readonly Instant[];
  /** Le texte de la relance préparée : il part chez un client, il reste au vouvoiement (écrit par la personne ou son modèle). */
  texteDeRelance?: string | null;
}
export interface EntreesSignatures {
  langue: Langue;
  maintenant: Instant;
  demandes: readonly DemandeAffichee[];
  choisie: string | null;
  relanceActive: boolean;
}

const heure = (at: Instant): string => {
  const m = partiesParis(at).minutes;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};
const quand = (at: Instant, l: Langue): string => `${dateCourte(jourDe(at), l)} ${heure(at)}`;

function ticket(d: DemandeAffichee, e: EntreesSignatures): TicketVue {
  const etat = etatDeDemande(d);
  const l = e.langue;
  const vus = d.signataires.filter((s) => s.role === 'signataire');
  const courant = vus.find((s) => s.statut !== 'Signé');
  const derniereSignature = vus.map((s) => s.signeAt).filter((x): x is Instant => !!x).sort((a, b) => ms(b) - ms(a))[0];
  let libelle: string;
  let ton: TicketVue['etat']['ton'] = 'neutre';
  if (etat === 'Signée') {
    libelle = l === 'fr' ? `Signé le ${dateCourte(jourDe(derniereSignature), l)}` : `Signed on ${dateCourte(jourDe(derniereSignature), l)}`;
    ton = 'succes';
  } else if (etat === 'Vue' && courant?.ouvertAt) {
    libelle = l === 'fr' ? `Ouvert ${quandRelatif(courant.ouvertAt, e.maintenant, l)}` : `Opened ${quandRelatif(courant.ouvertAt, e.maintenant, l)}`;
    ton = 'attention';
  } else if (etat === 'Envoyée' && d.envoyeAt) {
    libelle = l === 'fr' ? `Envoyé ${quandRelatif(d.envoyeAt, e.maintenant, l)}` : `Sent ${quandRelatif(d.envoyeAt, e.maintenant, l)}`;
  } else libelle = libelleDeDemande(etat, l);
  return { id: d.id, titre: d.titre, client: d.client, etat: { libelle, ton }, segments: segmentsDeTicket(d as unknown as DemandeMin), actif: d.id === e.choisie };
}

export function composerSignatures(e: EntreesSignatures): Pick<VueSignaturesProps, 'sousTitre' | 'tickets' | 'circuit' | 'relance' | 'preuve'> {
  const l = e.langue;
  const aujourdhui = jourDe(e.maintenant);
  const demandes = e.demandes as unknown as readonly DemandeMin[];
  const delai = delaiMoyenDeSignature(demandes, new Date(ms(e.maintenant) - 90 * 86_400_000).toISOString(), e.maintenant);
  const d = e.demandes.find((x) => x.id === e.choisie) ?? null;
  const tickets = e.demandes.map((x) => ticket(x, e));

  let circuit: VueSignaturesProps['circuit'] = null;
  let relance: VueSignaturesProps['relance'] = null;
  let preuve: VueSignaturesProps['preuve'] = null;
  if (d) {
    const av = avancementDuCircuit(d as unknown as DemandeMin);
    const premierNonSigne = d.signataires.filter((s) => s.role === 'signataire').find((s) => s.statut !== 'Signé');
    const signataires: SignataireVue[] = d.signataires
      .filter((s) => s.role === 'signataire')
      .map((s) => {
        const etape = etapeDeSignataire(s);
        const badge = etape === 'signe' ? { libelle: traduire(l, 'etat.signe'), ton: 'succes' as const } : etape === 'refuse' ? { libelle: traduire(l, 'etat.refuse'), ton: 'neutre' as const } : { libelle: traduire(l, 'etat.aSigner'), ton: 'attention' as const };
        return {
          id: s.id,
          nom: s.nom,
          role: s.fonction,
          badge,
          etapes: [
            { libelle: traduire(l, 'etape.envoye'), quand: s.envoyeAt ? quand(s.envoyeAt, l) : '', fait: !!s.envoyeAt },
            { libelle: traduire(l, 'etape.ouvert'), quand: s.ouvertAt ? quand(s.ouvertAt, l) : '', fait: !!s.ouvertAt },
            { libelle: traduire(l, 'etape.signe'), quand: s.signeAt ? heure(s.signeAt) : traduire(l, 'etat.enAttente'), fait: !!s.signeAt },
          ],
        };
      });
    const copie = d.signataires.find((s) => s.role === 'copie');
    circuit = {
      titre: l === 'fr' ? 'Circuit de signature' : 'Signature circuit',
      sous: traduire(l, 'circuit.sous'),
      progression: traduire(l, 'circuit.progression', { a: av.signes, b: av.total }),
      pourcent: av.rapport,
      signataires,
      copie: copie ? { nom: copie.nom, role: `${copie.fonction}, ${traduire(l, 'role.copie')}`, note: traduire(l, 'copie.note') } : null,
    };
    const plan = planDeRelance(d as unknown as DemandeMin, d.relancesEnvoyees, aujourdhui);
    if (plan.prochaine !== null && premierNonSigne && d.texteDeRelance) {
      const p = partiesParis(new Date(plan.prochaine).toISOString());
      relance = {
        quand: traduire(l, 'relance.sous', { quand: `${dateCourte(p.jour, l)}, ${Math.floor(p.minutes / 60)}:${String(p.minutes % 60).padStart(2, '0')}`, n: plan.rang ?? 1, max: 3 }),
        active: e.relanceActive,
        texte: d.texteDeRelance,
        relancer: traduire(l, 'relance.relancer', { nom: premierNonSigne.nom.split(' ')[0] }),
        modifier: traduire(l, 'relance.modifier'),
        prepare: traduire(l, 'relance.prepare'),
      };
    }
    const noms = new Map(d.signataires.map((s) => [s.id, s.nom.split(' ')[0]]));
    const traces: TraceVue[] = pisteDePreuve(d as unknown as DemandeMin).slice(0, 6).map((t) => ({ quand: quand(t.at, l), genre: traduire(l, `trace.${t.genre}` as never), qui: noms.get(t.signataireId) ?? '' }));
    preuve = traces.length ? { entete: traduire(l, 'preuve.entete'), sous: traduire(l, 'preuve.sous'), lien: traduire(l, 'preuve.lien'), traces } : null;
  }
  return { sousTitre: sousTitreDeSignatures(enAttenteDeSignature(demandes, aujourdhui), delai, l), tickets, circuit, relance, preuve };
}
