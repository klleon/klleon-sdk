import AgoraRTC from 'agora-rtc-sdk-ng'

const rtc = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

const msgList: string[] = []

async function checkPermissions() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // 스트림을 얻은 후, 트랙을 정리해줍니다.
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (err) {
    console.error('Permission denied:', err);
    return false;
  }
}


// WebSocket 연결 URL 생성
const wsUrl = `wss://dev.saas.klleon.io/user?app-key=app-1234567890&Character=a5fe629d-0090-11ef-8ee1-0abbf354c5cc&Subtitle=ko_kr&Voice=ko_kr`;

// WebSocket 연결 생성
const socket = new WebSocket(wsUrl);

// WebSocket 이벤트 핸들러 추가
socket.addEventListener('open', (event) => {
  console.log('Connected to the server');

});

socket.addEventListener('close', (event) => {
  console.log('Disconnected from the server');
});


socket.addEventListener('message', async (event) => {
  const data = JSON.parse(event.data)
  if (data.chat_type === 'PING') {
    socket.send(JSON.stringify({ type: 'PONG', message: '' }));
  }

  if (data.access_token && data.channel && data.uid) {
    const hasPermissions = await checkPermissions();

    if (!hasPermissions) {
      console.log('No permissions for video/audio. Exiting...');
      return;
    }
    try {
      await rtc.join('e984c088afcf4d139d2fa4dc295c9d4c', data.channel, data.access_token, data.uid);

      rtc.on('user-published', async (user, mediaType) => {
        await rtc.subscribe(user, mediaType); // 원격 사용자 구독

        if (mediaType === 'video') {
          const remoteVideoTrack = user.videoTrack;
          remoteVideoTrack?.play('video'); // 'video'는 div 요소의 id
          // setInterval(() => {
          //   const messageObject = {
          //     type: 'USER',
          //     message: '안녕',
          //     timestamp: new Date().toISOString(),
          //     userId: data.uid
          //   };
          //   socket.send(JSON.stringify(messageObject));
          // }, 8000);
        }

        if (mediaType === 'audio') {
          console.log(user.audioTrack, 'at')
          const remoteAudioTrack = user.audioTrack;
          remoteAudioTrack?.play(); // 오디오도 재생 가능, 필요시 추가
        } else {
          console.log('fail audtio')
        }
      });

    } catch (error) {
      console.error('Error joining the channel:', error);
    }
  }

  if (data.chat_type === 'TEXT') {
    msgList.push(data.message)

    console.log(msgList)
  }

});

socket.addEventListener('error', (event) => {
  console.error('WebSocket error:', event);
});


document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.querySelector<HTMLInputElement>('#textInput')!;
  const sendButton = document.querySelector<HTMLButtonElement>('#sendButton')!;
  const msgListDiv = document.querySelector<HTMLDivElement>('#msgList')!;

  function addMessageToUI(message: string) {
    const messageElement = document.createElement('div');
    messageElement.className = 'msg';
    messageElement.textContent = message;
    msgListDiv.appendChild(messageElement);
    msgListDiv.scrollTop = msgListDiv.scrollHeight; // 새 메시지가 보이도록 스크롤
  }

  sendButton.addEventListener('click', () => {
    const messageText = textInput.value.trim();

    if (messageText.length > 0 && socket.readyState === WebSocket.OPEN) {
      const messageObject = {
        type: 'USER',
        message: messageText,
        timestamp: new Date().toISOString(),
        userId: rtc.uid // rtc.uid는 유저의 uid로 간주합니다. 정확한 값은 채널에 연결될 때 얻어야 합니다.
      };

      socket.send(JSON.stringify(messageObject));

      // 메시지 전송 후 input 초기화
      textInput.value = '';

      // 메시지를 UI에 추가
      addMessageToUI(`Me: ${messageText}`);
    }
  });

  // 서버로부터 메시지를 받을 때 UI에 추가
  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    if (data.chat_type === 'TEXT') {
      msgList.push(data.message);
      addMessageToUI(`User: ${data.message}`);
    }
  });
});


export function setupCounter(element: HTMLButtonElement) {
  let counter = 0
  const setCounter = (count: number) => {
    counter = count
    element.innerHTML = `count is ${counter}`
  }
  element.addEventListener('click', () => setCounter(counter + 1))
  setCounter(0)
}
