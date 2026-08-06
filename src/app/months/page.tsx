'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import MonthDetails from './MonthDetails';
import React from 'react';
import { MONTH_LIST } from '@/lib/utils';

export default function MonthsRootPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const currentMonth = searchParams?.get('month');
    const currentYear = searchParams?.get('year');

    if (!currentMonth || !currentYear) {
      const prms = {
        month: currentMonth || MONTH_LIST[new Date().getMonth()].value,
        year: currentYear || new Date().getFullYear().toString(),
      };
      const query = new URLSearchParams(prms);
      router.replace(`/months?${query.toString()}`);
    }
  }, [searchParams, router]);

  return <MonthDetails />;
}
