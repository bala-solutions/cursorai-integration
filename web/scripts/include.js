/* Lightweight HTML include loader for static sites.
   Usage: Place <div data-include="components/header.html"></div>
   Optionally set <script src="include.js" data-site-root=".."></script> to prefix includes.
*/
import { ready, qsa } from './dom.js';

async function fetchText(url) {
  const response = await fetch(url, { credentials: 'omit' });
  if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
  return response.text();
}

function withRoot(path, scriptEl) {
  const root = scriptEl?.dataset?.siteRoot || '';
  if (!root) return path;
  if (path.startsWith('/')) return path; // absolute
  return `${root.replace(/\/$/, '')}/${path}`;
}

async function processIncludes() {
  const scriptEl = document.currentScript || document.querySelector('script[src$="include.js"]');
  const includeTargets = qsa('[data-include]');
  await Promise.all(includeTargets.map(async (el) => {
    const rawPath = el.getAttribute('data-include');
    if (!rawPath) return;
    const url = withRoot(rawPath, scriptEl);
    try {
      const html = await fetchText(url);
      el.outerHTML = html; // replace placeholder with content
    } catch (err) {
      // In dev, show small inline error for visibility
      el.innerHTML = `<pre class="include-error">Include failed: ${url}</pre>`;
    }
  }));
}

ready(processIncludes);
