import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, Check, X, FileImage, Clipboard, Download, HelpCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Instructions from './Instructions';
import html2canvas from 'html2canvas';
import ExportDialog from './ExportDialog';

const ImageAnnotator = () => {
  const [images, setImages] = useState([]);  // Array of {id, src}
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState({});  // Map of imageId -> annotations
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [noteInput, setNoteInput] = useState({ visible: false, x: 0, y: 0 });
  const [noteText, setNoteText] = useState('');
  const [draggedAnnotation, setDraggedAnnotation] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState({ visible: false, type: null });
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
    const allPages = images.map((image, index) => {
      const imageAnnotations = annotations[image.id] || [];
      return `
        <div class="page-container ${index > 0 ? 'mt-8 pt-8 border-t' : ''}">
          <h2 class="text-lg mb-4">Page ${index + 1}</h2>
          <div class="image-container">
            <img src="${image.src}" style="max-width: 100%; height: auto;">
            ${imageAnnotations.map(ann => `
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
      `;
    }).join('');
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PLSFIX-THX Annotation</title>
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
            <h1>PLSFIX-THX</h1>
            <p style="color: #666;">Exported annotations (${images.length} pages)</p>
          </div>
          ${allPages}
        </div>
        <script>
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

  const handleExportClick = (type) => {
    setShowExportDialog({ visible: true, type });
  };

  const handleExportSubmit = (e) => {
    e.preventDefault();
    const filename = e.target.filename.value.trim();
    
    if (showExportDialog.type === 'html') {
      const html = generateExportableHtml();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename + '.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (showExportDialog.type === 'png') {
      handleExportPNG(filename);
    }
    
    setShowExportDialog({ visible: false, type: null });
  };

  const handleExportPNG = async (filename) => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    document.body.appendChild(container);

    try {
      // Process each image
      for (let i = 0; i < images.length; i++) {
        const imageContainer = document.createElement('div');
        imageContainer.style.position = 'relative';
        imageContainer.style.display = 'inline-block';
        imageContainer.style.padding = '20px';  // Add padding around the image
        
        // Add the image
        const imgElement = document.createElement('img');
        imgElement.src = images[i].src;
        imgElement.style.maxWidth = '100%';
        imageContainer.appendChild(imgElement);

        // Add visible annotations
        const imageAnnotations = annotations[images[i].id] || [];
        
        imageAnnotations.forEach(ann => {
          const marker = document.createElement('div');
          marker.style.position = 'absolute';
          marker.style.left = `${ann.x}%`;
          marker.style.top = `${ann.y}%`;
          marker.style.transform = 'translate(-50%, -50%)';
          marker.style.width = '48px'; // Fixed width for marker container
          marker.style.height = '48px'; // Fixed height for marker container

          // Improved marker button
          const button = document.createElement('div');
          button.style.width = '48px'; // Larger fixed size
          button.style.height = '48px'; // Larger fixed size
          button.style.borderRadius = '50%';
          button.style.backgroundColor = ann.completed ? '#22c55e' : '#3b82f6';
          button.style.color = 'white';
          button.style.display = 'flex';
          button.style.alignItems = 'center';
          button.style.justifyContent = 'center';
          button.style.border = '3px solid white'; // Thicker border
          button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
          button.style.position = 'relative'; // For centering the icon
          
          // Better icon styling
          const icon = document.createElement('div');
          icon.style.position = 'absolute';
          icon.style.left = '50%';
          icon.style.top = '50%';
          icon.style.transform = 'translate(-50%, -50%)';
          icon.style.fontSize = '28px'; // Larger font size
          icon.style.fontFamily = 'system-ui, -apple-system, sans-serif';
          icon.style.fontWeight = 'bold';
          icon.style.lineHeight = '1';
          icon.innerHTML = ann.completed ? '✓' : '!';
          button.appendChild(icon);
          
          // Improved note style
          const note = document.createElement('div');
          note.style.position = 'absolute';
          note.style.backgroundColor = 'white';
          note.style.padding = '16px 24px'; // More padding
          note.style.borderRadius = '12px'; // Larger radius
          note.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2), 0 0 0 2px rgba(0,0,0,0.1)';
          note.style.fontSize = '28px'; // Larger font
          note.style.fontWeight = '500';
          note.style.top = '130%'; // More spacing from marker
          note.style.left = '50%';
          note.style.transform = 'translateX(-50%)';
          note.style.marginTop = '12px';
          note.style.whiteSpace = 'normal';
          note.style.maxWidth = '400px'; // Wider notes
          note.style.minWidth = '200px'; // Minimum width
          note.style.color = '#000000';
          note.style.lineHeight = '1.4';
          note.style.textAlign = 'left';
          note.style.border = '2px solid #e5e7eb';
          note.style.zIndex = '1000';
          note.textContent = ann.note;
          
          marker.appendChild(button);
          marker.appendChild(note);
          imageContainer.appendChild(marker);
        });

        container.appendChild(imageContainer);

        // Generate canvas for current page
        const canvas = await html2canvas(imageContainer, {
          backgroundColor: 'white',
          scale: 2,  // Higher quality
        });
        
        // Download individual PNG
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `${filename}-page${i + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clear container for next image
        container.innerHTML = '';
      }
    } finally {
      document.body.removeChild(container);
    }
  };

  const currentAnnotations = images[currentImageIndex]
    ? annotations[images[currentImageIndex].id] || []
    : [];

  return (
    <div className="relative">
      {showExportDialog.visible && (
        <ExportDialog
          onSubmit={handleExportSubmit}
          onClose={() => setShowExportDialog({ visible: false, type: null })}
          defaultName={`annotation-${currentImageIndex + 1}`}
        />
      )}

      {/* Instructions Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          showInstructions ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-4 h-full overflow-y-auto">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-0 top-4 -translate-x-full bg-white shadow-lg rounded-l-lg p-2"
            onClick={() => setShowInstructions(!showInstructions)}
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Instructions hasImages={images.length > 0} />
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-6 max-w-4xl mx-auto" ref={containerRef}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">PLSFIX-THX</h1>
          <p className="text-sm text-slate-600">Take a screenshot and copy and paste or upload an image to start annotating.</p>
        </div>
        
        <div className="space-y-4">
          {!images.length && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-8">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clipboard className="w-6 h-6" />
                  <span className="text-lg">Paste image from clipboard (Ctrl+V)</span>
                </div>
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-2">or</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                  />
                  <p className="mt-2 text-xs text-slate-500">Supported formats: PNG, JPEG, GIF, WebP</p>
                </div>
              </div>
            </div>
          )}

          {images.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => document.getElementById('newImageInput').click()}
                  >
                    <FileImage className="w-4 h-4" />
                    New Image
                  </Button>
                  <input
                    id="newImageInput"
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentImageIndex === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="inline-flex items-center text-sm text-slate-500">
                    Page {currentImageIndex + 1} of {images.length}
                  </span>
                  <Button
                    onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                    disabled={currentImageIndex === images.length - 1}
                    variant="outline"
                  >
                    Next
                  </Button>
                  <Button
                    onClick={() => handleExportClick('html')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export HTML
                  </Button>
                  <Button
                    onClick={() => handleExportClick('png')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Export PNG
                  </Button>
                </div>
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
    </div>
  );
};

export default ImageAnnotator;