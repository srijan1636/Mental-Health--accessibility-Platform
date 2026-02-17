import React, { useRef, useEffect, useState } from 'react';

const Squares = ({ 
  direction = 'diagonal', 
  speed = 0.5, 
  borderColor = '#e2e8f0', // slate-200 (subtle grid)
  squareColor = '#d1fae5', // emerald-100 (subtle active square)
  hoverFillColor = '#34d399', // emerald-400 (hover effect)
  className = ''
}) => {
  const canvasRef = useRef(null);
  const requestRef = useRef(null);
  const numSquaresX = useRef(0);
  const numSquaresY = useRef(0);
  const gridOffset = useRef({ x: 0, y: 0 });
  const [hoveredSquare, setHoveredSquare] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / 40) + 1;
      numSquaresY.current = Math.ceil(canvas.height / 40) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawGrid = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const startX = Math.floor(gridOffset.current.x / 40);
      const startY = Math.floor(gridOffset.current.y / 40);

      for (let i = 0; i < numSquaresX.current; i++) {
        for (let j = 0; j < numSquaresY.current; j++) {
          const squareX = (startX + i) * 40 - gridOffset.current.x;
          const squareY = (startY + j) * 40 - gridOffset.current.y;

          // Draw the grid lines
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 0.5; // Very thin lines for elegance
          ctx.strokeRect(squareX, squareY, 40, 40);

          // Draw active hovering square (Interactive feel)
          if (hoveredSquare && 
              Math.floor((squareX + gridOffset.current.x) / 40) === hoveredSquare.x &&
              Math.floor((squareY + gridOffset.current.y) / 40) === hoveredSquare.y) {
            ctx.fillStyle = hoverFillColor;
            ctx.globalAlpha = 0.2; // Low opacity for subtle feel
            ctx.fillRect(squareX, squareY, 40, 40);
            ctx.globalAlpha = 1;
          } 
          // Draw random "breathing" squares (Serene effect)
          else if (Math.random() < 0.001) { // Very rare flicker
             ctx.fillStyle = squareColor;
             ctx.globalAlpha = 0.4;
             ctx.fillRect(squareX, squareY, 40, 40);
             ctx.globalAlpha = 1;
          }
        }
      }
    };

    const updateAnimation = () => {
      // Slow, calming movement
      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'right': gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + 40) % 40; break;
        case 'left': gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + 40) % 40; break;
        case 'up': gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + 40) % 40; break;
        case 'down': gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + 40) % 40; break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + 40) % 40;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + 40) % 40;
          break;
        default: break;
      }

      drawGrid();
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Calculate which grid square is being hovered
      const hoveredX = Math.floor((mouseX + gridOffset.current.x) / 40);
      const hoveredY = Math.floor((mouseY + gridOffset.current.y) / 40);

      setHoveredSquare({ x: hoveredX, y: hoveredY });
    };

    const handleMouseLeave = () => setHoveredSquare(null);

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [direction, speed, borderColor, hoverFillColor, hoveredSquare, squareColor]);

  return <canvas ref={canvasRef} className={`w-full h-full block ${className}`} />;
};

export default Squares;