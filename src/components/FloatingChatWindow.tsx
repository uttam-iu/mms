'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from '@/context/AppContext';
import { ChatAttachment, ChatAudioMessage, ChatMessage, ChatMessageReaction, ChatTarget } from '@/types/chat.types';
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
    AtSign,
    Plus,
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

export default function FloatingChatWindow() {
    const ctx = useAppState();
    const target = ctx?.state?.activeChatTarget;
    const isOpen = ctx?.state?.isChatOpen;

    const [isMinimized, setIsMinimized] = useState(false);
    const [newMessageText, setNewMessageText] = useState('');
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);

    // Group Title Edit State
    const [isEditingGroupName, setIsEditingGroupName] = useState(false);
    const [groupNameInput, setGroupNameInput] = useState('');

    // Popovers & Dialogs
    const [isEmojiOpen, setIsEmojiOpen] = useState(false);
    const [isMentionOpen, setIsMentionOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [isForwardOpen, setIsForwardOpen] = useState(false);
    const [forwardingMessage, setForwardingMessage] = useState<ChatMessage | null>(null);

    // Attachments & Voice Recording
    const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);

    // Audio Playback & Live Second Counter State
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const [audioCurrentSeconds, setAudioCurrentSeconds] = useState<Record<string, number>>({});
    const audioCleanupRef = useRef<(() => void) | null>(null);

    // Dummy messages history keyed by target ID
    const [messagesMap, setMessagesMap] = useState<Record<string | number, ChatMessage[]>>({
        1: [
            { id: 'm1', sender: USERS[0], text: 'Hey there! How is the project going?', timestamp: '10:30 AM' },
            { id: 'm2', sender: { userId: 99, userName: 'me', fullName: 'You', photoUrl: '' }, text: 'Making great progress! Updated the board tasks.', timestamp: '10:32 AM' },
        ],
        'g-1': [
            { id: 'mg1', sender: USERS[0], text: 'Welcome to @Assaduzzaman Sagor and @Shibly Mustafiz in the Frontend Team!', timestamp: '09:15 AM' },
            { id: 'mg2', sender: USERS[1], text: 'Thanks Uttam! Ready for the sprint.', timestamp: '09:20 AM' },
        ]
    });

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const currentUser: USER_TYPE = ctx?.state?.user || {
        userId: 1,
        userName: 'uttam@k.com',
        fullName: 'Uttam Kumar',
        photoUrl: 'https://github.com/shadcn.png'
    };

    // Live Voice Recording Timer
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

    // Voice Message Playback & Live Second Counter Engine
    const togglePlayVoiceMessage = (msg: ChatMessage) => {
        if (!msg.audio) return;
        const msgId = msg.id;

        if (playingAudioId === msgId) {
            // Stop playback
            if (audioCleanupRef.current) audioCleanupRef.current();
            setPlayingAudioId(null);
            return;
        }

        // Stop any currently playing audio
        if (audioCleanupRef.current) audioCleanupRef.current();

        const totalSecs = parseDurationToSeconds(msg.audio.duration);
        setPlayingAudioId(msgId);
        setAudioCurrentSeconds((prev) => ({ ...prev, [msgId]: 0 }));

        // Play synthetic melody audio via Web Audio API while counting seconds
        try {
            const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioCtx) {
                const audioCtx = new AudioCtx();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(350, audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(700, audioCtx.currentTime + totalSecs);
                gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + totalSecs);

                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start();
                osc.stop(audioCtx.currentTime + totalSecs);
            }
        } catch (e) {
            console.log('Audio playback tone initiated');
        }

        // Increment current playback seconds timer
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

    useEffect(() => {
        if (isOpen && !isMinimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messagesMap, target, isOpen, isMinimized]);

    if (!isOpen || !target) return null;

    const targetId = target.id;
    const currentMessages = messagesMap[targetId] || [
        {
            id: `init-${targetId}`,
            sender: target.type === 'user' ? (USERS.find((u) => u.userId.toString() === targetId.toString()) || USERS[0]) : USERS[0],
            text: `Started conversation with ${target.name}. Say hello! 👋`,
            timestamp: 'Just now'
        }
    ];

    // Group Title Edit Handlers
    const handleSaveGroupName = () => {
        const trimmed = groupNameInput.trim();
        if (trimmed && target.type === 'group' && ctx?.updateActiveChatTarget) {
            ctx.updateActiveChatTarget({
                ...target,
                name: trimmed
            });
        }
        setIsEditingGroupName(false);
    };

    // Send Message Handler
    const handleSendMessage = (audioMessage?: ChatAudioMessage) => {
        if (!newMessageText.trim() && pendingAttachments.length === 0 && !audioMessage) return;

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: currentUser,
            text: newMessageText.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            replyTo: replyingTo ? {
                id: replyingTo.id,
                senderName: replyingTo.sender.fullName,
                text: replyingTo.text || (replyingTo.audio ? '🎤 Voice message' : 'File attachment')
            } : undefined,
            attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
            audio: audioMessage,
        };

        const updated = [...currentMessages, newMsg];
        setMessagesMap((prev) => ({
            ...prev,
            [targetId]: updated
        }));

        if (ctx?.updateActiveChatTarget) {
            const previewText = audioMessage ? '🎤 Voice message' : (newMessageText.trim() || `${pendingAttachments.length} Attachment(s)`);
            ctx.updateActiveChatTarget({
                ...target,
                lastMessage: `${currentUser.fullName.split(' ')[0]}: ${previewText}`,
                lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }

        setNewMessageText('');
        setReplyingTo(null);
        setPendingAttachments([]);
    };

    // Send Voice Recording Handler
    const handleStopAndSendVoiceMessage = () => {
        setIsRecording(false);
        const mins = Math.floor(recordingSeconds / 60);
        const secs = recordingSeconds % 60;
        const durationStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        handleSendMessage({
            duration: durationStr || '0:05'
        });
    };

    // Forward Handler
    const handleForwardToTarget = (destTarget: ChatTarget | { id: number; name: string }) => {
        if (!forwardingMessage) return;

        const destId = destTarget.id;
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
            [destId]: [...(prev[destId] || []), forwardedMsg]
        }));

        setIsForwardOpen(false);
        setForwardingMessage(null);
    };

    // Reaction Handler
    const handleAddReaction = (msgId: string, emoji: string) => {
        const updatedMsgs = currentMessages.map((msg) => {
            if (msg.id !== msgId) return msg;
            const existingReactions = msg.reactions || [];
            const idx = existingReactions.findIndex((r) => r.emoji === emoji);

            let newReactions: ChatMessageReaction[] = [];
            if (idx > -1) {
                newReactions = existingReactions.map((r, i) =>
                    i === idx ? { ...r, count: r.count + 1 } : r
                );
            } else {
                newReactions = [...existingReactions, { emoji, count: 1, users: [currentUser.fullName] }];
            }

            return {
                ...msg,
                reactions: newReactions
            };
        });

        setMessagesMap((prev) => ({
            ...prev,
            [targetId]: updatedMsgs
        }));
    };

    // File Upload Handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newAtts: ChatAttachment[] = Array.from(files).map((file, idx) => ({
            id: `chat-att-${Date.now()}-${idx}`,
            name: file.name,
            url: URL.createObjectURL(file),
            type: file.type.startsWith('image/') ? 'image' : 'file',
            size: `${Math.round(file.size / 1024)} KB`
        }));

        setPendingAttachments((prev) => [...prev, ...newAtts]);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleInsertEmoji = (emoji: string) => {
        setNewMessageText((prev) => prev + emoji);
    };

    const handleInsertMention = (user: USER_TYPE) => {
        setNewMessageText((prev) => {
            if (prev.endsWith('@')) return prev.slice(0, -1) + `@${user.fullName} `;
            return prev + `@${user.fullName} `;
        });
    };

    const handleAddMemberToGroup = (userToAdd: USER_TYPE) => {
        if (target.type !== 'group') return;
        const currentMembers = target.members || [];
        if (currentMembers.some((m) => m.userId === userToAdd.userId)) return;

        const updatedMembers = [...currentMembers, userToAdd];
        const updatedTarget: ChatTarget = {
            ...target,
            members: updatedMembers
        };

        ctx?.updateActiveChatTarget(updatedTarget);

        const systemMsg: ChatMessage = {
            id: `sys-${Date.now()}`,
            sender: currentUser,
            text: `Added @${userToAdd.fullName} to the group.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessagesMap((prev) => ({
            ...prev,
            [targetId]: [...(prev[targetId] || []), systemMsg]
        }));
    };

    return (
        <>
            <div className={`fixed bottom-0 right-4 sm:right-6 z-50 w-80 sm:w-96 shadow-2xl rounded-t-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-200 ${isMinimized ? 'h-12 overflow-hidden' : 'h-[450px]'}`}>
                {/* Chat Window Header */}
                <div className="h-12 px-3.5 bg-zinc-900 dark:bg-zinc-900 text-white rounded-t-xl flex items-center justify-between shrink-0 select-none">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                        <div className="relative shrink-0">
                            {target.type === 'user' ? (
                                <Avatar className="h-7 w-7 border border-zinc-700">
                                    <AvatarImage src={target.avatar || ''} alt={target.name} />
                                    <AvatarFallback className="text-xs bg-zinc-800 text-white">{target.name[0]}</AvatarFallback>
                                </Avatar>
                            ) : (
                                <div className="h-7 w-7 rounded-full bg-teal-600 flex items-center justify-center text-white">
                                    <Users size={14} />
                                </div>
                            )}
                            {target.type === 'user' && target.online && (
                                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-zinc-900" />
                            )}
                        </div>

                        {/* Editable Title or Static Title */}
                        <div className="min-w-0 flex-1">
                            {isEditingGroupName && target.type === 'group' ? (
                                <div className="flex items-center gap-1">
                                    <Input
                                        value={groupNameInput}
                                        onChange={(e) => setGroupNameInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveGroupName();
                                            if (e.key === 'Escape') setIsEditingGroupName(false);
                                        }}
                                        className="h-6 text-xs px-1.5 bg-zinc-800 border-zinc-700 text-white"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleSaveGroupName}
                                        className="p-1 text-emerald-400 hover:text-emerald-300"
                                    >
                                        <Check size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 group/title">
                                    <h4
                                        onClick={() => {
                                            if (target.type === 'group') {
                                                setGroupNameInput(target.name);
                                                setIsEditingGroupName(true);
                                            }
                                        }}
                                        className={`text-xs font-semibold text-zinc-100 truncate leading-tight ${target.type === 'group' ? 'cursor-pointer hover:text-teal-300' : ''}`}
                                        title={target.type === 'group' ? 'Click to edit group name' : target.name}
                                    >
                                        {target.name}
                                    </h4>
                                    {target.type === 'group' && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setGroupNameInput(target.name);
                                                setIsEditingGroupName(true);
                                            }}
                                            className="opacity-0 group-hover/title:opacity-100 text-zinc-400 hover:text-white p-0.5 rounded transition-opacity cursor-pointer"
                                            title="Edit group name"
                                        >
                                            <Pencil size={11} />
                                        </button>
                                    )}
                                </div>
                            )}
                            <p className="text-[10px] text-zinc-400 truncate">
                                {target.type === 'user'
                                    ? (target.online ? 'Online' : 'Offline')
                                    : `${target.members?.length || 0} members`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {target.type === 'group' && !isMinimized && (
                            <button
                                type="button"
                                onClick={() => setIsAddMemberOpen(true)}
                                className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                                title="Add members to group"
                            >
                                <UserPlus size={14} />
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsMinimized((prev) => !prev)}
                            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                            title={isMinimized ? 'Expand chat' : 'Minimize chat'}
                        >
                            {isMinimized ? <Maximize2 size={14} /> : <Minus size={14} />}
                        </button>
                        <button
                            type="button"
                            onClick={() => ctx?.closeChat()}
                            className="p-1.5 rounded text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors cursor-pointer"
                            title="Close chat"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* Messages Body (When expanded with INVISIBLE SCROLLBAR) */}
                {!isMinimized && (
                    <>
                        <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-zinc-50/50 dark:bg-zinc-900/40 text-xs [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-4">
                            {currentMessages.map((msg) => {
                                const isSelf = msg.sender.userId === currentUser.userId || msg.sender.fullName === 'You';
                                const isAudioPlaying = playingAudioId === msg.id;
                                const currentPlayedSecs = audioCurrentSeconds[msg.id] || 0;

                                return (
                                    <div
                                        key={msg.id}
                                        className={`group/msg relative flex items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`}
                                    >
                                        {!isSelf && (
                                            <Avatar className="h-6 w-6 shrink-0 mb-0.5">
                                                <AvatarImage src={msg.sender.photoUrl || ''} alt={msg.sender.fullName} />
                                                <AvatarFallback className="text-[10px]">{msg.sender.fullName?.[0] || 'U'}</AvatarFallback>
                                            </Avatar>
                                        )}

                                        {/* Hover Action Bar - Positioned slightly lower directly above message bubble */}
                                        <div className={`absolute -top-4.5 opacity-0 group-hover/msg:opacity-100 transition-opacity bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full px-1.5 py-0.5 shadow-md flex items-center gap-0.5 z-20 ${
                                            isSelf ? 'right-2' : 'left-8'
                                        }`}>
                                            <button
                                                type="button"
                                                onClick={() => setReplyingTo(msg)}
                                                className="p-1 text-zinc-500 hover:text-teal-600 rounded-full cursor-pointer transition-colors"
                                                title="Reply"
                                            >
                                                <Reply size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setForwardingMessage(msg);
                                                    setIsForwardOpen(true);
                                                }}
                                                className="p-1 text-zinc-500 hover:text-teal-600 rounded-full cursor-pointer transition-colors"
                                                title="Forward"
                                            >
                                                <Forward size={12} />
                                            </button>

                                            <Popover>
                                                <PopoverTrigger
                                                    render={
                                                        <button
                                                            type="button"
                                                            className="p-1 text-zinc-500 hover:text-amber-500 rounded-full cursor-pointer transition-colors"
                                                            title="React"
                                                        >
                                                            <Smile size={12} />
                                                        </button>
                                                    }
                                                />
                                                <PopoverContent align="center" className="w-auto p-1 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg">
                                                    <div className="flex items-center gap-1">
                                                        {REACTION_EMOJIS.map((re, reIdx) => (
                                                            <button
                                                                key={reIdx}
                                                                type="button"
                                                                onClick={() => handleAddReaction(msg.id, re)}
                                                                className="p-1 text-base hover:scale-125 transition-transform cursor-pointer"
                                                            >
                                                                {re}
                                                            </button>
                                                        ))}

                                                        {/* Plus button to open full emoji list */}
                                                        <Popover>
                                                            <PopoverTrigger
                                                                render={
                                                                    <button
                                                                        type="button"
                                                                        className="p-1 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                                                                        title="More emojis"
                                                                    >
                                                                        <Plus size={13} />
                                                                    </button>
                                                                }
                                                            />
                                                            <PopoverContent align="end" className="w-56 p-2 shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl">
                                                                <div className="grid grid-cols-5 gap-1 max-h-40 overflow-y-auto custom-scrollbar">
                                                                    {EMOJI_LIST.map((emoji, idx) => (
                                                                        <button
                                                                            key={idx}
                                                                            type="button"
                                                                            onClick={() => handleAddReaction(msg.id, emoji)}
                                                                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-base flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
                                                                        >
                                                                            {emoji}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        </div>

                                        <div className={`max-w-[80%] space-y-0.5 ${isSelf ? 'items-end' : 'items-start'}`}>
                                            {/* Group Sender Label */}
                                            {!isSelf && target.type === 'group' && (
                                                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 px-1 block">
                                                    {msg.sender.fullName}
                                                </span>
                                            )}

                                            {/* Forwarded Tag */}
                                            {msg.isForwarded && (
                                                <span className="text-[9px] font-semibold text-zinc-400 italic flex items-center gap-1 px-1">
                                                    <Forward size={10} /> Forwarded
                                                </span>
                                            )}

                                            {/* Message Bubble Container */}
                                            <div
                                                className={`p-2.5 rounded-2xl text-xs leading-relaxed font-normal break-words shadow-xs relative ${
                                                    isSelf
                                                        ? 'bg-teal-700 text-white rounded-br-none'
                                                        : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/80 dark:border-zinc-700/80 rounded-bl-none'
                                                }`}
                                            >
                                                {/* Quoted Reply Banner inside Bubble */}
                                                {msg.replyTo && (
                                                    <div className={`mb-1.5 p-1.5 rounded-lg border-l-2 text-[11px] ${
                                                        isSelf
                                                            ? 'bg-teal-800/80 border-white/60 text-teal-100'
                                                            : 'bg-zinc-100 dark:bg-zinc-900 border-teal-600 text-zinc-600 dark:text-zinc-400'
                                                    }`}>
                                                        <span className="font-semibold block">{msg.replyTo.senderName}</span>
                                                        <span className="truncate block opacity-90">{msg.replyTo.text}</span>
                                                    </div>
                                                )}

                                                {/* Voice Message Listenable Audio Player with Live Second Counter */}
                                                {msg.audio ? (
                                                    <div className="flex items-center gap-3 py-1 px-0.5 min-w-[170px]">
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePlayVoiceMessage(msg)}
                                                            className={`p-2 rounded-full cursor-pointer transition-transform hover:scale-110 shadow-xs ${
                                                                isSelf ? 'bg-white text-teal-700' : 'bg-teal-600 text-white'
                                                            }`}
                                                            title={isAudioPlaying ? 'Pause audio' : 'Play audio voice message'}
                                                        >
                                                            {isAudioPlaying ? <Pause size={14} /> : <Play size={14} />}
                                                        </button>

                                                        <div className="flex-1 space-y-1">
                                                            {/* Audio Waveform Equalizer */}
                                                            <div className="flex items-center gap-1">
                                                                <span className={`h-2 w-1 rounded-full ${isAudioPlaying ? 'bg-amber-400 animate-pulse' : 'bg-current opacity-50'}`} />
                                                                <span className={`h-4 w-1 rounded-full ${isAudioPlaying ? 'bg-amber-300 animate-bounce' : 'bg-current opacity-70'}`} />
                                                                <span className={`h-3 w-1 rounded-full ${isAudioPlaying ? 'bg-amber-400 animate-pulse' : 'bg-current opacity-50'}`} />
                                                                <span className={`h-5 w-1 rounded-full ${isAudioPlaying ? 'bg-amber-300 animate-bounce' : 'bg-current opacity-80'}`} />
                                                                <span className={`h-2.5 w-1 rounded-full ${isAudioPlaying ? 'bg-amber-400 animate-pulse' : 'bg-current opacity-50'}`} />
                                                                <span className={`h-4 w-1 rounded-full ${isAudioPlaying ? 'bg-amber-300 animate-bounce' : 'bg-current opacity-60'}`} />
                                                            </div>
                                                            {/* Counting Seconds Progress */}
                                                            <div className="flex items-center justify-between text-[10px] opacity-90 font-mono font-semibold">
                                                                <span>0:0{currentPlayedSecs}</span>
                                                                <span>/ {msg.audio.duration}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    renderMessageTextWithMentions(msg.text)
                                                )}

                                                {/* Attachments inside Bubble */}
                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="mt-2 space-y-1.5">
                                                        {msg.attachments.map((att) => (
                                                            <div key={att.id} className="rounded-lg overflow-hidden border border-black/10">
                                                                {att.type === 'image' ? (
                                                                    /* eslint-disable-next-html-element-suppression */
                                                                    <img src={att.url} alt={att.name} className="max-h-36 w-full object-cover rounded-lg" />
                                                                ) : (
                                                                    <a
                                                                        href={att.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 p-2 bg-black/10 rounded-lg hover:bg-black/20 text-current transition-colors"
                                                                    >
                                                                        <FileText size={16} />
                                                                        <span className="truncate text-xs">{att.name}</span>
                                                                        <ExternalLink size={12} className="ml-auto" />
                                                                    </a>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Reactions Display - Positioned slightly elevated right above/overlapping message bubble corner */}
                                            {msg.reactions && msg.reactions.length > 0 && (
                                                <div className={`-mt-2 z-10 flex flex-wrap gap-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                                    {msg.reactions.map((r, rIdx) => (
                                                        <span
                                                            key={rIdx}
                                                            onClick={() => handleAddReaction(msg.id, r.emoji)}
                                                            className="inline-flex items-center gap-0.5 text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700/90 px-1.5 py-0.5 rounded-full shadow-xs cursor-pointer transition-transform hover:scale-110 select-none"
                                                            title={r.users ? `Reacted by ${r.users.join(', ')}` : 'Reaction'}
                                                        >
                                                            <span>{r.emoji}</span>
                                                            <span className="font-semibold text-zinc-600 dark:text-zinc-400">{r.count}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <span className={`text-[9px] text-zinc-400 block px-1 ${isSelf ? 'text-right' : 'text-left'}`}>
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Reply Banner Above Input */}
                        {replyingTo && (
                            <div className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1.5 min-w-0 border-l-2 border-teal-600 pl-2">
                                    <Reply size={13} className="text-teal-600 shrink-0" />
                                    <div className="truncate">
                                        <span className="font-semibold block text-zinc-800 dark:text-zinc-200">
                                            Replying to {replyingTo.sender.fullName}
                                        </span>
                                        <span className="text-[10px] text-zinc-500 truncate block">
                                            {replyingTo.text || 'Attachment/Audio message'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setReplyingTo(null)}
                                    className="p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        )}

                        {/* Pending Attachments Preview Tag List */}
                        {pendingAttachments.length > 0 && (
                            <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                                {pendingAttachments.map((att) => (
                                    <div
                                        key={att.id}
                                        className="flex items-center gap-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-1 rounded-md text-[11px]"
                                    >
                                        <FileText size={13} className="text-teal-600" />
                                        <span className="truncate max-w-[100px]">{att.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => setPendingAttachments((prev) => prev.filter((a) => a.id !== att.id))}
                                            className="text-zinc-400 hover:text-rose-500"
                                        >
                                            <X size={11} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Voice Recording Live Bar */}
                        {isRecording ? (
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold animate-pulse">
                                    <Mic size={16} />
                                    <span>Recording Voice Message... ({recordingSeconds}s)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setIsRecording(false)}
                                        className="h-7 text-xs border-rose-300 text-rose-600"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={handleStopAndSendVoiceMessage}
                                        className="h-7 text-xs bg-rose-600 text-white"
                                    >
                                        Send Audio
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* Input Footer */
                            <div className="p-2.5 bg-white dark:bg-zinc-950 border-t border-zinc-200/80 dark:border-zinc-800 space-y-2">
                                <Textarea
                                    placeholder={
                                        target.type === 'group'
                                            ? `Message ${target.name}... (Type @ to mention member)`
                                            : `Message ${target.name}...`
                                    }
                                    value={newMessageText}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setNewMessageText(val);
                                        if (val.endsWith('@') && target.type === 'group') {
                                            setIsMentionOpen(true);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    className="min-h-[42px] max-h-24 text-xs resize-none bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        {/* File Attachment Button */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileUpload}
                                            multiple
                                            className="hidden"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-7 px-2 text-zinc-500 hover:text-teal-600 cursor-pointer"
                                            title="Attach file"
                                        >
                                            <Paperclip size={15} />
                                        </Button>

                                        {/* Voice Recording Button */}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setIsRecording(true)}
                                            className="h-7 px-2 text-zinc-500 hover:text-rose-500 cursor-pointer"
                                            title="Record voice message"
                                        >
                                            <Mic size={15} />
                                        </Button>

                                        {/* Group Mention Popover */}
                                        {target.type === 'group' && target.members && (
                                            <Popover open={isMentionOpen} onOpenChange={setIsMentionOpen}>
                                                <PopoverTrigger
                                                    render={
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-zinc-500 hover:text-blue-500 cursor-pointer"
                                                            title="Mention member"
                                                        >
                                                            <AtSign size={15} />
                                                        </Button>
                                                    }
                                                />
                                                <PopoverContent align="start" className="w-52 p-1.5 shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl">
                                                    <div className="px-2 py-1 text-[11px] font-semibold text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                                                        Mention Group Member
                                                    </div>
                                                    <div className="max-h-40 overflow-y-auto space-y-0.5 custom-scrollbar">
                                                        {target.members.map((member) => (
                                                            <button
                                                                key={member.userId}
                                                                type="button"
                                                                onClick={() => {
                                                                    handleInsertMention(member);
                                                                    setIsMentionOpen(false);
                                                                }}
                                                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 text-left transition-colors cursor-pointer"
                                                            >
                                                                <Avatar className="w-5 h-5">
                                                                    <AvatarImage src={member.photoUrl || ''} alt={member.fullName} />
                                                                    <AvatarFallback className="text-[10px]">{member.fullName[0]}</AvatarFallback>
                                                                </Avatar>
                                                                <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">{member.fullName}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}

                                        {/* Emoji Popover */}
                                        <Popover open={isEmojiOpen} onOpenChange={setIsEmojiOpen}>
                                            <PopoverTrigger
                                                render={
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 px-2 text-zinc-500 hover:text-amber-500 cursor-pointer"
                                                        title="Add emoji"
                                                    >
                                                        <Smile size={15} />
                                                    </Button>
                                                }
                                            />
                                            <PopoverContent align="start" className="w-56 p-2 shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded-xl">
                                                <div className="grid grid-cols-5 gap-1">
                                                    {EMOJI_LIST.map((emoji, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                handleInsertEmoji(emoji);
                                                                setIsEmojiOpen(false);
                                                            }}
                                                            className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-base flex items-center justify-center cursor-pointer transition-transform hover:scale-125"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => handleSendMessage()}
                                        disabled={!newMessageText.trim() && pendingAttachments.length === 0}
                                        className="h-7 px-3 text-xs font-semibold bg-teal-700 hover:bg-teal-800 text-white cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Send size={12} /> Send
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Forward Message Modal */}
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
                        {USERS.map((user) => (
                            <button
                                key={user.userId}
                                type="button"
                                onClick={() => handleForwardToTarget({ id: user.userId, name: user.fullName })}
                                className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={user.photoUrl} alt={user.fullName} />
                                        <AvatarFallback className="text-[10px]">{user.fullName[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">{user.fullName}</span>
                                </div>
                                <Forward size={13} className="text-zinc-400" />
                            </button>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsForwardOpen(false)}
                            className="text-xs font-medium cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Member to Group Modal */}
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogContent className="sm:max-w-[400px] p-5">
                    <DialogHeader>
                        <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                            <UserPlus size={16} className="text-teal-600" /> Add Members to &quot;{target.name}&quot;
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-2 my-2 max-h-60 overflow-y-auto custom-scrollbar">
                        {USERS.map((user) => {
                            const isMember = target.members?.some((m) => m.userId === user.userId);
                            return (
                                <div
                                    key={user.userId}
                                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/60 dark:border-zinc-800"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage src={user.photoUrl} alt={user.fullName} />
                                            <AvatarFallback>{user.fullName[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{user.fullName}</p>
                                            <p className="text-[10px] text-zinc-400">{user.userName}</p>
                                        </div>
                                    </div>

                                    {isMember ? (
                                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <Check size={12} /> Member
                                        </span>
                                    ) : (
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAddMemberToGroup(user)}
                                            className="h-7 text-[11px] font-medium px-2.5 cursor-pointer"
                                        >
                                            Add
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setIsAddMemberOpen(false)}
                            className="text-xs font-medium cursor-pointer"
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
