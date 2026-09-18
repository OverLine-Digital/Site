'use client'

import { motion } from 'framer-motion'

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mb-14 max-w-2xl text-left lg:text-center"
    >
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-primary">
        {eyebrow}
      </p>
      <h2 className="text-balance font-voice text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">{description}</p>
      )}
    </motion.div>
  )
}
