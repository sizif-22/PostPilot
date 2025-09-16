"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { db } from "@/firebase/config";
import { doc, updateDoc } from "firebase/firestore";
import Loading from "@/components/ui/Loading";
import {
  FiLinkedin,
  FiCheck,
  FiAlertCircle,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { LinkedinChannel } from "@/interfaces/Channel";
import { decrypt, encrypt, isValidEncryptedFormat } from "@/utils/encryption";

interface LinkedInOrganization {
  id: string;
  name: string;
  urn: string;
  type: "organization";
  vanityName?: string;
  profileUrl?: string;
}

interface LinkedInPersonalAccount {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  type: "personal";
  vanityName?: string;
  profileUrl?: string;
  profilePicture?: string;
  headline?: string;
}

type LinkedInAccount = LinkedInPersonalAccount | LinkedInOrganization;

export default function LinkedInCallbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connectingLoading, setConnectingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [personalAccount, setPersonalAccount] =
    useState<LinkedInPersonalAccount | null>(null);
  const [organizations, setOrganizations] = useState<LinkedInOrganization[]>(
    []
  );
  const [selectedAccount, setSelectedAccount] =
    useState<LinkedInAccount | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const handleLinkedInAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const channelId = Cookies.get("currentChannel");

      if (!code) {
        setError("No authorization code found in URL");
        setLoading(false);
        return;
      }

      if (!channelId) {
        setError("No channel ID found in cookies");
        setLoading(false);
        return;
      }

      try {
        console.log("Starting LinkedIn authentication process...");

        // Exchange code for access token and get user data
        const response = await fetch(`/api/linkedin/connect?code=${code}`);
        const data = await response.json();

        console.log("LinkedIn API response:", data);

        if (!response.ok) {
          console.error("LinkedIn API error:", data);
          throw new Error(data.error || "Failed to connect to LinkedIn");
        }

        if (!data.access_token) {
          throw new Error("No access token received from LinkedIn");
        }

        setAccessToken(data.access_token);

        // Set personal account if available
        if (data.personal_account) {
          console.log("Personal account found:", data.personal_account);
          setPersonalAccount(data.personal_account);
        }

        // Set organizations if available
        if (data.organizations && data.organizations.length > 0) {
          console.log("Organizations found:", data.organizations);
          setOrganizations(data.organizations);
        }

        // Auto-select the first available account
        if (data.personal_account) {
          setSelectedAccount(data.personal_account);
          console.log("Auto-selected personal account");
        } else if (data.organizations && data.organizations.length > 0) {
          setSelectedAccount(data.organizations[0]);
          console.log("Auto-selected first organization");
        }

        // Log debug info if available
        if (data.debug_info) {
          console.log("Debug info:", data.debug_info);
        }
      } catch (error: any) {
        console.error("LinkedIn auth error:", error);
        setError(
          error.message || "Failed to connect to LinkedIn. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    handleLinkedInAuth();
  }, []);

  const handleAccountSelect = async () => {
    if (!selectedAccount || !accessToken || !Cookies.get("currentChannel")) {
      console.error("Missing required data for account selection");
      return;
    }

    try {
      setConnectingLoading(true);
      const channelId = Cookies.get("currentChannel");

      console.log("Starting account save process...");
      console.log("Selected account:", selectedAccount);

      // Encrypt the access token
      console.log("Encrypting LinkedIn access token...");
      const encryptedAccessToken = await encrypt(accessToken);

      // Validate encryption
      if (!isValidEncryptedFormat(encryptedAccessToken)) {
        throw new Error("Failed to encrypt access token in the correct format");
      }

      // Test decryption to ensure it works
      try {
        const testDecrypt = await decrypt(encryptedAccessToken);
        if (testDecrypt !== accessToken) {
          throw new Error("Encryption/decryption validation failed");
        }
        console.log("Access token encryption validated successfully");
      } catch (validationError) {
        console.error("Encryption validation failed:", validationError);
        throw new Error("Failed to properly encrypt the access token");
      }

      // Prepare LinkedIn data based on account type
      let linkedinData: LinkedinChannel;

      if (selectedAccount.type === "personal") {
        const personalAcc = selectedAccount as LinkedInPersonalAccount;
        linkedinData = {
          name: personalAcc.name,
          accountType: "personal",
          accessToken: encryptedAccessToken,
          accountId: personalAcc.id,
          firstName: personalAcc.firstName,
          lastName: personalAcc.lastName,
          url: "https://www.linkedin.com/feed/",
        } as LinkedinChannel;
      } else {
        const orgAcc = selectedAccount as LinkedInOrganization;
        linkedinData = {
          name: orgAcc.name,
          accountType: "organization",
          urn: orgAcc.urn,
          accessToken: encryptedAccessToken,
          accountId: orgAcc.id,
          url: orgAcc.profileUrl || "#",
        } as LinkedinChannel;
      }

      console.log("Prepared LinkedIn data:", {
        ...linkedinData,
        accessToken: "[ENCRYPTED]",
      });

      // Save to Firestore
      console.log("Saving to Firestore...");
      await updateDoc(doc(db, "Channels", channelId as string), {
        "socialMedia.linkedin": linkedinData,
      });

      console.log("LinkedIn account saved successfully");

      // Clean up cookies
      Cookies.remove("currentChannel");

      // Redirect back to the channel
      router.push(`/collections/${channelId}`);
    } catch (error: any) {
      console.error("Error saving LinkedIn account:", error);
      setError("Failed to save account selection: " + error.message);
      setConnectingLoading(false);
    }
  };

  // Combine all accounts for display
  const allAccounts: LinkedInAccount[] = [
    ...(personalAccount ? [personalAccount] : []),
    ...organizations,
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-darkBackground flex items-center justify-center p-4">
        <div className="bg-white dark:bg-secondDarkBackground rounded-lg p-8 max-w-md w-full shadow-lg dark:shadow-[0_4px_32px_0_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3 mb-4">
            <FiAlertCircle className="text-red-500 text-2xl flex-shrink-0" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Connection Error
            </h2>
          </div>
          <div className="text-gray-600 dark:text-gray-400 mb-6">
            <p className="mb-2">{error}</p>
            <p className="text-sm">
              Please make sure you have granted the necessary permissions and
              try again.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() =>
                router.push(`/collections/${Cookies.get("currentChannel")}`)
              }
              className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors">
              Back to Channel
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Try Again
            </button>
          </div>
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
            Select LinkedIn Account
          </h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose which LinkedIn account you want to connect to your channel. You
          can connect to your personal account or any organizations where you
          are an administrator.
        </p>

        {allAccounts.length === 0 ? (
          <div className="text-center py-8">
            <FiAlertCircle className="text-yellow-500 text-4xl mx-auto mb-4" />
            <div className="text-gray-600 dark:text-gray-400">
              <p className="mb-2">No LinkedIn accounts found.</p>
              <p className="text-sm">
                Please make sure you have access to your LinkedIn account or are
                an administrator of at least one LinkedIn organization.
              </p>
            </div>
            <button
              onClick={() =>
                router.push(`/collections/${Cookies.get("currentChannel")}`)
              }
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Back to Channel
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-6">
              {/* Personal Account Section */}
              {personalAccount && (
                <>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Personal Account
                  </div>
                  <div
                    onClick={() => setSelectedAccount(personalAccount)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedAccount?.id === personalAccount.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                        : "border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center overflow-hidden">
                          {personalAccount.profilePicture ? (
                            <img
                              src={personalAccount.profilePicture}
                              alt={personalAccount.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiUser className="text-blue-600 dark:text-blue-400 text-xl" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {personalAccount.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {personalAccount.headline ||
                              "Personal LinkedIn Account"}
                          </p>
                          {personalAccount.profileUrl && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              {personalAccount.profileUrl}
                            </p>
                          )}
                        </div>
                      </div>
                      {selectedAccount?.id === personalAccount.id && (
                        <FiCheck className="text-blue-500 text-xl flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Organizations Section */}
              {organizations.length > 0 && (
                <>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-6">
                    Organizations You Manage ({organizations.length})
                  </div>
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      onClick={() => setSelectedAccount(org)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedAccount?.id === org.id
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm"
                          : "border-gray-200 dark:border-darkBorder hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                      }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <FiUsers className="text-blue-600 dark:text-blue-400 text-xl" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {org.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Organization • ID: {org.id}
                            </p>
                            {org.profileUrl && (
                              <p className="text-xs text-blue-600 dark:text-blue-400">
                                {org.profileUrl}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedAccount?.id === org.id && (
                          <FiCheck className="text-blue-500 text-xl flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t dark:border-darkBorder">
              <button
                onClick={() =>
                  router.push(`/collections/${Cookies.get("currentChannel")}`)
                }
                disabled={connectingLoading}
                className="flex-1 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-darkBorder rounded-lg transition-colors disabled:opacity-50 font-medium">
                Cancel
              </button>
              <button
                onClick={handleAccountSelect}
                disabled={!selectedAccount || connectingLoading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:cursor-not-allowed">
                {connectingLoading ? "Connecting..." : "Connect Account"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
