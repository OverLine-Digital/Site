'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/i18n'

const content: Record<Lang, { title: string; updated: string; back: string; sections: { h: string; p: string[] }[] }> = {
  fr: {
    title: "Conditions d'utilisation",
    updated: 'Dernière mise à jour : 19 août 2026',
    back: "Retour à l'accueil",
    sections: [
      {
        h: 'Acceptation des conditions',
        p: [
          'En utilisant ce site ou en soumettant une demande de projet auprès d\'OverLine Digital, vous acceptez les présentes conditions d\'utilisation.',
        ],
      },
      {
        h: 'Nos services',
        p: [
          "OverLine Digital propose des services de développement web, d'applications, de logiciels, d'intelligence artificielle et de cybersécurité. Toute demande de projet soumise via ce site fait l'objet d'une analyse préalable et d'une proposition personnalisée avant tout engagement contractuel.",
          "Aucun paiement n'est exigé au moment de la demande de projet ; les modalités (tarifs, délais, périmètre) sont convenues séparément après validation de la proposition.",
        ],
      },
      {
        h: 'Suivi de projet',
        p: [
          "L'outil de suivi de projet permet de consulter l'état d'avancement d'un projet à l'aide du nom complet et de la référence de projet fournis lors de la demande. Vous êtes responsable de la confidentialité de cette référence.",
        ],
      },
      {
        h: 'Propriété intellectuelle',
        p: [
          "Le contenu de ce site (textes, logos, visuels) est la propriété d'OverLine Digital et ne peut être reproduit sans autorisation.",
          "Les livrables d'un projet (code, design) sont régis par les termes convenus dans la proposition et le contrat spécifiques à ce projet.",
        ],
      },
      {
        h: 'Limitation de responsabilité',
        p: [
          "Ce site est fourni tel quel. OverLine Digital met tout en œuvre pour assurer son bon fonctionnement mais ne garantit pas une disponibilité ininterrompue.",
        ],
      },
      {
        h: 'Contact',
        p: [
          'Pour toute question relative à ces conditions, contactez-nous à overlinedigitall@gmail.com.',
        ],
      },
    ],
  },
  en: {
    title: 'Terms of Service',
    updated: 'Last updated: August 19, 2026',
    back: 'Back to home',
    sections: [
      {
        h: 'Acceptance of terms',
        p: [
          'By using this site or submitting a project request to OverLine Digital, you agree to these terms of service.',
        ],
      },
      {
        h: 'Our services',
        p: [
          'OverLine Digital provides web, application, software, AI and cybersecurity development services. Any project request submitted through this site is reviewed and followed by a tailored proposal before any contractual commitment.',
          'No payment is required at the time of the project request; terms (pricing, timeline, scope) are agreed separately once the proposal is validated.',
        ],
      },
      {
        h: 'Project tracking',
        p: [
          'The project tracking tool lets you check a project\'s status using the full name and project reference provided at request time. You are responsible for keeping this reference confidential.',
        ],
      },
      {
        h: 'Intellectual property',
        p: [
          'The content of this site (text, logos, visuals) belongs to OverLine Digital and may not be reproduced without permission.',
          "Project deliverables (code, design) are governed by the terms agreed in that project's specific proposal and contract.",
        ],
      },
      {
        h: 'Limitation of liability',
        p: [
          'This site is provided as is. OverLine Digital makes every effort to keep it running smoothly but does not guarantee uninterrupted availability.',
        ],
      },
      {
        h: 'Contact',
        p: [
          'For any question about these terms, contact us at overlinedigitall@gmail.com.',
        ],
      },
    ],
  },
  es: {
    title: 'Términos de servicio',
    updated: 'Última actualización: 19 de agosto de 2026',
    back: 'Volver al inicio',
    sections: [
      {
        h: 'Aceptación de los términos',
        p: [
          'Al usar este sitio o enviar una solicitud de proyecto a OverLine Digital, usted acepta estos términos de servicio.',
        ],
      },
      {
        h: 'Nuestros servicios',
        p: [
          'OverLine Digital ofrece servicios de desarrollo web, de aplicaciones, software, inteligencia artificial y ciberseguridad. Toda solicitud de proyecto enviada a través de este sitio es analizada y seguida de una propuesta personalizada antes de cualquier compromiso contractual.',
          'No se exige ningún pago al momento de la solicitud; las condiciones (precio, plazos, alcance) se acuerdan por separado tras validar la propuesta.',
        ],
      },
      {
        h: 'Seguimiento de proyecto',
        p: [
          'La herramienta de seguimiento permite consultar el estado de un proyecto usando el nombre completo y la referencia proporcionados al solicitarlo. Usted es responsable de mantener esa referencia confidencial.',
        ],
      },
      {
        h: 'Propiedad intelectual',
        p: [
          'El contenido de este sitio (textos, logotipos, elementos visuales) pertenece a OverLine Digital y no puede reproducirse sin autorización.',
          'Los entregables de un proyecto (código, diseño) se rigen por los términos acordados en la propuesta y el contrato específicos de ese proyecto.',
        ],
      },
      {
        h: 'Limitación de responsabilidad',
        p: [
          'Este sitio se ofrece tal cual. OverLine Digital hace todo lo posible por mantenerlo funcionando correctamente, pero no garantiza una disponibilidad ininterrumpida.',
        ],
      },
      {
        h: 'Contacto',
        p: [
          'Para cualquier pregunta sobre estos términos, escríbanos a overlinedigitall@gmail.com.',
        ],
      },
    ],
  },
  pt: {
    title: 'Termos de serviço',
    updated: 'Última atualização: 19 de agosto de 2026',
    back: 'Voltar ao início',
    sections: [
      {
        h: 'Aceitação dos termos',
        p: [
          'Ao usar este site ou submeter um pedido de projeto à OverLine Digital, você aceita estes termos de serviço.',
        ],
      },
      {
        h: 'Os nossos serviços',
        p: [
          'A OverLine Digital presta serviços de desenvolvimento web, de aplicações, software, inteligência artificial e cibersegurança. Qualquer pedido de projeto submetido através deste site é analisado e seguido de uma proposta personalizada antes de qualquer compromisso contratual.',
          'Nenhum pagamento é exigido no momento do pedido; as condições (preço, prazos, âmbito) são acordadas separadamente após a validação da proposta.',
        ],
      },
      {
        h: 'Acompanhamento de projeto',
        p: [
          'A ferramenta de acompanhamento permite consultar o estado de um projeto usando o nome completo e a referência fornecidos no momento do pedido. Você é responsável por manter essa referência confidencial.',
        ],
      },
      {
        h: 'Propriedade intelectual',
        p: [
          'O conteúdo deste site (textos, logótipos, elementos visuais) pertence à OverLine Digital e não pode ser reproduzido sem autorização.',
          'Os entregáveis de um projeto (código, design) são regidos pelos termos acordados na proposta e no contrato específicos desse projeto.',
        ],
      },
      {
        h: 'Limitação de responsabilidade',
        p: [
          'Este site é fornecido tal como está. A OverLine Digital faz o possível para o manter a funcionar bem, mas não garante disponibilidade ininterrupta.',
        ],
      },
      {
        h: 'Contacto',
        p: [
          'Para qualquer dúvida sobre estes termos, contacte-nos em overlinedigitall@gmail.com.',
        ],
      },
    ],
  },
}

export default function TermsPage() {
  const { lang } = useLanguage()
  const c = content[lang]

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 py-16">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-primary">
        OverLine Digital
      </p>
      <h1 className="mb-2 font-voice text-2xl font-semibold text-foreground">{c.title}</h1>
      <p className="mb-10 text-xs text-muted-foreground">{c.updated}</p>

      <div className="flex flex-col gap-8">
        {c.sections.map((s) => (
          <section key={s.h} className="border-l-2 border-primary/30 pl-5">
            <h2 className="mb-2 text-base font-semibold text-primary">{s.h}</h2>
            <div className="flex flex-col gap-2">
              {s.p.map((line, i) => (
                <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Link
        href="/"
        className="mt-12 inline-flex items-center gap-1.5 text-sm text-primary hover:brightness-110"
      >
        <ArrowLeft className="h-4 w-4" />
        {c.back}
      </Link>
    </main>
  )
}
