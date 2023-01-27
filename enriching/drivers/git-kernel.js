var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });

  const errorSection = document.querySelector(".error");
  if (errorSection && errorSection.textContent.includes("No repositories found")) {
    return { notValid: true }
  }

  const [title, description] = [
    document.querySelector(".commit-subject"), 
    document.querySelector(".commit-msg"), 
  ]
    .filter(e => e)
    .map(e => cleanText(e.textContent));

  return { title, description };
};

// exports.extract({ url: 'https://git.kernel.org/pub/scm/linux/kernel/git/tytso/ext4.git/commit/?id=4a58579b9e4e2a35d57e6c9c8483e52f6f1b7fd6'}).then(res => {
//   console.log(res)
// });
