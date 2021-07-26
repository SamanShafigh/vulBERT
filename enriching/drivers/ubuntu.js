var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });

  const [title] = [
    document.querySelector("h1"), 
  ]
    .filter(e => e)
    .map(e => cleanText(e.textContent));

  const section = document.querySelector("section");
  const detailSection = section.querySelector(".col-8");
  const detailParagraphs = detailSection.querySelectorAll("p");
  let body;
  
  for (const detailParagraph of detailParagraphs) {
    const a = detailParagraph.querySelector("a");
    if (a && a.textContent === cveId) {
      body = cleanText(detailParagraph.textContent);
      break;
    } else if (detailParagraph.textContent.includes(cveId)) {
      body = cleanText(detailParagraph.textContent);
      break;
    }
  }

  if (!body) {
    body = cleanText(detailSection.textContent.replace(`Details\n`, ''));
  }

  return { title, body };
};

// exports.extract({ url: 'https://ubuntu.com/security/notices/USN-199-1', cveId: 'CAN-2005-3108'}).then(res => {
//   console.log(res)
// });
