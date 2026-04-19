'use client';

import { useEffect } from 'react';

/**
 * SecurityLock Component
 * Provides "Maximum Security" measures as requested by the user:
 * 1. Blocks Right-Click (Context Menu)
 * 2. Blocks F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S
 * 3. Detects if DevTools are open and triggers a debugger/redirect
 * 4. Prevents Image Dragging
 * 5. Prevents Text Selection
 */
export default function SecurityLock() {
  useEffect(() => {
    // 1. Block Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 2. Block Keyboard Shortcuts
    const handleKeyDown = (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      
      // Ctrl + Shift + I/J/C
      if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }

      // Ctrl + U (View Source)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }

      // Ctrl + S (Save Page)
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }

      // Ctrl + P (Print)
      if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault();
        return false;
      }
    };

    // 3. DevTools Detection & Anti-Debugging
    // This loop makes debugging very annoying by pausing the script execution if DevTools is open.
    const antiDebug = setInterval(() => {
      const startTime = performance.now();
      debugger; // This will only pause if DevTools is open
      const endTime = performance.now();
      
      // If it took a long time to resume (because of debugger pause), DevTools is likely open
      if (endTime - startTime > 100) {
        // console.clear();
        // Option: Redirect or alert user
        // window.location.href = "about:blank";
      }
    }, 1000);

    // 4. Prevent Image Dragging (Global)
    const handleDragStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Add listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      clearInterval(antiDebug);
    };
  }, []);

  return (
    <style jsx global>{`
      /* 5. Prevent Text Selection & User Interaction with Images */
      html, body {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      img {
        -webkit-user-drag: none;
        -khtml-user-drag: none;
        -moz-user-drag: none;
        -o-user-drag: none;
        pointer-events: none;
      }

      /* Allow selection in specific areas if needed (e.g., input fields) */
      input, textarea {
        -webkit-user-select: text;
        -moz-user-select: text;
        -ms-user-select: text;
        user-select: text;
      }

      /* Print protection: hide content when printing */
      @media print {
        body { display: none !important; }
      }
    `}</style>
  );
}
