import { LitElement, css, html, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';
import { subscribe } from 'valtio';
import { state } from '../core/sdk';
// eslint-disable-next-line import/no-unresolved
import tailwind from '../style.css?inline'

@customElement('avatar-container')
export class Avatar extends LitElement {
  static styles = css`${unsafeCSS(tailwind)}`

  constructor() {
    super()
    subscribe(state, () => {
      this.requestUpdate()
    })
  }

  createRenderRoot() {
    return this
  }

  render() {
    const { isInitialize } = state
    if (!isInitialize) return html``

    return html`
      <div id="avatar" class="flex flex-1">
      </div>
    `
  }
}
