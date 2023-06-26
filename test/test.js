const ytdl = require('ytdl-core');
const fs = require('fs');

const videoUrl = 'https://www.youtube.com/watch?v=vDIAwtGU9LE'; // Replace VIDEO_ID with the actual video ID

// Function to download the YouTube video
const downloadVideo = (url, filePath) => {
  const videoStream = ytdl(url);

  videoStream.pipe(fs.createWriteStream(filePath));

  videoStream.on('progress', (chunkLength, downloaded, total) => {
    const percent = downloaded / total;
    console.log(`Downloading: ${(percent * 100).toFixed(2)}%`);
  });

  videoStream.on('end', () => {
    console.log('Download completed!');
  });

  videoStream.on('error', (error) => {
    console.error('Error occurred during download:', error);
  });
};

// Usage: Call the function with the YouTube video URL and desired file path
downloadVideo(videoUrl, './output/vid.mp4');
