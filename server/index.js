import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeSentiment } from './services/sentiment.js';
import { fetchComments } from './services/comments.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Check if dist directory exists
const distPath = path.join(__dirname, '../dist');
if (!fs.existsSync(distPath)) {
  console.error('Error: dist directory not found. Please run "npm run build" first.');
  process.exit(1);
}

// Serve static files from the dist directory
app.use(express.static(distPath));

app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'URL is required' });
    }

    // Fetch comments from the appropriate platform
    const comments = await fetchComments(url);

    // Analyze sentiment for each comment
    const analyzedComments = comments.map(comment => ({
      ...comment,
      ...analyzeSentiment(comment.text)
    }));

    // Calculate summary statistics
    const summary = analyzedComments.reduce((acc, comment) => {
      acc.total++;
      acc[comment.sentiment]++;
      return acc;
    }, {
      total: 0,
      positive: 0,
      negative: 0,
      neutral: 0
    });

    res.json({
      comments: analyzedComments,
      summary
    });
  } catch (error) {
    console.error('Error analyzing comments:', error);
    res.status(500).json({
      message: error.message || 'An error occurred while analyzing comments'
    });
  }
});

// Handle client-side routing - must be after API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});