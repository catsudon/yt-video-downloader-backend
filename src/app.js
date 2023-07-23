const express = require("express");
const bodyParser = require('body-parser');
const request = require('request');
const cors = require("cors");
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
const ytdl = require('ytdl-core');
const fs = require('fs');
ffmpeg.setFfmpegPath(ffmpegPath)

const { v4: uuidv4 } = require("uuid");
const app = express();
const port = process.env.PORT || 8000;
app.listen(port);
app.use(bodyParser.json())
app.use(cors());



const downloadVideo = (url, filePath, fileName, start, stop, res) => {
    const videoStream = ytdl(url, { filter: 'videoonly' }); // Get only video stream
    const audioStream = ytdl(url, { filter: 'audioonly' }); // Get only audio stream

    let videoDownloaded = false;
    let audioDownloaded = false;

    // Create write streams for video and audio
    const videoFile = fs.createWriteStream(`./output/${fileName}_video.mp4`);
    const audioFile = fs.createWriteStream(`./output/${fileName}_audio.mp3`);

    videoStream.pipe(videoFile);
    audioStream.pipe(audioFile);

    videoStream.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        // console.log(`Downloading video: ${(percent * 100).toFixed(2)}%`);
    });

    audioStream.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        // console.log(`Downloading audio: ${(percent * 100).toFixed(2)}%`);
    });

    videoStream.on('end', () => {
        console.log('Video download completed!');
        videoDownloaded = true;
        checkDownloadStatus();
    });

    audioStream.on('end', () => {
        console.log('Audio download completed!');
        audioDownloaded = true;
        checkDownloadStatus();
    });

    videoStream.on('error', (error) => {
        console.error('Error occurred during video download:', error);
    });

    audioStream.on('error', (error) => {
        console.error('Error occurred during audio download:', error);
    });

    function checkDownloadStatus() {
        if (videoDownloaded && audioDownloaded) {
            console.log('Both video and audio downloads completed!');
            mergeVideoAndAudio(fileName, start, stop, res);
        }
    }
};


const mergeVideoAndAudio = (fileName, start, stop, res) => {
    if (stop < start || isNaN(stop) || isNaN(start)) {
        res.send("Invalid input");
        return;
    }

    ffmpeg()
        .input(`./output/${fileName}_video.mp4`)
        .input(`./output/${fileName}_audio.mp3`)
        .setStartTime(start)
        .setDuration(stop - start)
        .output(`./output/${fileName}_trim.mp4`)
        .on('end', function (err) {
            if (!err) {
                console.log('Trimming Done');
                res.download(`./output/${fileName}_trim.mp4`, `${fileName}.mp4`, function (err) {
                    fs.unlinkSync(`./output/${fileName}_trim.mp4`);
                    fs.unlinkSync(`./output/${fileName}_video.mp4`);
                    fs.unlinkSync(`./output/${fileName}_audio.mp3`);
                });
            }
        })
        .on('error', err => console.log('Error during trimming: ', err))
        .run();
};


// const trimVideo = (fileName, start, stop, res) => {
//     if (stop < start || stop == NaN || start == NaN) {
//         res.send("invalid input");
//         return;
//     }
//     ffmpeg(`./output/${fileName}.mp4`)
//         .setStartTime(start)
//         .setDuration(stop - start)
//         .output(`./output/${fileName}_trim.mp4`)
//         .on('end', function (err) {
//             if (!err) {
//                 console.log('conversion Done');
//                 res.download(`./output/${fileName}_trim.mp4`, `${fileName}.mp4`, function (err) {
//                     fs.unlinkSync(`./output/${fileName}.mp4`);
//                     fs.unlinkSync(`./output/${fileName}_trim.mp4`);
//                 });
//             }
//         })
//         .on('error', err => console.log('error: ', err))
//         .run()
// }
console.log(port);
app.get('/download', (req, res) => {
    console.log(req.body);
    let url = req.query.url;
    let task_id = uuidv4();
    let start = req.query.start;
    let stop = req.query.stop;
    downloadVideo(url, `./output/${task_id}.mp4`, task_id, start, stop, res);
})

app.get('/', (req, res) => {
    res.send("<h1>it works<h1>");
})





