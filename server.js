const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const { parseFCS } = require('fcs-parser');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.static('public'));

// Upload endpoint
app.post('/upload', upload.single('fcsFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  try {
    const buffer = fs.readFileSync(req.file.path);
    const parsed = parseFCS(buffer);
    // Clean up uploaded file asynchronously and log errors if any
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.error(`Failed to delete file: ${req.file.path}`, err);
      }
    });
    res.json({ header: parsed.text });
  } catch (err) {
    // Attempt to clean up file even if parsing fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`Failed to delete file after error: ${req.file.path}`, unlinkErr);
        }
      });
    }
    res.status(500).json({ error: 'Failed to parse FCS file', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
