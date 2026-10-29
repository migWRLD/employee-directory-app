const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
const tick = () => new Promise(resolve => setImmediate(resolve));
const people = [
    { id: 'person-1', name: 'Zoë Example', title: 'Developer', department: 'Engineering', email: 'zoe@example.com', location: 'Vancouver, British Columbia, Canada', country: 'Canada', skills: ['JavaScript', 'CSS'], bio: 'Builds accessible websites.' },
    { id: 'person-2', name: 'Alex Sample', title: 'Designer', department: 'Design', email: 'alex@example.com', location: 'Los Angeles, California, United States', country: 'United States', skills: ['Figma'], bio: '' }
];
function setup(list = async () => people) {
    const dom = new JSDOM(fs.readFileSync('admin.html', 'utf8'), {
        runScripts: 'outside-only', url: 'https://example.com/admin.html'
    });
    const w = dom.window;
    w.matchMedia = () => ({ matches: true });
    w.EmployeeStore = { list };
    w.HTMLElement.prototype.scrollIntoView = function () {};
    w.eval(fs.readFileSync('apple-spotlight.js', 'utf8'));
    return w;
}
function search(w, query) {
    const input = w.document.getElementById('spotlight-search');
    input.value = query;
    input.dispatchEvent(new w.Event('input'));
    return input;
}
test('Spotlight finds directory profiles by name, skill, country, role, email and bio', async () => {
    const w = setup();
    try {
        const d = w.document;
        for (const query of ['  ZOE  ', 'javaScript', 'Canada', 'Developer', 'zoe@example.com', 'accessible websites', 'Canada CSS']) {
            search(w, query); await tick();
            assert.equal(d.querySelectorAll('.spotlight-result').length, 1, query);
            assert.match(d.querySelector('.spotlight-result').textContent, /Zoë Example/);
            assert.match(d.querySelector('.spotlight-result').href, /index.html\?employee=person-1#directory$/);
        }
        search(w, 'xyz-no-such-person');
        assert.equal(d.querySelectorAll('.spotlight-result').length, 0);
        assert.match(d.getElementById('spotlight-results').textContent, /No people found/);
        search(w, '   ');
        assert.equal(d.getElementById('spotlight-results').hidden, true);
        assert.equal(d.querySelectorAll('.spotlight-shortcut').length, 4);
    } finally { w.close(); }
});
test('keyboard arrows reach profiles and Escape clears and returns focus to search', async () => {
    const w = setup();
    try {
        const d = w.document;
        const input = search(w, 'CSS'); await tick();
        input.focus();
        input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        assert.equal(d.activeElement, d.querySelector('.spotlight-result'));
        d.activeElement.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        assert.equal(d.activeElement, input);
        assert.equal(input.value, '');
        assert.equal(d.getElementById('spotlight-results').hidden, true);
    } finally { w.close(); }
});
test('pending searches use the newest query, while failed requests offer retry', async () => {
    let complete;
    let attempts = 0;
    const w = setup(() => ++attempts === 1 ? Promise.reject(new Error('Offline')) : new Promise(resolve => { complete = resolve; }));
    try {
        const d = w.document;
        search(w, 'Canada'); await tick();
        assert.match(d.getElementById('spotlight-results').textContent, /Could not load/);
        d.querySelector('.spotlight-retry').click();
        search(w, 'Figma');
        complete(people); await tick();
        assert.equal(d.querySelectorAll('.spotlight-result').length, 1);
        assert.match(d.querySelector('.spotlight-result').textContent, /Alex Sample/);
    } finally { w.close(); }
});
test('default appearance is regular, standard width and lightly glassy at 0 percent', () => {
    const w = setup();
    try {
        const d = w.document, root = d.getElementById('teammate-spotlight');
        assert.equal(root.dataset.size, 'regular');
        assert.equal(root.style.getPropertyValue('--spotlight-width'), '768px');
        assert.equal(d.getElementById('spotlight-opacity').value, '0');
        assert.equal(root.style.getPropertyValue('--spotlight-opacity'), '0.88');
    } finally { w.close(); }
});
async function directory(url) {
    const dom = new JSDOM(fs.readFileSync('index.html', 'utf8'), { runScripts: 'outside-only', url, pretendToBeVisual: true });
    const w = dom.window;
    w.matchMedia = () => ({ matches: true, addEventListener() {} });
    w.EmployeeStore = { list: async () => people };
    w.HTMLElement.prototype.scrollIntoView = function () {};
    w.eval(fs.readFileSync('directory.js', 'utf8'));
    await tick();
    return w;
}
test('selecting a Spotlight profile opens the matching existing directory modal', async () => {
    const w = await directory('https://example.com/index.html?employee=person-1#directory');
    try {
        assert.equal(w.document.querySelector('#employee-profile-name').textContent, 'Zoë Example');
        assert.equal(w.document.querySelector('.profile-modal').getAttribute('role'), 'dialog');
        w.document.querySelector('.modal-close').click();
        assert.equal(w.document.querySelector('.profile-modal'), null);
        assert.equal(w.document.querySelectorAll('#employee-list .employee-card').length, 2);
    } finally { w.close(); }
});
test('a removed profile link keeps the directory usable and explains the missing profile', async () => {
    const w = await directory('https://example.com/index.html?employee=removed#directory');
    try {
        assert.equal(w.document.querySelector('.profile-modal'), null);
        assert.match(w.document.querySelector('#directory-status').textContent, /no longer available/);
        assert.equal(w.document.querySelectorAll('#employee-list .employee-card').length, 2);
    } finally { w.close(); }
});
