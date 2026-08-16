'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Pin,
    Globe,
    Pencil,
    Trash2,
    Paperclip,
    Link2,
    MoreHorizontal,
    Bold,
    Italic,
    Underline,
    List,
    Quote,
    Sparkles,
} from 'lucide-react';
import { useAppState } from '@/context/AppContext';
import { useTitle } from '@/hooks/useTitle';
import EmojiReactionPopover from './components/EmojiReactionPopover';
import CommentComposer from './components/CommentComposer';
import CommentThread, { DiscussionCommentNode } from './components/CommentThread';

export type DiscussionVisibility = 'public' | 'me';
export type DiscussionReaction = '👍' | '❤️' | '😂' | '🎉' | '😮' | '🔥';

interface CommunityUser {
    id: string;
    fullName: string;
    userName: string;
    photoUrl?: string | null;
    role?: 'admin' | 'member';
}

interface DiscussionComment {
    id: string;
    author: CommunityUser;
    text: string;
    createdAt: string;
    reactions: { emoji: DiscussionReaction; count: number; users: string[] }[];
    replyTo?: string;
    children?: DiscussionComment[];
}

interface DiscussionPost {
    id: string;
    author: CommunityUser;
    createdAt: string;
    title: string;
    visibility: DiscussionVisibility;
    pinned: boolean;
    text: string;
    imageUrl?: string | null;
    linkUrl?: string | null;
    fileName?: string | null;
    reactions: { emoji: DiscussionReaction; count: number; users: string[] }[];
    comments: DiscussionComment[];
    showComments?: boolean;
}

const demoUsers: CommunityUser[] = [
    { id: 'me', fullName: 'system admin', userName: 'system admin', photoUrl: '', role: 'admin' },
    { id: 'u2', fullName: 'student 1', userName: 'student1', photoUrl: '', role: 'member' },
    { id: 'u3', fullName: 'student 2', userName: 'student2', photoUrl: '', role: 'member' },
];

const demoPosts: DiscussionPost[] = [
    {
        id: 'p1',
        author: demoUsers[0],
        createdAt: '2026-08-13T10:30:00.000Z',
        title: 'Chemistry',
        visibility: 'public',
        pinned: false,
        text: 'Chemistry is the scientific study of matter, its properties, how and why substances combine or separate to form other substances, and how they interact with energy. Often called the "central science", it connects physics with other sciences like biology and geology. [1, 2, 3]\n\nMain Branches of Chemistry\n1. Organic Chemistry: The study of carbon compounds and life-based molecules.\n2. Inorganic Chemistry: The study of non-carbon related compounds, minerals, and metals.\n3. Biochemistry: The study of chemical processes inside living things.\n4. Analytical Chemistry: The quantitative and qualitative observation and measurement of chemical components.\n5. Physical Chemistry: The study of the underlying physical principles and mechanics of chemical systems.\n\nA short general overview explaining basic atomic structures, states of matter, and reactions.',
        imageUrl: 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?auto=format&fit=crop&w=1200&q=80',
        linkUrl: 'https://en.wikipedia.org/wiki/Chemistry',
        fileName: 'c1.jpg',
        reactions: [{ emoji: '👍', count: 46, users: ['student1', 'student2', 'system admin'] }],
        comments: [
            {
                id: 'c1',
                author: demoUsers[1],
                text: 'thanks',
                createdAt: '2026-08-13T10:45:00.000Z',
                reactions: [{ emoji: '👍', count: 16, users: ['system admin'] }],
                children: [
                    {
                        id: 'c1-1',
                        author: demoUsers[0],
                        text: 'welcome @student1',
                        createdAt: '2026-08-13T10:47:00.000Z',
                        reactions: [{ emoji: '🎉', count: 5, users: ['student2'] }],
                    },
                ],
            },
            {
                id: 'c2',
                author: demoUsers[2],
                text: 'welcome',
                createdAt: '2026-08-13T10:50:00.000Z',
                reactions: [{ emoji: '🎉', count: 9, users: ['student1'] }],
            },
        ],
        showComments: true,
    },
];

const reactionOptions: DiscussionReaction[] = ['👍', '❤️', '😂', '🎉', '😮', '🔥'];
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

export default function DiscussionPage() {

    const currentUser = demoUsers[0];
    const [posts, setPosts] = React.useState<DiscussionPost[]>(demoPosts);
    const [postTitle, setPostTitle] = React.useState('');
    const [postDescription, setPostDescription] = React.useState('');
    const [commentDrafts, setCommentDrafts] = React.useState<Record<string, string>>({});
    const [activeReplyTarget, setActiveReplyTarget] = React.useState<Record<string, string>>({});
    const [replyTargetName, setReplyTargetName] = React.useState<Record<string, string>>({});
    const [openActionMenu, setOpenActionMenu] = React.useState<string | null>(null);
    const [isComposerOpen, setIsComposerOpen] = React.useState(true);

    useTitle('Discussion');

    const getReplyTargetLabel = (postId: string, commentId?: string) => {
        if (!commentId) return 'this comment';
        const post = posts.find((item) => item.id === postId);

        const searchComment = (list: DiscussionComment[] | undefined): CommunityUser | undefined => {
            if (!list) return undefined;
            for (const item of list) {
                if (item.id === commentId) return item.author;
                const nested = item.children ? searchComment(item.children) : undefined;
                if (nested) return nested;
            }
            return undefined;
        };

        const target = searchComment(post?.comments);
        return target?.fullName || replyTargetName[postId] || 'this comment';
    };

    const updateReactionList = (
        reactions: { emoji: DiscussionReaction; count: number; users: string[] }[],
        emoji: DiscussionReaction,
        userName: string,
    ) => {
        const existing = reactions.find((item) => item.emoji === emoji);
        if (existing) {
            const hasUser = existing.users.includes(userName);
            return reactions
                .map((item) => {
                    if (item.emoji !== emoji) return item;
                    return {
                        ...item,
                        count: hasUser ? Math.max(0, item.count - 1) : item.count + 1,
                        users: hasUser ? item.users.filter((name) => name !== userName) : [...item.users, userName],
                    };
                })
                .filter((item) => item.count > 0);
        }

        return [...reactions, { emoji, count: 1, users: [userName] }];
    };

    const onReaction = (postId: string, emoji: DiscussionReaction, commentId?: string) => {
        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;

                if (commentId) {
                    return {
                        ...post,
                        comments: post.comments.map((comment) =>
                            comment.id === commentId
                                ? { ...comment, reactions: updateReactionList(comment.reactions, emoji, currentUser.fullName) }
                                : comment,
                        ),
                    };
                }

                return {
                    ...post,
                    reactions: updateReactionList(post.reactions, emoji, currentUser.fullName),
                };
            }),
        );
    };

    const handleCreatePost = () => {
        if (!postTitle.trim() && !postDescription.trim()) return;

        const createdPost: DiscussionPost = {
            id: `post-${Date.now()}`,
            author: currentUser,
            createdAt: new Date().toISOString(),
            title: postTitle.trim() || 'New announcement',
            visibility: 'public',
            pinned: false,
            text: postDescription.trim(),
            imageUrl: undefined,
            linkUrl: undefined,
            fileName: undefined,
            reactions: [],
            comments: [],
            showComments: true,
        };

        setPosts((prev) => [createdPost, ...prev]);
        setPostTitle('');
        setPostDescription('');
    };

    const handleDeletePost = (postId: string) => {
        setPosts((prev) => prev.filter((post) => post.id !== postId));
    };

    const handleTogglePin = (postId: string) => {
        setPosts((prev) =>
            prev.map((post) =>
                post.id === postId ? { ...post, pinned: !post.pinned } : post,
            ),
        );
    };

    const handleEditPost = (post: DiscussionPost) => {
        setPostTitle(post.title);
        setPostDescription(post.text);
        setIsComposerOpen(true);
    };

    const insertReplyIntoCommentTree = (comments: DiscussionComment[], targetId: string, newComment: DiscussionComment): DiscussionComment[] =>
        comments.map((comment) => {
            if (comment.id === targetId) {
                return {
                    ...comment,
                    children: [...(comment.children || []), newComment],
                };
            }

            if (comment.children && comment.children.length > 0) {
                return {
                    ...comment,
                    children: insertReplyIntoCommentTree(comment.children, targetId, newComment),
                };
            }

            return comment;
        });

    const handleDeleteComment = (postId: string, commentId: string) => {
        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;

                const removeComment = (comments: DiscussionComment[]): DiscussionComment[] =>
                    comments
                        .filter((comment) => comment.id !== commentId)
                        .map((comment) => ({
                            ...comment,
                            children: comment.children ? removeComment(comment.children) : undefined,
                        }));

                return {
                    ...post,
                    comments: removeComment(post.comments),
                };
            }),
        );
    };

    const handleCommentSave = (postId: string) => {
        const value = (commentDrafts[postId] || '').trim();
        if (!value) return;

        const replyTargetId = activeReplyTarget[postId];
        const replyName = replyTargetId ? getReplyTargetLabel(postId, replyTargetId) : undefined;

        setPosts((prev) =>
            prev.map((post) => {
                if (post.id !== postId) return post;

                const newComment: DiscussionComment = {
                    id: `comment-${Date.now()}`,
                    author: currentUser,
                    text: value,
                    createdAt: new Date().toISOString(),
                    reactions: [],
                    replyTo: replyTargetId,
                };

                return {
                    ...post,
                    comments: replyTargetId
                        ? insertReplyIntoCommentTree(post.comments, replyTargetId, newComment)
                        : [...post.comments, newComment],
                    showComments: true,
                };
            }),
        );

        if (replyTargetId && replyName) {
            setReplyTargetName((prev) => ({ ...prev, [postId]: replyName }));
        }

        setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
        setActiveReplyTarget((prev) => ({ ...prev, [postId]: '' }));
    };

    return (
        <div className="w-full min-w-0 bg-zinc-100/80 px-3 py-4 text-zinc-900">
            <div className="mx-auto max-w-3xl space-y-4">
                <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-zinc-700">
                            {currentUser.fullName[0]?.toUpperCase() || 'U'}
                        </div>
                        <input
                            value={postTitle}
                            onChange={(event) => setPostTitle(event.target.value)}
                            placeholder="Announce something to your class..."
                            className="h-10 w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                        />
                    </div>

                    {isComposerOpen ? (
                        <>
                            <div className="mb-2">
                                <label className="mb-1 block text-sm font-medium text-zinc-700">Title *</label>
                                <Input
                                    value={postTitle}
                                    onChange={(event) => setPostTitle(event.target.value)}
                                    placeholder="Add a title"
                                    className="h-11 border-zinc-200 bg-zinc-50 text-base"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="mb-1 block text-sm font-medium text-zinc-700">Description</label>
                                <textarea
                                    value={postDescription}
                                    onChange={(event) => setPostDescription(event.target.value)}
                                    placeholder="Write description"
                                    className="min-h-[140px] w-full resize-y rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                            </div>

                            <div className="mb-3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-2 text-zinc-700">
                                <button type="button" className="rounded px-1 text-base font-bold"><Bold size={12} /></button>
                                <button type="button" className="rounded px-1 text-base italic"><Italic size={12} /></button>
                                <button type="button" className="rounded px-1 text-base underline"><Underline size={12} /></button>
                                <button type="button" className="rounded px-1 text-base"><List size={12} /></button>
                                <button type="button" className="rounded px-1 text-base"><Quote size={12} /></button>
                                <button type="button" className="rounded px-1 text-base"><Link2 size={12} /></button>
                                <button type="button" className="rounded px-1 text-base"><Sparkles size={12} /></button>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                                    <span>** Max file size 50MB</span>
                                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-600">
                                        <Paperclip size={15} />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="rounded-md border-zinc-300 px-5 text-xs font-medium uppercase tracking-wide" onClick={() => {
                                        setIsComposerOpen(false);
                                        setPostTitle('');
                                        setPostDescription('');
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button size="sm" className="rounded-md bg-zinc-900 px-5 text-xs font-medium uppercase tracking-wide text-white hover:bg-zinc-700" onClick={handleCreatePost}>
                                        Post
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-end text-sm text-zinc-500">
                            <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wide" onClick={() => setIsComposerOpen(true)}>
                                Add new post
                            </Button>
                        </div>
                    )}
                </div>

                {posts.map((post) => {
                    const isOwner = post.author.id === currentUser.id || currentUser.role === 'admin';

                    return (
                        <article key={post.id} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
                            <div className="p-3.5">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-semibold text-zinc-700">
                                            {post.author.fullName[0]?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-zinc-700">- {post.author.fullName}</div>
                                            <div className="text-[10px] text-zinc-500">{formatDate(post.createdAt)} ago</div>
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <div className="relative">
                                            <button type="button" onClick={() => setOpenActionMenu((prev) => prev === post.id ? null : post.id)} className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100">
                                                <MoreHorizontal size={14} />
                                            </button>

                                            {openActionMenu === post.id && (
                                                <div className="absolute right-0 top-8 z-20 w-32 rounded-md border border-zinc-200 bg-white p-1 shadow-md">
                                                    <button type="button" onClick={() => { handleEditPost(post); setOpenActionMenu(null); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] hover:bg-zinc-100"><Pencil size={11} /> Edit</button>
                                                    <button type="button" onClick={() => { handleDeletePost(post.id); setOpenActionMenu(null); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] hover:bg-zinc-100"><Trash2 size={11} /> Delete</button>
                                                    <button type="button" onClick={() => { handleTogglePin(post.id); setOpenActionMenu(null); }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[11px] hover:bg-zinc-100"><Pin size={11} /> {post.pinned ? 'Unpin' : 'Pin'}</button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-2 flex items-center gap-2">
                                    {post.pinned && (
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                            <Pin size={10} className="mr-1" /> Pinned
                                        </span>
                                    )}
                                </div>

                                <div className="mb-3 text-sm font-semibold text-zinc-900">{post.title}</div>

                                <div className="whitespace-pre-line text-sm leading-6 text-zinc-700">{post.text}</div>

                                {post.imageUrl && (
                                    <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50">
                                        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-100 px-2 py-1.5 text-[10px] text-zinc-600">
                                            <span>{post.fileName || 'attachment'}</span>
                                            <span className="rounded bg-white px-1.5 py-0.5">File</span>
                                        </div>
                                        <Image src={post.imageUrl} alt={post.title} width={1200} height={320} unoptimized className="h-40 w-full object-cover" />
                                    </div>
                                )}

                                {post.linkUrl && (
                                    <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-2">
                                        <div className="flex items-center gap-2 text-zinc-700">
                                            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700">
                                                <Globe size={12} />
                                            </div>
                                            <div className="min-w-0 overflow-hidden text-[11px] text-zinc-700">
                                                <div className="truncate font-medium">{post.fileName || 'Wikipedia'}</div>
                                                <div className="truncate text-zinc-500">{post.linkUrl}</div>
                                            </div>
                                        </div>
                                        <a href={post.linkUrl} target="_blank" rel="noreferrer" className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-700">
                                            <Link2 size={12} />
                                        </a>
                                    </div>
                                )}

                                <div className="mt-4 flex items-center justify-between gap-2 border-t border-zinc-200 pt-2 text-[11px] text-zinc-500">
                                    <div className="relative flex items-center gap-2">
                                        {post.reactions.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                {post.reactions.map((reaction) => (
                                                    <span key={`${post.id}-${reaction.emoji}`} className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-1.5 py-0.5">
                                                        <span>{reaction.emoji}</span>
                                                        <span>{reaction.count}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        <EmojiReactionPopover
                                            emojiOptions={reactionOptions}
                                            onSelect={(emoji) => onReaction(post.id, emoji as unknown as DiscussionReaction)}
                                            label="React"
                                        />
                                    </div>

                                    <button type="button" onClick={() => setPosts((prev) => prev.map((item) => item.id === post.id ? { ...item, showComments: !item.showComments } : item))} className="text-[10px] uppercase tracking-wide text-zinc-500 hover:text-zinc-700">
                                        {post.showComments ? 'Hide comments' : 'Show comments'}
                                    </button>
                                </div>
                            </div>

                            {post.showComments && (
                                <div className="border-t border-zinc-200 bg-zinc-50 p-3">
                                    <CommentThread
                                        comments={post.comments as DiscussionCommentNode[]}
                                        currentUser={currentUser}
                                        mentionUsers={demoUsers}
                                        reactionOptions={reactionOptions}
                                        onReaction={(commentId, emoji) => onReaction(post.id, emoji as DiscussionReaction, commentId)}
                                        onReply={(commentId, fullName) => {
                                            setActiveReplyTarget((prev) => ({ ...prev, [post.id]: commentId }));
                                            setReplyTargetName((prev) => ({ ...prev, [post.id]: fullName }));
                                        }}
                                        onDelete={(commentId) => handleDeleteComment(post.id, commentId)}
                                    />

                                    <CommentComposer
                                        value={commentDrafts[post.id] || ''}
                                        onChange={(value) => setCommentDrafts((prev) => ({ ...prev, [post.id]: value }))}
                                        onSubmit={() => handleCommentSave(post.id)}
                                        placeholder={activeReplyTarget[post.id] ? `Write a reply to ${getReplyTargetLabel(post.id, activeReplyTarget[post.id])}...` : 'Write a comment...'}
                                        mentionUsers={demoUsers}
                                        replyTargetLabel={activeReplyTarget[post.id] ? getReplyTargetLabel(post.id, activeReplyTarget[post.id]) : null}
                                        onClearReply={() => setActiveReplyTarget((prev) => ({ ...prev, [post.id]: '' }))}
                                    />
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </div>
    );
}
