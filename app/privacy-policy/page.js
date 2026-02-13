import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";


export const metadata = getSEOTags({
  title: `Privacy Policy | ${config.appName}`,
  canonicalUrlRelative: "/privacy-policy",
});

const PrivacyPolicy = () => {
  return (
    <main className="max-w-xl mx-auto">
      <div className="p-5">
        <Link href="/" className="btn btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M15 10a.75.75 0 01-.75.75H7.612l2.158 1.96a.75.75 0 11-1.04 1.08l-3.5-3.25a.75.75 0 010-1.08l3.5-3.25a.75.75 0 111.04 1.08L7.612 9.25h6.638A.75.75 0 0115 10z"
              clipRule="evenodd"
            />
          </svg>{" "}
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Privacy Policy for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: February 13, 2026

Thank you for using PLSFIX-THX ("we," "us," or "our"). This Privacy Policy outlines how we collect, use, and protect your personal and non-personal information when you use our website at https://plsfix-thx.com (the "Website") and the PLSFIX-THX Chrome extension (the "Extension").

By using the Website or Extension, you agree to the terms of this Privacy Policy. If you do not agree with the practices described in this policy, please do not use the Website or Extension.

1. Information We Collect

1.1 Personal Data

We collect the following personal information from you when you create an account or make a purchase:

Name: We collect your name to personalize your experience and communicate with you effectively.
Email: We collect your email address to manage your account, send purchase confirmations, and provide customer support.
Payment Information: We collect payment details to process Pro license purchases securely. We do not store your payment information on our servers. Payments are processed by Stripe, a trusted third-party payment processor.

1.2 Non-Personal Data

We may use web cookies and similar technologies on our Website to collect non-personal information such as your IP address, browser type, device information, and browsing patterns. This information helps us enhance your experience and improve our services.

1.3 Chrome Extension Data

The PLSFIX-THX Chrome extension processes all screenshots and annotations locally in your browser. No images, screenshots, or annotation data are sent to or stored on our servers. The Extension may store your authentication status and usage count locally in Chrome storage.

2. Purpose of Data Collection

We collect and use your personal data for the following purposes:
- Processing Pro license purchases
- Managing your account and license status
- Providing customer support
- Sending important product updates

3. Data Sharing

We do not sell, trade, or rent your personal information to others. We share data only with:
- Stripe: For payment processing
- Supabase: For account authentication and license management

4. Data Security

We use industry-standard security measures to protect your data. All data transmission is encrypted via HTTPS. Authentication is handled through Supabase with secure session management.

5. Children's Privacy

PLSFIX-THX is not intended for children under the age of 13. We do not knowingly collect personal information from children. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us at the email address provided below.

6. Updates to the Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Any updates will be posted on this page, and we may notify you via email about significant changes.

7. Contact Information

If you have any questions, concerns, or requests related to this Privacy Policy, you can contact us at:

Email: contact.givemethanks@gmail.com

By using PLSFIX-THX, you consent to the terms of this Privacy Policy.`}
        </pre>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
