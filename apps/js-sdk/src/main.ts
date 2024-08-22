const main = () => {
  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div id="video" class="kl-size-[300px]"></div>
    <div id="chatContainer" class="chat-container">
      <div id="msgList" class="msg-list"></div>
      <div class="kl-flex kl-flex-col kl-gap-y-3">
        <div class="kl-flex">
          <input id="textInput" class="chat-input" placeholder="Type your message" />
          <button id="sendButton" class="send-button">Send</button>
        </div>
        <div class="kl-flex">
          <button id="voiceSendButton" class="send-button">voiceSendButton</button>
        </div>
        <div class="kl-flex">
          <input id="echoInput" class="chat-input" placeholder="Type echo message" />
          <button id="sendEchoButton" class="send-button">Send Echo</button>
        </div>
        <div class="kl-flex">
           <button id="sendVoiceEchoButton" class="send-button">Send Echo</button>
        </div>
      </div>
    </div>
  `;
};

export default main;
