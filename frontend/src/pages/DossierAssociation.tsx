import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDossier } from '../api/dossiers';
import type { Dossier } from '../api/dossiers';
import { getAssociation } from '../api/associations';
import type { Association } from '../api/associations';
import type {
  EffectifsSection,
  VieAssociativeSection,
  NiveauSportifRow,
  ProjetRow,
  TarifRow,
  SituationFinanciereSection,
  FinancementRow,
  PieceRow,
} from '../types/subventions';
import DossierHeader from '../components/dossier/DossierHeader';
import DossierToc, { DossierTocBar } from '../components/dossier/DossierToc';
import SectionIdentification from '../components/dossier/SectionIdentification';
import SectionEffectifs from '../components/dossier/SectionEffectifs';
import SectionBenevolat from '../components/dossier/SectionBenevolat';
import SectionNiveaux from '../components/dossier/SectionNiveaux';
import SectionProjets from '../components/dossier/SectionProjets';
import SectionTarifaire from '../components/dossier/SectionTarifaire';
import SectionFinanciere from '../components/dossier/SectionFinanciere';
import SectionFinancements from '../components/dossier/SectionFinancements';
import SectionPieces from '../components/dossier/SectionPieces';

function errorMessage(err: unknown, fallback: string): string {
  const anyErr = err as { response?: { data?: { error?: string } } };
  return anyErr?.response?.data?.error || fallback;
}

export default function DossierAssociation() {
  const { id } = useParams<{ id: string }>();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [association, setAssociation] = useState<Association | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError('');
      try {
        const d = await getDossier(Number(id));
        if (cancelled) return;
        setDossier(d);
        try {
          const a = await getAssociation(d.associationId);
          if (!cancelled) setAssociation(a);
        } catch {
          if (!cancelled) setAssociation(null);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(errorMessage(err, 'Impossible de charger le dossier'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Chargement du dossier…
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-500">
        <p>{error || 'Dossier introuvable'}</p>
      </div>
    );
  }

  const sections = dossier.sections;
  const effectifs = sections.effectifs as EffectifsSection;
  const vie = sections['vie-associative'] as VieAssociativeSection;
  const niveaux = (sections['niveaux-sportifs'] ?? []) as NiveauSportifRow[];
  const projetsRealises = (sections['projets-realises'] ?? []) as ProjetRow[];
  const projetsPrevus = (sections['projets-prevus'] ?? []) as ProjetRow[];
  const tarifs = (sections['politique-tarifaire'] ?? []) as TarifRow[];
  const fin = sections['situation-financiere'] as SituationFinanciereSection;
  const financements = (sections['autres-subventions'] ?? []) as FinancementRow[];
  const pieces = (sections.pieces ?? []) as PieceRow[];

  return (
    <div className="mx-auto w-full max-w-[1800px] px-4 py-6">
      <DossierTocBar />
      <DossierHeader dossier={dossier} />

      <div className="mt-6 flex items-start gap-6">
        <div className="hidden lg:block lg:self-stretch">
          <DossierToc />
        </div>

        <main className="min-w-0 flex-1 rounded-lg bg-white p-6 shadow-md lg:p-10">
          {association && <SectionIdentification association={association} />}
          <SectionEffectifs effectifs={effectifs} />
          <SectionBenevolat vie={vie} />
          <SectionNiveaux niveaux={niveaux} />
          <SectionProjets numero={5} titre="Projets réalisés" id="section-5" projets={projetsRealises} />
          <SectionProjets numero={6} titre="Projets prévus" id="section-6" projets={projetsPrevus} prevu />
          <SectionTarifaire tarifs={tarifs} />
          <SectionFinanciere fin={fin} />
          <SectionFinancements financements={financements} />
          <SectionPieces pieces={pieces} />
        </main>
      </div>
    </div>
  );
}
