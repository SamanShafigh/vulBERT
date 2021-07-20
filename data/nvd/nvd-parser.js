const urlUtil = require('url');
const fs = require('fs');

const configName = '20';
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
const referencesShortList = {};
const summarizationData = {
  references: {},
  types: {},
  reportCount: 0,
};

for (let year of years.reverse()) {
  console.log(`Parsing ${year}`)
  const reports = [];
  const rawdata = fs.readFileSync(`./raw/${year}.json`);
  const {CVE_Items: items} = JSON.parse(rawdata);
  for (const item of items) {
    const types = item.cve.problemtype.problemtype_data.flatMap(({ description }) => 
      description.map(({ value }) => value)
    );

    const filteredTypes = types.filter(type => whitelistTypes[type] !== undefined);
    if (filteredTypes.length >= 1) {
      const references = item.cve.references.reference_data.map(({ url }) => {
        const { hostname, href } = urlUtil.parse(url);
        const hostnameShort = hostname.replace("www.", "");

        return { href, hostname: hostnameShort }
      });

      let filteredReferences = references;
      if (referencesWhitelisting) {
        filteredReferences = references.filter(({ hostname }) => (
          referencesWhitelist[hostname] !== undefined && referencesWhitelist[hostname] > 999
        ));
      }

      if (!referencesWhitelisting || filteredReferences.length >= 1) {
        const report = {
          cve_id: item.cve.CVE_data_meta.ID,
          types: filteredTypes,
          references: filteredReferences,
          description: item.cve.description.description_data.map(({ value }) => value).join(''),
          impact: item.impact.baseMetricV3
              ? item.impact.baseMetricV3.impactScore
              : item.impact.baseMetricV2
                ? item.impact.baseMetricV2.impactScore
                : undefined,
          published_date: item.publishedDate,
        };
    
        reports.push(report);
        summarizationData.reportCount++;

        summarization(
          summarizationData, 
          referencesList, 
          referencesShortList,
          report
        );
      }
    }
  }
  
  fs.writeFile(`./parsed-${configName}/nvd-${year}.json`, JSON.stringify(reports, null, 2), (err) => {
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
fs.writeFile(`./parsed-${configName}/nvd-short-references-${configName}.json`, JSON.stringify(referencesShortList, null, 2), (err) => {
  if (err) throw err;
  console.log('Data written to file');
});

function summarization(summarizationData, referencesList, referencesShortList, report) {
  const { references, types, cve_id } = report;

  for (const { hostname, href } of references) {
    const hostnameShort = hostname.replace("www.", "");
    
    if (!referencesList[hostnameShort]) {
      referencesList[hostnameShort] = [];
      referencesShortList[hostnameShort] = [];
    }
    referencesList[hostnameShort].push({
      cve_id,
      reference: href, 
      nvd: `https://nvd.nist.gov/vuln/detail/${cve_id}`,
      cve: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve_id}`,
    });
    if (referencesShortList[hostnameShort].length < 2) {
      referencesShortList[hostnameShort].push({
        cve_id,
        reference: href, 
        nvd: `https://nvd.nist.gov/vuln/detail/${cve_id}`,
        cve: `https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cve_id}`,
      });
    }

    summarizationData.references[hostnameShort] = summarizationData.references[hostnameShort]
      ? summarizationData.references[hostnameShort] + 1
      : 1;
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
      count: references[url],
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

  data.references = tempReferences.sort((a, b) => b.count - a.count).reduce((references, {reference, count}) => {
    references[reference] = count;
    referencesCount++;
    return references;
  }, {});

  data.typeCount = typeCount;
  data.referencesCount = referencesCount;
}
