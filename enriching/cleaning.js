const { readJsonFileSync, writeJsonFileSync, mkdirSync, existsSync } = require('../util');
const { global: { years, enrichedDataPath, finalParsedDataPath, referencesConfig } } = require('../config.js');

function cleaning(initYear, cleaningSymbol) {
  for (let year of initYear? [initYear] : years) {
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

    // Cleaning deprecated refrences
    const finalReferences = {};
    for (const hostname of Object.keys(references)) {
      if (referencesConfig[hostname]) {
        if (cleaningSymbol) {
          if (referencesConfig[hostname].symbol !== cleaningSymbol) {
            finalReferences[hostname] = references[hostname];
          }
        } else {
          finalReferences[hostname] = references[hostname];
        }
      }
    }
    enrichedReports.references = finalReferences;
    initReports.references = finalReferences;

    for (const report of reports) {
      report.enriched = undefined;
      if (report.references) {
        let isFullyEnriched = true;
        report.references = report.references.filter(r => referencesConfig[r.hostname]);
        if (cleaningSymbol) {
          report.references = report.references.filter(r => referencesConfig[r.hostname].symbol !== cleaningSymbol);
        }

        for (const refrence of report.references) {
          const { symbol } = referencesConfig[refrence.hostname];

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

function cleaningInit(initYear, cleaningSymbol) {
  for (let year of initYear? [initYear] : years) {
    console.log(`Parsing ${year}`)
    
    const data = readJsonFileSync(`../${enrichedDataPath}/${year}/init.json`);
    for (const report of data.reports) {
      const tempRreferences = [];
      for (const ref of report.references) {
        const { symbol } = referencesConfig[ref.hostname];        
        if (cleaningSymbol && cleaningSymbol === symbol) {
          if (ref && ref.enriched) {
            tempRreferences.push(ref);
          }
        } else {
          tempRreferences.push(ref);
        }
      }
      report.references = tempRreferences;
    }
    writeJsonFileSync(`../${enrichedDataPath}/${year}/init.json`, data); 
  }
}

// cleaning(process.env.YEAR, process.env.SYMBOL);
cleaningInit(process.env.YEAR, process.env.SYMBOL);
