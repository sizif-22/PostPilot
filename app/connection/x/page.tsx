// 3. Updated page.tsx - callback handler
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
// import { db } from "@/firebase/config";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import Loading from "@/components/ui/Loading";
import { FiCheck, FiAlertCircle } from 'react-icons/fi';
import { FaTwitter } from 'react-icons/fa';
import { encrypt } from '@/utils/encryption';
// import axios from "axios";
// import { refreshXFunc } from './server-action';
// import { Channel } from "@/interfaces/Channel";
import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Id } from '@/convex/_generated/dataModel';
import { Spinner } from '@/components/ui/spinner';
import { xChannelInterface } from '@/convex/connectCollection';
interface XUserProfile {
  id: string;
  name: string;
  username: string;
}

export default function XCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<XUserProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);
  const connectX = useMutation(api.connectCollection.connectX);
  useEffect(() => {
    const handleXAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const channelId = Cookies.get('currentChannel');

      // Check for OAuth errors
      if (error) {
        setError(`OAuth error: ${error}`);
        setLoading(false);
        return;
      }

      if (!code) {
        setError('No authorization code found');
        setLoading(false);
        return;
      }

      if (!channelId) {
        setError('No channel ID found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/x/connect?code=${code}&state=${state}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to connect to X');
        }

        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setExpiresIn(data.expires_in);
        setUserProfile(data.user || null);

        if (!data.user) {
          setError('No user profile found. Please try again.');
        }
      } catch (error: unknown) {
        console.error('X auth error:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Failed to connect to X');
        }
      } finally {
        setLoading(false);
      }
    };

    handleXAuth();
  }, []);

  const handleConnect = async () => {
    if (!userProfile || !accessToken || !refreshToken || !Cookies.get('currentChannel')) {
      return;
    }

    try {
      setLoading(true);
      const id = Cookies.get('currentChannel');
      const collectionId = id as Id<'collection'>;
      const encryptedAccessToken: string = await encrypt(accessToken);
      const encryptedRefreshToken: string = await encrypt(refreshToken);
      const XData = {
        name: userProfile.name,
        username: userProfile.username,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresIn: expiresIn,
        tokenExpiry: expiresIn ? new Date(Date.now() + expiresIn * 1000).toString() : null,
        userId: userProfile.id,
        isPersonal: true,
      };

      // await updateDoc(doc(db, "Channels", channelId as string), {
      //   "socialMedia.x": XData,
      // });

      // const channel = (
      //   await getDoc(doc(db, "Channels", channelId as string))
      // ).data() as Channel;
      await connectX({ collectionId, xChannel: XData as xChannelInterface });
      // if (channel.socialMedia?.Tox !== true) {
      //   await refreshXFunc(channelId as string);
      //   await updateDoc(doc(db, 'Channels', channelId as string), {
      //     'socialMedia.Tox': true,
      //   });
      // }
      router.push(`/connection/x/connect-v1`);
    } catch (error: unknown) {
      console.error('Error saving X profile:', error);
      if (error instanceof Error) {
        setError('Failed to save profile selection');
      } else {
        setError('An unknown error occurred while saving the profile.');
      }
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="flex items-center justify-center h-screen">
        <Spinner />
      </section>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center">
        <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-8 max-w-md w-full mx-4 shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className="text-red-500 text-2xl" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Connection Error</h2>
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Connect X Account</h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">Confirm your X account connection to PostPilot.</p>

        {userProfile && (
          <div className="p-4 border border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <FaTwitter className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">{userProfile.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">@{userProfile.username}</p>
              </div>
              <FiCheck className="text-blue-500 text-2xl ml-auto" />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/collections/${Cookies.get('currentChannel')}`)}
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConnect}
            disabled={!userProfile}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            Connect Account
          </button>
        </div>
      </div>
    </div>
  );
}
