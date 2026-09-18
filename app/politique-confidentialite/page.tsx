'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'
import type { Lang } from '@/lib/i18n'

const content: Record<Lang, { title: string; updated: string; back: string; sections: { h: string; p: string[] }[] }> = {
  fr: {
    title: 'Politique de confidentialité',
    updated: 'Dernière mise à jour : 19 août 2026',
    back: "Retour à l'accueil",
    sections: [
      {
        h: 'Qui sommes-nous',
        p: [
          "OverLine Digital conçoit des sites web, des applications, des logiciels et des solutions d'intelligence artificielle et de cybersécurité pour nos clients. Nous travaillons principalement en Angola et au Congo-Brazzaville.",
          "Une question sur cette politique ? Écrivez-nous directement à overlinedigitall@gmail.com — on vous répond nous-mêmes, pas un service automatisé.",
        ],
      },
      {
        h: 'Ce que nous collectons, et pourquoi',
        p: [
          "Quand vous nous soumettez une demande de projet, on a besoin de quelques informations pour pouvoir vous répondre correctement : votre nom, votre e-mail, votre numéro de téléphone ou WhatsApp, le nom de votre entreprise (ou votre secteur d'activité), et une description de ce que vous voulez construire. Rien de plus — on ne vous demande pas votre adresse, votre date de naissance ou autre chose dont on n'a pas l'usage.",
          "Si vous utilisez notre outil de suivi de projet, on consulte simplement votre nom et votre référence de projet (Project ID) pour vous montrer où en est votre commande.",
          "Une précision importante : nous ne collectons aucune donnée de paiement sur ce site. Les transactions financières passent par d'autres canaux, en dehors de cette plateforme.",
        ],
      },
      {
        h: "Ce qu'on en fait",
        p: [
          "Vos informations nous servent à traiter votre demande, vous recontacter par e-mail ou WhatsApp, préparer une proposition adaptée, suivre l'avancement de votre projet, et rester disponibles après la livraison si vous avez besoin de support.",
          "C'est tout. On ne revend rien, on n'envoie rien à des régies publicitaires, et vos données ne servent à aucune fin commerciale en dehors de notre relation directe avec vous.",
        ],
      },
      {
        h: 'Où sont stockées vos données',
        p: [
          "Les informations liées à vos demandes de projet sont hébergées dans une base de données sécurisée, avec un accès restreint à l'équipe OverLine Digital.",
          "On fait ce qu'il faut pour protéger ces données correctement, mais comme pour n'importe quel service en ligne, on ne peut pas garantir une sécurité absolue à 100 % — personne ne le peut honnêtement. Ce qu'on peut vous promettre, c'est qu'on prend cette responsabilité au sérieux et qu'on ne stocke pas plus d'informations que nécessaire.",
        ],
      },
      {
        h: 'Partage avec des tiers',
        p: [
          "On ne partage vos données qu'en cas de réelle nécessité — typiquement avec nos prestataires techniques, pour que le service fonctionne — ou si la loi nous y oblige. Pas de partenaires marketing, pas de courtiers en données, pas de vente à des tiers.",
        ],
      },
      {
        h: 'Vos droits',
        p: [
          "Vous voulez savoir quelles données on a sur vous, les corriger, ou les faire supprimer ? Écrivez-nous à overlinedigitall@gmail.com et on s'en occupe.",
        ],
      },
      {
        h: 'Cookies et stockage local',
        p: [
          "Ce site utilise le stockage local de votre navigateur uniquement pour retenir votre préférence de langue et de thème (clair/sombre). Pas de cookies publicitaires, pas de traqueurs cachés, rien de ce genre.",
        ],
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    updated: 'Last updated: August 19, 2026',
    back: 'Back to home',
    sections: [
      {
        h: 'Who we are',
        p: [
          "OverLine Digital builds websites, apps, software, and AI and cybersecurity solutions for our clients. We're based mainly in Angola and Congo-Brazzaville.",
          "Got a question about this policy? Just email us at overlinedigitall@gmail.com — a real person on our team replies, not a bot.",
        ],
      },
      {
        h: 'What we collect, and why',
        p: [
          "When you submit a project request, we need a few details to get back to you properly: your name, email, phone or WhatsApp number, your company name (or industry), and a description of what you want to build. That's it — we don't ask for your home address, date of birth, or anything else we have no use for.",
          'If you use our project tracking tool, we simply look up your name and your project reference (Project ID) to show you where things stand.',
          "One important note: we don't collect any payment information on this site. Financial transactions happen through other channels, outside this platform.",
        ],
      },
      {
        h: 'What we do with it',
        p: [
          'Your information helps us process your request, follow up by email or WhatsApp, put together a proposal that fits, track your project, and stay reachable for support after delivery.',
          "That's the whole list. We don't resell anything, we don't feed it to ad networks, and your data is never used for any commercial purpose beyond our direct relationship with you.",
        ],
      },
      {
        h: 'Where your data lives',
        p: [
          'Everything tied to your project requests sits in a secured database, with access limited to the OverLine Digital team.',
          "We do what's needed to keep that data safe, but like any online service, we can't promise 100% security — nobody honestly can. What we can promise is that we take this seriously and never hold on to more information than we actually need.",
        ],
      },
      {
        h: 'Sharing with third parties',
        p: [
          'We only share your data when it\u2019s genuinely necessary — typically with the technical providers that keep the service running — or when the law requires it. No marketing partners, no data brokers, no selling your data.',
        ],
      },
      {
        h: 'Your rights',
        p: [
          "Want to know what we have on file for you, fix it, or have it deleted? Email overlinedigitall@gmail.com and we'll take care of it.",
        ],
      },
      {
        h: 'Cookies and local storage',
        p: [
          "This site uses your browser's local storage only to remember your language and theme (light/dark) preference. No advertising cookies, no hidden trackers, nothing like that.",
        ],
      },
    ],
  },
  es: {
    title: 'Política de privacidad',
    updated: 'Última actualización: 19 de agosto de 2026',
    back: 'Volver al inicio',
    sections: [
      {
        h: 'Quiénes somos',
        p: [
          'OverLine Digital crea sitios web, aplicaciones, software y soluciones de inteligencia artificial y ciberseguridad para nuestros clientes. Trabajamos principalmente en Angola y Congo-Brazzaville.',
          '¿Tienes alguna duda sobre esta política? Escríbenos a overlinedigitall@gmail.com — te responde alguien de nuestro equipo, no un sistema automático.',
        ],
      },
      {
        h: 'Qué datos recopilamos, y por qué',
        p: [
          'Cuando nos envías una solicitud de proyecto, necesitamos algunos datos para poder responderte bien: tu nombre, tu correo, tu número de teléfono o WhatsApp, el nombre de tu empresa (o tu sector), y una descripción de lo que quieres construir. Nada más — no te pedimos tu dirección, tu fecha de nacimiento ni nada que no vayamos a usar.',
          'Si usas nuestra herramienta de seguimiento de proyectos, solo consultamos tu nombre y tu referencia de proyecto (Project ID) para mostrarte en qué punto va tu pedido.',
          'Una aclaración importante: no recopilamos ningún dato de pago en este sitio. Las transacciones económicas se gestionan por otros canales, fuera de esta plataforma.',
        ],
      },
      {
        h: 'Qué hacemos con tus datos',
        p: [
          'Tu información nos sirve para procesar tu solicitud, contactarte por correo o WhatsApp, preparar una propuesta a medida, seguir el avance de tu proyecto, y seguir disponibles después de la entrega si necesitas soporte.',
          'Y ya está. No revendemos nada, no se lo pasamos a ninguna red publicitaria, y tus datos no se usan con ningún fin comercial fuera de nuestra relación directa contigo.',
        ],
      },
      {
        h: 'Dónde se guardan tus datos',
        p: [
          'La información de tus solicitudes de proyecto se guarda en una base de datos segura, con acceso restringido al equipo de OverLine Digital.',
          'Hacemos lo necesario para proteger bien estos datos, pero como en cualquier servicio en línea, no podemos garantizar una seguridad absoluta al 100 % — nadie puede prometer eso honestamente. Lo que sí podemos prometerte es que nos tomamos esta responsabilidad en serio y que no guardamos más información de la necesaria.',
        ],
      },
      {
        h: 'Compartir con terceros',
        p: [
          'Solo compartimos tus datos cuando es realmente necesario — normalmente con nuestros proveedores técnicos, para que el servicio funcione — o si la ley nos obliga. Nada de socios de marketing, nada de intermediarios de datos, nada de venderlos a terceros.',
        ],
      },
      {
        h: 'Tus derechos',
        p: [
          '¿Quieres saber qué datos tenemos sobre ti, corregirlos o pedir que los borremos? Escríbenos a overlinedigitall@gmail.com y nos encargamos.',
        ],
      },
      {
        h: 'Cookies y almacenamiento local',
        p: [
          'Este sitio usa el almacenamiento local de tu navegador solo para recordar tu idioma y tema (claro/oscuro) preferidos. Nada de cookies publicitarias, nada de rastreadores ocultos, nada de eso.',
        ],
      },
    ],
  },
  pt: {
    title: 'Política de privacidade',
    updated: 'Última atualização: 19 de agosto de 2026',
    back: 'Voltar ao início',
    sections: [
      {
        h: 'Quem somos',
        p: [
          'A OverLine Digital cria sites, aplicações, software e soluções de inteligência artificial e cibersegurança para os nossos clientes. Trabalhamos principalmente em Angola e no Congo-Brazzaville.',
          'Tem alguma dúvida sobre esta política? Escreva-nos para overlinedigitall@gmail.com — quem responde é a nossa equipa, não um serviço automático.',
        ],
      },
      {
        h: 'Que dados recolhemos, e porquê',
        p: [
          'Quando nos submete um pedido de projeto, precisamos de algumas informações para lhe podermos responder como deve ser: o seu nome, o seu e-mail, o seu número de telefone ou WhatsApp, o nome da sua empresa (ou o seu setor de atividade) e uma descrição do que quer construir. Nada mais — não pedimos a sua morada, a sua data de nascimento nem nada que não vamos usar.',
          'Se usar a nossa ferramenta de acompanhamento de projeto, consultamos apenas o seu nome e a referência do projeto (Project ID) para lhe mostrar em que ponto está o seu pedido.',
          'Um esclarecimento importante: não recolhemos nenhum dado de pagamento neste site. As transações financeiras passam por outros canais, fora desta plataforma.',
        ],
      },
      {
        h: 'O que fazemos com os seus dados',
        p: [
          'As suas informações servem para tratar o seu pedido, voltar a contactá-lo por e-mail ou WhatsApp, preparar uma proposta ajustada, acompanhar o andamento do seu projeto e continuar disponíveis depois da entrega caso precise de suporte.',
          'É tudo. Não revendemos nada, não enviamos nada para redes publicitárias, e os seus dados não são usados para nenhum fim comercial fora da nossa relação direta consigo.',
        ],
      },
      {
        h: 'Onde ficam guardados os seus dados',
        p: [
          'As informações ligadas aos seus pedidos de projeto ficam alojadas numa base de dados segura, com acesso restrito à equipa da OverLine Digital.',
          'Fazemos o necessário para proteger bem estes dados, mas, como em qualquer serviço online, não podemos garantir uma segurança 100% absoluta — ninguém pode prometer isso com honestidade. O que lhe podemos garantir é que levamos esta responsabilidade a sério e que não guardamos mais informação do que a necessária.',
        ],
      },
      {
        h: 'Partilha com terceiros',
        p: [
          'Só partilhamos os seus dados quando é mesmo necessário — tipicamente com os nossos fornecedores técnicos, para o serviço funcionar — ou se a lei nos obrigar. Sem parceiros de marketing, sem corretores de dados, sem vender nada a terceiros.',
        ],
      },
      {
        h: 'Os seus direitos',
        p: [
          'Quer saber que dados temos sobre si, corrigi-los ou pedir que sejam apagados? Escreva para overlinedigitall@gmail.com e nós tratamos disso.',
        ],
      },
      {
        h: 'Cookies e armazenamento local',
        p: [
          'Este site usa o armazenamento local do seu navegador só para guardar a sua preferência de idioma e tema (claro/escuro). Sem cookies publicitários, sem rastreadores escondidos, nada disso.',
        ],
      },
    ],
  },
}

export default function PrivacyPolicyPage() {
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
