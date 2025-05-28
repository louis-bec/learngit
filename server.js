const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const FCS = require('fcs-parser');

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
    const fcs = new FCS(buffer);
    const header = fcs.header;
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    res.json({ header });
  } catch (err) {
    res.status(500).json({ error: 'Failed to parse FCS file', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
