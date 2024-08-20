import './style.css'

const main = () => {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div id="video" class="video"></div>
    <div id="chatContainer" class="chat-container">
      <div id="msgList" class="msg-list"></div>
      <input id="textInput" class="chat-input" placeholder="Type your message" />
      <button id="sendButton" class="send-button">Send</button>
    </div>
    <button id="counter"></button>
  `
}

export default main



