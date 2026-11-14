/**
 * Le prénom à montrer d'après un ou plusieurs noms (profil, compte) : le premier mot du premier nom qui en est un ;
 * jamais une adresse, jamais un mot avec un chiffre. Vide si aucun n'en est un : l'écran se passe alors du prénom.
 */
export function prenomAffichable(...noms: ReadonlyArray<string | null | undefined>): string {
  for (const brut of noms) {
    const mot = (brut ?? '').trim().split(/\s+/)[0] ?? '';
    if (!mot || mot.includes('@') || /\d/.test(mot)) continue;
    return mot;
  }
  return '';
}
