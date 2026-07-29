'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { useParams } from 'next/navigation'
import Toolbar from '@/components/ui/Toolbar'
import MyAvatarGroup from '@/components/MyAvatarGroup'
import { useAppState } from '@/context/AppContext'

export default function KanbanBoard() {
    const { monthId } = useParams()
    console.log(monthId)


    const { open, isMobile } = useSidebar()

    const ctx = useAppState()


    // Dynamic dynamic width calculate structure based on state
    const getMaxWidthClass = () => {
        if (isMobile) return "max-w-full"
        return open ? "max-w-[calc(100vw-266px)]" : "max-w-[calc(100vw-58px)]"
    }

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans select-none">
            {/* Single Project Toolbar */}
            <Toolbar showLogoutBtn={false}>
                {/* <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" /> */}
                <div className="flex items-center gap-2">
                    <h1 className="text-sm font-bold tracking-tight text-zinc-800 dark:text-zinc-200">
                        {ctx?.state?.project?.projectName || 'Project Board'}
                    </h1>
                    {ctx?.state?.project?.isClosed ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Completed
                        </span>
                    ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            In Progress
                        </span>
                    )}
                </div>
                {ctx?.state?.project?.participants && ctx.state.project.participants.length > 0 && (
                    <div className="hidden sm:flex items-center ml-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                        <MyAvatarGroup users={ctx.state.project.participants} maxItem={4} />
                    </div>
                )}
            </Toolbar>

            {/* Main Drag Canvas Context */}
            <div className={`flex-1 flex gap-6 items-start overflow-x-auto p-4 custom-scrollbar ${getMaxWidthClass()}`}>
                summary section
            </div>
        </div>
    )
}
