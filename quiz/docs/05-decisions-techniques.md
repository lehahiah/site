# Décisions techniques et écarts signalés

Version : V1 de développement — 26 août 2026
Application construite à partir de `02-prompt-maitre-developpement.md`.

## 1. Écarts détectés entre `data/questions-31.json` et les masters

Conformément à la règle d'autorité du contenu (prompt maître §2), les écarts sont
**signalés** ici et **corrigés dans le JSON**. Aucun master n'a été modifié, aucune
question, réponse, correction ou source n'a été réécrite.

### 1.1 Réponse attendue visible dans l'énoncé — 17 items

`promptMarkdown` se terminait par `**Réponse attendue : X**` pour les 8 items du Quiz 2
et les 9 items du Quiz 3. La bonne réponse était donc affichée **avant validation**,
ce qui contredit les critères de recette C (« aucun indice visuel de bonne réponse avant
validation ») et rendait le quiz inopérant.

Correction : la mention est retirée de l'énoncé et reportée dans le champ prévu
`expectedAnswer`, qui n'est pas affiché avant validation.

### 1.2 Métadonnées internes dans des champs publics — 31 items

Les champs `deeperMarkdown`, `whyMythMarkdown` ou `takeawayMarkdown` reprenaient en fin
de texte des blocs `**Nature :**`, `**Sources :**`, `**Niveau de confiance :**`,
`**Point de vigilance :**`, ainsi que les balises `[LEGAL]`, `[DONNEE]`, `[PRATIQUE]`.
Ces éléments sont explicitement internes (règles pédagogiques §3, cahier des charges §9).

Correction : ces blocs sont retirés des champs publics. Aucune information n'est perdue :
elle figure déjà dans les champs structurés `sources`, `sourceNature`, `confidence` et
`vigilanceMarkdown`. Le script de normalisation vérifie que chaque référence retirée
existe bien dans `sources[]` (aucun avertissement au dernier passage).

Cas le plus visible : le « À retenir » des huit items du Quiz 2 contenait tout le bloc de
métadonnées, qui se serait affiché dans l'encadré de restitution.

### 1.3 Espaces parasites — Q1-11

Les éléments de classement se terminaient par une espace (`"troubles de santé mentale "`),
ce qui fausse toute comparaison. Ils sont mis au propre.

### 1.4 Traçabilité

L'export d'origine est conservé tel quel dans `data/questions-31.source.json`.
La transformation est rejouable et vérifiable :

```bash
node quiz/tools/normalize-dataset.mjs --check
```

Un test échoue si le fichier d'exécution n'est plus aligné sur la source normalisée, et
un autre test échoue si une métadonnée interne ou une réponse attendue réapparaît dans un
champ public.

## 2. Stack : écart assumé au prompt maître §4

Le prompt maître recommande Next.js « sauf contrainte de l'environnement » et précise :
« Si la plateforme impose une autre stack, conserve exactement les comportements et le
modèle de données ».

Le dépôt cible est un site **statique** (HTML/CSS/JS, aucun `package.json`, déploiement
Vercel avec `framework: null` et `outputDirectory: "."`). Introduire Next.js aurait
transformé la chaîne de déploiement de l'ensemble du site pour un besoin qui n'en
dépend pas.

Choix retenu : **HTML statique + modules ES natifs + JSON**, sans dépendance d'exécution.

Sont conservés à l'identique :

- le modèle de données de `03-schema-donnees.md` ;
- la liste des composants attendus (un module par composant) ;
- la séparation stricte contenu / code ;
- le comportement de chaque écran ;
- la persistance locale et son schéma `QuizProgress`.

Conséquences :

- pas de build, donc pas de « build de production » à faire échouer : la validation du
  contenu est exécutée **au chargement** de l'application (échec explicite) **et** dans
  les tests ;
- pas de TypeScript : les contrats de données sont documentés en JSDoc et vérifiés par
  `js/validate.js` et les tests ;
- les routes recommandées deviennent `parcours.html?quiz=Q1&q=3`, avec `pushState`,
  historique navigateur et retour arrière fonctionnels — variante explicitement permise
  par le cahier des charges §14.

Si la V2 doit passer sous Next.js, `data/`, `js/scoring.js`, `js/storage.js`,
`js/validate.js` et les composants se transposent sans changement de comportement.

## 3. Choix de conception

| Sujet | Décision | Motif |
|---|---|---|
| Association | Une liste déroulante par situation, réponses triées alphabétiquement | Clavier, tactile et lecteur d'écran nativement ; l'ordre alphabétique évite qu'une position révèle la réponse |
| Classement | Boutons radio par élément (2 catégories) | Interaction native, aucune dépendance au glisser-déposer |
| Glisser-déposer | Non implémenté | Le cahier des charges l'autorise sans l'imposer ; l'alternative accessible est ici l'interaction principale |
| Ordre des éléments à classer | Entrelacement déterministe entre catégories | Les présenter groupés par catégorie donnerait la réponse ; aucun aléatoire, pour rester testable |
| Ordre des options de QCM | Celui du master, jamais mélangé | Critère de recette C |
| Statut de correction | « Exact » / « Réponse attendue » | Règles pédagogiques §2A : aucun vocabulaire de sanction |
| Mesure de la surprise | Proposée après le corrigé, non bloquante, non persistée | Règles pédagogiques §5 ; alimente uniquement l'interface d'événements interne |
| Analytics | Interface d'événements sans collecteur | Prompt maître §14 : aucun outil actif par défaut, aucun texte libre transmis |
| Nombre de bonnes réponses | Affiché en information secondaire sur la page finale | Décision ouverte du dossier de passation ; retirable en une ligne (`QuizSummary`) |
| Indexation | `noindex` sur les pages du quiz | L'hébergement définitif n'est pas arbitré (voir §5) ; à retirer au moment de la publication |
| Sources | Affichées telles quelles, liens seulement si une URL figure dans les données | Cahier des charges §9 : aucune URL fabriquée. Aujourd'hui les sources sont des chaînes de texte : aucun lien n'est donc cliquable |

## 4. Sécurité pédagogique

- Aucune inférence d'état de santé : le seul calcul est la comparaison d'une réponse à la
  réponse attendue, utilisée pour la correction et le choix d'au maximum deux axes.
- Les axes de remédiation sont ceux des masters, dans `data/remediation.json` ; aucun
  message n'est généré dynamiquement.
- Aucun profil, score clinique, niveau de risque, sévérité ni conseil personnalisé.
- Le rendu Markdown échappe systématiquement le contenu avant conversion.
- Aucune donnée personnelle ou de santé n'est demandée, stockée ni transmise ; la
  progression locale est filtrée à la relecture (`sanitizeProgress`).

## 5. Points ouverts

1. **Dépôt et hébergement.** L'application a été développée dans le dépôt du site
   `lehahiah/site`, sous `/quiz/`, conformément à la branche de travail demandée. Ce dépôt
   héberge par ailleurs un site sans rapport avec le produit. Si le quiz doit être publié
   sous un autre domaine (FormaSwift), le dossier `quiz/` se déplace tel quel : il ne
   dépend d'aucun fichier du site hôte. L'indexation est désactivée d'ici là.
2. **Revalidation juridique Q2-04** avant publication (article L. 461-1, texte évoluant au
   30 septembre 2026), puis les autres items juridiques en cas de réforme.
3. **URL des sources** : à vérifier avant de rendre les liens cliquables.
4. **Test utilisateur** sur la version fonctionnelle complète.
5. **Identité graphique** : à appliquer via les tokens CSS, sans toucher aux composants.
6. **Lecteur d'écran réel** (NVDA / VoiceOver) : la structure, les libellés et les
   annonces sont en place et testés automatiquement, mais un passage sur lecteur d'écran
   réel reste à faire.

## 6. Passe d'audit du 26 août 2026 — constats et corrections

Trois audits indépendants ont été menés sur la V1 (fidélité éditoriale, robustesse du
code, sécurité pédagogique et confidentialité). Un quatrième, sur l'accessibilité, n'a
pas pu être mené à son terme ; ses vérifications ont été reprises directement.

### 6.1 Corrigé — contenu

| Constat | Correction |
|---|---|
| Q3-01 et Q3-09 : des puces de « Point de vigilance » figuraient dans `sources[]` et s'affichaient sur la page Sources, alors que les règles pédagogiques §3 interdisent d'afficher les notes internes | Retirées par le script de normalisation, qui compare chaque source à `vigilanceMarkdown` ; la validation refuse désormais toute source rédigée comme une consigne interne |
| Le garde-fou anti-métadonnées ne couvrait que les cinq champs Markdown | Il couvre `sources[]` et vérifie l'absence des champs internes |
| Marques d'emphase Markdown visibles dans trois références de Q3-09 | Retirées (les sources sont affichées en texte brut) |
| Titres de bloc du master collés à `accessibilityMarkdown` (Q1-06, Q1-11) | Retirés |
| `confidence`, `sourceNature` et `vigilanceMarkdown` étaient servis au navigateur | Le fichier d'exécution est désormais **expurgé** de ces trois champs internes ; ils restent dans `questions-31.source.json`, qui est le registre interne. Écart assumé au §11 des règles pédagogiques : la séparation des champs est conservée, mais le registre complet n'est plus public |

La comparaison caractère par caractère des 31 items avec les masters n'a révélé **aucune
divergence de fond** : énoncés, options et leur ordre, réponses attendues, corrigés,
« À retenir » et approfondissements sont fidèles.

### 6.2 Corrigé — code

| Constat | Correction |
|---|---|
| Une exception pendant le rendu laissait un écran blanc (`clear()` avant construction) | L'écran est construit avant d'effacer, et toute erreur affiche un message |
| `remediation.json` et `quiz-presentation.json` n'étaient validés nulle part | `validateSideFiles()` les contrôle au chargement (axes, seuils, items référencés, objectifs) |
| Listes Markdown précédées d'une phrase d'amorce rendues en paragraphe à tirets (32 blocs, 18 items) : plus aucune liste annoncée aux lecteurs d'écran | Corrigé dans `renderBlock` ; 34 listes réelles rendues, vérifiées par test sur le contenu réel |
| « Quiz terminé / 0 question parcourue » atteignable par le bouton Retour ou une adresse directe | Écran neutre « Rien à afficher pour l'instant » |
| L'effacement depuis la page de résultats n'actualisait pas l'écran | Nouveau rendu immédiat |
| Deux onglets sur la même série s'écrasaient silencieusement | Écouteur `storage` : l'onglet resynchronise sa progression (mitigation, pas fusion) |
| Une série terminée n'offrait plus aucun chemin vers sa restitution | Lien « Revoir la fin du quiz » sur l'écran de présentation |
| Adresse hors bornes (`?q=99`) : contenu ramené aux bornes mais URL fausse | L'adresse est corrigée dans l'historique |
| Écriture dans `localStorage` au simple affichage d'une question | Persistance uniquement en cas de changement réel |
| Saut de hiérarchie H1 → H3 sur les écrans de question | Intertitres d'item en `h2` |
| Liens d'en-tête sous 24 px de haut (WCAG 2.5.8) | Cibles portées à 24 px minimum |

### 6.3 Corrigé — restitution et données

- **Axes de remédiation** : les déclenchements composés des masters sont désormais
  reproduits (`mode: "all"` et `minSubErrors`). L'axe B du Quiz 1 exige une erreur à
  l'item 5 **et** plusieurs facteurs manqués à l'item 6 ; idem pour l'axe D avec les
  items 10 et 11. Une seule sous-erreur d'association ou de classement ne déclenche plus
  un axe dont le message décrirait des confusions non commises. Pour les Quiz 2 et 3, les
  masters ne fixent aucun seuil : le seuil d'une erreur est assumé et tracé dans
  `remediation.json` (`_trigger`).
- **Interface d'événements** : `expectedFound` est retiré des clés autorisées. Transmettre
  la justesse item par item reviendrait à envoyer le détail des réponses, que le cahier des
  charges §15 réserve à une décision explicite.

### 6.4 Vérifié conforme, sans action

- Aucun diagnostic, niveau de risque, profil, sévérité, prédiction, conseil personnalisé ni
  qualification juridique individuelle sur 11 parcours couvrant les trois séries.
- Deux axes au maximum partout ; messages verbatim des masters ; aucun texte généré.
- Confidentialité : aucun cookie, aucune requête sortante, aucun champ libre, effacement
  effectif et limité au préfixe de l'application.
- Rendu Markdown : 43 charges hostiles, aucune exécution, aucune balise active.
- Stockage local corrompu, tronqué, d'un autre schéma ou saturé : parcours préservé.
- Zoom 200 % et 320 px : aucun débordement horizontal.
- Thème sombre : aucun texte sous 4,5:1.

### 6.5 Reste ouvert

1. **Documents internes servis publiquement.** Dans ce dépôt, les deux chaînes de
   déploiement publient la racine entière : `quiz/content/*.md` (masters, avec les coches
   de bonne réponse), `quiz/content/referentiel-sources.md` (31 niveaux de confiance),
   `quiz/docs/*.md` et `quiz/data/questions-31.source.json` seraient donc accessibles en
   ligne. Rien n'est publié à ce stade — le workflow ne se déclenche que sur `main` — mais
   la correction de fond appartient au dépôt cible : dans un projet à build, ces fichiers
   vivent hors du répertoire servi. Un `.vercelignore` les exclut d'un déploiement Vercel
   en attendant.
2. **Mentions légales propres au quiz** : éditeur, hébergeur, contact. À rédiger avec les
   informations de FormaSwift.
3. **En-têtes de sécurité** (CSP, `X-Content-Type-Options`, `Referrer-Policy`) : à poser
   dans la configuration du dépôt cible.
4. **Lecteur d'écran réel** : structure, libellés et annonces vérifiés automatiquement ;
   un passage NVDA / VoiceOver reste à faire.
