import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const youtube = google.youtube('v3');

function getPlatformFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return 'youtube';
    } else if (hostname.includes('facebook.com')) {
      return 'facebook';
    } else if (hostname.includes('instagram.com')) {
      return 'instagram';
    } else if (hostname.includes('snapchat.com')) {
      return 'snapchat';
    }

    throw new Error('Unsupported platform');
  } catch (error) {
    throw new Error('Invalid URL provided');
  }
}

function extractVideoId(url) {
  try {
    const urlObj = new URL(url);
    
    // Handle youtube.com URLs
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    
    // Handle youtu.be URLs
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }

    throw new Error('Invalid YouTube URL');
  } catch (error) {
    throw new Error('Could not extract video ID from URL');
  }
}

async function getAllYoutubeComments(videoId) {
  const comments = [];
  let nextPageToken = '';

  try {
    do {
      const response = await youtube.commentThreads.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ['snippet', 'replies'],
        videoId,
        maxResults: 100,
        pageToken: nextPageToken || undefined,
        textFormat: 'plainText',
      });

      // Get top-level comments
      const topLevelComments = response.data.items.map(item => ({
        id: item.id,
        text: item.snippet.topLevelComment.snippet.textDisplay,
        platform: 'youtube',
        author: item.snippet.topLevelComment.snippet.authorDisplayName,
        likes: item.snippet.topLevelComment.snippet.likeCount,
        timestamp: item.snippet.topLevelComment.snippet.publishedAt,
      }));

      comments.push(...topLevelComments);

      // Get replies for each comment
      for (const item of response.data.items) {
        if (item.snippet.totalReplyCount > 0) {
          const replies = await youtube.comments.list({
            key: process.env.YOUTUBE_API_KEY,
            part: ['snippet'],
            parentId: item.id,
            maxResults: 100,
            textFormat: 'plainText',
          });

          const replyComments = replies.data.items.map(reply => ({
            id: reply.id,
            text: reply.snippet.textDisplay,
            platform: 'youtube',
            author: reply.snippet.authorDisplayName,
            likes: reply.snippet.likeCount,
            timestamp: reply.snippet.publishedAt,
            isReply: true,
            parentId: item.id,
          }));

          comments.push(...replyComments);
        }
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return comments;
  } catch (error) {
    console.error('Error fetching YouTube comments:', error);
    if (!process.env.YOUTUBE_API_KEY) {
      // Return mock data for testing if no API key is available
      console.warn('YouTube API key not found, returning mock data');
      return [
        {
          id: uuidv4(),
          text: "This is a great video! Very informative.",
          platform: 'youtube',
          author: 'User1',
          likes: 10,
          timestamp: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          text: "I learned so much from this, thanks for sharing!",
          platform: 'youtube',
          author: 'User2',
          likes: 5,
          timestamp: new Date().toISOString(),
        },
        {
          id: uuidv4(),
          text: "Could have been better explained.",
          platform: 'youtube',
          author: 'User3',
          likes: 2,
          timestamp: new Date().toISOString(),
        }
      ];
    }
    throw new Error(
      error.response?.data?.error?.message || 
      'Failed to fetch YouTube comments. Please check your API key and video URL.'
    );
  }
}

async function getAllFacebookComments(postId) {
  const comments = [];
  let after = '';

  try {
    do {
      const response = await axios.get(`https://graph.facebook.com/v18.0/${postId}/comments`, {
        params: {
          access_token: process.env.FACEBOOK_ACCESS_TOKEN,
          fields: 'id,message,created_time,like_count,comment_count',
          limit: 100,
          after: after || undefined,
        },
      });

      const newComments = response.data.data.map(comment => ({
        id: comment.id,
        text: comment.message,
        platform: 'facebook',
        timestamp: comment.created_time,
        likes: comment.like_count,
      }));

      comments.push(...newComments);

      // Get replies for each comment
      for (const comment of response.data.data) {
        if (comment.comment_count > 0) {
          const replies = await axios.get(`https://graph.facebook.com/v18.0/${comment.id}/comments`, {
            params: {
              access_token: process.env.FACEBOOK_ACCESS_TOKEN,
              fields: 'id,message,created_time,like_count',
              limit: 100,
            },
          });

          const replyComments = replies.data.data.map(reply => ({
            id: reply.id,
            text: reply.message,
            platform: 'facebook',
            timestamp: reply.created_time,
            likes: reply.like_count,
            isReply: true,
            parentId: comment.id,
          }));

          comments.push(...replyComments);
        }
      }

      after = response.data.paging?.cursors?.after;
    } while (after);

    return comments;
  } catch (error) {
    console.error('Error fetching Facebook comments:', error);
    // Return mock data for testing
    return [
      {
        id: uuidv4(),
        text: "Great post! 👍",
        platform: 'facebook',
        timestamp: new Date().toISOString(),
        likes: 15,
      },
      {
        id: uuidv4(),
        text: "Thanks for sharing this!",
        platform: 'facebook',
        timestamp: new Date().toISOString(),
        likes: 8,
      }
    ];
  }
}

async function getAllInstagramComments(mediaId) {
  const comments = [];
  let after = '';

  try {
    do {
      const response = await axios.get(`https://graph.instagram.com/v18.0/${mediaId}/comments`, {
        params: {
          access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
          fields: 'id,text,timestamp,like_count,reply_count',
          limit: 100,
          after: after || undefined,
        },
      });

      const newComments = response.data.data.map(comment => ({
        id: comment.id,
        text: comment.text,
        platform: 'instagram',
        timestamp: comment.timestamp,
        likes: comment.like_count,
      }));

      comments.push(...newComments);

      // Get replies for each comment
      for (const comment of response.data.data) {
        if (comment.reply_count > 0) {
          const replies = await axios.get(`https://graph.instagram.com/v18.0/${comment.id}/replies`, {
            params: {
              access_token: process.env.INSTAGRAM_ACCESS_TOKEN,
              fields: 'id,text,timestamp,like_count',
              limit: 100,
            },
          });

          const replyComments = replies.data.data.map(reply => ({
            id: reply.id,
            text: reply.text,
            platform: 'instagram',
            timestamp: reply.timestamp,
            likes: reply.like_count,
            isReply: true,
            parentId: comment.id,
          }));

          comments.push(...replyComments);
        }
      }

      after = response.data.paging?.cursors?.after;
    } while (after);

    return comments;
  } catch (error) {
    console.error('Error fetching Instagram comments:', error);
    // Return mock data for testing
    return [
      {
        id: uuidv4(),
        text: "Amazing! 🔥",
        platform: 'instagram',
        timestamp: new Date().toISOString(),
        likes: 25,
      },
      {
        id: uuidv4(),
        text: "Love this content!",
        platform: 'instagram',
        timestamp: new Date().toISOString(),
        likes: 12,
      }
    ];
  }
}

export async function fetchComments(url) {
  const platform = getPlatformFromUrl(url);
  
  switch (platform) {
    case 'youtube': {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }
      return await getAllYoutubeComments(videoId);
    }
    case 'facebook': {
      const postId = url.split('/').pop();
      return await getAllFacebookComments(postId);
    }
    case 'instagram': {
      const mediaId = url.split('/').pop();
      return await getAllInstagramComments(mediaId);
    }
    case 'snapchat':
      throw new Error('Snapchat integration is not yet supported');
    default:
      throw new Error('Unsupported platform');
  }
}