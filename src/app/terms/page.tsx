import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Mindful MPPSC",
  description:
    "Terms of Service for Mindful MPPSC — the rules and guidelines for using our MPPSC exam preparation platform.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-800 mb-8"
        >
          ← Back to Home
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Last updated: June 2025
        </p>

        <div className="mt-10 space-y-10 text-slate-700 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              1. Acceptance of Terms
            </h2>
            <p className="mt-3">
              By accessing or using Mindful MPPSC, you agree to be bound by
              these Terms of Service. If you do not agree, please do not use the
              platform. We reserve the right to update these terms at any time;
              continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              2. Account &amp; Registration
            </h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>
                You must provide accurate information when creating an account.
              </li>
              <li>
                You are responsible for maintaining the security of your account
                credentials.
              </li>
              <li>
                One account per person. Sharing accounts is not permitted.
              </li>
              <li>
                We may suspend or terminate accounts that violate these terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              3. Acceptable Use
            </h2>
            <p className="mt-3">You agree not to:</p>
            <ul className="mt-2 list-disc pl-5 space-y-2">
              <li>
                Copy, redistribute, or resell any content from the platform
                without permission.
              </li>
              <li>
                Use automated tools (bots, scrapers) to access the platform.
              </li>
              <li>
                Attempt to gain unauthorised access to other users' accounts or
                our systems.
              </li>
              <li>
                Upload harmful content or engage in behaviour that disrupts the
                platform for others.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              4. Content Ownership
            </h2>
            <p className="mt-3">
              All study material, quizzes, mnemonics, and other educational
              content on Mindful MPPSC is our intellectual property or used under
              licence. You may use it for personal study purposes only. You
              retain ownership of any content you submit (e.g., feedback or
              forum posts), but grant us a licence to use it for improving the
              platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              5. Payments &amp; Refunds
            </h2>
            <ul className="mt-3 list-disc pl-5 space-y-2">
              <li>
                Paid plans are billed as described at the time of purchase.
              </li>
              <li>
                All purchases are final. Due to the digital nature of the
                content, refunds are generally not available once access has
                been granted. For exceptional circumstances, please contact
                us.
              </li>
              <li>
                We reserve the right to modify pricing with reasonable notice.
              </li>
              {/* <li>
                For refund queries, please reach out via our{" "}
                <Link
                  href="/contact"
                  className="underline text-slate-900 hover:text-slate-600"
                >
                  Contact Page
                </Link>
                .
              </li> */}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              6. Limitation of Liability
            </h2>
            <p className="mt-3">
              Mindful MPPSC is provided &ldquo;as is&rdquo; without warranties
              of any kind. We strive for accuracy in our content but do not
              guarantee exam results. Our total liability to you shall not
              exceed the amount you paid for the service in the preceding 12
              months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              7. Availability &amp; Changes
            </h2>
            <p className="mt-3">
              We aim to keep the platform available at all times but do not
              guarantee uninterrupted access. We may modify, suspend, or
              discontinue features with reasonable notice. Scheduled maintenance
              windows will be communicated in advance where possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              8. Governing Law
            </h2>
            <p className="mt-3">
              These terms are governed by the laws of India. Any disputes shall
              be subject to the exclusive jurisdiction of courts in Madhya
              Pradesh, India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900">
              9. Contact Us
            </h2>
            <p className="mt-3">
              Questions about these terms? Visit our{" "}
              <Link
                href="/contact"
                className="underline text-slate-900 hover:text-slate-600"
              >
                Contact Page
              </Link>{" "}
              or email{" "}
              <a
                href="mailto:mppscsyllabus@gmail.com"
                className="underline text-slate-900 hover:text-slate-600"
              >
                mppscsyllabus@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
