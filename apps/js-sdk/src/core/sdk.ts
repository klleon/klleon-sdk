import { proxy } from "valtio";
import { api } from "../api";
import { ChatData, InitOption, LogLevelType, RequestChatType } from "../constants/klleonSDK";
import { checkPermissions } from "../utils/device";
import { joinWebSocket, leaveWebSocket, sendMessage } from "../services/socketService";
import { joinAgora, leaveAgora } from "../services/agoraService";
import AgoraRTC from "agora-rtc-sdk-ng";

export interface State {
  isInitialize: boolean;
  messageList: {
    type: 'response' | 'request',
    message: string
  }[]
  sdk_key: string;
  avatar_id: string;
  locale?: string
  log_level?: LogLevelType
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

export const init = async (option: InitOption) => {
  const { sdk_key, avatar_id, locale = 'ko_kr', log_level, enable_microphone = true } = option
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
  state.log_level = log_level

  switch (state.log_level) {
    case 'debug':
      AgoraRTC.setLogLevel(0)
      break;
    case 'info':
      AgoraRTC.setLogLevel(1)
      break;
    case 'warning':
      AgoraRTC.setLogLevel(2)
      break;
    case 'error':
      AgoraRTC.setLogLevel(3)
      break;
    case 'none':
      AgoraRTC.setLogLevel(4)
      break;
    default:
      AgoraRTC.setLogLevel(1)
      break;
  }

  const { access_token, channel, uid } = await joinWebSocket({ sdk_key, avatar_id, locale })
  await joinAgora({ channel, token: access_token, uid, enable_microphone })
  state.isInitialize = true
}

export const onChatEvent = (callback: (data: ChatData) => void) => {
  chatEventListener = (event: Event) => {
    const customEvent = event as CustomEvent<ChatData>;
    callback(customEvent.detail);
  };
  window.addEventListener('klleon-sdk', chatEventListener);
}

export const destroy = () => {
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

export const startStt = () => {
  sendMessage({ type: RequestChatType['SYSTEM'], message: 'START_VOICE' })
}

export const endStt = () => {
  sendMessage({ type: RequestChatType['SYSTEM'], message: 'END_VOICE' })
}

export const echo = (msg: string) => {
  sendMessage({ type: RequestChatType['ECHO'], message: msg })
}

export const stopEcho = () => {
  sendMessage({ type: RequestChatType['SYSTEM'], message: 'STOP_RESPONSE_MESSAGE' })
}

export const startAudioEcho = (audio: string) => {
  sendMessage({ type: RequestChatType['AUDIO'], message: audio, })
}

export const endAudioEcho = () => {
  sendMessage({ type: RequestChatType['AUDIO'], message: '', })
}
