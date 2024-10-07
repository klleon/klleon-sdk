import { ResponseChatType, InitChatData, SendMessage, RequestChatType, ChatData } from "../constants/klleonSDK";
import { state } from "../core/sdk";


export let socket: WebSocket | null = null;


export const sendMessage = (messageObject: SendMessage): void => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const { messageList } = state
    socket.send(JSON.stringify(messageObject));
    if (Object.values(RequestChatType).includes(messageObject.type) && messageObject.type !== RequestChatType.PONG && messageObject.type !== RequestChatType.SYSTEM && messageObject.message.length > 0) {
      messageList.push({ type: "request", message: messageObject.message })
    }
  }
};

export const joinWebSocket = (options: any): Promise<InitChatData> => {
  return new Promise((resolve, reject) => {
    const { sdk_key, locale, avatar_id } = options
    socket = new WebSocket(`${import.meta.env.VITE_SOCKET_URL}/user?app-key=${sdk_key}&Character=${avatar_id}&Subtitle=${locale}&Voice=${locale}`)

    socket?.addEventListener('open', () => { })
    socket?.addEventListener('close', () => { })
    socket?.addEventListener('error', (error) => {
      reject(error)
    })

    socket?.addEventListener('message', async (event) => {
      const { messageList } = state

      const initData: InitChatData = JSON.parse(event.data)
      const chatData: ChatData = JSON.parse(event.data)

      if (initData.access_token && initData.channel && initData.uid) {
        resolve(initData as InitChatData)
      }

      if (chatData.chat_type === ResponseChatType['PING']) {
        sendMessage({ type: RequestChatType.PONG, message: '' })
        return
      }


      if ((chatData.chat_type === ResponseChatType['STT_RESULT'] || chatData.chat_type === ResponseChatType['TEXT']) && chatData.message.length > 0) {
        messageList.push({ type: "response", message: chatData.message })
      }

      state.chat_type = chatData.chat_type


      const customEvent = new CustomEvent('klleon-sdk', { detail: chatData as ChatData })
      window.dispatchEvent(customEvent)
    })
  })
}

export const leaveWebSocket = (): void => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

