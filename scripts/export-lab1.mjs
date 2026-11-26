import assert from 'node:assert/strict';
import { access, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { format } from 'prettier';

const root = fileURLToPath(new URL('../', import.meta.url));
const browser = path.join(root, 'dist/ASM/browser');
const destination = path.join(root, 'dist/lab1-spotife');
const document = new JSDOM(await readFile(path.join(browser, 'index.html'), 'utf8')).window
  .document;
const hostSelectors = new Map();

// Keep component host styles when replacing Angular tags with ordinary HTML.
for (const element of document.querySelectorAll('*')) {
  if (!element.localName.startsWith('app-')) continue;
  const className = `component-${element.localName.slice(4)}`;
  for (const attribute of element.getAttributeNames()) {
    if (attribute.startsWith('_nghost-')) hostSelectors.set(attribute, `.${className}`);
  }
  const replacement = document.createElement('div');
  for (const attribute of element.attributes)
    replacement.setAttribute(attribute.name, attribute.value);
  replacement.classList.add(className);
  replacement.append(...element.childNodes);
  element.replaceWith(replacement);
}

const styleFiles = new Set(
  [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.getAttribute('href')),
);
const styles = await Promise.all(
  [...styleFiles].map((file) => readFile(path.join(browser, file.replace(/^\//, '')), 'utf8')),
);
styles.push(...[...document.querySelectorAll('style')].map((style) => style.textContent));
const css = styles
  .join('\n')
  .replace(/\[(_nghost-[\w-]+)\]/g, (_, attribute) => {
    assert.ok(hostSelectors.has(attribute), `Unknown component host: ${attribute}`);
    return hostSelectors.get(attribute);
  })
  .replace(/\[_ngcontent-[\w-]+\]/g, '')
  .replace(/url\((['"]?)\/(?!\/)/g, 'url($1');

document
  .querySelectorAll(
    'script, style, noscript, base, link[rel="stylesheet"], link[rel="modulepreload"], link[rel="preload"][as="font"]',
  )
  .forEach((element) => element.remove());
for (const element of document.querySelectorAll('*')) {
  for (const attribute of element.getAttributeNames()) {
    if (/^(?:_ng|ng-|ngh$|on)/i.test(attribute)) element.removeAttribute(attribute);
  }
  for (const attribute of ['href', 'src']) {
    const value = element.getAttribute(attribute);
    if (value?.startsWith('/') && !value.startsWith('//')) {
      element.setAttribute(attribute, value.slice(1));
    }
  }
}

const comments = document.createTreeWalker(document, 128);
const obsoleteComments = [];
while (comments.nextNode()) obsoleteComments.push(comments.currentNode);
obsoleteComments.forEach((comment) => comment.remove());

const stylesheet = document.createElement('link');
stylesheet.rel = 'stylesheet';
stylesheet.href = 'styles.css';
document.head.append(stylesheet);

// The HTML/CSS hand-in has no Angular runtime, so keep the form as a visual demo.
// Disable both controls to prevent native or implicit submission without Angular.
const newsletter = document.querySelector('#newsletter');
const subscribeButton = newsletter?.querySelector('button[type="submit"]');
if (subscribeButton) {
  subscribeButton.type = 'button';
  subscribeButton.disabled = true;
  newsletter.querySelector('input').disabled = true;
  newsletter.querySelector('#newsletter-note').textContent =
    'Form minh họa trong bản HTML/CSS. Chạy bản Angular để thử đăng ký email.';
}

assert.equal(document.querySelectorAll('script').length, 0);
assert.equal(document.querySelectorAll('main section').length, 6);
assert.equal(document.querySelectorAll('main aside.promo-banner').length, 2);
assert.ok(document.querySelector('header') && document.querySelector('footer'));
assert.equal(document.querySelectorAll('#feedback .feedback-card').length, 2);
assert.ok(document.querySelector('#newsletter form'));
await mkdir(destination, { recursive: true });
await writeFile(
  path.join(destination, 'index.html'),
  await format('<!doctype html>\n' + document.documentElement.outerHTML, {
    parser: 'html',
    printWidth: 100,
  }),
);
await writeFile(path.join(destination, 'styles.css'), await format(css, { parser: 'css' }));
await cp(path.join(root, 'public/assets'), path.join(destination, 'assets'), { recursive: true });
await cp(path.join(root, 'public/favicon.svg'), path.join(destination, 'favicon.svg'));
const media = path.join(browser, 'media');
try {
  await access(media);
  await cp(media, path.join(destination, 'media'), { recursive: true });
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
await cp(path.join(root, 'src/app'), path.join(destination, 'source-components'), {
  recursive: true,
});
await cp(path.join(root, 'LAB1.md'), path.join(destination, 'README.md'));
console.log(`Exported pure HTML/CSS (no scripts): ${destination}`);
