import { FileText, MessageSquareQuote, Sparkles } from 'lucide-react';
import type { SyntheseSection } from '../../types/subventions';
import DossierSection from './DossierSection';

// 11. SYNTHÈSE DE L'ASSOCIATION : compte-rendu rédigé automatiquement à partir
// des rubriques précédentes (introduction, synthèse détaillée, appréciation).
export default function SectionSynthese({ synthese }: { synthese: SyntheseSection | undefined }) {
  const introduction = synthese?.introduction || null;
  const compteRendu = synthese?.compteRendu || [];
  const appreciation = synthese?.appreciation || null;

  if (!introduction && !compteRendu.length && !appreciation) return null;

  return (
    <DossierSection numero={11} titre="Synthèse de l'association" id="section-11">
      <div className="space-y-5">
        {introduction && (
          <p className="flex items-start gap-3 text-[14px] italic leading-relaxed text-slate-600">
            <MessageSquareQuote size={18} className="mt-0.5 shrink-0 text-[#173F73]" />
            <span>{introduction}</span>
          </p>
        )}

        {compteRendu.length > 0 && (
          <div>
            <p className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-slate-500">
              <FileText size={14} />
              Compte-rendu des rubriques précédentes
            </p>
            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50/60 p-5">
              {compteRendu.map((paragraphe, i) => (
                <p key={i} className="text-[13.5px] leading-relaxed text-slate-700">
                  {paragraphe}
                </p>
              ))}
            </div>
          </div>
        )}

        {appreciation && (
          <div className="flex items-start gap-3 rounded-lg border-l-4 border-[#173F73] bg-[#173F73]/5 p-4">
            <Sparkles size={18} className="mt-0.5 shrink-0 text-[#173F73]" />
            <p className="text-[14px] font-medium leading-relaxed text-slate-800">
              {appreciation}
            </p>
          </div>
        )}
      </div>
    </DossierSection>
  );
}