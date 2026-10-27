// Measure existing links for a goo-filtered highlight; routing stays with the app.
(() => {
    const nav = document.querySelector('#primary-navigation.liquid-navigation');
    if (!nav) return;
    const links = [...nav.querySelectorAll('a')];
    if (!links.length) return;
    let hovered = null;
    const active = () => links.find(link => link.hasAttribute('aria-current')) || links[0];
    function update() {
        if (!nav.offsetWidth || !nav.offsetHeight) return;
        const focused = links.includes(document.activeElement) ? document.activeElement : null;
        const target = hovered || focused || active();
        links.forEach(link => link.classList.toggle('liquid-target', link === target));
        nav.style.setProperty('--pill-left', `${target.offsetLeft}px`);
        nav.style.setProperty('--pill-top', `${target.offsetTop}px`);
        nav.style.setProperty('--pill-width', `${target.offsetWidth}px`);
        nav.style.setProperty('--pill-height', `${target.offsetHeight}px`);
        nav.classList.add('liquid-ready');
    }
    links.forEach(link => {
        link.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') { hovered = link; update(); } });
        link.addEventListener('focus', () => { hovered = null; update(); });
    });
    nav.addEventListener('pointerleave', () => { hovered = null; update(); });
    nav.addEventListener('focusout', () => requestAnimationFrame(update));
    window.addEventListener('hashchange', () => { hovered = null; update(); });
    window.addEventListener('resize', update);
    if ('ResizeObserver' in window) new ResizeObserver(update).observe(nav);
    new MutationObserver(update).observe(nav, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
    if (document.fonts) document.fonts.ready.then(update);
    update();
})();
