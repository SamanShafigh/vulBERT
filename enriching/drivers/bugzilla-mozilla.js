var { baseExtract } = require("./common.js");
const { cleanText } = require("../../util.js");

exports.extract = async function extract({ url }) {
  const document = await baseExtract({ url: `${url}`, jsdom: true });
  const [title] = [
    document.querySelector("#field-value-short_desc"), 
  ]
    .filter(e => e)
    .map(e => cleanText(e.textContent));
  
  const descriptionElement = document.querySelector(".comment-text");
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

// exports.extract({ url: 'https://bugzilla.mozilla.org/show_bug.cgi?id=443288' }).then(res => {
//   console.log(res)
// });
