'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
// import Loading from "@/components/ui/Loading";
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
// import { facebookChannel, instagramChannel, Page } from "@/interfaces/Channel";
import { Id } from '@/convex/_generated/dataModel';
import { encrypt } from '@/utils/encryption';
import { api } from '@/convex/_generated/api';
import { getPages } from './server-actions/facebook/get-pages';
import { Spinner } from '@/components/ui/spinner';
import { facebookChannelInterface, instagramChannelInterface } from '@/convex/connectCollection';
export interface Page {
  name: string;
  access_token: string;
  id: string;
  instagram_id?: string;
}

interface BusinessAccount {
  id: string;
  name: string;
  pages: Page[];
}

interface StandalonePage {
  id: string;
  name: string;
  access_token: string;
  instagram_id?: string;
}

interface EnhancedPage {
  id: string;
  name: string;
  access_token: string;
  instagram_id?: string;
  businessAccountName?: string;
  isStandalone?: boolean;
}

// Utility to deduplicate pages by id
function deduplicatePages(businessAccounts: BusinessAccount[], standalonePages: StandalonePage[]) {
  const seen = new Set<string>();
  const allPages: EnhancedPage[] = [];

  // Add business account pages first
  businessAccounts.forEach((business) => {
    business.pages.forEach((page) => {
      if (!seen.has(page.id)) {
        allPages.push({
          ...page,
          businessAccountName: business.name,
          isStandalone: false,
        });
        seen.add(page.id);
      }
    });
  });

  // Add standalone pages only if not already present
  standalonePages.forEach((page) => {
    if (!seen.has(page.id)) {
      allPages.push({ ...page, isStandalone: true });
      seen.add(page.id);
    }
  });

  return allPages;
}

// This page is specifically for Facebook connection - we'll create a general connection selector page
// For now, we'll redirect to the main connection page which should handle multiple platforms
const Connection = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPage, setSelectedPage] = useState<EnhancedPage | null>(null);
  const connectFacebook = useMutation(api.connectCollection.connectFacebook);
  const connectInstagram = useMutation(api.connectCollection.connectInstagram);

  // const [businessAccounts, setBusinessAccounts] = useState<BusinessAccount[]>(
  //   []
  // );
  // const [standalonePages, setStandalonePages] = useState<StandalonePage[]>([]);
  const [allPages, setAllPages] = useState<EnhancedPage[]>([]);

  const id = Cookies.get('currentChannel');
  const collectionId = id as Id<'collection'>;
  useEffect(() => {
    if (!id) {
      setError('No valid channel ID found. Please go back to dashboard and try again.');
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id || typeof window === 'undefined') return;

    const getAccessToken = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          console.log('No authorization code found');
          setError('No authorization code found in URL');
          setLoading(false);
          return;
        }

        const data = await getPages(code.split('&')[0]);
        // const response = await fetch(
        //   `/api/facebook/connect?code=${code.split("&")[0]}`
        // );
        // const data = await response.json();

        // if (!response.ok) {
        //   throw new Error(data.error || "Failed to get access token");
        // }

        // setBusinessAccounts(data.business_accounts || []);
        // setStandalonePages(data.standalone_pages || []);
        // Deduplicate pages for display
        setAllPages(deduplicatePages(data.business_accounts || [], data.standalone_pages || []));

        if ((data.business_accounts?.length ?? 0) + (data.standalone_pages?.length ?? 0) === 0) {
          throw new Error('No pages found. Please make sure you have access to at least one Facebook page.');
        }
      } catch (err: unknown) {
        console.error('Error getting access token:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    getAccessToken();
  }, [id, router]);

  const handlePageSelection = async () => {
    try {
      if (!selectedPage) {
        setError('Please select a page');
        return;
      }
      // let updateData: any = {
      //   'socialMedia.facebook': null,
      //   'socialMedia.instagram': null,
      // };
      // await updateDoc(doc(db, 'Channels', id as string), updateData);

      // const projectRef = doc(db, 'Channels', id as string);
      // const { businessAccountName, isStandalone, ...rest } = selectedPage;
      const encryptedAccessToken: string = await encrypt(selectedPage.access_token);
      const facebookData = {
        name: selectedPage.name,
        id: selectedPage.id,
        accessToken: encryptedAccessToken,
      };
      // updateData = {
      //   'socialMedia.facebook': facebookData as facebookChannel,
      // };
      await connectFacebook({
        collectionId: collectionId,
        facebookChannel: facebookData as facebookChannelInterface,
      });
      // If instagram_id exists, fetch Instagram profile data
      if (selectedPage.instagram_id) {
        // Fetch Instagram profile data from Graph API
        const igProfileRes = await fetch(
          `https://graph.facebook.com/v19.0/${selectedPage.instagram_id}?fields=username,name,profile_picture_url&access_token=${selectedPage.access_token}`,
        );
        if (!igProfileRes.ok) throw new Error('Failed to fetch Instagram profile');
        const igProfile = await igProfileRes.json();
        const encryptedAccessToken: string = await encrypt(selectedPage.access_token);
        const instagramData = {
          pageId: selectedPage.id,
          pageName: selectedPage.name,
          pageAccessToken: encryptedAccessToken,
          instagramId: selectedPage.instagram_id,
          instagramUsername: igProfile.username || '',
          instagramName: igProfile.name || '',
          profilePictureUrl: igProfile.profile_picture_url || '',
        };
        await connectInstagram({
          collectionId: collectionId,
          instagramChannel: instagramData as instagramChannelInterface,
        });
      }
      // await updateDoc(projectRef, updateData);
      router.replace(`/collections/${id}`);
    } catch (err) {
      console.error('Error updating page selection:', err);
      setError('Failed to save page selection');
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
      <div className="h-screen flex items-center justify-center">
        <h1>Error: {error}</h1>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg w-[90vw] md:w-[60vw] lg:w-[50vw] p-6 pb-20 relative">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Choose a Facebook Page</h1>
          <p className="text-sm text-gray-500 mt-1">Select the page you want to connect to your account</p>
        </div>
        <div className="flex flex-col gap-6 overflow-y-auto min-h-[50vh] max-h-[70vh] pr-2">
          {/* Deduplicated Pages Section */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-blue-700">Pages</h2>
            <div className="flex flex-col gap-2">
              {allPages.map((page) => (
                <div
                  onClick={() => setSelectedPage(page)}
                  key={page.id}
                  className={`flex items-center justify-between group cursor-pointer transition-all duration-200 border hover:border-violet-400 ${
                    selectedPage?.id === page.id && selectedPage?.isStandalone === page.isStandalone
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  } p-4 rounded-lg`}
                >
                  <div className="flex flex-col gap-1">
                    <h2
                      className={`font-medium ${
                        selectedPage?.id === page.id && selectedPage?.isStandalone === page.isStandalone
                          ? 'text-violet-700'
                          : 'text-gray-900'
                      } group-hover:text-violet-700`}
                    >
                      {page.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">ID: {page.id}</span>
                      {page.instagram_id ? (
                        <span className="ml-2 px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-semibold">
                          FB + IG
                        </span>
                      ) : (
                        <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                          FB Only
                        </span>
                      )}
                      {page.businessAccountName && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold">
                          {page.businessAccountName}
                        </span>
                      )}
                      {page.isStandalone && (
                        <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold">
                          Standalone
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPage?.id === page.id && selectedPage?.isStandalone === page.isStandalone
                        ? 'border-violet-500 bg-violet-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {selectedPage?.id === page.id && selectedPage?.isStandalone === page.isStandalone && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handlePageSelection}
            disabled={!selectedPage}
            className="w-40 bg-violet-600 text-white py-2 px-4 rounded-lg hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Connect Page
          </Button>
        </div>
      </div>
    </div>
  );
};
export default Connection;
