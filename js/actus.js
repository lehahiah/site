'use strict';

/* =============================================================
   LE FIL D'ACTUALITÉS LEHAHIAH
   =============================================================

   POUR AJOUTER UNE ACTUALITÉ : ajouter un bloc { ... } en HAUT
   du tableau ACTUS ci-dessous. C'est le SEUL fichier à modifier :
   la page d'accueil et la page actualites.html se mettent à jour
   toutes seules.

   Chaque actualité :
     date      : 'AAAA-MM-JJ'  (obligatoire, sert au classement)
     categorie : 'agenda' | 'musique' | 'video' | 'presse' | 'coulisses'
     titre     : le titre affiché (court, 1 ligne si possible)
     resume    : 2 lignes max qui donnent envie de cliquer
     lien      : 'concerts.html#agenda' ou une URL complète https://...
     externe   : true si le lien sort du site (ouvre un nouvel onglet)
     image     : facultatif – 'images/mon-image.jpg'

   ============================================================= */

var ACTUS = [

  {
    date: '2026-09-19',
    categorie: 'agenda',
    titre: 'Cinq nouvelles dates de concerts chez l’habitant',
    resume: 'L’agenda s’étoffe jusqu’en décembre : cinq salons privés en Isère rejoignent la saison.',
    lien: 'concerts.html#agenda',
    image: 'images/concert-habitant1.jpg'
  },

  {
    date: '2026-08-28',
    categorie: 'agenda',
    titre: 'Lehahiah aux Jeudis culturels des Caves de la Chartreuse',
    resume: 'Une soirée en extérieur à Voiron, dans le cadre des Jeudis culturels. Entrée libre.',
    lien: 'scenographie.html',
    image: 'images/concert-live-bar.jpg'
  },

  {
    date: '2026-08-26',
    categorie: 'agenda',
    titre: 'Deux dates à Voiron : Caves de la Chartreuse et L’Absinthe',
    resume: 'La saison voironnaise se précise, avec un retour à L’Absinthe en janvier 2027.',
    lien: 'concerts.html#agenda',
    image: 'images/concert-live-carrieres.jpg'
  },

  {
    date: '2026-04-20',
    categorie: 'musique',
    titre: '« Le café d’en face » écoutable sur tout le site',
    resume: 'Un lecteur flottant permet d’écouter le morceau sans quitter la page où vous vous trouvez.',
    lien: 'musique.html',
    image: 'images/concert-scene.JPG'
  },

  {
    date: '2026-04-19',
    categorie: 'coulisses',
    titre: 'Le nouveau site lehahiah.fr est en ligne',
    resume: 'Agenda, musique, vidéos et historique des scènes réunis au même endroit.',
    lien: 'a-propos.html',
    image: 'images/panoramique-groupe.png'
  }

  /* ---------------------------------------------------------
     MODÈLES À COPIER (enlever les barres de commentaire) :

  ,{
    date: '2026-12-01',
    categorie: 'video',
    titre: 'Nouveau clip : ...',
    resume: 'Deux lignes de description.',
    lien: 'https://www.youtube.com/watch?v=XXXX',
    externe: true,
    image: 'images/concert-scene.JPG'
  }

  ,{
    date: '2026-12-01',
    categorie: 'presse',
    titre: 'Lehahiah dans ...',
    resume: 'Deux lignes de description.',
    lien: 'https://exemple.fr/article',
    externe: true
  }

  --------------------------------------------------------- */

];

/* =============================================================
   À PARTIR D’ICI, RIEN À MODIFIER
   ============================================================= */

(function () {

  var CATEGORIES = {
    agenda:    { label: 'Agenda',    couleur: 'agenda' },
    musique:   { label: 'Musique',   couleur: 'musique' },
    video:     { label: 'Vidéo',     couleur: 'video' },
    presse:    { label: 'Presse',    couleur: 'presse' },
    coulisses: { label: 'Coulisses', couleur: 'coulisses' }
  };

  var MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
              'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  // 'AAAA-MM-JJ' -> Date locale (évite le décalage de fuseau de new Date('...'))
  function toDate(iso) {
    var p = String(iso).split('-');
    return new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
  }

  function formatDate(iso) {
    var d = toDate(iso);
    if (isNaN(d)) return '';
    return d.getDate() + ' ' + MOIS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function categorieDe(actu) {
    return CATEGORIES[actu.categorie] || { label: 'Actualité', couleur: 'coulisses' };
  }

  function triees() {
    return ACTUS.slice().sort(function (a, b) {
      return toDate(b.date) - toDate(a.date);
    });
  }

  function el(tag, className, texte) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (texte != null) n.textContent = texte;
    return n;
  }

  function lienDe(actu, className) {
    var a = el('a', className);
    a.href = actu.lien || '#';
    if (actu.externe) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    return a;
  }

  function meta(actu) {
    var cat = categorieDe(actu);
    var wrap = el('div', 'actu-meta');
    wrap.appendChild(el('span', 'actu-tag actu-tag--' + cat.couleur, cat.label));
    var t = el('time', 'actu-date', formatDate(actu.date));
    t.setAttribute('datetime', actu.date);
    wrap.appendChild(t);
    return wrap;
  }

  // Carte complète (image + titre + résumé)
  function carte(actu, avecImage) {
    var article = el('article', 'actu-card');
    var a = lienDe(actu, 'actu-card__link');

    if (avecImage && actu.image) {
      var media = el('div', 'actu-card__media');
      var img = document.createElement('img');
      img.src = actu.image;
      img.alt = '';
      img.loading = 'lazy';
      media.appendChild(img);
      a.appendChild(media);
    }

    var corps = el('div', 'actu-card__body');
    corps.appendChild(meta(actu));
    corps.appendChild(el('h3', 'actu-card__title', actu.titre || ''));
    if (actu.resume) corps.appendChild(el('p', 'actu-card__excerpt', actu.resume));
    corps.appendChild(el('span', 'actu-card__more', actu.externe ? 'Ouvrir ↗' : 'Lire la suite →'));
    a.appendChild(corps);

    article.appendChild(a);
    return article;
  }

  // Ligne compacte (liste "les précédentes")
  function ligne(actu) {
    var article = el('article', 'actu-row');
    var a = lienDe(actu, 'actu-row__link');
    a.appendChild(meta(actu));
    a.appendChild(el('h3', 'actu-row__title', actu.titre || ''));
    article.appendChild(a);
    return article;
  }

  function vide(message) {
    return el('p', 'actu-empty', message);
  }

  // ----- Bloc page d'accueil : 1 actu en avant + 4 en liste -----
  function rendreAccueil(hote) {
    var liste = triees();
    hote.textContent = '';
    if (!liste.length) { hote.appendChild(vide('Les prochaines actualités arrivent bientôt.')); return; }

    var grille = el('div', 'actu-home');

    var une = el('div', 'actu-home__featured');
    une.appendChild(carte(liste[0], true));
    grille.appendChild(une);

    var suite = el('div', 'actu-home__list');
    liste.slice(1, 5).forEach(function (actu) { suite.appendChild(ligne(actu)); });
    grille.appendChild(suite);

    hote.appendChild(grille);
  }

  // ----- Page actualités : filtres + grille complète -----
  function rendreGrille(hote, categorie) {
    var liste = triees().filter(function (a) {
      return categorie === 'tout' || a.categorie === categorie;
    });
    hote.textContent = '';
    if (!liste.length) {
      hote.appendChild(vide('Aucune actualité dans cette rubrique pour le moment.'));
      return;
    }
    var grille = el('div', 'actu-grid');
    liste.forEach(function (actu) { grille.appendChild(carte(actu, true)); });
    hote.appendChild(grille);
  }

  function brancherFiltres(hote) {
    var barre = document.querySelector('[data-actus-filtres]');
    if (!barre) return;

    // N'affiche que les rubriques qui contiennent au moins une actu
    var presentes = {};
    ACTUS.forEach(function (a) { presentes[a.categorie] = true; });

    barre.textContent = '';
    var choix = [{ cle: 'tout', label: 'Tout' }];
    Object.keys(CATEGORIES).forEach(function (cle) {
      if (presentes[cle]) choix.push({ cle: cle, label: CATEGORIES[cle].label });
    });

    choix.forEach(function (c, i) {
      var b = el('button', 'actu-filter' + (i === 0 ? ' is-active' : ''), c.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
      b.addEventListener('click', function () {
        barre.querySelectorAll('.actu-filter').forEach(function (autre) {
          autre.classList.remove('is-active');
          autre.setAttribute('aria-pressed', 'false');
        });
        b.classList.add('is-active');
        b.setAttribute('aria-pressed', 'true');
        rendreGrille(hote, c.cle);
      });
      barre.appendChild(b);
    });
  }

  // ----- Données structurées (ItemList) pour la page actualités -----
  function injecterJsonLd() {
    var liste = triees();
    if (!liste.length) return;
    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Actualités Lehahiah',
      itemListElement: liste.map(function (actu, i) {
        return {
          '@type': 'ListItem',
          position: i + 1,
          name: actu.titre,
          url: /^https?:/.test(actu.lien || '') ? actu.lien : 'https://lehahiah.fr/' + (actu.lien || '')
        };
      })
    });
    document.head.appendChild(script);
  }

  // ----- Montage -----
  var accueil = document.querySelector('[data-actus="accueil"]');
  if (accueil) rendreAccueil(accueil);

  var page = document.querySelector('[data-actus="page"]');
  if (page) {
    rendreGrille(page, 'tout');
    brancherFiltres(page);
    injecterJsonLd();
  }

})();
