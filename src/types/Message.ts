
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: MessageButton[];
  image?: string;
  audioTranscript?: string;
}

export interface MessageButton {
  id: string;
  label: string;
}
