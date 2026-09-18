import { describe, it, expect } from 'vitest'
import {
  validateFullName,
  validateEmail,
  validateLocalPhone,
  validateWhatsapp,
  validateDescription,
  generateProjectId,
} from '../validation'
import { africanCountries, findCountryByDial } from '../african-countries'
import { formatLocalPhone } from '../phone-format'

describe('validateFullName', () => {
  it('rejette un nom vide', () => {
    expect(validateFullName('')).not.toBeNull()
  })
  it('rejette un seul mot', () => {
    expect(validateFullName('Jean')).not.toBeNull()
  })
  it('rejette un nom avec des chiffres', () => {
    expect(validateFullName('Jean3 Dupont')).not.toBeNull()
  })
  it('accepte un prénom et un nom', () => {
    expect(validateFullName('Jean Dupont')).toBeNull()
  })
})

describe('validateEmail', () => {
  it('rejette une adresse sans @', () => {
    expect(validateEmail('pasunemail.com')).not.toBeNull()
  })
  it('rejette une adresse sans domaine', () => {
    expect(validateEmail('a@b')).not.toBeNull()
  })
  it('accepte une adresse valide', () => {
    expect(validateEmail('client@example.com')).toBeNull()
  })
})

describe('validateDescription', () => {
  it('rejette un texte trop court', () => {
    expect(validateDescription('trop court', 50)).not.toBeNull()
  })
  it('accepte un texte assez long', () => {
    expect(validateDescription('x'.repeat(50), 50)).toBeNull()
  })
})

describe('generateProjectId', () => {
  it('suit le format OverLine-ID-YY-YY-NNNNNN', () => {
    expect(generateProjectId()).toMatch(/^OverLine-ID-\d{2}-\d{2}-\d{6}$/)
  })
})

// --- Le cœur du sujet : chaque pays doit accepter un vrai préfixe mobile et
// rejeter un numéro qui a la bonne longueur mais un préfixe inexistant.
// (régression directe du bug initial : 888888888 passait pour l'Angola).
describe('validateLocalPhone — préfixes mobiles par pays', () => {
  const cases: Record<string, { valid: string; invalidPrefix: string }> = {
    AO: { valid: '922345678', invalidPrefix: '888888888' },
    CG: { valid: '065342402', invalidPrefix: '088888888' },
    CD: { valid: '812345678', invalidPrefix: '112345678' },
    CM: { valid: '612345678', invalidPrefix: '512345678' },
    GA: { valid: '012345678', invalidPrefix: '089345678' },
    CI: { valid: '0123456789', invalidPrefix: '0223456789' },
    SN: { valid: '701234567', invalidPrefix: '711234567' },
    ML: { valid: '61234567', invalidPrefix: '41234567' },
    BF: { valid: '61234567', invalidPrefix: '81234567' },
    BJ: { valid: '41234567', invalidPrefix: '31234567' },
    TG: { valid: '91234567', invalidPrefix: '81234567' },
    NE: { valid: '81234567', invalidPrefix: '71234567' },
    TD: { valid: '61234567', invalidPrefix: '51234567' },
    GN: { valid: '612345678', invalidPrefix: '512345678' },
    MA: { valid: '612345678', invalidPrefix: '512345678' },
    DZ: { valid: '512345678', invalidPrefix: '412345678' },
    TN: { valid: '21234567', invalidPrefix: '11234567' },
    EG: { valid: '1012345678', invalidPrefix: '1312345678' },
    NG: { valid: '7012345678', invalidPrefix: '6012345678' },
    GH: { valid: '212345678', invalidPrefix: '112345678' },
    KE: { valid: '712345678', invalidPrefix: '212345678' },
    ZA: { valid: '612345678', invalidPrefix: '512345678' },
    MZ: { valid: '812345678', invalidPrefix: '712345678' },
    ZM: { valid: '712345678', invalidPrefix: '612345678' },
    RW: { valid: '712345678', invalidPrefix: '612345678' },
    CV: { valid: '5123456', invalidPrefix: '1123456' },
    GQ: { valid: '212345678', invalidPrefix: '112345678' },
  }

  it("couvre bien les 27 pays de la liste (pas d'oubli de cas de test)", () => {
    expect(Object.keys(cases).sort()).toEqual(africanCountries.map((c) => c.code).sort())
  })

  for (const country of africanCountries) {
    const { valid, invalidPrefix } = cases[country.code]

    it(`${country.name} (${country.dial}) : accepte un préfixe mobile réel`, () => {
      expect(validateLocalPhone(valid, country.digits, country)).toBeNull()
    })

    it(`${country.name} (${country.dial}) : rejette un préfixe inexistant malgré la bonne longueur`, () => {
      expect(valid.length).toBe(invalidPrefix.length) // le seul écart doit être le préfixe, pas la longueur
      expect(validateLocalPhone(invalidPrefix, country.digits, country)).not.toBeNull()
    })

    it(`${country.name} (${country.dial}) : rejette un nombre de chiffres incorrect`, () => {
      expect(validateLocalPhone(valid.slice(0, -1), country.digits, country)).not.toBeNull()
    })
  }

  it('rejette les lettres', () => {
    const ao = findCountryByDial('+244')!
    expect(validateLocalPhone('92234567a', ao.digits, ao)).not.toBeNull()
  })

  it('rejette une saisie vide', () => {
    expect(validateLocalPhone('', 9, findCountryByDial('+244'))).not.toBeNull()
  })
})

describe('validateWhatsapp', () => {
  it("accepte un numéro angolais complet avec un vrai préfixe", () => {
    expect(validateWhatsapp('+244922345678')).toBeNull()
  })
  it('rejette un numéro angolais avec un préfixe inexistant', () => {
    expect(validateWhatsapp('+244888888888')).not.toBeNull()
  })
  it("rejette un numéro sans l'indicatif pays", () => {
    expect(validateWhatsapp('922345678')).not.toBeNull()
  })
  it('rejette les lettres', () => {
    expect(validateWhatsapp('+244abcde5678')).not.toBeNull()
  })
})

describe('formatLocalPhone', () => {
  it('insère les séparateurs du gabarit angolais au fur et à mesure de la saisie', () => {
    expect(formatLocalPhone('9', '9XX-XXX-XXX')).toBe('9')
    expect(formatLocalPhone('92', '9XX-XXX-XXX')).toBe('92')
    expect(formatLocalPhone('922', '9XX-XXX-XXX')).toBe('922')
    expect(formatLocalPhone('9223', '9XX-XXX-XXX')).toBe('922-3')
    expect(formatLocalPhone('922345678', '9XX-XXX-XXX')).toBe('922-345-678')
  })
  it('ignore les chiffres au-delà de la longueur du gabarit', () => {
    expect(formatLocalPhone('9223456789999', '9XX-XXX-XXX')).toBe('922-345-678')
  })
  it('ignore les lettres et ne garde que les chiffres', () => {
    expect(formatLocalPhone('9a2b2c345678', '9XX-XXX-XXX')).toBe('922-345-678')
  })
  it("ne laisse jamais de séparateur final en trop pendant la saisie", () => {
    const result = formatLocalPhone('065', 'XX-XXX-XXXX')
    expect(result.endsWith('-')).toBe(false)
  })
})
