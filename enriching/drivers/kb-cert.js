var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const tables = document.querySelectorAll(".wrapper-table");

  const [title, overview, description, impact] = [
    document.querySelector(".subtitle"), 
    document.querySelector(".vulcontent"), 
    tables[0],
    tables[1],
  ]
    .filter(e => e)
    .map(e => cleanText(e.textContent));

  return { title, overview, description, impact };
};

// exports.extract({ url: 'https://www.kb.cert.org/vuls/id/172583', cveId: 'CAN-2005-3108'}).then(res => {
//   console.log(res)
// });
