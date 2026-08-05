import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DossierSectionProps {
  numero: number;
  titre: string;
  id: string;
  children: ReactNode;
}

// Bandeau bleu foncé numéroté + contenu blanc (reproduction du classeur Excel).
export default function DossierSection({ numero, titre, id, children }: DossierSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.35 }}
      className="mb-8 overflow-hidden rounded-lg shadow-sm"
    >
      <div className="flex items-center gap-3 bg-[#173F73] px-5 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-white/15 text-sm font-bold text-white">
          {numero}
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white">{titre}</h2>
      </div>
      <div className="border border-t-0 border-slate-200 bg-white p-6">{children}</div>
    </motion.section>
  );
}
