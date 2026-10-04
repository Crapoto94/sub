# API Entreprise — habilitations (scopes) : état et demande d'extension

**Contexte** : application Subventions (Ville d'Ivry-sur-Seine), instruction des demandes de
subvention de fonctionnement des associations sportives (campagne 2027). Le module
« Contrôle API Entreprise » confronte les données des associations (base locale) aux données
publiques pour fiabiliser l'instruction et détecter les écarts / fraudes potentielles.

**Demandeur** : Ville d'Ivry-sur-Seine — SIRET `21940041300015` (paramètre `recipient`).

---

## 1. Scopes actuellement accordés

Vérifié le 2026-10-04 via `GET https://entreprise.api.gouv.fr/v2/privileges` :

| Scope | Fournisseur | Usage dans l'app | État |
|---|---|---|---|
| `unites_legales_etablissements_insee` | INSEE (Sirene) | Identité légale, SIRET siège, forme juridique, NAF, effectif, ESS | **exploité** |
| `associations_djepva` | DJEPVA / RNA (associations) | Nom, sigle, objet, adresse, agréments, régime, RUP, CEC, réseaux, établissements | **exploité** |
| `data_subvention_subventions` | DataSubvention | Subventions État / opérateurs (rubrique 9) | **exploité** |
| `open_data` | API Entreprise | Accès aux endpoints en open data | exploité (indirect) |

> Le token JWT d'accès porte exactement ces 4 scopes. Tout appel hors périmètre renvoie
> `[00100] « vos privilèges sont insuffisants »`.

---

## 2. Limites constatées (vérifiées en direct)

- **INPI RNE** (dirigeants, bénéficiaires effectifs) → privilèges insuffisants.
- **Banque de France** (bilans, notation) → privilèges insuffisants.
- **DGFiP** (attestation fiscale, liasses fiscales) → non habilité (404).
- Autres fournisseurs (URSSAF/ACOSS, Qualibat, AGEFIPH, ADEME, Douanes, MSA, Infogreffe…) → non habilités.

**Conséquence métier** : pour l'instruction des subventions, on ne peut contrôler que l'identité
légale et l'existence de subventions État. Les données **financières** et de **gouvernance**
(qui sont au cœur de l'analyse d'un dossier) ne sont pas accessibles aujourd'hui.

---

## 3. Scopes à demander (par ordre de priorité)

Demande à déposer sur **datapass.api.gouv.fr** (extension d'habilitation sur le token existant).

### Priorité 1 — Indispensable à l'analyse financière

| Scope | Fournisseur | Données obtenues | Usage attendu |
|---|---|---|---|
| `dgfip` (attestation fiscale) | DGFiP | Attestation de régularité fiscale | Vérifier l'existence/régularité de l'association |
| `comptes_associations_djepva` *(si disponible)* | DJEPVA / DataSubvention | Comptes et résultats déclarés (compte d'engagement) | Confronter charges/produits déclarés (rubrique 8) aux comptes officiels |
| `banque_de_france` (bilans) | Banque de France | Bilans, ratios, notation | Fiabiliser la situation financière (très pertinent > 23 000 €) |

### Priorité 2 — Gouvernance et transparence

| Scope | Fournisseur | Données obtenues | Usage attendu |
|---|---|---|---|
| `inpi_rne` (bénéficiaires effectifs, dirigeants) | INPI | Dirigeants, bénéficiaires effectifs | Contrôler la complétude du bureau exécutif (rubrique 10) |

### Priorité 3 — Confort d'instruction

| Scope | Fournisseur | Données obtenues | Usage attendu |
|---|---|---|---|
| `qualibat` / `agefiph` / `ademe` / … | divers | Certifications et aides | Contrôles ciblés si besoin |

---

## 4. Justification (à recopier dans datapass)

> Commune d'Ivry-sur-Seine (SIRET 21940041300015), dans le cadre de sa compétence en matière de
> subventions aux associations sportives, souhaite sécuriser et accélérer l'instruction des
> demandes (≈ 38 associations, campagne 2027). L'objectif est de **réduire les ressaisies**
> et de **contrôler la fiabilité des données déclarées** par les associations, dans une
> logique « Dites-le-nous une fois ».
>
> Les scopes déjà accordés (identité INSEE, fiche RNA DJEPVA, subventions DataSubvention) sont
> pleinement exploités. Pour aller au bout de la démarche de contrôle, nous demandons
> l'extension des habilitations aux données **financières** (DGFiP, Banque de France) et de
> **gouvernance** (INPI RNE), afin de confronter les comptes déclarés (charges, produits,
> subventions perçues) et la composition des instances aux informations officielles.
>
> Les données sont utilisées exclusivement pour l'instruction des subventions, stockées dans un
> système interne, non rediffusées à des tiers, et l'usage est tracé (RGPD respecté).

---

## 5. Bonnes pratiques / sécurité

- Le token est stocké uniquement dans le `.env` backend (non commité) ; il a été manipulé en
  clair pendant le développement → **le faire tourner sur api.gouv.fr** à l'issue du projet.
- Les appels portent systématiquement `recipient` (SIRET de la Ville), `object` et `context`.
- Limiter les appels (cache mémoire 10 min côté app ; quotas API Entreprise à surveiller).
