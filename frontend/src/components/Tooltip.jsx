import React, { useState, useEffect, useRef } from 'react';

export default function Tooltip({ content, position = 'top', align = 'center' }) {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);
  const isBottom = position === 'bottom';
  
  // Klasifikasi posisi horizontal berdasarkan alignment
  let alignClass = 'left-1/2 -translate-x-1/2';
  let arrowAlignClass = 'left-1/2 -translate-x-1/2';
  
  if (align === 'right') {
    alignClass = 'right-0 left-auto translate-x-0';
    arrowAlignClass = 'right-1.5 left-auto'; // sejajar dengan dot penanya di kanan
  } else if (align === 'left') {
    alignClass = 'left-0 right-auto translate-x-0';
    arrowAlignClass = 'left-1.5'; // sejajar dengan dot penanya di kiri
  }

  // Menutup tooltip saat mengetuk (tap/click) di luar area tooltip
  useEffect(() => {
    function handleClickOutside(event) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside); // Support event sentuh layar HP
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <span 
      ref={tooltipRef}
      className="relative inline-flex ml-1.5 cursor-help select-none"
      onClick={(e) => {
        e.stopPropagation(); // Mencegah pemicu klik baris/accordion di belakangnya
        setIsOpen(!isOpen);
      }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <span className="text-text-secondary hover:text-text-primary transition-colors text-[9px] bg-bg-surface border border-border-custom rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
        ?
      </span>
      
      {/* Tooltip Overlay */}
      {isOpen && (
        <span className={`absolute w-56 bg-bg-surface border border-border-custom text-[11px] leading-relaxed text-text-secondary rounded-lg p-2.5 shadow-xl backdrop-blur-md z-[100] text-center font-normal normal-case tracking-normal ${alignClass} ${
          isBottom ? 'top-full mt-2' : 'bottom-full mb-2'
        }`}>
          {content}
          {/* Arrow pointer */}
          <span 
            className={`absolute border-[5px] border-transparent ${arrowAlignClass} ${
              isBottom ? 'bottom-full' : 'top-full'
            }`} 
            style={{
              borderBottomColor: isBottom ? 'var(--bg-surface)' : 'transparent',
              borderTopColor: !isBottom ? 'var(--bg-surface)' : 'transparent'
            }}
          />
        </span>
      )}
    </span>
  );
}
