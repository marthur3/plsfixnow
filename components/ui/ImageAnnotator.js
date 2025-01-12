import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, Check, X, FileImage, Clipboard, Download, HelpCircle, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Instructions from './Instructions';
import html2canvas from 'html2canvas';
import ExportDialog from './ExportDialog';
// Add jsPDF import
import { jsPDF } from 'jspdf';
import { Analytics } from '@vercel/analytics/react';

const ImageAnnotator = () => {
  const [images, setImages] = useState([]);  // Array of {id, src}
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState({});  // Map of imageId -> annotations
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [noteInput, setNoteInput] = useState({ visible: false, x: 0, y: 0 });
  const [noteText, setNoteText] = useState('');
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [draggedAnnotation, setDraggedAnnotation] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState({ visible: false, type: null });
  const imageRef = useRef(null);
  const popupRef = useRef(null);
  const noteInputRef = useRef(null);
  const containerRef = useRef(null);
  // Add containerSize state
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Add reference for annotations container
  const annotationsRef = useRef(null);

  const [lastTap, setLastTap] = useState(0);
  const [touchMoved, setTouchMoved] = useState(false);

  useEffect(() => {
    const handlePaste = async (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      
      const items = e.clipboardData?.items;
      const imageItem = Array.from(items).find(item => item.type.startsWith('image'));
      
      if (imageItem) {
        const blob = imageItem.getAsFile();
        const reader = new FileReader();
        
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const newImage = {
              id: Date.now(),
              src: e.target.result,
              width: img.width,
              height: img.height
            };
            setImages(prev => [...prev, newImage]);
            setAnnotations(prev => ({ ...prev, [newImage.id]: [] }));
            setCurrentImageIndex(images.length);
          };
          img.src = e.target.result;
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
          !noteInputRef.current.contains(event.target) &&
          !event.target.closest('#noteInput')) {
        setNoteInput({ visible: false, x: 0, y: 0 });
        setNoteText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [selectedAnnotation, noteInput.visible]);

  useEffect(() => {
    if (noteInput.visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [noteInput.visible]);

  // Add resize observer
  useEffect(() => {
    if (!imageRef.current) return;
    
    const updateDimensions = () => {
      if (imageRef.current) {
        const { width, height } = imageRef.current.getBoundingClientRect();
        setContainerSize({ width, height });
      }
    };

    const observer = new ResizeObserver(updateDimensions);
    observer.observe(imageRef.current);
    updateDimensions();

    return () => {
      observer.disconnect();
    };
  }, [currentImageIndex]);

  const noteInputStyles = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '400px',
    zIndex: 1000,
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '0.5rem',
    boxShadow: '0 0 0 100vmax rgba(0,0,0,0.3)',
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const newImage = {
            id: Date.now(),
            src: e.target.result,
            width: img.width,
            height: img.height
          };
          setImages(prev => [...prev, newImage]);
          setAnnotations(prev => ({ ...prev, [newImage.id]: [] }));
          setCurrentImageIndex(images.length);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchStartTime(Date.now());
      const { x, y } = getRelativeCoordinates(touch.clientX, touch.clientY);
      setTouchStartPos({ x, y });
      setTouchMoved(false);
    }
  };

  const handleTouchMove = () => {
    setTouchMoved(true);
  };

  const handleTouchEnd = (e) => {
    const now = Date.now();
    const touchDuration = now - touchStartTime;
    
    // Detect double tap
    if (!touchMoved) {
      const DOUBLE_TAP_DELAY = 300;
      if (now - lastTap < DOUBLE_TAP_DELAY) {
        // Double tap detected
        e.preventDefault();
        setNoteInput({
          visible: true,
          x: touchStartPos.x,
          y: touchStartPos.y
        });
        
        setTimeout(() => {
          const input = document.querySelector('#noteInput');
          if (input) input.focus();
        }, 100);
      } else {
        // Single tap
        setLastTap(now);
      }
    }
  };

  // Updated coordinate calculation helper
  const getRelativeCoordinates = (clientX, clientY) => {
    if (!imageRef.current || !annotationsRef.current) return { x: 0, y: 0 };
    
    const imageRect = imageRef.current.getBoundingClientRect();
    const containerRect = annotationsRef.current.getBoundingClientRect();

    // Calculate the actual rendered image position within the container
    const imageWidth = imageRect.width;
    const imageHeight = imageRect.height;
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Calculate the offset of the image within the container
    const offsetX = (containerWidth - imageWidth) / 2;
    const offsetY = (containerHeight - imageHeight) / 2;

    // Calculate the position relative to the actual image area
    const imageX = clientX - (containerRect.left + offsetX);
    const imageY = clientY - (containerRect.top + offsetY);

    // Convert to percentages within the actual image area
    const x = (imageX / imageWidth) * 100;
    const y = (imageY / imageHeight) * 100;

    // Ensure coordinates are within bounds
    return {
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    };
  };

  // Update handleImageDoubleClick
  const handleImageDoubleClick = (e) => {
    if (!imageRef.current) return;

    const clientX = e.clientX || e.pageX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || e.pageY || (e.touches && e.touches[0].clientY);
    const { x, y } = getRelativeCoordinates(clientX, clientY);

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

  // Update dragStart to include touch events
  const handleDragStart = (annotation, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedAnnotation(annotation);
    setSelectedAnnotation(null);
  };

  // Update drag handler to support both mouse and touch
  const handleDrag = (e) => {
    if (!draggedAnnotation || !imageRef.current) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;

    const { x, y } = getRelativeCoordinates(clientX, clientY);
    
    const currentImageId = images[currentImageIndex].id;
    setAnnotations(prev => ({
      ...prev,
      [currentImageId]: prev[currentImageId].map(ann =>
        ann.id === draggedAnnotation.id
          ? { ...ann, x, y }
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
            <div class="image-wrapper">
              <img src="${image.src}" alt="Page ${index + 1}" class="main-image">
              <div class="annotations-layer">
                ${imageAnnotations.map(ann => `
                  <div class="annotation-wrapper">
                    <div class="annotation" style="left: ${ann.x}%; top: ${ann.y}%">
                      <button 
                        class="marker ${ann.completed ? 'complete' : 'incomplete'}"
                        onclick="togglePopup('${ann.id}')"
                        data-id="${ann.id}"
                        ontouchstart="togglePopup('${ann.id}')"
                      >
                        ${ann.completed ? '✓' : '!'}
                      </button>
                      <div id="popup-${ann.id}" class="popup">
                        <div class="note-text">${ann.note}</div>
                        <div class="button-container">
                          <button onclick="toggleComplete('${ann.id}')" class="action-button">
                            ${ann.completed ? 'Undo' : 'Complete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            -webkit-tap-highlight-color: transparent;
          }
          
          .popup-backdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
          }
          
          .image-container { 
            position: relative;
            width: 100%;
            max-width: 100vw;
            margin: 0 auto;
            background: #f8f9fa;
            border-radius: 4px;
            overflow: visible;
          }
          
          .image-wrapper {
            position: relative;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          .main-image {
            display: block;
            max-width: 100%;
            height: auto;
            position: relative;
            z-index: 1;
          }
  
          .annotations-layer {
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
          }
  
          .annotation-wrapper {
            position: absolute;
            inset: 0;
            pointer-events: none;
          }
          
          .annotation { 
            position: absolute;
            transform: translate(-50%, -50%);
            z-index: 2;
            pointer-events: auto;
          }
          
          .marker { 
            width: clamp(24px, 6vmin, 32px);
            height: clamp(24px, 6vmin, 32px);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
            border: 2px solid white;
            font-size: clamp(14px, 3vmin, 16px);
            font-weight: bold;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            background-color: #3b82f6;
            position: relative;
            z-index: 3;
          }
          
          .marker.complete { 
            background-color: #22c55e;
          }
          
          .popup { 
            display: none;
            position: absolute;
            background: white;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            z-index: 1000;
            width: 280px;
            border: 1px solid #e5e7eb;
            top: 130%;
            left: 50%;
            transform: translateX(-50%);
          }
  
          .note-text {
            margin-bottom: 16px;
            font-size: 14px;
            color: #374151;
            word-break: break-word;
          }
  
          .button-container {
            display: flex;
            gap: 8px;
            align-items: center;
          }
  
          .action-button {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 36px;
          }
  
          .action-button:hover {
            background: #f9fafb;
          }
  
          @media (max-width: 767px) {
            .popup {
              position: fixed;
              bottom: 20px;
              top: auto;
              left: 50%;
              width: calc(100% - 32px);
              max-width: 320px;
            }
          }
        </style>
      </head>
      <body>
      <div class="container">
        ${allPages}
      <footer style="text-align: center; padding: 20px; margin-top: 40px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            Created with 
            <a 
              href="https://plsfixnow.vercel.app" 
              target="_blank" 
              rel="noopener noreferrer"
              style="color: #3b82f6; text-decoration: none;"
            >
              PLSFIX-THX
            </a>
             by 
            <a 
              href="https://www.linkedin.com/in/michael-arthur" 
              target="_blank" 
              rel="noopener noreferrer"
              style="color: #3b82f6; text-decoration: none;"
            >
              Michael Arthur
            </a>
          </p>
        </footer>
      </div>
      <script>
          function togglePopup(id) {
            const popup = document.getElementById('popup-' + id);
            const allPopups = document.querySelectorAll('.popup');
            const isMobile = window.innerWidth < 768;
            const marker = document.querySelector(\`[data-id="\${id}"]\`);
            
            // Close all other popups
            allPopups.forEach(p => {
              if (p !== popup) {
                p.style.display = 'none';
              }
            });
  
            // Toggle current popup
            if (popup.style.display === 'block') {
              popup.style.display = 'none';
              marker.classList.remove('active');
            } else {
              popup.style.display = 'block';
              marker.classList.add('active');
              
              if (isMobile) {
                // On mobile, position popup at the bottom of the screen
                popup.style.position = 'fixed';
                popup.style.bottom = '20px';
                popup.style.left = '50%';
                popup.style.transform = 'translateX(-50%)';
                popup.style.top = 'auto';
                popup.style.width = 'calc(100% - 32px)';
                popup.style.maxWidth = '320px';
                
                // Add backdrop on mobile
                let backdrop = document.querySelector('.popup-backdrop');
                if (!backdrop) {
                  backdrop = document.createElement('div');
                  backdrop.className = 'popup-backdrop';
                  document.body.appendChild(backdrop);
                }
                backdrop.style.display = 'block';
              }
            }
          }
  
          function toggleComplete(id) {
            const marker = document.querySelector(\`[data-id="\${id}"]\`);
            const popup = document.getElementById('popup-' + id);
            const button = popup.querySelector('.action-button');
            
            marker.classList.toggle('complete');
            marker.classList.toggle('incomplete');
            marker.innerHTML = marker.classList.contains('complete') ? '✓' : '!';
            button.textContent = marker.classList.contains('complete') ? 'Undo' : 'Complete';
          }
  
          // Close popups when clicking outside
          document.addEventListener('click', (e) => {
            if (!e.target.closest('.annotation')) {
              closeAllPopups();
            }
          });
          
          document.addEventListener('touchend', (e) => {
            if (e.target.classList.contains('popup-backdrop')) {
              closeAllPopups();
            }
          });
          
          function closeAllPopups() {
            document.querySelectorAll('.popup').forEach(popup => {
              popup.style.display = 'none';
            });
            document.querySelectorAll('.marker').forEach(marker => {
              marker.classList.remove('active');
            });
            const backdrop = document.querySelector('.popup-backdrop');
            if (backdrop) {
              backdrop.style.display = 'none';
            }
          }
        </script>
      </body>
      </html>
    `;
    return html;
  };

  const handleExportClick = (type) => {
    setShowExportDialog({ visible: true, type });
  };


// Update your handleExportSubmit function
const handleExportSubmit = async (e) => {
  e.preventDefault();
  const filename = e.target.filename.value.trim();
  
  if (showExportDialog.type === 'html') {
    const html = generateExportableHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } else if (showExportDialog.type === 'png') {
    handleExportPNG(filename);
  }
  
  setShowExportDialog({ visible: false, type: null });
};
// The PNG export is only exporting one page even though images.length > 1
// Need to fix handleExportPNG to properly handle multiple pages while keeping existing styling
// Current issue: container.innerHTML = '' might be clearing too early
// Requirements:
// 1. Keep all existing styling and marker/note positioning
// 2. Fix the loop to properly export all pages
// 3. Maintain current quality settings (scale: 2, backgroundColor: 'white')
const handleExportPNG = async (filename) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px'
    });
    
    for (let i = 0; i < images.length; i++) {
      const imageContainer = document.createElement('div');
      imageContainer.style.position = 'relative';
      imageContainer.style.display = 'inline-block';
      imageContainer.style.padding = '20px';
      imageContainer.style.maxWidth = '1200px'; // Limit max width for consistency
      
      container.innerHTML = '';
      container.appendChild(imageContainer);

      // Add page header
      const header = document.createElement('h2');
      header.style.fontSize = '24px';
      header.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      header.style.fontWeight = '600';
      header.style.color = '#111827';
      header.style.marginBottom = '16px';
      header.textContent = `Page ${i + 1}`;
      imageContainer.appendChild(header);

      const imgElement = document.createElement('img');
      imgElement.src = images[i].src;
      imgElement.style.maxWidth = '100%';
      imgElement.style.display = 'block';
      
      await new Promise((resolve) => {
        imgElement.onload = resolve;
      });
      
      imageContainer.appendChild(imgElement);

      // Fix annotation creation with consistent sizes
      const imageAnnotations = annotations[images[i].id] || [];
      for (const ann of imageAnnotations) {
        const marker = document.createElement('div');
        marker.style.position = 'absolute';
        marker.style.left = `${ann.x}%`;
        marker.style.top = `${ann.y}%`;
        marker.style.transform = 'translate(-50%, -50%)';

        const button = document.createElement('button');
        button.style.width = '32px';
        button.style.height = '32px';
        button.style.borderRadius = '50%';
        button.style.backgroundColor = ann.completed ? '#22c55e' : '#3b82f6';
        button.style.color = 'white';
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.border = '2px solid white';
        button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        button.style.fontSize = '20px';
        button.style.fontWeight = 'bold';
        button.style.lineHeight = '1';
        button.style.padding = '0';
        button.style.cursor = 'pointer';
        button.innerHTML = ann.completed ? '✓' : '!';

        marker.appendChild(button);

        // Add note text with consistent sizing
        const note = document.createElement('div');
        note.style.position = 'absolute';
        note.style.backgroundColor = 'white';
        note.style.padding = '12px 16px';
        note.style.borderRadius = '8px';
        note.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        note.style.top = '130%';
        note.style.left = '50%';
        note.style.transform = 'translateX(-50%)';
        note.style.width = '240px'; // Fixed width
        note.style.color = '#374151';
        note.style.border = '1px solid #e5e7eb';
        note.style.zIndex = '1000';
        note.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        note.style.fontSize = '14px'; // Consistent font size
        note.style.fontWeight = '400';
        note.style.lineHeight = '1.4';
        note.textContent = ann.note;
        
        marker.appendChild(note);
        imageContainer.appendChild(marker);
      }

      // Update footer styling
      const footer = document.createElement('div');
      footer.style.textAlign = 'center';
      footer.style.padding = '16px';
      footer.style.marginTop = '24px';
      footer.style.borderTop = '1px solid #e5e7eb';
      footer.style.color = '#6b7280';
      footer.style.fontSize = '12px';
      footer.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      footer.innerHTML = `Created with plsfixnow.vercel.app`;

      imageContainer.appendChild(footer);

      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(imageContainer, {
        backgroundColor: 'white',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        imageTimeout: 0,
      });

      if (i > 0) {
        pdf.addPage();
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageWidth = canvas.width;
      const imageHeight = canvas.height;
      
      let finalWidth = pageWidth;
      let finalHeight = (imageHeight * pageWidth) / imageWidth;

      if (finalHeight > pageHeight) {
        finalHeight = pageHeight;
        finalWidth = (imageWidth * pageHeight) / imageHeight;
      }

      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, finalWidth, finalHeight);
    }

    pdf.save(`${filename}.pdf`);

  } finally {
    document.body.removeChild(container);
  }
};

  const currentAnnotations = images[currentImageIndex]
    ? annotations[images[currentImageIndex].id] || []
    : [];

  return (
    <div className="relative">
      <Analytics />
      {showExportDialog.visible && (
        <ExportDialog
          onSubmit={handleExportSubmit}
          onClose={() => setShowExportDialog({ visible: false, type: null })}
          defaultName={`annotation-${currentImageIndex + 1}`}
        />
      )}

      {/* Instructions Panel */}
      <div 
        className={`fixed right-0 top-0 h-full w-full md:w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          showInstructions ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Add semi-transparent backdrop for mobile only */}
        <div 
          className="fixed inset-0 bg-black/50 md:hidden"
          onClick={() => setShowInstructions(false)}
        />
        
        <div className="relative h-full bg-white">
          <div className="p-4 h-full overflow-y-auto">
            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 md:hidden"
              onClick={() => setShowInstructions(false)}
            >
              <X className="w-5 h-5" />
            </Button>
            
            {/* Desktop Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-0 top-4 -translate-x-full bg-white shadow-lg rounded-l-lg p-2 hidden md:flex"
              onClick={() => setShowInstructions(!showInstructions)}
            >
              <HelpCircle className="w-5 h-5" />
            </Button>

            <div className="pt-12 md:pt-0">
              <Instructions hasImages={images.length > 0} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-3 md:p-6 w-full mx-auto" ref={containerRef}>
        <div className="text-center mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold mb-2">PLSFIX-THX</h1>
          <p className="text-xs md:text-sm text-slate-600">Take a screenshot and copy and paste or upload an image to start annotating.</p>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          {!images.length && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-4 md:p-8">
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
              <div className="flex flex-col md:flex-row justify-between gap-3 md:items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 md:flex-none items-center gap-2 py-3 md:py-2"
                    onClick={() => document.getElementById('newImageInput').click()}
                  >
                    <FileImage className="w-4 h-4" />
                    <span className="hidden md:inline">New Image</span>
                    <span className="md:hidden">Add</span>
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
                <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentImageIndex === 0}
                      variant="outline"
                      className="px-3 py-3 md:py-2"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-slate-500">
                      {currentImageIndex + 1}/{images.length}
                    </span>
                    <Button
                      onClick={() => setCurrentImageIndex(prev => Math.min(images.length - 1, prev + 1))}
                      disabled={currentImageIndex === images.length - 1}
                      variant="outline"
                      className="px-3 py-3 md:py-2"
                    >
                      Next
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => handleExportClick('html')}
                    variant="outline"
                    className="flex-1 md:flex-none items-center gap-2 py-3 md:py-2"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden md:inline">Export HTML</span>
                    <span className="md:hidden">HTML</span>
                  </Button>
                  <Button
                    onClick={() => handleExportClick('png')}
                    variant="outline"
                    className="flex-1 md:flex-none items-center gap-2 py-3 md:py-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="hidden md:inline">Export PDF</span>
                    <span className="md:hidden">PDF</span>
                  </Button>
                </div>
              </div>

              <div 
                className="relative inline-block w-full"
                onMouseMove={handleDrag}
                onMouseUp={handleDragEnd}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="relative w-full bg-gray-50" style={{ minHeight: '400px' }}>
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative max-w-full max-h-[800px] flex items-center justify-center">
                      <img
                        ref={imageRef}
                        src={images[currentImageIndex]?.src}
                        alt={`Image ${currentImageIndex + 1}`}
                        className="w-auto h-auto object-contain max-w-full max-h-[800px]"
                        onDoubleClick={handleImageDoubleClick}
                        style={{ 
                          display: 'block',
                          margin: 'auto'
                        }}
                      />
                      
                      <div 
                        ref={annotationsRef}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                        onMouseMove={handleDrag}
                        onTouchMove={handleDrag}
                        onMouseUp={() => setDraggedAnnotation(null)}
                        onTouchEnd={() => setDraggedAnnotation(null)}
                      >
                        {currentAnnotations.map((annotation) => (
                          <div
                            key={annotation.id}
                            className="absolute"
                            style={{
                              left: `${annotation.x}%`,
                              top: `${annotation.y}%`,
                              transform: 'translate(-50%, -50%)',
                              cursor: draggedAnnotation?.id === annotation.id ? 'grabbing' : 'grab',
                              pointerEvents: 'auto',
                              zIndex: draggedAnnotation?.id === annotation.id ? 1000 : 1
                            }}
                          >
                            <button
                              onMouseDown={(e) => handleDragStart(annotation, e)}
                              onTouchStart={(e) => handleDragStart(annotation, e)}
                              onClick={(e) => !draggedAnnotation && toggleAnnotation(annotation, e)}
                              className={`w-8 h-8 md:w-6 md:h-6 rounded-full flex items-center justify-center ${
                                annotation.completed ? 'bg-green-500' : 'bg-blue-500'
                              } text-white hover:opacity-90 transition-opacity`}
                            >
                              {annotation.completed ? (
                                <Check className="w-5 h-5 md:w-4 md:h-4" />
                              ) : (
                                <AlertCircle className="w-5 h-5 md:w-4 md:h-4" />
                              )}
                            </button>

                            {selectedAnnotation?.id === annotation.id && (
                              <div
                                ref={popupRef}
                                className="absolute z-10 bg-white p-4 rounded-lg shadow-lg w-64 md:w-72"
                                style={{
                                  top: '130%',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  border: '1px solid #e5e7eb',
                                }}
                              >
                                <p className="mb-4 text-sm text-gray-700 break-words">{annotation.note}</p>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => toggleCompletion(annotation.id, e)}
                                    className="flex-1 h-9 text-sm"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    {annotation.completed ? 'Undo' : 'Complete'}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => deleteAnnotation(annotation.id, e)}
                                    className="flex-1 h-9 text-sm"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                {noteInput.visible && (
                  <>
                    <div 
                      className="fixed inset-0 bg-black/50 z-40"
                      onClick={() => {
                        setNoteInput({ visible: false, x: 0, y: 0 });
                        setNoteText('');
                      }}
                    />
                    <div
                      ref={noteInputRef}
                      style={noteInputStyles}
                    >
                      <div className="flex flex-col gap-3">
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
                          className="w-full px-4 py-3 border rounded-lg text-base"
                          autoFocus
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            className="py-3 px-4"
                            onClick={() => {
                              setNoteInput({ visible: false, x: 0, y: 0 });
                              setNoteText('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="button" 
                            size="lg"
                            className="py-3 px-4"
                            onClick={handleNoteSubmit}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
      <div className="mt-6 text-center border-t border-gray-200 pt-4">
  <p className="text-sm text-gray-500">
    Created by{" "}
    <a 
      href="https://www.linkedin.com/in/michael-bradford-arthur/" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-700 transition-colors"
    >
      Mikey B. Arthur
    </a>
  </p>
</div>
    </div>
  );
};

export default ImageAnnotator;