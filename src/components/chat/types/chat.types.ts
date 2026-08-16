import { USER_TYPE } from '@/types/user.types';

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  size?: string;
}

export interface ChatAudioMessage {
  duration: string;
  url?: string;
}

export interface ChatMessageReaction {
  emoji: string;
  count: number;
  users: string[];
}

export interface ChatMessage {
  id: string;
  sender: USER_TYPE;
  text: string;
  timestamp: string;
  replyTo?: {
    id: string;
    senderName: string;
    text: string;
  };
  isForwarded?: boolean;
  attachments?: ChatAttachment[];
  audio?: ChatAudioMessage;
  reactions?: ChatMessageReaction[];
}

export interface ChatTarget {
  id: string | number;
  type: 'user' | 'group';
  name: string;
  avatar?: string;
  online?: boolean;
  members?: USER_TYPE[];
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface GroupType {
  id: string | number;
  name: string;
  description?: string;
  members: USER_TYPE[];
  lastMessage?: string;
  lastMessageTime?: string;
}

export interface CombinedChatItem {
  id: string | number;
  type: 'user' | 'group';
  name: string;
  avatar?: string;
  online?: boolean;
  members?: USER_TYPE[];
  lastMessage: string;
  lastMessageTime: string;
  updatedAt: number;
}
