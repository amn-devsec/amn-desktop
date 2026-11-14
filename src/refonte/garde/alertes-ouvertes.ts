import type { GardeRemontee } from '../../shared/garde';
import type { GraviteAlerteAffichee } from './etat';

/**
 * L'ALERTE OUVERTE, UNIFIÉE (LOT-08 ; STATUT §1.8 n° 6) — pure.
 *
 * Trois niveaux affichés, quelle que soit la source :
 *   Critique : `critique`, `critical`
 *   Moyenne  : `haute`, `moyenne`, `normale`, `warning`
 *   Faible   : `faible`, `basse`, `info`
 * Un mot inconnu (une source plus récente) tombe en Moyenne : une alerte qu'on
 * ne sait pas classer ne se range ni en Faible, qui la cacherait, ni en Critique.
 *
 * « Alerte ouverte » = remontées ouvertes de la Garde + incidents non résolus
 * + alertes Cyber non prises en charge. Chaque objet est compté une fois, et sa
 * source est gardée : les remontées qui forment le dossier d'une alerte Cyber
 * ne sont pas recomptées comme remontées de la Garde (l'alerte Cyber EST leur
 * dossier).
 */
export type SourceAlerte = 'garde' | 'incident' | 'cyber';

export interface AlerteOuverte {
  /** Unique, préfixé par la source : `garde:<id>`, `incident:<id>`, `cyber:<id>`. */
  cle: string;
  source: SourceAlerte;
  id: string;
  gravite: GraviteAlerteAffichee;
  orgId: string | null;
  titre: string;
  /** Pour trier : la plus récente d'abord. */
  depuis: string;
}

export function graviteAffichee(brut: string | null | undefined): GraviteAlerteAffichee {
  switch ((brut ?? '').toLowerCase()) {
    case 'critique':
    case 'critical':
      return 'critique';
    case 'faible':
    case 'basse':
    case 'info':
      return 'faible';
    default:
      return 'moyenne';
  }
}

/* Des formes minimales : la fonction n'importe ni le preload ni les bureaux. */
export interface IncidentMin {
  id: string;
  orgId: string | null;
  severity: string;
  status: string;
  titre: string;
  depuis: string;
}
export interface AlerteCyberMin {
  id: string;
  gravite: string;
  orgId: string | null;
  titre: string;
  depuis: string;
  statut: 'ouverte' | 'prise';
  /** Les remontées du dossier : elles sont déjà comptées dans cette alerte. */
  remonteesDuDossier: readonly string[];
}

export interface SourcesAlertes {
  remontees: readonly GardeRemontee[];
  incidents: readonly IncidentMin[];
  cyber: readonly AlerteCyberMin[];
}

export interface BilanAlertes {
  total: number;
  parGravite: Record<GraviteAlerteAffichee, number>;
  parSource: Record<SourceAlerte, number>;
  alertes: AlerteOuverte[];
}

const RANG: Record<GraviteAlerteAffichee, number> = { critique: 0, moyenne: 1, faible: 2 };

export function alertesOuvertes(s: SourcesAlertes, orgId?: string): BilanAlertes {
  const dansDossier = new Set<string>();
  for (const c of s.cyber) for (const r of c.remonteesDuDossier) dansDossier.add(r);

  const vues = new Set<string>();
  const out: AlerteOuverte[] = [];
  const ajouter = (a: AlerteOuverte) => {
    if (vues.has(a.cle) || (orgId !== undefined && a.orgId !== orgId)) return;
    vues.add(a.cle);
    out.push(a);
  };

  for (const r of s.remontees) {
    if (r.etat !== 'ouverte' || dansDossier.has(r.id)) continue;
    ajouter({ cle: `garde:${r.id}`, source: 'garde', id: r.id, gravite: graviteAffichee(r.gravite), orgId: r.orgId, titre: r.titre, depuis: r.createdAt });
  }
  for (const i of s.incidents) {
    if (i.status === 'resolved') continue;
    ajouter({ cle: `incident:${i.id}`, source: 'incident', id: i.id, gravite: graviteAffichee(i.severity), orgId: i.orgId, titre: i.titre, depuis: i.depuis });
  }
  for (const c of s.cyber) {
    if (c.statut !== 'ouverte') continue;
    ajouter({ cle: `cyber:${c.id}`, source: 'cyber', id: c.id, gravite: graviteAffichee(c.gravite), orgId: c.orgId, titre: c.titre, depuis: c.depuis });
  }

  out.sort((a, b) => RANG[a.gravite] - RANG[b.gravite] || b.depuis.localeCompare(a.depuis) || a.cle.localeCompare(b.cle));
  const parGravite = { critique: 0, moyenne: 0, faible: 0 };
  const parSource = { garde: 0, incident: 0, cyber: 0 };
  for (const a of out) {
    parGravite[a.gravite] += 1;
    parSource[a.source] += 1;
  }
  return { total: out.length, parGravite, parSource, alertes: out };
}
