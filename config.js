import themes from "daisyui/src/theming/themes";

const config = {
  // REQUIRED
  appName: "PLSFIX-THX",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Professional Chrome extension for screenshot annotation with advanced export features and collaboration tools.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "plsfixthx.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // Free plan for display purposes (no priceId needed)
        name: "Free",
        description: "Perfect for personal use and getting started",
        price: 0,
        features: [
          {
            name: "5 screenshots per day",
          },
          { name: "Basic annotations" },
          { name: "Watermarked exports" },
          { name: "PNG export" },
          { name: "Chrome extension" },
        ],
        isFree: true,
      },
      {
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
            : "price_lifetime_purchase",
        name: "Lifetime Pro",
        description: "One-time purchase for unlimited professional use",
        price: 39,
        priceAnchor: 99,
        interval: "one-time",
        features: [
          {
            name: "Unlimited screenshots",
          },
          { name: "All annotation features" },
          { name: "No watermarks" },
          { name: "PDF, PNG & HTML export" },
          { name: "Priority support" },
          { name: "Lifetime updates" },
        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  resend: {
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `PLSFIX-THX <noreply@plsfixthx.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `PLSFIX-THX Support <support@plsfixthx.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "support@plsfixthx.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
};

export default config;
