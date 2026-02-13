'use client'

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { getSEOTags } from "@/libs/seo";

// Dynamically import ImageAnnotator to avoid SSR issues
const ImageAnnotator = dynamic(() => import('@/components/ui/ImageAnnotator'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[500px] bg-gray-900 rounded-b-xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-400 mx-auto"></div>
        <p className="mt-4 text-gray-400 text-sm">Loading editor...</p>
      </div>
    </div>
  )
});

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Chrome extension-style top bar */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm">PLSFIX-THX</span>
            </Link>
            <span className="text-gray-600 text-xs hidden sm:inline">|</span>
            <span className="text-gray-400 text-xs hidden sm:inline">Screenshot Annotation Editor</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 hidden md:inline">
              Web Demo — Install the extension for screen capture
            </span>
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded border border-gray-700 hover:border-gray-500"
            >
              Back to Site
            </Link>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts hint bar */}
      <div className="bg-gray-900/50 border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-6 text-xs text-gray-500 overflow-x-auto">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono text-[10px]">Double-click</kbd>
            Add annotation
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono text-[10px]">Ctrl+V</kbd>
            Paste image
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono text-[10px]">Drag</kbd>
            Move annotation
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400 font-mono text-[10px]">Esc</kbd>
            Cancel
          </span>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4">
          <div className="bg-white rounded-xl shadow-2xl shadow-black/20 overflow-hidden">
            <ImageAnnotator />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-900 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>100% local — no images leave your browser</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-600">
                Want screen capture + keyboard shortcuts?
              </span>
              <a
                href="https://chrome.google.com/webstore/detail/plsfix-thx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 3.616-2.001 5.06-.686-.395-1.457-.623-2.286-.623a5.007 5.007 0 0 0-2.228.527A6.985 6.985 0 0 1 12 5.163c1.377 0 2.666.402 3.751 1.099l1.817-1.817zm-8.569 9.96A6.965 6.965 0 0 1 5.163 12c0-1.377.402-2.666 1.099-3.751l1.817 1.817c-1.105 1.444-1.832 3.202-2.001 5.06a5.007 5.007 0 0 0 2.286.623c.789 0 1.52-.228 2.228-.527zM12 18.837a6.965 6.965 0 0 1-6.837-3.836 5.007 5.007 0 0 0 .623-2.286c0-.789-.228-1.52-.527-2.228A6.985 6.985 0 0 1 12 5.163v13.674z"/>
                </svg>
                Install Chrome Extension
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
