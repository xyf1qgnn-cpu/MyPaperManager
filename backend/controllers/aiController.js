const axios = require('axios');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const Document = require('../models/Document');
const config = require('../config');

exports.translate = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    // Using DeepSeek API compatible with OpenAI SDK structure
    // Since we are using axios here for simplicity (or we could install openai package)
    // Let's use direct REST call to DeepSeek
    
    const apiKey = process.env.DEEPSEEK_API_KEY; 
    // Note: User needs to provide this in .env. For now, I'll assume it might be there or I should gracefully fail.
    
    if (!apiKey) {
        // Fallback or mock if no key provided for dev
        console.warn('DEEPSEEK_API_KEY not found in env');
        return res.json({ 
            original: text, 
            translation: "[Mock] DeepSeek API Key missing. " + text 
        });
    }

    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful assistant that translates academic text to Chinese." },
        { role: "user", content: `Translate the following text to Chinese:\n\n${text}` }
      ],
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const translation = response.data.choices[0].message.content;
    res.json({ original: text, translation });

  } catch (error) {
    console.error('AI Translation Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Translation failed' });
  }
};

exports.summarizeDocument = async (req, res) => {
  try {
    const { documentId } = req.body;

    if (!documentId) {
      return res.status(400).json({ message: 'Document ID is required' });
    }

    // 1. Fetch Document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // 2. Construct file path
    // config.upload.path usually is relative like './public/uploads'
    // We need to resolve it relative to the process cwd or __dirname
    // Assuming config.upload.path is what we need. 
    // If config.upload.path is relative, path.resolve works from CWD.
    const filePath = path.resolve(config.upload.path, document.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'PDF file not found on server' });
    }

    // 3. Extract Text
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const fullText = pdfData.text;

    // 4. Truncate
    const truncatedText = fullText.substring(0, 5000);

    // 5. Call AI
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.json({ 
        summary: "[Mock] DeepSeek API Key missing. Here is a mock summary.\n\n### Core Problem\nMock problem statement.\n\n### Methodology\nMock methodology.\n\n### Key Findings\nMock findings." 
      });
    }

    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: "You are a helpful research assistant." },
        { role: "user", content: `Analyze the following academic text. Provide a structured summary in Simplified Chinese (简体中文) including: 1. Core Problem (核心问题), 2. Methodology (研究方法), 3. Key Findings (主要发现).\n\n${truncatedText}` }
      ],
      stream: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const summary = response.data.choices[0].message.content;
    res.json({ summary });

  } catch (error) {
    console.error('AI Summarization Error:', error);
    res.status(500).json({ message: 'Summarization failed' });
  }
};
