var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const [title, description] = [
    document.querySelector("#short_desc_nonedit_display"), 
    document.querySelector(".bz_first_comment").querySelector(".bz_comment_text"), 
  ]
    .filter(e => e)
    .map(e => cleanText(e.textContent));
  
  // const comments = [];
  // for (const commentElement of document.querySelectorAll(".bz_comment_text")) {
  //   comments.push(cleanText(commentElement.textContent));
  // }
  // comments.shift();

  return { title, description };
};

// exports.extract({ url: 'https://bugzilla.redhat.com/show_bug.cgi?id=962531' }).then(res => {
//   console.log(res)
// });
