// Roll the five search terms in place without changing the full sentence.
(() => {
    const intro = document.querySelector('.search-intro');
    if (!intro) return;
    const words = [...intro.querySelectorAll('.kinetic-word')];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer = null;
    let animation = null;
    let index = 0;
    let hovered = false;
    let visible = false;
    function stop() {
        clearInterval(timer);
        timer = null;
        if (animation) animation.cancel();
        animation = null;
    }
    function roll() {
        const word = words[index];
        index = (index + 1) % words.length;
        animation = word.animate([
            { opacity: 1, transform: 'perspective(600px) rotateX(0deg) translateY(0)' },
            { opacity: 0, transform: 'perspective(600px) rotateX(85deg) translateY(-.35em)', offset: 0.45 },
            { opacity: 0, transform: 'perspective(600px) rotateX(-85deg) translateY(.35em)', offset: 0.46 },
            { opacity: 1, transform: 'perspective(600px) rotateX(0deg) translateY(0)' }
        ], { duration: 680, easing: 'cubic-bezier(.22,.7,.28,1)' });
    }
    function sync() {
        stop();
        if (words.length && !motion.matches && typeof words[0].animate === 'function' && visible && !hovered && !document.hidden) timer = setInterval(roll, 2500);
    }
    intro.addEventListener('mouseenter', () => { hovered = true; sync(); });
    intro.addEventListener('mouseleave', () => { hovered = false; sync(); });
    document.addEventListener('visibilitychange', sync);
    motion.addEventListener('change', sync);
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.1 }).observe(intro);
    } else visible = true;
    sync();
})();
