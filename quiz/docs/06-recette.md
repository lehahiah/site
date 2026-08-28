# Résultat de recette — V1

Date : 26 août 2026
Méthode : tests automatisés (`node --test quiz/tests/*.test.mjs`, 56 tests, tous verts),
parcours réels dans Chromium (Playwright) et vérifications manuelles.

Légende : `OK` vérifié · `À FAIRE` hors de ce qui peut être vérifié ici.

## A. Intégrité du contenu

| Critère | État | Vérification |
|---|---|---|
| 31 items chargés | OK | `content.test.mjs` + validation au chargement |
| Q1 = 14, Q2 = 8, Q3 = 9 | OK | idem |
| IDs uniques | OK | idem |
| Ordre conforme aux masters | OK | ordre et blocs contrôlés |
| Aucun texte de question codé en dur | OK | test dédié sur `js/` et `parcours.html` |
| Un seul choix correct par QCM / vrai-faux | OK | test dédié |
| Q1-06 : 6 associations | OK | test dédié |
| Q1-11 : 2 catégories | OK | test dédié |
| Q1-14 : 4 associations | OK | test dédié |
| Corrigé court pour chaque item | OK | test dédié |
| « À retenir » pour chaque item | OK | test dédié |
| Au moins une source par item | OK | test dédié |
| Champs internes jamais affichés | OK | Ces trois champs sont retirés du fichier d'exécution ; tests anti-métadonnées sur les champs publics **et sur les sources** |

## B. Parcours

| Critère | État | Vérification |
|---|---|---|
| Accueil accessible | OK | e2e |
| Trois quiz lançables séparément | OK | e2e |
| Reprise après fermeture du navigateur | OK | e2e (contexte rouvert avec le stockage) |
| Réponse modifiable avant validation | OK | e2e |
| Réponse figée après validation | OK | e2e + test unitaire du réducteur |
| Corrigé seulement après validation | OK | e2e |
| La question suivante n'efface pas l'historique | OK | `pushState` ; retour arrière vérifié |
| Le dernier item mène aux résultats | OK | e2e sur Q2 et Q3 complets |
| Refaire un quiz remet son état à zéro | OK | vérifié : URL ramenée à q=1, réponses et validations vidées |
| Effacer la progression fonctionne | OK | e2e : `localStorage` vide après confirmation |

## C. QCM

| Critère | État |
|---|---|
| Sélection unique | OK (boutons radio natifs) |
| Bonne réponse détectée | OK |
| Réponse incorrecte détectée | OK |
| Aucun indice de bonne réponse avant validation | OK — corrigé : 17 énoncés affichaient la réponse attendue (voir `05-decisions-techniques.md` §1.1) |
| Ordre des options identique au master | OK |

## D. Association / classement

| Critère | État |
|---|---|
| Fonctionne à la souris / au tactile | OK |
| Fonctionne intégralement sans glisser-déposer | OK — aucun glisser-déposer n'est implémenté |
| Fonctionne au clavier | OK (listes déroulantes et boutons radio natifs) |
| Les associations peuvent être corrigées | OK tant que l'item n'est pas validé |
| Tous les éléments de classement sont assignables | OK (6 éléments, 2 catégories) |

## E. Restitution

| Critère | État |
|---|---|
| Ton neutre | OK — « Exact » / « Réponse attendue » |
| Aucun message « mauvais élève » | OK — test e2e sur formulations interdites |
| Corrigé court avant approfondissement | OK |
| « À retenir » visible | OK |
| Approfondissements repliables | OK, repliés par défaut |
| Sources accessibles | OK, dans un volet et sur `/sources.html` |
| Maximum deux axes à revoir | OK — test unitaire et e2e (tout faux → 2 axes) |

## F. Sécurité pédagogique

| Profil de réponses | Résultat |
|---|---|
| Tout correct (Q2) | 8/8, aucun axe, aucune formulation clinique |
| Tout incorrect (Q3) | 0/9, 2 axes maximum, aucune formulation clinique |
| Réponses mixtes (Q2, 4/8) | 2 axes, texte descriptif uniquement |

Aucun diagnostic, niveau de risque, profil psychologique, conseil d'arrêt ou de reprise,
probabilité de burn-out, conclusion sur une situation personnelle ou conclusion juridique
individualisée n'est produit : le code ne contient aucune logique d'inférence d'état de
santé, et les tests échouent si l'une de ces formulations apparaît.

## G. Confidentialité

| Critère | État |
|---|---|
| Aucun nom demandé | OK |
| Aucun e-mail demandé | OK |
| Aucun diagnostic demandé | OK |
| Aucun champ libre sur la santé | OK — l'application ne contient aucun champ texte |
| `localStorage` limité à la progression | OK — e2e : une seule clé, sept champs de progression |
| Bouton d'effacement | OK (accueil et page de résultats) |
| Aucun analytics tiers actif | OK — interface d'événements sans collecteur, testée |

## H. Accessibilité (cible WCAG 2.2 AA)

| Critère | État |
|---|---|
| Parcours complet au clavier | OK — e2e : sélection et validation sans souris |
| Focus visible | OK — contour 3 px, contrasté |
| Ordre de tabulation logique | OK — lien d'évitement, en-tête, contenu, actions |
| Labels accessibles | OK — `label` pour chaque choix, `legend` par groupe |
| Statut de validation annoncé | OK — région `aria-live` + focus déplacé sur le statut |
| Contrastes suffisants | OK — de 6,4:1 à 14,7:1 en clair, de 6,9:1 à 13,9:1 en sombre |
| Pas d'information uniquement colorée | OK — « Réponse attendue », « Votre réponse », « Catégorie attendue » en toutes lettres |
| Alternatives au glisser-déposer | OK — pas de glisser-déposer du tout |
| Cibles tactiles suffisantes | OK — 44 px minimum sur les contrôles |
| Réduction des animations respectée | OK — `prefers-reduced-motion` |
| Lecteur d'écran réel | À FAIRE — NVDA / VoiceOver sur la version fonctionnelle |
| Hiérarchie de titres sans saut | OK — vérifié sur les 6 écrans |
| Zoom 200 % | OK — aucun débordement (accueil, association, sources) |
| Thème sombre | OK — aucun texte sous 4,5:1 |

## I. Responsive

| Largeur | État |
|---|---|
| 320 px | OK — test automatisé : aucun débordement horizontal sur 4 pages |
| 375 / 390 px | OK |
| Tablette | OK |
| Desktop | OK — largeur de lecture limitée (42 rem) |

## J. Technique

| Critère | État |
|---|---|
| Build de production | Sans objet — site statique sans étape de build (voir `05-decisions-techniques.md` §2) |
| TypeScript sans erreur | Sans objet — JavaScript documenté et validé à l'exécution et par les tests |
| Console sans erreur | OK — vérifié sur chaque scénario e2e |
| Tests automatisés passés | OK — 56 tests |
| Aucune requête réseau pour charger une question | OK — contenu chargé une fois puis conservé en mémoire |
| Contenu remplaçable sans réécrire les composants | OK — un nouveau JSON suffit ; la validation signale les écarts |

## K. Avant publication

| Critère | État |
|---|---|
| Revalidation juridique Q2-04 | À FAIRE (article L. 461-1, texte évoluant au 30 septembre 2026) |
| Revalidation des autres items juridiques | À FAIRE si le droit a évolué |
| URL des sources vérifiées | À FAIRE — aucune URL n'est présente dans les données, donc aucun lien cliquable pour l'instant |
| Test utilisateur | À FAIRE sur la version fonctionnelle complète |

## L. Passe d'audit (26 août 2026)

Trois audits indépendants ont été menés après la V1 ; leurs constats et les corrections
apportées sont détaillés dans `05-decisions-techniques.md` §6. Les tests ajoutés à cette
occasion couvrent : historique du navigateur, série complète du Quiz 1 avec les quatre
formats, adresses hors bornes, écran d'erreur sur contenu annexe invalide, effacement
depuis la page de résultats, rendu des listes sur le contenu réel, absence de note de
vigilance dans les sources et absence de champ interne dans le contenu servi.
