export const checkPermissions = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          throw new Error('권한이 거부되었습니다: 카메라 또는 마이크');

        case 'NotFoundError':
        case 'DevicesNotFoundError':
          throw new Error('요청된 장치를 찾을 수 없습니다: 카메라 또는 마이크');

        case 'NotReadableError':
        case 'TrackStartError':
          throw new Error('장치에 접근할 수 없습니다: 카메라 또는 마이크');

        default:
          throw new Error(`알 수 없는 에러: ${err.name}`);
      }
    }
    throw new Error('알 수 없는 오류 발생');
  }
}
