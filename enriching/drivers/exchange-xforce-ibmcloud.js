const { delay, cleanText } = require("../../util.js");
const puppeteer = require('puppeteer');

exports.extract = async function extract({ url }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);
  await delay(2000);

  const reportid = await page.$$eval('.reportid', (nodes) => nodes.map((n) => n.innerText));
  const description = await page.$$eval('.description', (nodes) => nodes.map((n) => n.innerText));

  await browser.close();

  return {
    title: cleanText(reportid.join('')),
    body: cleanText(description.join('')),
  };
};
