export const Footer = () => {
  return (
    <footer className="py-12 px-6 dark:bg-black/50 bg-gray-50 dark:border-t dark:border-violet-900 border-t border-violet-200">
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
                  href="#"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="font-semibold dark:text-white text-gray-900">
              Company
            </h5>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="dark:text-zinc-400 text-gray-600 hover:dark:text-violet-400 hover:text-violet-700 transition-colors">
                  Careers
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

        <div className="border-t dark:border-violet-900 border-violet-200 mt-8 pt-8 text-center">
          <p className="dark:text-zinc-400 text-gray-600 text-sm">
            © 2025 PostPilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
