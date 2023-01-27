const { delay, cleanText } = require("../../util.js");
const puppeteer = require('puppeteer');

exports.extract = async function extract({ url }) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url);
  await delay(2000);

  let reportid = await page.$$eval('h1', (nodes) => nodes.map((n) => n.innerText));
  let description = await page.$$eval('#executiveSummary', (nodes) => nodes.map((n) => n.innerText));
  if (description === "") {
    await delay(1000);
    reportid = await page.$$eval('h1', (nodes) => nodes.map((n) => n.innerText));
    description = await page.$$eval('#executiveSummary', (nodes) => nodes.map((n) => n.innerText));
  }

  await browser.close();

  return {
    title: cleanText(reportid.join('')),
    body: cleanText(description.join('').replace('Executive Summary', '')),
  };
};

// exports.extract({ url: 'https://msrc.microsoft.com/update-guide/en-US/vulnerability/CVE-2017-0055' }).then(res => {
//   console.log(res)
// });
