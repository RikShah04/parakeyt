const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

export const sanitizeNumber = (value) => value === '' ? 0 : value;

export const uploadConfiguration = async (config) => {
  try {
    console.log('Attempting to upload to:', `${API_BASE_URL}/upload-config`);
    console.log('Configuration data:', config);
    
    const response = await fetch(`${API_BASE_URL}/upload-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Response error text:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.text();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Detailed error uploading configuration:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to backend server at ${API_BASE_URL}. Make sure the backend is running.`);
    }
    
    throw error;
  }
};

export const generateConfiguration = (mcu, split, tilt, keys) => {
  return {
    mcu: {
      pos: {
        x: sanitizeNumber(mcu.pos.x),
        y: sanitizeNumber(mcu.pos.y),
        z: sanitizeNumber(mcu.pos.z)
      },
      size: sanitizeNumber(mcu.size)
    },
    split,
    tilt: sanitizeNumber(tilt),
    keys: keys.map(key => ({
      x: sanitizeNumber(key.x),
      y: sanitizeNumber(key.y),
      z: sanitizeNumber(key.z),
      size: sanitizeNumber(key.size),
      label: key.label
    }))
  };
};

export const downloadConfigAsFile = (config, filename = 'config.json') => {
  const jsonString = JSON.stringify(config, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};
