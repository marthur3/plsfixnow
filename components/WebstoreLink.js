"use client";

import { getWebstoreUrl } from "@/utils/webstore";
import { trackEvent } from "@/utils/analytics";

const WebstoreLink = ({ placement, className, children }) => {
  return (
    <a
      href={getWebstoreUrl(placement)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => trackEvent("webstore_click", { placement })}
    >
      {children}
    </a>
  );
};

export default WebstoreLink;
