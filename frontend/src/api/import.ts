import { api } from './client';

export interface ImportResult {
  dossierId: number;
  reference: string;
  associationId: number;
  associationNom: string;
  sectionsImportees: string[];
  fichiers: string[];
  nouveauDossier: boolean;
}

/**
 * Importe un dossier de subvention depuis les fichiers Excel fournis.
 * Ordre attendu : 1) dossier de demande, 2) tableau financier, 3) bilan
 * de la convention d'objectifs. Crée ou met à jour le dossier de l'année.
 */
export async function importExcel(data: {
  annee?: number;
  dossier: File;
  financier?: File;
  bilan?: File;
}): Promise<ImportResult> {
  const form = new FormData();
  form.append('annee', String(data.annee ?? 2027));
  form.append('dossier', data.dossier);
  if (data.financier) form.append('financier', data.financier);
  if (data.bilan) form.append('bilan', data.bilan);
  const res = await api.post<ImportResult>('/api/v1/import/excel', form);
  return res.data;
}