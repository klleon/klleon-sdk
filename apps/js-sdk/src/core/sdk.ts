import { proxy } from "valtio";
import { api } from "../api";
import { ChatData } from "../constants/klleonSDK";
import { checkPermissions } from "../utils/device";
import { joinWebSocket } from "../services/socketService";
import { joinAgora } from "../services/agoraService";

export interface State {
  isInitialize: boolean;
  messageList: {
    type: 'response' | 'request',
    message: string
  }[]
  sdk_key: string;
  avatar_id: string;
  locale?: string
}

const state = proxy<State>({
  isInitialize: false,
  messageList: [],
  sdk_key: '',
  avatar_id: '',
  locale: undefined
})



const useSdk = () => {
  const klleonSDK = {
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
      window.addEventListener('klleon-sdk', (event) => {
        const customEvent = event as CustomEvent<ChatData>
        // console.log(customEvent.detail, 'klleon-sdk')
        // addMessageToUI(`avatar: ${customEvent.detail.message}`)
        callback(customEvent.detail)
      })
    },
    destroy: () => {

    }
  }

  return { state, klleonSDK }
}

export default useSdk
