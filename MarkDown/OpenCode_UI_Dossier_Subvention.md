# SPECIFICATION UI - CONSULTATION D'UN DOSSIER DE SUBVENTION

## Contexte

Application de gestion des subventions sportives de la Ville d'Ivry-sur-Seine.

Stack obligatoire :
- Frontend : React 18 + TypeScript + Vite + TailwindCSS
- Backend : NodeJS + Express 5
- PostgreSQL (schéma dédié)
- Lucide React
- Framer Motion

Objectif : créer une page de consultation qui reproduit au maximum l'expérience du classeur Excel fourni aux associations.

---

# Philosophie UX

Ne PAS créer un formulaire administratif moderne constitué d'onglets et de cartes.

L'application doit donner l'impression de consulter le dossier Excel original.

L'utilisateur municipal doit retrouver immédiatement :

- les mêmes sections
- le même ordre
- les mêmes intitulés
- les mêmes regroupements visuels
- les mêmes tableaux
- les mêmes couleurs

Le rendu doit évoquer une feuille Excel professionnelle.

---

# Layout général

Page pleine largeur.

Largeur max : 1800px

Fond : gris très clair

Au centre : document blanc.

Style :
- fond #ffffff
- ombre légère
- coins légèrement arrondis
- padding important

Le dossier doit être affiché verticalement exactement dans l'ordre du fichier Excel.

---

# En-tête

Bloc bleu foncé.

Couleur : #173F73

Contenu :

Titre principal :
DOSSIER DE DEMANDE DE SUBVENTION DE FONCTIONNEMENT 2027

Sous-titre :
Associations Sportives
Ville d'Ivry-sur-Seine

Badge statut :
- Brouillon
- Déposé
- En instruction
- Validé
- Refusé

Montant demandé mis en avant.

---

# Navigation flottante

Créer un sommaire sticky à gauche.

Sections :

1. Identification
2. Adhérents et licenciés
3. Vie associative et bénévolat
4. Niveaux sportifs atteints
5. Projets réalisés
6. Projets prévus
7. Politique tarifaire
8. Situation financière
9. Financements
10. Pièces justificatives

Clic => scroll vers section.

Mettre en surbrillance la section affichée.

---

# COMPOSANT SECTION

Chaque partie reprend :

Bandeau bleu foncé.
Numéro de section.
Titre.

Exemple :

4 NIVEAUX SPORTIFS ATTEINTS - RESULTATS

Puis contenu sur fond blanc.

---

# 1 IDENTIFICATION DE L'ASSOCIATION

Utiliser une grille à deux colonnes.

Colonne gauche : libellé.
Colonne droite : valeur.

Respecter strictement les intitulés Excel.

Exemples :
- Nom officiel de l'association
- Sigle / abréviation usuelle
- Adresse du siège social
- N° RNA
- SIREN
- Fédération sportive d'affiliation

Style très proche d'une feuille.

---

# 2 ADHERENTS ET LICENCIES

C'est l'un des blocs les plus importants.

Créer exactement la logique du tableau Excel.

Colonnes :

Catégorie
Saison N-1
Saison N
Evolution
Prévisionnel
Evolution

Sous-sections :

- Répartition géographique
- Répartition par genre
- CSP
- Tranches d'âge
- Accessibilité

Afficher automatiquement :

- totaux
- écarts
- pourcentages d'évolution

Coloration :

augmentation => vert
baisse => rouge
stable => gris

---

# VISUALISATIONS

Ajouter des graphiques modernes sans dénaturer l'esprit Excel.

Utiliser Recharts.

Graphiques :

1. Répartition Femmes/Hommes
2. Répartition Ivryens/Non-Ivryens
3. Répartition âge
4. Evolution adhérents N-1 -> N -> Prévisionnel

---

# 3 VIE ASSOCIATIVE ET BENEVOLAT

Tableau RH identique à Excel.

Lignes :
- Bénévoles actifs
- Salariés permanents
- CDD
- Emplois aidés
- Agents mis à disposition
- Vacataires

Colonnes :
- Saison N-1
- Saison N
- Valorisation

Créer des KPI visibles :

- Nombre bénévoles
- Heures bénévolat
- Valorisation totale

---

# 4 NIVEAUX SPORTIFS ATTEINTS

Présentation type tableau fédéral.

Colonnes :
- Section
- Niveau
- Résultats

Niveaux affichés sous forme de badges :

Local
Départemental
Régional
National
International

---

# 5 PROJETS REALISES

Affichage sous forme de blocs chronologiques.

Chaque projet :

- intitulé
- description
- objectifs
- moyens
- publics visés

---

# 6 PROJETS PREVUS

Même présentation que section précédente.

Ajouter badge :
Prévu 2026-2027

---

# 7 POLITIQUE TARIFAIRE

Reprendre exactement le tableau Excel.

Colonnes :

Catégorie
Cotisation Ivryens
Cotisation Non-Ivryens
Nb adhérents
Total

Afficher un total général en pied.

---

# 8 SITUATION FINANCIERE

Créer deux niveaux de lecture.

Niveau 1 : carte synthèse.

- Charges
- Produits
- Résultat
- Trésorerie
- Fonds propres

Niveau 2 : tableau historique

2025
2026
2027 Prévisionnel

Ajouter graphiques.

---

# 9 AUTRES SUBVENTIONS ET FINANCEMENTS

Tableau identique Excel.

Colonnes :

Financeur
2025
2026
2027
Objet

Afficher total en bas.

---

# 10 PIECES JUSTIFICATIVES

Liste de documents.

Icône :
- vert si présent
- rouge si absent

Pouvoir prévisualiser PDF.

---

# MODE CONSULTATION

Par défaut tous les champs sont non éditables.

Bouton en haut :
Modifier le dossier.

---

# DONNEES DE DEMONSTRATION

Créer une maquette complète avec :

Association : Cercle des Nageurs d'Ivry

564 adhérents

95 000 € demandés

34 bénévoles

3.8 ETP

85 000 € de subvention Ville en 2026

238 500 € de produits

236 000 € de charges

Utiliser ces données dans toute la démonstration.

---

# LIVRABLES ATTENDUS

1. Route React
/pages/DossierAssociation.tsx

2. Composants
/components/dossier/*

3. Types TypeScript
/types/subventions.ts

4. Données mockées
/mocks/association.ts

5. Responsive desktop prioritaire.

6. Aspect visuel très proche du classeur Excel fourni.

7. Code de qualité production.

8. Tailwind uniquement.

9. Aucune valeur codée en dur hors données mock.

10. Utiliser Framer Motion avec discrétion.
