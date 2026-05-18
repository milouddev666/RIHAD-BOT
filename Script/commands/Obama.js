const fs = require("fs-extra");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports.config = {
    name: "obama",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "𝐂𝐘𝐁𝐄𝐑 ☢️_𖣘 -𝐁𝐎𝐓 ⚠️ 𝑻𝑬𝑨𝑴_ ☢️",
    description: "Obama Tweet post",
    commandCategory: "edit-img",
    usages: "[text]",
    cooldowns: 10,
    dependencies: {
        canvas: "",
        axios: "",
        "fs-extra": ""
    }
};

// ================= TEXT WRAP =================
module.exports.wrapText = (ctx, text, maxWidth) => {
    return new Promise(resolve => {
        if (ctx.measureText(text).width < maxWidth) return resolve([text]);
        if (ctx.measureText("W").width > maxWidth) return resolve(null);

        const words = text.split(" ");
        const lines = [];
        let line = "";

        while (words.length > 0) {
            let split = false;

            while (words[0] && ctx.measureText(words[0]).width >= maxWidth) {
                const temp = words[0];
                words[0] = temp.slice(0, -1);

                if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
                else {
                    split = true;
                    words.splice(1, 0, temp.slice(-1));
                }
            }

            if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) {
                line += `${words.shift()} `;
            } else {
                lines.push(line.trim());
                line = "";
            }

            if (words.length === 0) lines.push(line.trim());
        }

        resolve(lines);
    });
};

// ================= MAIN =================
module.exports.run = async function({ api, event, args }) {
    try {
        const { threadID, messageID } = event;

        let text = args.join(" ");
        if (!text)
            return api.sendMessage("❌ اكتب النص الذي تريد وضعه على الصورة", threadID, messageID);

        // إنشاء مجلد cache إذا غير موجود
        const cacheDir = __dirname + "/cache";
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        const pathImg = cacheDir + "/obama.png";

        // تحميل الصورة
        const imgData = await axios.get(
            "https://i.imgur.com/6fOxdex.png",
            { responseType: "arraybuffer" }
        );

        fs.writeFileSync(pathImg, imgData.data);

        // تجهيز canvas
        const baseImage = await loadImage(pathImg);
        const canvas = createCanvas(baseImage.width, baseImage.height);
        const ctx = canvas.getContext("2d");

        ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

        ctx.font = "45px Arial";
        ctx.fillStyle = "#000";
        ctx.textAlign = "start";

        // تصغير الخط إذا النص طويل
        let fontSize = 45;
        while (ctx.measureText(text).width > 1160) {
            fontSize--;
            ctx.font = `400 ${fontSize}px Arial`;
        }

        const lines = await this.wrapText(ctx, text, 1160);
        ctx.fillText(lines.join("\n"), 60, 165);

        const buffer = canvas.toBuffer();
        fs.writeFileSync(pathImg, buffer);

        return api.sendMessage(
            {
                attachment: fs.createReadStream(pathImg)
            },
            threadID,
            () => fs.unlinkSync(pathImg),
            messageID
        );

    } catch (err) {
        console.log("OBAMA ERROR:", err);
        return api.sendMessage(
            "❌ حصل خطأ في تنفيذ الأمر",
            event.threadID,
            event.messageID
        );
    }
};
