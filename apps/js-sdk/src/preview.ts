console.log('preve')
// 전역 환경에 KlleonSDK를 선언
declare global {
  interface Window {
    KlleonSDK: any;
  }
}

window.KlleonSDK.main()
window.KlleonSDK.agora()
