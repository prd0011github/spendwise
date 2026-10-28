
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | SpendWise",
  description:
    "Learn how SpendWise handles account information, financial records, subscriptions, and privacy requests.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-xl font-bold text-slate-900">
            SpendWise
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-5 py-12 sm:py-16">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Your privacy matters
        </p>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-slate-950">
          Privacy Policy
        </h1>

        <p className="mb-10 text-sm text-slate-500">
          Effective date: October 28, 2026
        </p>

        <div className="space-y-8 leading-7">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              1. Introduction
            </h2>
            <p>
              SpendWise is a personal expense and budgeting application that
              helps users record transactions, manage budgets, review spending,
              and access financial summaries. This Privacy Policy explains how
              information is handled when you use SpendWise and its related
              services.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              2. Information We Handle
            </h2>
            <p className="mb-3">
              Depending on the features you use, SpendWise may handle the
              following information:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Account information:</strong> name, email address, and
                authentication-related information needed to create and manage
                your account.
              </li>
              <li>
                <strong>Financial records:</strong> transactions, amounts,
                categories, dates, budgets, and other details you enter into
                the app.
              </li>
              <li>
                <strong>Preferences:</strong> settings such as your selected
                theme, currency, and other app preferences.
              </li>
              <li>
                <strong>Subscription information:</strong> subscription status
                and purchase-verification information needed to provide
                SpendWise Pro features.
              </li>
              <li>
                <strong>Technical information:</strong> information generated
                when the app or its services operate, to the extent collected
                by the app, hosting providers, or other integrated services.
              </li>
            </ul>
            <p className="mt-3">
              SpendWise does not require you to connect a bank account to
              manually record your expenses. Do not enter bank passwords,
              card security codes, or other credentials into transaction
              descriptions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              3. How Information Is Used
            </h2>
            <p className="mb-3">Information may be used to:</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>Create and manage your account and authenticate you.</li>
              <li>Save and display transactions, budgets, and summaries.</li>
              <li>Provide reports, exports, and personalized preferences.</li>
              <li>Process password-reset requests and provide support.</li>
              <li>Verify subscriptions and provide eligible Pro features.</li>
              <li>Maintain, troubleshoot, and protect the service.</li>
              <li>Meet applicable legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              4. Storage and Security
            </h2>
            <p>
              Information may be processed by SpendWise's application
              services and stored locally on your device or by the services
              that support the app, depending on the type of information and
              feature. We take privacy and data protection seriously. No
              method of electronic storage or transmission can be guaranteed
              to be completely secure.
            </p>
            <p className="mt-3">
              You are responsible for protecting access to your device and
              keeping your account credentials confidential. Sign out when
              appropriate, particularly on shared devices.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              5. Sharing and Third-Party Services
            </h2>
            <p>
              Information may be processed by service providers that support
              account authentication, application hosting, data storage, and
              other necessary operations. Google Play processes subscription
              purchases according to its own terms and privacy practices.
              Purchase information may be used to verify subscription
              entitlement.
            </p>
            <p className="mt-3">
              Information may also be disclosed when required by law or when
              necessary to protect the service and its users. The specific
              providers and data flows used by the current release should be
              described accurately in this policy and in the Google Play Data
              safety declaration.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              6. Subscriptions
            </h2>
            <p>
              SpendWise Pro subscriptions are offered through Google Play.
              Google Play manages billing, renewals, cancellations, and
              applicable refunds under its policies. SpendWise uses relevant
              purchase-verification information to determine whether Pro
              features should be available to your account. Subscription
              entitlement and billing status may be handled by different
              systems.
            </p>
            <p className="mt-3">
              You can review or manage eligible subscriptions through Google
              Play's subscription settings.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              7. Data Retention and Deletion
            </h2>
            <p>
              Information is retained for as long as needed to provide the
              service and for applicable operational or legal requirements.
              Retention periods may differ by data type.
            </p>
            <p className="mt-3">
              To request deletion of your SpendWise account and associated
              personal data, contact{" "}
              <a
                className="font-medium text-blue-700 underline"
                href="mailto:support@spendwiseapp.site?subject=SpendWise%20Account%20Deletion"
              >
                support@spendwiseapp.site
              </a>{" "}
              from your registered email address and include that you want
              your account deleted. We may need to verify your request.
              Certain records may be retained where required by law or
              necessary to resolve disputes and enforce legitimate obligations.
            </p>
            <p className="mt-3">
              Account deletion does not necessarily cancel a Google Play
              subscription. Manage or cancel an active subscription separately
              through Google Play.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              8. Children's Privacy
            </h2>
            <p>
              SpendWise is not intended for children who are not permitted to
              use the service under applicable law. If you believe a child has
              provided personal information inappropriately, contact us so
              that the situation can be reviewed.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              9. Changes to This Policy
            </h2>
            <p>
              This policy may be updated when the app, its data practices, or
              applicable requirements change. The current version will be
              published on this page with an updated effective date.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-slate-950">
              10. Contact Us
            </h2>
            <p>
              For privacy questions or requests, contact SpendWise at{" "}
              <a
                className="font-medium text-blue-700 underline"
                href="mailto:support@spendwiseapp.site"
              >
                support@spendwiseapp.site
              </a>
              .
            </p>
          </section>
        </div>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          © 2026 SpendWise. All rights reserved.
        </footer>
      </article>
    </main>
  );
}
