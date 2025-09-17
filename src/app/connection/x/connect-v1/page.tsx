'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { db } from '@/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { encrypt } from '@/utils/encryption';
import Loading from '@/components/ui/Loading';
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import { FaTwitter } from 'react-icons/fa';

export default function XConnectV1Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleV1Auth = async () => {
      const oauthToken = searchParams.get('oauth_token');
      const oauthVerifier = searchParams.get('oauth_verifier');
      const channelId = Cookies.get('currentChannel');

      if (!channelId) {
        setError('No channel ID found. Please reconnect from the beginning.');
        setLoading(false);
        return;
      }

      // If callback parameters are not present, it means we need to initiate the flow.
      if (!oauthToken || !oauthVerifier) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/x/connect-v1/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ oauth_token: oauthToken, oauth_verifier: oauthVerifier }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to connect to X v1');
        }

        const encryptedV1aAccessToken = await encrypt(data.v1aAccessToken);
        const encryptedV1aAccessSecret = await encrypt(data.v1aAccessSecret);

        await updateDoc(doc(db, 'Channels', channelId), {
          'socialMedia.x.v1aAccessToken': encryptedV1aAccessToken,
          'socialMedia.x.v1aAccessSecret': encryptedV1aAccessSecret,
        });

        router.push(`/collections/${channelId}`);
      } catch (error: any) {
        console.error('X v1 auth error:', error);
        setError(error.message || 'Failed to connect to X v1');
        setLoading(false);
      }
    };

    handleV1Auth();
  }, [searchParams, router]);

  const handleConnectV1 = () => {
    router.push('/api/x/connect-v1');
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center">
        <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-8 max-w-md w-full mx-4 shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className="text-red-500 text-2xl" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Connection Error
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push(`/collections/${Cookies.get('currentChannel')}`)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to Channel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center p-4">
      <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-8 max-w-2xl w-full shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
        <div className="flex items-center gap-3 mb-6">
          <FaTwitter className="text-blue-600 text-3xl" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Connect X for Video (Step 2 of 2)
          </h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          To enable video uploads, an additional connection is required. This is due to changes in the X API. Please click the button below to proceed.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/collections/${Cookies.get('currentChannel')}`)}
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder rounded-lg transition-colors"
          >
            Skip for now
          </button>
          <button
            onClick={handleConnectV1}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Connect for Video Uploads
          </button>
        </div>
      </div>
    </div>
  );
}
