'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChatAttachment,
  ChatAudioMessage,
  ChatMessage,
  ChatTarget,
} from './types/chat.types';
import { USER_TYPE } from './types/user.types';
import USERS from './users.json';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  X,
  Minus,
  Maximize2,
  Send,
  UserPlus,
  Users,
  Check,
  Reply,
  Forward,
  Paperclip,
  Mic,
  Play,
  Pause,
  Plus,
  Search,
  UserCheck,
  Smile,
  FileText,
  ExternalLink,
} from 'lucide-react';
import './style.css';

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

const renderMessageTextWithLinksAndMentions = (text: string) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  const mentionRegex = /(@[A-Za-z0-9_.\s]+?(?=\s|$|[^A-Za-z0-9_.]))/g;

  const urlParts = text.split(urlRegex);

  return (
    <span>
      {urlParts.map((urlPart, idx) => {
        if (urlPart.match(urlRegex)) {
          const href = urlPart.startsWith('http') ? urlPart : `https://${urlPart}`;
          return (
            <a
              key={`link-${idx}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 underline font-semibold text-teal-200 dark:text-teal-400 hover:text-white dark:hover:text-teal-200 break-all px-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              {urlPart}
              <ExternalLink size={10} className="inline shrink-0" />
            </a>
          );
        }

        const mentionParts = urlPart.split(mentionRegex);
        return mentionParts.map((part, mIdx) => {
          if (part.startsWith('@')) {
            return (
              <span
                key={`mention-${idx}-${mIdx}`}
                className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80"
              >
                {part}
              </span>
            );
          }
          return part;
        });
      })}
    </span>
  );
};

export interface SingleChatBoxProps {
  target: ChatTarget;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onClose: () => void;
  currentUser: USER_TYPE;
  messagesMap: Record<string | number, ChatMessage[]>;
  onSendMessage: (
    targetId: string | number,
    text: string,
    replyTo?: ChatMessage | null,
    attachments?: ChatAttachment[],
    audio?: ChatAudioMessage
  ) => void;
  onAddReaction: (targetId: string | number, msgId: string, emoji: string) => void;
  onForwardMessage: (msg: ChatMessage) => void;
  onAddMemberToGroup: (user: USER_TYPE) => void;
  onUpdateGroupName: (newName: string) => void;
}

export function SingleChatBox({
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
}: SingleChatBoxProps) {
  const [newMessageText, setNewMessageText] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [isEditingGroupName, setIsEditingGroupName] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [addMemberSearch, setAddMemberSearch] = useState('');

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

  const isMobile = useIsMobile();

  // Mobile View Minimized Bubble State
  if (isMinimized && isMobile) {
    return (
      <div
        onClick={onToggleMinimize}
        title={target.name}
        className="relative group cursor-pointer flex items-center justify-center p-0.5 rounded-full bg-zinc-900 text-white border-2 border-teal-600 shadow-xl transition-all hover:scale-110 mb-1 shrink-0 select-none"
      >
        <div className="relative">
          {target.type === 'user' ? (
            <Avatar className="h-8 w-8 border border-zinc-700">
              <AvatarImage src={target.avatar || ''} alt={target.name} />
              <AvatarFallback className="text-[10px] bg-zinc-800 text-white font-bold">{target.name[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-8 w-8 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
              <Users size={14} />
            </div>
          )}
          {target.type === 'user' && target.online && (
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-zinc-900" />
          )}
        </div>

        <div className="absolute inset-0 rounded-full bg-zinc-950/85 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-0.5 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize();
            }}
            className="p-0.5 text-teal-400 hover:text-teal-200 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            title="Maximize Chat Window"
          >
            <Maximize2 size={11} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-0.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            title="Close Chat"
          >
            <X size={11} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-72 sm:w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-t-xl shadow-2xl flex flex-col transition-all duration-200 shrink-0 ${isMinimized ? 'h-11 overflow-hidden' : 'h-[440px]'
        }`}
    >
      {/* Header */}
      <div
        onClick={onToggleMinimize}
        className="h-11 px-3 bg-zinc-900 text-white rounded-t-xl flex items-center justify-between shrink-0 select-none cursor-pointer hover:bg-zinc-850 transition-colors"
      >
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
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                  onClick={(e) => {
                    e.stopPropagation();
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
                onClick={(e) => {
                  if (target.type === 'group') {
                    e.stopPropagation();
                    setGroupNameInput(target.name);
                    setIsEditingGroupName(true);
                  }
                }}
                className={`text-xs font-semibold text-zinc-100 truncate ${target.type === 'group' ? 'cursor-pointer hover:text-teal-300' : ''
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
              onClick={(e) => {
                e.stopPropagation();
                setIsAddMemberOpen(true);
              }}
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
            >
              <UserPlus size={13} />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMinimize();
            }}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minus size={13} />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Messages Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-2.5 space-y-3 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs fcw-scrollbar">
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
                    className={`absolute -top-4 opacity-0 group-hover/msg:opacity-100 transition-opacity bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-1.5 py-0.5 shadow-md flex items-center gap-1 z-20 ${isSelf ? 'right-2' : 'left-6'
                      }`}
                  >
                    <Popover>
                      <PopoverTrigger
                        type="button"
                        className="p-0.5 text-zinc-500 hover:text-amber-500 cursor-pointer rounded"
                        title="Add Reaction"
                      >
                        <Smile size={11} />
                      </PopoverTrigger>
                      <PopoverContent className="p-1 flex items-center gap-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-full z-50">
                        {REACTION_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => onAddReaction(targetId, msg.id, emoji)}
                            className="text-xs p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-transform hover:scale-125 cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>

                    <button
                      type="button"
                      onClick={() => setReplyingTo(msg)}
                      className="p-0.5 text-zinc-500 hover:text-teal-600 cursor-pointer"
                      title="Reply"
                    >
                      <Reply size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onForwardMessage(msg)}
                      className="p-0.5 text-zinc-500 hover:text-teal-600 cursor-pointer"
                      title="Forward"
                    >
                      <Forward size={11} />
                    </button>
                  </div>

                  <div className={`max-w-[85%] space-y-0.5 ${isSelf ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-2 rounded-xl text-xs leading-relaxed font-normal break-words shadow-2xs relative ${msg.reactions && msg.reactions.length > 0 ? 'mb-2' : ''
                        } ${isSelf
                          ? 'bg-teal-700 text-white rounded-br-none'
                          : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 rounded-bl-none'
                        }`}
                    >
                      {msg.replyTo && (
                        <div
                          className={`mb-1 p-1 rounded border-l-2 text-[10px] ${isSelf ? 'bg-teal-800/80 border-white/60 text-teal-100' : 'bg-zinc-100 dark:bg-zinc-900 border-teal-600'
                            }`}
                        >
                          <span className="font-semibold block">{msg.replyTo.senderName}</span>
                          <span className="truncate block opacity-90">{msg.replyTo.text}</span>
                        </div>
                      )}

                      {msg.isForwarded && (
                        <div className="text-[9px] italic opacity-80 mb-0.5 flex items-center gap-1">
                          <Forward size={9} /> Forwarded
                        </div>
                      )}

                      {/* Attachments rendering */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="space-y-1.5 mb-1">
                          {msg.attachments.map((att) => (
                            <div key={att.id}>
                              {att.type === 'image' || att.url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i) ? (
                                <div className="relative group/att overflow-hidden rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 max-w-[200px]">
                                  <img src={att.url} alt={att.name} className="w-full h-auto object-cover max-h-40 rounded-lg" />
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute bottom-1 right-1 p-1 rounded-full bg-zinc-900/80 text-white opacity-0 group-hover/att:opacity-100 transition-opacity hover:bg-zinc-900"
                                    title="Open Image"
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              ) : (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] transition-colors ${isSelf
                                    ? 'bg-teal-800/60 border-teal-600/60 text-white hover:bg-teal-800'
                                    : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                  <FileText size={14} className="shrink-0 text-teal-400" />
                                  <div className="min-w-0 flex-1 truncate">
                                    <span className="font-semibold block truncate">{att.name}</span>
                                    {att.size && <span className="text-[9px] opacity-75">{att.size}</span>}
                                  </div>
                                  <ExternalLink size={12} className="shrink-0 opacity-75" />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.audio ? (
                        <div className="flex items-center gap-2 py-0.5 min-w-[140px]">
                          <button
                            type="button"
                            onClick={() => togglePlayVoiceMessage(msg)}
                            className={`p-1.5 rounded-full cursor-pointer ${isSelf ? 'bg-white text-teal-700' : 'bg-teal-600 text-white'
                              }`}
                          >
                            {isAudioPlaying ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                          <span className="text-[10px] font-mono">0:0{currentPlayedSecs} / {msg.audio.duration}</span>
                        </div>
                      ) : (
                        renderMessageTextWithLinksAndMentions(msg.text)
                      )}

                      {/* Reactions Overlay Pill */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div
                          className={`absolute -bottom-2.5 ${isSelf ? 'left-2' : 'right-2'
                            } flex items-center gap-0.5 z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-full px-1.5 py-0.5 shadow-md`}
                        >
                          {msg.reactions.map((reaction, rIdx) => {
                            const hasUserReacted = reaction.users.includes(currentUser.fullName);
                            return (
                              <button
                                key={rIdx}
                                type="button"
                                onClick={() => onAddReaction(targetId, msg.id, reaction.emoji)}
                                className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-0.5 transition-transform hover:scale-125 cursor-pointer ${hasUserReacted ? 'text-amber-500 font-extrabold' : 'text-zinc-700 dark:text-zinc-300'
                                  }`}
                                title={reaction.users.join(', ')}
                              >
                                <span>{reaction.emoji}</span>
                                {reaction.count > 1 && <span className="text-[9px] font-semibold">{reaction.count}</span>}
                              </button>
                            );
                          })}
                        </div>
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

          {/* Pending attachments preview */}
          {pendingAttachments.length > 0 && (
            <div className="px-2 py-1 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto">
              {pendingAttachments.map((att) => (
                <div key={att.id} className="relative group shrink-0">
                  {att.type === 'image' ? (
                    <img src={att.url} alt={att.name} className="w-10 h-10 object-cover rounded border" />
                  ) : (
                    <div className="w-10 h-10 rounded border bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[9px] font-semibold p-1 truncate">
                      {att.name.slice(-4)}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPendingAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                    className="absolute -top-1 -right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Reply Banner */}
          {replyingTo && (
            <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs shrink-0">
              <div className="truncate pr-2 border-l-2 border-teal-600 pl-2">
                <span className="font-semibold block text-[10px] text-teal-600 dark:text-teal-400">
                  Replying to {replyingTo.sender.fullName}
                </span>
                <span className="text-[11px] truncate block text-zinc-600 dark:text-zinc-400">{replyingTo.text}</span>
              </div>
              <button
                type="button"
                onClick={() => setReplyingTo(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          />

          {/* Footer Input */}
          <div className="p-2 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col gap-1.5 shrink-0">
            {isRecording ? (
              <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg px-3 py-1.5 text-xs">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  <span className="font-semibold">Recording Voice: 0:0{recordingSeconds}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => setIsRecording(false)}
                    className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-[10px] h-6 px-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="xs"
                    onClick={handleStopAndSendVoice}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] h-6 px-2"
                  >
                    Send Voice
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-full text-zinc-500 hover:text-teal-600 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
                  title="Attach Files"
                >
                  <Paperclip size={15} />
                </button>

                <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                  <PopoverTrigger
                    type="button"
                    className="p-1.5 rounded-full text-zinc-500 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
                    title="Insert Emoji"
                  >
                    <Smile size={15} />
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-2 grid grid-cols-5 gap-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl rounded-xl z-50">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          setNewMessageText((prev) => prev + emoji);
                          setIsEmojiOpen(false);
                        }}
                        className="text-base p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-transform hover:scale-125 cursor-pointer text-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                <Input
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={`Message ${target.name}...`}
                  className="flex-1 h-8 text-xs bg-zinc-100 dark:bg-zinc-900 border-none focus-visible:ring-1 focus-visible:ring-teal-600"
                />

                {!newMessageText.trim() && pendingAttachments.length === 0 ? (
                  <button
                    type="button"
                    onClick={() => setIsRecording(true)}
                    className="p-1.5 rounded-full text-zinc-500 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer shrink-0"
                    title="Record Voice Message"
                  >
                    <Mic size={15} />
                  </button>
                ) : (
                  <Button
                    size="icon"
                    onClick={() => handleSend()}
                    className="h-8 w-8 bg-teal-600 hover:bg-teal-700 text-white rounded-full shrink-0 cursor-pointer"
                  >
                    <Send size={13} />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Add Group Member Dialog */}
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-sm font-bold flex items-center gap-2">
                  <UserPlus size={16} className="text-teal-600" />
                  Add Member to {target.name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 py-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-400" />
                  <Input
                    placeholder="Search users..."
                    value={addMemberSearch}
                    onChange={(e) => setAddMemberSearch(e.target.value)}
                    className="pl-8 h-8 text-xs bg-zinc-100 dark:bg-zinc-900"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 fcw-scrollbar">
                  {USERS.filter((u) => u.fullName.toLowerCase().includes(addMemberSearch.toLowerCase())).map((user) => {
                    const isAlreadyMember = target.members?.some((m) => m.userId === user.userId);
                    return (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.photoUrl || ''} />
                            <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{user.fullName}</span>
                        </div>

                        {isAlreadyMember ? (
                          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                            <UserCheck size={12} /> Member
                          </span>
                        ) : (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              onAddMemberToGroup(user as unknown as USER_TYPE);
                              setIsAddMemberOpen(false);
                            }}
                            className="h-6 text-[10px] px-2 text-teal-600 border-teal-600 hover:bg-teal-50"
                          >
                            <Plus size={10} className="mr-1" /> Add
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}
