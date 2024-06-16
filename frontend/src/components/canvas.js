import { useRef, useEffect, useState } from 'react';

const Canvas = ({ socket, roomId }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000'); // Default color to black using hex
  const [lineSize, setLineSize] = useState(5); // Default line size
  const [isErasing, setIsErasing] = useState(false); // Eraser mode

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctxRef.current = ctx;
  }, []); // Initialize canvas context once

  const startDrawing = (e) => {
    setDrawing(true);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.clientX - canvasRef.current.offsetLeft, e.clientY - canvasRef.current.offsetTop);
  };

  const draw = (e) => {
    if (!drawing) return;
    const ctx = ctxRef.current;
    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 10; // Fixed eraser size for demonstration
    } else {
      ctx.globalCompositeOperation = 'source-over'; // Drawing mode
      ctx.strokeStyle = color;
      ctx.lineWidth = lineSize;
    }
    ctx.lineTo(e.clientX - canvasRef.current.offsetLeft, e.clientY - canvasRef.current.offsetTop);
    ctx.stroke();
    socket.emit('draw', {
      roomId,
      x: e.clientX - canvasRef.current.offsetLeft,
      y: e.clientY - canvasRef.current.offsetTop,
      color,
      lineSize,
      isErasing,
    });
  };

  const stopDrawing = () => {
    setDrawing(false);
    ctxRef.current.beginPath(); // Begin a new path to prevent connecting lines
  };

  useEffect(() => {
    const canvas = canvasRef.current;
  
    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
  
    // Cleanup function to remove event listeners
    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, []); // Removed dependencies to avoid re-adding event listeners unnecessarily

  useEffect(() => {
    if (socket) {
      const handleDraw = ({ x, y, color, lineSize, isErasing }) => {
        const ctx = ctxRef.current;
        if (isErasing) {
          ctx.globalCompositeOperation = 'destination-out';
        } else {
          ctx.globalCompositeOperation = 'source-over';
          ctx.strokeStyle = color;
          ctx.lineWidth = lineSize;
        }
        ctx.lineTo(x, y);
        ctx.stroke();
      };

      socket.on('draw', handleDraw);
      return () => {
        socket.off('draw', handleDraw);
      };
    }
  }, [socket]);

  // Updated UI with hue selector
  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseMove={draw}
        className="border"
      ></canvas>
      <div>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input type="range" min="1" max="20" value={lineSize} onChange={(e) => setLineSize(e.target.value)} />
        <button onClick={() => setIsErasing(!isErasing)}>{isErasing ? 'Draw' : 'Erase'}</button>
      </div>
    </div>
  );
};

export default Canvas;