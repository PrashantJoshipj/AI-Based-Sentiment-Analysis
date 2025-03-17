import Sentiment from 'sentiment';

// Initialize the sentiment analyzer once when the module loads
const sentimentAnalyzer = new Sentiment();

export function analyzeSentiment(text) {
  // Use the initialized analyzer instance
  const analysis = sentimentAnalyzer.analyze(text);
  
  let sentimentType;
  if (analysis.score > 0) {
    sentimentType = 'positive';
  } else if (analysis.score < 0) {
    sentimentType = 'negative';
  } else {
    sentimentType = 'neutral';
  }

  return {
    sentiment: sentimentType,
    score: analysis.score
  };
}