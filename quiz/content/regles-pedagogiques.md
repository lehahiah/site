# Règles pédagogiques de restitution
## Série Quiz burn-out - spécification finale avant développement

Date : 26 août 2026

# 1. Principe général

Le produit est un **outil de sensibilisation**, pas un test clinique ni une évaluation de la personne.

La restitution doit corriger une représentation, expliquer un raisonnement et laisser un repère mémorisable.

Elle ne doit jamais :
- diagnostiquer ;
- calculer un niveau de risque individuel ;
- qualifier la situation personnelle du répondant ;
- prédire une reprise, une rechute ou une reconnaissance AT/MP ;
- établir un profil psychologique ;
- utiliser un vocabulaire de réussite/échec humiliant ou culpabilisant.

# 2. Séquence obligatoire pour chaque item

## Avant validation

Afficher :
1. la situation ou l'idée reçue ;
2. la question ;
3. les réponses.

La personne peut modifier sa réponse tant qu'elle n'a pas validé.

## Après validation

Afficher dans cet ordre :

### A. Statut de la réponse
Formulation neutre :
- **« Réponse attendue »** si réponse incorrecte ;
- **« Exact »** ou **« C'est bien cette nuance »** si réponse correcte.

Eviter :
- « Mauvaise réponse » ;
- « Faux ! » utilisé comme sanction ;
- points perdus ;
- séries, badges ou classement.

### B. Corrigé court
Objectif : expliquer **pourquoi**.

Règle de longueur :
- cible : **45 à 80 mots** ;
- maximum : **100 mots** hors cas juridique exceptionnel.

Le corrigé ne doit pas introduire une nouvelle démonstration complexe non nécessaire à la résolution de la question.

### C. « À retenir »
Une seule idée.
- une phrase ;
- idéalement 12 à 25 mots ;
- jamais une règle clinique individuelle.

### D. Approfondissements facultatifs
Deux niveaux maximum :
1. **Pourquoi cette idée circule ?**
2. **Pour aller plus loin**

Ils sont repliés par défaut.

# 3. Sources

Les sources sont accessibles depuis chaque item mais ne sont pas imposées à la lecture.

Affichage public recommandé :
- institution / auteurs ;
- titre court ;
- année ;
- lien.

Ne pas afficher :
- niveau de confiance ;
- balises `[LEGAL]`, `[DONNÉE]`, `[PRATIQUE]` ;
- notes internes de vigilance.

# 4. Restitution finale du quiz

## Ce qu'on peut afficher

- nombre de questions parcourues ;
- éventuellement le nombre de réponses attendues trouvées, de façon secondaire et descriptive ;
- les idées reçues qui ont le plus posé difficulté ;
- **maximum deux axes de remédiation** ;
- possibilité de revoir les questions ;
- accès aux sources.

## Ce qu'on n'affiche jamais

- « Vous êtes à risque » ;
- « Vous connaissez mal le burn-out » ;
- « Profil vulnérable / résilient / expert » ;
- niveau de sévérité ;
- interprétation clinique ;
- conseil médical personnalisé.

Le résultat décrit **des réponses**, jamais **la personne**.

# 5. Mesure de la surprise

La finalité du projet est de faire évoluer des représentations, pas seulement d'obtenir une bonne réponse.

Après le corrigé, une mesure facultative et non bloquante peut être proposée :

> **Cette question a-t-elle changé ou nuancé ce que vous pensiez ?**

Choix :
- Oui, clairement.
- Un peu.
- Non, je le savais déjà.

Cette donnée est analytique. Elle ne modifie jamais le résultat du répondant.

# 6. Gestion des contenus sensibles

## Quiz 1
Rappel discret en introduction :
> Ce quiz informe sur le burn-out et les RPS. Il ne permet pas de déterminer si une personne est en burn-out.

## Quiz 2
Orientation plus visible, car le contenu touche aux suites, à la santé et à la reconnaissance :
> Les questions qui suivent ne permettent pas de décider si un arrêt, une reprise ou une reconnaissance AT/MP s'applique à une situation personnelle.

## Quiz 3
Rappel du rôle :
> Observer un changement peut conduire à proposer un soutien ; cela ne permet pas de poser un diagnostic.

# 7. Règles de ton

- langage direct ;
- pas de dramatisation ;
- pas de moralisation ;
- pas de « bon réflexe » / « bonne question » ;
- pas de psychologisation ;
- pas de récit héroïque du « burn-out qui rend plus fort » ;
- ne pas opposer soutien individuel et prévention organisationnelle ;
- employer « peut », « certaines personnes », « selon les circonstances » lorsque les données ne permettent pas une règle universelle.

# 8. Règles de difficulté

Les distracteurs doivent rester plausibles.

Eviter qu'une bonne réponse se distingue systématiquement par :
- sa longueur ;
- un vocabulaire plus prudent ;
- plusieurs nuances absentes des autres réponses ;
- une formulation moralement plus valorisante.

Les positions A/B/C/D doivent rester réparties sans motif prévisible à l'échelle de chaque quiz.

# 9. Accessibilité cognitive

- une idée principale par écran ;
- phrases courtes dans le parcours principal ;
- acronymes développés à la première occurrence ;
- approfondissements hors flux principal ;
- pas de pavé juridique dans le corrigé court ;
- chiffres complexes réservés à l'approfondissement ;
- ne pas exiger la lecture des sources pour comprendre le corrigé.

# 10. Cas juridiques

Pour AT/MP, DUERP, santé au travail, confidentialité et reprise :
- dater la vérification juridique dans les métadonnées ;
- permettre une mise à jour de la source sans modifier toute l'architecture de l'item ;
- ne pas exposer de seuil réglementaire dans la question lorsqu'il n'est pas nécessaire au raisonnement ;
- en cas de réforme, suspendre ou modifier l'item avant publication si la réponse centrale est affectée.

# 11. Données à conserver pour chaque item

Le futur modèle de données doit pouvoir conserver séparément :
- identifiant ;
- quiz ;
- bloc ;
- représentation visée ;
- question ;
- réponses ;
- réponse attendue ;
- corrigé court ;
- « À retenir » ;
- « Pourquoi cette idée circule ? » ;
- « Pour aller plus loin » ;
- sources ;
- nature de la source ;
- niveau de confiance interne ;
- point de vigilance ;
- date de dernière vérification.

Cette séparation permettra de modifier une source ou un approfondissement sans réécrire l'interface.

# 12. Gate pédagogique avant développement

Conditions désormais remplies :
- périmètre des trois quiz figé ;
- 31 items documentés ;
- garde-fous déontologiques définis ;
- source principale identifiable pour chaque item ;
- règles de restitution fixées ;
- restitution finale non clinique définie ;
- points juridiques à revalider identifiés ;
- test utilisateur volontairement reporté à la version fonctionnelle.

**Décision : le projet peut passer à la phase technique.**
