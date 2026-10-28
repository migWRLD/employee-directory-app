(function () {
    'use strict';
    const hero = document.querySelector('.people-hero');
    if (!hero) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const link = hero.querySelector('.people-hero-action');
    link.addEventListener('click', event => {
        const target = document.getElementById('teammate-workspace');
        if (!target) return;
        event.preventDefault();
        target.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
    });

    const canvas = document.getElementById('people-particles');
    const context = canvas && canvas.getContext('2d');
    if (!context) return;
    const toggle = document.getElementById('people-particles-toggle');
    let width = 0, height = 0, particles = [], frame = null, previousTime = null;
    let paused = false, visible = true;

    function draw() {
        context.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            for (let j = i + 1; j < particles.length; j++) {
                const other = particles[j];
                const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
                if (distance > 125) continue;
                context.strokeStyle = `rgba(147,195,255,${(1 - distance / 125) * 0.24})`;
                context.beginPath();
                context.moveTo(particle.x, particle.y);
                context.lineTo(other.x, other.y);
                context.stroke();
            }
            context.fillStyle = 'rgba(174,211,255,0.65)';
            context.beginPath();
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fill();
        }
    }
    function animate(time) {
        const step = previousTime === null ? 0 : Math.min((time - previousTime) / 16.67, 2);
        previousTime = time;
        for (const particle of particles) {
            particle.x += particle.vx * step;
            particle.y += particle.vy * step;
            if (particle.x < 0 || particle.x > width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > height) particle.vy *= -1;
        }
        draw();
        frame = requestAnimationFrame(animate);
    }
    function syncAnimation() {
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        previousTime = null;
        toggle.hidden = motion.matches;
        if (!paused && !motion.matches && !document.hidden && visible) frame = requestAnimationFrame(animate);
        else draw();
    }
    function resize() {
        width = hero.clientWidth;
        height = hero.clientHeight;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        particles = Array.from({ length: Math.min(65, Math.max(20, Math.floor(width * height / 10000))) }, () => ({
            x: Math.random() * width, y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.32, vy: (Math.random() - 0.5) * 0.32,
            radius: 1 + Math.random() * 1.3
        }));
        draw();
    }
    toggle.addEventListener('click', () => {
        paused = !paused;
        toggle.textContent = paused ? 'Resume animation' : 'Pause animation';
        toggle.setAttribute('aria-pressed', String(paused));
        syncAnimation();
    });
    motion.addEventListener('change', syncAnimation);
    document.addEventListener('visibilitychange', syncAnimation);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(hero);
    else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        syncAnimation();
    }).observe(hero);
    resize();
    syncAnimation();
})();
