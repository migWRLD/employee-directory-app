// Compact city clocks adapted from the TimeZone reference using native Intl.
(() => {
    const zones = {
        'vancouver': 'America/Vancouver', 'toronto': 'America/Toronto', 'montreal': 'America/Toronto', 'calgary': 'America/Edmonton',
        'los angeles': 'America/Los_Angeles', 'san francisco': 'America/Los_Angeles',
        'san diego': 'America/Los_Angeles', 'seattle': 'America/Los_Angeles',
        'las vegas': 'America/Los_Angeles', 'portland': 'America/Los_Angeles',
        'san antonio': 'America/Chicago', 'austin': 'America/Chicago',
        'houston': 'America/Chicago', 'dallas': 'America/Chicago', 'chicago': 'America/Chicago',
        'denver': 'America/Denver', 'el paso': 'America/Denver', 'salt lake city': 'America/Denver',
        'phoenix': 'America/Phoenix', 'tucson': 'America/Phoenix',
        'new york': 'America/New_York', 'boston': 'America/New_York', 'miami': 'America/New_York',
        'atlanta': 'America/New_York', 'washington': 'America/New_York',
        'honolulu': 'Pacific/Honolulu', 'anchorage': 'America/Anchorage'
    };
    const abbreviations = {PT:'America/Los_Angeles',PST:'America/Los_Angeles',PDT:'America/Los_Angeles',CT:'America/Chicago',CST:'America/Chicago',CDT:'America/Chicago',MT:'America/Denver',MST:'America/Denver',MDT:'America/Denver',ET:'America/New_York',EST:'America/New_York',EDT:'America/New_York',AKT:'America/Anchorage',HST:'Pacific/Honolulu'};
    const states = {california:'America/Los_Angeles',ca:'America/Los_Angeles',washington:'America/Los_Angeles',wa:'America/Los_Angeles',colorado:'America/Denver',co:'America/Denver',utah:'America/Denver',ut:'America/Denver','new york':'America/New_York',ny:'America/New_York',massachusetts:'America/New_York',ma:'America/New_York',georgia:'America/New_York',ga:'America/New_York',illinois:'America/Chicago',il:'America/Chicago',hawaii:'Pacific/Honolulu',hi:'Pacific/Honolulu'};
    const formatters = new Map();
    function valid(zone) {
        try { new Intl.DateTimeFormat('en-US', { timeZone: zone }); return zone; } catch { return null; }
    }
    function resolve(employee) {
        if (employee.timeZone) return valid(employee.timeZone);
        const location = String(employee.location || '').trim();
        const parts = location.toLowerCase().split(',').map(part => part.trim());
        // City takes priority: Phoenix stays on MST while Denver changes seasonally.
        if (zones[parts[0]]) return zones[parts[0]];
        const label = location.match(/\((PT|PST|PDT|CT|CST|CDT|MT|MST|MDT|ET|EST|EDT|AKT|HST)\)/i);
        if (label) return abbreviations[label[1].toUpperCase()];
        const state = (parts.length > 1 ? parts[parts.length - 1] : parts[0]).replace(/\s*\(.*\)\s*$/, '').trim();
        return states[state] || null;
    }
    function format(zone, date = new Date()) {
        if (!formatters.has(zone)) formatters.set(zone, new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit', hour12: true, timeZoneName: 'short' }));
        return formatters.get(zone).format(date);
    }
    function update(element, date = new Date()) {
        const zone = element.dataset.timeZone;
        if (!zone) return;
        element.textContent = format(zone, date);
        element.setAttribute('datetime', date.toISOString());
        element.setAttribute('aria-label', 'Local time in ' + element.dataset.location + ': ' + element.textContent);
    }
    function create(employee) {
        const element = document.createElement('time');
        element.className = 'card-local-time';
        element.setAttribute('aria-live', 'off');
        const zone = resolve(employee);
        if (zone) {
            element.dataset.timeZone = zone;
            element.dataset.location = employee.location || zone;
            update(element);
        } else element.textContent = 'Local time unavailable';
        return element;
    }
    function refresh() {
        if (document.hidden) return;
        const now = new Date();
        document.querySelectorAll('.card-local-time[data-time-zone]').forEach(element => update(element, now));
    }
    window.CardLocalTime = Object.freeze({ resolve, format, create });
    setInterval(refresh, 1000);
    document.addEventListener('visibilitychange', refresh);
})();
