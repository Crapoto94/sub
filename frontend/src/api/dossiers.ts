import { api } from './client';

export type Statut = 'brouillon' | 'depose' | 'instruction' | 'decision' | 'accorde' | 'refuse';

export interface DossierListItem {
  id: number;
  reference: string;
  associationId: number;
  nomAssociation: string | null;
  sigleAssociation: string | null;
  annee: number;
  statut: Statut;
  dateDepot: string | null;
  sollicite: number | null;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  deletedBy?: number | null;
}

export interface Dossier extends DossierListItem {
  sections: Record<string, unknown>;
}

export interface DossierList {
  total: number;
  items: DossierListItem[];
}

export interface DossierStats {
  annee: number | null;
  totalDossiers: number;
  associations: number;
  parStatut: Record<Statut, number>;
  subventions: { sollicitees: number; accordees: number };
}

export const STATUTS: Statut[] = ['brouillon', 'depose', 'instruction', 'decision', 'accorde', 'refuse'];

export async function listDossiers(params: {
  annee?: number;
  statut?: Statut;
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<DossierList> {
  const { data } = await api.get<DossierList>('/api/v1/dossiers', { params });
  return data;
}

export async function getDossier(id: number): Promise<Dossier> {
  const { data } = await api.get<Dossier>(`/api/v1/dossiers/${id}`);
  return data;
}

export async function createDossier(input: {
  associationId: number;
  annee: number;
  statut?: Statut;
  dateDepot?: string;
}): Promise<Dossier> {
  const { data } = await api.post<Dossier>('/api/v1/dossiers', input);
  return data;
}

export async function updateDossier(
  id: number,
  fields: Partial<Pick<Dossier, 'statut' | 'dateDepot'>>
): Promise<DossierListItem> {
  const { data } = await api.patch<DossierListItem>(`/api/v1/dossiers/${id}`, fields);
  return data;
}

export async function saveSection(id: number, section: string, body: unknown): Promise<unknown> {
  const { data } = await api.put(`/api/v1/dossiers/${id}/sections/${section}`, body);
  return data;
}

export async function getDossierStats(annee?: number): Promise<DossierStats> {
  const { data } = await api.get<DossierStats>('/api/v1/dossiers/stats', { params: { annee } });
  return data;
}

export async function listCorbeille(params: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<DossierList> {
  const { data } = await api.get<DossierList>('/api/v1/dossiers/corbeille', { params });
  return data;
}

export async function deleteDossier(id: number): Promise<DossierListItem> {
  const { data } = await api.delete<DossierListItem>(`/api/v1/dossiers/${id}`);
  return data;
}

export async function restoreDossier(id: number): Promise<DossierListItem> {
  const { data } = await api.post<DossierListItem>(`/api/v1/dossiers/${id}/restore`);
  return data;
}

export async function purgeDossier(id: number): Promise<{ id: number; reference: string; purged: boolean }> {
  const { data } = await api.delete<{ id: number; reference: string; purged: boolean }>(
    `/api/v1/dossiers/${id}/purge`
  );
  return data;
}
