export interface User {
  id: string;
  email: string;
  passwordHash: string;
}

export interface Session {
  token: string;
  userId: string;
}

export interface Bot {
  id: string;
  token: string;
  ownerId: string;
}

export interface Message {
  chatId: string;
  userId: string;
  fromClient: boolean;
  text: string;
  timestamp: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  ownerId: string;
}

export const users: User[] = [];
export const sessions: Record<string, string> = {};
export const bots: Bot[] = [];
export const messages: Message[] = [];
export const tags: Tag[] = [];
export const contactTags: Record<string, string[]> = {};
