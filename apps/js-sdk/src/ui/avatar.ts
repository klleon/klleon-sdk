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
    return this.attachShadow({ mode: 'open' })
  }

  getAvatarElement() {
    return this.shadowRoot?.getElementById('avatar');
  }

  render() {
    const { isInitialize } = state
    if (!isInitialize) return html``
    const additionalClasses = this.getAttribute('class') || '';
    const additionalStyles = this.getAttribute('style') || '';
    const addVideoClasses = this.getAttribute('videoClass') || '';

    return html`
      <style>
        ${unsafeCSS(tailwind)}
        :host {
          display: contents
        }
      </style>
      <div id="avatar" class="size-full ${additionalClasses}" style="${additionalStyles}" videoClass="${addVideoClasses}">
      </div>
    `
  }
}
