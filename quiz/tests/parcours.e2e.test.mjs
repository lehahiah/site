/**
 * Tests de bout en bout (Chromium) — parcours, accessibilité clavier,
 * persistance locale et sécurité pédagogique de la restitution.
 *
 * Nécessite Playwright. Si le module est absent, les tests sont ignorés.
 * Lancement : node --test quiz/tests/parcours.e2e.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize, extname } from 'node:path';

import { buildClassificationElements } from '../js/scoring.js';

const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = join(here, '..', '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

async function loadPlaywright() {
  for (const specifier of ['playwright', '/opt/node22/lib/node_modules/playwright/index.mjs']) {
    try {
      return await import(specifier);
    } catch {
      /* essai suivant */
    }
  }
  return null;
}

const playwright = await loadPlaywright();

if (!playwright) {
  test('tests de bout en bout ignorés (Playwright indisponible)', { skip: true }, () => {});
} else {
  const server = createServer(async (request, response) => {
    const path = normalize(decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
    const file = join(siteRoot, path.endsWith('/') ? `${path}index.html` : path);
    try {
      const body = await readFile(file);
      response.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream' });
      response.end(body);
    } catch {
      response.writeHead(404).end('introuvable');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/quiz`;
  const browser = await playwright.chromium.launch();

  test.after(async () => {
    await browser.close();
    server.close();
  });

  /** Ouvre une page en collectant les erreurs de console. */
  async function open(viewport = { width: 390, height: 780 }) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', (error) => errors.push(String(error)));
    return { context, page, errors };
  }

  const FORBIDDEN = [
    /vous êtes à risque/i,
    /votre profil/i,
    /niveau de risque/i,
    /sévérité/i,
    /vous connaissez mal/i,
    /probabilité de burn-?out/i,
    /vous devriez (vous arrêter|reprendre)/i,
    /mauvaise réponse/i,
    /bravo/i,
    /échec/i,
  ];

  function assertNoClinicalOutput(text, label) {
    for (const pattern of FORBIDDEN) {
      assert.ok(!pattern.test(text), `${label} : formulation interdite ${pattern}`);
    }
  }

  test('accueil : trois séries lançables séparément', async () => {
    const { context, page, errors } = await open();
    await page.goto(`${base}/`);
    await page.waitForSelector('.quiz-card');
    assert.equal(await page.locator('.quiz-card').count(), 3);
    const counts = await page.locator('.quiz-card__count').allTextContents();
    assert.deepEqual(counts, ['14 questions', '8 questions', '9 questions']);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('question : correction seulement après validation, réponse ensuite figée', async () => {
    const { context, page, errors } = await open();
    await page.goto(`${base}/parcours.html?quiz=Q1&q=1`);
    await page.waitForSelector('.question');

    assert.equal(await page.locator('.feedback').count(), 0, 'aucune correction avant validation');
    assert.equal(await page.locator('.option__marker').count(), 0, 'aucun indice de bonne réponse avant validation');
    assert.equal(await page.getByRole('button', { name: 'Valider ma réponse' }).isDisabled(), true);

    await page.getByRole('radio', { name: 'Vrai' }).check();
    await page.getByRole('radio', { name: 'Faux' }).check();
    assert.equal(await page.getByRole('radio', { name: 'Faux' }).isChecked(), true, 'la réponse peut être modifiée avant validation');

    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    await page.waitForSelector('.feedback');

    assert.equal(await page.locator('.feedback__status').textContent(), 'Exact');
    assert.equal(await page.locator('input[type=radio]:disabled').count(), 2, 'la réponse est figée après validation');
    assert.equal(await page.getByRole('button', { name: 'Valider ma réponse' }).count(), 0);
    assert.ok((await page.locator('.takeaway').innerText()).includes('À RETENIR') || (await page.locator('.takeaway').innerText()).length > 0);

    const opened = await page.locator('details').evaluateAll((nodes) => nodes.map((node) => node.open));
    assert.deepEqual(opened, opened.map(() => false), 'les approfondissements sont repliés par défaut');

    await page.waitForFunction(() => document.getElementById('annonces').textContent.length > 0);
    assert.match(await page.locator('#annonces').textContent(), /Réponse validée/);

    assert.deepEqual(errors, []);
    await context.close();
  });

  test('parcours complet au clavier, sans souris', async () => {
    const { context, page, errors } = await open();
    await page.goto(`${base}/parcours.html?quiz=Q2&q=1`);
    await page.waitForSelector('.question');

    // Atteindre le premier choix puis le sélectionner uniquement au clavier.
    for (let step = 0; step < 12; step += 1) {
      await page.keyboard.press('Tab');
      const role = await page.evaluate(() => document.activeElement?.getAttribute('type'));
      if (role === 'radio') break;
    }
    await page.keyboard.press('Space');
    assert.equal(await page.locator('input[type=radio]:checked').count(), 1);

    // Le bouton de validation est atteignable et activable au clavier.
    for (let step = 0; step < 12; step += 1) {
      await page.keyboard.press('Tab');
      const label = await page.evaluate(() => document.activeElement?.textContent?.trim());
      if (label === 'Valider ma réponse') break;
    }
    await page.keyboard.press('Enter');
    await page.waitForSelector('.feedback');
    assert.equal(await page.locator('.feedback').count(), 1);

    // Le focus est déplacé sur le statut de correction.
    assert.equal(await page.evaluate(() => document.activeElement?.className), 'feedback__status');
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('association et classement fonctionnent sans glisser-déposer', async () => {
    const { context, page, errors } = await open();

    await page.goto(`${base}/parcours.html?quiz=Q1&q=6`);
    await page.waitForSelector('.assign-list');
    assert.equal(await page.locator('.assign select').count(), 6);
    assert.equal(await page.locator('[draggable="true"]').count(), 0);

    const selects = await page.locator('.assign select').all();
    for (const select of selects) {
      const values = await select.locator('option').evaluateAll((options) => options.map((option) => option.value).filter(Boolean));
      await select.selectOption(values[0]);
    }
    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    await page.waitForSelector('.feedback');
    assert.ok((await page.locator('.assign-list').innerText()).includes('Réponse attendue'), 'la réponse attendue est indiquée en toutes lettres');

    await page.goto(`${base}/parcours.html?quiz=Q1&q=11`);
    await page.waitForSelector('.assign-list');
    assert.equal(await page.locator('.assign legend').count(), 6);
    assert.equal(await page.locator('.assign input[type=radio]').count(), 12);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('quiz terminé avec toutes les réponses attendues : aucun axe, aucun message clinique', async () => {
    const { context, page, errors } = await open();
    await runQuiz(page, 'Q2', 'expected');

    const text = await page.locator('main').innerText();
    assert.match(text, /Quiz terminé/);
    assert.match(text, /8 questions parcourues sur 8/);
    assert.match(text, /Réponses attendues trouvées : 8 sur 8/);
    assert.equal(await page.locator('.axis').count(), 0);
    assertNoClinicalOutput(text, 'restitution tout correct');
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('quiz terminé avec aucune réponse attendue : deux axes au maximum, aucun profil', async () => {
    const { context, page, errors } = await open();
    await runQuiz(page, 'Q3', 'other');

    const text = await page.locator('main').innerText();
    assert.match(text, /9 questions parcourues sur 9/);
    assert.match(text, /Réponses attendues trouvées : 0 sur 9/);
    const axes = await page.locator('.axis').count();
    assert.ok(axes <= 2 && axes > 0, `axes affichés : ${axes}`);
    assertNoClinicalOutput(text, 'restitution tout incorrect');
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('série complète avec les quatre formats (Quiz 1)', async () => {
    const { context, page, errors } = await open();
    await runQuiz(page, 'Q1', 'expected');
    const text = await page.locator('main').innerText();
    assert.match(text, /14 questions parcourues sur 14/);
    assert.match(text, /Réponses attendues trouvées : 14 sur 14/);
    assert.equal(await page.locator('.axis').count(), 0);
    assertNoClinicalOutput(text, 'restitution Quiz 1');
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('retour arrière après « Refaire le quiz » : pas de faux « quiz terminé »', async () => {
    const { context, page, errors } = await open();
    await runQuiz(page, 'Q2', 'expected');
    await page.getByRole('button', { name: 'Refaire le quiz' }).click();
    await page.waitForSelector('.question');
    await page.goBack();
    await page.waitForSelector('main .card');

    const text = await page.locator('main').innerText();
    assert.ok(!/Quiz terminé/.test(text), 'l’écran de fin ne doit pas s’afficher sans réponse');
    assert.match(text, /Rien à afficher/);
    assert.deepEqual(errors, []);
    await context.close();
  });

  test('résultats atteints sans aucune réponse : écran neutre', async () => {
    const { context, page } = await open();
    await page.goto(`${base}/parcours.html?quiz=Q3&vue=resultats`);
    await page.waitForSelector('main .card');
    const text = await page.locator('main').innerText();
    assert.match(text, /Rien à afficher/);
    assert.ok(!/0 sur 0/.test(text));
    await context.close();
  });

  test('effacer la progression depuis les résultats rafraîchit l’écran', async () => {
    const { context, page } = await open();
    await runQuiz(page, 'Q2', 'expected');
    await page.getByRole('button', { name: /Effacer ma progression pour cette série/ }).click();
    await page.getByRole('button', { name: /Confirmer/ }).click();
    await page.waitForFunction(() => !document.body.innerText.includes('8 questions parcourues'));
    assert.match(await page.locator('main').innerText(), /Rien à afficher/);
    assert.deepEqual(await page.evaluate(() => Object.keys(window.localStorage)), []);
    await context.close();
  });

  test('adresse hors bornes : le contenu et l’URL restent cohérents', async () => {
    const { context, page } = await open();
    await page.goto(`${base}/parcours.html?quiz=Q2&q=99`);
    await page.waitForSelector('.question');
    assert.match(await page.locator('h1').first().innerText(), /Question 8 sur 8/);
    assert.equal(new URL(page.url()).searchParams.get('q'), '8');

    await page.goto(`${base}/parcours.html?quiz=Q2&q=abc`);
    await page.waitForSelector('h1');
    assert.match(await page.locator('h1').first().innerText(), /idées reçues/);
    await context.close();
  });

  test('série terminée : la présentation ramène à la restitution', async () => {
    const { context, page } = await open();
    await runQuiz(page, 'Q2', 'expected');
    await page.goto(`${base}/parcours.html?quiz=Q2`);
    await page.waitForSelector('h1');
    await page.getByRole('link', { name: 'Revoir la fin du quiz' }).click();
    await page.waitForSelector('.summary');
    assert.match(await page.locator('main').innerText(), /8 questions parcourues sur 8/);
    await context.close();
  });

  test('contenu annexe invalide : message d’erreur, jamais d’écran vide', async () => {
    const context = await browser.newContext({ viewport: { width: 390, height: 780 } });
    const page = await context.newPage();
    await page.route('**/data/remediation.json', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ maxAxes: 2 }),
    }));
    await page.goto(`${base}/parcours.html?quiz=Q1&q=1`);
    await page.waitForSelector('main .card');
    const text = await page.locator('main').innerText();
    assert.match(text, /Contenu indisponible/);
    assert.ok((await page.locator('main').innerText()).length > 0, 'la page ne doit jamais rester vide');
    await context.close();
  });

  test('reprise après fermeture du navigateur, puis effacement', async () => {
    const { context, page } = await open();
    await page.goto(`${base}/parcours.html?quiz=Q3&q=1`);
    await page.waitForSelector('.question');
    await page.locator('input[type=radio]').first().check();
    await page.getByRole('button', { name: 'Valider ma réponse' }).click();
    await page.waitForSelector('.feedback');
    await page.getByRole('button', { name: 'Question suivante' }).click();
    await page.waitForSelector('.question');

    const storage = await context.storageState();
    await context.close();

    const revisit = await browser.newContext({ storageState: storage, viewport: { width: 390, height: 780 } });
    const page2 = await revisit.newPage();
    await page2.goto(`${base}/`);
    await page2.waitForSelector('.quiz-card');
    assert.match(await page2.locator('.quiz-list').innerText(), /Quiz commencé sur cet appareil/);

    await page2.goto(`${base}/parcours.html?quiz=Q3`);
    await page2.waitForSelector('h1');
    await page2.getByRole('link', { name: 'Reprendre le quiz' }).click();
    await page2.waitForSelector('.question');
    assert.match(await page2.locator('h1').first().innerText(), /Question 2 sur 9/);

    await page2.goto(`${base}/`);
    await page2.getByRole('button', { name: 'Effacer ma progression sur cet appareil' }).click();
    await page2.getByRole('button', { name: /Confirmer/ }).click();
    await page2.waitForFunction(() => !document.body.innerText.includes('Quiz commencé sur cet appareil'));
    const keys = await page2.evaluate(() => Object.keys(window.localStorage));
    assert.deepEqual(keys, []);
    await revisit.close();
  });

  test('aucune donnée personnelle ou de santé dans le stockage local', async () => {
    const { context, page } = await open();
    await runQuiz(page, 'Q2', 'expected');
    const stored = await page.evaluate(() =>
      Object.fromEntries(Object.entries(window.localStorage).map(([key, value]) => [key, value])),
    );
    const keys = Object.keys(stored);
    assert.deepEqual(keys, ['quizBurnout.progress.Q2']);
    const progress = JSON.parse(stored[keys[0]]);
    assert.deepEqual(Object.keys(progress).sort(), ['answers', 'completed', 'currentOrder', 'quizId', 'updatedAt', 'validatedItemIds', 'version']);
    await context.close();
  });

  test('affichage à 320 px sans débordement horizontal', async () => {
    const { context, page } = await open({ width: 320, height: 640 });
    for (const url of [`${base}/`, `${base}/parcours.html?quiz=Q1&q=6`, `${base}/sources.html`, `${base}/a-propos.html`]) {
      await page.goto(url);
      await page.waitForSelector('main');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      assert.ok(overflow <= 0, `${url} déborde de ${overflow}px`);
    }
    await context.close();
  });

  /** Déroule un quiz entier, tous formats compris ; `mode` vaut 'expected' ou 'other'. */
  async function runQuiz(page, quizId, mode) {
    const dataset = JSON.parse(await readFile(join(siteRoot, 'quiz', 'data', 'questions-31.json'), 'utf8'));
    const items = dataset.items.filter((item) => item.quizId === quizId).sort((a, b) => a.order - b.order);

    await page.goto(`${base}/parcours.html?quiz=${quizId}&q=1`);
    for (const item of items) {
      await page.waitForSelector('.question');
      await answerItem(page, item, mode);
      await page.getByRole('button', { name: 'Valider ma réponse' }).click();
      await page.waitForSelector('.feedback');
      const isLast = item.order === items.length;
      await page.getByRole('button', { name: isLast ? 'Voir la fin du quiz' : 'Question suivante' }).click();
    }
    await page.waitForSelector('.summary, .card');
  }

  /** Répond à un item quel que soit son format. */
  async function answerItem(page, item, mode) {
    if (item.format === 'single_choice' || item.format === 'true_false') {
      const target = mode === 'expected'
        ? item.correctOptionIds[0]
        : item.options.find((option) => !option.correct).id;
      await page.locator(`input[type=radio][value="${target}"]`).check();
      return;
    }

    if (item.format === 'association') {
      const answers = item.pairs.map((pair) => pair.answer);
      for (const [index, pair] of item.pairs.entries()) {
        const value = mode === 'expected' ? pair.answer : answers[(index + 1) % answers.length];
        await page.locator(`#pair-${item.id}-${pair.id}`).selectOption(value);
      }
      return;
    }

    if (item.format === 'classification') {
      const elements = buildClassificationElements(item);
      for (const element of elements) {
        const other = item.categories.find((category) => category.id !== element.categoryId).id;
        const value = mode === 'expected' ? element.categoryId : other;
        await page.locator(`input[name="class-${item.id}-${element.id}"][value="${value}"]`).check();
      }
    }
  }
}
