const { baseExtract } = require("./common.js");
const { makeQuerySelectors, cleanText } = require("../../util.js");

exports.extract = async function extract({ url }) {
  const document = await baseExtract({ url, jsdom: true });
  const { 
    queryFromToSelector,
    querySelectorContains,
  } = makeQuerySelectors(document);

  let body = '';
  let extra = '';
  const title = document.querySelector("h2").textContent;
  try {
    if (document.querySelector("#executive-summary")) {
      body = cleanText(queryFromToSelector('Executive Summary', 'Affected Software', '#executive-summary'));
    } else if (querySelectorContains('strong', 'Tested Software and Security Update Download Locations:')[0]) {
      body = cleanText(queryFromToSelector('Summary', 'Tested Software and Security Update Download Locations:', '#summary'));
      extra = cleanText(queryFromToSelector('Executive Summary:', 'Severity Ratings and Vulnerability Identifiers:', 'strong', 1));
    } else if (document.querySelector("#technical-details")) {
      body = cleanText(queryFromToSelector('Summary', 'General Information', '#summary'));
      extra = cleanText(queryFromToSelector('Technical details', 'Mitigating factors:', '#technical-details'));
    } else if (document.querySelector("#summary")) {
      body = cleanText(queryFromToSelector('Summary', 'General Information', '#summary'));
      extra = cleanText(queryFromToSelector('Issue', 'Affected Software Versions', '#issue'));
    } else {
      body = cleanText(queryFromToSelector('Summary', 'Issue', 'strong', 1));
      extra = cleanText(queryFromToSelector('Issue', 'Affected Software Versions', 'strong', 1));
    }
  
    return { title, body, extra };
  } catch(e) {
    console.error(`Can not extract ${url}`)
    throw e;
  }
};

// exports.extract({ url: 'https://docs.microsoft.com/en-us/security-updates/securitybulletins/2015/ms15-001'}).then(res => {
//   console.log(res)
// })
