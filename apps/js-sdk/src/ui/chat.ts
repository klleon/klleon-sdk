import { css, html, LitElement } from "lit";
import { State, state } from "../core/sdk";
import { subscribe } from "valtio";
import { customElement, query, state as litState } from 'lit/decorators.js';
import { sendMessage } from "../services/socketService";
import { RequestChatType, ResponseChatType } from "../constants/klleonSDK";
import { virtualize } from "@lit-labs/virtualizer/virtualize.js";
import { styles } from '../styles/style'
import '../components/TextField/TextField'


@customElement('chat-container')
export class Chat extends LitElement {
  static styles = css`
    ${styles}
    .request {
      right: 0;
      padding: 8px 16px;
      border-radius: 18px 18px 18px 0px;
      background: #0C5EF0;
      color: white;

      font-family: Pretendard;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
    }
    .response {
      left: 0;
      padding: 8px 16px;
      border-radius: 18px 18px 18px 0px;
      background: #EDEFFA;

      font-family: Pretendard;
      font-size: 12px;
      font-style: normal;
      font-weight: 500;
      line-height: 20px;
    }
    .chat-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      background: #B6BCDE;
      padding: 16px;
      border-radius: inherit;
    }
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

  @litState()
  private msg = ''

  @query('.msg-container')
  private msgContainer!: HTMLElement

  private chatHandler = {
    handleOnChange: (event: CustomEvent<{ e: Event }>) => {
      const { e } = event.detail
      const { value } = e.target as HTMLInputElement
      this.msg = value
    },
    handleSend: () => {
      const message = this.msg.trim()
      if (message === "") return;

      sendMessage({ type: RequestChatType['USER'], message })
      this.msg = ""
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


  private typeText({ element, text, type, delay = 30 }: { element: Element, text: string, type: 'response' | 'request', delay: number }) {
    let index = 0;
    const typography = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        element.classList.add('fade-in', `${type}`)
        index++;
        this.chatHandler.scrollToBottom();
        setTimeout(() => requestAnimationFrame(typography), delay);
      }
    };

    typography();
  }

  private renderTypingEffect(index: number) {
    const elementId = `msg-${index}`;
    return html`
      <div id="${elementId}" class="typing mb-3"></div>
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
          this.typeText({
            element: lastMessageElement,
            text: messageList[lastMessageIndex].message,
            type: messageList[lastMessageIndex].type,
            delay: 30
          });
        }
      }

      this.previousMessageCount = messageList.length;
    })
  }

  render() {
    const { isInitialize, messageList } = state
    if (!isInitialize) return html``


    return html`
      <div class="chat-container">
        <div class="flex flex-col flex-1 overflow-auto msg-container">
          ${this.chatHandler.renderMessage(messageList)}
        </div>
        <div class="flex">
          ${state.type === 'text' ? html`
            <div class="flex flex-1 gap-x-1" >
              <text-field
                .disabled=${this.chatHandler.isDisabled()}
                value=${this.msg}
                placeholder="내용을 입력해 주세요"
                @onChange=${this.chatHandler.handleOnChange}
                @onSend=${this.chatHandler.handleSend}
              ></text-field>
          <button button @click="${() => this.chatHandler.toggleType('voice')}" > toogle </button>
        </div>
          ` : html``
      }
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
          ` : html``
      }
</div>
  </div>
    `
  }
}
