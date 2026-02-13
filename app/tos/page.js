import Link from "next/link";
import { getSEOTags } from "@/libs/seo";
import config from "@/config";


export const metadata = getSEOTags({
  title: `Terms and Conditions | ${config.appName}`,
  canonicalUrlRelative: "/tos",
});

const TOS = () => {
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
          </svg>
          Back
        </Link>
        <h1 className="text-3xl font-extrabold pb-6">
          Terms and Conditions for {config.appName}
        </h1>

        <pre
          className="leading-relaxed whitespace-pre-wrap"
          style={{ fontFamily: "sans-serif" }}
        >
          {`Last Updated: February 13, 2026

Welcome to PLSFIX-THX!

These Terms of Service ("Terms") govern your use of the PLSFIX-THX website at https://plsfix-thx.com ("Website"), the PLSFIX-THX Chrome extension ("Extension"), and the services provided by PLSFIX-THX. By using our Website, Extension, or services, you agree to these Terms.

1. Description of PLSFIX-THX

PLSFIX-THX is a Chrome extension that allows users to capture screenshots, add numbered annotations, and export annotated images. The Extension is designed to help developers and teams communicate visual feedback clearly, including with AI tools such as ChatGPT, Claude, and Cursor.

2. Free and Pro Plans

PLSFIX-THX offers a free tier with limited daily usage (5 annotated screenshots per day) and watermarked exports. Users may purchase a Lifetime Pro license for unlimited usage and watermark-free exports. Pro licenses are a one-time payment and grant lifetime access to all current and future features.

3. Refund Policy

We offer a full refund within 7 days of purchasing a Pro license. To request a refund, contact us at contact.givemethanks@gmail.com.

4. Local Processing and Privacy

All screenshot capture and annotation happens locally in your browser. Images are not uploaded to our servers. For details on what data we do collect, please refer to our Privacy Policy at https://plsfix-thx.com/privacy-policy.

5. User Data and Privacy

We collect user data (name, email, and payment information) only when you create an account or make a purchase. For full details, see our Privacy Policy.

6. Acceptable Use

You agree not to use PLSFIX-THX for any unlawful purpose or in any way that could damage, disable, or impair the service. You may not reverse-engineer, decompile, or disassemble the Extension.

7. Intellectual Property

PLSFIX-THX and its original content, features, and functionality are owned by PLSFIX-THX and are protected by applicable copyright and trademark laws. Screenshots and annotations you create are yours.

8. Governing Law

These Terms are governed by the laws of the United States.

9. Updates to the Terms

We may update these Terms from time to time. Users will be notified of any changes via email.

For any questions or concerns regarding these Terms of Service, please contact us at contact.givemethanks@gmail.com.

Thank you for using PLSFIX-THX!`}
        </pre>
      </div>
    </main>
  );
};

export default TOS;
