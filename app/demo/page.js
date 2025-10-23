'use client'

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Dynamically import ImageAnnotator to avoid SSR issues
const ImageAnnotator = dynamic(() => import('@/components/ui/ImageAnnotator'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading Demo...</p>
      </div>
    </div>
  )
});

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense>
        <Header />
      </Suspense>
      
      <main className="pt-20">
        {/* Hero Section for Demo Page */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Try PLSFIX-THX Live Demo
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Experience the full power of our screenshot annotation tool. Upload an image, paste from clipboard, or take a screenshot to get started.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>No account required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Full feature demo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Export to PDF/PNG</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <ImageAnnotator />
          </div>
        </div>

        {/* Instructions Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Use the Demo</h2>
            <p className="text-gray-600">Follow these simple steps to try out all the features</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">1. Upload Image</h3>
              <p className="text-gray-600 text-sm">Upload an image file, paste from clipboard (Ctrl+V), or drag & drop any image to get started.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">2. Add Annotations</h3>
              <p className="text-gray-600 text-sm">Click anywhere on the image to add numbered annotations with detailed notes and explanations.</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">3. Export & Share</h3>
              <p className="text-gray-600 text-sm">Export your annotated screenshots as PDF, PNG, or HTML files, or copy directly to clipboard.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full text-blue-700 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              This demo runs entirely in your browser - no data is sent to our servers
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Use PLSFIX-THX?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Install the Chrome extension and take your screenshot annotation workflow to the next level
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://chrome.google.com/webstore/detail/plsfix-thx"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12c6.627 0 12-5.373 12-12S18.627 0 12 0zm5.568 8.16c-.169 1.858-.896 3.616-2.001 5.06-.686-.395-1.457-.623-2.286-.623a5.007 5.007 0 0 0-2.228.527A6.985 6.985 0 0 1 12 5.163c1.377 0 2.666.402 3.751 1.099l1.817-1.817zm-8.569 9.96A6.965 6.965 0 0 1 5.163 12c0-1.377.402-2.666 1.099-3.751l1.817 1.817c-1.105 1.444-1.832 3.202-2.001 5.06a5.007 5.007 0 0 0 2.286.623c.789 0 1.52-.228 2.228-.527zM12 18.837a6.965 6.965 0 0 1-6.837-3.836 5.007 5.007 0 0 0 .623-2.286c0-.789-.228-1.52-.527-2.228A6.985 6.985 0 0 1 12 5.163v13.674z"/>
                </svg>
                Install Chrome Extension
              </a>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Learn More Features
              </a>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}