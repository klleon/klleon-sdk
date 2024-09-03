import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import useSdk from '../core/sdk';
import { subscribe } from 'valtio';

@customElement('avatar-container')
export class Avatar extends LitElement {
  static styles = css`
    #video {
      width: 300px;
      height: 300px;
    }
  `;

  constructor() {
    super()
    const { state } = useSdk()
    subscribe(state, () => {
      this.requestUpdate()
    })
  }

  createRenderRoot() {
    return this;
  }

  render() {
    const { state } = useSdk()
    if (!state.isInitialize) return html``

    return html`
      <div id="video" class="kl-size-[300px]">
      </div>
    `
  }
}
