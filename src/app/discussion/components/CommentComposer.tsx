'use client';

import React from 'react';
import { Send, Reply } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface MentionUser {
    id: string;
    fullName: string;
    userName: string;
}

interface CommentComposerProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    placeholder?: string;
    mentionUsers?: MentionUser[];
    replyTargetLabel?: string | null;
    onClearReply?: () => void;
}

export default function CommentComposer({
    value,
    onChange,
    onSubmit,
    placeholder = 'Write a comment...',
    mentionUsers = [],
    replyTargetLabel,
    onClearReply,
}: CommentComposerProps) {
    const [mentionSuggestions, setMentionSuggestions] = React.useState<MentionUser[]>([]);

    const triggerMentionSuggestions = (text: string) => {
        const lastAtIndex = text.lastIndexOf('@');
        if (lastAtIndex === -1) {
            setMentionSuggestions([]);
            return;
        }

        const query = text.slice(lastAtIndex + 1).trim().toLowerCase();
        if (!query) {
            setMentionSuggestions(mentionUsers.slice(0, 5));
            return;
        }

        setMentionSuggestions(
            mentionUsers.filter((user) =>
                user.fullName.toLowerCase().includes(query) || user.userName.toLowerCase().includes(query),
            ),
        );
    };

    const handleChange = (nextValue: string) => {
        onChange(nextValue);
        triggerMentionSuggestions(nextValue);
    };

    const applyMention = (user: MentionUser) => {
        const lastAtIndex = value.lastIndexOf('@');
        if (lastAtIndex === -1) {
            onChange(`${value}${user.fullName} `);
            setMentionSuggestions([]);
            return;
        }

        const nextValue = `${value.slice(0, lastAtIndex)}@${user.fullName} `;
        onChange(nextValue);
        setMentionSuggestions([]);
    };

    return (
        <div className="mt-3">
            {replyTargetLabel && (
                <div className="mb-2 flex items-center gap-1 text-[10px] text-teal-700">
                    <Reply size={10} />
                    <span>Replying to {replyTargetLabel}</span>
                    {onClearReply && (
                        <button type="button" onClick={onClearReply} className="ml-1 text-[9px] text-zinc-500 hover:text-zinc-700">
                            Clear
                        </button>
                    )}
                </div>
            )}

            <div className="relative flex items-center gap-2">
                <Input
                    value={value}
                    onChange={(event) => handleChange(event.target.value)}
                    onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            onSubmit();
                        }
                    }}
                    placeholder={placeholder}
                    className="h-9 rounded-md border-zinc-200 bg-white text-xs"
                />

                <button
                    type="button"
                    onClick={onSubmit}
                    className="flex h-9 w-9 items-center justify-center rounded-md bg-zinc-900 text-white hover:bg-zinc-700"
                    aria-label="Send comment"
                >
                    <Send size={14} />
                </button>
            </div>

            {mentionSuggestions.length > 0 && (
                <div className="absolute z-30 mt-1 w-[220px] rounded-md border border-zinc-200 bg-white p-1 shadow-lg">
                    {mentionSuggestions.map((user) => (
                        <button
                            key={user.id}
                            type="button"
                            onClick={() => applyMention(user)}
                            className="flex w-full items-center justify-between rounded px-2 py-1 text-left text-[11px] hover:bg-zinc-100"
                        >
                            <span>{user.fullName}</span>
                            <span className="text-zinc-500">@{user.userName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
