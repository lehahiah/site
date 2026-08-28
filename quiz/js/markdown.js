/**
 * Rendu Markdown maîtrisé.
 *
 * Sous-ensemble volontairement restreint (titres, citations, listes, paragraphes,
 * gras, italique, code, séparateurs). Le texte est échappé AVANT toute conversion :
 * aucun HTML présent dans le contenu éditorial n'est interprété.
 *
 * Le contenu n'est jamais généré dynamiquement : ce module se contente d'afficher
 * les champs du jeu de données.
 */

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const CODE_PLACEHOLDER = (index) => `@@code-${index}@@`;

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

function renderInline(text) {
  const codes = [];
  let output = escapeHtml(text).replace(/`([^`]+)`/g, (_match, code) => {
    codes.push(code);
    return CODE_PLACEHOLDER(codes.length - 1);
  });

  output = output
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(«])\*([^*\n]+)\*(?=$|[\s.,;:!?)»])/g, '$1<em>$2</em>');

  return output.replace(/@@code-(\d+)@@/g, (_match, index) => `<code>${codes[Number(index)]}</code>`);
}

function splitBlocks(markdown) {
  return markdown
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+$/, ''))
    .filter((block) => block.trim() !== '');
}

function renderBlock(block, headingTag) {
  const lines = block.split('\n');

  if (lines.every((line) => /^\s*-{3,}\s*$/.test(line))) return '<hr>';

  const heading = lines[0].match(/^(#{1,6})\s+(.*)$/);
  if (heading && lines.length === 1) {
    // Les titres internes d'un item sont de courts intertitres : ils sont rendus à
    // un niveau unique, directement sous le titre de l'écran, pour ne créer ni saut
    // ni hiérarchie factice (WCAG 1.3.1).
    return `<${headingTag}>${renderInline(heading[2])}</${headingTag}>`;
  }

  if (lines.every((line) => /^\s*>/.test(line))) {
    const inner = lines.map((line) => line.replace(/^\s*>\s?/, '')).join('\n');
    return `<blockquote>${renderBlocks(inner, headingTag)}</blockquote>`;
  }

  // Liste à puces, éventuellement précédée d'une phrase d'amorce sans ligne vide
  // (forme fréquente dans les masters). Sans ce traitement, tout le bloc tombait
  // dans un paragraphe et la liste n'était plus annoncée aux lecteurs d'écran.
  const isBullet = (line) => /^\s*[-*]\s+/.test(line);
  const firstBullet = lines.findIndex(isBullet);
  if (firstBullet !== -1 && lines.slice(firstBullet).every(isBullet)) {
    const entries = lines
      .slice(firstBullet)
      .map((line) => `<li>${renderInline(line.replace(/^\s*[-*]\s+/, ''))}</li>`)
      .join('');
    const intro = lines.slice(0, firstBullet);
    const lead = intro.length ? `<p>${intro.map(renderInline).join('<br>')}</p>` : '';
    return `${lead}<ul>${entries}</ul>`;
  }

  const isNumbered = (line) => /^\s*\d+\.\s+/.test(line);
  const firstNumbered = lines.findIndex(isNumbered);
  if (firstNumbered !== -1 && lines.slice(firstNumbered).every(isNumbered)) {
    const entries = lines
      .slice(firstNumbered)
      .map((line) => `<li>${renderInline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`)
      .join('');
    const intro = lines.slice(0, firstNumbered);
    const lead = intro.length ? `<p>${intro.map(renderInline).join('<br>')}</p>` : '';
    return `${lead}<ol>${entries}</ol>`;
  }

  return `<p>${lines.map(renderInline).join('<br>')}</p>`;
}

function renderBlocks(markdown, headingTag) {
  return splitBlocks(markdown)
    .map((block) => renderBlock(block, headingTag))
    .join('');
}

/** Retourne le HTML correspondant au markdown fourni (chaîne vide si null). */
export function renderMarkdown(markdown, { headingTag = 'h2' } = {}) {
  if (!markdown) return '';
  return renderBlocks(markdown, headingTag);
}

/** Crée un élément dont le contenu est le markdown rendu. */
export function markdownElement(markdown, { tag = 'div', className = '', headingTag = 'h2' } = {}) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.innerHTML = renderMarkdown(markdown, { headingTag });
  return element;
}
