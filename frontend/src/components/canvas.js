import { useRef, useEffect, useState } from 'react';

const Canvas = ({ socket, roomId }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#FFFFFF');
  const [lineSize, setLineSize] = useState(5);
  const [isErasing, setIsErasing] = useState(false);
  const [history, setHistory] = useState([]);
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctxRef.current = ctx;
  }, []);

  const captureState = () => {
    setTimeout(() => {
      const canvas = canvasRef.current;
      const imageData = canvas.toDataURL();
      const newHistory = history.slice(0, step + 1); 
      setHistory([...newHistory, imageData]);
      setStep(newHistory.length);
    }, 0);
  };

  const undoLastAction = () => {
    if (step > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const previousState = new Image();
      previousState.src = history[step - 1];
      previousState.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(previousState, 0, 0, canvas.width, canvas.height);
      };
      setStep(step - 1);
    }
  };

  const startDrawing = (e) => {
    setDrawing(true);
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.clientX - canvasRef.current.offsetLeft, e.clientY - canvasRef.current.offsetTop);
    captureState(); 
  };
  const draw = (e) => {
    if (!drawing) return;
    const ctx = ctxRef.current;
    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 10;
    } else {
      ctx.globalCompositeOperation = 'source-over';
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
    ctxRef.current.beginPath();
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
    };
  }, []);

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

  const fillCanvas = () => {
    const ctx = ctxRef.current;
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f2f2f2', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onMouseMove={draw}
        style={{ display: 'block', margin: '0 auto', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '5px' }}
      ></canvas>
      <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }} />
        <input type="range" min="1" max="20" value={lineSize} onChange={(e) => setLineSize(e.target.value)} style={{ cursor: 'pointer' }} />
        <button onClick={() => setIsErasing(!isErasing)} style={{ backgroundColor: isErasing ? '#f44336' : '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', cursor: 'pointer', fontSize: '16px' }}>{isErasing ? 'Draw' : 'Erase'}</button>
        <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} style={{ width: '40px', height: '40px', border: 'none', cursor: 'pointer' }} />
        <button onClick={fillCanvas} style={{ backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', cursor: 'pointer', fontSize: '16px' }}>Fill Canvas</button>
        <button onClick={undoLastAction} style={{ backgroundColor: '#FFC107', color: 'white', border: 'none', borderRadius: '5px', padding: '10px 15px', cursor: 'pointer', fontSize: '16px' }}>Undo</button>
      </div>
    </div>
  );
};

export default Canvas;