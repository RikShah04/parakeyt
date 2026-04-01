const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process")

const app = express();

const CONFIG_PATH = path.join(__dirname, "..", "config.json");

app.use(cors());

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "ParaKeyt Backend API",
    version: "1.0.0",
    endpoints: ["/health", "/upload-config"]
  });
});




app.post("/upload-config", (req, res) => {
  try {
    const config = req.body;
    
    if (!config || typeof config !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid configuration data" 
      });
    }
    
    const jsonString = JSON.stringify(config, null, 2);
    fs.writeFileSync(CONFIG_PATH, jsonString, 'utf8');
    
    console.log("Config saved to:", CONFIG_PATH);
    console.log("Config contents:", config);

    let child = spawn("python", [path.join(__dirname, "../../parakeyt_pipeline.py"), CONFIG_PATH])
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked'
    });

    child.stdout.on("data", (data) => {
      res.write(data)
    })
    
    child.on("close", () => {
      res.end()
    })
    
    // res.json({ 
    //   success: true, 
    //   message: "Configuration saved successfully",
    //   path: CONFIG_PATH
    // });
  } catch (error) {
    console.error("Error processing configuration:", error);
    res.status(500).json({ 
      success: false, 
      error: "Internal server error: " + error.message 
    });
  }
});

app.get("/config", (req, res) => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      res.json({ success: true, config });
    } else {
      res.status(404).json({ success: false, error: "No config file found" });
    }
  } catch (error) {
    console.error("Error reading config:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Server URL: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try a different port or stop the other process.`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
