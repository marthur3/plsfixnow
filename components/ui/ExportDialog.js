import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const ExportDialog = ({ onSubmit, onClose, defaultName }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4">Export File</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="filename" className="block text-sm font-medium text-gray-700 mb-1">
              Filename
            </label>
            <input
              type="text"
              id="filename"
              name="filename"
              defaultValue={defaultName}
              required
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter filename"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Export
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportDialog;
