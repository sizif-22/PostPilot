'use client';
import { useRouter } from 'next/navigation';
import Loading from '@/components/ui/Loading';
export const Page = () => {
  const router = useRouter();
  router.replace('/');
  return <Loading/>;
}
export default Page;
