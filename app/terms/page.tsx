'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-md space-y-8">
            
            <section>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Welcome to Cost Saver! By using our service, you agree to these terms. Please read them carefully. 
                If you don't agree, please don't use Cost Saver.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Using Cost Saver
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>Who Can Use It:</strong> You must be 18 or older to create an account. You're responsible 
                for keeping your account secure.</p>
                
                <p><strong>Account Accuracy:</strong> Provide truthful information about your home and energy usage. 
                Accurate data = accurate savings estimates.</p>
                
                <p><strong>One Account Per Person:</strong> Each person should have only one account. Don't share 
                your login credentials.</p>
                
                <p><strong>Acceptable Use:</strong> Use Cost Saver for personal, non-commercial purposes. Don't try 
                to hack, scrape, or abuse our service.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. Our Service
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>What We Provide:</strong> Cost Saver helps you understand and reduce your energy costs 
                through personalized insights and recommendations.</p>
                
                <p><strong>Estimates, Not Guarantees:</strong> Our calculations are estimates based on the information 
                you provide and industry data. Actual savings may vary. We cannot guarantee specific results.</p>
                
                <p><strong>Service Availability:</strong> We aim for 99.9% uptime but can't guarantee uninterrupted 
                access. Maintenance and updates may cause temporary downtime.</p>
                
                <p><strong>Changes to Service:</strong> We may add, modify, or remove features at any time. We'll 
                notify you of significant changes.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. Pricing & Payments
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>Free Service:</strong> Cost Saver's core features are free forever. No hidden fees, 
                no surprise charges.</p>
                
                <p><strong>Affiliate Commissions:</strong> We may earn commissions if you switch providers through 
                our comparison tools. This doesn't cost you anything extra.</p>
                
                <p><strong>Future Premium Features:</strong> If we introduce paid features, they'll be clearly marked 
                and completely optional. You'll never be forced to upgrade.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. Your Content & Data
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>You Own Your Data:</strong> All information you provide (home details, bills, etc.) 
                remains yours.</p>
                
                <p><strong>License to Use:</strong> By using Cost Saver, you grant us permission to use your data 
                to provide and improve our service (as described in our Privacy Policy).</p>
                
                <p><strong>Anonymized Data:</strong> We may use aggregated, anonymized data for research, analytics, 
                and benchmarking (e.g., "average UK home costs £X/month").</p>
                
                <p><strong>Responsibility:</strong> You're responsible for the accuracy of information you provide. 
                Don't upload content that violates laws or third-party rights.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. Third-Party Services
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>External Links:</strong> Cost Saver may link to energy comparison sites, suppliers, 
                and other third parties. We're not responsible for their content, policies, or practices.</p>
                
                <p><strong>Switching Providers:</strong> If you switch energy suppliers through our recommendations, 
                the contract is between you and that supplier. We're not a party to that agreement.</p>
                
                <p><strong>API Data:</strong> We use third-party APIs for weather, energy prices, and carbon data. 
                These sources are generally reliable but not guaranteed to be 100% accurate.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. Intellectual Property
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>Our Content:</strong> Cost Saver's design, code, algorithms, branding, and content are 
                our intellectual property (or licensed to us). Don't copy, modify, or distribute without permission.</p>
                
                <p><strong>Trademarks:</strong> "Cost Saver" and our logo are trademarks. Don't use them without 
                written consent.</p>
                
                <p><strong>Feedback:</strong> If you suggest improvements, we can use those ideas without obligation 
                or compensation.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. Limitations of Liability
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>No Warranties:</strong> Cost Saver is provided "as is." We make no guarantees about 
                accuracy, reliability, or suitability for your specific needs.</p>
                
                <p><strong>Limitation of Damages:</strong> To the fullest extent permitted by law, Cost Saver is 
                not liable for indirect, incidental, or consequential damages (e.g., lost savings, time, or profits).</p>
                
                <p><strong>Maximum Liability:</strong> Our total liability to you for any claim is limited to £100 
                or the amount you paid us (whichever is greater).</p>
                
                <p><strong>Exceptions:</strong> Nothing in these terms limits liability for death/injury caused by 
                negligence, fraud, or other liability that can't be excluded by law.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. Termination
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>Your Right to Leave:</strong> You can delete your account anytime from Account Settings. 
                Your data will be deleted within 30 days.</p>
                
                <p><strong>Our Right to Terminate:</strong> We may suspend or terminate accounts that violate these 
                terms, abuse our service, or engage in illegal activity.</p>
                
                <p><strong>Effect of Termination:</strong> After termination, you lose access to your account and 
                saved data (unless you export it first).</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                9. Dispute Resolution
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>Governing Law:</strong> These terms are governed by the laws of England and Wales.</p>
                
                <p><strong>Informal Resolution:</strong> If you have a complaint, contact us first at 
                <a href="mailto:support@costsaver.com" className="text-blue-600 hover:underline ml-1">support@costsaver.com</a>. 
                We'll try to resolve it amicably.</p>
                
                <p><strong>Arbitration:</strong> For disputes that can't be resolved informally, we both agree to 
                binding arbitration before going to court (where legally allowed).</p>
                
                <p><strong>Jurisdiction:</strong> If arbitration doesn't apply, disputes will be resolved in the 
                courts of England and Wales.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                10. General Terms
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300">
                <p><strong>Entire Agreement:</strong> These terms (plus our Privacy Policy) constitute the full 
                agreement between you and Cost Saver.</p>
                
                <p><strong>Severability:</strong> If any provision is found invalid, the rest of the terms remain 
                in effect.</p>
                
                <p><strong>No Waiver:</strong> Our failure to enforce a term doesn't mean we're waiving that right.</p>
                
                <p><strong>Assignment:</strong> You can't transfer your rights under these terms. We may assign them 
                (e.g., if Cost Saver is acquired).</p>
                
                <p><strong>Changes to Terms:</strong> We may update these terms. Significant changes will be notified 
                via email. Continued use means acceptance.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                11. Contact Information
              </h2>
              <div className="space-y-2 text-gray-600 dark:text-gray-300">
                <p>Questions about these terms?</p>
                <p><strong>Email:</strong> <a href="mailto:legal@costsaver.com" className="text-blue-600 hover:underline">legal@costsaver.com</a></p>
                <p><strong>Support:</strong> <a href="mailto:support@costsaver.com" className="text-blue-600 hover:underline">support@costsaver.com</a></p>
                <p><strong>Contact Form:</strong> <a href="/contact" className="text-blue-600 hover:underline">Use our contact page</a></p>
              </div>
            </section>

            <section className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                By using Cost Saver, you acknowledge that you've read, understood, and agree to be bound by these Terms of Service.
              </p>
            </section>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
