'use client';
import ImageAnnotator from '../components/ui/ImageAnnotator';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Image Annotator</h1>
      <ImageAnnotator />
    </main>
  );
}