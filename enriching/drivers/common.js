const Crawler = require("crawler");
const { JSDOM } = require('jsdom');

const defaultConfig = {
  maxConnections: 10,
};

exports.baseExtract = function baseExtract({ url, config = {}, jsdom }) {
  return new Promise((resolve, reject) => {
    const crawler = new Crawler({
      ...defaultConfig,
      ...config,
      callback : function (error, { $, body }, done) {
          done();
          if (error) {
            reject(error);
          } else {
            resolve(jsdom? (new JSDOM(body)).window.document : $);
          }
      }
    });

    setTimeout(() => crawler.queue(url), Math.round(Math.random() * 5));
  });
}
