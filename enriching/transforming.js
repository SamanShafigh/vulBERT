const { readJsonFileSync, writeJsonFileSync, mkdirSync, existsSync } = require('../util');
const { global: { years, enrichedDataPath, refrensesConfig } } = require('../config.js');

function transforming() {
  for (let year of years) {
    console.log(`Transformming ${year}`);
    const initReportsData = readJsonFileSync(`../${enrichedDataPath}/${year}/init.json`);
    const enrichedReportsData = readJsonFileSync(`../${enrichedDataPath}/${year}/enriched.json`);
    const hostnames = Object.keys(initReportsData.references);

    const path = `../${enrichedDataPath}/${year}/enriched`;
    if (!existsSync(path)) {
      mkdirSync(path);
    }

    const enriched = {};
    for (const hostname of hostnames) {
      enriched[hostname] = {
        year,
        total: 0,
        reference: hostname,
        reports: {},
      };
    }

    const setReports = (data) => {
      for (const report of data.reports) {
        report.enriched = undefined;
        for (const ref of report.references) {
          if (ref.enriched) {
            if (!enriched[ref.hostname].reports[report.cveId]) {
              enriched[ref.hostname].reports[report.cveId] = [];
            }
            if (!enriched[ref.hostname].reports[report.cveId].find(e => e.url === ref.url)) {
              enriched[ref.hostname].reports[report.cveId].push({
                ...ref,
                hostname: undefined,
                enriched: undefined,
              });
            }
          }
          ref.body = undefined;
          ref.title = undefined;
          ref.extra = undefined;
        }
      }
    }

    setReports(enrichedReportsData)
    setReports(initReportsData)

    for (const hostname of hostnames) {
      const { symbol } = refrensesConfig[hostname];
      enriched[hostname].total = Object.keys(enriched[hostname].reports).length;
      if (symbol) {
        writeJsonFileSync(`${path}/${symbol}.json`, enriched[hostname]);
      } else {
        throw new Error(`Refrense ${hostname} is not supported`);
      }
    }

    writeJsonFileSync(`../${enrichedDataPath}/${year}/enriched.json`, enrichedReportsData);
    writeJsonFileSync(`../${enrichedDataPath}/${year}/init.json`, initReportsData);
  }
}

transforming();
