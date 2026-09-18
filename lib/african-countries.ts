// Indicatifs téléphoniques des pays africains, avec format d'exemple local
// et le nombre de chiffres attendu après l'indicatif (utilisé pour valider
// que le numéro respecte la longueur propre à chaque pays).

export type AfricanCountry = {
  code: string // code ISO2, ex. 'AO'
  name: string
  dial: string // ex. '+244'
  flag: string // emoji drapeau, dérivé du code ISO2 (ex. '🇦🇴')
  example: string // format d'exemple du numéro local, ex. '9XX-XXX-XXX'
  digits: number // nombre de chiffres attendus après l'indicatif
  // Regex validant le numéro local (avec le nombre de chiffres attendu déjà inclus).
  // Vérifie que le numéro commence par un préfixe mobile réellement utilisé dans le
  // pays, pas seulement le bon nombre de chiffres (ex. 888888888 n'est valide pour
  // aucun opérateur angolais même s'il fait 9 chiffres).
  pattern: RegExp
}

export const africanCountries: AfricanCountry[] = [
  // Angola : Unitel/Movicel/Africell = 9X, préfixes en usage 92/93/94/95/97.
  { code: 'AO', name: 'Angola', dial: '+244', flag: '🇦🇴', example: '9XX-XXX-XXX', digits: 9, pattern: /^9[23457]\d{7}$/ },
  // Congo-Brazzaville : mobile = 0 + 4 (Airtel), 5 (Airtel/Zain), ou 6 (MTN).
  { code: 'CG', name: 'Congo-Brazzaville', dial: '+242', flag: '🇨🇬', example: 'XX-XXX-XXXX', digits: 9, pattern: /^0[456]\d{7}$/ },
  // RDC : mobile = 8X (Vodacom/Orange/Africell) ou 9X (Airtel/Orange).
  { code: 'CD', name: 'Congo-Kinshasa (RDC)', dial: '+243', flag: '🇨🇩', example: '9XX-XXX-XXX', digits: 9, pattern: /^[89]\d{8}$/ },
  // Cameroun : tous les mobiles commencent par 6.
  { code: 'CM', name: 'Cameroun', dial: '+237', flag: '🇨🇲', example: '6XX-XXX-XXX', digits: 9, pattern: /^6\d{8}$/ },
  { code: 'GA', name: 'Gabon', dial: '+241', flag: '🇬🇦', example: 'X-XX-XX-XX-XX', digits: 9, pattern: /^0[1-7]\d{7}$/ },
  // Côte d'Ivoire : plan à 10 chiffres depuis 2021, tout numéro commence par 0.
  { code: 'CI', name: "Côte d'Ivoire", dial: '+225', flag: '🇨🇮', example: 'XX-XX-XX-XX-XX', digits: 10, pattern: /^0[1456789]\d{8}$/ },
  // Sénégal : mobile = 70/75/76/77/78.
  { code: 'SN', name: 'Sénégal', dial: '+221', flag: '🇸🇳', example: '7X-XXX-XX-XX', digits: 9, pattern: /^7[05678]\d{7}$/ },
  { code: 'ML', name: 'Mali', dial: '+223', flag: '🇲🇱', example: 'XX-XX-XX-XX', digits: 8, pattern: /^[5-9]\d{7}$/ },
  { code: 'BF', name: 'Burkina Faso', dial: '+226', flag: '🇧🇫', example: 'XX-XX-XX-XX', digits: 8, pattern: /^[5-7]\d{7}$/ },
  { code: 'BJ', name: 'Bénin', dial: '+229', flag: '🇧🇯', example: 'XX-XX-XX-XX', digits: 8, pattern: /^[4569]\d{7}$/ },
  { code: 'TG', name: 'Togo', dial: '+228', flag: '🇹🇬', example: 'XX-XX-XX-XX', digits: 8, pattern: /^[79]\d{7}$/ },
  { code: 'NE', name: 'Niger', dial: '+227', flag: '🇳🇪', example: 'XX-XX-XX-XX', digits: 8, pattern: /^[89]\d{7}$/ },
  { code: 'TD', name: 'Tchad', dial: '+235', flag: '🇹🇩', example: 'XX-XX-XX-XX', digits: 8, pattern: /^[679]\d{7}$/ },
  { code: 'GN', name: 'Guinée', dial: '+224', flag: '🇬🇳', example: 'XXX-XX-XX-XX', digits: 9, pattern: /^6\d{8}$/ },
  { code: 'MA', name: 'Maroc', dial: '+212', flag: '🇲🇦', example: 'X-XX-XX-XX-XX', digits: 9, pattern: /^[67]\d{8}$/ },
  { code: 'DZ', name: 'Algérie', dial: '+213', flag: '🇩🇿', example: 'X-XX-XX-XX-XX', digits: 9, pattern: /^[567]\d{8}$/ },
  { code: 'TN', name: 'Tunisie', dial: '+216', flag: '🇹🇳', example: 'XX-XXX-XXX', digits: 8, pattern: /^[2459]\d{7}$/ },
  { code: 'EG', name: 'Égypte', dial: '+20', flag: '🇪🇬', example: 'XXX-XXX-XXXX', digits: 10, pattern: /^1[0125]\d{8}$/ },
  { code: 'NG', name: 'Nigéria', dial: '+234', flag: '🇳🇬', example: 'XXX-XXX-XXXX', digits: 10, pattern: /^[789]\d{9}$/ },
  { code: 'GH', name: 'Ghana', dial: '+233', flag: '🇬🇭', example: 'XX-XXX-XXXX', digits: 9, pattern: /^[235]\d{8}$/ },
  // Kenya : mobile = 7X (Safaricom/Airtel/Telkom historique) ou 1X (nouveaux blocs Safaricom/Airtel).
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪', example: '7XX-XXX-XXX', digits: 9, pattern: /^[17]\d{8}$/ },
  { code: 'ZA', name: 'Afrique du Sud', dial: '+27', flag: '🇿🇦', example: 'XX-XXX-XXXX', digits: 9, pattern: /^[678]\d{8}$/ },
  { code: 'MZ', name: 'Mozambique', dial: '+258', flag: '🇲🇿', example: 'XX-XXX-XXXX', digits: 9, pattern: /^8\d{8}$/ },
  { code: 'ZM', name: 'Zambie', dial: '+260', flag: '🇿🇲', example: 'XX-XXX-XXXX', digits: 9, pattern: /^[79]\d{8}$/ },
  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼', example: 'XXX-XXX-XXX', digits: 9, pattern: /^7\d{8}$/ },
  { code: 'CV', name: 'Cap-Vert', dial: '+238', flag: '🇨🇻', example: 'XXX-XX-XX', digits: 7, pattern: /^[59]\d{6}$/ },
  { code: 'GQ', name: 'Guinée équatoriale', dial: '+240', flag: '🇬🇶', example: 'XXX-XXX-XXX', digits: 9, pattern: /^[2-9]\d{8}$/ },
]

export const defaultCountry = africanCountries[0] // Angola

export function findCountryByDial(dial: string): AfricanCountry | undefined {
  return africanCountries.find((c) => c.dial === dial)
}
