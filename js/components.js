/* nortec/js/components.js — shared nav, footer, ticker */

export function renderNav(activePage = '') {
  return `
<nav class="nav">
  <a class="nav-logo" href="/">
    <span>NORTEC</span>
    <div class="nav-wordmark">NORTHBOUND<br>TALENT.</div>
  </a>
  <ul class="nav-links">
    <li><a href="/jobs" class="${activePage==='jobs'?'active':''}">Jobs</a></li>
    <li><a href="/tracker" class="${activePage==='tracker'?'active':''}">Tracker</a></li>
    <li><a href="/archive" class="${activePage==='archive'?'active':''}">Archive</a></li>
    <li><a href="/insights" class="${activePage==='insights'?'active':''}">Insights</a></li>
    <li><a href="/employers" class="${activePage==='employers'?'active':''}">For Employers</a></li>
  </ul>
  <div class="nav-actions">
    <a class="btn-ghost" href="/employers">For Employers</a>
    <a class="btn-primary" href="/#subscribe">Subscribe</a>
  </div>
</nav>`;
}

export function renderTicker() {
  const items = [
    'Remote AI + Tech Jobs · LatAm',
    'Salary Signals · Señales de salario',
    'Work global. Live local.',
    'Devs · Engineers · CS · Data · QA',
    'Colombia · México · Argentina · Brasil · Chile',
    'Trabaja global. Vive en LatAm.',
    'Bilingual · EN / ES · Weekly · Free',
    'Northbound Talent.',
  ];
  const html = items.map(i => `<span class="ticker-item">${i}<span class="ticker-sep"> ◆ </span></span>`).join('');
  return `<div class="ticker-wrap"><div class="ticker-track">${html}${html}</div></div>`;
}

export function renderFooter() {
  return `
<footer style="background:var(--bg2);border-top:1px solid var(--border);padding:3rem 1.5rem 2rem;">
  <div class="container" style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:3rem;flex-wrap:wrap;">
    <div>
      <div class="nav-logo" style="margin-bottom:1rem;">NORTEC</div>
      <p style="font-size:11px;color:var(--text3);line-height:1.8;max-width:280px;">
        The bilingual career-intelligence platform for LatAm tech talent pursuing global remote work.
        Built in LatAm. Designed for the world.
      </p>
      <div style="margin-top:1.25rem;display:flex;gap:10px;">
        <a href="#" style="font-size:10px;color:var(--text3);text-decoration:none;letter-spacing:0.08em;">LINKEDIN</a>
        <span style="color:var(--border2)">·</span>
        <a href="#" style="font-size:10px;color:var(--text3);text-decoration:none;letter-spacing:0.08em;">X / TWITTER</a>
        <span style="color:var(--border2)">·</span>
        <a href="#" style="font-size:10px;color:var(--text3);text-decoration:none;letter-spacing:0.08em;">INSTAGRAM</a>
      </div>
    </div>
    <div>
      <div class="label label-teal" style="margin-bottom:0.75rem;">Explore</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${['Jobs','Tracker','Salary Signals','Archive','Issue #001'].map(l=>`<a href="#" style="font-size:11px;color:var(--text3);text-decoration:none;letter-spacing:0.06em;transition:color 0.2s;" onmouseover="this.style.color='var(--teal)'" onmouseout="this.style.color='var(--text3)'">${l}</a>`).join('')}
      </div>
    </div>
    <div>
      <div class="label label-teal" style="margin-bottom:0.75rem;">Company</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${['About','For Employers','Sponsors','Careers','Contact'].map(l=>`<a href="#" style="font-size:11px;color:var(--text3);text-decoration:none;letter-spacing:0.06em;">${l}</a>`).join('')}
      </div>
    </div>
    <div>
      <div class="label label-teal" style="margin-bottom:0.75rem;">Stay in the loop</div>
      <p style="font-size:10px;color:var(--text3);margin-bottom:10px;line-height:1.7;">Get the weekly brief with the best remote jobs and career insights.</p>
      <form class="email-form" onsubmit="handleSub(event)" style="flex-direction:column;">
        <input type="email" placeholder="tu@email.com" required style="border-bottom:1px solid var(--border2);">
        <button type="submit" style="margin-top:8px;text-align:center;">Subscribe free →</button>
      </form>
    </div>
  </div>
  <div class="divider" style="margin:2rem 0;"></div>
  <div class="container" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:1rem;">
    <div style="font-size:10px;color:var(--text3);letter-spacing:0.06em;">© 2026 NORTEC · ALL RIGHTS RESERVED</div>
    <div style="display:flex;gap:1.5rem;">
      <div style="font-size:10px;color:var(--text3);letter-spacing:0.06em;">N →</div>
      <div style="font-size:10px;color:var(--text3);letter-spacing:0.06em;">DIRECTION > PURPOSE > IMPACT</div>
      <div style="font-size:10px;color:var(--orient-red);letter-spacing:0.06em;">NORTEC.COM</div>
    </div>
  </div>
</footer>`;
}

export function scorePips(score, max = 5) {
  return Array.from({length: max}, (_,i) =>
    `<div class="score-pip${i < score ? ' filled' : ''}"></div>`
  ).join('');
}

export function scoreLabel(score) {
  if (score >= 5) return '<span class="score-badge score-5">▲ Apply now</span>';
  if (score >= 4) return '<span class="score-badge score-4">▲ Strong fit</span>';
  if (score >= 3) return '<span class="score-badge score-3">◆ Worth checking</span>';
  return '<span class="score-badge score-3">▼ Niche fit</span>';
}
