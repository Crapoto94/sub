import type { Association } from '../../api/associations';
import DossierSection from './DossierSection';
import { formatDate } from './format';

// 1. IDENTIFICATION DE L'ASSOCIATION : grille à deux colonnes (libellé / valeur).
export default function SectionIdentification({ association }: { association: Association }) {
  const rows: Array<[string, string]> = [
    ['Nom officiel de l’association', association.nomOfficielAssociation ?? '—'],
    ['Sigle / abréviation usuelle', association.sigleAbreviation ?? '—'],
    ['Objet de l’association', association.objetAssociation ?? '—'],
    ['Adresse du siège social', association.adresseSiegeSocial ?? '—'],
    ['Code postal / Ville', association.codePostal && association.ville ? `${association.codePostal} ${association.ville}` : association.ville ?? '—'],
    ['E-mail', association.email ?? '—'],
    ['Téléphone', association.telephone ?? '—'],
    ['Site web / réseaux sociaux', association.siteWebReseauxSociaux ?? '—'],
    ['N° RNA', association.numeroRna ?? '—'],
    ['SIREN', association.numeroSiren ?? '—'],
    ['Date de création', formatDate(association.dateCreation)],
    ['Agrément Jeunesse et Sports', association.agrementJeunesseSports ?? '—'],
    ['Fédération sportive d’affiliation', association.federationSportiveAffiliation ?? '—'],
    ['Disciplines pratiquées', association.disciplinesPratiquees ?? '—'],
    ['N° d’affiliation', association.numeroAffiliation ?? '—'],
    ['Catégorie sportive', association.categorieSportive ?? '—'],
  ];

  return (
    <DossierSection numero={1} titre="Identification de l’association" id="section-1">
      <div className="grid grid-cols-1 gap-x-10 gap-y-1 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[220px_1fr] items-start gap-3 border-b border-slate-100 py-2.5">
            <p className="text-[13px] font-medium text-slate-500">{label}</p>
            <p className="text-[13px] text-slate-800">{value}</p>
          </div>
        ))}
      </div>
    </DossierSection>
  );
}
