import { Button } from '@/components/ui/button';
import { X, Share2, Download } from 'lucide-react';

const ExportDialog = ({ onSubmit, onClose, onShare, defaultName, canShare }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Export Options</h2>
        
        {/* Share Button - simplified check */}
        {canShare && (
          <Button
            onClick={onShare}
            className="w-full mb-4 gap-2"
            variant="outline"
          >
            <Share2 className="w-4 h-4" />
            Share via System Dialog
          </Button>
        )}

        {/* Export Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                id="filename"
                name="filename"
                defaultValue={defaultName}
                required
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter filename"
              />
              <select
                name="format"
                className="w-full px-3 py-2 border rounded-lg"
                defaultValue="pdf"
              >
                <option value="pdf">PDF Document (with annotations)</option>
                <option value="html">HTML (interactive)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportDialog;
