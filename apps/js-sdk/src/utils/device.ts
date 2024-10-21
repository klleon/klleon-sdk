export const checkPermissions = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          console.error('권한이 거부되었습니다: 마이크');
          break;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          console.error('요청된 장치를 찾을 수 없습니다: 카메라 또는 마이크');
          break;
        case 'NotReadableError':
        case 'TrackStartError':
          console.error('장치에 접근할 수 없습니다: 마이크');
          break;
        default:
          console.error(`알 수 없는 에러: ${err.name}`);
      }
    }
  }
}

export const isMobile = () => {
  const userAgent = navigator.userAgent

  return /android|iPad|iPhone|iPod|windows phone/i.test(userAgent);
}
