# Cahier des charges – Application « Quiz burn-out »

Version : 1.0 pré-développement  
Date : 26 août 2026

## 1. Objet

Concevoir une application web responsive de sensibilisation au burn-out et aux risques psychosociaux à partir d'une série éditorialement validée de 31 items répartis en trois quiz.

Le produit n'est ni un outil de diagnostic, ni une auto-évaluation clinique, ni un dispositif permettant d'évaluer la situation personnelle d'un répondant.

La finalité pédagogique est de déconstruire des idées reçues et de faire évoluer des raisonnements sur :
- le burn-out et ses facteurs ;
- les suites possibles, la reconnaissance et la reprise ;
- le regard et les comportements de l'entourage professionnel.

## 2. Sources de vérité

Ordre d'autorité :

1. `content/quiz1-master.md`
2. `content/quiz2-master.md`
3. `content/quiz3-master.md`
4. `content/regles-pedagogiques.md`
5. `content/referentiel-sources.md`
6. `data/questions-31.json`

Les trois fichiers `quiz*-master.md` sont les sources éditoriales de vérité.  
Le JSON est le format d'exécution de l'application. En cas de divergence, ne pas réécrire le contenu : signaler l'écart et réaligner le JSON sur le master.

## 3. Périmètre fonctionnel V1

### Inclus
- page d'accueil ;
- présentation des trois quiz ;
- lancement indépendant de chaque quiz ;
- navigation question par question ;
- prise en charge de 4 formats :
  - vrai/faux ;
  - QCM à choix unique ;
  - association ;
  - classement ;
- validation explicite de la réponse ;
- correction immédiate ;
- bloc « À retenir » ;
- approfondissements facultatifs :
  - « Pourquoi cette idée circule ? »
  - « Pour aller plus loin » ;
- consultation des sources ;
- progression dans le quiz ;
- reprise d'un quiz commencé sur le même navigateur ;
- écran final non clinique ;
- possibilité de revoir les questions ;
- remise à zéro de la progression ;
- fonctionnement mobile, tablette et ordinateur ;
- accessibilité clavier et lecteur d'écran.

### Hors périmètre V1
- compte utilisateur ;
- authentification ;
- espace personnel ;
- collecte de données de santé ;
- profil psychologique ;
- diagnostic ;
- recommandations médicales personnalisées ;
- classement entre utilisateurs ;
- gamification compétitive ;
- communauté ou commentaires ;
- back-office éditorial complet ;
- paiement ;
- certification de formation.

## 4. Architecture pédagogique

### Quiz 1 – 14 items
Objectif : comprendre le burn-out, ses facteurs et les principes de prévention.

### Quiz 2 – 8 items
Objectif : comprendre les suites possibles, les limites des inférences, la reconnaissance et les conditions de reprise.

### Quiz 3 – 9 items
Objectif : comprendre comment le regard et les comportements de l'entourage peuvent soutenir, stigmatiser, envahir ou mettre à distance.

Les blocs pédagogiques et l'ordre exact des questions sont définis dans `data/questions-31.json`.

## 5. Parcours utilisateur

### 5.1 Accueil
Afficher :
- le titre du projet ;
- une phrase de finalité ;
- un avertissement clair : outil de sensibilisation, pas outil diagnostique ;
- trois cartes de quiz avec titre, description courte et nombre de questions ;
- bouton « Commencer » ou « Reprendre » selon l'état local.

### 5.2 Introduction à un quiz
Afficher :
- le titre ;
- l'objectif ;
- l'avertissement propre au quiz ;
- le nombre de questions ;
- un bouton de démarrage.

Ne pas demander à l'utilisateur s'il a vécu un burn-out.

### 5.3 Question
Afficher une seule idée principale à la fois :
- contexte / idée reçue ;
- question ;
- interaction ;
- bouton « Valider ma réponse ».

La réponse peut être modifiée avant validation.  
Après validation, la réponse est figée pour cet essai.

### 5.4 Correction
Ordre :
1. statut neutre ;
2. corrigé court ;
3. « À retenir » ;
4. approfondissements facultatifs repliés ;
5. sources accessibles ;
6. bouton « Question suivante ».

### 5.5 Fin de quiz
Afficher :
- message de fin ;
- nombre de questions parcourues ;
- éventuellement le nombre de réponses attendues trouvées, de façon secondaire ;
- au maximum deux axes à revoir à partir des erreurs ;
- boutons « Revoir mes réponses », « Refaire le quiz », « Choisir un autre quiz ».

Interdictions :
- « vous êtes à risque » ;
- « votre profil est… » ;
- « vous connaissez mal le burn-out » ;
- niveau de vulnérabilité ;
- niveau de sévérité ;
- prévision de reprise ou de rechute.

## 6. Formats d'interaction

### QCM / vrai-faux
- un seul choix possible ;
- boutons radio ou cartes accessibles ;
- état sélectionné explicite ;
- aucune couleur seule pour communiquer le statut.

### Association
Utiliser une interaction accessible.
Le glisser-déposer peut être proposé, mais une alternative clavier obligatoire doit exister :
- sélectionner une situation ;
- sélectionner la réponse associée.

### Classement
Même principe :
- le glisser-déposer n'est jamais la seule interaction ;
- permettre de choisir une catégorie pour chaque élément.

## 7. Gestion de l'état

### V1 recommandée
Aucun backend obligatoire.

Conserver dans `localStorage` :
- quiz commencé ;
- dernière question atteinte ;
- réponses données ;
- questions validées ;
- état terminé ou non.

Ne jamais stocker :
- nom ;
- email ;
- diagnostic ;
- motif d'arrêt ;
- données médicales ;
- texte libre sur la santé.

Prévoir un bouton « Effacer ma progression ».

## 8. Score et remédiation

Le calcul de justesse peut être utilisé pour :
- afficher la correction ;
- déterminer les thèmes à revoir ;
- vérifier la logique de l'application.

Il ne doit pas devenir un score clinique.

La page finale privilégie :
- les idées à retenir ;
- les thèmes ayant suscité des erreurs ;
- la possibilité de relire.

Maximum : deux axes de remédiation.

## 9. Sources

Chaque item possède une liste de références dans le JSON.

V1 :
- afficher les références sous forme de liste ;
- rendre un lien cliquable uniquement si une URL validée existe ;
- ne jamais inventer d'URL ;
- permettre l'enrichissement futur des sources sans modifier le composant question.

Les informations internes suivantes ne sont pas affichées au public :
- `confidence` ;
- `sourceNature` ;
- `vigilanceMarkdown`.

## 10. Design

Direction générale :
- sobre ;
- calme ;
- lisible ;
- non médicalisante ;
- non infantilisante ;
- aucun code visuel de diagnostic ;
- éviter les interfaces anxiogènes ou alarmistes ;
- priorité à la lisibilité et à l'espace.

Le design doit fonctionner sans illustration.

Prévoir des variables de thème pour pouvoir appliquer ensuite une identité graphique sans toucher aux composants fonctionnels.

## 11. Accessibilité

Cible : WCAG 2.2 niveau AA autant que possible.

Exigences :
- navigation intégrale au clavier ;
- focus visible ;
- structure de titres cohérente ;
- labels explicites ;
- contrastes suffisants ;
- pas d'information uniquement par couleur ;
- messages de validation accessibles aux technologies d'assistance ;
- alternatives aux interactions drag-and-drop ;
- taille de cible tactile suffisante ;
- respect de `prefers-reduced-motion`.

## 12. Responsive

Priorité mobile-first.

Largeurs :
- petit mobile ;
- grand mobile ;
- tablette ;
- desktop.

Le contenu principal doit rester dans une largeur de lecture confortable sur desktop.

## 13. Architecture technique recommandée

### Stack cible
- Next.js 16 ou version actuelle compatible ;
- App Router ;
- TypeScript strict ;
- React ;
- CSS via Tailwind ou CSS variables ;
- composants accessibles ;
- rendu Markdown maîtrisé ;
- aucune base de données nécessaire en V1.

### Principe
Le contenu doit être séparé du code.

`data/questions-31.json` est importé comme donnée statique.

Les composants ne contiennent jamais le texte des questions en dur.

### Composants attendus
- `QuizCard`
- `QuizIntro`
- `ProgressIndicator`
- `QuestionRenderer`
- `SingleChoiceQuestion`
- `TrueFalseQuestion`
- `AssociationQuestion`
- `ClassificationQuestion`
- `AnswerFeedback`
- `Takeaway`
- `ExpandableExplanation`
- `SourcesList`
- `QuizSummary`
- `ResetProgress`

## 14. Routes recommandées

- `/` : accueil
- `/quiz/[quizId]` : introduction / reprise
- `/quiz/[quizId]/question/[order]` : question
- `/quiz/[quizId]/resultats` : restitution
- `/sources` : méthode et références générales
- `/a-propos` : finalité et limites du dispositif

Une architecture en état client sur une seule route quiz reste acceptable si elle respecte l'historique, l'accessibilité et la reprise de progression.

## 15. Données et confidentialité

V1 ne nécessite pas de consentement à des données de santé puisqu'aucune donnée médicale ou personnelle ne doit être collectée.

Si des analytics sont ajoutés :
- agrégés ;
- sans texte libre ;
- sans profil médical ;
- événements limités à des données de produit, par exemple :
  - quiz commencé ;
  - item terminé ;
  - quiz terminé ;
  - approfondissement ouvert ;
  - réponse « cette question m'a fait changer/nuancer d'avis ».

Ne pas envoyer le détail des réponses à un service tiers sans décision explicite ultérieure.

## 16. Performance

Objectifs :
- chargement rapide sur mobile ;
- contenu statique autant que possible ;
- aucune dépendance lourde non nécessaire ;
- pas de requête réseau pour charger une question ;
- application utilisable sur connexion moyenne.

## 17. Robustesse du contenu

Au démarrage / build, valider :
- 31 items ;
- Q1 = 14 ;
- Q2 = 8 ;
- Q3 = 9 ;
- un seul choix correct pour chaque QCM/vrai-faux ;
- Q1-06 = 6 associations ;
- Q1-11 = 2 catégories ;
- Q1-14 = 4 associations ;
- corrigé et « À retenir » présents pour tous les items ;
- au moins une source par item.

## 18. Sécurité éditoriale

Le code ne doit jamais :
- générer automatiquement une interprétation clinique à partir des réponses ;
- produire une recommandation médicale personnalisée ;
- extrapoler à partir d'une réponse ;
- réécrire dynamiquement les corrigés avec un modèle de langage ;
- afficher les notes éditoriales internes.

## 19. Mise à jour juridique

Avant publication, revalider les questions juridiques, en priorité :
- Q2-04 : maladie professionnelle et article L.461-1 du Code de la sécurité sociale ;
- puis les items AT, DUERP, santé au travail et confidentialité si une réforme est intervenue.

Le contenu juridique doit pouvoir être remplacé dans le JSON sans modifier les composants.

## 20. Définition du MVP terminé

Le MVP est considéré prêt pour le test utilisateur lorsque :
- les 31 questions sont fonctionnelles ;
- les quatre formats d'interaction fonctionnent ;
- les corrections correspondent au JSON ;
- la progression locale fonctionne ;
- l'interface est utilisable au clavier ;
- les alternatives au drag-and-drop fonctionnent ;
- aucune donnée sensible n'est collectée ;
- aucun message clinique n'est généré ;
- les trois quiz peuvent être terminés de bout en bout ;
- les tests de recette de `04-criteres-recette.md` sont passés.

Le test utilisateur intervient alors sur la version fonctionnelle complète.
