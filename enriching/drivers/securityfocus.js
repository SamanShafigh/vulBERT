var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url }) {
  const $ = await baseExtract({ url: `${url}/discuss` });
  const title = $(".title").text();
  const body = cleanText($("#vulnerability").text().replace(`\t${title}\n`, ''));

  return { title, body };
};
