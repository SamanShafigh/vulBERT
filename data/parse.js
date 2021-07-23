const urlUtil = require('url');
const fs = require('fs');

const configName = '82';
const years = [
  2002, 
  2003, 2004, 2005,
  2006, 2007, 2008, 2009,
  2010, 2011, 2012, 2013,
  2014, 2015, 2016, 2017,
  2018, 2019, 2020, 2021
];

const whitelistData = fs.readFileSync(`./whitelist-${configName}.json`);
const {
  references: referencesWhitelist,
  types: whitelistTypes,
  referencesWhitelisting,
} = JSON.parse(whitelistData);

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

for (let year of years.reverse()) {
  console.log(`Parsing ${year}`)
  const reportsData = {
    year,
    total: 0,
    references: {},
    reports: [],
  };
  
  const rawdata = fs.readFileSync(`./raw/${year}.json`);
  const {CVE_Items: items} = JSON.parse(rawdata);
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
        cve_id: cveId,
        types: filteredTypes,
        body: item.cve.description.description_data.map(({ value }) => value).join(''),
        impact: item.impact.baseMetricV3
            ? item.impact.baseMetricV3.impactScore
            : item.impact.baseMetricV2
              ? item.impact.baseMetricV2.impactScore
              : undefined,
        published_date: item.publishedDate,
        nvd: `https://nvd.nist.gov/vuln/detail/${cveId}`,
        cve: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveId}`,
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
  
  fs.writeFile(`./parsed-${configName}/nvd-${year}.json`, JSON.stringify(reportsData, null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
}

massager(summarizationData);
fs.writeFile(`./parsed-${configName}/nvd-summarization-${configName}.json`, JSON.stringify(summarizationData, null, 2), (err) => {
  if (err) throw err;
  console.log('Data written to file');
});
fs.writeFile(`./parsed-${configName}/nvd-references-${configName}.json`, JSON.stringify(referencesList, null, 2), (err) => {
  if (err) throw err;
  console.log('Data written to file');
});

function summarization(summarizationData, referencesList, report) {
  const { references, types, cve_id } = report;

  if (references) {
    for (const { hostname, href } of references) {
      if (!referencesList[hostname]) {
        referencesList[hostname] = [];
      }
      if (referencesList[hostname].length < 10) {
        referencesList[hostname].push({
          cve_id,
          reference: href, 
          nvd: `https://nvd.nist.gov/vuln/detail/${cve_id}`,
          cve: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve_id}`,
        });
      }

      if (!summarizationData.references[hostname]) {
        summarizationData.references[hostname] = {count:0, example: []}
      }
      
      summarizationData.references[hostname].count = summarizationData.references[hostname].count + 1;
      if (summarizationData.references[hostname].example.length < 6) {
        summarizationData.references[hostname].example.push({
          enrichmentUrl: href,
          reportUrl: `https://nvd.nist.gov/vuln/detail/${cve_id}`,
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
  const { references, types } = data;
  let referencesCount = 0;
  let typeCount = 0;

  const tempReferences = [];
  for (const url of Object.keys(references)) {
    tempReferences.push({
      data: references[url],
      reference: url,
    })
  }

  const tempTypes = [];
  for (const type of Object.keys(types)) {
    tempTypes.push({
      count: types[type],
      type,
    })
  }

  data.types = tempTypes.sort((a, b) => b.count - a.count).reduce((types, {type, count}) => {
    types[type] = count;
    typeCount++;
    return types;
  }, {});

  data.referencesDetail = tempReferences.sort((a, b) => b.data.count - a.data.count).reduce((references, {reference, data}) => {
    references[reference] = data;
    referencesCount++;
    return references;
  }, {});

  data.references = tempReferences.sort((a, b) => b.data.count - a.data.count).reduce((references, {reference, data}) => {
    references[reference] = data.count;
    referencesCount++;
    return references;
  }, {});

  data.typeCount = typeCount;
  data.referencesCount = referencesCount;
}
