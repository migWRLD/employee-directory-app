const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { JSDOM } = require('jsdom');
function setup() {
    const dom = new JSDOM(fs.readFileSync('admin.html', 'utf8'), {
        runScripts: 'outside-only', url: 'https://example.com/admin.html'
    });
    const w = dom.window;
    w.matchMedia = () => ({ matches: true });
    w.HTMLElement.prototype.scrollIntoView = function () { w.scrolledTo = this.id; };
    w.eval(fs.readFileSync('apple-spotlight.js', 'utf8'));
    return w;
}
function search(w, query) {
    const input = w.document.getElementById('spotlight-search');
    input.value = query;
    input.dispatchEvent(new w.Event('input'));
    return input;
}
test('Spotlight searches case-insensitive terms, handles no matches, and resets blank queries', () => {
    const w = setup();
    try {
        const d = w.document;
        const input = search(w, '  TIME ZONE  ');
        assert.equal(d.querySelectorAll('.spotlight-result').length, 1);
        assert.match(d.querySelector('.spotlight-result').textContent, /Location & time zone/);
        search(w, 'xyz-no-such-field');
        assert.equal(d.querySelectorAll('.spotlight-result').length, 0);
        assert.match(d.getElementById('spotlight-results').textContent, /Try/);
        search(w, '   ');
        assert.equal(d.getElementById('spotlight-results').hidden, true);
        assert.equal(input.getAttribute('aria-expanded'), 'false');
        assert.equal(d.querySelectorAll('.spotlight-shortcut').length, 4);
    } finally { w.close(); }
});
test('keyboard arrows reach results and Escape clears the search and returns focus', () => {
    const w = setup();
    try {
        const d = w.document;
        const input = search(w, 'skills');
        input.focus();
        input.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        assert.equal(d.activeElement, d.querySelector('.spotlight-result'));
        d.activeElement.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        assert.equal(d.activeElement, input);
        assert.equal(input.value, '');
        assert.equal(d.getElementById('spotlight-results').hidden, true);
    } finally { w.close(); }
});
test('form shortcuts keep sign-in protection and reach the correct field for approved admins', () => {
    const w = setup();
    try {
        const d = w.document;
        d.getElementById('login-panel').hidden = false;
        search(w, 'time zone');
        d.querySelector('.spotlight-result').click();
        assert.equal(d.activeElement.id, 'login-email');
        assert.equal(w.scrolledTo, 'teammate-workspace');
        assert.equal(d.getElementById('manager-panel').hidden, true);
        d.getElementById('manager-panel').hidden = false;
        d.getElementById('login-panel').hidden = true;
        d.querySelector('.spotlight-result').click();
        assert.equal(d.activeElement.id, 'employee-location');
        assert.equal(w.scrolledTo, 'role-heading');
    } finally { w.close(); }
});
