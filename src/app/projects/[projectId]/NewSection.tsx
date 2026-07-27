import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import React, { FC } from 'react';

interface NewSectionProps {
    createNewSection: (newSection: string) => void
}

const NewSection: FC<NewSectionProps> = ({ createNewSection }) => {
    const [newBoardTitle, setNewBoardTitle] = React.useState<string>('');
    const [showCreateBtn, setShowCreateBtn] = React.useState<boolean>(true)

    const handleCreateColumn = (): void => {
        setShowCreateBtn(true);
        if (!newBoardTitle?.trim()) return;
        createNewSection(newBoardTitle);
        setNewBoardTitle('');
    };

    return (
        <div className="border-b border-zinc-100">
            {showCreateBtn ? <Button variant={'outline'} onClick={() => setShowCreateBtn(false)} size="sm" className="text-xs shrink-0 h-9 font-medium px-4">
                <Plus size={15} className="mr-1" /> New Section
            </Button> :
                <Input
                    placeholder="New Section Name"
                    value={newBoardTitle}
                    onChange={(e) => setNewBoardTitle(e.target.value)}
                    className="w-full sm:w-64 h-9 text-sm border-zinc-200 shadow-none bg-zinc-50/50"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateColumn()}
                    onBlur={handleCreateColumn}
                    autoFocus
                />
            }

        </div>
    )
};

export default NewSection;