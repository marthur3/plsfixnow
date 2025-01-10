import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, Check, X, FileImage, Clipboard, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ImageAnnotator = () => {
  const [images, setImages] = useState([]);  // Array of {id, src}
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState({});  // Map of imageId -> annotations
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [noteInput, setNoteInput] = useState({ visible: false, x: 0, y: 0 });
  const [noteText, setNoteText] = useState('');
  const [draggedAnnotation, setDraggedAnnotation] = useState(null);
  const imageRef = useRef(null);
  const popupRef = useRef(null);
  const noteInputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handlePaste = async (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      
      const items = e.clipboardData?.items;
      const imageItem = Array.from(items).find(item => item.type.startsWith('image'));
      
      if (imageItem) {
        const blob = imageItem.getAsFile();
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const newImage = {
            id: Date.now(),
            src: e.target.result
          };
          setImages(prev => [...prev, newImage]);
          setAnnotations(prev => ({ ...prev, [newImage.id]: [] }));
          setCurrentImageIndex(images.length);
        };
        
        reader.readAsDataURL(blob);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [images.length]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedAnnotation && 
          popupRef.current && 
          !popupRef.current.contains(event.target)) {
        setSelectedAnnotation(null);
      }
      
      if (noteInput.visible && 
          noteInputRef.current && 
          !noteInputRef.current.contains(event.target)) {
        setNoteInput({ visible: false, x: 0, y: 0 });
        setNoteText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedAnnotation, noteInput.visible]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now(),
          src: e.target.result
        };
        setImages(prev => [...prev, newImage]);
        setAnnotations(prev => ({ ...prev, [newImage.id]: [] }));
        setCurrentImageIndex(images.length);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageDoubleClick = (e) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setNoteInput({
      visible: true,
      x,
      y
    });
    
    setTimeout(() => {
      const input = document.querySelector('#noteInput');
      if (input) input.focus();
    }, 0);
  };

  const handleNoteSubmit = (e) => {
    e?.preventDefault();
    
    if (noteText.trim() && images[currentImageIndex]) {
      const currentImageId = images[currentImageIndex].id;
      const newAnnotation = {
        id: Date.now(),
        x: noteInput.x,
        y: noteInput.y,
        note: noteText,
        completed: false
      };
      
      setAnnotations(prev => ({
        ...prev,
        [currentImageId]: [...(prev[currentImageId] || []), newAnnotation]
      }));
    }

    setNoteInput({ visible: false, x: 0, y: 0 });
    setNoteText('');
  };

  const handleDragStart = (annotation, e) => {
    e.stopPropagation();
    setDraggedAnnotation(annotation);
    setSelectedAnnotation(null);
  };

  const handleDrag = (e) => {
    if (!draggedAnnotation || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));

    const currentImageId = images[currentImageIndex].id;
    setAnnotations(prev => ({
      ...prev,
      [currentImageId]: prev[currentImageId].map(ann =>
        ann.id === draggedAnnotation.id
          ? { ...ann, x: boundedX, y: boundedY }
          : ann
      )
    }));
  };

  const handleDragEnd = () => {
    setDraggedAnnotation(null);
  };

  const toggleAnnotation = (annotation, e) => {
    e.stopPropagation();
    if (selectedAnnotation?.id === annotation.id) {
      setSelectedAnnotation(null);
    } else {
      setSelectedAnnotation(annotation);
    }
  };

  const toggleCompletion = (id, e) => {
    e.stopPropagation();
    const currentImageId = images[currentImageIndex].id;
    setAnnotations(prev => ({
      ...prev,
      [currentImageId]: prev[currentImageId].map(ann =>
        ann.id === id ? { ...ann, completed: !ann.completed } : ann
      )
    }));
  };

  const deleteAnnotation = (id, e) => {
    e.stopPropagation();
    const currentImageId = images[currentImageIndex].id;
    setAnnotations(prev => ({
      ...prev,
      [currentImageId]: prev[currentImageId].filter(ann => ann.id !== id)
    }));
    setSelectedAnnotation(null);
  };

  const generateExportableHtml = () => {
    const currentImageId = images[currentImageIndex]?.id;
    const currentImage = images[currentImageIndex];
    const currentAnnots = annotations[currentImageId] || [];
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PLSFIXNOW Annotation</title>
        <meta charset="utf-8">
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 20px; }
          .container { max-width: 1200px; margin: 0 auto; }
          .image-container { position: relative; display: inline-block; }
          .annotation { position: absolute; transform: translate(-50%, -50%); }
          .marker { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; border: none; }
          .marker.incomplete { background-color: #3b82f6; }
          .marker.complete { background-color: #22c55e; }
          .popup { position: absolute; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 10; width: 200px; margin-top: 8px; transform: translateX(-50%); }
          .title { text-align: center; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="title">
            <h1>PLSFIXNOW</h1>
            <p style="color: #666;">Exported annotation</p>
          </div>
          <div class="image-container">
            <img src="${currentImage.src}" style="max-width: 100%; height: auto;">
            ${currentAnnots.map(ann => `
              <div class="annotation" style="left: ${ann.x}%; top: ${ann.y}%">
                <button 
                  class="marker ${ann.completed ? 'complete' : 'incomplete'}"
                  onclick="togglePopup(${ann.id})"
                >
                  ${ann.completed ? '✓' : '!'}
                </button>
                <div id="popup-${ann.id}" class="popup" style="display: none">
                  <p style="margin: 0 0 8px 0">${ann.note}</p>
                  <div style="display: flex; justify-content: space-between">
                    <button onclick="toggleComplete(${ann.id})" style="padding: 4px 8px">
                      ${ann.completed ? 'Undo' : 'Complete'}
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        <script>
          const annotations = ${JSON.stringify(currentAnnots)};
          
          function togglePopup(id) {
            const popup = document.getElementById('popup-' + id);
            const allPopups = document.querySelectorAll('.popup');
            allPopups.forEach(p => {
              if (p !== popup) p.style.display = 'none';
            });
            popup.style.display = popup.style.display === 'none' ? 'block' : 'none';
          }

          function toggleComplete(id) {
            const marker = document.querySelector(\`[onclick="togglePopup(\${id})"]\`);
            const isComplete = marker.classList.contains('complete');
            marker.classList.toggle('complete');
            marker.classList.toggle('incomplete');
            marker.innerHTML = isComplete ? '!' : '✓';
          }

          document.addEventListener('click', (e) => {
            if (!e.target.closest('.annotation')) {
              document.querySelectorAll('.popup').forEach(p => p.style.display = 'none');
            }
          });
        </script>
      </body>
      </html>
    `;
    return html;
  };

  const handleExport = () => {
    const html = generateExportableHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'annotation-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const currentAnnotations = images[currentImageIndex]
    ? annotations[images[currentImageIndex].id] || []
    : [];

  return (
    <Card className="p-6 max-w-4xl mx-auto" ref={containerRef}>
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">PLSFIXNOW</h1>
        <p className="text-sm text-slate-500">Upload or paste an image to start annotating.</p>
      </div>
      <div className="space-y-4">
        <div className="flex gap-4 items-center justify-between">
          <div className="flex-1">
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              multiple
              onChange={handleImageUpload}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
            <p className="mt-1 text-xs text-slate-500">Supported formats: PNG, JPEG, GIF, WebP</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clipboard className="w-4 h-4" />
              Paste image (Ctrl+V)
            </div>
            {images.length > 0 && (
              <Button
                onClick={handleExport}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <>
            <div className="flex justify-between items-center">
              <Button
                onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                disabled={currentImageIndex === 0}
                variant="outline"
              >
                Previous
              </Button>
              <span className="text-sm text-slate-500">
                Page {currentImageIndex + 1} of {images.length}
              </span>
              <Button
                onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                disabled={currentImageIndex === images.length - 1}
                variant="outline"
              >
                Next
              </Button>
            </div>

            <div 
              className="relative inline-block" 
              style={{ maxWidth: '100%' }}
              onMouseMove={handleDrag}
              onMouseUp={handleDragEnd}
            >
              <img
                ref={imageRef}
                src={images[currentImageIndex].src}
                alt={`Image ${currentImageIndex + 1}`}
                className="max-w-full h-auto"
                onDoubleClick={handleImageDoubleClick}
              />
              
              {noteInput.visible && (
                <div
                  ref={noteInputRef}
                  className="absolute z-20 bg-white p-3 rounded-lg shadow-lg"
                  style={{
                    left: `${noteInput.x}%`,
                    top: `${noteInput.y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <input
                      id="noteInput"
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleNoteSubmit(e);
                        }
                      }}
                      placeholder="Enter note text..."
                      className="px-3 py-2 border rounded-lg"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNoteInput({ visible: false, x: 0, y: 0 });
                          setNoteText('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="button" 
                        size="sm"
                        onClick={handleNoteSubmit}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {currentAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className="absolute"
                  style={{
                    left: `${annotation.x}%`,
                    top: `${annotation.y}%`,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'move'
                  }}
                >
                  <button
                    onMouseDown={(e) => handleDragStart(annotation, e)}
                    onClick={(e) => toggleAnnotation(annotation, e)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      annotation.completed ? 'bg-green-500' : 'bg-blue-500'
                    } text-white hover:opacity-90 transition-opacity`}
                  >
                    {annotation.completed ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </button>

                  {selectedAnnotation?.id === annotation.id && (
                    <div
                      ref={popupRef}
                      className="absolute z-10 bg-white p-3 rounded-lg shadow-lg -translate-x-1/2 mt-2 w-56"
                    >
                      <p className="mb-2 text-sm">{annotation.note}</p>
                      <div className="flex justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => toggleCompletion(annotation.id, e)}
                          className="flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          {annotation.completed ? 'Undo' : 'Complete'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => deleteAnnotation(annotation.id, e)}
                          className="flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default ImageAnnotator;