import { useState } from 'react';

export const useKeyboardState = () => {
  const [mcu, setMcu] = useState({ 
    pos: { x: 0, y: 6, z: 0 }, 
    size: 1 
  });
  const [split, setSplit] = useState(false);
  const [tilt, setTilt] = useState(0);
  
  const defaultKeys = [
    { x: 0, y: 0, z: 0, size: 1, label: "`" },
    { x: 1, y: 0, z: 0, size: 1, label: "1" },
    { x: 2, y: 0, z: 0, size: 1, label: "2" },
    { x: 3, y: 0, z: 0, size: 1, label: "3" },
    { x: 4, y: 0, z: 0, size: 1, label: "4" },
    { x: 5, y: 0, z: 0, size: 1, label: "5" },
    { x: 6, y: 0, z: 0, size: 1, label: "6" },
    { x: 7, y: 0, z: 0, size: 1, label: "7" },
    { x: 8, y: 0, z: 0, size: 1, label: "8" },
    { x: 9, y: 0, z: 0, size: 1, label: "9" },
    { x: 10, y: 0, z: 0, size: 1, label: "0" },
    { x: 11, y: 0, z: 0, size: 1, label: "-" },
    { x: 12, y: 0, z: 0, size: 1, label: "=" },
    { x: 13, y: 0, z: 0, size: 1.5, label: "Bksp" },
    { x: 0, y: 1, z: 0, size: 1.25, label: "Tab" },
    { x: 1.25, y: 1, z: 0, size: 1, label: "Q" },
    { x: 2.25, y: 1, z: 0, size: 1, label: "W" },
    { x: 3.25, y: 1, z: 0, size: 1, label: "E" },
    { x: 4.25, y: 1, z: 0, size: 1, label: "R" },
    { x: 5.25, y: 1, z: 0, size: 1, label: "T" },
    { x: 6.25, y: 1, z: 0, size: 1, label: "Y" },
    { x: 7.25, y: 1, z: 0, size: 1, label: "U" },
    { x: 8.25, y: 1, z: 0, size: 1, label: "I" },
    { x: 9.25, y: 1, z: 0, size: 1, label: "O" },
    { x: 10.25, y: 1, z: 0, size: 1, label: "P" },
    { x: 11.25, y: 1, z: 0, size: 1, label: "[" },
    { x: 12.25, y: 1, z: 0, size: 1, label: "]" },
    { x: 13.25, y: 1, z: 0, size: 1.25, label: "\\" },
    { x: 0, y: 2, z: 0, size: 1.5, label: "Caps" },
    { x: 1.5, y: 2, z: 0, size: 1, label: "A" },
    { x: 2.5, y: 2, z: 0, size: 1, label: "S" },
    { x: 3.5, y: 2, z: 0, size: 1, label: "D" },
    { x: 4.5, y: 2, z: 0, size: 1, label: "F" },
    { x: 5.5, y: 2, z: 0, size: 1, label: "G" },
    { x: 6.5, y: 2, z: 0, size: 1, label: "H" },
    { x: 7.5, y: 2, z: 0, size: 1, label: "J" },
    { x: 8.5, y: 2, z: 0, size: 1, label: "K" },
    { x: 9.5, y: 2, z: 0, size: 1, label: "L" },
    { x: 10.5, y: 2, z: 0, size: 1, label: ";" },
    { x: 11.5, y: 2, z: 0, size: 1, label: "'" },
    { x: 12.5, y: 2, z: 0, size: 1.75, label: "Enter" },
    { x: 0, y: 3, z: 0, size: 1.75, label: "Shift" },
    { x: 1.75, y: 3, z: 0, size: 1, label: "Z" },
    { x: 2.75, y: 3, z: 0, size: 1, label: "X" },
    { x: 3.75, y: 3, z: 0, size: 1, label: "C" },
    { x: 4.75, y: 3, z: 0, size: 1, label: "V" },
    { x: 5.75, y: 3, z: 0, size: 1, label: "B" },
    { x: 6.75, y: 3, z: 0, size: 1, label: "N" },
    { x: 7.75, y: 3, z: 0, size: 1, label: "M" },
    { x: 8.75, y: 3, z: 0, size: 1, label: "," },
    { x: 9.75, y: 3, z: 0, size: 1, label: "." },
    { x: 10.75, y: 3, z: 0, size: 1, label: "/" },
    { x: 11.75, y: 3, z: 0, size: 2.25, label: "Shift" },
    { x: 0, y: 4, z: 0, size: 1.25, label: "Ctrl" },
    { x: 1.25, y: 4, z: 0, size: 1, label: "Win" },
    { x: 2.25, y: 4, z: 0, size: 1.25, label: "Alt" },
    { x: 3.5, y: 4, z: 0, size: 6.25, label: "Space" },
    { x: 9.75, y: 4, z: 0, size: 1.25, label: "Alt" },
    { x: 11, y: 4, z: 0, size: 1, label: "Win" },
    { x: 12, y: 4, z: 0, size: 1, label: "Menu" },
    { x: 13, y: 4, z: 0, size: 1.25, label: "Ctrl" },
  ];
  
  const [keys, setKeys] = useState(defaultKeys);
  const [expandedKeys, setExpandedKeys] = useState(new Set());

  const updateMcuPos = (axis, value) => {
    setMcu(prev => ({
      ...prev,
      pos: { ...prev.pos, [axis]: value }
    }));
  };

  const updateMcu = (field, value) => {
    setMcu(prev => ({ ...prev, [field]: value }));
  };

  const addKey = () => {
    let maxY = 0;
    keys.forEach(key => {
      const y = key.y === '' ? 0 : Number(key.y);
      if (y > maxY) maxY = y;
    });
    
    const newRowY = maxY + 1;
    const keysOnNewRow = keys.filter(k => Number(k.y) === newRowY).length;
    
    const newKey = { 
      x: keysOnNewRow, 
      y: newRowY, 
      z: 0, 
      size: 1, 
      label: "" 
    };
    setKeys(prev => [...prev, newKey]);
    
    const newIndex = keys.length;
    setExpandedKeys(prev => new Set([...prev, newIndex]));
  };

  const removeKey = (index) => {
    setKeys(prev => prev.filter((_, i) => i !== index));
    
    setExpandedKeys(prev => {
      const newSet = new Set();
      prev.forEach(i => {
        if (i < index) {
          newSet.add(i);
        } else if (i > index) {
          newSet.add(i - 1);
        }
      });
      return newSet;
    });
  };

  const updateKey = (index, field, value) => {
    setKeys(prev => prev.map((key, i) => 
      i === index ? { ...key, [field]: value } : key
    ));
  };

  const toggleKeyExpansion = (index) => {
    setExpandedKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return {
    mcu,
    split,
    tilt,
    keys,
    expandedKeys,
    
    updateMcuPos,
    updateMcu,
    setSplit,
    setTilt,
    addKey,
    removeKey,
    updateKey,
    toggleKeyExpansion
  };
};
