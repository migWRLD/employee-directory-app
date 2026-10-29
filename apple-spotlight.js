/* Apple Spotlight by Samit Kapoor: plain-JS adaptation of the supplied component.
   Search stays on this page; protected form destinations still require admin login. */
(function () {
    'use strict';
    const root = document.getElementById('teammate-spotlight');
    if (!root) return;
    const input = root.querySelector('#spotlight-search');
    const results = root.querySelector('#spotlight-results');
    const placeholder = root.querySelector('.spotlight-placeholder');
    const status = root.querySelector('#spotlight-status');
    const shortcuts = root.querySelector('.spotlight-shortcuts');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const paths = {
        search: '<circle cx="10.8" cy="10.8" r="7.8"/><path d="m16.5 16.5 4.5 4.5"/>',
        person: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2M19 8h4m-2-2v4"/>',
        grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        teams: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-2a7 7 0 0 1 14 0v2M16 4a4 4 0 0 1 0 8m3 3a6 6 0 0 1 3 6"/>',
        mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',
        globe: '<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/>',
        link: '<path d="m10 13 4-4M8 15l-2 2a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0m2 1 2-2a3 3 0 0 1 4 4l-5 5a3 3 0 0 1-4 0"/>',
        arrow: '<path d="m9 5 7 7-7 7"/>'
    };
    function icon(name) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '1.4');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        svg.setAttribute('aria-hidden', 'true');
        // Only the fixed icon paths above are inserted as SVG markup.
        svg.innerHTML = paths[name] || paths.search;
        return svg;
    }
    const entries = [
        { label: 'Add teammate', description: 'Open the teammate workspace · admin sign-in required', href: '#teammate-workspace', icon: 'person', keywords: 'new create add form login sign in' },
        { label: 'Directory', description: 'Find people, roles, departments, and skills', href: 'index.html#directory', icon: 'grid', keywords: 'search employees colleagues people' },
        { label: 'Departments', description: 'Explore departments and teams', href: 'index.html#Departments', icon: 'teams', keywords: 'division team' },
        { label: 'About', description: 'Learn about The People', href: 'index.html#About', icon: 'globe', keywords: 'project information' },
        { label: 'Contact', description: 'Visit the contact page', href: 'index.html#Contact', icon: 'mail', keywords: 'email help' },
        { label: 'Basic identity & contact', description: 'Full name, public email, and profile photo', href: '#identity-heading', focus: 'employee-name', icon: 'person', keywords: 'upload image picture identity' },
        { label: 'Role & department', description: 'Job title, department, and joining date', href: '#role-heading', focus: 'employee-title', icon: 'teams', keywords: 'job start work' },
        { label: 'Location & time zone', description: 'City, state or province, country, and local time zone', href: '#role-heading', focus: 'employee-location', icon: 'globe', keywords: 'timezone worldwide location region canada vancouver' },
        { label: 'Bio & skills', description: 'Biography, skills, and expertise', href: '#skills-heading', focus: 'employee-bio', icon: 'search', keywords: 'experience html css javascript' },
        { label: 'Professional links', description: 'LinkedIn, GitHub, and portfolio', href: '#links-heading', focus: 'employee-linkedin', icon: 'link', keywords: 'social website profile' },
        { label: 'Manage teammates', description: 'Search the roster and edit existing profiles', href: '#roster-heading', focus: 'admin-search', icon: 'teams', keywords: 'employees list edit delete remove roster' }
    ];
    function setPlaceholder(text = 'Search') {
        if (placeholder.textContent !== text) {
            placeholder.textContent = text;
            placeholder.classList.remove('is-changing');
            // Restart the small blur/slide transition when the hovered label changes.
            void placeholder.offsetWidth;
            placeholder.classList.add('is-changing');
        }
        placeholder.hidden = Boolean(input.value);
    }
    function goToSection(event, entry) {
        if (!entry.href.startsWith('#')) return;
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const manager = document.getElementById('manager-panel');
        const locked = entry.focus && manager.hidden;
        const target = document.querySelector(locked ? '#teammate-workspace' : entry.href);
        if (!target) return;
        const focus = locked
            ? document.querySelector('#login-panel:not([hidden]) #login-email') || target
            : entry.focus ? document.getElementById(entry.focus) : target;
        if (!focus.hasAttribute('tabindex') && !focus.matches('input,select,textarea,button,a')) focus.setAttribute('tabindex', '-1');
        focus.focus({ preventScroll: true });
        target.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
        if (locked) status.textContent = 'Sign in with an approved admin account to use this form field.';
    }
    function makeLink(entry, shortcut = false) {
        const link = document.createElement('a');
        link.href = entry.href;
        link.className = shortcut ? 'spotlight-shortcut' : 'spotlight-result';
        link.append(icon(entry.icon));
        if (shortcut) {
            link.setAttribute('aria-label', entry.label);
            link.title = entry.label;
        } else {
            const copy = document.createElement('span');
            copy.className = 'spotlight-result-copy';
            const label = document.createElement('strong');
            label.textContent = entry.label;
            const description = document.createElement('small');
            description.textContent = entry.description;
            copy.append(label, description);
            const arrow = icon('arrow');
            arrow.classList.add('spotlight-chevron');
            link.append(copy, arrow);
        }
        link.addEventListener('click', event => goToSection(event, entry));
        link.addEventListener('pointerenter', () => setPlaceholder(entry.label));
        link.addEventListener('focus', () => setPlaceholder(entry.label));
        link.addEventListener('pointerleave', () => setPlaceholder());
        link.addEventListener('blur', () => setPlaceholder());
        return link;
    }
    [entries[0], entries[1], entries[2], entries[4]].forEach(entry => shortcuts.append(makeLink(entry, true)));
    function render() {
        const query = input.value.trim().toLocaleLowerCase();
        root.dataset.searching = String(Boolean(query));
        results.replaceChildren();
        results.hidden = !query;
        input.setAttribute('aria-expanded', String(Boolean(query)));
        setPlaceholder();
        if (!query) { status.textContent = ''; return; }
        const terms = query.split(/\s+/);
        const matches = entries.filter(entry => {
            const text = `${entry.label} ${entry.description} ${entry.keywords}`.toLocaleLowerCase();
            return terms.every(term => text.includes(term));
        });
        matches.forEach((entry, i) => {
            const link = makeLink(entry);
            link.style.setProperty('--result-delay', `${i * 35}ms`);
            results.append(link);
        });
        if (!matches.length) {
            const empty = document.createElement('p');
            empty.className = 'spotlight-empty';
            empty.textContent = 'No matches. Try “location”, “skills”, or “Directory”.';
            results.append(empty);
        }
        status.textContent = matches.length ? `${matches.length} matching destination${matches.length === 1 ? '' : 's'}.` : 'No matches. Try location, skills, or Directory.';
    }
    input.addEventListener('input', render);
    root.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            input.value = '';
            render();
            input.focus({ preventScroll: true });
            return;
        }
        const links = Array.from(results.querySelectorAll('a'));
        if (!links.length) return;
        const index = links.indexOf(document.activeElement);
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            // Only intercept navigation inside the search and its results, not appearance controls.
            if (document.activeElement !== input && index < 0) return;
            event.preventDefault();
            const next = event.key === 'ArrowDown' ? index + 1 : index < 0 ? links.length - 1 : index - 1;
            if (next < 0) input.focus({ preventScroll: true });
            else links[next % links.length].focus();
        } else if (event.key === 'Enter' && document.activeElement === input) {
            event.preventDefault();
            links[0].click();
        }
    });
    const size = root.querySelector('#spotlight-size');
    const width = root.querySelector('#spotlight-width');
    const opacity = root.querySelector('#spotlight-opacity');
    const output = root.querySelector('#spotlight-opacity-value');
    function updateAppearance() {
        root.dataset.size = ['compact', 'regular', 'large'].includes(size.value) ? size.value : 'regular';
        root.style.setProperty('--spotlight-width', `${Number(width.value) || 768}px`);
        root.style.setProperty('--spotlight-opacity', String(1 - Number(opacity.value) / 100));
        root.dataset.glass = String(Number(opacity.value) > 50);
        output.value = `${opacity.value}%`;
    }
    [size, width].forEach(control => control.addEventListener('change', updateAppearance));
    opacity.addEventListener('input', updateAppearance);
    updateAppearance();
    render();
})();
