var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const dl = document.querySelector("dl");

  let body = '';
  const securityDatabaseReferencesSection = dl.children[7];
  const securityDatabaseReferences = securityDatabaseReferencesSection.querySelectorAll("a");
  const moreInfo = dl.children[9];

  if (securityDatabaseReferences.length === 1) {
    body = cleanText(moreInfo.textContent);
  } else {
    const ul = moreInfo.querySelector("ul");
    if (ul) {
      for (const li of ul.children) {
        if (li.querySelector("a").textContent === cveId) {
          body = cleanText(li.querySelector("p").textContent);
          break;
        }
      }
    } else {
      body = cleanText(moreInfo.textContent);
    }
  }

  return { title: '', body };
};

// exports.extract({ url: 'https://www.debian.org/security/2005/dsa-705', cveId: 'CVE-2005-0256' }).then(res => {
//   console.log(res)
// });
