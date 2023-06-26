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
const port = process.env.PORT || 4000;
app.listen(port);
app.use(bodyParser.json())
app.use(cors());

const downloadVideo = (url, filePath, fileName, start, stop, res) => {
    const videoStream = ytdl(url);

    videoStream.pipe(fs.createWriteStream(filePath));

    videoStream.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total;
        // console.log(`Downloading: ${(percent * 100).toFixed(2)}%`);
    });

    videoStream.on('end', () => {
        console.log('Download completed!');
        trimVideo(fileName, start, stop, res);
    });

    videoStream.on('error', (error) => {
        console.error('Error occurred during download:', error);
    });
};

const trimVideo = (fileName, start, stop, res) => {
    if (stop < start || stop == NaN || start == NaN) {
        res.send("invalid input");
        return;
    }
    ffmpeg(`./output/${fileName}.mp4`)
        .setStartTime(start)
        .setDuration(stop - start)
        .output(`./output/${fileName}_trim.mp4`)
        .on('end', function (err) {
            if (!err) {
                console.log('conversion Done');
                res.download(`./output/${fileName}_trim.mp4`, `${fileName}.mp4`, function (err) {
                    fs.unlinkSync(`./output/${fileName}.mp4`);
                    fs.unlinkSync(`./output/${fileName}_trim.mp4`);
                });
            }
        })
        .on('error', err => console.log('error: ', err))
        .run()
}

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





