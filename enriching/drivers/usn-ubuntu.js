var { baseExtract } = require("./common.js");
const { cleanText, makeQuerySelectors } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const { queryFromToSelector } = makeQuerySelectors(document);
  const canId = `CAN-${cveId.substring(1, 4)}`;

  const [title] = [
    document.querySelector("h1"), 
  ]
    .filter(e => e)
    .map(e => cleanText(e.textContent));

  let body;

  if (document.querySelector("#main-content")) {
    const detailSection = document.querySelector(".col-8");
    body = cleanText(detailSection.textContent);
  }
  
  if (!body) {
    const detailSection = document.querySelector(".col-8");
    const detailParagraphs = detailSection.querySelectorAll("p");

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
  }

  if (!body) {
    body = cleanText(queryFromToSelector('Details', 'Update instructions', '#details'));
  }

  return { title, body };
};

// exports.extract({ url: 'https://usn.ubuntu.com/4430-2/', cveId: 'CVE-2005-0469'}).then(res => {
//   console.log(res)
// });
