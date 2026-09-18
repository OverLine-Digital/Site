'use client'

import { WhatsAppIcon } from './icons/whatsapp-icon'

export function WhatsappFab() {
  return (
    <a
      href="https://wa.me/244952378216"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-6 left-6 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
