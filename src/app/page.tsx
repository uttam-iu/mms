'use client';

import Loader from '@/components/Loader';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function Home() {
  const router = useRouter();

  React.useEffect(() => {
    router.push('/months');
  }, [router])

  return <div className='flex justify-center items-center h-full w-full'>
    <Loader />
  </div>
}
