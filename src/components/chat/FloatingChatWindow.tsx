'use client';

import { useState, useMemo } from 'react';
import { SingleChatBox } from './SingleChatBox';
import { useAppState } from '@/context/AppContext';
import {
  ChatAttachment,
  ChatAudioMessage,
  ChatMessage,
  ChatMessageReaction,
  ChatTarget,
  CombinedChatItem,
} from './types/chat.types';
import { USER_TYPE } from '@/types/user.types';
import USERS from '@/dummyData/users.json';
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
import {
  X,
  Users,
  Forward,
  MessageSquare,
  Search,
  UserCheck,
  Plus,
} from 'lucide-react';
import './style.css';

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

  // Handle clicking chat item from panel
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

    ctx?.openChat(chatTarget);

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
      {/* MULTI-WINDOW CONTAINER */}
      <div className="fixed bottom-0 right-14 sm:right-24 z-40 flex items-end gap-1.5 sm:gap-3 max-w-[calc(100vw-65px)] sm:max-w-[calc(100vw-120px)] overflow-x-auto p-1 fcw-scrollbar pointer-events-auto">
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

      {/* ALWAYS VISIBLE FLOATING CHAT ICON */}
      <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-50 flex flex-col items-end gap-3">
        {isChatListPanelOpen && (
          <div className="w-[calc(100vw-24px)] sm:w-96 max-w-96 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-in fade-in slide-in-from-bottom-4 duration-200">
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

            <div className="flex-1 overflow-y-auto p-1.5 space-y-1 fcw-scrollbar">
              {filteredChatList.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400">No chats matching search</div>
              ) : (
                filteredChatList.map((item) => {
                  const isOpenInWindow = openChats.some((c) => c.id.toString() === item.id.toString());
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectChatTarget(item)}
                      className={`p-2.5 rounded-xl flex items-center gap-3 cursor-pointer border transition-all group select-none ${isOpenInWindow
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
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded shrink-0 ${item.type === 'group'
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

        <button
          type="button"
          onClick={() => setIsChatListPanelOpen((prev) => !prev)}
          className="h-10 w-10 sm:h-13 sm:w-13 rounded-full bg-teal-700 hover:bg-teal-800 text-white shadow-xl flex items-center justify-center relative cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
          title="Open Chat List"
        >
          <MessageSquare size={18} className="sm:hidden group-hover:rotate-12 transition-transform" />
          <MessageSquare size={22} className="hidden sm:block group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 bg-rose-500 text-white text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white dark:border-zinc-950 shadow-xs">
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
              <div className="space-y-1 max-h-48 overflow-y-auto fcw-scrollbar border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-2 bg-zinc-50/50 dark:bg-zinc-900/40">
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
                      className={`flex items-center justify-between p-1.5 rounded-md cursor-pointer transition-colors ${isSelected
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

          <div className="space-y-1.5 my-2 max-h-56 overflow-y-auto fcw-scrollbar">
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
