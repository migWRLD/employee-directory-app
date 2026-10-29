const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const tick = () => new Promise(resolve => setImmediate(resolve));
const example = {
    id: 'demo-1', name: 'Alex Example', title: 'Engineering Manager', department: 'Engineering',
    email: 'alex@example.com', image: 'img/example.png', bio: 'Builds useful tools.\nEnjoys mentoring.',
    location: 'Vancouver, British Columbia, Canada', timeZone: 'America/Vancouver',
    joiningDate: '2026-10-01', directReports: 2, skills: ['HTML', 'CSS', 'JavaScript', 'SQL'],
    projects: ['Directory search', 'TBD', ' ', 'Accessibility improvements'],
    linkedin: 'https://www.linkedin.com/in/example', github: 'javascript:alert(1)'
};
async function setup(people = [example]) {
    const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { runScripts: 'outside-only', url: 'https://example.com/index.html#directory', pretendToBeVisual: true });
    const w = dom.window;
    w.matchMedia = () => ({ matches: true, addEventListener() {} });
    w.EmployeeStore = { list: async () => people };
    w.eval(fs.readFileSync('card-local-time.js', 'utf8'));
    w.eval(fs.readFileSync('directory.js', 'utf8'));
    await tick();
    return w;
}
test('larger cards show all four sections, complete skills, contact links and saved projects', async () => {
    const w = await setup();
    try {
        const card = w.document.querySelector('.expanded-card');
        assert.deepEqual([...card.querySelectorAll('h4')].map(h => h.textContent), ['Overview', 'Contact', 'Skills', 'Projects']);
        assert.equal(card.querySelector('.employee-card-bio').textContent, example.bio);
        assert.equal(card.querySelectorAll('.employee-skills-section .skill-badge').length, 4);
        assert.equal(card.querySelectorAll('.employee-project-list li').length, 2);
        assert.match(card.querySelector('.employee-contact-section').textContent, /alex@example.com/);
        assert.equal(card.querySelector('.social-links a').href, example.linkedin);
        assert.equal(card.querySelector('.social-links a').rel, 'noopener noreferrer');
        assert.equal(card.querySelectorAll('.social-links a').length, 1);
        assert.match(card.textContent, /Joined Oct 1, 2026/);
        assert.match(card.textContent, /2 direct reports/);
        assert.equal(card.querySelector('.card-local-time').dataset.timeZone, 'America/Vancouver');
        assert.equal(card.querySelector('.employee-avatar img').getAttribute('src'), 'https://example.com/img/example.png');
    } finally { w.close(); }
});
test('expanded cards render untrusted details as text and explain missing information', async () => {
    const w = await setup([{ ...example, bio: '<img src=x onerror=alert(1)>', skills: [], projects: [], email: '', linkedin: '', github: '' }]);
    try {
        const card = w.document.querySelector('.expanded-card');
        assert.equal(card.querySelector('.employee-card-bio img'), null);
        assert.match(card.querySelector('.employee-card-bio').textContent, /<img/);
        assert.match(card.querySelector('.employee-contact-section').textContent, /Email not listed/);
        assert.match(card.querySelector('.employee-skills-section').textContent, /Skills not listed/);
        assert.match(card.querySelector('.employee-projects-section').textContent, /No projects listed/);
    } finally { w.close(); }
});
test('larger cards retain bookmarks, profile dialogs, grid/table switching and combined filters', async () => {
    const w = await setup([example, { ...example, id: 'demo-2', name: 'Sam Sample', department: 'Design', email: 'sam@example.com', skills: ['Figma'] }]);
    try {
        const d = w.document;
        d.querySelector('.card-bookmark').click();
        assert.equal(w.localStorage.getItem('directoryBookmark:demo-1'), 'true');
        d.querySelector('.expanded-card .profile-button').click();
        assert.equal(d.querySelector('#employee-profile-name').textContent, example.name);
        d.querySelector('.modal-close').click();
        const input = d.getElementById('search');
        input.value = 'sQl'; input.dispatchEvent(new w.Event('input'));
        await new Promise(resolve => setTimeout(resolve, 300));
        assert.equal(d.querySelectorAll('.expanded-card').length, 1);
        const filter = d.getElementById('department-filter');
        filter.value = 'design'; filter.dispatchEvent(new w.Event('change'));
        assert.equal(d.querySelectorAll('.expanded-card').length, 0);
        assert.match(d.querySelector('.empty-state').textContent, /No/);
        input.value = ''; input.dispatchEvent(new w.Event('input'));
        await new Promise(resolve => setTimeout(resolve, 300));
        assert.equal(d.querySelectorAll('.expanded-card').length, 1);
        d.getElementById('viewTableBtn').click();
        assert.equal(d.getElementById('employee-table-body').rows.length, 1);
        d.getElementById('viewGridBtn').click();
        assert.equal(d.querySelector('.expanded-card h3').textContent, 'Sam Sample');
    } finally { w.close(); }
});
test('inline copy email retains its icon and reports success or failure', async () => {
    const w = await setup();
    try {
        let copied;
        Object.defineProperty(w.navigator, 'clipboard', { value: { writeText: async text => { copied = text; } }, configurable: true });
        const button = w.document.querySelector('.employee-email-row .copy-email-icon');
        button.click(); await tick();
        assert.equal(copied, example.email);
        assert.ok(button.querySelector('svg'));
        assert.match(button.getAttribute('aria-label'), /Email copied/);
        w.navigator.clipboard.writeText = async () => { throw new Error('Denied'); };
        button.click(); await tick();
        assert.ok(button.querySelector('svg'));
        assert.match(button.getAttribute('aria-label'), /Copy failed/);
    } finally { w.close(); }
});
