// const puppeteer = require("puppeteer");

// let scrape = async () => {
//   const browser = await puppeteer.launch({ headless: false });
//   const page = await browser.newPage();

//   await page.goto("http://jd.com/");
//   await page.focus("#key");
//   await page.keyboard.sendCharacter("javascript");
//   await page.click(".button");
//   // await page.keyboard.press("Enter");
//   console.log("go to search list");

//   page.on("load", async () => {
//     console.log("search list loaded!");

//     const elements = await page.$$(".gl-item .p-name em");
//     console.log('TCL: scrape -> elements', elements[0].innerText);
    

//     // await page.evaluate(() => {
//     //   const result = [];
//     //   console.log("page.evaluate");
//     //   let elements = document.querySelectorAll(".gl-item .p-name em"); // 获取所有书籍元素
//     //   console.log('elements',elements);
//     //   [...elements].forEach(i => result.push(i.innerText));
//     //   return result;
//     // });
//   });
// };

// scrape()

const puppeteer = require('puppeteer');

let scrape = async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();

  await page.goto('https://search.jd.com/Search?keyword=javascript&enc=utf-8&suggest=1.def.0.V10&wq=javasc&pvid=6a337c856f6745408e5def16df521412');

  const result = await page.evaluate(() => {
      let data = []; // 初始化空数组来存储数据
      let elements = document.querySelectorAll('.gl-item .p-name em'); // 获取所有书籍元素

      for (var element of elements){ // 循环
          let title = element.innerText; // 获取标题
          // let price = element.childNodes[7].children[0].innerText; // 获取价格

          data.push({title}); // 存入数组
      }

      return data; // 返回数据
  });

  browser.close();
  return result;
};

scrape().then((value) => {
  console.log(value); // Success!
});