import KeyCard from './KeyCard';

function ConfigurationForm({
  mcu,
  split,
  tilt,
  keys,
  expandedKeys,
  onUpdateMcu,
  onUpdateMcuPos,
  onSetSplit,
  onSetTilt,
  onAddKey,
  onRemoveKey,
  onUpdateKey,
  onToggleKeyExpansion
}) {
  return (
    <div className="sidebar">
      <h1 className="main-header">Keyboard Parameters</h1>
      
      <div className="section-card">
        <h3 className="section-title">MCU Configuration</h3>
        <div className="mcu-inputs">
          <div className="input-row">
            <div className="input-group">
              <label className="input-label">X Position</label>
              <input
                type="number"
                className="input-field mcu-input"
                value={mcu.pos.x}
                onChange={(e) => onUpdateMcuPos('x', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Y Position</label>
              <input
                type="number"
                className="input-field mcu-input"
                value={mcu.pos.y}
                onChange={(e) => onUpdateMcuPos('y', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>
          <div className="input-row">
            <div className="input-group">
              <label className="input-label">Z Position</label>
              <input
                type="number"
                className="input-field mcu-input"
                value={mcu.pos.z}
                onChange={(e) => onUpdateMcuPos('z', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Size</label>
              <input
                type="number"
                className="input-field mcu-input"
                value={mcu.size}
                onChange={(e) => onUpdateMcu('size', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-title">Split Configuration</h3>
        <label className="checkbox-label">
          <span>Enable Split Keyboard</span>
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={split}
              onChange={(e) => onSetSplit(e.target.checked)}
              className="checkbox"
            />
            <span className="toggle-slider"></span>
          </div>
        </label>
      </div>

      <div className="section-card">
        <h3 className="section-title">Tilt Configuration</h3>
        <div className="tilt-input-container">
          <label className="input-label">Tilt Angle (degrees)</label>
          <input
            type="number"
            className="input-field tilt-input"
            value={tilt}
            onChange={(e) => onSetTilt(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
          />
        </div>
      </div>

      <div className="section-card">
        <h3 className="section-title">Keys Configuration</h3>
        <div className="keys-container">
          {keys.map((key, index) => (
            <KeyCard
              key={index}
              keyData={key}
              index={index}
              isExpanded={expandedKeys.has(index)}
              onToggleExpansion={onToggleKeyExpansion}
              onUpdateKey={onUpdateKey}
              onRemoveKey={onRemoveKey}
            />
          ))}
        </div>
        <button onClick={onAddKey} className="add-key-button">
          + Add New Key
        </button>
      </div>
    </div>
  );
}

export default ConfigurationForm;
