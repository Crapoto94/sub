import { api } from './client';

export type StatutComparaison =
  | 'ok'
  | 'ecart'
  | 'local_seul'
  | 'api_seul'
  | 'non_verifiable'
  | 'absent';

export interface LigneComparaison {
  cle: string;
  libelle: string;
  local: string | null;
  api: string | null;
  source: string | null;
  couverture: 'api' | 'hors_api';
  statut: StatutComparaison;
}

export interface DonneeApiSeule {
  libelle: string;
  valeur: string | null;
  source: string;
}

export interface SubventionApi {
  annee: string | null;
  dispositif: string | null;
  sousDispositif: string | null;
  montantDemande: number | null;
  montantAccorde: number | null;
  instructeur: string | null;
  statut: string | null;
}

export interface EtablissementApi {
  siret: string | null;
  nom: string | null;
  siege: boolean;
  actif: boolean;
  adresse: string | null;
}

export interface Rubrique9Ligne {
  financeur: string | null;
  montant2025: number | null;
  montant2026: number | null;
  montant2027: number | null;
  objet: string | null;
  rattachableApi: boolean;
  source: string;
}

export interface Rubrique9Requete {
  endpoint: string | null;
  identifiant: string | null;
  perimetre: string;
  resultat: string;
}

export interface Rubrique9FinanceurApi {
  nb: number;
  annees: number[];
  montantAccorde: number;
  dispositifs: string[];
}

export interface Rubrique9 {
  lignes: Rubrique9Ligne[];
  requete: Rubrique9Requete;
  parFinanceur: Record<string, Rubrique9FinanceurApi>;
  apiAnsFdva: SubventionApi[];
  montantDeclareApi2026: number;
  montantApiAccorde: number;
  constats: string[];
}

export interface ControleSummary {
  total: number;
  ok: number;
  ecart: number;
  local_seul: number;
  api_seul: number;
  non_verifiable: number;
  absent: number;
}

export interface ControleResume {
  associationId: number;
  nom: string;
  sirenLocal: string | null;
  sirenNormalise: string | null;
  sirenValide: boolean;
  apiDisponible: boolean;
  summary: ControleSummary;
  issues: number;
}

export interface ControleDetail {
  association: {
    id: number;
    nom: string;
    sirenLocal: string | null;
    sirenNormalise: string | null;
    rnaLocal: string | null;
  };
  apiDisponible: boolean;
  apiErreurs: string[];
  rows: LigneComparaison[];
  apiSeul: DonneeApiSeule[];
  etablissements: EtablissementApi[];
  subventions: SubventionApi[];
  rubrique9: Rubrique9;
  issues: string[];
  summary: ControleSummary;
}

export async function listControles(refresh = false): Promise<{ items: ControleResume[] }> {
  const { data } = await api.get<{ items: ControleResume[] }>('/api/v1/entreprise/controles', {
    params: refresh ? { refresh: 1 } : undefined,
  });
  return data;
}

export async function getControle(id: number, refresh = false): Promise<ControleDetail> {
  const { data } = await api.get<ControleDetail>(`/api/v1/entreprise/associations/${id}`, {
    params: refresh ? { refresh: 1 } : undefined,
  });
  return data;
}
