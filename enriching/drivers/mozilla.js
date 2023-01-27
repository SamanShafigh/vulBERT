var { baseExtract } = require("./common.js");
const { cleanText, makeQuerySelectors } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const canId = `CAN-${cveId.substring(1, 4)}`;

  const { 
    queryFromToSelector,
    querySelectorContains,
  } = makeQuerySelectors(document);


  const sections = document.querySelectorAll("section");
  let title;
  let description;
  
  for (const section of sections) {
    const heading = section.querySelector(".level-heading");
    if (heading && (heading.textContent.includes(cveId) || heading.textContent.includes(canId))) {
      const descriptionElement = section.querySelector("p");
      description = cleanText(descriptionElement.textContent);
      break;
    }
  }

  if (!description) {
    title = cleanText(document.querySelector("h2").textContent);
    const workaroundElement = querySelectorContains('Workaround', 'h3')[0];
    if (workaroundElement) {
      description = cleanText(queryFromToSelector('Description', 'Workaround', 'h3'));
    } else {
      description = cleanText(queryFromToSelector('Description', 'References', 'h3'));
    }
  }

  return { title, description };
};

// exports.extract({ url: 'https://www.mozilla.org/en-US/security/advisories/mfsa2018-15/', cveId: 'CVE-2018-12369' }).then(res => {
//   console.log(res)
// });
