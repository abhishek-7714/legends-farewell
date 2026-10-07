import { h } from '../dom.js';

/**
 * Searchable single-select dropdown (ARIA combobox pattern).
 * @param {object} o
 * @param {string[]} o.options
 * @param {string|null} o.value
 * @param {string} o.placeholder
 * @param {(name: string) => string|null} [o.disabledReason] reason text if an option can't be picked
 * @param {(value: string|null) => void} o.onChange
 * @param {string} [o.label] accessible label
 */
export function Combobox({ options, value = null, placeholder = '', disabledReason = () => null, onChange, label }) {
  const id = `cb-${Math.random().toString(36).slice(2, 8)}`;
  let selected = value;
  let active = -1;
  let filtered = [];

  const input = h('input.cb-input', {
    type: 'text',
    role: 'combobox',
    autocomplete: 'off',
    autocapitalize: 'words',
    spellcheck: 'false',
    'aria-autocomplete': 'list',
    'aria-expanded': 'false',
    'aria-controls': `${id}-list`,
    'aria-label': label || placeholder,
    placeholder,
    value: selected || '',
  });
  const list = h('ul.cb-list', { id: `${id}-list`, role: 'listbox', hidden: true });
  const clear = h('button.cb-clear', { type: 'button', 'aria-label': 'Clear', hidden: !selected }, '×');
  const root = h('div.cb', { class: selected ? 'has-value' : '' }, input, clear, list);

  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function render() {
    const q = norm(input.value.trim());
    const showAll = !q || input.value === selected;
    filtered = showAll
      ? options.slice()
      : options
          .filter((o) => norm(o).includes(q))
          .sort((a, b) => Number(!norm(a).startsWith(q)) - Number(!norm(b).startsWith(q)));
    list.replaceChildren(
      ...(filtered.length
        ? filtered.map((name, i) => {
            const reason = disabledReason(name);
            return h(
              'li.cb-option',
              {
                id: `${id}-o${i}`,
                role: 'option',
                'aria-selected': String(name === selected),
                'aria-disabled': reason ? 'true' : null,
                class: [i === active ? 'is-active' : '', reason ? 'is-disabled' : ''].join(' '),
                onmousedown: (e) => e.preventDefault(), // keep focus in the input
                onclick: () => !reason && pick(name),
              },
              h('span', name),
              reason ? h('small', reason) : null
            );
          })
        : [h('li.cb-empty', 'No Legend by that name. Check spelling?')])
    );
    input.setAttribute('aria-activedescendant', active >= 0 ? `${id}-o${active}` : '');
  }

  function open() {
    if (!list.hidden) return;
    list.hidden = false;
    root.classList.add('is-open');
    input.setAttribute('aria-expanded', 'true');
    active = Math.max(0, options.indexOf(selected));
    render();
    list.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
  }

  function close() {
    list.hidden = true;
    root.classList.remove('is-open');
    input.setAttribute('aria-expanded', 'false');
    active = -1;
  }

  function sync() {
    input.value = selected || '';
    clear.hidden = !selected;
    root.classList.toggle('has-value', Boolean(selected));
  }

  function pick(name) {
    selected = name;
    sync();
    close();
    onChange?.(selected);
  }

  input.addEventListener('focus', () => {
    input.select();
    open();
  });
  input.addEventListener('click', open);
  input.addEventListener('input', () => {
    open();
    active = 0;
    render();
  });
  input.addEventListener('blur', () => {
    // Exact (case-insensitive) typed match counts as a pick.
    const typed = input.value.trim();
    const exact = options.find((o) => norm(o) === norm(typed));
    if (exact && exact !== selected && !disabledReason(exact)) pick(exact);
    else sync();
    close();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      open();
      const step = e.key === 'ArrowDown' ? 1 : -1;
      active = Math.min(filtered.length - 1, Math.max(0, active + step));
      render();
      list.querySelector('.is-active')?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      if (!list.hidden && filtered[active] && !disabledReason(filtered[active])) {
        e.preventDefault();
        pick(filtered[active]);
      }
    } else if (e.key === 'Escape') {
      sync();
      close();
    }
  });
  clear.addEventListener('click', () => {
    selected = null;
    sync();
    onChange?.(null);
    input.focus();
  });

  root.setValue = (v) => {
    selected = v;
    sync();
  };
  root.focusInput = () => input.focus();
  return root;
}
