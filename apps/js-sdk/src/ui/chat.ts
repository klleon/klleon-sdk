import { css, html, LitElement, unsafeCSS } from "lit";
import { State, state } from "../core/sdk";
import { subscribe } from "valtio";
import { customElement, query } from 'lit/decorators.js';
import { sendMessage } from "../services/socketService";
import { RequestChatType, ResponseChatType } from "../constants/klleonSDK";
// eslint-disable-next-line import/no-unresolved
import tailwind from '../style.css?inline'
import { virtualize } from "@lit-labs/virtualizer/virtualize.js";


@customElement('chat-container')
export class Chat extends LitElement {
  static styles = css`
    ${unsafeCSS(tailwind)}
    .typing {
      display: inline-block;
      white-space: normal; 
      overflow-wrap: break-word;
    }
    .fade-in {
      opacity: 0;
      animation: fadeIn 0.2s forwards;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `

  private previousMessageCount = 0;

  constructor() {
    super()
    subscribe(state, () => {
      this.requestUpdate()
    })
  }

  @query('#msg-input')
  private inputElement!: HTMLInputElement
  @query('.msg-container')
  private msgContainer!: HTMLElement

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
        renderItem: (_, index: number) => {
          return this.renderTypingEffect(index)
        },
        scroller: true,
      });
    },
    scrollToBottom: () => {
      if (!this.msgContainer) return
      this.msgContainer.scrollTop = this.msgContainer.scrollHeight
    },
    isDisabled: () => {
      if (!state.chat_type || state.chat_type === ResponseChatType['ACTIVATE_VOICE']) return false
      return state.chat_type !== ResponseChatType['RESPONSE_IS_ENDED'];
    }
  }


  private typeText(element: Element, text: string, delay: number = 50) {
    let index = 0;

    const type = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        element.classList.add('fade-in')
        index++;
        this.chatHandler.scrollToBottom();
        setTimeout(() => requestAnimationFrame(type), delay);
      }
    };

    type();
  }

  private renderTypingEffect(index: number) {
    const elementId = `msg-${index}`;
    return html`
      <div class="typing" id="${elementId}"></div>
    `;
  }

  updated() {
    requestAnimationFrame(() => {
      const messageList = state.messageList;

      if (messageList.length > this.previousMessageCount) {
        const lastMessageIndex = messageList.length - 1;
        const lastMessageElement = this.shadowRoot?.querySelector(`#msg-${lastMessageIndex}`);

        if (lastMessageElement) {
          lastMessageElement.textContent = "";
          this.typeText(lastMessageElement, messageList[lastMessageIndex].message, 100);
        }
      }

      this.previousMessageCount = messageList.length;
    })
  }

  render() {
    const { isInitialize, messageList } = state
    if (!isInitialize) return html``


    return html`
      <div class="flex flex-col flex-1 w-[324px]">
        <div class="flex flex-col flex-1 overflow-auto msg-container">
          ${this.chatHandler.renderMessage(messageList)}
        </div>
        <div class="flex">
          ${state.type === 'text' ? html`
            <input id="msg-input" />
            <div class="flex gap-x-1">
              <button 
                ?disabled=${this.chatHandler.isDisabled()} 
                @click="${this.chatHandler.handleSend}"
              >
                send
              </button>
              <button @click="${() => this.chatHandler.toggleType('voice')}">toogle</button>
            </div>
          ` : html``}
          ${state.type === 'voice' ? html`
            <button 
              @mousedown="${this.chatHandler.sendVoice}" 
              @mouseup="${this.chatHandler.endVoice}"
              @touchstart="${this.chatHandler.sendVoice}"
              @touchend="${this.chatHandler.endVoice}"
            >
              send Voice
            </button>
            
            <button @click="${() => this.chatHandler.toggleType('text')}">toogle</button>
          ` : html``}
        </div>
      </div>
    `
  }
}
