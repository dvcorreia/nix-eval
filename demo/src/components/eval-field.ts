// <nix-eval-field field="ast">
import type { Output } from '../../../src/index.js';

class NixEvalField extends HTMLElement {
  #pre!: HTMLPreElement;

  constructor() {
    super();
    this.innerHTML = `<pre></pre>`;
    this.#pre = this.querySelector('pre')!;
  }

  connectedCallback() {
    document.addEventListener('eval:start', this.#onStart);
    document.addEventListener('eval:end', this.#onEnd);
    document.addEventListener('eval:error', this.#onError);
  }

  disconnectedCallback() {
    document.removeEventListener('eval:start', this.#onStart);
    document.removeEventListener('eval:end', this.#onEnd);
    document.removeEventListener('eval:error', this.#onError);
  }

  #onStart = () => {
    this.#pre.textContent = '';
  };

  #onEnd = ((e: Event) => {
    const field = this.getAttribute('field');
    if (!field) return;
    const output = (e as CustomEvent<{ output: Output }>).detail.output;
    this.#pre.textContent = output[field as keyof Output] || '';
  }).bind(this);

  #onError = () => {
    this.#pre.textContent = '';
  };
}

customElements.define('nix-eval-field', NixEvalField);
