// Types des sections d'un dossier de subvention (consultation type classeur Excel).
// Correspondance avec l'API : /api/v1/dossiers/:id -> sections

export type NiveauSportif = 'Local' | 'Départemental' | 'Régional' | 'National' | 'International';

export interface EffectifsSection {
  ivryens: number | null;
  nonIvryens: number | null;
  femmes: number | null;
  hommes: number | null;
  salaries: number | null;
  etudiants: number | null;
  demandeursEmploi: number | null;
  retraites: number | null;
  nonCommunique: number | null;
  petiteEnfance0_5: number | null;
  enfance6_14: number | null;
  adolescents15_18: number | null;
  jeunes19_29: number | null;
  adultes30_59: number | null;
  seniors60_74: number | null;
  grandAge75Plus: number | null;
  personnesSituationHandicap: number | null;
  beneficiairesTarifsReduitsSociaux: number | null;
  actionsPublicsEloignes: string | null;
  nombreBeneficiairesPassSport: number | null;

  ivryensN1: number | null;
  nonIvryensN1: number | null;
  femmesN1: number | null;
  hommesN1: number | null;
  salariesN1: number | null;
  etudiantsN1: number | null;
  demandeursEmploiN1: number | null;
  retraitesN1: number | null;
  nonCommuniqueN1: number | null;
  petiteEnfance0_5N1: number | null;
  enfance6_14N1: number | null;
  adolescents15_18N1: number | null;
  jeunes19_29N1: number | null;
  adultes30_59N1: number | null;
  seniors60_74N1: number | null;
  grandAge75PlusN1: number | null;
  personnesSituationHandicapN1: number | null;
  beneficiairesTarifsReduitsSociauxN1: number | null;
  nombreBeneficiairesPassSportN1: number | null;

  ivryensPrev: number | null;
  nonIvryensPrev: number | null;
  femmesPrev: number | null;
  hommesPrev: number | null;
  salariesPrev: number | null;
  etudiantsPrev: number | null;
  demandeursEmploiPrev: number | null;
  retraitesPrev: number | null;
  nonCommuniquePrev: number | null;
  petiteEnfance0_5Prev: number | null;
  enfance6_14Prev: number | null;
  adolescents15_18Prev: number | null;
  jeunes19_29Prev: number | null;
  adultes30_59Prev: number | null;
  seniors60_74Prev: number | null;
  grandAge75PlusPrev: number | null;
  personnesSituationHandicapPrev: number | null;
  beneficiairesTarifsReduitsSociauxPrev: number | null;
  nombreBeneficiairesPassSportPrev: number | null;
}

export interface VieAssociativeSection {
  dateDerniereAssembleeGenerale: string | null;
  reglementInterieurAJour: number | null;
  benevolesActifs: number | null;
  salariesPermanentsEtp: number | null;
  salariesCddCddu: number | null;
  emploisAides: number | null;
  agentsMisADisposition: number | null;
  vacatairesIntervenants: number | null;
  nombreHeuresBenevoles: number | null;
  montantValorisationBenevolat: number | null;
  actionsFormationsRealisees: string | null;

  benevolesActifsN1: number | null;
  salariesPermanentsEtpN1: number | null;
  salariesCddCdduN1: number | null;
  emploisAidesN1: number | null;
  agentsMisADispositionN1: number | null;
  vacatairesIntervenantsN1: number | null;
  nombreHeuresBenevolesN1: number | null;
}

export interface NiveauSportifRow {
  id: number;
  categorieSection: string | null;
  niveauSportif: string | null;
  principauxResultatsSportifs: string | null;
  nombreDeplacements: number | null;
  lieuxDeplacements: string | null;
  objectifsSportifsSaisonSuivante: string | null;
}

export interface ProjetRow {
  id: number;
  intitule: string | null;
  description: string | null;
  objectifs: string | null;
  moyensMisEnOeuvre: string | null;
  publicsVises: string | null;
}

export interface TarifRow {
  id: number;
  categorieCotisation: string | null;
  cotisationIvryens: number | null;
  cotisationNonIvryens: number | null;
  nombreAdherents: number | null;
  montantTotalEstime: number | null;
}

export interface SituationFinanciereSection {
  totalCharges: number | null;
  totalProduits: number | null;
  subventionVille: number | null;
  resultatNet: number | null;
  tresorerieDisponible: number | null;
  fondsPropresReserves: number | null;
  montantSubventionSollicitee: number | null;
  justificationMontantDemande: string | null;

  totalCharges2025: number | null;
  totalProduits2025: number | null;
  subventionVille2025: number | null;
  totalCharges2027: number | null;
  totalProduits2027: number | null;
  subventionVille2027: number | null;
}

export interface FinancementRow {
  id: number;
  financeur: string | null;
  montantAccorde2025: number | null;
  montantAccorde2026: number | null;
  montantSollicite2027: number | null;
  objetFinancement: string | null;
}

export interface PieceRow {
  id: number;
  typePiece: string | null;
  fichier: string | null;
  dateDepot: string | null;
  valide: number | null;
}
