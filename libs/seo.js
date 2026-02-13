import config from "@/config";

// SEO tags for all pages. Customize per page via getSEOTags() params.
export const getSEOTags = ({
  title,
  description,
  keywords,
  openGraph,
  canonicalUrlRelative,
  extraTags,
} = {}) => {
  return {
    // up to 50 characters (what does your app do for the user?) > your main should be here
    title: title || config.appName,
    // up to 160 characters (how does your app help the user?)
    description: description || config.appDescription,
    // some keywords separated by commas. by default it will be your app name
    keywords: keywords || [
      "screenshot annotation tool",
      "annotate screenshots for AI",
      "Chrome extension screenshot",
      "numbered annotations",
      "visual feedback tool",
      "AI context screenshots",
      "ChatGPT screenshot tool",
      "Claude screenshot annotations",
      "Cursor IDE visual feedback",
      "screen capture annotate",
      "bug report screenshots",
      "PLSFIX-THX",
    ],
    applicationName: config.appName,
    // set a base URL prefix for other fields that require a fully qualified URL (.e.g og:image: og:image: 'https://yourdomain.com/share.png' => '/share.png')
    metadataBase: new URL(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/"
        : `https://${config.domainName}/`
    ),

    openGraph: {
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      url: openGraph?.url || `https://${config.domainName}/`,
      siteName: openGraph?.title || config.appName,
      // If you add an opengraph-image.(jpg|jpeg|png|gif) image to the /app folder, you don't need the code below
      // images: [
      //   {
      //     url: `https://${config.domainName}/share.png`,
      //     width: 1200,
      //     height: 660,
      //   },
      // ],
      locale: "en_US",
      type: "website",
    },

    twitter: {
      title: openGraph?.title || config.appName,
      description: openGraph?.description || config.appDescription,
      // If you add an twitter-image.(jpg|jpeg|png|gif) image to the /app folder, you don't need the code below
      // images: [openGraph?.image || defaults.og.image],
      card: "summary_large_image",
      creator: "@plsfix_thx",
    },

    // If a canonical URL is given, we add it. The metadataBase will turn the relative URL into a fully qualified URL
    ...(canonicalUrlRelative && {
      alternates: { canonical: canonicalUrlRelative },
    }),

    // If you want to add extra tags, you can pass them here
    ...extraTags,
  };
};

// Structured Data for Rich Results on Google
export const renderSchemaTags = () => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: config.appName,
          description: "Give your AI agent perfect context. Capture your screen, add numbered annotations, and share crystal-clear visual feedback with ChatGPT, Claude, Cursor, or any AI tool in seconds.",
          image: `https://${config.domainName}/icon.png`,
          url: `https://${config.domainName}/`,
          author: {
            "@type": "Organization",
            name: "PLSFIX-THX",
          },
          datePublished: "2025-01-01",
          applicationCategory: "BrowserApplication",
          operatingSystem: "Chrome",
          browserRequirements: "Requires Google Chrome 88+",
          offers: [
            {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "Free plan — 5 annotated screenshots per day",
            },
            {
              "@type": "Offer",
              price: "39.00",
              priceCurrency: "USD",
              description: "Lifetime Pro — unlimited screenshots, no watermarks",
            },
          ],
          featureList: "Screenshot capture, Numbered annotations, PNG export, PDF export, HTML export, Works with ChatGPT, Works with Claude, Works with Cursor, Local processing, No uploads required",
        }),
      }}
    ></script>
  );
};
