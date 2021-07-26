const urlUtil = require('url');
const { readJsonFileSync, writeJsonFileSync, existsSync, mkdirSync } = require('../util');

const { global: { 
  years, 
  rawDataPath,
  parsedDataPath,
  nvdUrl,
  cveUrl,
} } = require('../config.js');

const configName = '20';
const {
  references: referencesWhitelist,
  types: whitelistTypes,
} = readJsonFileSync(`./config-${configName}.json`);

const referencesList = {};
const summarizationData = {
  reportCount: {
    total: 0,
    withReferences: 0,
    withoutReferences: 0,
  },
  types: {},
  references: {},
  referencesDetail: {},
};

for (let year of years) {
  console.log(`Parsing ${year}`)
  const reportsData = {
    year,
    total: 0,
    references: {},
    reports: [],
  };
  
  const {CVE_Items: items} = readJsonFileSync(`../${rawDataPath}/${year}.json`);
  for (const item of items) {
    const types = item.cve.problemtype.problemtype_data.flatMap(({ description }) => 
      description.map(({ value }) => value)
    );

    const filteredTypes = types.filter(type => whitelistTypes[type] !== undefined);
    if (filteredTypes.length >= 1) {
      let filteredReferences = item.cve.references.reference_data
        .map(({ url }) => {
          const { hostname } = urlUtil.parse(url);
          const hostnameShort = hostname.replace("www.", "");

          return { hostname: hostnameShort, url }
        })
        .filter(({ hostname }) => referencesWhitelist[hostname]);

      const cveId = item.cve.CVE_data_meta.ID;
      const report = {
        cveId,
        types: filteredTypes,
        body: item.cve.description.description_data.map(({ value }) => value).join(''),
        impact: item.impact.baseMetricV3
            ? item.impact.baseMetricV3.impactScore
            : item.impact.baseMetricV2
              ? item.impact.baseMetricV2.impactScore
              : undefined,
        published_date: item.publishedDate,
        nvd: `${nvdUrl}${cveId}`,
        cve: `${cveUrl}?name=${cveId}`,
      };

      if (filteredReferences.length >= 1) {
        report.references = filteredReferences;
        report.enriched = false;
        summarizationData.reportCount.withReferences++;
        for (const {hostname} of report.references) {
          if (!reportsData.references[hostname]) {
            reportsData.references[hostname] = 0;
          }
          reportsData.references[hostname]++;
        }
      } else {
        summarizationData.reportCount.withoutReferences++;
      }
      reportsData.total++;
      summarizationData.reportCount.total++;
      reportsData.reports.push(report);

      summarization(
        summarizationData, 
        referencesList, 
        report
      );
    }
  }
  
  if (!existsSync(`../${parsedDataPath}/${configName}`)) {
    mkdirSync(`../${parsedDataPath}/${configName}`);
  }
  writeJsonFileSync(`../${parsedDataPath}/${configName}/${year}.json`, reportsData);
}

massager(summarizationData);
writeJsonFileSync(`../${parsedDataPath}/${configName}/summarization.json`, summarizationData);
writeJsonFileSync(`../${parsedDataPath}/${configName}/references.json`, referencesList);

function summarization(summarizationData, referencesList, report) {
  const { references, types, cveId } = report;

  if (references) {
    for (const { hostname, href } of references) {
      if (!referencesList[hostname]) {
        referencesList[hostname] = [];
      }
      if (referencesList[hostname].length < 10) {
        referencesList[hostname].push({
          cveId,
          reference: href, 
          nvd: `${nvdUrl}${cveId}`,
          cve: `${cveUrl}?name=${cveId}`,
        });
      }

      if (!summarizationData.references[hostname]) {
        summarizationData.references[hostname] = {count:0, example: []}
      }
      
      summarizationData.references[hostname].count = summarizationData.references[hostname].count + 1;
      if (summarizationData.references[hostname].example.length < 6) {
        summarizationData.references[hostname].example.push({
          enrichmentUrl: href,
          reportUrl: `${nvdUrl}${cveId}`,
        });
      }
    }
  }

  for (const type of types) {
    summarizationData.types[type] = summarizationData.types[type]
      ? summarizationData.types[type] + 1
      : 1;
  }
}

function massager(data) {
  let typeCount = 0;
  let referencesCount = 0;
  const { references, types } = data;

  const tempReferences = [];
  for (const url of Object.keys(references)) {
    tempReferences.push({ data: references[url], reference: url });
  }

  const tempTypes = [];
  for (const type of Object.keys(types)) {
    tempTypes.push({ count: types[type], type });
  }

  const sortFn = (a, b) => b.count - a.count;
  data.types = tempTypes.sort(sortFn).reduce((types, {type, count}) => {
    types[type] = count;
    typeCount++;
    return types;
  }, {});

  data.referencesDetail = tempReferences.sort(sortFn).reduce((ac, {reference, data}) => {
    ac[reference] = data;
    referencesCount++;
    return ac;
  }, {});

  data.references = tempReferences.sort(sortFn).reduce((ac, {reference, data}) => {
    ac[reference] = data.count;
    referencesCount++;
    return ac;
  }, {});

  data.typeCount = typeCount;
  data.referencesCount = referencesCount;
}
