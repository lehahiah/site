# Quiz burn-out — application V1

Outil de sensibilisation au burn-out et aux risques psychosociaux : 31 idées reçues
réparties en trois séries (14 / 8 / 9), corrigées une par une, sources à l'appui.

**Ce produit n'est pas un outil de diagnostic**, ni une auto-évaluation clinique, ni un
calculateur de risque, ni un outil de qualification juridique d'une situation personnelle.

## Lancer l'application

Le dossier est un site statique : aucune étape de build, aucune dépendance d'exécution.

```bash
npx http-server -p 8123 .      # depuis la racine du dépôt
# puis ouvrir http://127.0.0.1:8123/quiz/
```

Un serveur est nécessaire (les modules ES et le chargement du JSON ne fonctionnent pas
en `file://`).

## Tests

```bash
node --test quiz/tests/*.test.mjs
```

- `tests/content.test.mjs` — intégrité du contenu (recette A).
- `tests/logic.test.mjs` — formats de questions, progression locale, restitution, rendu Markdown, événements.
- `tests/parcours.e2e.test.mjs` — parcours réel dans Chromium (Playwright). Ignoré automatiquement si Playwright est absent.

## Régénérer le jeu de données

`data/questions-31.source.json` est l'export fourni dans le dossier de passation.
`data/questions-31.json` en est la version normalisée, utilisée à l'exécution.

```bash
node quiz/tools/normalize-dataset.mjs           # régénère le fichier runtime
node quiz/tools/normalize-dataset.mjs --check   # vérifie qu'il est à jour
```

Le script ne réécrit aucun contenu éditorial : il retire des champs publics les
métadonnées internes et les mentions de réponse attendue laissées par l'extraction
(voir `docs/05-decisions-techniques.md`).

## Arborescence

```
quiz/
├── index.html                 Accueil : les trois séries
├── parcours.html              Introduction, questions, restitution
├── sources.html               Références publiques par question
├── a-propos.html              Finalité, limites, confidentialité
├── css/quiz.css               Thème par tokens CSS
├── js/
│   ├── app-accueil.js         Contrôleur de l'accueil
│   ├── app-parcours.js        Contrôleur du parcours (état, historique, persistance)
│   ├── app-sources.js         Contrôleur de la page sources
│   ├── dataset.js             Chargement et validation du contenu
│   ├── validate.js            Règles de validation du contenu
│   ├── scoring.js             Justesse, synthèse, axes de remédiation (module pur)
│   ├── storage.js             Progression locale (module pur + accès localStorage)
│   ├── markdown.js            Rendu Markdown restreint et échappé
│   ├── analytics.js           Interface d'événements interne (aucun collecteur par défaut)
│   ├── dom.js                 Aides DOM
│   └── components/            QuizCard, QuizIntro, ProgressIndicator, QuestionRenderer,
│                              SingleChoiceQuestion, TrueFalseQuestion, AssociationQuestion,
│                              ClassificationQuestion, AnswerFeedback, Takeaway,
│                              ExpandableExplanation, SourcesList, PerceptionCheck,
│                              QuizSummary, ResetProgress
├── data/
│   ├── questions-31.source.json  Export d'origine (non modifié)
│   ├── questions-31.json         Contenu d'exécution
│   ├── remediation.json          Axes de remédiation des masters
│   └── quiz-presentation.json    Objectifs des trois séries
├── content/                   Masters éditoriaux et documents de gouvernance
├── docs/                      Cahier des charges, prompt maître, schéma, recette,
│                              décisions techniques, résultat de recette
├── tests/                     Tests automatisés
└── tools/normalize-dataset.mjs
```

## Autorité du contenu

`content/quiz1-master.md`, `content/quiz2-master.md` et `content/quiz3-master.md` sont
les sources éditoriales de vérité. Le JSON est le format d'exécution. En cas d'écart,
le JSON est réaligné sur les masters — jamais l'inverse.

Les champs `confidence`, `sourceNature` et `vigilanceMarkdown` sont internes et ne sont
jamais affichés.

## Avant publication

- Revalider Q2-04 (maladie professionnelle, article L. 461-1 du Code de la sécurité sociale, texte évoluant au 30 septembre 2026).
- Revalider les autres items juridiques en cas de réforme.
- Vérifier les URL de sources avant de rendre les liens cliquables.
- Réaliser le test utilisateur sur la version fonctionnelle complète.
