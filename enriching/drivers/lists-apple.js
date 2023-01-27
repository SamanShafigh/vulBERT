var { baseExtract } = require("./common.js");
const { cleanText, delay } = require("../../util.js");
const puppeteer = require('puppeteer');

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();

  // await page.goto(url);
  // await delay(2000);

  // let reportid = await page.$$eval('body', (nodes) => nodes.map((n) => n.innerText));
  // if (reportid.includes("403 Forbidden\nApple")) {
  //   await browser.close();

  //   return false;
  // }

  const detailParagraphs = document.querySelectorAll("pre");
  let description, impact;

  for (let content of detailParagraphs) {
    content = cleanText(content.textContent);
    if (content.includes(cveId)) {
      const segments = content.split('Impact: ')[1].split('Description: ')
      impact = cleanText(segments[0]);
      description = cleanText(segments[1]);
      break;
    }
  }

  if (!description && !impact) {
    return false;
  }

  return { description, impact };
};

exports.extract({ url: 'http://lists.apple.com/archives/security-announce/2008/Mar/msg00001.html', cveId: 'CVE-2008-0005'}).then(res => {
  console.log(res)
});
