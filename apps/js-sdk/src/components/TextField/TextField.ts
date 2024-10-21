import { isMobile } from "../../utils/device"
import { styles } from "../../styles/style"
import { LitElement, css, html } from "lit"
import { customElement, property, query, state } from 'lit/decorators.js'

export interface TextFieldEvent {
  input: { value: string }
}

@customElement('text-field')
export class TextField extends LitElement {
  static styles = css`
    ${styles}
    .text-field-container {
      display: flex;
      flex-direction: column;
      gap: 0px 4px;
      background: #fff;
      border-radius: 20px;
      padding: 10px 12px 10px 16px;
    }
    .field-container {
      display: flex;
      gap: 0px 4px;
    }
    .count-container {
      display: flex;
    }
    textarea {
      width: 100%;
      height: 20px;
      resize: none;
      overflow: hidden;
      border: none;
      outline: none;
      font-size: 16px;
      line-height: 20px;
    }
    textarea::placeholder {
      font-size: 12px;
      font-weight: 500;
      line-height: 20px;
      color: #D1D4E8;
    }
  `

  @state()
  private isComposing = false; // IME 상태 추적

  @property({ type: Boolean })
  disabled = false
  @property({ type: String })
  placeholder = ''
  @property({ type: String })
  value = ''

  @query('textarea')
  private textareaRef!: HTMLTextAreaElement

  protected firstUpdated() {
    this.textareaRef.addEventListener('input', this.textFieldHandler.handleResize)
  }

  private textFieldHandler = {
    handleInput: (e: Event) => {
      this.dispatchEvent(new CustomEvent('onChange', { detail: { e } }))
    },
    handleEnter: (e: KeyboardEvent) => {
      if (this.isComposing) return;
      if (isMobile()) return
      if (e.key === 'Enter' && e.shiftKey) return

      if (e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        this.dispatchEvent(new CustomEvent('onSend'))
      }

    },
    handleClick: () => {
      this.dispatchEvent(new CustomEvent('onSend'))
    },
    handleResize: () => {
      this.textareaRef.style.height = '20px'
      const maxRows = 3
      const lineHeight = 20
      const maxHeight = maxRows * lineHeight

      if (this.textareaRef.scrollHeight <= maxHeight) {
        this.textareaRef.style.height = `${this.textareaRef.scrollHeight}px`
        return
      }
      this.textareaRef.style.height = `${maxHeight}px`
    },
    handleCompositionStart: () => {
      this.isComposing = true
    },
    handleCompositionEnd: () => {
      this.isComposing = false
    }
  }

  updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('value') && this.value === '') {
      // value가 빈 값일 때 textarea 높이를 20px로 초기화
      this.textareaRef.style.height = '20px';
    }
  }

  render() {
    return html`
      <div class="text-field-container">
        <div class="field-container">
          <textarea
            .disabled=${this.disabled}
            .value=${this.value}
            .placeholder=${this.placeholder}
            @input=${this.textFieldHandler.handleInput}
            @keydown=${this.textFieldHandler.handleEnter}
            @compositionstart=${this.textFieldHandler.handleCompositionStart}
            @compositionend=${this.textFieldHandler.handleCompositionEnd} 
          ></textarea>
          <svg 
            xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"
            class="cursor-pointer"
            @click=${this.textFieldHandler.handleClick}
          >
            <path fill-rule="evenodd" clip-rule="evenodd" d="M7.25964 4.28165C6.19604 3.82621 5.08921 3.89334 4.43711 4.65841C3.7891 5.41868 3.90534 6.49937 4.49884 7.38679L6.08975 9.99571L4.49883 12.6046C3.90534 13.4921 3.78905 14.5728 4.43704 15.3331C5.08916 16.0982 6.19605 16.1653 7.25967 15.7098L7.26797 15.7062L17.2707 11.1332C18.2431 10.6886 18.2431 9.30282 17.2707 8.85826L7.26795 4.28521L7.25964 4.28165ZM5.74636 6.55982C5.37195 6.00668 5.51214 5.70524 5.57351 5.63323C5.6344 5.5618 5.93332 5.34709 6.66481 5.65788L14.5129 9.24585H7.38529L5.75634 6.57456L5.74636 6.55982ZM7.38512 10.7458L5.75635 13.4169L5.74637 13.4316C5.37192 13.9848 5.51211 14.2863 5.57348 14.3583C5.63432 14.4297 5.93321 14.6444 6.6648 14.3335L14.5123 10.7458H7.38512Z" fill="#D1D4E8"/>
          </svg>
        </div>
        <div class="count-container"></div>
      </div>
    `
  }
}
