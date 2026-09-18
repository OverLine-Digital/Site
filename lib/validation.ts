// Validation stricte des champs du formulaire de projet.
// Chaque règle renvoie un message d'erreur (string) ou null si le champ est valide.

import { africanCountries, type AfricanCountry } from './african-countries'

// --- Aides internes partagées par les 3 validateurs de téléphone ci-dessous ---
// (évite de dupliquer la même regex et le même nettoyage à 3 endroits).
const E164_RE = /^\+[1-9]\d{6,14}$/
const stripSeparators = (v: string) => v.replace(/[\s().-]/g, '')
const hasLetters = (v: string) => /[a-zA-Z]/.test(v)

// Indicatifs internationaux RÉELLEMENT attribués par l'UIT (norme E.164),
// hors codes non-géographiques (satellite, services partagés...). Sans
// cette liste, un numéro WhatsApp du type "+9999999999" passait la
// validation (forme générale correcte) même si "999" n'est attribué à
// AUCUN pays — l'ancien code ne vérifiait le préfixe en détail que pour les
// 27 pays africains listés dans african-countries.ts, et laissait passer
// n'importe quoi d'autre sans aucune vérification. Source : liste UIT E.164
// (Wikipédia, vérifiée), pas une supposition.
const KNOWN_DIAL_PREFIXES = new Set([
  // 1 chiffre
  '1', '7',
  // 2 chiffres
  '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49',
  '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66',
  '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98',
  // 3 chiffres
  '211', '212', '213', '216', '218', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229',
  '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244',
  '245', '246', '247', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '260',
  '261', '262', '263', '264', '265', '266', '267', '268', '269', '290', '291', '297', '298', '299',
  '350', '351', '352', '353', '354', '355', '356', '357', '358', '359',
  '370', '371', '372', '373', '374', '375', '376', '377', '378', '379',
  '380', '381', '382', '383', '385', '386', '387', '389',
  '420', '421', '423',
  '500', '501', '502', '503', '504', '505', '506', '507', '508', '509',
  '590', '591', '592', '593', '594', '595', '596', '597', '598', '599',
  '670', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '685', '686',
  '687', '688', '689', '690', '691', '692',
  '850', '852', '853', '855', '856', '880', '886',
  '960', '961', '962', '963', '964', '965', '966', '967', '968', '970', '971', '972', '973', '974', '975',
  '976', '977', '992', '993', '994', '995', '996', '998',
])

// Vérifie que les chiffres après le "+" commencent par un indicatif
// international réellement attribué (1, 2 ou 3 chiffres selon le pays).
function hasKnownDialPrefix(digitsAfterPlus: string): boolean {
  return (
    KNOWN_DIAL_PREFIXES.has(digitsAfterPlus.slice(0, 3)) ||
    KNOWN_DIAL_PREFIXES.has(digitsAfterPlus.slice(0, 2)) ||
    KNOWN_DIAL_PREFIXES.has(digitsAfterPlus.slice(0, 1))
  )
}

export function validateFullName(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Le nom complet est obligatoire.'
  const words = trimmed.split(/\s+/).filter(Boolean)
  if (words.length < 2) return 'Merci d\u2019indiquer votre prénom et votre nom.'
  if (/\d/.test(trimmed)) return 'Le nom ne doit pas contenir de chiffres.'
  return null
}

export function validateEmail(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'L\u2019email est obligatoire.'
  // doit contenir un @ et un . après le @ (domaine valide)
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  if (!re.test(trimmed)) return 'Adresse email invalide (doit contenir @ et un domaine).'
  return null
}

// Valide la partie locale du numéro (saisie sans l'indicatif pays).
// Rejette explicitement toute lettre au lieu de la supprimer silencieusement,
// vérifie que le nombre de chiffres correspond au pays sélectionné, et surtout
// vérifie que le numéro commence par un vrai préfixe mobile de ce pays
// (ex. 888888888 a 9 chiffres mais n'est un préfixe d'aucun opérateur angolais).
export function validateLocalPhone(value: string, expectedDigits?: number, country?: AfricanCountry): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Le numéro de téléphone est obligatoire.'
  if (hasLetters(trimmed)) return 'Le numéro ne doit contenir aucune lettre.'
  const cleaned = stripSeparators(trimmed)
  if (!/^\d+$/.test(cleaned)) return 'Le numéro ne doit contenir que des chiffres.'
  if (expectedDigits && cleaned.length !== expectedDigits) {
    return `Ce pays attend ${expectedDigits} chiffres (${cleaned.length} saisis pour l\u2019instant).`
  }
  if (country && !country.pattern.test(cleaned)) {
    return `Ce numéro ne correspond à aucun préfixe mobile valide pour ${country.name} (ex. ${country.example}).`
  }
  return null
}

// Valide le numéro WhatsApp complet (avec indicatif pays saisi par l'utilisateur).
// Rejette les lettres et vérifie, quand l'indicatif correspond à un pays connu,
// que le nombre de chiffres locaux ET le préfixe correspondent bien à ce pays.
export function validateWhatsapp(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'Le WhatsApp est obligatoire.'
  if (hasLetters(trimmed)) return 'Le numéro ne doit contenir aucune lettre.'
  const cleaned = stripSeparators(trimmed)
  if (!E164_RE.test(cleaned)) {
    return 'Le numéro doit commencer par l\u2019indicatif pays (ex. +244 9XX-XXX-XXX).'
  }
  const digitsAfterPlus = cleaned.slice(1)
  if (!hasKnownDialPrefix(digitsAfterPlus)) {
    return "Cet indicatif pays n'existe pas. Vérifiez le numéro (ex. +244 pour l'Angola)."
  }
  const country = [...africanCountries]
    .sort((a, b) => b.dial.length - a.dial.length)
    .find((c) => cleaned.startsWith(c.dial))
  if (country) {
    const localDigits = cleaned.slice(country.dial.length)
    if (localDigits.length !== country.digits) {
      return `${country.name} (${country.dial}) attend ${country.digits} chiffres (${localDigits.length} saisis).`
    }
    if (!country.pattern.test(localDigits)) {
      return `Ce numéro ne correspond à aucun préfixe mobile valide pour ${country.name} (ex. ${country.dial} ${country.example}).`
    }
  }
  return null
}

export function validateDescription(value: string, min = 50): string | null {
  const trimmed = value.trim()
  if (trimmed.length < min) {
    return `Minimum ${min} caractères (${trimmed.length}/${min} pour l\u2019instant).`
  }
  return null
}

export function validateCompany(value: string, required: boolean): string | null {
  if (!required) return null
  const trimmed = value.trim()
  if (!trimmed) return 'Le nom de l\u2019entreprise est obligatoire.'
  return null
}

export function validateRequired(value: string | null, label: string): string | null {
  if (!value || !value.trim()) return `${label} est obligatoire.`
  return null
}

// Génère un identifiant de projet public, ex. OverLine-ID-20-26-482134
export function generateProjectId(): string {
  const year = new Date().getFullYear().toString()
  const yearPart = `${year.slice(0, 2)}-${year.slice(2, 4)}`
  const num = Math.floor(100000 + Math.random() * 900000)
  return `OverLine-ID-${yearPart}-${num}`
}
