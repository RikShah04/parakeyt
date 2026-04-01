import { useRef, useEffect, useState, useCallback } from 'react';

function KeyboardVisualization({ mcu, keys, split, tilt, onUpdateKey, onUpdateMcuPos, onRemoveKey }) {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [hoveredKeyIndex, setHoveredKeyIndex] = useState(null);
  
  const scale = 45;
  const offsetX = 30;
  const offsetY = 30;

  const keyUnit = scale * 0.92;
  const keyGap = scale * 0.08;

  const findElementAt = useCallback((canvasX, canvasY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = canvasX - rect.left;
    const mouseY = canvasY - rect.top;
    
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      const keyXVal = key.x === '' ? 0 : Number(key.x);
      const keyYVal = key.y === '' ? 0 : Number(key.y);
      const keySizeVal = key.size === '' ? 1 : Number(key.size);
      
      const keyX = offsetX + keyXVal * scale;
      const keyY = offsetY + keyYVal * scale;
      const keyWidth = keySizeVal * scale - keyGap;
      const keyHeight = keyUnit;
      
      if (
        mouseX >= keyX &&
        mouseX <= keyX + keyWidth &&
        mouseY >= keyY &&
        mouseY <= keyY + keyHeight
      ) {
        return { type: 'key', index: i };
      }
    }
    
    const mcuXVal = mcu.pos.x === '' ? 1 : Number(mcu.pos.x);
    const mcuYVal = mcu.pos.y === '' ? 3 : Number(mcu.pos.y);
    const mcuSizeVal = mcu.size === '' ? 1 : Number(mcu.size);
    
    const mcuX = offsetX + mcuXVal * scale;
    const mcuY = offsetY + mcuYVal * scale;
    const mcuSize = Math.max(mcuSizeVal * scale, 40);
    
    if (
      mouseX >= mcuX - mcuSize / 2 &&
      mouseX <= mcuX + mcuSize / 2 &&
      mouseY >= mcuY - mcuSize / 2 &&
      mouseY <= mcuY + mcuSize / 2
    ) {
      return { type: 'mcu' };
    }
    
    return null;
  }, [keys, mcu, keyUnit, keyGap]);

  const findDeleteButtonAt = useCallback((canvasX, canvasY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = canvasX - rect.left;
    const mouseY = canvasY - rect.top;
    
    for (let i = keys.length - 1; i >= 0; i--) {
      const key = keys[i];
      const keyXVal = key.x === '' ? 0 : Number(key.x);
      const keyYVal = key.y === '' ? 0 : Number(key.y);
      const keySizeVal = key.size === '' ? 1 : Number(key.size);
      
      const keyX = offsetX + keyXVal * scale;
      const keyY = offsetY + keyYVal * scale;
      const keyWidth = keySizeVal * scale - keyGap;
      
      const btnX = keyX + keyWidth - 8;
      const btnY = keyY + 8;
      const btnRadius = 8;
      
      const distance = Math.sqrt((mouseX - btnX) ** 2 + (mouseY - btnY) ** 2);
      if (distance <= btnRadius) {
        return i;
      }
    }
    return null;
  }, [keys, keyGap]);

  const handleMouseDown = useCallback((e) => {
    const deleteIndex = findDeleteButtonAt(e.clientX, e.clientY);
    if (deleteIndex !== null) {
      return;
    }
    
    const element = findElementAt(e.clientX, e.clientY);
    if (element) {
      setDragging(element);
      
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      if (element.type === 'key') {
        const key = keys[element.index];
        const keyX = offsetX + (key.x === '' ? 0 : Number(key.x)) * scale;
        const keyY = offsetY + (key.y === '' ? 0 : Number(key.y)) * scale;
        setDragOffset({ x: mouseX - keyX, y: mouseY - keyY });
      } else if (element.type === 'mcu') {
        const mcuX = offsetX + (mcu.pos.x === '' ? 1 : Number(mcu.pos.x)) * scale;
        const mcuY = offsetY + (mcu.pos.y === '' ? 3 : Number(mcu.pos.y)) * scale;
        setDragOffset({ x: mouseX - mcuX, y: mouseY - mcuY });
      }
      
      e.preventDefault();
    }
  }, [findElementAt, findDeleteButtonAt, keys, mcu]);

  const handleMouseMove = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const element = findElementAt(e.clientX, e.clientY);
    
    if (element && element.type === 'key') {
      setHoveredKeyIndex(element.index);
    } else {
      setHoveredKeyIndex(null);
    }
    
    const deleteIndex = findDeleteButtonAt(e.clientX, e.clientY);
    if (deleteIndex !== null) {
      canvas.style.cursor = 'pointer';
      setHoveredKeyIndex(deleteIndex);
    } else {
      canvas.style.cursor = element ? 'grab' : 'default';
    }
    
    if (dragging) {
      canvas.style.cursor = 'grabbing';
      
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - dragOffset.x;
      const mouseY = e.clientY - rect.top - dragOffset.y;
      
      const gridX = Math.max(0, Math.round(((mouseX - offsetX) / scale) * 2) / 2);
      const gridY = Math.max(0, Math.round(((mouseY - offsetY) / scale) * 2) / 2);
      
      if (dragging.type === 'key' && onUpdateKey) {
        onUpdateKey(dragging.index, 'x', gridX.toString());
        onUpdateKey(dragging.index, 'y', gridY.toString());
      } else if (dragging.type === 'mcu' && onUpdateMcuPos) {
        onUpdateMcuPos('x', gridX.toString());
        onUpdateMcuPos('y', gridY.toString());
      }
    }
  }, [dragging, dragOffset, findElementAt, findDeleteButtonAt, onUpdateKey, onUpdateMcuPos]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setDragging(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleDoubleClick = useCallback((e) => {
    const element = findElementAt(e.clientX, e.clientY);
    if (element && element.type === 'key') {
      const key = keys[element.index];
      setEditingIndex(element.index);
      setEditValue(key.label || `K${element.index + 1}`);
      setCursorVisible(true);
      
      canvasRef.current?.focus();
    }
  }, [findElementAt, keys]);

  const handleKeyDown = useCallback((e) => {
    if (editingIndex === null) return;
    
    if (e.key === 'Enter') {
      if (onUpdateKey) {
        onUpdateKey(editingIndex, 'label', editValue);
      }
      setEditingIndex(null);
      setEditValue('');
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditValue('');
    } else if (e.key === 'Backspace') {
      setEditValue(prev => prev.slice(0, -1));
      e.preventDefault();
    } else if (e.key.length === 1 && editValue.length < 8) {
      setEditValue(prev => prev + e.key);
      e.preventDefault();
    }
  }, [editingIndex, editValue, onUpdateKey]);

  const handleCanvasClick = useCallback((e) => {
    const deleteIndex = findDeleteButtonAt(e.clientX, e.clientY);
    if (deleteIndex !== null && onRemoveKey) {
      onRemoveKey(deleteIndex);
      return;
    }
    
    if (editingIndex !== null) {
      const element = findElementAt(e.clientX, e.clientY);
      if (!element || element.type !== 'key' || element.index !== editingIndex) {
        if (onUpdateKey) {
          onUpdateKey(editingIndex, 'label', editValue);
        }
        setEditingIndex(null);
        setEditValue('');
      }
    }
  }, [editingIndex, editValue, findElementAt, findDeleteButtonAt, onUpdateKey, onRemoveKey]);

  const handleContextMenu = useCallback((e) => {
    const element = findElementAt(e.clientX, e.clientY);
    if (element && element.type === 'key' && onRemoveKey) {
      e.preventDefault();
      onRemoveKey(element.index);
    }
  }, [findElementAt, onRemoveKey]);

  function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function drawKeyboard() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const { width, height } = rect;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#2D3748');
    gradient.addColorStop(1, '#1A202C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#4A5568';
    ctx.strokeStyle = '#2D3748';
    ctx.lineWidth = 3;
    const caseMargin = 20;
    const caseRadius = 15;
    drawRoundedRect(ctx, caseMargin, caseMargin, width - caseMargin * 2, height - caseMargin * 2, caseRadius);
    ctx.fill();
    ctx.stroke();
    
    
    const mcuXVal = mcu.pos.x === '' ? 1 : Number(mcu.pos.x);
    const mcuYVal = mcu.pos.y === '' ? 3 : Number(mcu.pos.y);
    const mcuSizeVal = mcu.size === '' ? 1 : Number(mcu.size);
    
    const mcuX = offsetX + mcuXVal * scale;
    const mcuY = offsetY + mcuYVal * scale;
    const mcuSize = Math.max(mcuSizeVal * scale, 40);
    
    
    const mcuGradient = ctx.createLinearGradient(mcuX - mcuSize/2, mcuY - mcuSize/2, mcuX + mcuSize/2, mcuY + mcuSize/2);
    mcuGradient.addColorStop(0, '#1A1A1A');
    mcuGradient.addColorStop(1, '#000000');
    ctx.fillStyle = mcuGradient;
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, mcuX - mcuSize/2, mcuY - mcuSize/2, mcuSize, mcuSize, 4);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = '#FFD700';
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        const pinX = mcuX - mcuSize/2 + 8 + i * (mcuSize - 16) / 3;
        const pinY = mcuY - mcuSize/2 + 8 + j * (mcuSize - 16) / 3;
        ctx.fillRect(pinX - 1, pinY - 1, 2, 2);
      }
    }
    
    ctx.fillStyle = '#CCCCCC';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MCU', mcuX, mcuY);
    
    const keyUnit = scale * 0.9;
    const keyGap = scale * 0.1;
    
    keys.forEach((key, index) => {
      const keyXVal = key.x === '' ? 0 : Number(key.x);
      const keyYVal = key.y === '' ? 0 : Number(key.y);
      const keySizeVal = key.size === '' ? 1 : Number(key.size);
      
      const keyX = offsetX + keyXVal * scale;
      const keyY = offsetY + keyYVal * scale;
      
      const keyWidth = keySizeVal * scale - keyGap;
      const keyHeight = keyUnit;
      
      const isEditing = editingIndex === index;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      drawRoundedRect(ctx, keyX + 2, keyY + 2, keyWidth, keyHeight, 4);
      ctx.fill();
      
      const keyGradient = ctx.createLinearGradient(keyX, keyY, keyX + keyWidth, keyY + keyHeight);
      if (isEditing) {
        keyGradient.addColorStop(0, '#E6FFFA');
        keyGradient.addColorStop(0.5, '#B2F5EA');
        keyGradient.addColorStop(1, '#81E6D9');
      } else {
        keyGradient.addColorStop(0, '#F7FAFC');
        keyGradient.addColorStop(0.5, '#EDF2F7');
        keyGradient.addColorStop(1, '#CBD5E0');
      }
      ctx.fillStyle = keyGradient;
      
      ctx.strokeStyle = isEditing ? '#38A169' : '#A0AEC0';
      ctx.lineWidth = isEditing ? 2 : 1.5;
      
      drawRoundedRect(ctx, keyX, keyY, keyWidth, keyHeight, 4);
      ctx.fill();
      ctx.stroke();
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(keyX + 4, keyY + 1);
      ctx.lineTo(keyX + keyWidth - 4, keyY + 1);
      ctx.stroke();
      
      const keyCenterX = keyX + keyWidth / 2;
      const keyCenterY = keyY + keyHeight / 2;
      
      ctx.fillStyle = '#2D3748';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      let label;
      if (isEditing) {
        label = editValue;
        if (cursorVisible) {
          const textWidth = ctx.measureText(label).width;
          ctx.fillRect(keyCenterX + textWidth/2 + 1, keyCenterY - 7, 1, 14);
        }
      } else {
        label = key.label || `K${index + 1}`;
      }
      ctx.fillText(label, keyCenterX, keyCenterY);
      
      if (hoveredKeyIndex === index && !isEditing) {
        const btnX = keyX + keyWidth - 8;
        const btnY = keyY + 8;
        const btnRadius = 7;
        
        ctx.beginPath();
        ctx.arc(btnX, btnY, btnRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#E53E3E';
        ctx.fill();
        
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(btnX - 3, btnY - 3);
        ctx.lineTo(btnX + 3, btnY + 3);
        ctx.moveTo(btnX + 3, btnY - 3);
        ctx.lineTo(btnX - 3, btnY + 3);
        ctx.stroke();
      }
    });
    
    if (split) {
      ctx.strokeStyle = '#1A202C';
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      const splitX = offsetX + 10 * scale;
      ctx.beginPath();
      ctx.moveTo(splitX, offsetY);
      ctx.lineTo(splitX, height - 60);
      ctx.stroke();
      
      ctx.fillStyle = '#E53E3E';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SPLIT', splitX, offsetY - 20);
    }
  }

  useEffect(() => {
    drawKeyboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mcu, keys, split, tilt, editingIndex, editValue, cursorVisible, hoveredKeyIndex]);

  useEffect(() => {
    drawKeyboard();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingIndex !== null) {
      const interval = setInterval(() => {
        setCursorVisible(v => !v);
      }, 530);
      return () => clearInterval(interval);
    }
  }, [editingIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('dblclick', handleDoubleClick);
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('dblclick', handleDoubleClick);
      canvas.removeEventListener('click', handleCanvasClick);
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleMouseLeave, handleDoubleClick, handleCanvasClick, handleKeyDown, handleContextMenu]);

  return (
    <div className="keyboard-visualization">
      <h3 className="visualization-title">Keyboard Layout Preview</h3>
      <p className="visualization-hint">Drag to move • Double-click to rename • Right-click or hover to delete</p>
      <canvas 
        ref={canvasRef}
        className="keyboard-canvas"
        width="1200"
        height="800"
        tabIndex={0}
        style={{ width: '100%', height: '100%', outline: 'none' }}
      />
    </div>
  );
}

export default KeyboardVisualization;
