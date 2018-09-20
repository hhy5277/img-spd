// image spider (google ver.)
const puppeteer = require("puppeteer");
const path = require("path");
const { promisify } = require("util");
const http = require("http");
const https = require("https");
const fs = require("fs");

const folder = "/download";
const target = path.join(__dirname, folder);
if (!fs.existsSync(target)) {
  fs.mkdirSync(target);
}

// url => image
const url2Img = promisify((url, dir, callback) => {
  const mod = /^https:/.test(url) ? https : http;
  const ext = path.extname(url);
  const file = path.join(dir, `${Date.now()}${ext}`);

  mod.get(url, res => {
    res.pipe(fs.createWriteStream(file)).on("finish", () => {
      callback();
      console.log(file);
    });
  });
});

// base64 => image
const base642Img = async function(base64Str, dir) {
  // data:image/jpeg;base64,/asdasda

  const matches = base64Str.match(/^data:(.+?);base64,(.+)$/);
  try {
    const ext = matches[1].split("/")[1].replace("jpeg", "jpg");
    const file = path.join(dir, `${Date.now()}.${ext}`);

    await fs.writeFile(file, matches[2], "base64", err => {
      err ? console.log("write file error: ", err) : null;
    });
    console.log(file);
  } catch (ex) {
    console.log("非法 base64 字符串");
    console.log(ex);
  }
};

const convert2Img = async (src, dir) => {
  if (/^https:/.test(src)) {
    await url2Img(src, dir);
  } else {
    console.log("======src======:", src.slice(0, 50));
    await base642Img(src, dir);
  }
};

const autoScroll = async page => {
  console.log("scrolling this page to the footer...");
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 100;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 200);
    });
  });
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://www.google.com/imghp?hl=zh-CN");
  console.log("go to https://www.google.com/imghp?hl=zh-CN");

  await page.focus("#lst-ib");
  await page.keyboard.sendCharacter("狗");
  await page.waitFor("#mKlEF");
  await page.click("#mKlEF");
  console.log("go to search list");

  page.on("load", async () => {
    await autoScroll(page);

    console.log("page loading done, start fetch...");

    const srcs = await page.evaluate(() => {
      const images = document.querySelectorAll("img.rg_ic");
      return Array.prototype.map.call(images, img => img.src);
    });
    console.log(`get ${srcs.length} images, start download`);

    for (let i = 0; i < srcs.length; i++) {
      // sleep
      await page.waitFor(Math.random() * 5000 + 5000);
      await convert2Img(srcs[i], target);
      console.log(`finished ${i + 1}/${srcs.length} images`);
    }

    console.log(`job finished!`);
    await browser.close();
  });
})();
