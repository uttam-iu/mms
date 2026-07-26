'use client'

import React, { FC } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Avatar, AvatarFallback } from './ui/avatar';
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DueDateProps {
    name: string;
    value?: string;
    onChange: (name: string, value: string) => void;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DueDate: FC<DueDateProps> = ({ name, value = '', onChange }) => {
    const [open, setOpen] = React.useState(false);

    // Current view month/year
    const initialDate = value ? new Date(value) : new Date();
    const validInitialDate = isNaN(initialDate.getTime()) ? new Date() : initialDate;

    const [currentView, setCurrentView] = React.useState<Date>(validInitialDate);

    React.useEffect(() => {
        if (value) {
            const parsed = new Date(value);
            if (!isNaN(parsed.getTime())) {
                setCurrentView(parsed);
            }
        }
    }, [value]);

    const handlePrevMonth = () => {
        setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentView(new Date(currentView.getFullYear(), currentView.getMonth() + 1, 1));
    };

    const handleSelectDate = (year: number, month: number, day: number) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        const dateString = `${year}-${m}-${d}`;
        onChange(name, dateString);
        setOpen(false);
    };

    const handleClear = () => {
        onChange(name, '');
        setOpen(false);
    };

    const handleSelectToday = () => {
        const today = new Date();
        handleSelectDate(today.getFullYear(), today.getMonth(), today.getDate());
    };

    const handleSelectTomorrow = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        handleSelectDate(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
    };

    // Calendar grid calculations
    const year = currentView.getFullYear();
    const month = currentView.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const emptyOffset = Array.from({ length: firstDayIndex }, (_, i) => i);

    // Selected date checking
    const selectedDateObj = value ? new Date(value) : null;
    const isSelected = (day: number) => {
        if (!selectedDateObj || isNaN(selectedDateObj.getTime())) return false;
        return (
            selectedDateObj.getFullYear() === year &&
            selectedDateObj.getMonth() === month &&
            selectedDateObj.getDate() === day
        );
    };

    const todayObj = new Date();
    const isToday = (day: number) => {
        return (
            todayObj.getFullYear() === year &&
            todayObj.getMonth() === month &&
            todayObj.getDate() === day
        );
    };

    // Formatted display text for trigger button
    const formatDisplayDate = (dateStr: string) => {
        if (!dateStr) return '';
        const parts = dateStr.split(' ')[0].split('-');
        if (parts.length === 3) {
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);
            if (!isNaN(year) && !isNaN(month) && !isNaN(day) && MONTH_NAMES[month]) {
                return `${day} ${MONTH_NAMES[month].slice(0, 3)}`;
            }
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = d.getDate();
        const monthShort = MONTH_NAMES[d.getMonth()]?.slice(0, 3);
        return `${day} ${monthShort}`;
    };

    return (
        <div className="py-1">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger
                    nativeButton={false}
                    render={
                        value ? (
                            <div className="h-[24px] px-2 rounded-md bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-zinc-200/70 transition-colors">
                                <CalendarDays size={13} className="text-primary" />
                                <span>{formatDisplayDate(value)}</span>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClear();
                                    }}
                                    className="ml-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ) : (
                            <Avatar className="w-[24px] h-[24px] cursor-pointer">
                                <AvatarFallback>
                                    <CalendarDays style={{ width: '12px' }} />
                                </AvatarFallback>
                            </Avatar>
                        )
                    }
                />
                <PopoverContent className="w-[260px] p-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                            {MONTH_NAMES[month]} {year}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                            >
                                <ChevronLeft size={14} />
                            </button>
                            <button
                                type="button"
                                onClick={handleNextMonth}
                                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
                            >
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 gap-1 text-center mb-1">
                        {DAY_NAMES.map((d) => (
                            <span key={d} className="text-[10px] font-semibold text-zinc-400">
                                {d}
                            </span>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {emptyOffset.map((i) => (
                            <div key={`empty-${i}`} className="h-7" />
                        ))}
                        {daysArray.map((day) => {
                            const selected = isSelected(day);
                            const current = isToday(day);

                            return (
                                <button
                                    key={day}
                                    type="button"
                                    onClick={() => handleSelectDate(year, month, day)}
                                    className={`h-7 w-7 rounded-md text-xs font-medium flex items-center justify-center transition-colors cursor-pointer ${
                                        selected
                                            ? 'bg-zinc-900 text-white font-bold dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                                            : current
                                            ? 'border border-zinc-400 text-zinc-900 dark:text-zinc-100 font-semibold'
                                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick shortcuts */}
                    <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleSelectToday}
                                className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 transition-colors"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={handleSelectTomorrow}
                                className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-200 transition-colors"
                            >
                                Tomorrow
                            </button>
                        </div>
                        {value && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-zinc-400 hover:text-zinc-600 font-medium transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default DueDate;
