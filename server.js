const express = require('express');
const cors = require('cors');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json()); // Middleware to parse incoming JSON request bodies

// POST route to process selected text
app.post('/api/data', (req, res) => {
  const { selectedText } = req.body;
  console.log(selectedText, "print");
  res.status(200).json({
    message: 'Data received successfully',
    receivedData: { selectedText: selectedText },
  });
});

const directoryPath = path.join(__dirname, 'fileSystem');

// Helper function to check if a path is a directory
const isDirectory = (source) => fs.lstatSync(source).isDirectory();

// Helper function to check if a path is a file
const isFile = (source) => fs.lstatSync(source).isFile();

// Route to read contents of a specific file
app.get('/api/readfile/*', (req, res) => {
  const relativeFilePath = req.params[0]; // Capture everything after /api/readfile/
  const filePath = path.join(directoryPath, relativeFilePath); // Construct the full path to the file

  console.log("File requested:", filePath); // Debug log to show the file path

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res.status(500).json({ message: 'Error reading file', error: err.message });
    }

    // Return the file content
    res.status(200).json({
      message: 'File read successfully',
      fileContent: data,
    });
  });
});

// Route to fetch files and folders within the specified directory
app.get('/api/files', (req, res) => {
  const currentPath = req.query.path || directoryPath; // Default to root if no path is provided

  fs.readdir(currentPath, (err, items) => {
    if (err) {
      console.error('Unable to scan directory:', err);
      return res.status(500).json({ message: 'Unable to scan directory', error: err.message });
    }

    const filesAndFolders = items.map((item) => {
      const fullPath = path.join(currentPath, item);
      return {
        name: item,
        isFolder: isDirectory(fullPath), // Return whether the item is a folder
      };
    });

    res.status(200).json({
      message: 'Items fetched successfully',
      files: filesAndFolders,
    });
  });
});

// Route to fetch contents of a folder
app.get('/api/folder/*', (req, res) => {
  const folderPath = req.params[0]; // Get the full folder path from the request
  const fullPath = path.join(directoryPath, folderPath); // Join it with the base directory

  fs.readdir(fullPath, (err, files) => {
    if (err) {
      console.error('Unable to scan directory:', err);
      return res.status(500).json({ message: 'Unable to scan directory', error: err.message });
    }

    const fileDetails = files.map(file => {
      const isFolder = fs.lstatSync(path.join(fullPath, file)).isDirectory();
      return { name: file, isFolder }; // Return file details with folder indication
    });

    res.status(200).json({
      message: 'Files fetched successfully',
      files: fileDetails,
    });
  });
});


// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
