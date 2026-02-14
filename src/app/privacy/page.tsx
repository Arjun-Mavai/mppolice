import type { Metadata } from 'next';
import Link from 'next/link';
import { contactEmail } from '../contact/page';

export const metadata: Metadata = {
  title: 'Privacy Policy | Mindful MPPSC',
  description:
    'Privacy Policy for Mindful MPPSC — learn how we collect, use, and protect your data on our MPPSC exam preparation platform.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm text-slate-500 hover:text-slate-800"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: June 2025</p>

        <div className="mt-10 space-y-10 leading-relaxed text-slate-700">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">1. Who We Are</h2>
            <p className="mt-3">
              Mindful MPPSC is an online platform designed to help aspirants prepare for the Madhya
              Pradesh Public Service Commission (MPPSC) examinations. This policy explains how we
              handle your personal information when you use our website and services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">2. Information We Collect</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>
                <strong>Account Information:</strong> Name, email address, and profile details you
                provide when signing up.
              </li>
              <li>
                <strong>Usage Data:</strong> Pages visited, quizzes attempted, scores, and study
                preferences to personalise your experience.
              </li>
              <li>
                <strong>Device Information:</strong> Browser type, operating system, and screen
                resolution for improving compatibility.
              </li>
              <li>
                <strong>Payment Information:</strong> Processed securely through third-party payment
                providers. We do not store your card details.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">3. How We Use Your Data</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>To provide and improve our exam preparation services.</li>
              <li>To track your progress and personalise study recommendations.</li>
              <li>To send important updates about your account or our platform.</li>
              <li>To respond to your queries and support requests.</li>
              <li>To detect and prevent fraud or misuse of our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">4. Cookies &amp; Local Storage</h2>
            <p className="mt-3">
              We use cookies and browser local storage to keep you logged in, remember your
              preferences (like language choice), and understand how the platform is used. You can
              disable cookies in your browser settings, but some features may not work correctly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">5. Data Sharing</h2>
            <p className="mt-3">
              We do not sell your personal data. We may share limited information with trusted
              service providers (hosting, analytics, payment processing) solely to operate the
              platform. We may also disclose data if required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">6. Data Security</h2>
            <p className="mt-3">
              We use industry-standard measures to protect your data, including encrypted
              connections (HTTPS) and secure authentication. However, no method of transmission over
              the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">7. Your Rights</h2>
            <p className="mt-3">
              You may request access to, correction of, or deletion of your personal data at any
              time. To exercise these rights, please contact us using the details below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">8. Changes to This Policy</h2>
            <p className="mt-3">
              We may update this policy from time to time. Changes will be posted on this page with
              a revised date. Continued use of the platform after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">9. Contact Us</h2>
            <p className="mt-3">
              If you have questions about this Privacy Policy, reach out via our{' '}
              <Link href="/contact" className="text-slate-900 underline hover:text-slate-600">
                Contact Page
              </Link>{' '}
              or email us at{' '}
              <a
                href="mailto:mppsc@zenscroll.app"
                className="text-slate-900 underline hover:text-slate-600"
              >
                {contactEmail}
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
