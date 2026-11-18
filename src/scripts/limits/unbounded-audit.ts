import { bindCopyButtons, queryAll, setPressed } from './dom';

function initAudit(root: HTMLElement) {
  const filters = queryAll<HTMLButtonElement>(root, '[data-filter]');
  const items = queryAll<HTMLLIElement>(root, '.audit-item');

  function setExpanded(item: HTMLElement, expanded: boolean) {
    const toggle = item.querySelector<HTMLButtonElement>('[data-toggle]')!;
    const detail = item.querySelector<HTMLElement>('.audit-detail')!;
    toggle.setAttribute('aria-expanded', String(expanded));
    detail.hidden = !expanded;
  }

  // Server-rendered markup shows every detail, so the list still reads without JavaScript.
  items.forEach((item, index) => setExpanded(item, index === 0));

  items.forEach((item) => {
    item.querySelector('[data-toggle]')!.addEventListener('click', (event) => {
      const toggle = event.currentTarget as HTMLButtonElement;
      setExpanded(item, toggle.getAttribute('aria-expanded') !== 'true');
    });
  });

  filters.forEach((filter) => {
    filter.addEventListener('click', () => {
      setPressed(filters, filter.value);
      items.forEach((item) => {
        item.hidden = filter.value !== 'all' && item.dataset.status !== filter.value;
      });
    });
  });

  bindCopyButtons(root);
}

document.querySelectorAll<HTMLElement>('[data-audit]').forEach(initAudit);
