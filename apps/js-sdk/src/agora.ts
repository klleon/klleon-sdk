import AgoraRTC, { ILocalAudioTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng';

const agora = () => {
  const rtc = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
  let localAudioTrack: ILocalAudioTrack | IMicrophoneAudioTrack | null = null;
  const msgList: string[] = [];
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: BlobPart[] = [];

  async function checkPermissions(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
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

  socket.addEventListener('open', () => {
    console.log('Connected to the server');
  });

  socket.addEventListener('close', () => {
    console.log('Disconnected from the server');
  });

  socket.addEventListener('message', async (event) => {
    const data = JSON.parse(event.data);
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
        localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        await rtc.join('your-app-id', data.channel, data.access_token, data.uid);
        rtc.publish([localAudioTrack]);

        rtc.on('user-published', async (user, mediaType) => {
          await rtc.subscribe(user, mediaType);

          if (mediaType === 'video') {
            const remoteVideoTrack = user.videoTrack;
            remoteVideoTrack?.play('video');
          }

          if (mediaType === 'audio') {
            const remoteAudioTrack = user.audioTrack;
            remoteAudioTrack?.play();
          }
        });

      } catch (error) {
        console.error('Error joining the channel:', error);
      }
    }

    if (data.chat_type === 'STT_RESULT') {
      // 서버로부터 받은 텍스트 결과를 UI에 표시
      msgList.push(data.message);
      // addMessageToUI(`User: ${data.message}`);
    }

    if (data.chat_type === 'TEXT') {
      msgList.push(data.message);
      // addMessageToUI(`User: ${data.message}`);
    }
  });

  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    audioChunks = [];

    mediaRecorder.addEventListener('dataavailable', event => {
      audioChunks.push(event.data);
    });

    mediaRecorder.start();
  }

  async function stopRecordingAndSendAudio() {
    if (mediaRecorder) {
      mediaRecorder.addEventListener('stop', async () => {
        const audioBlob = new Blob(audioChunks);
        const reader = new FileReader();

        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64String = reader.result as string;
          const audioBase64 = base64String.split(',')[1]; // base64 인코딩된 오디오 데이터만 가져옴

          // base64 오디오 데이터의 크기 계산 (1 byte = 8 bit, base64는 6 bit씩 표현하므로 4/3 비율)
          const audioSizeInBytes = (audioBase64.length * 3) / 4;

          // 100KB = 100 * 1024 bytes
          const maxSizeInBytes = 100 * 1024;

          if (audioSizeInBytes <= maxSizeInBytes) {
            // base64 오디오 데이터를 서버로 전송
            const messageObject = {
              type: 'AUDIO',
              message: audioBase64
            };

            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(messageObject));
            }

            // 빈 메시지를 서버로 전송하여 에코 종료
            const stopMessageObject = {
              type: 'AUDIO',
              message: ''
            };

            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify(stopMessageObject));
            }
          } else {
            console.warn('Audio size exceeds 100KB, not sending the message.');
          }
        };
      });

      mediaRecorder.stop();
    }
  }





  document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.querySelector<HTMLInputElement>('#textInput')!;
    const sendButton = document.querySelector<HTMLButtonElement>('#sendButton')!;

    const voiceSendButton = document.querySelector<HTMLButtonElement>('#voiceSendButton')!;

    const echoInput = document.querySelector<HTMLInputElement>('#echoInput')!;
    const sendEchoButton = document.querySelector<HTMLButtonElement>('#sendEchoButton')!;

    const sendVoiceEchoButton = document.querySelector<HTMLButtonElement>('#sendVoiceEchoButton')!

    const msgListDiv = document.querySelector<HTMLDivElement>('#msgList')!;

    function addMessageToUI(message: string) {
      const messageElement = document.createElement('div');
      messageElement.className = 'msg';
      messageElement.textContent = message;
      msgListDiv.appendChild(messageElement);
      msgListDiv.scrollTop = msgListDiv.scrollHeight;
    }

    sendButton.addEventListener('click', () => {
      const messageText = textInput.value.trim();
      if (messageText.length > 0 && socket.readyState === WebSocket.OPEN) {
        const messageObject = {
          type: 'USER',
          message: messageText,
          timestamp: new Date().toISOString(),
          userId: rtc.uid,
        };

        socket.send(JSON.stringify(messageObject));
        textInput.value = '';
        addMessageToUI(`Me: ${messageText}`);
      }
    });

    voiceSendButton.addEventListener('mousedown', () => {
      if (localAudioTrack) {
        const messageObject = {
          type: 'SYSTEM',
          message: 'START_VOICE'
        }
        socket.send(JSON.stringify(messageObject))
      }
    })

    voiceSendButton.addEventListener('mouseup', () => {
      const messageObject = {
        type: 'SYSTEM',
        message: 'END_VOICE'
      }
      socket.send(JSON.stringify(messageObject))
    })

    sendEchoButton.addEventListener('mousedown', () => {
      const echoText = echoInput.value.trim();
      if (echoText.length > 0 && socket.readyState === WebSocket.OPEN) {
        const echoMessageObject = {
          type: 'ECHO',
          message: echoText,
        };

        socket.send(JSON.stringify(echoMessageObject));
        echoInput.value = '';
        addMessageToUI(`Echo: ${echoText}`);
      }
    })

    sendEchoButton.addEventListener('mouseup', (event) => {
      if (socket.readyState === WebSocket.OPEN) {
        const stopEchoMessageObject = {
          type: 'SYSTEM',
          message: 'STOP_RESPONSE_MESSAGE',
        };

        socket.send(JSON.stringify(stopEchoMessageObject));
        addMessageToUI('에코 중지');
      }
    })


    sendVoiceEchoButton.addEventListener('mousedown', async () => {
      await startRecording()
    })

    sendVoiceEchoButton.addEventListener('mouseup', async () => {
      await stopRecordingAndSendAudio()
    })

    socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.chat_type === 'TEXT') {
        msgList.push(data.message);
        addMessageToUI(`User: ${data.message}`);
      }
    });
  });
};

export default agora;
