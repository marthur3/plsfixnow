import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, Check, X, FileImage, Clipboard, Download, HelpCircle, Image as ImageIcon, Plus, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Instructions from './Instructions';
import html2canvas from 'html2canvas';
import ExportDialog from './ExportDialog';
// Add jsPDF import
import { jsPDF } from 'jspdf';
import { Analytics } from '@vercel/analytics/react';
import { Share2 } from 'lucide-react';



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
  const [isMobile, setIsMobile] = useState(false);
  const [showFAB, setShowFAB] = useState(true);
  const lastScrollPosition = useRef(0);

  // Add new state for clipboard feedback
  const [clipboardFeedback, setClipboardFeedback] = useState(null);

  // Add canShare detection
  const [canShare, setCanShare] = useState(false);
  
  // Update canShare detection to check for files support
  const checkShareCapabilities = async () => {
    if (!navigator.share) return false;
    
    try {
      // Check basic share support
      await navigator.share({ title: 'test' }).catch(() => {});
      
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
            href="https://www.github.com/michaelarthur" 
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
  const format = e.target.format.value;
  
  try {
    if (format === 'html') {
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
    } else if (format === 'pdf') {
      await handleExportPNG(filename);
    }
    
    setShowExportDialog({ visible: false });
  } catch (error) {
    console.error('Export failed:', error);
    alert('Export failed. Please try again.');
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
const generatePDF = async () => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4'
    });

    const PAGE_MARGIN = 60; // Increased from 40
    const ICON_SIZE = 32; // Increased from 24
    const BOX_PADDING = 24; // Added padding for note boxes
    const MIN_EDGE_DISTANCE = 100; // Minimum distance from edges
    
    // Set default font size larger
    pdf.setFontSize(14); // Increased base font size

    for (let i = 0; i < images.length; i++) {
      const container = document.createElement('div');
      container.style.cssText = `
        position: fixed;
        left: -9999px;
        width: 1200px;
        background: white;
        padding: ${PAGE_MARGIN}px;
      `;
      document.body.appendChild(container);

      const imageContainer = document.createElement('div');
      imageContainer.style.cssText = 'position: relative; width: fit-content; margin: 0 auto;';

      // Add the image
      const img = new Image();
      img.src = images[i].src;
      await new Promise(resolve => { img.onload = resolve; });
      imageContainer.appendChild(img);

      // Create SVG layer for lines with proper viewBox
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        overflow: visible;
      `;
      
      // Set viewBox to match image dimensions
      svg.setAttribute('viewBox', `0 0 ${img.naturalWidth} ${img.naturalHeight}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      
      // Add debug outline to see SVG boundaries
      const debugRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      debugRect.setAttribute('width', '100%');
      debugRect.setAttribute('height', '100%');
      debugRect.setAttribute('fill', 'none');
      debugRect.setAttribute('stroke', 'red');
      debugRect.setAttribute('stroke-width', '1');
      svg.appendChild(debugRect);
      
      imageContainer.appendChild(svg);
      console.log('SVG created with viewBox:', `0 0 ${img.naturalWidth} ${img.naturalHeight}`);

      // Process annotations
      const imageAnnotations = annotations[images[i].id] || [];
      const sortedAnnotations = [...imageAnnotations].sort((a, b) => a.y - b.y);

      sortedAnnotations.forEach((annotation, index) => {
        const imageWidth = img.naturalWidth;
        const imageHeight = img.naturalHeight;
        const xPercent = (annotation.x / imageWidth) * 100;
        const yPercent = (annotation.y / imageHeight) * 100;

        // Enhanced offset calculation based on text length and index
        const BASE_OFFSET = 280; // Increased from 240
        const VERTICAL_SPACING = 140; // Increased from 120
        const TEXT_LENGTH_THRESHOLD = 50;
        
        // Calculate additional offset based on text length
        const textLength = annotation.note.length;
        const lengthMultiplier = textLength > TEXT_LENGTH_THRESHOLD ? 1.5 : 1;
        
        // Calculate base offset direction based on quadrant
        let offsetX = annotation.x > (imageWidth / 2) ? -BASE_OFFSET : BASE_OFFSET;
        let offsetY = 0;
        
        // Distribute positions in a wider pattern for longer text
        switch (index % 8) { // Increased positions from 6 to 8
          case 0: // Far right
            offsetX = Math.abs(offsetX) * lengthMultiplier;
            offsetY = -VERTICAL_SPACING;
            break;
          case 1: // Far left
            offsetX = -Math.abs(offsetX) * lengthMultiplier;
            offsetY = VERTICAL_SPACING;
            break;
          case 2: // Mid right high
            offsetX = Math.abs(offsetX) * 0.7 * lengthMultiplier;
            offsetY = -VERTICAL_SPACING * 2;
            break;
          case 3: // Mid left high
            offsetX = -Math.abs(offsetX) * 0.7 * lengthMultiplier;
            offsetY = -VERTICAL_SPACING * 1.5;
            break;
          case 4: // Mid right low
            offsetX = Math.abs(offsetX) * 0.7 * lengthMultiplier;
            offsetY = VERTICAL_SPACING * 1.5;
            break;
          case 5: // Mid left low
            offsetX = -Math.abs(offsetX) * 0.7 * lengthMultiplier;
            offsetY = VERTICAL_SPACING * 2;
            break;
          case 6: // Near right
            offsetX = Math.abs(offsetX) * 0.4 * lengthMultiplier;
            offsetY = 0;
            break;
          case 7: // Near left
            offsetX = -Math.abs(offsetX) * 0.4 * lengthMultiplier;
            offsetY = 0;
            break;
        }
        
        const noteX = annotation.x + offsetX;
        const noteY = annotation.y + offsetY;
        
        const noteXPercent = (noteX / imageWidth) * 100;
        const noteYPercent = (noteY / imageHeight) * 100;

        // Debug line creation
        console.log('Creating line with coordinates:', {
          x1: annotation.x,
          y1: annotation.y,
          x2: noteX,
          y2: noteY
        });

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', annotation.x);
        line.setAttribute('y1', annotation.y);
        line.setAttribute('x2', noteX);
        line.setAttribute('y2', noteY);
        line.setAttribute('stroke', annotation.completed ? '#22c55e' : '#3b82f6');
        line.setAttribute('stroke-width', '5'); // Increased line width
        line.setAttribute('opacity', '0.9'); // Slightly increased opacity
        svg.appendChild(line);
        
        console.log('Line created and appended');

        // Create icon
        const icon = document.createElement('div');
        icon.style.cssText = `
          position: absolute;
          left: ${xPercent}%;
          top: ${yPercent}%;
          width: ${ICON_SIZE}px;
          height: ${ICON_SIZE}px;
          transform: translate(-50%, -50%) scale(0.75);
          background: ${annotation.completed ? '#22c55e' : '#3b82f6'};
          border-radius: 50%;
          border: 3px solid white; // Thicker border
          box-shadow: 0 4px 6px rgba(0,0,0,0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 20px; // Increased font size
          z-index: 2;
          pointer-events: none;
          -webkit-font-smoothing: antialiased;
        `;
        icon.innerHTML = annotation.completed ? '✓' : '!';

        // Create note box
        // Create note box with improved text handling
        const noteBox = document.createElement('div');
        noteBox.style.cssText = `
          position: absolute;
          left: ${noteXPercent}%;
          top: ${noteYPercent}%;
          transform: translate(-50%, -50%);
          background: white;
          padding: 16px; // Increased padding
          border-radius: 8px;
          border: 2px solid ${annotation.completed ? '#22c55e' : '#3b82f6'}; // Thicker border
          max-width: ${annotation.note.length > TEXT_LENGTH_THRESHOLD ? '400px' : '300px'}; // Increased width
          min-width: 160px; // Increased min-width
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          z-index: 1;
          font-size: 16px; // Increased font size
          line-height: 1.5; // Increased line height
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1f2937; // Darker text for better contrast
          word-break: break-word;
          white-space: pre-wrap;
        `;
        noteBox.textContent = annotation.note;

        imageContainer.appendChild(icon);
        imageContainer.appendChild(noteBox);
      });

      container.appendChild(imageContainer);

      // Capture the page
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: 'white',
        logging: false
      });

      if (i > 0) {
        pdf.addPage();
      }

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const ratio = Math.min(
        (pageWidth - PAGE_MARGIN * 2) / canvas.width,
        (pageHeight - PAGE_MARGIN * 2) / canvas.height
      );
      
      const finalWidth = canvas.width * ratio;
      const finalHeight = canvas.height * ratio;
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        x,
        y,
        finalWidth,
        finalHeight,
        undefined,
        'FAST'
      );

      document.body.removeChild(container);
    }

    return pdf.output('blob');
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
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
    y = h * Math.sign(Math.sin(angle));
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
  const handleExportPNG = async (filename) => {
    try {
      const blob = await generatePDF();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
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
  </div>
);

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
          type={showExportDialog.type}  // Add this line
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
                        {currentAnnotations.map((annotation) => {
  const imageWidth = imageRef.current?.naturalWidth || 0;
  const imageHeight = imageRef.current?.naturalHeight || 0;
  
  // Convert absolute coordinates to percentages
  const xPercent = (annotation.x / imageWidth) * 100;
  const yPercent = (annotation.y / imageHeight) * 100;
  
  return (
    <div
      key={annotation.id}
      className="absolute"
      style={{
        left: `${xPercent}%`,
        top: `${yPercent}%`,
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
        className={`
        w-10 h-10 md:w-6 md:h-6 rounded-full 
        flex items-center justify-center 
        ${annotation.completed ? 'bg-green-500' : 'bg-blue-500'}
        text-white hover:opacity-90 transition-opacity
        touch-manipulation
        active:scale-110
        ${draggedAnnotation?.id === annotation.id ? 'scale-110 opacity-70' : ''}
      `}
      style={{
        touchAction: 'none', // Prevents default touch behaviors
        WebkitTapHighlightColor: 'transparent', // Removes tap highlight on iOS
      }}
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
            touchAction: 'none', // Add this line
          }}
        >
          <p className="mb-4 text-sm text-gray-700 break-words">{annotation.note}</p>
          <div className="flex items-center gap-2">
          <Button
  size="sm"
  variant="outline"
  onClick={(e) => toggleCompletion(annotation.id, e)}
  onTouchEnd={(e) => toggleCompletion(annotation.id, e)} // Add touch handler
  className="flex-1 h-9 text-sm"
>
  <Check className="w-4 h-4 mr-1" />
  {annotation.completed ? 'Undo' : 'Complete'}
</Button>

<Button
  size="sm"
  variant="outline"
  onClick={(e) => deleteAnnotation(annotation.id, e)}
  onTouchEnd={(e) => deleteAnnotation(annotation.id, e)} // Add touch handler
  className="flex-1 h-9 text-sm"
>
  <X className="w-4 h-4 mr-1" />
  Delete
</Button>
          </div>
        </div>
      )}
    </div>
  );
})}

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
      <div className="mt-6 text-center border-t border-gray-200 pt-4">
  <p className="text-sm text-gray-500">
    Created by{" "}
    <a 
      href="https://github.com/marthur3" 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-700 transition-colors"
    >
      Mikey B. Arthur
    </a>
  </p>
</div>
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

export default ImageAnnotator;