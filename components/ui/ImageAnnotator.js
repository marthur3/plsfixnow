import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, Check, X, FileImage, Clipboard, Download, HelpCircle, Image as ImageIcon, Plus, Copy, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Instructions from './Instructions';
import ExportDialog from './ExportDialog';
// Add jsPDF import
import { jsPDF } from 'jspdf';
import { Analytics } from '@vercel/analytics/react';
import { Share2 } from 'lucide-react';
import { PDF_CONSTANTS } from '@/constants/pdf';
import findOptimalPosition from '@/utils/position';



export default function ImageAnnotator() {
  // Image related state
  const [images, setImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scale, setScale] = useState(1);
  
  // Annotation related state
  const [annotations, setAnnotations] = useState([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // UI state
  const [showExportDialog, setShowExportDialog] = useState({ visible: false, type: null });
  const [showInstructions, setShowInstructions] = useState(false); // Changed from true to false
  const [canShare, setCanShare] = useState(false);

  const [noteInput, setNoteInput] = useState({ visible: false, x: 0, y: 0 });
  const [noteText, setNoteText] = useState('');
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [draggedAnnotation, setDraggedAnnotation] = useState(null);
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
  const [isMobile, setIsMobile] = useState(false);
  const [showFAB, setShowFAB] = useState(true);
  const lastScrollPosition = useRef(0);

  // Add new state for clipboard feedback
  const [clipboardFeedback, setClipboardFeedback] = useState(null);
  
  // Add loading state
  const [isExporting, setIsExporting] = useState(false);

  // Update canShare detection to check for files support
  const checkShareCapabilities = async () => {
    if (!navigator.share) return false;
    
    try {
      // Check file sharing support if available
      if (navigator.canShare) {
        const testFile = new File([""], "test.pdf", { type: "application/pdf" });
        return await navigator.canShare({ files: [testFile] });
      }
      
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    checkShareCapabilities().then(setCanShare);
  }, []);

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
      // Handle annotation popup clicks
      if (selectedAnnotation && 
          popupRef.current && 
          !popupRef.current.contains(event.target) &&
          !event.target.closest('.annotation')) {
        setSelectedAnnotation(null);
      }
      
      // Handle note input clicks
      if (noteInput.visible && 
          noteInputRef.current && 
          !noteInputRef.current.contains(event.target) &&
          !event.target.closest('#noteInput')) {
        setNoteInput({ visible: false, x: 0, y: 0 });
        setNoteText('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
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

  // Add useEffect for mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Handle FAB visibility on scroll
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowFAB(currentScroll <= lastScrollPosition.current || currentScroll < 100);
      lastScrollPosition.current = currentScroll;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Add useEffect for escape key handling
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (noteInput.visible) {
          setNoteInput({ visible: false, x: 0, y: 0 });
          setNoteText('');
        }
        if (selectedAnnotation) {
          setSelectedAnnotation(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [noteInput.visible, selectedAnnotation]);

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

  const handleTouchMove = (e) => {
    setTouchMoved(true);
    handleDrag(e);
  };

  const handleTouchEnd = (e) => {
    const touchDuration = Date.now() - touchStartTime;
    
    if (!touchMoved && touchDuration < 500) {
      // This was a tap, not a drag
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
    }
    
    handleDragEnd(e);
  };

  // Updated coordinate calculation helper
  // Update getRelativeCoordinates to store positions relative to natural image dimensions
const getRelativeCoordinates = (clientX, clientY) => {
  if (!imageRef.current || !annotationsRef.current) return { x: 0, y: 0 };
  
  const imageRect = imageRef.current.getBoundingClientRect();
  const naturalWidth = imageRef.current.naturalWidth;
  const naturalHeight = imageRef.current.naturalHeight;
  
  // Get position relative to the visible image
  const rect = annotationsRef.current.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  // Convert to coordinates relative to natural image dimensions
  const relativeX = (x / imageRect.width) * naturalWidth;
  const relativeY = (y / imageRect.height) * naturalHeight;
  
  return {
    x: Math.max(0, Math.min(naturalWidth, relativeX)),
    y: Math.max(0, Math.min(naturalHeight, relativeY))
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
    if (e?.preventDefault) e.preventDefault();
    
    if (!noteText.trim() || !images[currentImageIndex]) {
      setNoteInput({ visible: false, x: 0, y: 0 });
      setNoteText('');
      return;
    }
    
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

    setNoteInput({ visible: false, x: 0, y: 0 });
    setNoteText('');
  };

  // Update dragStart to include touch events
  const handleDragStart = (annotation, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMobile) {
      // On mobile, add a visual indicator that the annotation is being dragged
      e.target.style.opacity = '0.7';
      e.target.style.transform = 'scale(1.1)';
    }
    setDraggedAnnotation(annotation);
    setSelectedAnnotation(null);
  };

  // Update drag handler to support both mouse and touch
  const handleDrag = (e) => {
    if (!draggedAnnotation || !imageRef.current) return;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;

    // Add some delay for mobile to distinguish between tap and drag
    if (isMobile && !touchMoved) {
      return;
    }

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

  const handleDragEnd = (e) => {
    if (isMobile && e.target) {
      // Reset the visual indicators
      e.target.style.opacity = '1';
      e.target.style.transform = 'none';
    }
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
    e.preventDefault(); // Prevent default touch behavior
    e.stopPropagation(); // Stop event from bubbling up
    const currentImageId = images[currentImageIndex].id;
    setAnnotations(prev => ({
      ...prev,
      [currentImageId]: prev[currentImageId].map(ann =>
        ann.id === id ? { ...ann, completed: !ann.completed } : ann
      )
    }));
    setSelectedAnnotation(null); // Close popup after action
  };

// Modify the deleteAnnotation function:
const deleteAnnotation = (id, e) => {
  e.preventDefault(); // Prevent default touch behavior
  e.stopPropagation(); // Stop event from bubbling up
  const currentImageId = images[currentImageIndex].id;
  setAnnotations(prev => ({
    ...prev,
    [currentImageId]: prev[currentImageId].filter(ann => ann.id !== id)
  }));
  setSelectedAnnotation(null); // Close popup after action
};

  // Update generateExportableHtml to use absolute positioning
const generateExportableHtml = () => {
  const allPages = images.map((image, index) => {
    const imageAnnotations = annotations[image.id] || [];
    return `
      <div class="page-container ${index > 0 ? 'mt-8 pt-8 border-t' : ''}">
        <h2 class="text-lg mb-4">Page ${index + 1}</h2>
        <div class="image-container">
          <div class="image-wrapper">
            <img 
              src="${image.src}" 
              alt="Page ${index + 1}" 
              class="main-image"
              data-natural-width="${image.width}"
              data-natural-height="${image.height}"
            />
            <div class="annotations-layer">
              ${imageAnnotations.map(ann => {
                const xPercent = (ann.x / image.width) * 100;
                const yPercent = (ann.y / image.height) * 100;
                return `
                  <div class="annotation-wrapper">
                    <div class="annotation" style="left: ${xPercent}%; top: ${yPercent}%">
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
                `;
              }).join('')}
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
      <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
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
          width: fit-content;
          margin: 0 auto;
        }
        
        .main-image {
          display: block;
          max-width: 100%;
          height: auto;
          margin: 0 auto;
        }

        .annotations-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .annotation-wrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
        
        .annotation { 
          position: absolute;
          transform: translate(-50%, -50%);
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
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border: 1px solid #e5e7eb;
          width: 280px;
          z-index: 1000;
          transform: translateX(-50%);
          left: 50%;
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

        /* Add edge detection styles */
        .annotation:has(.popup[style*="display: block"]) {
          z-index: 1001;
        }

        /* Left edge */
        .annotation[style*="left: 25%"] .popup,
        .annotation[style*="left: 20%"] .popup,
        .annotation[style*="left: 15%"] .popup,
        .annotation[style*="left: 10%"] .popup,
        .annotation[style*="left: 5%"] .popup {
          left: 0;
          transform: translateX(0);
        }

        /* Right edge */
        .annotation[style*="left: 75%"] .popup,
        .annotation[style*="left: 80%"] .popup,
        .annotation[style*="left: 85%"] .popup,
        .annotation[style*="left: 90%"] .popup,
        .annotation[style*="left: 95%"] .popup {
          right: 0;
          left: auto;
          transform: translateX(0);
        }

        /* Top edge */
        .annotation[style*="top: 25%"] .popup,
        .annotation[style*="top: 20%"] .popup,
        .annotation[style*="top: 15%"] .popup,
        .annotation[style*="top: 10%"] .popup,
        .annotation[style*="top: 5%"] .popup {
          top: 100%;
          bottom: auto;
          margin-top: 10px;
        }

        /* Bottom edge */
        .annotation[style*="top: 75%"] .popup,
        .annotation[style*="top: 80%"] .popup,
        .annotation[style*="top: 85%"] .popup,
        .annotation[style*="top: 90%"] .popup,
        .annotation[style*="top: 95%"] .popup {
          bottom: 100%;
          top: auto;
          margin-bottom: 10px;
        }

        /* Default center positioning */
        .annotation .popup {
          left: 50%;
          transform: translateX(-50%);
          top: 100%;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
    <div class="container">
      ${allPages}
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
  const format = e.target.format?.value;
  
  setIsExporting(true);
  try {
    switch (format) {
      case 'pdf':
        const pdfBlob = await generatePDF();
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${e.target.filename.value}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
      
      case 'png':
        await handleExportImage();
        break;
      
      case 'html':
        const html = generateExportableHtml();
        const htmlBlob = new Blob([html], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlLink = document.createElement('a');
        htmlLink.href = htmlUrl;
        htmlLink.download = `${e.target.filename.value}.html`;
        document.body.appendChild(htmlLink);
        htmlLink.click();
        document.body.removeChild(htmlLink);
        URL.revokeObjectURL(htmlUrl);
        break;
      
      case 'clipboard':
        await handleCopyImage();
        break;
    }
    setShowExportDialog({ visible: false, type: null });
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
  } finally {
    setIsExporting(false);
  }
};

// The PNG export is only exporting one page even though images.length > 1
// Need to fix handleExportPNG to properly handle multiple pages while keeping existing styling
// Current issue: container.innerHTML = '' might be clearing too early
// Requirements:
// 1. Keep all existing styling and marker/note positioning
// 2. Fix the loop to properly export all pages
// 3. Maintain current quality settings (scale: 2, backgroundColor: 'white')


// Add generatePDF function before handleExportPNG
// Optimized PDF generation function with improved icon and text handling
// Updated PDF generation with proper coordinate handling and multi-page support
const generatePDF = async () => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const maxWidth = pageWidth - (margin * 2);

    // Set default font settings
    pdf.setFont('helvetica');
    pdf.setFontSize(10);

    for (let i = 0; i < images.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      // Load and measure the image
      const img = await loadImage(images[i].src);
      const imageRatio = img.width / img.height;
      
      // Reserve space for annotations (roughly 40% of page height)
      const maxImageHeight = pageHeight * 0.6;
      
      // Calculate image dimensions to fit in the upper 60% of the page
      let imageWidth = maxWidth;
      let imageHeight = imageWidth / imageRatio;
      
      if (imageHeight > maxImageHeight) {
        imageHeight = maxImageHeight;
        imageWidth = imageHeight * imageRatio;
      }
      
      // Center image horizontally
      const imageX = margin + (maxWidth - imageWidth) / 2;
      const imageY = margin;

      // Draw image
      pdf.addImage(
        img,
        'PNG',
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        undefined,
        'FAST'
      );

      // Get annotations for this image
      const imageAnnotations = annotations[images[i].id] || [];
      
      // Draw markers on image
      imageAnnotations.forEach((annotation, index) => {
        const x = imageX + (annotation.x / img.width * imageWidth);
        const y = imageY + (annotation.y / img.height * imageHeight);

        // Draw marker circle
        pdf.setFillColor(annotation.completed ? '#22c55e' : '#3b82f6');
        pdf.circle(x, y, 8, 'F');

        // Draw number in circle
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        const text = String(index + 1);
        const textWidth = pdf.getStringUnitWidth(text) * pdf.getFontSize() / pdf.internal.scaleFactor;
        pdf.text(text, x - (textWidth/2), y + 3);
      });

      // Start annotations list below image
      let currentY = imageY + imageHeight + margin;

      // Add "Annotations" heading
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Annotations', margin, currentY);
      currentY += 25;

      // Draw annotation list
      imageAnnotations.forEach((annotation, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - margin * 2) {
          pdf.addPage();
          currentY = margin;
        }

        // Draw numbered circle
        const circleX = margin + 10;
        const circleY = currentY + 10;
        
        pdf.setFillColor(annotation.completed ? '#22c55e' : '#3b82f6');
        pdf.circle(circleX, circleY, 10, 'F');
        
        // Draw number
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        const numberText = String(index + 1);
        const numberWidth = pdf.getStringUnitWidth(numberText) * pdf.getFontSize() / pdf.internal.scaleFactor;
        pdf.text(numberText, circleX - (numberWidth/2), circleY + 3);

        // Draw annotation text
        const textX = margin + 30;
        const textMaxWidth = maxWidth - 40;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        
        // Split text into lines
        const textLines = pdf.splitTextToSize(annotation.note, textMaxWidth);
        const lineHeight = 15;
        const textHeight = textLines.length * lineHeight;
        const padding = 8;

        // Draw text background
        pdf.setFillColor(245, 247, 250);
        pdf.setDrawColor(annotation.completed ? '#22c55e' : '#3b82f6');
        pdf.roundedRect(
          textX - padding,
          currentY,
          textMaxWidth + padding * 2,
          textHeight + padding * 2,
          3,
          3,
          'FD'
        );

        // Draw text
        pdf.setTextColor(0, 0, 0);
        textLines.forEach((line, lineIndex) => {
          pdf.text(line, textX, currentY + lineHeight * (lineIndex + 1));
        });

        currentY += textHeight + padding * 2 + margin/2;
      });
    }

    return pdf.output('blob');
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
};

// Helper function to draw annotations on the image
const drawAnnotations = async (pdf, annotations, dimensions) => {
  const {
    imageX,
    imageY,
    imageWidth,
    imageHeight,
    naturalWidth,
    naturalHeight
  } = dimensions;

  annotations.forEach((annotation, index) => {
    // Convert natural coordinates to PDF coordinates
    const x = imageX + (annotation.x / naturalWidth * imageWidth);
    const y = imageY + (annotation.y / naturalHeight * imageHeight);

    // Draw marker circle
    pdf.setFillColor(annotation.completed ? '#22c55e' : '#3b82f6');
    pdf.circle(x, y, 12, 'F');

    // Draw number
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    
    // Center the number in the circle
    const text = String(index + 1);
    const textWidth = pdf.getStringUnitWidth(text) * pdf.getFontSize() / pdf.internal.scaleFactor;
    const textX = x - (textWidth / 2);
    const textY = y + 4; // Adjust for vertical centering

    pdf.text(text, textX, textY);
  });
};

// Helper function to draw the annotation list
const drawAnnotationList = async (pdf, annotations, dimensions) => {
  const { imageHeight, pageWidth, pageHeight, margin } = dimensions;
  
  // Start position for annotation list
  let currentY = imageHeight + margin * 2;
  
  // Add "Annotations" heading
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Annotations', margin, currentY);
  currentY += 30;

  const maxWidth = pageWidth - margin * 3;
  
  for (let i = 0; i < annotations.length; i++) {
    const annotation = annotations[i];
    
    // Check if we need a new page
    if (currentY > pageHeight - margin * 2) {
      pdf.addPage();
      currentY = margin;
    }

    // Draw annotation number circle
    const circleX = margin + 10;
    const circleY = currentY + 10;
    
    pdf.setFillColor(annotation.completed ? '#22c55e' : '#3b82f6');
    pdf.circle(circleX, circleY, 10, 'F');
    
    // Draw number in circle
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    const numberText = String(i + 1);
    const numberWidth = pdf.getStringUnitWidth(numberText) * pdf.getFontSize() / pdf.internal.scaleFactor;
    pdf.text(numberText, circleX - (numberWidth / 2), circleY + 3);

    // Draw annotation text
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    const textX = margin + 30;
    
    // Split text into lines that fit within maxWidth
    const textLines = pdf.splitTextToSize(annotation.note, maxWidth - 40);
    
    // Draw background for text
    const lineHeight = 15;
    const textHeight = textLines.length * lineHeight;
    const padding = 10;
    
    pdf.setFillColor(245, 247, 250);
    pdf.setDrawColor(annotation.completed ? '#22c55e' : '#3b82f6');
    pdf.roundedRect(
      textX - padding,
      currentY - padding,
      maxWidth - 20,
      textHeight + padding * 2,
      3,
      3,
      'FD'
    );

    // Draw text lines
    pdf.setTextColor(0, 0, 0);
    textLines.forEach((line, lineIndex) => {
      pdf.text(line, textX, currentY + lineIndex * lineHeight);
    });

    currentY += textHeight + margin;
  }
};

// Helper function to load images
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};


// Fix: Add proper function declaration
const drawNumberedAnnotations = async (pdf, annotations, dimensions, pageIndex) => {
  const { imageX, imageY, imageWidth, pageWidth, pageHeight, margin } = dimensions;
  const currentImage = images[pageIndex];
  
  // Calculate max image height to leave room for annotations
  const maxImageHeight = pageHeight * PDF_CONSTANTS.MAX_IMAGE_HEIGHT_RATIO;
  const imageHeight = Math.min(dimensions.imageHeight, maxImageHeight);
  
  // Draw markers on image
  annotations.forEach((annotation, index) => {
    const x = Number(imageX + (annotation.x / currentImage.width * imageWidth));
    const y = Number(imageY + (annotation.y / currentImage.height * imageHeight));
    
    if (isNaN(x) || isNaN(y)) return;

    // Draw marker circle with number
    pdf.setFillColor(annotation.completed ? '#22c55e' : '#3b82f6');
    pdf.circle(x, y, 12, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    const markerText = String(index + 1);
    const markerWidth = pdf.getStringUnitWidth(markerText) * pdf.getFontSize() / pdf.internal.scaleFactor;
    // Fix: Use proper text positioning
    pdf.text(markerText, x - (markerWidth/2), y + 3, { align: 'left' });
  });

  // Start annotations list with explicit number conversion
  let currentY = Number(imageY + imageHeight + PDF_CONSTANTS.ANNOTATION_START_OFFSET);
  
  // Add "Annotations" heading with fixed coordinate handling
  pdf.setFontSize(PDF_CONSTANTS.ANNOTATION_HEADING_SIZE);
  pdf.setTextColor(0, 0, 0);
  
  // Fix: Use proper text formatting
  pdf.text('Annotations', Number(margin), Number(currentY), { align: 'left' });
  
  currentY += PDF_CONSTANTS.ANNOTATION_HEADING_MARGIN;

  // Draw annotation list
  for (let i = 0; i < annotations.length; i++) {
    const annotation = annotations[i];
    
    // Check if we need a new page
    if (currentY > pageHeight - PDF_CONSTANTS.PAGE_BOTTOM_MARGIN) {
      pdf.addPage();
      currentY = Number(margin + PDF_CONSTANTS.ANNOTATION_START_OFFSET);
    }

    const CIRCLE_SIZE = 16;
    const circleX = Number(margin + CIRCLE_SIZE/2);
    const circleY = Number(currentY + CIRCLE_SIZE/2);
    
    // Draw number circle
    pdf.setFillColor(annotation.completed ? '#22c55e' : '#3b82f6');
    pdf.circle(circleX, circleY, CIRCLE_SIZE/2, 'F');
    
    // Draw number
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    const numberText = String(i + 1);
    const numberWidth = pdf.getStringUnitWidth(numberText) * pdf.getFontSize() / pdf.internal.scaleFactor;
    // Fix: Use proper text positioning
    pdf.text(numberText, circleX - (numberWidth/2), circleY + 3, { align: 'left' });

    // Draw annotation text
    const TEXT_MARGIN = 25;
    const textX = Number(margin + TEXT_MARGIN);
    const maxWidth = Number(pageWidth - margin * 3 - TEXT_MARGIN);
    
    pdf.setFillColor(245, 247, 250);
    pdf.setDrawColor(annotation.completed ? '#22c55e' : '#3b82f6');
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    
    const textLines = pdf.splitTextToSize(String(annotation.note), maxWidth);
    const textHeight = textLines.length * PDF_CONSTANTS.ANNOTATION_LINE_HEIGHT;
    const padding = 6;
    
    pdf.roundedRect(
      Number(textX - padding),
      Number(currentY - padding),
      Number(maxWidth + padding * 2),
      Number(textHeight + padding * 2),
      3,
      3,
      'FD'
    );

    // Fix: Use proper text positioning for each line
    textLines.forEach((line, lineIndex) => {
      const lineY = Number(currentY + (lineIndex * PDF_CONSTANTS.ANNOTATION_LINE_HEIGHT) + 8);
      pdf.text(String(line), Number(textX), lineY, { align: 'left' });
    });

    currentY = Number(currentY + textHeight + PDF_CONSTANTS.ROW_HEIGHT);
  }
};

// Add utility functions for line calculations
const calculateIntersectionPoint = (boxRect, markerX, markerY) => {
  const centerX = boxRect.left + boxRect.width / 2;
  const centerY = boxRect.top + boxRect.height / 2;
  
  // Calculate angle between centers
  const angle = Math.atan2(centerY - markerY, centerX - markerX);
  
  // Box dimensions
  const w = boxRect.width / 2;
  const h = boxRect.height / 2;
  
  // Calculate intersection point
  let x, y;
  const absAngle = Math.abs(angle);
  
  if (absAngle < Math.atan2(h, w)) {
    // Intersects with left/right side
    x = w * Math.sign(Math.cos(angle));
    y = w * Math.tan(angle);
  } else {
    // Intersects with top/bottom side
    x = h / Math.tan(absAngle) * Math.sign(Math.cos(angle));
    y = h * Math.sign(Math.sin(absAngle));
  }
  
  return {
    x: centerX + x,
    y: centerY + y
  };
};

// Update the generatePDF function with improved line handling


const currentAnnotations = images[currentImageIndex]
    ? annotations[images[currentImageIndex].id] || []
    : [];

  // Add FAB click handler
  const handleFABClick = (e) => {
    if (!imageRef.current) return;
    
    // Calculate center position of visible image
    const rect = imageRef.current.getBoundingClientRect();
    const clientX = rect.left + rect.width / 2;
    const clientY = rect.top + rect.height / 2;
    
    const { x, y } = getRelativeCoordinates(clientX, clientY);
    
    setNoteInput({
      visible: true,
      x,
      y
    });
  };

  // Add share handler
  const handleShare = async (format = 'pdf') => {
    try {
      let shareData = {
        title: 'PLSFIX Annotations',
        text: 'Check out my annotations!',
        url: window.location.href
      };

      if (format === 'pdf') {
        const blob = await generatePDF();
        const file = new File([blob], 'annotations.pdf', { type: 'application/pdf' });
        
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          shareData.files = [file];
        } else {
          // Fallback to downloading the file if sharing not supported
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'annotations.pdf';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setClipboardFeedback('Downloaded PDF (sharing not supported)');
          setTimeout(() => setClipboardFeedback(null), 2000);
          return;
        }
      } else if (format === 'html') {
        const html = generateExportableHtml();
        // Create a temporary URL for the HTML content
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        shareData.url = url;
      }

      if (navigator.share) {
        await navigator.share(shareData);
        setClipboardFeedback('Shared successfully!');
      } else {
        // Fallback for browsers without Web Share API
        await navigator.clipboard.writeText(shareData.url);
        setClipboardFeedback('Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
        setClipboardFeedback('Share failed - ' + error.message);
      }
    } finally {
      setTimeout(() => setClipboardFeedback(null), 2000);
      setShowExportDialog({ visible: false, type: null });
    }
  };
  
  const exportImage = async () => {
    // Export each image as a separate PNG file
    for (let i = 0; i < images.length; i++) {
      const currentId = images[i].id;
      const imageAnnotations = annotations[currentId] || [];
      
      const canvas = await generateAnnotatedImage(i, imageAnnotations);
      if (!canvas) continue;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) continue;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // If multiple images, add page number to filename
      const filename = images.length > 1 
        ? `annotations-page-${i + 1}.png`
        : 'annotations.png';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Add deleteImage handler
  const handleDeleteImage = () => {
    if (images.length === 0) return;
    
    if (window.confirm('Are you sure you want to delete this image?')) {
      const newImages = images.filter((_, index) => index !== currentImageIndex);
      const currentId = images[currentImageIndex].id;
      
      // Remove annotations for the deleted image
      const newAnnotations = { ...annotations };
      delete newAnnotations[currentId];
      
      setImages(newImages);
      setAnnotations(newAnnotations);
      
      // Adjust current index if necessary
      if (currentImageIndex >= newImages.length) {
        setCurrentImageIndex(Math.max(0, newImages.length - 1));
      }
    }
  };

  // Update the backdrop click handler
  const handleBackdropClick = (e) => {
    // Only close if clicking the backdrop itself, not its children
    if (e.target === e.currentTarget) {
      setNoteInput({ visible: false, x: 0, y: 0 });
      setNoteText('');
    }
  };

  // Update toolbar buttons - remove copy button
const exportButtons = (
  <div className="flex items-center justify-end gap-2">
    {canShare && (
      <Button
        onClick={() => setShowExportDialog({ visible: true, type: 'share' })}
        variant="outline"
        className="flex-1 md:flex-none items-center gap-2 py-3 md:py-2"
      >
        <Share2 className="w-4 h-4" />
        <span className="hidden md:inline">Share</span>
        <span className="md:hidden">Share</span>
      </Button>
    )}
    <Button
      onClick={() => handleExportClick('export')}
      variant="outline"
      className="flex-1 md:flex-none items-center gap-2 py-3 md:py-2"
    >
      <Download className="w-4 h-4" />
      <span className="hidden md:inline">Export</span>
      <span className="md:hidden">Export</span>
    </Button>
    {images.length > 0 && (
      <Button
        onClick={handleDeleteImage}
        variant="outline"
        className="flex-1 md:flex-none items-center gap-2 py-3 md:py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
        <span className="hidden md:inline">Delete</span>
        <span className="md:hidden">Delete</span>
      </Button>
    )}
  </div>
);

  // Add this new function to calculate popup position
  const calculatePopupPosition = (annotationPosition) => {
    if (!imageRef.current || !popupRef.current) return {};
    
    const imageRect = imageRef.current.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || imageRect;
    
    const yPercent = (annotationPosition.y / (imageRef.current.naturalHeight || 1)) * 100;
    const xPercent = (annotationPosition.x / (imageRef.current.naturalWidth || 1)) * 100;
    
    // Calculate if popup would be cut off
    const isNearTop = yPercent < 25;
    const isNearBottom = yPercent > 75;
    const isNearLeft = xPercent < 25;
    const isNearRight = xPercent > 75;
    
    let position = {
      transform: 'translateX(-50%)',
      left: '50%'
    };

    // Vertical positioning
    if (isNearTop) {
      position.top = '130%';
      position.bottom = 'auto';
    } else if (isNearBottom) {
      position.bottom = '130%';
      position.top = 'auto';
    } else {
      position.top = '130%';
      position.bottom = 'auto';
    }

    // Horizontal positioning
    if (isNearLeft) {
      position.transform = 'translateX(0)';
      position.left = '0';
    } else if (isNearRight) {
      position.transform = 'translateX(-100%)';
      position.left = '100%';
    }

    return position;
  };

  // Update the annotation render section to use new positioning
  const renderAnnotation = (annotation) => {
    const imageWidth = imageRef.current?.naturalWidth || 0;
    const imageHeight = imageRef.current?.naturalHeight || 0;
    
    const xPercent = (annotation.x / imageWidth) * 100;
    const yPercent = (annotation.y / imageHeight) * 100;
    const popupPosition = calculatePopupPosition(annotation);
    
    return (
      <div
        key={annotation.id}
        className="absolute"
        style={{
          left: `${xPercent}%`,
          top: `${yPercent}%`,
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'auto',
          zIndex: selectedAnnotation?.id === annotation.id ? 1000 : 1
        }}
      >
        {/* Add line container */}
        {selectedAnnotation?.id === annotation.id && (
          <div
            className="absolute w-0.5 bg-blue-500"
            style={{
              height: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              ...(popupPosition.top === 'auto' ? {
                bottom: '100%',
                backgroundColor: annotation.completed ? '#22c55e' : '#3b82f6'
              } : {
                top: '100%',
                backgroundColor: annotation.completed ? '#22c55e' : '#3b82f6'
              })
            }}
          />
        )}

        <button
          onMouseDown={(e) => handleDragStart(annotation, e)}
          onTouchStart={(e) => handleDragStart(annotation, e)}
          onClick={(e) => !draggedAnnotation && toggleAnnotation(annotation, e)}
          className={`
            relative w-8 h-8 md:w-6 md:h-6 rounded-full 
            flex items-center justify-center 
            ${annotation.completed ? 'bg-green-500' : 'bg-blue-500'}
            text-white hover:opacity-90 transition-opacity
            touch-manipulation select-none
            ${draggedAnnotation?.id === annotation.id ? 'scale-110 opacity-70' : ''}
          `}
          style={{
            touchAction: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          {annotation.completed ? (
            <Check className="w-4 h-4 md:w-3.5 md:h-3.5" />
          ) : (
            <AlertCircle className="w-4 h-4 md:w-3.5 md:h-3.5" />
          )}
        </button>

        {selectedAnnotation?.id === annotation.id && (
          <div
            ref={popupRef}
            className="absolute z-10 bg-white p-4 rounded-lg shadow-lg w-64 md:w-72"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              border: '1px solid #e5e7eb',
              ...popupPosition
            }}
          >
            {/* ...existing popup content... */}
            <p className="mb-4 text-sm text-gray-700 break-words">{annotation.note}</p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleCompletion(annotation.id)}
                className="flex-1 h-9 text-sm"
              >
                {annotation.completed ? (
                  <>
                    <X className="w-4 h-4 mr-1" />
                    Undo
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Complete
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => deleteAnnotation(annotation.id, e)}
                className="flex-1 h-9 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Add this helper function
  const calculateTextSize = (imageWidth) => {
    const baseWidth = 1200; // Increased base width to make text relatively smaller
    const baseTextSize = 24; // Reduced from 28
    const minTextSize = 18; // Reduced from 24
    const scaleFactor = Math.max(0.8, imageWidth / baseWidth); // Reduced minimum scale factor
    
    return Math.max(minTextSize, Math.round(baseTextSize * scaleFactor));
  };

  const generateAnnotatedImage = async (pageIndex) => {
    const image = images[pageIndex];
    if (!image) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const img = await loadImage(image.src);
    const imageAnnotations = annotations[image.id] || [];

    // Use same scaling logic as before
    const baseWidth = 1200;
    const baseTextSize = 24;
    const minTextSize = 18;
    const scaleFactor = Math.max(0.8, img.naturalWidth / baseWidth);
    
    const textSize = Math.max(minTextSize, Math.round(baseTextSize * scaleFactor));
    const margin = Math.max(60, Math.round(img.naturalWidth * 0.05));
    const iconSize = Math.max(32, Math.round(textSize * 1.5));
    const lineHeight = Math.round(textSize * 1.5);
    const padding = Math.max(6, Math.round(textSize * 0.2)); // Add padding definition
    
    canvas.width = img.naturalWidth + (margin * 2);
    canvas.height = img.naturalHeight + (margin * 4) + 
                   (imageAnnotations.length * lineHeight * 2);

    // Draw page content
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add page number if multiple pages
    if (images.length > 1) {
      ctx.font = `bold ${textSize}px Arial`;
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.fillText(`Page ${pageIndex + 1}`, margin, margin - 10);
    }

    // Draw single page content
    const imageX = margin;
    const imageY = margin;
    ctx.drawImage(img, imageX, imageY);

    // Draw markers on image
    imageAnnotations.forEach((annotation, index) => {
      const x = imageX + annotation.x;
      const y = imageY + annotation.y;

      ctx.beginPath();
      ctx.arc(x, y, iconSize/2, 0, 2 * Math.PI);
      ctx.fillStyle = annotation.completed ? '#22c55e' : '#3b82f6';
      ctx.fill();

      ctx.fillStyle = 'white';
      ctx.font = `bold ${textSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), x, y);
    });

    let currentY = imageY + img.naturalHeight + margin;

    // Draw "Annotations" heading
    ctx.font = `bold ${textSize * 1.2}px Arial`; // Slightly larger for heading
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'left';
    ctx.fillText('Annotations', margin, currentY);
    currentY += lineHeight;

    // Draw annotation list
    imageAnnotations.forEach((annotation, index) => {
      const circleX = margin + iconSize/2;
      const circleY = currentY + iconSize/2;
      
      ctx.beginPath();
      ctx.arc(circleX, circleY, iconSize/2, 0, 2 * Math.PI);
      ctx.fillStyle = annotation.completed ? '#22c55e' : '#3b82f6';
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = `bold ${textSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((index + 1).toString(), circleX, circleY);

      const textX = margin + iconSize + margin/2;
      const textMaxWidth = canvas.width - (margin * 3) - iconSize;
      
      ctx.font = `${textSize}px Arial`;
      
      // Text wrapping
      const words = annotation.note.split(' ');
      let line = '';
      let lines = [];
      
      for (let word of words) {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > textMaxWidth - padding * 2) {
          lines.push(line);
          line = word + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      
      const textHeight = lines.length * lineHeight;
      
      ctx.fillStyle = '#f5f7fa';
      ctx.strokeStyle = annotation.completed ? '#22c55e' : '#3b82f6';
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.roundRect(
        textX - padding,
        currentY - padding,
        textMaxWidth + padding * 2,
        textHeight + padding * 2,
        3
      );
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      lines.forEach((line, lineIndex) => {
        ctx.fillText(
          line.trim(),
          textX,
          currentY + (lineIndex * lineHeight) + lineHeight/2
        );
      });

      currentY += textHeight + lineHeight;
    });

    return canvas;
  };

  const handleExportImage = async () => {
    // Export each image as a separate PNG file
    for (let i = 0; i < images.length; i++) {
      const currentId = images[i].id;
      const imageAnnotations = annotations[currentId] || [];
      
      const canvas = await generateAnnotatedImage(i, imageAnnotations);
      if (!canvas) continue;

      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) continue;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // If multiple images, add page number to filename
      const filename = images.length > 1 
        ? `annotations-page-${i + 1}.png`
        : 'annotations.png';
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyImage = async () => {
    if (images.length > 1) {
      setClipboardFeedback('Note: Only copying current page. Use Export for all pages.');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const canvas = await generateAnnotatedImage(currentImageIndex);
    if (!canvas) return;

    try {
      const blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/png', 1.0);
      });
      
      if (!blob) throw new Error('Failed to create image blob');

      const clipboardItem = new ClipboardItem({
        [blob.type]: blob
      });

      await navigator.clipboard.write([clipboardItem]);
      setClipboardFeedback('Image copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
    } finally {
      setTimeout(() => setClipboardFeedback(null), 2000);
    }
  };

  return (
    <div className="relative">
      <Analytics />
      {showExportDialog.visible && (
        <ExportDialog
          onSubmit={handleExportSubmit}
          onClose={() => setShowExportDialog({ visible: false, type: null })}
          defaultName={`annotation-${currentImageIndex + 1}`}
          onShare={handleShare}
          canShare={canShare}
          type={showExportDialog.type}
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
                  {exportButtons}
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
                        {currentAnnotations.map(renderAnnotation)}

                      </div>
                    </div>
                  </div>
                </div>
                
                {noteInput.visible && (
                  <>
                    <div 
                      className="fixed inset-0 bg-black/50 z-40"
                      onClick={handleBackdropClick}
                    />
                    <div
                      ref={noteInputRef}
                      className={`
                        fixed left-1/2 bottom-4 -translate-x-1/2 w-[calc(100%-2rem)] 
                        max-w-md bg-white rounded-lg shadow-lg p-4 z-50
                        transform transition-all duration-200 ease-out
                        ${noteInput.visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
                      `}
                    >
                      <form onSubmit={handleNoteSubmit} className="flex flex-col gap-3">
                        <input
                          id="noteInput"
                          type="text"
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a note... (press Enter to save)"
                          className="w-full px-4 py-3 border rounded-lg text-base"
                          autoFocus
                        />
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              setNoteInput({ visible: false, x: 0, y: 0 });
                              setNoteText('');
                            }}
                            className="text-gray-500"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </Card>
      {/* Add Floating Action Button for mobile */}
      {isMobile && images.length > 0 && (
        <div 
          className={`fixed bottom-6 right-6 transition-all duration-300 transform ${
            showFAB ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
          }`}
        >
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={handleFABClick}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
      {/* Add clipboard feedback toast */}
      {clipboardFeedback && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg">
          {clipboardFeedback}
        </div>
      )}
    </div>
  );
};

export { ImageAnnotator };