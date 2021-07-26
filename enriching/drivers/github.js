var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url }) {
  const $ = await baseExtract({ url });
  const title = cleanText($(".commit-title").text());
  const body = cleanText($(".commit-desc").text().replace(`\t${title}\n`, ''));

  return { title, body };
};

// exports.extract({ url: 'https://github.com/torvalds/linux/commit/0b29669c065f60501e7289e1950fa2a618962358'}).then(res => {
//   console.log(res)
// });
