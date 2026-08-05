import { api } from './client';

export interface Association {
  id: number;
  isActive: boolean;
  nomOfficielAssociation: string | null;
  sigleAbreviation: string | null;
  objetAssociation: string | null;
  adresseSiegeSocial: string | null;
  codePostal: string | null;
  ville: string | null;
  email: string | null;
  telephone: string | null;
  siteWebReseauxSociaux: string | null;
  numeroRna: string | null;
  numeroSiren: string | null;
  dateCreation: string | null;
  agrementJeunesseSports: string | null;
  federationSportiveAffiliation: string | null;
  disciplinesPratiquees: string | null;
  numeroAffiliation: string | null;
  categorieSportive: string | null;
}

export type AssociationInput = Partial<Omit<Association, 'id' | 'isActive'>> & { isActive?: boolean };

export interface AssociationList {
  total: number;
  items: Association[];
}

export async function listAssociations(params: {
  q?: string;
  limit?: number;
  offset?: number;
}): Promise<AssociationList> {
  const { data } = await api.get<AssociationList>('/api/v1/associations', { params });
  return data;
}

export async function getAssociation(id: number): Promise<Association> {
  const { data } = await api.get<Association>(`/api/v1/associations/${id}`);
  return data;
}

export async function createAssociation(input: AssociationInput): Promise<Association> {
  const { data } = await api.post<Association>('/api/v1/associations', input);
  return data;
}

export async function updateAssociation(id: number, input: AssociationInput): Promise<Association> {
  const { data } = await api.patch<Association>(`/api/v1/associations/${id}`, input);
  return data;
}
