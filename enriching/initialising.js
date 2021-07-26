const { readJsonFileSync, writeJsonFileSync, mkdirSync, existsSync } = require('../util');
const { global: { years, enrichedDataPath, finalParsedDataPath, refrensesConfig } } = require('../config.js');

function initialising() {
  for (let year of years) {
    console.log(`Parsing ${year}`)
    const defaultReports = {
      year,
      total: 0,
      references: {},
      reports: [],
    };
    const enrichedReports = {...defaultReports, reports: []};
    const initReports = {...defaultReports, reports: []};
    const plainReports = {...defaultReports, references: undefined};
    
    const enrichedDataDB = {};
    const { reports, references } = readJsonFileSync(`../${finalParsedDataPath}/${year}.json`);

    enrichedReports.references = references;
    initReports.references = references;

    for (const report of reports) {
      report.enriched = undefined;
      if (report.references) {
        let isFullyEnriched = true;
        for (const refrence of report.references) {
          const { symbol } = refrensesConfig[refrence.hostname];

          if (!enrichedDataDB[symbol]) {
            enrichedDataDB[symbol] = readJsonFileSync(`../${enrichedDataPath}/${year}/enriched/${symbol}.json`);
          }
          const enrichedData = enrichedDataDB[symbol];

          refrence.enriched = false;
          refrence.symbol = symbol;
          if (enrichedData.reports[report.cveId] && enrichedData.reports[report.cveId].find(({ url }) => url === refrence.url)) {
            refrence.enriched = true;
          } else {
            isFullyEnriched = false;
          }
        }

        if (isFullyEnriched) {
          enrichedReports.reports.push(report);
          enrichedReports.total++;
        } else {
          initReports.reports.push(report);
          initReports.total++;
        }
      } else {
        plainReports.total++;
        plainReports.reports.push(report);
      }
    }

    if (!existsSync(`../${enrichedDataPath}/${year}`)) {
      mkdirSync(`../${enrichedDataPath}/${year}`);
    }

    writeJsonFileSync(`../${enrichedDataPath}/${year}/plain.json`, plainReports); 
    writeJsonFileSync(`../${enrichedDataPath}/${year}/init.json`, initReports); 
    writeJsonFileSync(`../${enrichedDataPath}/${year}/enriched.json`, enrichedReports); 
  }   
}

initialising();
