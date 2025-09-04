// src/pages/Privacy.jsx
import React from "react";

export default function Privacy({
  appName = "Your App Name",
  companyName = "Your Company Name",
  effectiveDate = "September 3, 2025",
  contactEmail = "support@yourdomain.com",
  address = "Your Business Address",
  jurisdiction = "British Columbia, Canada",
}) {
  return (
    <main className="max-w-3xl mx-auto p-6 text-gray-800">
      <h1 className="text-2xl font-bold">Privacy Policy</h1>
      <p className="mt-2">
        <strong>Effective Date:</strong> {effectiveDate}
      </p>

      <p className="mt-4">
        This Privacy Policy explains how <strong>{companyName}</strong> (“we”,
        “us”, “our”) collects, uses, and protects personal information when you
        use <strong>{appName}</strong> (“Service”).
      </p>

      <h2 className="mt-6 text-xl font-semibold">1. Information We Collect</h2>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>
          <strong>Account & Billing:</strong> Name, business name, email,
          phone, addresses, billing details.
        </li>
        <li>
          <strong>Usage Data:</strong> Log data, device/browser info, IP,
          pages viewed, actions taken.
        </li>
        <li>
          <strong>Content You Provide:</strong> Orders, inventory records,
          customer/vendor data entered into the Service.
        </li>
        <li>
          <strong>Integrations:</strong> If you connect third-party services
          (e.g., QuickBooks Online), we may process relevant data from those
          services in accordance with your configuration and their permissions.
        </li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">2. How We Use Information</h2>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>To provide, maintain, and improve the Service.</li>
        <li>To authenticate users and secure accounts.</li>
        <li>To communicate updates, support, and important notices.</li>
        <li>To comply with legal obligations and enforce terms.</li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">3. QuickBooks & Other Integrations</h2>
      <p className="mt-2">
        When you connect QuickBooks Online or other integrations, you authorize
        us to access and process data required to deliver the features you
        enable (e.g., syncing customers, estimates, invoices). We use OAuth and
        store tokens securely. We do not sell integration data.
      </p>

      <h2 className="mt-6 text-xl font-semibold">4. Legal Bases (if applicable)</h2>
      <p className="mt-2">
        Where required, we process personal data on the basis of contract
        (to deliver the Service), legitimate interests (to secure and improve
        the Service), and consent (for optional features/communications).
      </p>

      <h2 className="mt-6 text-xl font-semibold">5. Sharing & Disclosure</h2>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>
          <strong>Vendors:</strong> Trusted processors for hosting, storage,
          analytics, and support who are bound by confidentiality and security
          obligations.
        </li>
        <li>
          <strong>Legal:</strong> If required by law or to protect rights,
          safety, and the integrity of the Service.
        </li>
        <li>
          <strong>Business transfers:</strong> In connection with a merger,
          acquisition, or sale of assets (with notice where required).
        </li>
      </ul>

      <h2 className="mt-6 text-xl font-semibold">6. Data Retention</h2>
      <p className="mt-2">
        We retain data for as long as your account is active or as needed to
        provide the Service, comply with legal obligations, resolve disputes,
        and enforce agreements. You may request deletion (subject to legal and
        contractual limits).
      </p>

      <h2 className="mt-6 text-xl font-semibold">7. Security</h2>
      <p className="mt-2">
        We use reasonable administrative, technical, and physical safeguards to
        protect data. No method of transmission or storage is 100% secure; we
        cannot guarantee absolute security.
      </p>

      <h2 className="mt-6 text-xl font-semibold">8. Your Rights</h2>
      <p className="mt-2">
        Depending on your location, you may have rights to access, correct,
        delete, or export your personal information, and to object or restrict
        certain processing. To exercise rights, contact us at{" "}
        <a href={`mailto:${contactEmail}`} className="text-blue-600 underline">
          {contactEmail}
        </a>
        .
      </p>

      <h2 className="mt-6 text-xl font-semibold">9. International Transfers</h2>
      <p className="mt-2">
        Data may be processed in countries other than your own. Where required,
        we implement safeguards for cross-border transfers.
      </p>

      <h2 className="mt-6 text-xl font-semibold">10. Children’s Privacy</h2>
      <p className="mt-2">
        The Service is not directed to children under 13 (or the age defined by
        local law). We do not knowingly collect such data.
      </p>

      <h2 className="mt-6 text-xl font-semibold">11. Cookies & Tracking</h2>
      <p className="mt-2">
        We use cookies and similar technologies for authentication, preferences,
        and analytics. You can adjust browser settings to limit cookies, which
        may affect functionality.
      </p>

      <h2 className="mt-6 text-xl font-semibold">12. Changes to this Policy</h2>
      <p className="mt-2">
        We may update this Policy from time to time. The “Effective Date”
        reflects the latest revision. Material changes will be communicated as
        required.
      </p>

      <h2 className="mt-6 text-xl font-semibold">13. Contact Us</h2>
      <p className="mt-2">
        Questions or requests can be sent to{" "}
        <a href={`mailto:${contactEmail}`} className="text-blue-600 underline">
          {contactEmail}
        </a>
        .
        <br />
        <strong>{companyName}</strong>
        <br />
        {address}
        <br />
        {jurisdiction}
      </p>
    </main>
  );
}
