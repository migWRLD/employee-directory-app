// Kinetic Text Swapper-style 3D word roll; only the search terms move.
(() => {
    const intro = document.querySelector('.search-intro');
    if (!intro) return;
    const word = intro.querySelector('.kinetic-word');
    const pause = intro.querySelector('.kinetic-pause');
    const terms = ['name', 'role', 'email', 'department', 'skill'];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let timer = null;
    let animation = null;
    let paused = false;
    let hovered = false;
    let visible = false;
    let version = 0;
    function stop() {
        clearInterval(timer);
        timer = null;
        version++;
        if (animation) animation.cancel();
        animation = null;
    }
    async function swap() {
        const current = version;
        animation = word.animate([
            { opacity: 1, transform: 'rotateX(0deg) translateY(0)' },
            { opacity: 0, transform: 'rotateX(85deg) translateY(-.7em)' }
        ], { duration: 260, easing: 'ease-in', fill: 'forwards' });
        try { await animation.finished; } catch { return; }
        if (current !== version) return;
        animation.cancel();
        word.textContent = terms[index = (index + 1) % terms.length];
        animation = word.animate([
            { opacity: 0, transform: 'rotateX(-85deg) translateY(.7em)' },
            { opacity: 1, transform: 'rotateX(0deg) translateY(0)' }
        ], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
        try { await animation.finished; } catch { return; }
        if (current === version) animation = null;
    }
    function sync() {
        stop();
        const enabled = !motion.matches && typeof word.animate === 'function';
        intro.classList.toggle('kinetic-ready', enabled);
        pause.hidden = !enabled;
        if (enabled && visible && !paused && !hovered && !document.hidden) timer = setInterval(swap, 2500);
    }
    pause.addEventListener('click', () => {
        paused = !paused;
        pause.setAttribute('aria-pressed', String(paused));
        pause.setAttribute('aria-label', (paused ? 'Resume' : 'Pause') + ' rotating search terms');
        pause.firstElementChild.textContent = paused ? '▶' : 'Ⅱ';
        sync();
    });
    intro.addEventListener('mouseenter', () => { hovered = true; sync(); });
    intro.addEventListener('mouseleave', () => { hovered = false; sync(); });
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.1 }).observe(intro);
    } else visible = true;
    sync();
})();
