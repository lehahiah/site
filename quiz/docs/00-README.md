# Dossier de passation – Application Quiz burn-out

Ce dossier contient tout ce qui est nécessaire pour commencer le développement de la V1.

## Fichiers à donner à l'outil de développement

Donner **tout le dossier**.

Ordre de lecture recommandé :

1. `01-cahier-des-charges-application.md`
2. `02-prompt-maitre-developpement.md`
3. `content/regles-pedagogiques.md`
4. `content/quiz1-master.md`
5. `content/quiz2-master.md`
6. `content/quiz3-master.md`
7. `content/referentiel-sources.md`
8. `data/questions-31.json`
9. `03-schema-donnees.md`
10. `04-criteres-recette.md`

## Fichier à copier dans l'IA de développement

Utiliser intégralement :
`02-prompt-maitre-developpement.md`

Puis joindre le reste du dossier.

## Sources éditoriales de vérité

- `content/quiz1-master.md` — 14 items
- `content/quiz2-master.md` — 8 items
- `content/quiz3-master.md` — 9 items

Total : 31 items.

## Fichier runtime

`data/questions-31.json`

Il est dérivé des trois masters et validé pour :
- 31 items ;
- 14 / 8 / 9 ;
- un seul choix correct par QCM/vrai-faux ;
- associations et classement ;
- présence des corrigés, « À retenir » et sources.

## Documents de gouvernance

- `content/referentiel-sources.md`
- `content/regles-pedagogiques.md`
- `content/validation-editoriale.md`

## Décision technique recommandée pour V1

- application web responsive ;
- Next.js + TypeScript ;
- contenu statique JSON ;
- pas de compte ;
- pas de base de données ;
- progression locale ;
- aucun stockage de données de santé.

Cette architecture est volontairement légère. Elle permet de tester l'application complète avant d'ajouter des services externes.

## Ce qui ne doit plus être rediscuté par défaut

- la finalité non diagnostique ;
- le nombre et l'ordre des 31 items ;
- les réponses attendues ;
- les corrigés ;
- le principe des approfondissements ;
- l'absence de profil clinique ;
- le test utilisateur seulement une fois la version fonctionnelle construite.

## Ce qui reste une décision de conception

- identité visuelle finale ;
- nom public définitif ;
- style exact des cartes/boutons ;
- éventuel affichage secondaire du nombre de bonnes réponses ;
- outil d'analytics éventuel après le test ;
- hébergement final.

## Avant publication

Revalider en priorité la question Q2-04 relative à la maladie professionnelle et les textes juridiques qui auraient évolué depuis le 26 août 2026.
