'use client';

import React from 'react';
import { Reply, Trash2 } from 'lucide-react';
import EmojiReactionPopover from './EmojiReactionPopover';

interface CommentUser {
    id: string;
    fullName: string;
    userName: string;
    photoUrl?: string | null;
    role?: 'admin' | 'member';
}

interface CommentReaction {
    emoji: string;
    count: number;
    users: string[];
}

export interface DiscussionCommentNode {
    id: string;
    author: CommentUser;
    text: string;
    createdAt: string;
    reactions: CommentReaction[];
    children?: DiscussionCommentNode[];
    replyTo?: string;
}

interface CommentThreadProps {
    comments: DiscussionCommentNode[];
    currentUser: CommentUser;
    mentionUsers: CommentUser[];
    reactionOptions: string[];
    onReaction: (commentId: string, emoji: string) => void;
    onReply: (commentId: string, fullName: string) => void;
    onDelete: (commentId: string) => void;
}

const formatDate = (date: string) => {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return 'Just now';
    const diff = Date.now() - parsed.getTime();
    const seconds = Math.max(1, Math.floor(diff / 1000));
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return parsed.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

function renderComment(comment: DiscussionCommentNode, level: number, props: CommentThreadProps): React.ReactNode {
    const { currentUser, reactionOptions, onReaction, onReply, onDelete } = props;

    return (
        <div key={comment.id} className={level > 0 ? 'ml-4 border-l border-zinc-200 pl-3' : ''}>
            <div className="rounded-lg border border-zinc-200 bg-white p-2.5">
                <div className="flex items-start gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-200 text-[9px] font-semibold text-zinc-700">
                        {comment.author.fullName[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-[11px] font-semibold text-zinc-700">- {comment.author.fullName}</div>
                            <div className="text-[9px] text-zinc-500">{formatDate(comment.createdAt)}</div>
                        </div>

                        <div className="mt-1 text-[12px] leading-5 text-zinc-700">{comment.text}</div>

                        <div className="mt-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                                {comment.reactions.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        {comment.reactions.map((reaction) => (
                                            <span key={`${comment.id}-${reaction.emoji}`} className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-1 py-0.5 text-[9px]">
                                                <span>{reaction.emoji}</span>
                                                <span>{reaction.count}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <EmojiReactionPopover
                                    emojiOptions={reactionOptions}
                                    onSelect={(emoji) => onReaction(comment.id, emoji)}
                                    label=""
                                    className="!inline-flex"
                                />
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                <button type="button" onClick={() => onReply(comment.id, comment.author.fullName)} className="hover:text-teal-600">
                                    <span className="inline-flex items-center gap-1"><Reply size={10} /> Reply</span>
                                </button>
                                {(comment.author.id === currentUser.id || currentUser.role === 'admin') && (
                                    <button type="button" onClick={() => onDelete(comment.id)} className="hover:text-rose-600">
                                        <span className="inline-flex items-center gap-1"><Trash2 size={10} /> Delete</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {comment.children && comment.children.length > 0 && (
                <div className="mt-2 space-y-2">{comment.children.map((child) => renderComment(child, level + 1, props))}</div>
            )}
        </div>
    );
}

export default function CommentThread(props: CommentThreadProps) {
    return <div className="space-y-2.5">{props.comments.map((comment) => renderComment(comment, 0, props))}</div>;
}
