
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  buttons?: MessageButton[];
  image?: string;
  callAction?: 'start' | 'end';
}

export interface MessageButton {
  id: string;
  label: string;
}
