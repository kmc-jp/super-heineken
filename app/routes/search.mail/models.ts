export interface Message {
  id: string;
  category: string;
  index: 0;
  from: string;
  to: string[];
  subject: string;
  body: string;
  date: number;
}

export interface MessageResult {
  messages: Message[];
  totalCount: number;
}
