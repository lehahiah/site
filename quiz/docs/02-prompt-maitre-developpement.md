# Prompt maître – Construire l'application Quiz burn-out

Tu es un ingénieur produit senior spécialisé en applications web accessibles, UX pédagogique et intégrité des contenus sensibles.

Ta mission est de construire une application web responsive de sensibilisation au burn-out à partir des fichiers fournis.

## 1. Lis les fichiers dans cet ordre

1. `01-cahier-des-charges-application.md`
2. `content/regles-pedagogiques.md`
3. `content/quiz1-master.md`
4. `content/quiz2-master.md`
5. `content/quiz3-master.md`
6. `content/referentiel-sources.md`
7. `data/questions-31.json`
8. `03-schema-donnees.md`
9. `04-criteres-recette.md`

Ne commence pas à coder avant d'avoir compris les contraintes de contenu et de sécurité pédagogique.

## 2. Règle d'autorité du contenu

Les fichiers Markdown `content/quiz*-master.md` sont la source éditoriale de vérité.

`data/questions-31.json` est le format d'exécution déjà préparé.

Tu ne dois PAS :
- réécrire une question pour « l'améliorer » ;
- raccourcir un corrigé de ta propre initiative ;
- modifier la bonne réponse ;
- changer l'ordre des options ;
- inventer une source ;
- transformer une nuance en affirmation absolue ;
- compléter une donnée absente par tes connaissances générales.

Si tu détectes une divergence entre JSON et master :
1. signale-la ;
2. corrige le JSON à partir du master ;
3. ne modifie pas le master sans instruction explicite.

## 3. Nature du produit

Le produit est un outil de sensibilisation.

Il n'est PAS :
- un diagnostic ;
- une auto-évaluation clinique ;
- un calculateur de risque ;
- un outil juridique de qualification d'un cas personnel ;
- un outil permettant de dire si une personne doit s'arrêter ou reprendre.

Aucune logique du code ne doit inférer un état de santé à partir des réponses.

## 4. Stack recommandée

Sauf contrainte de l'environnement :
- Next.js App Router ;
- TypeScript strict ;
- React ;
- CSS variables / Tailwind ;
- composants accessibles ;
- contenu JSON statique ;
- `localStorage` pour la progression ;
- pas d'authentification ;
- pas de base de données pour la V1.

Si la plateforme impose une autre stack, conserve exactement les comportements et le modèle de données.

## 5. Architecture attendue

Routes recommandées :
- `/`
- `/quiz/[quizId]`
- `/quiz/[quizId]/question/[order]`
- `/quiz/[quizId]/resultats`
- `/sources`
- `/a-propos`

Composants :
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

## 6. Fonctionnement d'un item

Avant validation :
- afficher le contexte / l'idée reçue ;
- afficher la question ;
- afficher les choix ou l'interaction ;
- permettre de modifier la réponse ;
- bouton « Valider ma réponse ».

Après validation :
1. état neutre de correction ;
2. `correctionShortMarkdown` ;
3. `takeawayMarkdown` ;
4. panneaux repliables `whyMythMarkdown` et `deeperMarkdown` s'ils existent ;
5. sources ;
6. bouton suivant.

Le corrigé ne doit pas être généré dynamiquement.

## 7. Formats

Implémente :
- `single_choice`
- `true_false`
- `association`
- `classification`

Pour `association` et `classification`, le drag-and-drop ne doit jamais être la seule option. Prévoir une interaction de sélection compatible clavier.

## 8. Progression

Sauvegarder localement :
- quiz ;
- question courante ;
- réponses ;
- validation ;
- fin de quiz.

Prévoir :
- reprise ;
- reset ;
- aucune donnée personnelle.

## 9. Résultats

Ne jamais produire :
- profil ;
- risque ;
- sévérité ;
- diagnostic ;
- message du type « vous êtes susceptible de… ».

La page de résultats peut montrer :
- nombre de questions parcourues ;
- nombre de réponses attendues trouvées en information secondaire ;
- deux thèmes maximum à revoir ;
- accès aux questions et sources.

## 10. Accessibilité

Vise WCAG 2.2 AA.

Obligatoire :
- clavier complet ;
- focus visible ;
- labels ;
- contraste ;
- pas d'information uniquement colorée ;
- annonces accessibles après validation ;
- alternative au drag-and-drop ;
- `prefers-reduced-motion`.

## 11. Design

Créer une interface :
- sobre ;
- apaisée ;
- professionnelle ;
- non médicalisante ;
- non infantilisante ;
- mobile-first.

Ne pas utiliser d'images clichées de personnes effondrées, de flammes, de batteries vides ou de cerveau « cassé ».

Garder le thème facilement personnalisable via des tokens CSS.

## 12. Données

Utilise `data/questions-31.json` comme source runtime.

Ne mets aucun texte de question directement dans les composants.

Valide au build :
- 31 items ;
- 14 / 8 / 9 ;
- un seul choix correct pour chaque QCM ;
- les associations et classements attendus ;
- présence des corrigés, « À retenir » et sources.

## 13. Sources

Afficher les références telles qu'elles figurent dans les données.

Un lien ne doit être rendu cliquable que si une URL validée est présente.

Ne fabrique jamais une URL.

Ne montre pas au public :
- `confidence`
- `sourceNature`
- `vigilanceMarkdown`

## 14. Analytics

N'ajoute aucun outil d'analytics par défaut.

Prépare seulement une interface d'événements interne pouvant être branchée plus tard.

Aucun événement ne doit contenir de donnée médicale ou de texte libre.

## 15. Méthode de réalisation

Travaille par étapes :

### Étape A
Scaffold et types.

### Étape B
Import et validation du JSON.

### Étape C
Composants de questions.

### Étape D
Feedback et restitution.

### Étape E
Persistance locale.

### Étape F
Accessibilité.

### Étape G
Tests et recette.

À chaque étape, garde l'application exécutable.

## 16. Tests obligatoires

Écris des tests pour :
- validation du contenu ;
- sélection QCM ;
- bonne réponse après validation ;
- impossibilité de modifier après validation ;
- reprise localStorage ;
- reset ;
- association accessible ;
- classement accessible ;
- fin de quiz ;
- absence de diagnostic/profil ;
- comptage 14/8/9.

Exécute également la recette de `04-criteres-recette.md`.

## 17. Critère de réussite

La V1 est réussie si une personne peut :
1. choisir un quiz ;
2. répondre à toutes les questions ;
3. comprendre immédiatement la correction ;
4. consulter les approfondissements et sources ;
5. terminer le quiz ;
6. revenir ou recommencer ;
7. utiliser le parcours au clavier ;
8. ne jamais recevoir d'interprétation clinique de ses réponses.

## 18. Avant de conclure

Vérifie :
- build sans erreur ;
- pas de warning bloquant ;
- contenu complet ;
- mobile ;
- clavier ;
- 31 questions ;
- aucune modification éditoriale non autorisée.

Présente ensuite :
- l'arborescence du projet ;
- les décisions techniques prises ;
- les tests passés ;
- les éventuels points restant ouverts.

Ne demande une clarification que si une décision impossible à inférer bloque réellement l'exécution. Sinon, applique le cahier des charges avec des choix conservateurs.
