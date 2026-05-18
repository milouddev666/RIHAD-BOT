const { spawn } = require("child_process");
const axios = require("axios");
const logger = require("./utils/log");
const express = require("express");
const path = require("path");

// ==================== Package Info ====================
let pkg = {};
try {
    pkg = require(path.join(__dirname, "package.json"));
} catch (err) {
    logger(`Failed to load package.json: ${err.message}`, "[ Error ]");
}

const BOT_NAME = pkg.name || "Islamick Bot";
const BOT_VERSION = pkg.version || "5.0.0";
const BOT_DESC = pkg.description || "Islamick Chat Bot";

// ==================== Express Server ====================
const app = express();

// مهم: يخلي index.html + الملفات الثابتة تشتغل
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// مهم جدًا: لا تتركه undefined
const port = process.env.PORT || 8080;

app.listen(port, () => {
    logger(`Server running on port ${port}`, "[ Starting ]");
}).on("error", (err) => {
    logger(`Server error: ${err.message}`, "[ Error ]");
});

// ==================== BOT START ====================
global.countRestart = global.countRestart || 0;

function startBot(message) {
    if (message) logger(message, "[ Starting ]");

    const child = spawn("node", ["Cyber.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (code) => {
        if (code !== 0 && global.countRestart < 5) {
            global.countRestart++;
            logger(`Bot crashed (${code}). Restarting ${global.countRestart}/5`, "[ Restart ]");
            startBot();
        } else {
            logger("Bot stopped permanently", "[ Stop ]");
        }
    });

    child.on("error", (err) => {
        logger(`Spawn error: ${err.message}`, "[ Error ]");
    });
}

// ==================== INFO ====================
logger(BOT_NAME, "[ NAME ]");
logger(BOT_VERSION, "[ VERSION ]");
logger(BOT_DESC, "[ DESC ]");

// ==================== UPDATE CHECK ====================
axios.get("https://raw.githubusercontent.com/cyber-ullash/cyber-bot/main/data.json")
    .then(res => {
        logger(res.data.name, "[ UPDATE NAME ]");
        logger(res.data.version, "[ UPDATE VERSION ]");
    })
    .catch(err => {
        logger(`Update check failed: ${err.message}`, "[ UPDATE ERROR ]");
    });

// ==================== START ====================
startBot();
