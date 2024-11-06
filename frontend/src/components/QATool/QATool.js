import React, { useState } from 'react';
import { Box, Typography, Button, TextField } from '@mui/material';
import axios from 'axios';

export default function QATool() {
  const [originalText, setOriginalText] = useState("");
  const [revisedText, setRevisedText] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/qa-tool/upload', formData);
      if (response.status === 200) {
        setOriginalText(response.data.originalText);
        setRevisedText(response.data.revisedText);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Box display="flex" flexDirection="column" padding="40px" alignItems="center">
      <Typography variant="h4" marginBottom="20px">QA Tool</Typography>
      <Box border="2px dashed #c4c4c4" padding="20px" textAlign="center">
        <input type="file" onChange={handleFileChange} />
        <Button onClick={handleSubmit} variant="contained" style={{ marginTop: '10px' }}>Submit</Button>
      </Box>

      <Box display="flex" justifyContent="space-around" marginTop="40px" width="100%">
        <Box width="45%">
          <Typography variant="h6">Original Document</Typography>
          <TextField
            multiline
            fullWidth
            rows={15}
            variant="outlined"
            value={originalText || "No document uploaded"}
            InputProps={{
              readOnly: true,
            }}
          />
        </Box>
        <Box width="45%">
          <Typography variant="h6">Revised Document</Typography>
          <TextField
            multiline
            fullWidth
            rows={15}
            variant="outlined"
            value={revisedText || "No revised document available"}
            InputProps={{
              readOnly: true,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
