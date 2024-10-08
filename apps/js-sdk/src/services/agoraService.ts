import AgoraRTC, { ILocalAudioTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import { Avatar } from "../ui/avatar";


export type AgoraConfig = {
  channel: string;
  token: string;
  uid: string;
  enable_microphone: boolean
};


const rtc = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
let localAudioTrack: ILocalAudioTrack | IMicrophoneAudioTrack | null = null;


export const joinAgora = async (config: AgoraConfig, fit?: 'cover' | 'contain' | 'fill') => {
  if (!config.enable_microphone) {
    console.warn('실시간 음성인식을 위해 마이크를 활성화해주세요.')
  }
  if (config.enable_microphone) {
    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  }
  await rtc.join(import.meta.env.VITE_AGORA_KEY, config.channel, config.token, config.uid);
  if (localAudioTrack) {
    await rtc.publish([localAudioTrack]);
  }

  rtc.on('user-published', async (user, mediaType) => {
    await rtc.subscribe(user, mediaType)
    if (mediaType === 'video') {
      const remoteVideoTrack = user.videoTrack;
      const avatarContainer = document.querySelector('avatar-container') as Avatar;
      const avatarElement = avatarContainer.getAvatarElement();

      if (!avatarContainer || !avatarElement) return

      remoteVideoTrack?.play(avatarElement, { fit });

      const videoElement = avatarElement.querySelector('video');
      const videoClasses = avatarElement.getAttribute('videoClass') || '';
      const containerElement = avatarElement.querySelector('div');

      videoElement?.classList.add(videoClasses)
      containerElement?.style.removeProperty('background-color')
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

