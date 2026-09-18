// Auto-formatage du numéro de téléphone local pendant la saisie, en suivant
// le gabarit "example" du pays sélectionné (ex. '9XX-XXX-XXX' pour l'Angola).
// N'affecte jamais la validation : validateLocalPhone retire les séparateurs
// avant de vérifier quoi que ce soit, ce formatage est purement visuel.
//
// Principe : chaque caractère alphanumérique du gabarit (9, X...) représente
// un chiffre saisi par l'utilisateur ; chaque caractère non-alphanumérique
// (espace, tiret) est un séparateur inséré automatiquement, seulement s'il
// reste au moins un chiffre à placer après lui (pour ne jamais laisser un
// tiret ou une espace "en trop" à la fin pendant que l'utilisateur tape).
export function formatLocalPhone(raw: string, example: string): string {
  const digits = raw.replace(/\D/g, '')
  let out = ''
  let digitIndex = 0

  for (const ch of example) {
    const isPlaceholder = /[A-Za-z0-9]/.test(ch)
    if (isPlaceholder) {
      if (digitIndex >= digits.length) break
      out += digits[digitIndex]
      digitIndex++
    } else if (digitIndex < digits.length) {
      out += ch
    }
  }

  return out
}
