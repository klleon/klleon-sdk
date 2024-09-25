import { init, onChatEvent } from "./core/sdk"

await init({ sdk_key: 'app-1234567890', avatar_id: 'a5fe629d-0090-11ef-8ee1-0abbf354c5cc', locale: 'ko_kr' })

onChatEvent(data => {
  console.log(data, 'data~~')
})

