import { proxy } from "valtio";
import { api } from "../api";
import { ChatData } from "../constants/klleonSDK";
import { checkPermissions } from "../utils/device";
import { joinWebSocket, leaveWebSocket } from "../services/socketService";
import { joinAgora, leaveAgora } from "../services/agoraService";

export interface State {
  isInitialize: boolean;
  messageList: {
    type: 'response' | 'request',
    message: string
  }[]
  sdk_key: string;
  avatar_id: string;
  locale?: string
  type: 'text' | 'voice'
}

export const state = proxy<State>({
  isInitialize: false,
  messageList: [],
  sdk_key: '',
  avatar_id: '',
  locale: undefined,
  type: 'text'
})

let chatEventListener: ((event: Event) => void) | null = null;


export const sdkHandler = {
  init: async (option: any) => {
    const { sdk_key, avatar_id, locale = 'ko_kr' } = option
    await checkPermissions()
    await api.get('/v1/chat/connection-status', {
      headers: {
        'sdk-key': sdk_key
      },
      params: { code: avatar_id }
    }).catch((error) => {
      throw new Error(error)
    })
    state.avatar_id = avatar_id
    state.sdk_key = sdk_key
    state.locale = locale
    const { access_token, channel, uid } = await joinWebSocket({ sdk_key, avatar_id, locale })
    await joinAgora({ channel, token: access_token, uid })
    state.isInitialize = true
  },
  onChatEvent: (callback: (data: ChatData) => void) => {
    chatEventListener = (event: Event) => {
      const customEvent = event as CustomEvent<ChatData>;
      callback(customEvent.detail);
    };
    window.addEventListener('klleon-sdk', chatEventListener);
  },
  destroy: () => {
    if (chatEventListener) {
      window.removeEventListener('klleon-sdk', chatEventListener);
      chatEventListener = null;  // 메모리 관리를 위해 null로 설정
    }
    leaveWebSocket()
    leaveAgora()
    Object.assign(state, {
      isInitialize: false,
      messageList: [],
      sdk_key: '',
      avatar_id: '',
      locale: undefined
    });
  }
}



