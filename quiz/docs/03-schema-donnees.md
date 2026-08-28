# Schéma de données – Quiz burn-out

Le runtime utilise `data/questions-31.json`.

## Racine

```ts
type QuizDataset = {
  version: string;
  language: "fr-FR";
  productType: "sensibilisation";
  clinicalAssessment: false;
  quizzes: QuizDefinition[];
  items: QuizItem[];
};
```

## Quiz

```ts
type QuizDefinition = {
  id: "Q1" | "Q2" | "Q3";
  title: string;
  shortTitle: string;
  itemCount: number;
  introDisclaimer: string;
  blocks: {
    id: string;
    label: string;
    items: number[];
  }[];
};
```

## Champs communs d'un item

```ts
type BaseItem = {
  id: string;                  // ex. Q2-04
  quizId: "Q1" | "Q2" | "Q3";
  order: number;
  blockId: string;
  format:
    | "single_choice"
    | "true_false"
    | "association"
    | "classification";

  editorialType: string;
  promptMarkdown: string;

  correctionShortMarkdown: string;
  takeawayMarkdown: string;
  whyMythMarkdown: string | null;
  deeperMarkdown: string | null;

  sources: string[];
  sourceNature: string[];      // interne
  confidence: number | null;   // interne
  vigilanceMarkdown: string | null; // interne
  accessibilityMarkdown: string | null;
};
```

## Choix unique / vrai-faux

```ts
type ChoiceItem = BaseItem & {
  format: "single_choice" | "true_false";
  options: {
    id: string;
    text: string;
    correct: boolean;
  }[];
  correctOptionIds: string[];
  expectedAnswer: string | null;
};
```

`correct` et `correctOptionIds` sont conservés pour simplifier la V1.  
Ils ne doivent jamais être envoyés à un service externe.

## Association

```ts
type AssociationItem = BaseItem & {
  format: "association";
  pairs: {
    id: string;
    promptMarkdown: string;
    answer: string;
  }[];
};
```

Q1-06 contient 6 paires.  
Q1-14 contient 4 paires.

## Classement

```ts
type ClassificationItem = BaseItem & {
  format: "classification";
  categories: {
    id: string;
    label: string;
    items: string[];
  }[];
};
```

Q1-11 contient 2 catégories.

## Champs publics / internes

### Publics
- titre ;
- prompt ;
- options ;
- corrigé ;
- « À retenir » ;
- approfondissements ;
- références.

### Internes
- `confidence` ;
- `sourceNature` ;
- `vigilanceMarkdown`.

## Persistance locale recommandée

```ts
type QuizProgress = {
  quizId: string;
  currentOrder: number;
  answers: Record<string, unknown>;
  validatedItemIds: string[];
  completed: boolean;
  updatedAt: string;
};
```

Ne pas ajouter de champ de santé, identité ou texte libre.
