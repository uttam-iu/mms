'use client'



export default function MonthPage() {

    return (
        <div className="h-[calc(100vh-56px)] flex flex-col bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden">
            {/* Sticky Filter Controls Header */}
            <div className="sticky top-0 z-10 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-2 border-b border-zinc-200/80 dark:border-zinc-800 shrink-0">
                <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        Filter
                        {/* Search Bar */}
                        {/* <div className="relative w-64">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <Input
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-xs bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                            />
                        </div> */}

                        {/* <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                    statusFilter === 'all'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                All ({projects.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('in_progress')}
                                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                    statusFilter === 'in_progress'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                Active
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('completed')}
                                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                                    statusFilter === 'completed'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                                }`}
                            >
                                Completed
                            </button>
                        </div> */}
                    </div>

                    {/* Create Project Button */}
                    {/* <Button
                        type="button"
                        onClick={handleOpenCreate}
                        size="sm"
                        className="h-8 text-xs font-semibold px-3 cursor-pointer flex items-center gap-1"
                    >
                        <Plus size={14} /> New Project
                    </Button> */}
                </div>
            </div>

            {/* Scrollable Projects Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pt-4 px-4">
                <div className="max-w-7xl mx-auto w-full">
                    main section
                </div>
            </div>


        </div>
    );
}
