// src/pages/Eula.jsx
import React from "react";

export default function Eula({
  appName = "Your App Name",
  companyName = "Your Company Name",
  effectiveDate = "January 1, 2025",
  privacyUrl = "/privacy",
  contactEmail = "support@yourdomain.com",
  address = "Your Business Address",
  jurisdiction = "Your Province/State, Country",
}) {
  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-2xl font-bold">End-User License Agreement (EULA)</h1>
      <p className="mt-2">
        <strong>Effective Date:</strong> {effectiveDate}
      </p>

      <p className="mt-4">
        This End-User License Agreement (“Agreement”) is between you (“User”) and{" "}
        <strong>{companyName}</strong> (“Company”, “we”, “our”), and governs your
        use of <strong>{appName}</strong> (“Software”).
      </p>

      <h2 className="mt-6 text-xl font-semibold">1. License Grant</h2>
      <p className="mt-2">
        We grant you a limited, non-exclusive, non-transferable license to
        install and use the Software solely for your internal business purposes,
        subject to this Agreement.
      </p>

      <h2 className="mt-6 text-xl font-semibold">2. Restrictions</h2>
      <p className="mt-2">You agree not to:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>Modify, reverse engineer, or decompile the Software;</li>
        <li>Rent, lease, or sublicense the Software;</li>
        <li>Use the Software for any unlawful purpose.</li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">3. Ownership</h2>
      <p className="mt-2">
        The Software is licensed, not sold. All rights, title, and interest
        remain with <strong>{companyName}</strong>.
      </p>

      <h2 className="mt-6 text-xl font-semibold">4. Data &amp; Privacy</h2>
      <p className="mt-2">
        Your use of the Software is also subject to our{" "}
        <a
          href={privacyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Privacy Policy
        </a>
        .
      </p>

      <h2 className="mt-6 text-xl font-semibold">5. Disclaimer of Warranties</h2>
      <p className="mt-2">
        The Software is provided “as is” without warranties of any kind. We
        disclaim all implied warranties, including merchantability or fitness for
        a particular purpose.
      </p>

      <h2 className="mt-6 text-xl font-semibold">6. Limitation of Liability</h2>
      <p className="mt-2">
        To the maximum extent permitted by law, <strong>{companyName}</strong>{" "}
        shall not be liable for any damages arising from your use of the
        Software.
      </p>

      <h2 className="mt-6 text-xl font-semibold">7. Termination</h2>
      <p className="mt-2">
        We may terminate this Agreement immediately if you breach any term. Upon
        termination, you must stop using the Software and destroy all copies in
        your possession.
      </p>

      <h2 className="mt-6 text-xl font-semibold">8. Governing Law</h2>
      <p className="mt-2">
        This Agreement shall be governed by the laws of <em>{jurisdiction}</em>.
      </p>

      <h2 className="mt-6 text-xl font-semibold">9. Contact</h2>
      <p className="mt-2">
        If you have any questions about this Agreement, contact us at:
        <br />
        <strong>{companyName}</strong>
        <br />
        Email:{" "}
        <a href={`mailto:${contactEmail}`} className="text-blue-600 underline">
          {contactEmail}
        </a>
        <br />
        Address: {address}
      </p>

      <p className="mt-6">
        By using the Software, you acknowledge that you have read and agree to
        this Agreement.
      </p>
    </main>
  );
}
