import { css, html, LitElement, unsafeCSS } from "lit";
import { State, state } from "../core/sdk";
import { subscribe } from "valtio";
import { customElement, query } from 'lit/decorators.js';
import { sendMessage } from "../services/socketService";
import { RequestChatType } from "../constants/klleonSDK";
import Typed from "typed.js";
// eslint-disable-next-line import/no-unresolved
import tailwind from '../style.css?inline'
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';


@customElement('chat-container')
export class Chat extends LitElement {
  static styles = css`${unsafeCSS(tailwind)}`

  constructor() {
    super()
    subscribe(state, () => {
      this.requestUpdate()
    })
  }

  @query('#msg-input')
  private inputElement!: HTMLInputElement

  private chatHandler = {
    handleSend: () => {
      const message = this.inputElement.value.trim()
      sendMessage({ type: RequestChatType['USER'], message })
      this.inputElement.value = ""
    },
    sendVoice: () => {
      sendMessage({ type: RequestChatType['SYSTEM'], message: 'START_VOICE' })
    },
    endVoice: () => {
      sendMessage({ type: RequestChatType['SYSTEM'], message: 'END_VOICE' })
    },
    toggleType: (type: 'text' | 'voice') => {
      state.type = type
    },
    renderMessage: (messageList: State['messageList']) => {
      return virtualize({
        items: messageList.map((msg) => msg.message),
        renderItem: (msg) => html`<span>${msg}</span>`,
        scroller: true,
      })
    }
  }

  private addTypingEffect(element: Element, message: string) {
    new Typed(element, {
      strings: [message],
      typeSpeed: 28,
      showCursor: false,
    });
  }
  updated() {
    const lastMsgElement = this.shadowRoot?.querySelector('.msg:last-child span');
    const lastMessageIndex = state.messageList.length - 1;
    const lastMessage = state.messageList[lastMessageIndex]?.message;

    if (lastMsgElement) {
      this.addTypingEffect(lastMsgElement, lastMessage);
    }
  }

  render() {
    const { isInitialize, messageList } = state
    if (!isInitialize) return html``


    return html`
      <div class="flex flex-col flex-1 w-[324px]">
        <div class="flex flex-col flex-1 overflow-auto">
          ${this.chatHandler.renderMessage(messageList)}
        </div>
        <div class="flex">
          ${state.type === 'text' && html`
            <input id="msg-input" />
            <div class="flex gap-x-1">
              <button @click="${this.chatHandler.handleSend}">send</button>
              <button @click="${() => this.chatHandler.toggleType('voice')}">toogle</button>
            </div>
          `}
          ${state.type === 'voice' && html`
            <button @keydown="${this.chatHandler.sendVoice}" @keyup="${this.chatHandler.endVoice}">send Voice</button>
            <button @click="${() => this.chatHandler.toggleType('text')}">toogle</button>
          `}
        </div>
      </div>
    `
  }
}
