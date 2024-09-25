declare global {
  interface Window {
    KlleonSDK: any
  }
}

const { KlleonSDK } = window


await KlleonSDK.init({
  sdk_key: 'app-1234567890',
  avatar_id: 'a5fe629d-0090-11ef-8ee1-0abbf354c5cc',
  locale: 'ko_kr',
  log_level: 'none',
  // enable_microphone: false
})

// klleonSDK.onChatEvent(data => {
//   console.log(data, 'data~~')
// })
