'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import {
  ChatAttachment,
  ChatAudioMessage,
  ChatMessage,
  ChatMessageReaction,
  ChatTarget,
} from '@/types/chat.types';
import { USER_TYPE } from '@/types/user.types';
import USERS from '@/dummyData/users.json';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  X,
  Minus,
  Maximize2,
  Send,
  Smile,
  UserPlus,
  Users,
  Check,
  Pencil,
  Reply,
  Forward,
  Paperclip,
  Mic,
  Play,
  Pause,
  FileText,
  ExternalLink,
  Plus,
  MessageSquare,
  Search,
  UserCheck,
} from 'lucide-react';

const EMOJI_LIST = [
  '👍', '❤️', '🔥', '🎉', '🚀', '😊', '😂', '😎', '👏', '🙏',
  '💡', '✨', '💯', '✅', '👋', '👀', '💪', '🎯', '⚡', '💬'
];

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🔥', '🎉', '😮'];

const parseDurationToSeconds = (durationStr?: string): number => {
  if (!durationStr) return 5;
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1], 10) || 0;
    return mins * 60 + secs;
  }
  const parsed = parseInt(durationStr, 10);
  return isNaN(parsed) ? 5 : parsed;
};

const renderMessageTextWithMentions = (text: string) => {
  if (!text) return null;
  const mentionRegex = /(@[A-Za-z0-9_.\s]+?(?=\s|$|[^A-Za-z0-9_.]))/g;
  const parts = text.split(mentionRegex);

  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          return (
            <span
              key={i}
              className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

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

// Single Chat Window Component for Multi-Window Setup
function SingleChatBox({
  target,
  isMinimized,
  onToggleMinimize,
  onClose,
  currentUser,
  messagesMap,
  onSendMessage,
  onAddReaction,
  onForwardMessage,
  onAddMemberToGroup,
  onUpdateGroupName,
}: {
  target: ChatTarget;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
  currentUser: USER_TYPE;
  messagesMap: Record<string | number, ChatMessage[]>;
  onSendMessage: (targetId: string | number, text: string, replyTo?: ChatMessage | null, attachments?: ChatAttachment[], audio?: ChatAudioMessage) => void;
  onAddReaction: (targetId: string | number, msgId: string, emoji: string) => void;
  onForwardMessage: (msg: ChatMessage) => void;
  onAddMemberToGroup: (user: USER_TYPE) => void;
  onUpdateGroupName: (newName: string) => void;
}) {
  const [newMessageText, setNewMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioCurrentSeconds, setAudioCurrentSeconds] = useState<Record<string, number>>({});
  const audioCleanupRef = useRef<(() => void) | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const targetId = target.id;
  const currentMessages = messagesMap[targetId] || [
    {
      id: `init-${targetId}`,
      sender: target.type === 'user' ? USERS.find((u) => u.userId.toString() === targetId.toString()) || USERS[0] : USERS[0],
      text: `Started conversation with ${target.name}. Say hello! 👋`,
      timestamp: 'Just now',
    },
  ];

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentMessages, isMinimized]);

  const handleSend = (audioMessage?: ChatAudioMessage) => {
    if (!newMessageText.trim() && pendingAttachments.length === 0 && !audioMessage) return;
    onSendMessage(targetId, newMessageText.trim(), replyingTo, pendingAttachments, audioMessage);
    setNewMessageText('');
    setReplyingTo(null);
    setPendingAttachments([]);
  };

  const handleStopAndSendVoice = () => {
    setIsRecording(false);
    const mins = Math.floor(recordingSeconds / 60);
    const secs = recordingSeconds % 60;
    const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    handleSend({ duration: durationStr || '0:05' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const newAtts: ChatAttachment[] = Array.from(files).map((file, idx) => ({
      id: `chat-att-${Date.now()}-${idx}`,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'file',
      size: `${Math.round(file.size / 1024)} KB`,
    }));
    setPendingAttachments((prev) => [...prev, ...newAtts]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const togglePlayVoiceMessage = (msg: ChatMessage) => {
    if (!msg.audio) return;
    const msgId = msg.id;

    if (playingAudioId === msgId) {
      if (audioCleanupRef.current) audioCleanupRef.current();
      setPlayingAudioId(null);
      return;
    }

    if (audioCleanupRef.current) audioCleanupRef.current();
    const totalSecs = parseDurationToSeconds(msg.audio.duration);
    setPlayingAudioId(msgId);
    setAudioCurrentSeconds((prev) => ({ ...prev, [msgId]: 0 }));

    let current = 0;
    const timer = setInterval(() => {
      current += 1;
      setAudioCurrentSeconds((prev) => ({ ...prev, [msgId]: current }));
      if (current >= totalSecs) {
        clearInterval(timer);
        setPlayingAudioId(null);
        setAudioCurrentSeconds((prev) => ({ ...prev, [msgId]: 0 }));
      }
    }, 1000);

    audioCleanupRef.current = () => {
      clearInterval(timer);
      setAudioCurrentSeconds((prev) => ({ ...prev, [msgId]: 0 }));
    };
  };

  return (
    <div
      className={`w-72 sm:w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-t-xl shadow-2xl flex flex-col transition-all duration-200 shrink-0 ${
        isMinimized ? 'h-11 overflow-hidden' : 'h-[440px]'
      }`}
    >
      {/* Header */}
      <div className="h-11 px-3 bg-zinc-900 text-white rounded-t-xl flex items-center justify-between shrink-0 select-none">
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
          <div className="relative shrink-0">
            {target.type === 'user' ? (
              <Avatar className="h-6 w-6 border border-zinc-700">
                <AvatarImage src={target.avatar || ''} alt={target.name} />
                <AvatarFallback className="text-[10px] bg-zinc-800 text-white">{target.name[0]}</AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-6 w-6 rounded-full bg-teal-600 flex items-center justify-center text-white">
                <Users size={12} />
              </div>
            )}
            {target.type === 'user' && target.online && (
              <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-zinc-900" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {isEditingGroupName && target.type === 'group' ? (
              <div className="flex items-center gap-1">
                <Input
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (groupNameInput.trim()) onUpdateGroupName(groupNameInput.trim());
                      setIsEditingGroupName(false);
                    }
                    if (e.key === 'Escape') setIsEditingGroupName(false);
                  }}
                  className="h-5 text-[11px] px-1 bg-zinc-800 border-zinc-700 text-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (groupNameInput.trim()) onUpdateGroupName(groupNameInput.trim());
                    setIsEditingGroupName(false);
                  }}
                  className="p-0.5 text-emerald-400"
                >
                  <Check size={11} />
                </button>
              </div>
            ) : (
              <h4
                onClick={() => {
                  if (target.type === 'group') {
                    setGroupNameInput(target.name);
                    setIsEditingGroupName(true);
                  }
                }}
                className={`text-xs font-semibold text-zinc-100 truncate ${
                  target.type === 'group' ? 'cursor-pointer hover:text-teal-300' : ''
                }`}
              >
                {target.name}
              </h4>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {target.type === 'group' && !isMinimized && (
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(true)}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <UserPlus size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={onToggleMinimize}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minus size={13} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Messages Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs custom-scrollbar">
            {currentMessages.map((msg) => {
              const isSelf = msg.sender.userId === currentUser.userId || msg.sender.fullName === 'You';
              const isAudioPlaying = playingAudioId === msg.id;
              const currentPlayedSecs = audioCurrentSeconds[msg.id] || 0;

              return (
                <div
                  key={msg.id}
                  className={`group/msg relative flex items-end gap-1.5 ${isSelf ? 'justify-end' : 'justify-start'}`}
                >
                  {!isSelf && (
                    <Avatar className="h-5 w-5 shrink-0 mb-0.5">
                      <AvatarImage src={msg.sender.photoUrl || ''} alt={msg.sender.fullName} />
                      <AvatarFallback className="text-[9px]">{msg.sender.fullName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  )}

                  {/* Hover Action buttons */}
                  <div
                    className={`absolute -top-4 opacity-0 group-hover/msg:opacity-100 transition-opacity bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-1 py-0.5 shadow-md flex items-center gap-0.5 z-20 ${
                      isSelf ? 'right-2' : 'left-6'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setReplyingTo(msg)}
                      className="p-0.5 text-zinc-500 hover:text-teal-600 cursor-pointer"
                    >
                      <Reply size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onForwardMessage(msg)}
                      className="p-0.5 text-zinc-500 hover:text-teal-600 cursor-pointer"
                    >
                      <Forward size={11} />
                    </button>
                  </div>

                  <div className={`max-w-[85%] space-y-0.5 ${isSelf ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-2 rounded-xl text-xs leading-relaxed font-normal break-words shadow-2xs relative ${
                        isSelf
                          ? 'bg-teal-700 text-white rounded-br-none'
                          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 rounded-bl-none'
                      }`}
                    >
                      {msg.replyTo && (
                        <div
                          className={`mb-1 p-1 rounded border-l-2 text-[10px] ${
                            isSelf ? 'bg-teal-800/80 border-white/60 text-teal-100' : 'bg-zinc-100 dark:bg-zinc-900 border-teal-600'
                          }`}
                        >
                          <span className="font-semibold block">{msg.replyTo.senderName}</span>
                          <span className="truncate block opacity-90">{msg.replyTo.text}</span>
                        </div>
                      )}

                      {msg.audio ? (
                        <div className="flex items-center gap-2 py-0.5 min-w-[140px]">
                          <button
                            type="button"
                            onClick={() => togglePlayVoiceMessage(msg)}
                            className={`p-1.5 rounded-full cursor-pointer ${
                              isSelf ? 'bg-white text-teal-700' : 'bg-teal-600 text-white'
                            }`}
                          >
                            {isAudioPlaying ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                          <span className="text-[10px] font-mono">0:0{currentPlayedSecs} / {msg.audio.duration}</span>
                        </div>
                      ) : (
                        renderMessageTextWithMentions(msg.text)
                      )}
                    </div>
                    <span className={`text-[8px] text-zinc-400 block px-1 ${isSelf ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Banner */}
          {replyingTo && (
            <div className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
              <div className="truncate border-l-2 border-teal-600 pl-1.5">
                <span className="font-semibold">Replying to {replyingTo.sender.fullName}</span>
              </div>
              <button type="button" onClick={() => setReplyingTo(null)} className="text-zinc-400 hover:text-zinc-600">
                <X size={12} />
              </button>
            </div>
          )}

          {/* Input Footer */}
          {isRecording ? (
            <div className="p-2 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs">
              <span className="text-rose-600 font-semibold animate-pulse text-[11px]">Recording ({recordingSeconds}s)...</span>
              <Button type="button" size="sm" onClick={handleStopAndSendVoice} className="h-6 text-[11px] bg-rose-600 text-white">
                Send
              </Button>
            </div>
          ) : (
            <div className="p-2 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <Textarea
                placeholder={`Message ${target.name}...`}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="min-h-[36px] max-h-20 text-xs resize-none bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-0.5">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} className="h-6 px-1.5 text-zinc-500 hover:text-teal-600 cursor-pointer">
                    <Paperclip size={14} />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setIsRecording(true)} className="h-6 px-1.5 text-zinc-500 hover:text-rose-500 cursor-pointer">
                    <Mic size={14} />
                  </Button>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleSend()}
                  disabled={!newMessageText.trim() && pendingAttachments.length === 0}
                  className="h-6 px-2.5 text-[11px] font-semibold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer"
                >
                  <Send size={11} className="mr-1" /> Send
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[360px] p-4">
          <DialogHeader>
            <DialogTitle className="text-xs font-semibold">Add Member to {target.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 my-2 max-h-48 overflow-y-auto custom-scrollbar">
            {USERS.map((user) => {
              const isMember = target.members?.some((m) => m.userId === user.userId);
              return (
                <div key={user.userId} className="flex items-center justify-between p-1.5 rounded border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-medium">{user.fullName}</span>
                  {isMember ? (
                    <span className="text-[10px] text-emerald-600 font-semibold">Member</span>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => onAddMemberToGroup(user)} className="h-6 text-[10px] px-2">
                      Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function FloatingChatWindow() {
  const ctx = useAppState();
  const openChats = ctx?.state?.openChats || [];

  // Local state for tracking minimized chat window IDs
  const [minimizedChatIds, setMinimizedChatIds] = useState<Set<string | number>>(new Set());

  // Panel toggle state
  const [isChatListPanelOpen, setIsChatListPanelOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');

  // Initial combined chat list
  const [chatTargetsList, setChatTargetsList] = useState<CombinedChatItem[]>([
    {
      id: USERS[0].userId,
      type: 'user',
      name: USERS[0].fullName,
      avatar: USERS[0].photoUrl,
      online: true,
      lastMessage: 'Hey there! How is the project going?',
      lastMessageTime: '10:30 AM',
      updatedAt: Date.now() - 1000 * 60 * 5,
    },
    {
      id: USERS[1].userId,
      type: 'user',
      name: USERS[1].fullName,
      avatar: USERS[1].photoUrl,
      online: true,
      lastMessage: 'I reviewed the pull request.',
      lastMessageTime: '09:45 AM',
      updatedAt: Date.now() - 1000 * 60 * 30,
    },
    {
      id: 'g-1',
      type: 'group',
      name: 'Frontend Team',
      members: [USERS[0], USERS[1], USERS[2]],
      lastMessage: 'Assaduzzaman: Ready for the sprint.',
      lastMessageTime: '09:20 AM',
      updatedAt: Date.now() - 1000 * 60 * 60,
    },
    {
      id: 'g-2',
      type: 'group',
      name: 'Project Leads',
      members: [USERS[0], USERS[3]],
      lastMessage: 'Uttam: Architecture plan approved!',
      lastMessageTime: 'Yesterday',
      updatedAt: Date.now() - 1000 * 60 * 60 * 20,
    },
    {
      id: USERS[2].userId,
      type: 'user',
      name: USERS[2].fullName,
      avatar: USERS[2].photoUrl,
      online: false,
      lastMessage: 'Can you check the API schema?',
      lastMessageTime: 'Yesterday',
      updatedAt: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      id: USERS[3].userId,
      type: 'user',
      name: USERS[3].fullName,
      avatar: USERS[3].photoUrl,
      online: true,
      lastMessage: 'Task assignment updated.',
      lastMessageTime: 'Jul 26',
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    },
    {
      id: USERS[4].userId,
      type: 'user',
      name: USERS[4].fullName,
      avatar: USERS[4].photoUrl,
      online: false,
      lastMessage: 'Design mockup attached.',
      lastMessageTime: 'Jul 25',
      updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    },
  ]);

  // Messages map state across all windows
  const [messagesMap, setMessagesMap] = useState<Record<string | number, ChatMessage[]>>({
    1: [
      { id: 'm1', sender: USERS[0], text: 'Hey there! How is the project going?', timestamp: '10:30 AM' },
      { id: 'm2', sender: { userId: 99, phone: '01617630101', userName: 'me', fullName: 'You', photoUrl: '' }, text: 'Making great progress! Updated the board tasks.', timestamp: '10:32 AM' },
    ],
    'g-1': [
      { id: 'mg1', sender: USERS[0], text: 'Welcome to @Assaduzzaman Sagor and @Shibly Mustafiz in the Frontend Team!', timestamp: '09:15 AM' },
      { id: 'mg2', sender: USERS[1], text: 'Thanks Uttam! Ready for the sprint.', timestamp: '09:20 AM' },
    ],
  });

  // Create Group State
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<number[]>([USERS[0].userId]);

  // Forwarding State
  const [isForwardOpen, setIsForwardOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);

  const currentUser: USER_TYPE = ctx?.state?.user || {
    userId: 1,
    phone: '01617630101',
    userName: 'uttam@k.com',
    fullName: 'Uttam Kumar',
    photoUrl: 'https://github.com/shadcn.png',
  };

  // Sorted recent-first list
  const sortedChatList = useMemo(() => {
    return [...chatTargetsList].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [chatTargetsList]);

  // Filtered search list
  const filteredChatList = useMemo(() => {
    if (!chatSearchQuery.trim()) return sortedChatList;
    const q = chatSearchQuery.toLowerCase();
    return sortedChatList.filter(
      (item) => item.name.toLowerCase().includes(q) || item.lastMessage.toLowerCase().includes(q)
    );
  }, [sortedChatList, chatSearchQuery]);

  // Handle clicking chat item from panel (opens window & unminimizes if minimized!)
  const handleSelectChatTarget = (item: CombinedChatItem) => {
    const chatTarget: ChatTarget = {
      id: item.id,
      type: item.type,
      name: item.name,
      avatar: item.avatar,
      online: item.online,
      members: item.members,
      lastMessage: item.lastMessage,
      lastMessageTime: item.lastMessageTime,
    };

    // Open in context
    ctx?.openChat(chatTarget);

    // Unminimize if it was minimized
    setMinimizedChatIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id.toString());
      next.delete(item.id);
      return next;
    });

    setIsChatListPanelOpen(false);
  };

  const toggleMinimize = (targetId: string | number) => {
    setMinimizedChatIds((prev) => {
      const next = new Set(prev);
      const strId = targetId.toString();
      if (next.has(strId)) {
        next.delete(strId);
      } else {
        next.add(strId);
      }
      return next;
    });
  };

  const handleSendMessage = (
    targetId: string | number,
    text: string,
    replyTo?: ChatMessage | null,
    attachments?: ChatAttachment[],
    audio?: ChatAudioMessage
  ) => {
    const currentMsgs = messagesMap[targetId] || [];

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: currentUser,
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      replyTo: replyTo
        ? {
            id: replyTo.id,
            senderName: replyTo.sender.fullName,
            text: replyTo.text || (replyTo.audio ? '🎤 Voice message' : 'File attachment'),
          }
        : undefined,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
      audio: audio,
    };

    const updated = [...currentMsgs, newMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [targetId]: updated,
    }));

    const previewText = audio
      ? '🎤 Voice message'
      : text || `${attachments?.length || 0} Attachment(s)`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update floating targets list to sort recent first
    setChatTargetsList((prev) => {
      return prev.map((item) => {
        if (item.id.toString() === targetId.toString()) {
          return {
            ...item,
            lastMessage: `${currentUser.fullName.split(' ')[0]}: ${previewText}`,
            lastMessageTime: nowTime,
            updatedAt: Date.now(),
          };
        }
        return item;
      });
    });
  };

  const handleAddReaction = (targetId: string | number, msgId: string, emoji: string) => {
    const currentMsgs = messagesMap[targetId] || [];
    const updatedMsgs = currentMsgs.map((msg) => {
      if (msg.id !== msgId) return msg;
      const existingReactions = msg.reactions || [];
      const idx = existingReactions.findIndex((r) => r.emoji === emoji);

      let newReactions: ChatMessageReaction[] = [];
      if (idx > -1) {
        newReactions = existingReactions.map((r, i) => (i === idx ? { ...r, count: r.count + 1 } : r));
      } else {
        newReactions = [...existingReactions, { emoji, count: 1, users: [currentUser.fullName] }];
      }

      return { ...msg, reactions: newReactions };
    });

    setMessagesMap((prev) => ({
      ...prev,
      [targetId]: updatedMsgs,
    }));
  };

  const handleForwardToTarget = (destTargetId: string | number) => {
    if (!forwardingMessage) return;

    const forwardedMsg: ChatMessage = {
      id: `fwd-${Date.now()}`,
      sender: currentUser,
      text: forwardingMessage.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isForwarded: true,
      attachments: forwardingMessage.attachments,
      audio: forwardingMessage.audio,
    };

    setMessagesMap((prev) => ({
      ...prev,
      [destTargetId]: [...(prev[destTargetId] || []), forwardedMsg],
    }));

    setIsForwardOpen(false);
    setForwardingMessage(null);
  };

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const selectedMembers = USERS.filter((u) => selectedMemberIds.includes(u.userId));
    const newGroup: CombinedChatItem = {
      id: `g-${Date.now()}`,
      type: 'group',
      name: newGroupName.trim(),
      members: selectedMembers.length > 0 ? selectedMembers : [USERS[0]],
      lastMessage: 'Group created!',
      lastMessageTime: 'Just now',
      updatedAt: Date.now(),
    };

    setChatTargetsList((prev) => [newGroup, ...prev]);
    setNewGroupName('');
    setSelectedMemberIds([USERS[0].userId]);
    setIsCreateGroupOpen(false);

    // Open chat
    ctx?.openChat({
      id: newGroup.id,
      type: 'group',
      name: newGroup.name,
      members: newGroup.members,
      lastMessage: newGroup.lastMessage,
      lastMessageTime: newGroup.lastMessageTime,
    });
    setIsChatListPanelOpen(false);
  };

  return (
    <>
      {/* MULTI-WINDOW CONTAINER: Renders all opened chat windows side-by-side */}
      <div className="fixed bottom-0 right-20 sm:right-24 z-40 flex items-end gap-3 max-w-[calc(100vw-120px)] overflow-x-auto p-1 custom-scrollbar pointer-events-auto">
        {openChats.map((chatTarget) => {
          const isMin = minimizedChatIds.has(chatTarget.id.toString()) || minimizedChatIds.has(chatTarget.id);
          return (
            <SingleChatBox
              key={chatTarget.id}
              target={chatTarget}
              isMinimized={isMin}
              onToggleMinimize={() => toggleMinimize(chatTarget.id)}
              onClose={() => ctx?.closeChat(chatTarget.id)}
              currentUser={currentUser}
              messagesMap={messagesMap}
              onSendMessage={handleSendMessage}
              onAddReaction={handleAddReaction}
              onForwardMessage={(msg) => {
                setForwardingMessage(msg);
                setIsForwardOpen(true);
              }}
              onAddMemberToGroup={(userToAdd) => {
                if (chatTarget.type !== 'group') return;
                const members = chatTarget.members || [];
                if (members.some((m) => m.userId === userToAdd.userId)) return;
                const updated = { ...chatTarget, members: [...members, userToAdd] };
                ctx?.updateActiveChatTarget(updated);
              }}
              onUpdateGroupName={(newName) => {
                if (chatTarget.type !== 'group') return;
                ctx?.updateActiveChatTarget({ ...chatTarget, name: newName });
              }}
            />
          );
        })}
      </div>

      {/* ALWAYS VISIBLE FLOATING CHAT ICON (Bottom Right Corner) */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {/* Floating Chat List Panel */}
        {isChatListPanelOpen && (
          <div className="w-80 sm:w-96 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Panel Header */}
            <div className="p-3.5 bg-zinc-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold flex items-center gap-1.5">
                    Messages & Groups
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-800 text-teal-200">
                      {sortedChatList.length}
                    </span>
                  </h3>
                  <p className="text-[10px] text-zinc-400">Sorted by recent conversations</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(true)}
                  className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                  title="Create New Group"
                >
                  <Plus size={14} /> Group
                </button>
                <button
                  type="button"
                  onClick={() => setIsChatListPanelOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Search chats or members..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl"
                />
              </div>
            </div>

            {/* Recent Chat List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
              {filteredChatList.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400">No chats matching search</div>
              ) : (
                filteredChatList.map((item) => {
                  const isOpenInWindow = openChats.some((c) => c.id.toString() === item.id.toString());
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectChatTarget(item)}
                      className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer border transition-all group select-none ${
                        isOpenInWindow
                          ? 'bg-teal-50/90 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800/80 shadow-2xs'
                          : 'hover:bg-zinc-100/80 dark:hover:bg-zinc-900/80 border-transparent'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {item.type === 'user' ? (
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={item.avatar} alt={item.name} />
                            <AvatarFallback className="text-xs">{item.name[0]}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-teal-600/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 flex items-center justify-center font-bold">
                            <Users size={16} />
                          </div>
                        )}
                        {item.type === 'user' && item.online && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-zinc-950" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="truncate text-xs font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-teal-700 dark:group-hover:text-teal-400">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 shrink-0 ml-2 font-medium">
                            {item.lastMessageTime}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1">
                          <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400 max-w-[200px]">
                            {item.lastMessage}
                          </p>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${
                              item.type === 'group'
                                ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                                : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                            }`}
                          >
                            {item.type === 'group' ? 'Group' : 'Direct'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ALWAYS VISIBLE FLOATING CHAT BUTTON */}
        <button
          type="button"
          onClick={() => setIsChatListPanelOpen((prev) => !prev)}
          className="h-13 w-13 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-xl flex items-center justify-center relative cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
          title="Open Chat List"
        >
          <MessageSquare size={22} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-xs">
            {chatTargetsList.length}
          </span>
        </button>
      </div>

      {/* CREATE GROUP DIALOG */}
      <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
        <DialogContent className="sm:max-w-[420px] p-5 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Users size={16} className="text-teal-600" /> Create New Chat Group
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Group Name</label>
              <Input
                placeholder="e.g. Design System Team"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="text-xs h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                autoFocus
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Add Initial Members</label>
              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50/50 dark:bg-zinc-900/40">
                {USERS.map((user) => {
                  const isSelected = selectedMemberIds.includes(user.userId);
                  return (
                    <div
                      key={user.userId}
                      onClick={() =>
                        setSelectedMemberIds((prev) =>
                          prev.includes(user.userId) ? prev.filter((id) => id !== user.userId) : [...prev, user.userId]
                        )
                      }
                      className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.photoUrl} alt={user.fullName} />
                          <AvatarFallback className="text-[10px]">{user.fullName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{user.fullName}</span>
                      </div>
                      {isSelected && <UserCheck size={14} className="text-teal-600 dark:text-teal-400" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateGroupOpen(false)} className="text-xs font-medium cursor-pointer">
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
              className="text-xs font-medium bg-teal-700 hover:bg-teal-800 text-white cursor-pointer"
            >
              Create Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FORWARD MESSAGE DIALOG */}
      <Dialog open={isForwardOpen} onOpenChange={setIsForwardOpen}>
        <DialogContent className="sm:max-w-[400px] p-5 space-y-3">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold flex items-center gap-2">
              <Forward size={16} className="text-teal-600" /> Forward Message
            </DialogTitle>
          </DialogHeader>

          {forwardingMessage && (
            <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-lg text-xs italic text-zinc-600 dark:text-zinc-400 border-l-2 border-teal-600 truncate">
              &quot;{forwardingMessage.text || 'Attachment/Audio'}&quot;
            </div>
          )}

          <div className="space-y-1.5 my-2 max-h-56 overflow-y-auto custom-scrollbar">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block px-1">Select Target</span>
            {chatTargetsList.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleForwardToTarget(item.id)}
                className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{item.name}</span>
                </div>
                <Forward size={13} className="text-zinc-400" />
              </button>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" size="sm" onClick={() => setIsForwardOpen(false)} className="text-xs font-medium cursor-pointer">
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
