import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Delete Your Account",
  description:
    "Learn how to request deletion of your SpendWise account and associated financial records.",
};

export default function DeleteAccountPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to SpendWise
      </Link>

      <h1 className="mt-8 text-3xl font-bold tracking-tight">
        Delete Your SpendWise Account
      </h1>

      <p className="mt-4 text-gray-600">
        You can delete your SpendWise account and its associated
        financial records from within the mobile app.
      </p>

      <h2 className="mt-8 text-xl font-semibold">
        How to request account deletion
      </h2>

      <ol className="mt-4 list-decimal space-y-3 pl-6 text-gray-700">
        <li>Open the SpendWise app and sign in to your account.</li>
        <li>Open your account or profile settings.</li>
        <li>Select Delete Account.</li>
        <li>Review the confirmation message and confirm deletion.</li>
      </ol>

      <h2 className="mt-8 text-xl font-semibold">
        What data is deleted?
      </h2>

      <p className="mt-3 text-gray-700">
        The current account-deletion process removes your user account,
        transactions, and budgets associated with that account. The app
        also clears locally stored user data and cancels the daily
        expense reminder.
      </p>

      <h2 className="mt-8 text-xl font-semibold">
        Important information
      </h2>

      <p className="mt-3 text-gray-700">
        Account deletion is intended to be permanent. Before proceeding,
        make sure you have saved any information you wish to keep.
        This page describes the deletion behavior currently implemented
        in SpendWise. Any records held separately by third-party services
        or required to be retained by law may be subject to their own
        retention policies.
      </p>

      <h2 className="mt-8 text-xl font-semibold">
        Need help?
      </h2>

      <p className="mt-3 text-gray-700">
        If you cannot access the app or need assistance with account
        deletion, contact us at{" "}
        <a
          href="mailto:support@spendwiseapp.site"
          className="text-blue-600 hover:underline"
        >
          support@spendwiseapp.site
        </a>
        .
      </p>

      <p className="mt-10 text-sm text-gray-500">
        Please also review our{" "}
        <Link href="/privacy-policy" className="text-blue-600 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </main>
  );
}