import { Coins, Handbag, Settings, Summary, User, Users, Utensils } from "lucide-react"

export const getMenuData = (pathname: string) => {
    return [
              {
                tooltip: 'My Profile',
                label: 'My Profile',
                href: '/profile',
                icon: User,
                isActive: pathname === '/profile',
              },
              {
                tooltip: 'Summary',
                label: 'Summary',
                href: '/summary',
                icon: Summary,
                isActive: pathname === '/summary' || pathname?.startsWith('/summary?'),
              },
              {
                tooltip: 'Meal Matrix',
                label: 'Meal Matrix',
                href: '/meal-matrix',
                icon: Utensils,
                isActive: pathname === '/meal-matrix' || pathname?.startsWith('/meal-matrix?'),
              },
              {
                tooltip: 'Bazar Expenses',
                label: 'Bazar Expenses',
                href: '/bazar-expenses',
                icon: Handbag,
                isActive: pathname === '/bazar-expenses' || pathname?.startsWith('/bazar-expenses?'),
              },
              {
                tooltip: 'Fixed Utilities',
                label: 'Fixed Utilities',
                href: '/fixed-utilities',
                icon: Settings,
                isActive: pathname === '/fixed-utilities' || pathname?.startsWith('/fixed-utilities?'),
              },
              {
                tooltip: 'Members Management',
                label: 'House Members',
                href: '/members',
                icon: Users,
                isActive: pathname === '/members' || pathname?.startsWith('/members?'),
              },
              {
                tooltip: 'Deposit Collection',
                label: 'Deposit Collection',
                href: '/deposit-collection',
                icon: Coins,
                isActive: pathname === '/deposit-collection' || pathname?.startsWith('/deposit-collection?'),
              },
            //   {
            //     tooltip: 'Discussion',
            //     label: 'Discussion',
            //     href: '/discussion',
            //     icon: MessageSquareText,
            //     isActive: pathname === '/discussion' || pathname?.startsWith('/discussion?'),
            //   },
            ]
}