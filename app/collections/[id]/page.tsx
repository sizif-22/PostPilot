'use client';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter, useParams } from 'next/navigation';
const Page = () => {
  const router = useRouter();
  const { id } = useParams();
  useEffect(() => {
    router.push(`/collections/${id}/Dashboard`);
  }, [router, id]);

  return (
    <section className="flex flex-col items-center justify-center h-screen gap-2">
      <Spinner fontSize={24} />
      <h1 className="text-lg font-serif">Welcome to PostPilot</h1>
    </section>
  );
};

export default Page;
