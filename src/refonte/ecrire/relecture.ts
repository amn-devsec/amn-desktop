import { ms, type Instant } from './commun';

/**
 * « ATTEND UNE RELECTURE » (F20) — la file des documents qui attendent quelqu'un.
 *
 * Un document y est tant que son état est « Brouillon partagé », « Relecture demandée » ou « En signature »
 * (H11 et H12). Triés : ceux où la personne est relectrice d'abord, puis du plus ancien au plus récent.
 * Si Signatures est inactif (métier qui n'utilise que 3 modules), la ligne « signature » disparaît.
 */

export type EtatDeDocument = 'Brouillon partagé' | 'Relecture demandée' | 'En signature' | 'Terminé';

export interface DocumentAttendu {
  id: string;
  titre: string;
  etat: EtatDeDocument;
  /** Qui doit relire (ou signer). */
  relecteurEmail: string | null;
  /** Qui a demandé. */
  demandeurEmail: string;
  demandeAt: Instant;
}

export type EtapeDeFile = 'brouillon' | 'relecture' | 'signature';
export type Segment = 'fait' | 'en-cours' | 'a-venir';

export interface LigneDeRelecture {
  id: string;
  titre: string;
  etape: EtapeDeFile;
  /** `StageBar` : trois segments de 16 × 4 (fait blanc, en cours orange, à venir gris). */
  segments: [Segment, Segment, Segment];
  /** La ligne qui concerne la personne : fond orangé, bouton « Relire » (ou « Signer »). */
  pourMoi: boolean;
  demandeurEmail: string;
  demandeAt: Instant;
}

const ETAPES: Record<Exclude<EtatDeDocument, 'Terminé'>, EtapeDeFile> = {
  'Brouillon partagé': 'brouillon',
  'Relecture demandée': 'relecture',
  'En signature': 'signature',
};

const SEGMENTS: Record<EtapeDeFile, LigneDeRelecture['segments']> = {
  brouillon: ['en-cours', 'a-venir', 'a-venir'],
  relecture: ['fait', 'en-cours', 'a-venir'],
  signature: ['fait', 'fait', 'en-cours'],
};

export interface OptionsFile {
  /** Signatures est-il activé pour ce métier ? Sinon la ligne « signature » disparaît. */
  signaturesActives?: boolean;
}

export function fileDeRelecture(documents: readonly DocumentAttendu[], moi: string, options: OptionsFile = {}): LigneDeRelecture[] {
  const signatures = options.signaturesActives ?? true;
  return documents
    .filter((d): d is DocumentAttendu & { etat: Exclude<EtatDeDocument, 'Terminé'> } => d.etat !== 'Terminé' && (signatures || d.etat !== 'En signature'))
    .map((d): LigneDeRelecture => {
      const etape = ETAPES[d.etat];
      return { id: d.id, titre: d.titre, etape, segments: SEGMENTS[etape], pourMoi: d.relecteurEmail === moi, demandeurEmail: d.demandeurEmail, demandeAt: d.demandeAt };
    })
    .sort((a, b) => Number(b.pourMoi) - Number(a.pourMoi) || ms(a.demandeAt) - ms(b.demandeAt) || a.id.localeCompare(b.id));
}

/** Combien de documents attendent : « 4 documents ». */
export const nbEnAttente = (documents: readonly DocumentAttendu[], options: OptionsFile = {}): number => fileDeRelecture(documents, '', options).length;
