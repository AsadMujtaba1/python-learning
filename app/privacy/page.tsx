'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md space-y-8">
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Your Privacy Matters
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                At Cost Saver, we take your privacy seriously. This policy explains what information we collect, 
                how we use it, and your rights regarding your data. We're committed to transparency and protecting 
                your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Information We Collect
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Information You Provide:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name and email address when you create an account</li>
                    <li>Home details (postcode, property type, size, number of bedrooms)</li>
                    <li>Energy supplier and tariff information</li>
                    <li>Appliance details and usage patterns</li>
                    <li>Uploaded energy bills (optional)</li>
                    <li>Messages sent through our contact form</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Information We Collect Automatically:
                  </h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Device information (browser type, operating system)</li>
                    <li>Usage data (pages visited, time spent, features used)</li>
                    <li>IP address and location data (for weather-based calculations)</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We use your data to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li>Calculate your energy costs and provide personalized savings recommendations</li>
                <li>Compare your usage with similar homes in your area (anonymously)</li>
                <li>Send you important account updates and security notifications</li>
                <li>Improve our service and develop new features</li>
                <li>Provide customer support</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                <strong>We will NEVER:</strong> Sell your personal data to third parties or use it for purposes 
                unrelated to providing our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. Data Sharing
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We only share your information in these limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li><strong>Service Providers:</strong> Trusted partners who help us operate (e.g., hosting, email services). 
                They're bound by strict confidentiality agreements.</li>
                <li><strong>Energy Comparison Services:</strong> If you choose to compare tariffs, we share necessary details 
                to get accurate quotes (with your explicit consent).</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
                <li><strong>Business Transfers:</strong> If Cost Saver is acquired, your data transfers to the new owner 
                (you'll be notified).</li>
              </ul>
            </section>

            <section id="cookies">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. Cookies & Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We use cookies to improve your experience:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li><strong>Essential Cookies:</strong> Required for login and basic functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use the site (anonymized)</li>
                <li><strong>Preference Cookies:</strong> Remember your settings (dark mode, language, etc.)</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                You can control cookies through your browser settings. Blocking essential cookies may affect functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We protect your data with industry-standard security measures:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4 mt-4">
                <li>256-bit SSL encryption for data transmission</li>
                <li>Secure, encrypted cloud storage (Google Cloud / Firebase)</li>
                <li>Regular security audits and updates</li>
                <li>Access controls limiting who can view your data</li>
                <li>Password hashing (we never store passwords in plain text)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. Your Rights (GDPR)
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Under UK/EU data protection law, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4">
                <li><strong>Access:</strong> Request a copy of all data we hold about you</li>
                <li><strong>Correction:</strong> Update inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Ask us to delete your account and data</li>
                <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                <li><strong>Object:</strong> Opt out of certain data processing activities</li>
                <li><strong>Restrict:</strong> Limit how we process your data</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-4">
                To exercise these rights, email <a href="mailto:privacy@costsaver.com" className="text-blue-600 hover:underline">privacy@costsaver.com</a> 
                or go to Account Settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. Data Retention
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We keep your data only as long as necessary to provide our service or comply with legal requirements:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300 ml-4 mt-4">
                <li>Active accounts: Data retained while your account is active</li>
                <li>Deleted accounts: Data deleted within 30 days (except legal obligations)</li>
                <li>Anonymized analytics: Retained indefinitely (no personal identifiers)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Cost Saver is not intended for users under 18. We don't knowingly collect data from children. 
                If we discover we've collected such data, we'll delete it immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                9. Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                We may update this policy occasionally. Changes will be posted here with an updated "Last Updated" date. 
                Significant changes will be notified via email. Continued use after changes means you accept the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                10. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Questions about this privacy policy or your data?
              </p>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p><strong>Email:</strong> <a href="mailto:privacy@costsaver.com" className="text-blue-600 hover:underline">privacy@costsaver.com</a></p>
                <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@costsaver.com" className="text-blue-600 hover:underline">dpo@costsaver.com</a></p>
                <p><strong>Support:</strong> Use our <a href="/contact" className="text-blue-600 hover:underline">contact form</a></p>
              </div>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
