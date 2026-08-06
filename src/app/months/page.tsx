'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import MonthDetails from './MonthDetails';
import React from 'react';
import { MONTH_LIST } from '@/lib/utils';

export default function MonthsRootPage() {
  const router = useRouter();
  const searchParams = useSearchParams()


  React.useEffect(() => {
    if (!searchParams?.get('month') || !searchParams?.get('year')) {
      const query = new URLSearchParams({
        year: new Date().getFullYear().toString(),
        month: MONTH_LIST[new Date().getMonth()].value,
      });
      router.replace(`/months?${query.toString()}`);
    }
  }, []);

  return (
    <MonthDetails />
    // <div className="flex h-full w-full items-center justify-center min-h-[400px]">
    //   <Loader />
    // </div>
  );
}
