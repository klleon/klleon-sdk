export type LocaleType = 'ko_kr' | 'en_us' | 'ja_jp'
export type LogLevelType = 'debug' | 'info' | 'warning' | 'error' | 'none'
export type VoiceCodeType = 'ko_kr' | 'en_us' | 'ja_jp' | 'id_id'
export type SubtitleCodeType = 'ko_kr' | 'en_us' | 'ja_jp' | 'id_id'

export interface InitOption {
  sdk_key: string;
  avatar_id: string;
  locale?: LocaleType
  log_level?: LogLevelType
  enable_microphone?: boolean
}

export interface StreamingOption {
  avatar_id: number | string; // 스트리밍할 아바타 id
  show?: boolean; //스트리밍 화면 출력 여부
  show_dialog?: boolean; // JavaScript SDK 기본 dialog 출력 여부
  show_loading?: boolean; // 스트리밍 로딩 화면 출력 여부
  enable_microphone?: boolean; // JavaScript SDK 마이크 사용 여부
  tts_voice_id?: string;
  voice_code?: VoiceCodeType;
  subtitle_code?: SubtitleCodeType;
  voice_tts_speech_speed?: number;
  fit?: "cover" | "contain" | "fill" | "none" | "scale_down";
  width?: number;
  height?: number;
  radius?: number;
  primary_color?: number;
  background_color?: number;
}

export interface ChatOption {
  show?: boolean;
  width?: number;
  height?: number;
  messages_height_ratio?: number;
  radius?: number;
  align?: "start" | "center" | "end";
  type?: "inside" | "left" | "right";
}

export enum ResponseChatType {
  PING = "PING", // 캐릭터 메시지
  TEXT = "TEXT", // 캐릭터 메시지
  STT_RESULT = "STT_RESULT", // 사용자 음성 메시지
  RATE_LIMIT = "RATE_LIMIT", // 캐릭터 메시지 수신 비활성화
  WAIT = "WAIT", // 채팅 시작 대기
  WARN_SUSPENDED = "WARN_SUSPENDED", // 채팅 없을 시 10초 뒤 채팅 중지 예정 경고
  DISABLED_TIME_OUT = "DISABLED_TIME_OUT", // 일정 시간 후 채팅 없을 시 중지
  TEXT_ERROR = "TEXT_ERROR", // 사용자 메시지 전송 실패
  TEXT_MODERATION = "TEXT_MODERATION", // 사용자가 부적절한 언어를 입력
  ERROR = "ERROR", // 서버 에러 발생
  RESPONSE_IS_ENDED = "RESPONSE_IS_ENDED", // 캐릭터가 보내는 메시지 끝
  WORKER_DISCONNECTED = "WORKER_DISCONNECTED", // 스티리밍 종료
  ACTIVATE_VOICE = "ACTIVATE_VOICE", // 음성 인식 시작
  PREPARING_RESPONSE = "PREPARING_RESPONSE", // 캐릭터 답변 준비 중
  EXCEED_CONCURRENT_QUOTA = "EXCEED_CONCURRENT_QUOTA" // 최대 동시 접속자 수 초과
}

export enum RequestChatType {
  PONG = 'PONG',
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  ECHO = 'ECHO',
  AUDIO = 'AUDIO'
}


export interface ChatData {
  message: string;
  chat_type: ResponseChatType;
  time: string;
}

export interface InitChatData {
  channel: string;
  access_token: string;
  uid: string;
}

export interface SendMessage {
  type: RequestChatType,
  message: string;
}

export interface KlleonSDK {
  init: (option: InitOption) => void
  showStreaming?: (option: StreamingOption) => void
  close?: () => void // 아바타 스트리밍 중단, 세션이 종료되며 재연결 시 스트리밍 시작하기로 재연결해야 됩니다.
  enableStreaming?: () => void
  showChatUi?: (option: ChatOption) => void
  sendTextMessage?: (msg: string) => void
  startStt?: () => void
  endStt?: () => void
  echo?: (msg: string) => void
  stopEcho?: () => void
  startAudioEcho?: (audio: string) => void
  endAudioEcho?: () => void
  onChatEvent?: (data: ChatData) => void
}
