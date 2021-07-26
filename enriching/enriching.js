const { drivers } = require('./drivers');
const { global: { years, enrichedDataPath: path, refrensesConfig } } = require('../config');
const { readJsonFileSync, writeJsonFileSync } = require('../util');

async function enrich({ year, referenceSymbol }) {
  console.log(`Processing ${year}`);
  const { reports } = readJsonFileSync(`../${path}/${year}/init.json`);
  let count = reports.length;

  for (const report of reports) {
    count--;
    let hasEnreached = false;
    for (const ref of report.references) {
      const driver = drivers[ref.hostname];
      const { symbol } = refrensesConfig[ref.hostname];
      if (ref && !ref.enriched && driver && !ref.error && (!referenceSymbol || referenceSymbol === symbol)) {
        hasEnreached = true;
        try {
          const extractData = await driver.extract({ url: ref.url, cveId: report.cveId });

          const enrichedData = readJsonFileSync(`../${path}/${year}/enriched/${symbol}.json`);
          enrichedData.total++;

          if (!enrichedData.reports[report.cveId]) {
            enrichedData.reports[report.cveId] = [];
          }

          enrichedData.reports[report.cveId].push({
            url: ref.url,
            ...extractData,
          });
          
          writeJsonFileSync(`../${path}/${year}/enriched/${symbol}.json`, enrichedData);

          ref.enriched = true;
          console.log(`${year} - Enriched: ${report.cveId}, Symbol: ${referenceSymbol? referenceSymbol : 'N/A'}  Host: ${ref.hostname} Total left: ${count}`)
        } catch(e) {
          ref.error = true;
          console.error('Error: ', e);
        }
      }
    }

    if (hasEnreached) {
      processReport(report, year);
    }
  }
}

function processReport(report, year) {
  const notEnriched = report.references.filter(r => !r.enriched);
  const initData = readJsonFileSync(`../${path}/${year}/init.json`);
  const indexOfReport = initData.reports.findIndex(r => r.cveId === report.cveId);

  if (notEnriched.length === 0) {
    initData.total--;
    initData.reports.splice(indexOfReport, 1);

    const enrichedData = readJsonFileSync(`../${path}/${year}/enriched.json`);
    enrichedData.total++;
    enrichedData.reports.push(report);
    writeJsonFileSync(`../${path}/${year}/enriched.json`, enrichedData);
  } else {
    initData.reports[indexOfReport] = report;
  }

  writeJsonFileSync(`../${path}/${year}/init.json`, initData);
}

async function main() {
  if (process.env.YEAR) {
    await enrich({ 
      year: process.env.YEAR, 
      referenceSymbol: process.env.REF_SYMBOL 
    });
  } else {
    for (let year of years) {
      await enrich({ 
        year, 
        referenceSymbol: process.env.REF_SYMBOL 
      });
    } 
  }
}

main();
