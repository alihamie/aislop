export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-black tracking-tighter mb-2">Privacy Policy</h1>
      <p className="text-zinc-500 text-sm mb-8">Last updated: March 7, 2025</p>

      <div className="space-y-6 text-zinc-300 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">What We Collect</h2>
          <p>When you sign in with Google, we receive your email address and Google account ID. We store your chosen username and any content you submit to the platform.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">How We Use It</h2>
          <p>Your email is used solely for authentication. We do not send marketing emails. Your username and submitted content are displayed publicly on the platform. Reactions you cast are stored anonymously in aggregate.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">What We Don't Do</h2>
          <p>We do not sell your data. We do not share your personal information with third parties except as required to operate the service (authentication via Google).</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Data Retention</h2>
          <p>You may delete your posts at any time from your profile page. To request full account deletion, contact us at <a href="mailto:alihhamie@gmail.com" className="text-yellow-400 hover:underline">alihhamie@gmail.com</a>.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Cookies</h2>
          <p>We use session cookies solely to keep you signed in. No tracking or advertising cookies are used.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Contact</h2>
          <p>Questions? Email <a href="mailto:alihhamie@gmail.com" className="text-yellow-400 hover:underline">alihhamie@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
