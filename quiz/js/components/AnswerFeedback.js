/**
 * Correction d'un item, dans l'ordre imposé par les règles pédagogiques §2 :
 * statut neutre, corrigé court, « À retenir », approfondissements repliés, sources.
 *
 * Le statut ne sanctionne pas : « Exact » ou « Réponse attendue ».
 * Aucun point, aucun badge, aucune série, aucun vocabulaire d'échec.
 * Le corrigé n'est jamais généré : il est affiché tel quel.
 */
import { el } from '../dom.js';
import { markdownElement } from '../markdown.js';
import { takeaway } from './Takeaway.js';
import { expandableExplanation } from './ExpandableExplanation.js';
import { sourcesList } from './SourcesList.js';
import { perceptionCheck } from './PerceptionCheck.js';

export function answerFeedback({ item, evaluation, onPanelOpen, onPerceptionChange }) {
  const statusText = evaluation.expectedFound ? 'Exact' : 'Réponse attendue';

  return el('section', { class: 'feedback', 'aria-label': 'Correction' }, [
    el('p', { class: 'feedback__status', role: 'status', 'aria-live': 'polite', text: statusText }),
    markdownElement(item.correctionShortMarkdown, { className: 'feedback__correction' }),
    takeaway({ markdown: item.takeawayMarkdown }),
    expandableExplanation({
      title: 'Pourquoi cette idée circule ?',
      markdown: item.whyMythMarkdown,
      onOpen: () => onPanelOpen?.('why_myth'),
    }),
    expandableExplanation({
      title: 'Pour aller plus loin',
      markdown: item.deeperMarkdown,
      onOpen: () => onPanelOpen?.('deeper'),
    }),
    sourcesList({ sources: item.sources, onOpen: () => onPanelOpen?.('sources') }),
    perceptionCheck({ onAnswer: onPerceptionChange }),
  ]);
}
