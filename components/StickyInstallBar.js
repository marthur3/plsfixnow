"use client";

import { usePathname } from "next/navigation";
import WebstoreLink from "./WebstoreLink";
import config from "@/config";

const StickyInstallBar = () => {
  const pathname = usePathname();
  if (config.extensionComingSoon || pathname !== "/") return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-base-100/95 backdrop-blur border-t border-base-content/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-base-content/60">
            No account required
          </div>
          <WebstoreLink
            placement="sticky"
            className="btn btn-primary btn-sm"
          >
            Add to Chrome — Free
          </WebstoreLink>
        </div>
      </div>
    </div>
  );
};

export default StickyInstallBar;
