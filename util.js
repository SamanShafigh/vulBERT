const fs = require('fs');

exports.readJsonFileSync = function readJsonFileSync(url, options = {}) {
  return JSON.parse(fs.readFileSync(url, options));
}

exports.writeJsonFileSync = function writeJsonFileSync(url, data) {
  return fs.writeFileSync(url, JSON.stringify(data, null, 2));
}

exports.mkdirSync = function mkdirSync(url, options = { recursive: true }) {
  return fs.mkdirSync(url, options);
}

exports.existsSync = function existsSync(url) {
  return fs.existsSync(url);
}

exports.cleanText = function cleanText(text) {
  return text.replace(/\r?\n|\r|\t/g, "").replace(/\s+/g,' ').trim();
}

exports.delay = function delay(time) {
  return new Promise((res) => setTimeout(res, time));
}

exports.makeQuerySelectors = function makeQuerySelectors(document) {
  const querySelectorContains = (selector, text) => {
    var elements = document.querySelectorAll(selector);
  
    return Array.prototype.filter.call(elements, function(element){
      return RegExp(text).test(element.textContent);
    });
  };

  const queryFromToSelector = (from, to, selector, levelUp = 0) => {
    const body = [];
    let node = querySelectorContains(selector, from)[0];
    for (let i = 0; i < levelUp; i++) {
      node = node.parentElement;
    }

    node = node.nextSibling;
    while (node.textContent !== to && node.nextSibling) {
      body.push(node.textContent);
      node = node.nextSibling;
    }
    return body.join(' ');
  }

  return {
    querySelectorContains,
    queryFromToSelector
  }
}