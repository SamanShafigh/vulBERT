var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });

  const [title, subTitle, background, body, extra] = [
    document.querySelector(".first-header"), 
    document.querySelectorAll("p")[0], 
    document.querySelectorAll("p")[1], 
    document.querySelectorAll("p")[2], 
    document.querySelectorAll("p")[3]
  ]
    .filter(e => e)
    .map(e => cleanText(e.textContent));
  
  return { title, subTitle, background, body, extra, meta: { extraType: 'impact' } };
};

// exports.extract({ url: 'https://security.gentoo.org/glsa/200812-15'}).then(res => {
//   console.log(res)
// });
