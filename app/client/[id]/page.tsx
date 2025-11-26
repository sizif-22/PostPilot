'use client';
import { useEffect, useState } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useParams } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

const Page = () => {
  const params = useParams();
  const sessionId = params.id as Id<'sessions'>;
  const validateSession = useMutation(api.sessions.validateSession);
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      try {
        const result = await validateSession({ sessionId });
        if (result.valid) {
          setStatus('valid');
        } else {
          setStatus('invalid');
          setError(result.reason === 'not_found' ? 'Session not found' :
            result.reason === 'expired' ? 'Session expired' :
              'Session limit reached');
        }
      } catch (e) {
        setStatus('invalid');
        setError('Invalid session ID');
      }
    };

    if (sessionId) {
      checkSession();
    }
  }, [sessionId, validateSession]);

  if (status === 'loading') {
    return (
      <section className="flex flex-col items-center justify-center h-screen gap-2">
        <Spinner fontSize={24} />
        <h1 className="text-lg font-serif">Loading Session...</h1>
      </section>
    );
  }

  if (status === 'invalid') {
    return (
      <section className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-4xl font-bold text-destructive">404</h1>
        <p className="text-xl text-muted-foreground">{error}</p>
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold text-primary">Session Active</h1>
      <p className="text-muted-foreground">You are in a valid session.</p>
      {/* Future client interface goes here */}
    </section>
  );
};

export default Page;
