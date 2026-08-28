# Critères de recette – Application Quiz burn-out

À utiliser avant le test utilisateur.

## A. Intégrité du contenu

- [ ] 31 items chargés.
- [ ] Q1 contient exactement 14 items.
- [ ] Q2 contient exactement 8 items.
- [ ] Q3 contient exactement 9 items.
- [ ] IDs uniques.
- [ ] Ordre conforme aux masters.
- [ ] Aucun texte de question codé en dur dans les composants.
- [ ] Un seul choix correct pour tous les QCM/vrai-faux.
- [ ] Q1-06 contient 6 associations.
- [ ] Q1-11 contient 2 catégories de classement.
- [ ] Q1-14 contient 4 associations.
- [ ] Chaque item a un corrigé court.
- [ ] Chaque item a un « À retenir ».
- [ ] Chaque item a au moins une source.
- [ ] Les champs internes de vigilance/confiance ne sont jamais affichés.

## B. Parcours

- [ ] Accueil accessible.
- [ ] Les trois quiz sont lançables séparément.
- [ ] Un quiz peut être repris après fermeture du navigateur.
- [ ] La réponse peut être modifiée avant validation.
- [ ] La réponse est figée après validation.
- [ ] Le corrigé apparaît seulement après validation.
- [ ] La question suivante n'efface pas l'historique.
- [ ] Le dernier item mène à une page de résultats.
- [ ] Refaire un quiz remet son état à zéro.
- [ ] Effacer la progression fonctionne.

## C. QCM

- [ ] Sélection unique.
- [ ] Bonne réponse correctement détectée.
- [ ] Réponse incorrecte correctement détectée.
- [ ] Aucun indice visuel de bonne réponse avant validation.
- [ ] Ordre des options identique au master.

## D. Association / classement

- [ ] Fonctionne à la souris/tactile.
- [ ] Fonctionne intégralement sans drag-and-drop.
- [ ] Fonctionne au clavier.
- [ ] Les associations peuvent être corrigées.
- [ ] Les éléments de classement sont tous assignables.

## E. Restitution

- [ ] Ton neutre.
- [ ] Aucun message « mauvais élève ».
- [ ] Corrigé court avant approfondissement.
- [ ] « À retenir » visible.
- [ ] Approfondissements repliables.
- [ ] Sources accessibles.
- [ ] Maximum deux axes à revoir en fin de quiz.

## F. Sécurité pédagogique

Tester volontairement plusieurs profils de réponses :
- [ ] tout correct ;
- [ ] tout incorrect ;
- [ ] réponses aléatoires.

Dans aucun cas l'application ne doit afficher :
- [ ] diagnostic ;
- [ ] niveau de risque ;
- [ ] profil psychologique ;
- [ ] conseil d'arrêt/reprise ;
- [ ] probabilité de burn-out ;
- [ ] conclusion sur une situation personnelle ;
- [ ] conclusion juridique individualisée.

## G. Confidentialité

- [ ] Aucun nom demandé.
- [ ] Aucun email demandé.
- [ ] Aucun diagnostic demandé.
- [ ] Aucun champ libre sur la santé.
- [ ] LocalStorage ne contient que des données de progression.
- [ ] Un bouton permet d'effacer ces données.
- [ ] Aucun analytics tiers actif par défaut.

## H. Accessibilité

- [ ] Parcours complet au clavier.
- [ ] Focus visible.
- [ ] Ordre de tabulation logique.
- [ ] Labels accessibles.
- [ ] Statut de validation annoncé.
- [ ] Contrastes suffisants.
- [ ] Pas d'information uniquement colorée.
- [ ] Alternatives aux drag-and-drop.
- [ ] Cibles tactiles suffisantes.
- [ ] Réduction des animations respectée.

## I. Responsive

- [ ] 320 px.
- [ ] 375/390 px.
- [ ] tablette.
- [ ] desktop.
- [ ] aucun débordement horizontal.
- [ ] corrigés lisibles sans largeur excessive.

## J. Technique

- [ ] Build de production réussi.
- [ ] TypeScript sans erreur.
- [ ] Console sans erreur fonctionnelle.
- [ ] Tests automatisés passés.
- [ ] Pas de requête réseau nécessaire pour charger une question.
- [ ] Le contenu peut être remplacé par une nouvelle version du JSON sans réécrire les composants.

## K. Avant publication

- [ ] Revalidation juridique Q2-04.
- [ ] Revalidation des autres items juridiques si changement de droit.
- [ ] URLs de sources vérifiées avant de rendre les liens cliquables.
- [ ] Test utilisateur sur la version fonctionnelle complète effectué.
