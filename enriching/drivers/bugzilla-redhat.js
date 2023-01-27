var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url, cveId }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const [title] = [
    document.querySelector("#short_desc_nonedit_display"), 
  ]
    .filter(e => e)
    .map(e => cleanText(e.textContent));
  
  const descriptionElement = document.querySelector(".bz_first_comment");
  if (descriptionElement) {
    description = cleanText(descriptionElement.textContent);
  } else {
    for (const commentElement of document.querySelectorAll(".bz_comment_text")) {
      description = cleanText(commentElement.textContent);
      break;
    }
  }

  // const comments = [];
  // for (const commentElement of document.querySelectorAll(".bz_comment_text")) {
  //   comments.push(cleanText(commentElement.textContent));
  // }
  // comments.shift();

  return { title, description };
};

// exports.extract({ url: 'https://bugzilla.redhat.com/show_bug.cgi?id=429149' }).then(res => {
//   console.log(res)
// });
