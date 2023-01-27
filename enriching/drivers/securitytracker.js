var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const bodyElement = document.querySelector("body");
  if (bodyElement && bodyElement.textContent.includes('The requested page could not be found')) {
    return false;
  }

  const table = document.querySelectorAll("table")[5];
  const bodyTable = table.children[0].children[0].children[3].children[2];
  const title = cleanText(bodyTable.children[0].children[0].textContent);
  let body = '';
  let extra = '';

  for (const tr of bodyTable.children[0].children) {
    const content = tr.textContent;
    if (content.substring(1, 13) === 'Description:') {
      body = cleanText(content.replace('Description:', ''));
    } else if (content.substring(1, 8) === 'Impact:') {
      extra = cleanText(content.replace('Impact:', ''));
    }    
  }
  
  return { title, body, extra, meta: { extraType: 'impact' } };
};

// exports.extract({ url: 'https://securitytracker.com/id?1014150'}).then(res => {
//   console.log(res)
// });
