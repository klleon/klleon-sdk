import AgoraRTC, { ILocalAudioTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"

export type AgoraConfig = {
  channel: string;
  token: string;
  uid: string;
};

AgoraRTC.setLogLevel(4)
const rtc = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
let localAudioTrack: ILocalAudioTrack | IMicrophoneAudioTrack | null = null;


export const joinAgora = async (config: AgoraConfig) => {
  localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  await rtc.join(import.meta.env.VITE_AGORA_KEY, config.channel, config.token, config.uid);
  await rtc.publish([localAudioTrack]);

  rtc.on('user-published', async (user, mediaType) => {
    await rtc.subscribe(user, mediaType)
    if (mediaType === 'video') {
      const remoteVideoTrack = user.videoTrack;
      remoteVideoTrack?.play('video');
    }

    if (mediaType === 'audio') {
      const remoteAudioTrack = user.audioTrack;
      remoteAudioTrack?.play();
    }

    rtc.on('user-unpublished', user => {
      console.log(`User ${user.uid} has left the channel`);
    });
  })
}

export const leaveAgora = async () => {
  if (localAudioTrack) {
    localAudioTrack.stop()
    localAudioTrack.close()
  }
  await rtc.leave()
}

