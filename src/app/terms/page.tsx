import { ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href={"/home"}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Terms of Service
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
              Welcome to PostPilot! These Terms of Service ("Terms") govern your
              use of our social media automation platform and related services
              (the "Service"). By accessing or using PostPilot, you agree to be
              bound by these Terms. If you do not agree to these Terms, please
              do not use our Service.
            </p>
          </section>

          {/* Eligibility */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Eligibility
            </h2>
            <p className="text-gray-700 mb-4">
              You must be at least 18 years old or the age of majority in your
              jurisdiction to use PostPilot. By using our Service, you represent
              and warrant that you meet these requirements.
            </p>
          </section>

          {/* Account Registration */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Account Registration
            </h2>
            <p className="text-gray-700 mb-4">
              To access certain features, you must create an account and provide
              accurate, complete information. You are responsible for
              maintaining the confidentiality of your account credentials and
              for all activities that occur under your account.
            </p>
          </section>

          {/* Acceptable Use */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceptable Use
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mb-4">
              <li>
                Do not use the Service for any unlawful, harmful, or fraudulent
                purpose.
              </li>
              <li>
                Do not attempt to gain unauthorized access to any part of the
                Service or its systems.
              </li>
              <li>
                Do not interfere with or disrupt the integrity or performance of
                the Service.
              </li>
              <li>
                Do not upload or share content that is illegal, offensive, or
                infringes on the rights of others.
              </li>
            </ul>
          </section>

          {/* User Content */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              User Content
            </h2>
            <p className="text-gray-700 mb-4">
              You retain ownership of the content you create and upload to
              PostPilot. By using the Service, you grant us a non-exclusive,
              worldwide, royalty-free license to use, display, and distribute
              your content as necessary to provide the Service.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Intellectual Property
            </h2>
            <p className="text-gray-700 mb-4">
              All intellectual property rights in the Service, including
              software, design, and trademarks, are owned by PostPilot or its
              licensors. You may not use, copy, or distribute any part of the
              Service without our prior written consent.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Termination
            </h2>
            <p className="text-gray-700 mb-4">
              We may suspend or terminate your access to the Service at any
              time, with or without notice, for conduct that violates these
              Terms or is otherwise harmful to PostPilot or other users.
            </p>
          </section>

          {/* Disclaimers & Limitation of Liability */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Disclaimers & Limitation of Liability
            </h2>
            <p className="text-gray-700 mb-4">
              The Service is provided "as is" and "as available" without
              warranties of any kind. To the fullest extent permitted by law,
              PostPilot disclaims all warranties and is not liable for any
              damages arising from your use of the Service.
            </p>
          </section>

          {/* Governing Law */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Governing Law
            </h2>
            <p className="text-gray-700 mb-4">
              These Terms are governed by the laws of your jurisdiction, without
              regard to conflict of law principles.
            </p>
          </section>

          {/* Contact Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Contact Information
            </h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-800">Email</p>
                  <p className="text-gray-700">sheriflotfy22@hotmail.com</p>
                </div>
              </div>
            </div>
          </section>

          {/* Changes to Terms */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Changes to These Terms
            </h2>
            <p className="text-gray-700 mb-4">
              We may update these Terms from time to time. We will notify you of
              any material changes by posting the updated Terms on our website
              or by other means. Your continued use of PostPilot after the
              effective date of any changes constitutes acceptance of the
              revised Terms.
            </p>
          </section>

          {/* Footer Note */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 italic">
              These Terms of Service are designed to be clear and transparent.
              Please review them regularly to stay informed about your rights
              and obligations when using PostPilot.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
