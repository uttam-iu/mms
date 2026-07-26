export const columnData = [
    { id: 1, title: 'To Do' },
    { id: 2, title: 'In Progress' },
]

export const taskData = [
    {
        taskId: 1,
        taskTitle: 'Create Shadcn components',
        taskDescription: 'Build UI components for dialogs, popovers, avatar groups, and badges.',
        priorityType: 'Urgent',
        taskType: 'Feature',
        taskStatus: 'Pending',
        columnId: 1,
        createdAt: "2026-07-12 11:30",
        createdBy: {
            userId: 2,
            userName: "sagor@k.com",
            fullName: "Assaduzzaman Sagor",
            photoUrl: "https://github.com/maxleiter.png"
        },
        assignee: [
            {
                userId: 1,
                userName: "uttam@k.com",
                fullName: "Uttam Kumar",
                photoUrl: "https://github.com/shadcn.png"
            },
        ],
        dueDate: "2026-07-12 11:30",
        attachments: [
            {
                id: 'att-1',
                name: 'component_spec.pdf',
                url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80',
                size: '2.4 MB',
                type: 'image',
                uploadedAt: '2026-07-13 10:15'
            },
            {
                id: 'att-2',
                name: 'design_mockup.png',
                url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&q=80',
                size: '1.1 MB',
                type: 'image',
                uploadedAt: '2026-07-14 14:20'
            }
        ],
        comments: [
            {
                id: 'comm-1',
                text: 'Make sure the dialog component is responsive and accessible.',
                user: {
                    userId: 2,
                    userName: "sagor@k.com",
                    fullName: "Assaduzzaman Sagor",
                    photoUrl: "https://github.com/maxleiter.png"
                },
                createdAt: '2026-07-14 12:00'
            },
            {
                id: 'comm-2',
                text: 'Added initial styles and @base-ui integration.',
                user: {
                    userId: 1,
                    userName: "uttam@k.com",
                    fullName: "Uttam Kumar",
                    photoUrl: "https://github.com/shadcn.png"
                },
                createdAt: '2026-07-15 09:30'
            }
        ]
    },
    {
        taskId: 2,
        taskTitle: 'Integrate dnd-kit context',
        taskDescription: 'Setup drag and drop sensors, collision detection, and sortable context.',
        priorityType: 'Urgent',
        taskType: 'Feature',
        taskStatus: 'Pending',
        columnId: 2,
        createdAt: "2026-07-12 11:30",
        createdBy: {
            userId: 1,
            userName: "uttam@k.com",
            fullName: "Uttam Kumar",
            photoUrl: "https://github.com/shadcn.png"
        },
        assignee: [
            {
                userId: 2,
                userName: "sagor@k.com",
                fullName: "Assaduzzaman Sagor",
                photoUrl: "https://github.com/maxleiter.png"
            },
        ],
        dueDate: "2026-07-12 11:30",
        attachments: [],
        comments: [
            {
                id: 'comm-3',
                text: 'Testing drag overlay performance with vertical list strategy.',
                user: {
                    userId: 2,
                    userName: "sagor@k.com",
                    fullName: "Assaduzzaman Sagor",
                    photoUrl: "https://github.com/maxleiter.png"
                },
                createdAt: '2026-07-16 15:45'
            }
        ]
    }
]