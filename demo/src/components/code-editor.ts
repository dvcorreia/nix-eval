class CodeEditor extends HTMLElement {
  #gutter!: HTMLElement;
  #textarea!: HTMLTextAreaElement;
  #mirror: HTMLDivElement | null = null;

  constructor() {
    super();
    const initial = this.textContent?.trim() ?? '';

    this.innerHTML = `
      <div class="code-panel">
        <div class="line-numbers" aria-hidden="true"></div>
        <textarea spellcheck="false"></textarea>
      </div>
    `;

    this.#gutter = this.querySelector('.line-numbers')!;
    this.#textarea = this.querySelector('textarea')!;
    this.#textarea.value = initial;
  }

  connectedCallback() {
    this.#textarea.addEventListener('input', this.#handleInput);
    this.#textarea.addEventListener('scroll', () => this.#align());
    window.addEventListener('resize', () => this.#syncLineNumbers());
    new ResizeObserver(() => this.#syncLineNumbers()).observe(this.#textarea);
    this.#syncLineNumbers();
  }

  get code(): string {
    return this.#textarea.value;
  }

  set code(value: string) {
    const previous = this.#textarea.value;
    this.#textarea.value = value;
    this.#syncLineNumbers();
    if (value !== previous) {
      this.dispatchEvent(new CustomEvent('code-change', {
        bubbles: true,
        detail: { code: value.trim() }
      }));
    }
  }

  #handleInput = (): void => {
    this.#syncLineNumbers();
    this.dispatchEvent(new CustomEvent('code-change', {
      bubbles: true,
      detail: { code: this.#textarea.value.trim() }
    }));
  };

  #getMirror(): HTMLDivElement {
    if (this.#mirror) return this.#mirror;
    const cs = getComputedStyle(this.#textarea);
    this.#mirror = document.createElement('div');
    this.#mirror.style.cssText = [
      'position:absolute',
      'top:0',
      'left:0',
      `font:${cs.font}`,
      `line-height:${cs.lineHeight}`,
      `padding:${cs.padding}`,
      `tab-size:${cs.tabSize}`,
      'white-space:pre-wrap',
      'overflow-wrap:break-word',
      'word-break:break-word',
      'visibility:hidden',
      'pointer-events:none',
      'margin:0',
      'box-sizing:border-box',
    ].join(';');
    this.#textarea.parentElement!.appendChild(this.#mirror);
    return this.#mirror;
  }

  #syncLineNumbers(): void {
    const cs = getComputedStyle(this.#textarea);
    const lineHeight = parseFloat(cs.lineHeight) || 0;
    const sourceRows = this.#textarea.value.split('\n');
    const mirror = this.#getMirror();
    mirror.style.width = `${this.#textarea.clientWidth}px`;
    this.#gutter.style.paddingTop = cs.paddingTop;
    this.#gutter.style.paddingBottom = cs.paddingBottom;

    mirror.textContent = '';
    const mirrorRows: HTMLElement[] = [];
    for (const row of sourceRows) {
      const el = document.createElement('div');
      el.textContent = row;
      mirrorRows.push(el);
      mirror.appendChild(el);
    }

    this.#gutter.textContent = '';
    for (let i = 0; i < mirrorRows.length; i++) {
      const num = document.createElement('div');
      num.textContent = String(i + 1);
      num.style.height = `${Math.max(mirrorRows[i].offsetHeight, lineHeight)}px`;
      this.#gutter.appendChild(num);
    }
    this.#align();
  }

  #align(): void {
    this.#gutter.style.transform = `translateY(${-this.#textarea.scrollTop}px)`;
  }
}

customElements.define('code-editor', CodeEditor);
export { CodeEditor as NixCodeEditor };
