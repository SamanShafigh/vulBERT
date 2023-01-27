var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const h1 = document.querySelector("h1");
  if (h1 && h1.textContent == 'Page not found') {
    return false;
  }

  let body = '';
  const dl = document.querySelector("dl");
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

// exports.extract({ url: 'https://www.debian.org/security/2018/dsa-4187', cveId: 'CVE-2017-0861' }).then(res => {
//   console.log(res)
// });
