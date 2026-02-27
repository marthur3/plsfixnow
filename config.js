const config = {
  // Set to false when the Chrome extension is live on the Web Store
  extensionComingSoon: false,
  // REQUIRED
  appName: "PLSFIX-THX",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Free Chrome extension with every premium feature unlocked. Mark up slides and dashboards with numbered annotations, export to PDF/PNG/HTML, and copy for AI — all completely free.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "plsfix-thx.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (resend.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    // TODO: Revert to paid plans when re-enabling Pro pricing
    plans: [
      {
        isFeatured: true,
        name: "Free",
        description: "All Pro features included — completely free",
        price: 0,
        features: [
          { name: "Unlimited markups" },
          { name: "All annotation tools" },
          { name: "No watermarks" },
          { name: "PDF, PNG & HTML export" },
          { name: "Copy for AI" },
          { name: "Chrome extension" },
        ],
        isFree: true,
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
    fromNoReply: `PLSFIX-THX <noreply@plsfix-thx.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `PLSFIX-THX Support <support@plsfix-thx.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "contact.givemethanks@gmail.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "corporate",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: "#1B2A4A",
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/dashboard",
  },
};

export default config;
