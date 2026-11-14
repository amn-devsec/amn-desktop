/** « octobre » (ou « octobre 2025 » au-delà d'un an), dans la langue donnée, pour « Client depuis … » (`aaaa-mm`). */
export function moisCourt(aaaaMm: string, langue: 'fr' | 'en', avecAnnee: boolean): string {
  const [a, m] = aaaaMm.split('-').map(Number);
  const d = new Date(Date.UTC(a, m - 1, 1));
  return new Intl.DateTimeFormat(langue === 'fr' ? 'fr-FR' : 'en-GB', avecAnnee ? { month: 'long', year: 'numeric', timeZone: 'UTC' } : { month: 'long', timeZone: 'UTC' }).format(d);
}
