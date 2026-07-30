'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function MonthsRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/months/january?year=2026&month=january');
  }, [router]);

  return (
    <div className="flex h-full w-full items-center justify-center min-h-[400px]">
      <Loader />
    </div>
  );
}
