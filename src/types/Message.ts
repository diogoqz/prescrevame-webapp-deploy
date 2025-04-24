
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: MessageButton[];
  image?: string;
}

export interface MessageButton {
  id: string;
  label: string;
}
