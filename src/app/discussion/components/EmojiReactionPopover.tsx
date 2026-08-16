'use client';

import React from 'react';
import { SmilePlus } from 'lucide-react';

interface EmojiReactionPopoverProps {
    emojiOptions: string[];
    onSelect: (emoji: string) => void;
    label?: string;
    className?: string;
}

export default function EmojiReactionPopover({
    emojiOptions,
    onSelect,
    label = 'React',
    className = '',
}: EmojiReactionPopoverProps) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    return (
        <div ref={containerRef} className={`relative inline-flex ${className}`}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] text-zinc-600 hover:bg-zinc-100"
            >
                <SmilePlus size={11} />
                <span>{label}</span>
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-2 flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1 shadow-lg">
                    {emojiOptions.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            onClick={() => {
                                onSelect(emoji);
                                setOpen(false);
                            }}
                            className="rounded-full p-1 text-base hover:bg-zinc-100"
                            aria-label={`React with ${emoji}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
