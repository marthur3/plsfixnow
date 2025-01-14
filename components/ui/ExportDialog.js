import { Button } from '@/components/ui/button';
import { X, Share2, Copy, Download, FileType } from 'lucide-react';

const ExportDialog = ({ onSubmit, onClose, onShare, onCopy, defaultName, canShare }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Share or Export</h2>
        
        {/* Mobile Share Button */}
        {canShare && (
          <Button
            onClick={onShare}
            className="w-full mb-4 gap-2"
            variant="outline"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        )}

        {/* Copy to Clipboard Button */}
        <Button
          onClick={onCopy}
          className="w-full mb-4 gap-2"
          variant="outline"
        >
          <Copy className="w-4 h-4" />
          Copy to Clipboard
        </Button>

        {/* Export Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-1">
              Download as File
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="filename"
                name="filename"
                defaultValue={defaultName}
                required
                className="flex-1 px-3 py-2 border rounded-lg"
                placeholder="Enter filename"
              />
              <select
                name="format"
                className="px-3 py-2 border rounded-lg"
                defaultValue="pdf"
              >
                <option value="pdf">PDF</option>
                <option value="html">HTML</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="submit" className="gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportDialog;
