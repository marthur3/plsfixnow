import { Button } from '@/components/ui/button';
import { X, Share2, Download, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';

const ExportDialog = ({ onSubmit, onClose, onShare, defaultName, canShare, type }) => {
  const [shareFormat, setShareFormat] = useState('pdf');
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [canCopyImage, setCanCopyImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkCapabilities = async () => {
      // Check file sharing support
      try {
        if (navigator.canShare) {
          const testFile = new File([""], "test.pdf", { type: "application/pdf" });
          setCanShareFiles(await navigator.canShare({ files: [testFile] }));
        }
      } catch {
        setCanShareFiles(false);
      }

      // Fix: Check clipboard image support properly
      setCanCopyImage(
        'ClipboardItem' in window && 
        typeof navigator.clipboard?.write === 'function'
      );
    };
    checkCapabilities();
  }, []);

  const handleShare = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await onShare(shareFormat);
      onClose();
    } catch (err) {
      setError(err.message === 'AbortError' ? 
        'Share cancelled' : 
        'Failed to generate export'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
        
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          {type === 'share' ? 'Share Options' : 'Export Options'}
        </h2>
        
        {type === 'share' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium text-gray-700">
                Share Format
              </label>
              <select
                value={shareFormat}
                onChange={(e) => setShareFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="pdf">PDF Document</option>
                <option value="png">Image (PNG)</option>
                {!canShareFiles && <option value="html">Interactive HTML</option>}
              </select>
            </div>

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {isLoading && (
              <div className="text-sm text-blue-600">
                Preparing document...
              </div>
            )}

            <div className="flex flex-col gap-2">
              {canShare && (
                <Button
                  onClick={handleShare}
                  className="w-full gap-2"
                  variant="outline"
                  disabled={isLoading}
                >
                  <Share2 className="w-4 h-4" />
                  {isLoading ? 'Preparing...' : 'Share'}
                </Button>
              )}
              
              {!canShare && (
                <Button
                  onClick={handleShare}
                  className="w-full gap-2"
                  variant="outline"
                  disabled={isLoading}
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </Button>
              )}
            </div>
          </div>
        ) : (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400"
                  placeholder="Enter filename"
                />
                <select
                  name="format"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                  defaultValue="pdf"
                >
                  <option value="pdf">PDF Document (with annotations)</option>
                  <option value="png">Image (PNG)</option>
                  <option value="html">HTML (interactive)</option>
                </select>
              </div>
            </div>

            {canCopyImage && (
              <Button
                type="button"
                onClick={() => onSubmit({ preventDefault: () => {}, target: { format: { value: 'clipboard' } } })}
                variant="outline"
                className="w-full gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy to Clipboard
              </Button>
            )}

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
        )}
      </div>
    </div>
  );
};

export default ExportDialog;
