'use client';

import { PROJECT_TYPE } from '@/types/project.types';
import { USER_TYPE } from '@/types/user.types';
import { ChatTarget } from '@/types/chat.types';
import { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
    user: USER_TYPE | null;
    theme: 'light' | 'dark';
    project: PROJECT_TYPE | null;
    activeChatTarget: ChatTarget | null;
    isChatOpen: boolean;
}

interface AppContextType {
    state: AppState;
    setUser: (user: USER_TYPE | null) => void;
    setProject: (project: PROJECT_TYPE | null) => void;
    toggleTheme: (theme: 'light' | 'dark') => void;
    openChat: (target: ChatTarget) => void;
    closeChat: () => void;
    updateActiveChatTarget: (updatedTarget: ChatTarget) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AppState>({
        user: null,
        theme: 'light',
        project: null,
        activeChatTarget: null,
        isChatOpen: false,
    });

    const setUser = (user: USER_TYPE | null): void => {
        setState((prev) => ({ ...prev, user }));
    };

    const setProject = (project: PROJECT_TYPE | null): void => {
        setState((prev) => ({ ...prev, project }));
    };

    const toggleTheme = (): void => {
        setState((prev) => ({
            ...prev,
            theme: prev.theme === 'light' ? 'dark' : 'light',
        }));
    };

    const openChat = (target: ChatTarget): void => {
        setState((prev) => ({
            ...prev,
            activeChatTarget: target,
            isChatOpen: true,
        }));
    };

    const closeChat = (): void => {
        setState((prev) => ({
            ...prev,
            isChatOpen: false,
        }));
    };

    const updateActiveChatTarget = (updatedTarget: ChatTarget): void => {
        setState((prev) => ({
            ...prev,
            activeChatTarget: updatedTarget,
        }));
    };

    return (
        <AppContext.Provider value={{ state, setUser, setProject, toggleTheme, openChat, closeChat, updateActiveChatTarget }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppState() {
    const context = useContext(AppContext);
    return context;
}
