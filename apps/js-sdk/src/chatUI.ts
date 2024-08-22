// src/chatUI.ts
class ChatUI {
  private messageList: HTMLElement;
  private textInput: HTMLInputElement;
  private sendButton: HTMLButtonElement;

  constructor() {
    this.messageList = document.getElementById('message-list')!;
    this.textInput = document.getElementById('message-input') as HTMLInputElement;
    this.sendButton = document.getElementById('send-button') as HTMLButtonElement;

    this.sendButton.addEventListener('click', this.sendMessage.bind(this));
  }

  sendMessage() {
    const message = this.textInput.value;
    if (message) {
      this.addMessage('Me', message);
      this.textInput.value = '';
    }
  }

  addMessage(user: string, message: string) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = `${user}: ${message}`;
    this.messageList.appendChild(messageElement);
    this.messageList.scrollTop = this.messageList.scrollHeight;
  }
}

export default ChatUI;
