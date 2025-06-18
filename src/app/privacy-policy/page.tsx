import { ArrowLeft, Shield, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={"/home"}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Privacy Policy
                </h1>
                <p className="text-sm text-gray-600">
                  Last updated: June 17, 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Introduction */}
          <section className="mb-8">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              PostPilot {" "}
              {/* ("we," "our," or "us") */}
               is committed to protecting your
              privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our social media
              automation platform and related services (the "Service").
            </p>
            <p className="text-gray-700 leading-relaxed">
              By using PostPilot, you agree to the collection and use of
              information in accordance with this Privacy Policy. If you do not
              agree with our policies and practices, please do not use our
              Service.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Information We Collect
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Personal Information
                </h3>
                <p className="text-gray-700 mb-3">
                  We collect information that directly identifies you,
                  including:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>
                    <strong>Account Information:</strong> Name, email address,
                     and password
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Social Media Account Information
                </h3>
                <p className="text-gray-700 mb-3">
                  To provide our automation services, we collect:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>
                    <strong>Social Media Credentials:</strong> Access tokens and
                    authentication information for your connected social media
                    accounts
                  </li>
                  <li>
                    <strong>Account Details:</strong> 
                    Profile information,{" "}
                    {/* follower counts, */}
                    and engagement metrics from your connected
                    platforms
                  </li>
                  <li>
                    <strong>Content Data:</strong> Posts, images, videos,
                    captions, and scheduling information you create or upload
                  </li>
                </ul>
              </div>

              {/* <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  Usage Information
                </h3>
                <p className="text-gray-700 mb-3">
                  We automatically collect information about how you use our
                  Service:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>
                    <strong>Device Information:</strong> IP address, browser
                    type, operating system, device identifiers
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Pages visited, features used,
                    time spent on the platform, click patterns
                  </li>
                  <li>
                    <strong>Log Data:</strong> Server logs, error reports, and
                    system activity
                  </li>
                  <li>
                    <strong>Analytics Data:</strong> Performance metrics,
                    engagement statistics, and usage patterns
                  </li>
                </ul>
              </div> */}
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How We Use Your Information
            </h2>
            <p className="text-gray-700 mb-4">
              We use the collected information for the following purposes:
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">
                  Service Delivery
                </h3>
                <ul className="text-purple-800 space-y-2 text-sm">
                  <li>• Provide, maintain, and improve our platform</li>
                  <li>• Schedule and publish social media content</li>
                  <li>• Generate analytics and performance reports</li>
                  <li>• Facilitate account connections and integrations</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Account Management
                </h3>
                <ul className="text-blue-800 space-y-2 text-sm">
                  <li>• Create and manage your PostPilot account</li>
                  <li>
                    • Authenticate identity and prevent unauthorized access
                  </li>
                  <li>• Process payments and manage billing</li>
                  <li>• Provide customer support and assistance</li>
                </ul>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">
                  Communication
                </h3>
                <ul className="text-green-800 space-y-2 text-sm">
                  <li>• Send service-related notifications and updates</li>
                  <li>• Provide customer support and technical assistance</li>
                  <li>• Send marketing communications (with consent)</li>
                  <li>• Conduct surveys and gather feedback</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-900 mb-3">
                  Analytics & Improvement
                </h3>
                <ul className="text-orange-800 space-y-2 text-sm">
                  <li>• Analyze usage patterns to improve our Service</li>
                  <li>• Develop new features and functionality</li>
                  <li>• Monitor and analyze performance metrics</li>
                  <li>• Conduct research and data analysis</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Security
            </h2>
            <p className="text-gray-700 mb-4">
              We implement comprehensive security measures to protect your
              information:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Technical Safeguards
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>
                      • <strong>Encryption:</strong> All data transmissions use
                      SSL/TLS protocols
                    </li>
                    <li>
                      • <strong>Secure Storage:</strong> Encrypted databases
                      with restricted access
                    </li>
                    <li>
                      • <strong>Access Controls:</strong> Multi-factor
                      authentication and role-based access
                    </li>
                    <li>
                      • <strong>Security Audits:</strong> Regular assessments
                      and vulnerability testing
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Organizational Measures
                  </h3>
                  <ul className="text-gray-700 space-y-2">
                    <li>
                      • <strong>Employee Training:</strong> Regular privacy and
                      security training
                    </li>
                    <li>
                      • <strong>Access Limitations:</strong> Strict need-to-know
                      access policies
                    </li>
                    <li>
                      • <strong>Incident Response:</strong> Established breach
                      handling procedures
                    </li>
                    <li>
                      • <strong>Data Minimization:</strong> Only collect
                      necessary information
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Your Privacy Rights */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Your Privacy Rights
            </h2>
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights
              regarding your personal information:
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Access and Portability
                </h3>
                <p className="text-gray-700 text-sm">
                  Request access to your personal information and obtain a copy
                  in a portable format.
                </p>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Correction and Updates
                </h3>
                <p className="text-gray-700 text-sm">
                  Update or correct inaccurate personal information and modify
                  account settings.
                </p>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Deletion and Restriction
                </h3>
                <p className="text-gray-700 text-sm">
                  Request deletion of your personal information or restrict
                  processing of your data.
                </p>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">
                  Withdrawal of Consent
                </h3>
                <p className="text-gray-700 text-sm">
                  Withdraw consent for marketing communications and disconnect
                  social media accounts.
                </p>
              </div>
            </div>
          </section>

          {/* Information Sharing */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Information Sharing and Disclosure
            </h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information in the following
              circumstances:
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Service Providers
                </h3>
                <p className="text-gray-700">
                  We work with trusted third-party service providers including
                  cloud hosting (AWS, Google Cloud), payment processing (Stripe,
                  PayPal), analytics services, and customer support systems.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Social Media Platforms
                </h3>
                <p className="text-gray-700">
                  We share content and data with Facebook, Instagram,{" "}
                   {/* Twitter, LinkedIn, */}
                    TikTok, and other connected platforms to provide our
                  automation services.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Legal Requirements
                </h3>
                <p className="text-gray-700">
                  We may disclose information if required by law, court orders,
                  government investigations, or to protect our rights and
                  prevent fraud.
                </p>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Data Retention
            </h2>
            <p className="text-gray-700 mb-4">
              We retain your information for as long as necessary to provide our
              services and comply with legal obligations:
            </p>

            <div className="bg-blue-50 p-6 rounded-lg">
              <ul className="text-blue-900 space-y-2">
                <li>
                  • <strong>Account Information:</strong> Retained while active
                  and up to 3 years after closure
                </li>
                <li>
                  • <strong>Content Data:</strong> Stored during subscription
                  and up to 1 year after cancellation
                </li>
                <li>
                  • <strong>Usage Data:</strong> Aggregated data may be retained
                  indefinitely for analytics
                </li>
                <li>
                  • <strong>Legal Compliance:</strong> Some information retained
                  longer for legal requirements
                </li>
              </ul>
              <p className="text-blue-800 mt-4 text-sm">
                You can request deletion of your data at any time by contacting
                us at privacy@postpilot.com.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Information
            </h2>
            <p className="text-gray-700 mb-4">
              If you have questions, concerns, or requests regarding this
              Privacy Policy, please contact us:
            </p>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Email</p>
                    <p className="text-gray-700">sheriflotfy22@hotmail.com</p>
                  </div>
                </div>

                {/* <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Phone</p>
                    <p className="text-gray-700">[Your Phone Number]</p>
                  </div>
                </div> */}

                {/* <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Address</p>
                    <p className="text-gray-700">[Your Company Address]</p>
                  </div>
                </div> */}
              </div>

              {/* <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  For urgent privacy matters or security concerns, please
                  contact us immediately at{" "}
                  <a
                    href="mailto:security@postpilot.com"
                    className="text-purple-600 hover:underline"
                  >
                    security@postpilot.com
                  </a>
                </p>
              </div> */}
            </div>
          </section>

          {/* Changes to Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 mb-4">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>Posting the updated policy on our website</li>
              <li>
                Sending an email notification to your registered email address
              </li>
              <li>Displaying a prominent notice on our platform</li>
            </ul>
            <p className="text-gray-700">
              Your continued use of PostPilot after the effective date of any
              changes constitutes acceptance of the revised Privacy Policy.
            </p>
          </section>

          {/* Footer Note */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 italic">
              This Privacy Policy is designed to be transparent about our data
              practices while ensuring compliance with applicable privacy laws
              including GDPR, CCPA, and other regional regulations. We are
              committed to protecting your privacy and maintaining your trust as
              you use PostPilot to manage your social media presence.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
