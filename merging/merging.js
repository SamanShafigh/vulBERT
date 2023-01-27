const { readJsonFileSync, writeCSVFileSync, writeJsonFileSync, getReferenceReportNormalisedData, getReferenceReportId } = require('../util');
const { global: { 
  years,
  top5VulnerabilityTypes,
  top10VulnerabilityTypes,
  top20VulnerabilityTypes,
  enrichedDataPath,
  referencesConfig,
  mergedDataPath 
} } = require('../config.js');

function mergeInit() {
  // Initialising the Merging files
  for (let reference of Object.keys(referencesConfig)) {
    const symbol = referencesConfig[reference].symbol;
    writeJsonFileSync(`../${mergedDataPath}/${symbol}.json`, {});
  }
  for (let year of years) {
    writeJsonFileSync(`../${mergedDataPath}/${year}.json`, {});
  } 

  // Generating the Merging files
  for (let year of years) {
    console.log(`Merging ${year}`)
    
    const referencesData = {}

    const data = readJsonFileSync(`../${enrichedDataPath}/${year}/enriched.json`);
    for (let referenceDomain of Object.keys(data.references)) {
      const symbol = referencesConfig[referenceDomain].symbol;
      referencesData[symbol] = readJsonFileSync(`../${enrichedDataPath}/${year}/enriched/${symbol}.json`);
    }

    const newReports = [];
    for (let report of data.reports) {
      const newReport = {...report};
      const newReportReferences = [];
      for (let reference of newReport.references) {
        if (referencesData[reference.symbol]) {
          const referencesDataForOneReport = referencesData[reference.symbol].reports[newReport.cveId];
          if (referencesDataForOneReport) {
            const [referenceData] = referencesDataForOneReport.filter(({url}) => url === reference.url);
            if (referenceData) {

              const normReferenceData = getReferenceReportNormalisedData(referenceData);
              if (isValidReferenceReport(normReferenceData)) {
                const referenceReportId = getReferenceReportId(normReferenceData);
                const newReportReference = {
                  url: referenceData.url,
                  symbol: reference.symbol,
                  id: referenceReportId,
                };
        
                newReportReferences.push(newReportReference);
              }
            }
          }
        }
      }
      newReport.references = newReportReferences;
      newReports.push(newReport);
    }
    data.reports = newReports;

    for (let referenceDomain of Object.keys(data.references)) {
      const symbol = referencesConfig[referenceDomain].symbol;
      const referenceData = referencesData[symbol];
      const mergedReferenceData = readJsonFileSync(`../${mergedDataPath}/${symbol}.json`);

      for (let cveId of Object.keys(referenceData.reports)) {
        const referenceReports = referenceData.reports[cveId];

        for (let referenceReport of referenceReports) {
          const normReferenceReport = getReferenceReportNormalisedData(referenceReport);
          if (isValidReferenceReport(normReferenceReport)) {
            const referenceReportId = getReferenceReportId(normReferenceReport);

            if (!mergedReferenceData[referenceReportId]) {
              mergedReferenceData[referenceReportId] = {
                ...normReferenceReport, cveIds:[], cveIdsCount:0
              };
            }

            mergedReferenceData[referenceReportId].cveIds.push(cveId);
            mergedReferenceData[referenceReportId].cveIdsCount++;
          }
        }
      }

      writeJsonFileSync(`../${mergedDataPath}/${symbol}.json`, mergedReferenceData); 
    }

    writeJsonFileSync(`../${mergedDataPath}/${year}.json`, data); 
  }
}

function isValidReferenceReport({body}) {
  return body !== undefined && body !== null && body !== "";
}


function mergeToTypes({
  includeReferences,
  validTypes,
  outputFileName,
  makeOneVsRestDatasetType,
}) {
  const info = {
    numberOfNvdReports: 0,
    numberOfReferences: 0,
    oneVsRest: false,
    types: {},
    reports: []
  };
  let csvData = "";
  writeJsonFileSync(`../${mergedDataPath}/${outputFileName}.json`, {});

  for (let year of years) {
    console.log(`Merging to types ${year}`)
    
    const referencesData = {};
    const data = readJsonFileSync(`../${mergedDataPath}/${year}.json`);
    if (includeReferences) {
      for (let referenceDomain of Object.keys(data.references)) {
        const symbol = referencesConfig[referenceDomain].symbol;
        referencesData[symbol] = readJsonFileSync(`../${mergedDataPath}/${symbol}.json`);
      }
    }

    for (let report of data.reports) {
      if (report.types.length > 1) {
        continue;
      }

      const vulnerabilityType = report.types[0];
      let classLabel = validTypes[vulnerabilityType];
      if (makeOneVsRestDatasetType) {
        classLabel = vulnerabilityType === makeOneVsRestDatasetType? 1 : 0;
      }

      if (validTypes[vulnerabilityType] === undefined) {
        continue;
      }

      if (!info.types[vulnerabilityType]) {
        info.types[vulnerabilityType] = {
          count: 0,
          label: classLabel,
        };
      }

      info.types[vulnerabilityType].count++;
      info.oneVsRest = makeOneVsRestDatasetType;

      const impact = report.impact;
      const newReport = {
        title: "",
        body: report.body,
        id: report.cveId,
        url: report.nvd,
        year: year,
        impact,
        vulnerabilityType,
        label: classLabel,
      };
      csvData = csvData + `${report.body}, ${classLabel} \n`; 

      if (includeReferences) {
        newReport.isNvdReport = true;
        newReport.referencesId = [];
      }

      if (includeReferences) {
        for (let reference of report.references) {
          if (referencesData[reference.symbol]) {
            const referenceData = referencesData[reference.symbol][reference.id];
            if (referenceData && referenceData.cveIdsCount === 1) {
              const newRefrenceReport = {
                title: referenceData.title,
                body: referenceData.body,
                id: reference.id,
                url: reference.url,
                year: year,
                impact,
                vulnerabilityType,
                isNvdReport: false,
                referencesId: [],
                label: classLabel,
              };
              csvData = csvData + `${referenceData.body}, ${classLabel} \n`; 

              newReport.referencesId.push(reference.id);
              info.reports.push(newRefrenceReport);
              info.numberOfReferences++;
              info.types[vulnerabilityType].count++;
            }
          }
        }
      }

      info.reports.push(newReport);
      info.numberOfNvdReports++;
    }
  }

  writeJsonFileSync(`../${mergedDataPath}/${outputFileName}.json`, info); 
  writeCSVFileSync(`../${mergedDataPath}/${outputFileName}.csv`, csvData);
  console.log({...info, reports: undefined});
}

// To initiate and create initial files
// mergeInit();

// To merge all files to create a one merged dataset of all types with all r
mergeToTypes({
  includeReferences: true,
  validTypes: top5VulnerabilityTypes,
  outputFileName: 'top5_vul_dataset_all',
});


// To create all agains one
// mergeToTypes({
//   includeReferences: true,
//   validTypes: top20VulnerabilityTypes,
//   outputFileName: 'vul_dataset_ovr_top20_vs_CWE-476',
//   makeOneVsRestDatasetType: 'CWE-476'
// });

