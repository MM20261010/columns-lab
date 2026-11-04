const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const site = path.join(__dirname, '../site');
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(site, 'style.css'), 'utf8');
const js = ['core.js', 'app.js'].map(f => fs.readFileSync(path.join(site, f), 'utf8')).join('\n');

test('all referenced assets are local and present', () => {
  const urls = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]);
  assert.equal(urls.length, 3);
  for (const url of urls) {
    assert.ok(!url.includes(':') && !url.startsWith('//'));
    assert.ok(fs.existsSync(path.join(site, url)));
  }
});
test('no content transmission, storage, unsafe HTML sinks, or analytics calls in source', () => {
  assert.doesNotMatch(js, /\b(?:fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon|localStorage|sessionStorage|indexedDB)\b|\.innerHTML|\.outerHTML|document\.write/);
  assert.doesNotMatch(html, /<(?:iframe|form|img)\b|https?:\/\//i);
});
test('noindex and restrictive CSP present; no inline script/style', () => {
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /<script[^>]*>\s*[^<\s]|<style\b|\son\w+=/i);
});
test('input/output labels and status available; narrow-width rules declared', () => {
  assert.match(html, /label for="source"/);
  assert.match(html, /label for="result"/);
  assert.match(html, /role="status"/);
  assert.match(css, /width:100%/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /@media\(max-width:420px\)/);
  // Source assertions are not a rendered viewport or accessibility audit.
});
