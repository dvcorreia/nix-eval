import type { Output } from '../../../src/index.js';

class NixEvalOutput extends HTMLElement {
  #container!: HTMLElement;

  constructor() {
    super();
    this.innerHTML = `
      <div class="content"></div>
      <span class="placeholder">Output</span>
    `;
    this.#container = this.querySelector('.content')!;
  }

  connectedCallback() {
    document.addEventListener('eval:end', this.#onEnd);
    document.addEventListener('eval:error', this.#onError);
    document.addEventListener('eval:start', this.#onStart);
  }

  disconnectedCallback() {
    document.removeEventListener('eval:end', this.#onEnd);
    document.removeEventListener('eval:error', this.#onError);
    document.removeEventListener('eval:start', this.#onStart);
  }

  #onStart = () => {
    this.#container.textContent = '';
    this.removeAttribute('data-type');
  };

  #onEnd = ((e: Event) => {
    const output = (e as CustomEvent<{ output: Output }>).detail.output;
    this.removeAttribute('data-type');
    if (output.errors) {
      this.dataset.type = 'error';
      this.#container.textContent = output.errors;
    } else if (output.output) {
      this.#container.textContent = output.output;
    } else {
      this.#container.textContent = '';
    }
  }).bind(this);

  #onError = ((e: Event) => {
    const { error } = (e as CustomEvent<{ error: unknown }>).detail;
    this.dataset.type = 'error';
    this.#container.textContent = String(error);
  }).bind(this);
}

customElements.define('nix-eval-output', NixEvalOutput);
