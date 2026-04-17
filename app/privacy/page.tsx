export default function PrivacyPage() {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-slate-300 leading-relaxed">
        <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">1. Data Collection</h2>
          <p>SyncMap is a privacy-first utility. We do not require accounts, and we do not store personal data, location information, or team configurations on our servers.</p>
        </section>
  
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">2. Cookies & Advertising</h2>
          <p>We use Google AdSense to serve advertisements. Google, as a third-party vendor, uses cookies to serve ads based on your visit to this site and other sites on the internet.</p>
          <ul className="list-disc ml-6 mt-4 space-y-2">
            <li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-emerald-400 underline">Google Ads Settings</a>.</li>
            <li>We do not share any user-specific data with third-party advertisers.</li>
          </ul>
        </section>
  
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">3. Analytics</h2>
          <p>We may use anonymized analytics to monitor tool performance and uptime. This data contains no personally identifiable information.</p>
        </section>
  
        <footer className="mt-12 pt-8 border-t border-white/5 text-sm text-slate-500">
          Last updated: April 16, 2026
        </footer>
      </div>
    );
  }