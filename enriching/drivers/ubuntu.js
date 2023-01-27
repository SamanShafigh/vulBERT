var { baseExtract } = require("./common.js");
const { cleanText, makeQuerySelectors } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const h1Element = document.querySelector("h1");
  if (h1Element && h1Element.textContent.includes('404: Page not found')) {
    return false;
  }

  const { queryFromToSelector } = makeQuerySelectors(document);
  const canId = `CAN-${cveId.substring(1, 4)}`;

  const [title] = [
    document.querySelector("h1"), 
  ]
    .filter(e => e)
    .map(e => cleanText(e.textContent));

  const detailSection = document.querySelector(".col-8");
  const detailParagraphs = detailSection.querySelectorAll("p");
  let body;
  
  for (const detailParagraph of detailParagraphs) {
    const a = detailParagraph.querySelector("a");
    if (a && (a.textContent.includes(cveId) || a.textContent.includes(canId))) {
      body = cleanText(detailParagraph.textContent);
      break;
    } else if (detailParagraph.textContent.includes(cveId)) {
      body = cleanText(detailParagraph.textContent);
      break;
    }
  }

  if (!body) {
    body = cleanText(queryFromToSelector('Details', 'Update instructions', 'h2'));
    //cleanText(detailSection.textContent.replace(`Details\n`, ''));
  }

  return { title, body };
};

// exports.extract({ url: 'http://www.ubuntu.com/usn/usn-354-1', cveId: 'CAN-2005-3108'}).then(res => {
//   console.log(res)
// });
