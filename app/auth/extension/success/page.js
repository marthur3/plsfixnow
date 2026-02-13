"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const authStatus = searchParams.get("auth");
  const isError = authStatus === "error";

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl max-w-md w-full">
        <div className="card-body text-center">
          {isError ? (
            <>
              <h1 className="text-2xl font-bold text-error">
                Authentication Failed
              </h1>
              <p className="text-base-content/70 mt-2">
                Something went wrong. Please close this tab and try signing in
                again from the extension.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-success">
                Signed In Successfully
              </h1>
              <p className="text-base-content/70 mt-2">
                You can close this tab and return to the PLSFIX-THX extension.
                Your Pro status will sync automatically.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ExtensionAuthSuccess() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
