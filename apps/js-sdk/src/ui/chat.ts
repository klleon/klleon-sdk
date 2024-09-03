// import { html, render } from 'lit-html';
// import { subscribe } from 'valtio';
// import useSdk from '../core/sdk';

import { html, LitElement } from "lit";
import useSdk from "../core/sdk";
import { subscribe } from "valtio";
import { customElement, query } from 'lit/decorators.js';
import { sendMessage } from "../services/socketService";
import { RequestChatType } from "../constants/klleonSDK";


@customElement('chat-container')
export class Chat extends LitElement {
  constructor() {
    super()
    const { state } = useSdk()
    subscribe(state, () => {
      this.requestUpdate()
    })
  }

  createRenderRoot() {
    return this
  }

  @query('#msg-input')
  private inputElement!: HTMLInputElement

  private chatHandler = {
    handleSend: () => {
      const message = this.inputElement.value.trim()
      sendMessage({ type: RequestChatType['USER'], message })
      this.inputElement.value = ""
    }
  }

  render() {
    const { state } = useSdk()
    if (!state.isInitialize) return html``



    return html`
      <div>
        <div>
          ${state.messageList.map((msg) => html`
              <div class="msg">${msg.message}</div>
            `)}
        </div>
        <div class="kl-flex">
          <input id="msg-input" />
          <button @click="${this.chatHandler.handleSend}">send</button>
        </div>
      </div>
    `
  }
}
