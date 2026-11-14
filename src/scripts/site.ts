// The little JavaScript the blocks need. Everything listens on the document, so it keeps working
// when the editor re-renders the page, and every block still reads without it.

const $$ = <T extends Element>(root: ParentNode, sel: string) => Array.from(root.querySelectorAll<T>(sel));

/* ---------- Tabs: click, and arrow keys / Home / End between tabs ---------- */
function selectTab(tab: HTMLElement, focus = false) {
  const box = tab.closest<HTMLElement>('[data-tabs]');
  if (!box) return;
  for (const t of $$<HTMLElement>(box, ':scope > .tabs__list > [role="tab"]')) {
    const on = t === tab;
    t.setAttribute('aria-selected', String(on));
    t.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(t.getAttribute('aria-controls') || '');
    if (panel) panel.hidden = !on;
  }
  if (focus) tab.focus();
}
document.addEventListener('click', (e) => {
  const tab = (e.target as Element).closest<HTMLElement>('[data-tabs] [role="tab"]');
  if (tab) selectTab(tab);
});
document.addEventListener('keydown', (e) => {
  const tab = (e.target as Element).closest?.<HTMLElement>('[data-tabs] [role="tab"]');
  if (!tab) return;
  const tabs = $$<HTMLElement>(tab.parentElement!, '[role="tab"]');
  const i = tabs.indexOf(tab);
  const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  selectTab(tabs[(next + tabs.length) % tabs.length], true);
});

/* ---------- Pricing: monthly / yearly ---------- */
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLElement>('[data-pricing] [data-set]');
  if (!b) return;
  const box = b.closest<HTMLElement>('[data-pricing]')!;
  box.dataset.period = b.dataset.set;
  for (const x of $$<HTMLElement>(box, '[data-set]')) x.setAttribute('aria-pressed', String(x === b));
});

/* ---------- Slideshow: arrow buttons and the counter ---------- */
const track = (el: Element) => el.closest('[data-slideshow]')?.querySelector<HTMLElement>('.slideshow__track');
document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLElement>('[data-slideshow] [data-dir]');
  const t = b && track(b);
  if (!t) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  t.scrollBy({ left: Number(b!.dataset.dir) * t.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
});
document.addEventListener('scroll', (e) => {
  const t = e.target as HTMLElement;
  if (!(t instanceof HTMLElement) || !t.classList.contains('slideshow__track')) return;
  const n = t.closest('[data-slideshow]')?.querySelector('[data-current]');
  if (n) n.textContent = String(Math.round(t.scrollLeft / t.clientWidth) + 1);
}, { capture: true, passive: true });

/* ---------- Gallery lightbox: a <dialog> with previous / next, Escape closes ---------- */
let box: HTMLDialogElement | null = null;
let items: HTMLAnchorElement[] = [];
let at = 0;
function show(i: number) {
  at = (i + items.length) % items.length;
  const a = items[at];
  const img = a.querySelector('img');
  box!.querySelector('img')!.src = a.href;
  box!.querySelector('img')!.alt = img?.alt ?? '';
  box!.querySelector('figcaption')!.textContent = a.dataset.caption || '';
  box!.querySelector('.lightbox__count')!.textContent = items.length > 1 ? `${at + 1} / ${items.length}` : '';
}
function lightbox() {
  if (box) return box;
  box = document.createElement('dialog');
  box.className = 'lightbox';
  box.setAttribute('aria-label', 'Photo');
  box.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure><p class="lightbox__count"></p>'
    + '<button type="button" class="lightbox__btn lightbox__prev" aria-label="Previous photo">←</button>'
    + '<button type="button" class="lightbox__btn lightbox__next" aria-label="Next photo">→</button>'
    + '<button type="button" class="lightbox__btn lightbox__close" aria-label="Close">×</button>';
  box.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (t.closest('.lightbox__prev')) show(at - 1);
    else if (t.closest('.lightbox__next')) show(at + 1);
    else if (t.closest('.lightbox__close') || t === box) box!.close();
  });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });
  document.body.append(box);
  return box;
}
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('[data-lightbox] a.gallery__link');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
  e.preventDefault();
  items = $$<HTMLAnchorElement>(a.closest('[data-lightbox]')!, 'a.gallery__link');
  lightbox().showModal();
  show(items.indexOf(a));
});

/* ---------- Donate: typing an "other" amount replaces the chosen one ---------- */
document.addEventListener('input', (e) => {
  const other = e.target as HTMLInputElement;
  if (!other.matches?.('[data-other]')) return;
  const form = other.form!;
  const typed = other.value.trim() !== '';
  other.name = typed ? other.dataset.other! : '';
  for (const r of $$<HTMLInputElement>(form, 'input[type="radio"]')) { if (typed) r.checked = false; }
});
document.addEventListener('change', (e) => {
  const r = e.target as HTMLInputElement;
  if (r.type !== 'radio' || !r.closest('.donate__form')) return;
  const other = r.form!.querySelector<HTMLInputElement>('[data-other]');
  if (other) { other.value = ''; other.name = ''; }
});

/* ---------- Forms: stamp the load time, send in place, show the thank-you ---------- */
const stamp = () => { for (const i of $$<HTMLInputElement>(document, 'form[data-form] input[name="_t"]')) if (!i.value) i.value = String(Date.now()); };
stamp();
document.addEventListener('focusin', (e) => { if ((e.target as Element).closest?.('form[data-form]')) stamp(); });
document.addEventListener('submit', async (e) => {
  const form = e.target as HTMLFormElement;
  if (!form.matches('form[data-form]')) return;
  e.preventDefault();
  if (form.getAttribute('aria-busy') === 'true') return;
  const status = form.querySelector<HTMLElement>('.form__status');
  const say = (msg: string, error = false) => { if (status) { status.textContent = msg; status.classList.toggle('is-error', error); } };
  form.setAttribute('aria-busy', 'true');
  say('Sending…');
  try {
    const res = await fetch(form.action, { method: 'POST', body: new URLSearchParams(new FormData(form) as any), headers: { Accept: 'application/json' } });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) throw new Error(data.error || 'The message was not sent. Please try again.');
    const done = form.parentElement?.querySelector<HTMLElement>('.form__done');
    if (done) { form.hidden = true; done.hidden = false; done.focus(); } else say('Sent. Thank you.');
  } catch (err) {
    say((err as Error).message || 'The message was not sent. Please try again.', true);
    (window as any).turnstile?.reset?.();
  } finally {
    form.removeAttribute('aria-busy');
  }
});
