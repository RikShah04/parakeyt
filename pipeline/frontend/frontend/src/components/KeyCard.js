function KeyCard({ 
  keyData, 
  index, 
  isExpanded, 
  onToggleExpansion, 
  onUpdateKey, 
  onRemoveKey 
}) {
  const handleInputChange = (field, value) => {
    onUpdateKey(index, field, value);
  };

  return (
    <div className="key-card">
      <div 
        className="key-title"
        onClick={() => onToggleExpansion(index)}
        style={{ cursor: 'pointer' }}
      >
        <span>{keyData.label || `Key ${index + 1}`}</span>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>
      
      {isExpanded && (
        <div className="key-inputs">
          <div className="input-row">
            <div className="input-group">
              <label className="input-label">X Position</label>
              <input
                type="number"
                className="input-field"
                value={keyData.x}
                onChange={(e) => handleInputChange('x', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Y Position</label>
              <input
                type="number"
                className="input-field"
                value={keyData.y}
                onChange={(e) => handleInputChange('y', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="input-row">
            <div className="input-group">
              <label className="input-label">Z Position</label>
              <input
                type="number"
                className="input-field"
                value={keyData.z}
                onChange={(e) => handleInputChange('z', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Size</label>
              <input
                type="number"
                className="input-field"
                value={keyData.size}
                onChange={(e) => handleInputChange('size', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Label</label>
            <input
              type="text"
              className="input-field"
              value={keyData.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              placeholder="Key label"
            />
          </div>
          
          <button 
            onClick={() => onRemoveKey(index)} 
            className="remove-button"
          >
            Remove Key
          </button>
        </div>
      )}
    </div>
  );
}

export default KeyCard;
