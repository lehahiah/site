/**
 * Restitution finale.
 *
 * Décrit des réponses, jamais la personne : aucun profil, aucun niveau de risque,
 * aucune sévérité, aucune interprétation clinique, deux axes au maximum.
 */
import { el } from '../dom.js';

export function quizSummary({ summary, axes, items, validatedIds = [], expectedFoundIds = [], links }) {
  const validated = new Set(validatedIds);
  const found = new Set(expectedFoundIds);

  return el('div', {}, [
    el('section', { class: 'card summary', 'aria-labelledby': 'summary-title' }, [
      el('h1', { id: 'summary-title', text: 'Quiz terminé' }),
      el('p', { class: 'summary__figure', text: `${summary.reviewed} question${summary.reviewed > 1 ? 's' : ''} parcourue${summary.reviewed > 1 ? 's' : ''} sur ${summary.total}` }),
      el('p', { class: 'meta', text: `Réponses attendues trouvées : ${summary.expectedFound} sur ${summary.reviewed}.` }),
      el('p', { text: "Ce quiz décrit des réponses à des idées reçues. Il ne dit rien de votre situation personnelle et ne permet aucun diagnostic." }),
      el('div', { class: 'button-row' }, [
        el('a', { class: 'button', href: links.review, text: 'Revoir mes réponses' }),
        el('button', { type: 'button', class: 'button button--secondary', text: 'Refaire le quiz', onClick: links.onRestart }),
        el('a', { class: 'button button--quiet', href: links.home, text: 'Choisir un autre quiz' }),
      ]),
    ]),

    axes.length
      ? el('section', { class: 'card', 'aria-labelledby': 'axes-title' }, [
          el('h2', { id: 'axes-title', text: axes.length > 1 ? 'Deux thèmes à revoir' : 'Un thème à revoir' }),
          el('p', { class: 'meta', text: 'Ces thèmes viennent des questions dont la réponse attendue n’a pas été trouvée.' }),
          ...axes.map((axis) =>
            el('div', { class: 'axis' }, [
              el('h3', { class: 'axis__title', text: axis.label }),
              el('p', { text: axis.message }),
              axis.resources?.length ? el('p', { class: 'axis__resources', text: `Ressources : ${axis.resources.join(' · ')}` }) : null,
            ]),
          ),
        ])
      : null,

    el('section', { class: 'card', 'aria-labelledby': 'review-title' }, [
      el('h2', { id: 'review-title', text: 'Vos questions' }),
      el(
        'ul',
        { class: 'review-list' },
        items.map((item) =>
          el('li', { class: 'review-item' }, [
            el('p', { class: 'review-item__status', text: `Question ${item.order} · ${statusLabel(item, validated, found)}` }),
            el('a', { href: links.question(item.order), text: `Revoir la question ${item.order}` }),
          ]),
        ),
      ),
      el('p', { class: 'meta' }, [el('a', { href: links.sources, text: 'Consulter toutes les sources de la série' })]),
    ]),
  ]);
}

function statusLabel(item, validated, found) {
  if (!validated.has(item.id)) return 'non parcourue';
  return found.has(item.id) ? 'réponse attendue trouvée' : 'réponse attendue à revoir';
}
