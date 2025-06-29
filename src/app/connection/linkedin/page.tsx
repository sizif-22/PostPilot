"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import Loading from "@/components/ui/Loading";
import { FiLinkedin, FiCheck, FiAlertCircle } from "react-icons/fi";

interface LinkedInOrganization {
  id: string;
  name: string;
  urn: string;
}

export default function LinkedInCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<LinkedInOrganization[]>(
    []
  );
  const [selectedOrganization, setSelectedOrganization] =
    useState<LinkedInOrganization | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const handleLinkedInAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const channelId = Cookies.get("currentChannel");

      if (!code) {
        setError("No authorization code found");
        setLoading(false);
        return;
      }

      if (!channelId) {
        setError("No channel ID found");
        setLoading(false);
        return;
      }

      try {
        // Exchange code for access token and get organizations
        const response = await fetch(`/api/linkedin/connect?code=${code}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to connect to LinkedIn");
        }

        setAccessToken(data.access_token);
        setOrganizations(data.organizations || []);

        if (data.organizations.length === 0) {
          setError(
            "No organizations found. Please make sure you are an administrator of at least one LinkedIn organization."
          );
        }
      } catch (error: any) {
        console.error("LinkedIn auth error:", error);
        setError(error.message || "Failed to connect to LinkedIn");
      } finally {
        setLoading(false);
      }
    };

    handleLinkedInAuth();
  }, []);

  const handleOrganizationSelect = async () => {
    if (
      !selectedOrganization ||
      !accessToken ||
      !Cookies.get("currentChannel")
    ) {
      return;
    }

    try {
      setLoading(true);
      const channelId = Cookies.get("currentChannel");

      // Save the selected organization to the database
      await updateDoc(doc(db, "Channels", channelId as string), {
        "socialMedia.linkedin": {
          name: selectedOrganization.name,
          urn: selectedOrganization.urn,
          accessToken: accessToken,
          organizationId: selectedOrganization.id,
        },
      });

      // Redirect back to the channel
      router.push(`/channels/${channelId}`);
    } catch (error: any) {
      console.error("Error saving LinkedIn organization:", error);
      setError("Failed to save organization selection");
      setLoading(false);
    }
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
            onClick={() =>
              router.push(`/channels/${Cookies.get("currentChannel")}`)
            }
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
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
          <FiLinkedin className="text-blue-600 text-3xl" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Select LinkedIn Organization
          </h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose the LinkedIn organization you want to connect to PostPilot. You
          can only select organizations where you are an administrator.
        </p>

        {organizations.length === 0 ? (
          <div className="text-center py-8">
            <FiAlertCircle className="text-yellow-500 text-4xl mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No organizations found. Please make sure you are an administrator
              of at least one LinkedIn organization.
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {organizations.map((org) => (
              <div
                key={org.id}
                onClick={() => setSelectedOrganization(org)}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedOrganization?.id === org.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-600"
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <FiLinkedin className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {org.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Organization ID: {org.id}
                      </p>
                    </div>
                  </div>
                  {selectedOrganization?.id === org.id && (
                    <FiCheck className="text-blue-500 text-xl" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() =>
              router.push(`/channels/${Cookies.get("currentChannel")}`)
            }
            className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={handleOrganizationSelect}
            disabled={!selectedOrganization}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed">
            {loading ? "Connecting..." : "Connect Organization"}
          </button>
        </div>
      </div>
    </div>
  );
}
