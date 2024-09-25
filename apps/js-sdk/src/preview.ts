declare global {
  interface Window {
    KlleonSDK: any
  }
}

const { klleonSDK } = window.KlleonSDK.useSdk()


console.log('?', klleonSDK)

await klleonSDK.init({ sdk_key: 'app-1234567890', avatar_id: 'a5fe629d-0090-11ef-8ee1-0abbf354c5cc', locale: 'ko_kr' })

// klleonSDK.onChatEvent(data => {
//   console.log(data, 'data~~')
// })
