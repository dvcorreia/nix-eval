// <layout-accordion label="AST">…content…</layout-accordion>
class NixAccordion extends HTMLElement {
  #header!: HTMLButtonElement;

  static get observedAttributes() {
    return ['label'];
  }

  constructor() {
    super();
    const children = [...this.childNodes];

    this.innerHTML = `
      <button type="button" class="acc-header"></button>
      <div class="acc-body"></div>
    `;

    this.#header = this.querySelector('.acc-header')!;
    const body = this.querySelector('.acc-body')!;

    for (const node of children) {
      body.appendChild(node);
    }

    this.#header.textContent = this.getAttribute('label') || 'Section';
    if (!this.hasAttribute('expanded')) {
      this.setAttribute('expanded', '');
    }
    this.#header.addEventListener('click', () => {
      this.toggleAttribute('expanded');
    });
  }

  attributeChangedCallback() {
    this.#header.textContent = this.getAttribute('label') || 'Section';
  }
}

customElements.define('layout-accordion', NixAccordion);
