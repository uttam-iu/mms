'use client';

import { USER_TYPE } from '@/types/user.types';
import { ChatTarget } from '@/types/chat.types';
import { usePathname, useRouter } from 'next/navigation';
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppState {
  user: USER_TYPE | null;
  theme: 'light' | 'dark';
  activeChatTarget: ChatTarget | null;
  isChatOpen: boolean;
  openChats: ChatTarget[];
  title: string;
}

interface AppContextType {
  state: AppState;
  setUser: (user: USER_TYPE | null) => void;
  toggleTheme: () => void;
  setTitle: (title: string) => void;
  openChat: (target: ChatTarget) => void;
  closeChat: (targetId?: string | number) => void;
  updateActiveChatTarget: (updatedTarget: ChatTarget) => void;
  resetContext: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const initialState: AppState = {
    user: null,
    theme: 'light',
    activeChatTarget: null,
    isChatOpen: false,
    openChats: [],
    title: '',
  }
  const [state, setState] = useState<AppState>(initialState);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    if (pathname !== '/') return;

    const shouldRedirectToSummary = sessionStorage.getItem('shouldRedirectToSummary');
    if (!shouldRedirectToSummary) return;

    sessionStorage.removeItem('shouldRedirectToSummary');
    router.replace('/summary');
  }, [pathname, router]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.location.pathname === '/') {
      sessionStorage.setItem('shouldRedirectToSummary', 'true');
    }
  }, []);

  const setUser = React.useCallback((user: USER_TYPE | null): void => {
    setState((prev) => (prev.user === user ? prev : { ...prev, user }));
  }, []);

  const toggleTheme = React.useCallback((): void => {
    setState((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  }, []);

  const setTitle = React.useCallback((title: string): void => {
    setState((prev) => (prev.title === title ? prev : { ...prev, title }));
  }, []);

  const openChat = React.useCallback((target: ChatTarget): void => {
    setState((prev) => {
      const exists = prev.openChats.some((c) => c.id.toString() === target.id.toString());
      const updatedOpenChats = exists
        ? prev.openChats.map((c) => (c.id.toString() === target.id.toString() ? target : c))
        : [...prev.openChats, target];

      return {
        ...prev,
        activeChatTarget: target,
        isChatOpen: true,
        openChats: updatedOpenChats,
      };
    });
  }, []);

  const closeChat = React.useCallback((targetId?: string | number): void => {
    setState((prev) => {
      if (!targetId) {
        return {
          ...prev,
          isChatOpen: false,
          activeChatTarget: null,
          openChats: [],
        };
      }

      const updatedOpenChats = prev.openChats.filter((c) => c.id.toString() !== targetId.toString());
      const newActive = updatedOpenChats.length > 0 ? updatedOpenChats[updatedOpenChats.length - 1] : null;

      return {
        ...prev,
        openChats: updatedOpenChats,
        activeChatTarget: newActive,
        isChatOpen: updatedOpenChats.length > 0,
      };
    });
  }, []);

  const updateActiveChatTarget = React.useCallback((updatedTarget: ChatTarget): void => {
    setState((prev) => ({
      ...prev,
      activeChatTarget: updatedTarget,
      openChats: prev.openChats.map((c) => (c.id.toString() === updatedTarget.id.toString() ? updatedTarget : c)),
    }));
  }, []);

  const resetContext = React.useCallback(() => {
    setState(initialState)
  }, [initialState])

  const contextValue = React.useMemo(
    () => ({ resetContext, state, setUser, toggleTheme, setTitle, openChat, closeChat, updateActiveChatTarget }),
    [resetContext, state, setUser, toggleTheme, setTitle, openChat, closeChat, updateActiveChatTarget]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  return context;
}
