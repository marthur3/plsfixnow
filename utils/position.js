import { PDF_CONSTANTS } from '@/constants/pdf';

// Helper function for checking overlaps
const checkOverlap = (x, y, positions) => {
  const boxWidth = PDF_CONSTANTS.NOTE_BOX_WIDTH;
  const boxHeight = PDF_CONSTANTS.NOTE_BOX_WIDTH * 0.6;
  
  return positions.some(pos => {
    const dx = Math.abs(pos.noteX - x);
    const dy = Math.abs(pos.noteY - y);
    return dx < boxWidth + PDF_CONSTANTS.NOTE_BOX_SPACING &&
           dy < boxHeight + PDF_CONSTANTS.NOTE_BOX_SPACING;
  });
};

// Main export
const findOptimalPosition = (markerX, markerY, index, positions, dimensions) => {
  const { pageWidth, pageHeight, margin } = dimensions;
  
  // Spiral pattern parameters
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  let radius = PDF_CONSTANTS.NOTE_BOX_SPACING;
  
  for (let attempt = 0; attempt < PDF_CONSTANTS.MAX_ATTEMPTS; attempt++) {
    // Calculate angle based on index and attempt
    const angle = (index + attempt) * goldenAngle;
    
    // Get position on spiral
    const x = markerX + radius * Math.cos(angle);
    const y = markerY + radius * Math.sin(angle);
    
    // Check bounds
    if (x < margin + PDF_CONSTANTS.MIN_EDGE_DISTANCE || 
        x > pageWidth - margin - PDF_CONSTANTS.MIN_EDGE_DISTANCE ||
        y < margin + PDF_CONSTANTS.MIN_EDGE_DISTANCE || 
        y > pageHeight - margin - PDF_CONSTANTS.MIN_EDGE_DISTANCE) {
      radius += PDF_CONSTANTS.SPIRAL_STEP;
      continue;
    }
    
    // Check overlaps
    const hasOverlap = checkOverlap(x, y, positions);
    if (!hasOverlap) {
      return { x, y };
    }
    
    radius += PDF_CONSTANTS.SPIRAL_STEP;
  }
  
  // Fallback position if no good position found
  return {
    x: Math.max(margin + PDF_CONSTANTS.MIN_EDGE_DISTANCE, 
       Math.min(pageWidth - margin - PDF_CONSTANTS.MIN_EDGE_DISTANCE, markerX + PDF_CONSTANTS.NOTE_BOX_SPACING)),
    y: Math.max(margin + PDF_CONSTANTS.MIN_EDGE_DISTANCE, 
       Math.min(pageHeight - margin - PDF_CONSTANTS.MIN_EDGE_DISTANCE, markerY + PDF_CONSTANTS.NOTE_BOX_SPACING))
  };
};

export default findOptimalPosition;
