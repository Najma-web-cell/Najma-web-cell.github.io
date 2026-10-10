(function () {
    'use strict';
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

    /* ---------- Theme toggle ---------- */
    var root = document.documentElement;
    var themeBtn = $('#theme-toggle');
    function paintIcon() {
        themeBtn.innerHTML = root.getAttribute('data-theme') === 'light' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        var m = document.querySelector('meta[name="theme-color"]');
        if (m) m.setAttribute('content', root.getAttribute('data-theme') === 'light' ? '#fbf4ee' : '#120b0f');
    }
    paintIcon();
    themeBtn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
        paintIcon();
    });

    /* ---------- Mobile menu ---------- */
    var burger = $('#burger'), links = $('#nav-links');
    function setMenu(open) {
        links.classList.toggle('open', open);
        burger.setAttribute('aria-expanded', String(open));
        document.body.style.overflow = open ? 'hidden' : '';
    }
    burger.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
    $$('a', links).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

    /* ---------- Scroll progress, nav state, active link ---------- */
    var bar = $('#progress'), nav = $('#nav');
    var sections = $$('main section[id]');
    var navAnchors = $$('a', links);
    function onScroll() {
        var h = document.documentElement;
        var max = h.scrollHeight - h.clientHeight;
        bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
        nav.classList.toggle('scrolled', h.scrollTop > 20);
        var y = h.scrollTop + 140, current = '';
        sections.forEach(function (s) { if (s.offsetTop <= y) current = s.id; });
        navAnchors.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- Reveal on scroll ---------- */
    var items = $$('.reveal');
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        items.forEach(function (el) { io.observe(el); });
    } else {
        items.forEach(function (el) { el.classList.add('in'); });
    }

    /* ---------- Typing role ---------- */
    var typed = $('#typed');
    var roles = ['Full-Stack Developer', 'MERN & Go Specialist', 'REST API Builder', 'React Enthusiast'];
    var ri = 0, ci = roles[0].length, deleting = false;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tick() {
        var word = roles[ri];
        ci += deleting ? -1 : 1;
        typed.textContent = word.slice(0, ci);
        var delay = deleting ? 35 : 75;
        if (!deleting && ci === word.length) { deleting = true; delay = 1700; }
        else if (deleting && ci === 0) { deleting = false; ri = (ri + 1) % roles.length; delay = 350; }
        setTimeout(tick, delay);
    }
    if (!reduce) setTimeout(tick, 1800);

    /* ---------- Lightbox ---------- */
    var shots = $$('.shot');
    var lb = $('#lightbox'), lbImg = $('#lb-img'), lbTitle = $('#lb-title'), lbCount = $('#lb-count'), stage = $('#lb-stage');
    var idx = 0, lastFocus = null;
    function show(i) {
        idx = (i + shots.length) % shots.length;
        var img = $('img', shots[idx]);
        stage.classList.remove('zoomed');
        lbImg.src = img.currentSrc || img.src;
        lbImg.alt = img.alt;
        lbTitle.textContent = $('h3', shots[idx].closest('.project')).textContent;
        lbCount.textContent = (idx + 1) + ' / ' + shots.length;
        stage.scrollTop = 0; stage.scrollLeft = 0;
    }
    function openLb(i) {
        lastFocus = document.activeElement;
        show(i);
        lb.classList.add('open');
        lb.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        $('#lb-close').focus();
    }
    function closeLb() {
        lb.classList.remove('open');
        lb.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        if (lastFocus) lastFocus.focus();
    }
    shots.forEach(function (b, i) { b.addEventListener('click', function () { openLb(i); }); });
    $('#lb-close').addEventListener('click', closeLb);
    $('#lb-prev').addEventListener('click', function () { show(idx - 1); });
    $('#lb-next').addEventListener('click', function () { show(idx + 1); });
    lbImg.addEventListener('click', function (e) { e.stopPropagation(); stage.classList.toggle('zoomed'); });
    stage.addEventListener('click', function (e) { if (e.target === stage) closeLb(); });
    document.addEventListener('keydown', function (e) {
        if (!lb.classList.contains('open')) { if (e.key === 'Escape') setMenu(false); return; }
        if (e.key === 'Escape') closeLb();
        else if (e.key === 'ArrowLeft') show(idx - 1);
        else if (e.key === 'ArrowRight') show(idx + 1);
    });
    var sx = null;
    lb.addEventListener('touchstart', function (e) { sx = e.touches.length === 1 && !stage.classList.contains('zoomed') ? e.touches[0].clientX : null; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 60) show(idx + (dx < 0 ? 1 : -1));
        sx = null;
    }, { passive: true });
})();
