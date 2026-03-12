import config from "@/config";

export const getWebstoreUrl = (placement) => {
  const baseUrl = config.webstore?.baseUrl || "https://chrome.google.com/webstore/detail/plsfix-thx";
  try {
    const url = new URL(baseUrl);
    const utm = config.webstore?.utm || {};
    if (utm.source) url.searchParams.set("utm_source", utm.source);
    if (utm.medium) url.searchParams.set("utm_medium", utm.medium);
    if (utm.campaign) url.searchParams.set("utm_campaign", utm.campaign);
    if (placement) url.searchParams.set("utm_content", placement);
    return url.toString();
  } catch {
    return baseUrl;
  }
};
