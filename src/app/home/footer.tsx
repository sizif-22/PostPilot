import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="py-12 px-6 dark:bg-[#08080c]/90 bg-gray-50 dark:border-t dark:border-violet-900/50 border-t border-violet-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h4 className="text-xl font-PlaywriteHU dark:text-violet-400 text-violet-700 font-bold">
              PostPilot
            </h4>
            <p className="dark:text-zinc-400 text-gray-600 text-sm">
              Automate your social media presence with intelligent scheduling
              and analytics.
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold dark:text-white text-gray-900">
              Product
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#about"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a
                  href="#features"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#platforms"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Supported Platforms
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold dark:text-white text-gray-900">
              Company
            </h5>
            <ul className="space-y-2 text-sm">
              {/* <li>
                <a
                  href="#about"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  About
                </a>
              </li> */}
              <li>
                <a
                  href="mailto:sheriflotfy22@hotmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="https://www.webbingstone.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Webbingstone
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold dark:text-white text-gray-900">
              Legal
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/privacy-policy"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Credits Section */}
        <div className="border-t dark:border-violet-900 border-violet-200 mt-8 pt-8">
          <div className="flex flex-col items-center justify-center gap-6 mb-6">
            {/* Webbingstone - Company */}
            {/* <div className="flex flex-col items-center gap-2">
              <span className="text-xs dark:text-zinc-600 text-gray-400 uppercase tracking-wider">
                A Product by
              </span>
              <Link
                href="https://www.webbingstone.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-2.5 rounded-full dark:bg-violet-950/30 bg-violet-50 dark:border-violet-800/30 border-violet-200 border hover:dark:bg-violet-950/50 hover:bg-violet-100 transition-all duration-300">
                <Image
                  src="/webbingstone.png"
                  alt="Webbingstone Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
                <span className="text-sm font-semibold dark:text-violet-400 text-violet-700">
                  Webbingstone
                </span>
              </Link>
            </div> */}

            {/* Sherif - Developer */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs dark:text-zinc-600 text-gray-400 uppercase tracking-wider">
                Developed by
              </span>
              <Link
                href="https://www.sherif22.work"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full dark:bg-gradient-to-r dark:from-violet-950/40 dark:to-purple-950/40 bg-gradient-to-r from-violet-50 to-purple-50 dark:border-violet-800/30 border-violet-200 border hover:dark:from-violet-950/60 hover:dark:to-purple-950/60 hover:from-violet-100 hover:to-purple-100 transition-all duration-300 group">
                <span className="text-sm font-semibold dark:text-violet-400 text-violet-700">
                  Sherif Lotfy
                </span>
                <svg
                  className="w-4 h-4 dark:text-violet-400 text-violet-700 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </Link>
            </div>
          </div>
          <p className="dark:text-zinc-500 text-gray-500 text-sm text-center">
            © 2025 PostPilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

