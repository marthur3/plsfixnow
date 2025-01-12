import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const Instructions = ({ hasImages }) => {
  const [isOpen, setIsOpen] = useState(true);  // Keep this to maintain default open state

  const initialInstructions = [
    "Paste (Ctrl+V) or upload a screenshot to get started",
    "Multiple images can be uploaded at once",
    "Supported formats: PNG, JPEG, GIF, WebP"
  ];

  const annotationInstructions = [
    "Double-click anywhere on the image to add a note",
    "Click on any marker to view or edit the note",
    "Drag markers to reposition them",
    "Press Enter to save a note, Esc to cancel",
    "Click the check/complete button to mark items as done",
    "Export all pages when finished to share with others"
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold hidden md:block">
        {hasImages ? "Annotation Instructions" : "Getting Started"}
      </h2>
      
      <div className="space-y-4">
        <ul className="list-disc list-inside space-y-2 text-sm text-slate-600">
          {hasImages 
            ? annotationInstructions.map((instruction, i) => (
                <li key={i}>{instruction}</li>
              ))
            : initialInstructions.map((instruction, i) => (
                <li key={i}>{instruction}</li>
              ))
          }
        </ul>
        
        {hasImages && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-sm font-medium mb-2">Keyboard Shortcuts:</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
              <div>Enter: Save note</div>
              <div>Esc: Cancel</div>
              <div>Ctrl+V: Paste image</div>
              <div>Delete: Remove annotation</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;
