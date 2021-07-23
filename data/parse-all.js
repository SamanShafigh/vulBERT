const urlUtil = require('url');
const fs = require('fs');

const years = [
  2002, 2003, 2004, 2005,
  2006, 2007, 2008, 2009,
  2010, 2011, 2012, 2013,
  2014, 2015, 2016, 2017,
  2018, 2019, 2020, 2021
];

const summarizationData = {
  reportCount: 0,
  types: {},
  references: {},
};

for (let year of years.reverse()) {
  console.log(`Parsing ${year}`)
  const reports = [];
  const rawdata = fs.readFileSync(`./raw/${year}.json`);
  const {CVE_Items: items} = JSON.parse(rawdata);
  for (const item of items) {
    const report = {
      cve_id: item.cve.CVE_data_meta.ID,
      types: item.cve.problemtype.problemtype_data.flatMap(({ description }) => 
        description.map(({ value }) => value)
      ),
      references: item.cve.references.reference_data.map(({ url }) => {
        const { hostname, href } = urlUtil.parse(url);
        const hostnameShort = hostname.replace("www.", "");

        return { href, hostname: hostnameShort }
      }),
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

    summarization(summarizationData, report);
  }
  
  fs.writeFile(`./parsed-all/nvd-${year}.json`, JSON.stringify(reports, null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
}

massager(summarizationData);
fs.writeFile(`./parsed-all/nvd-summarization.json`, JSON.stringify(summarizationData, null, 2), (err) => {
  if (err) throw err;
  console.log('Data written to file');
});

function summarization(data, report) {
  const { references, types } = report;

  for (const { hostname } of references) {
    data.references[hostname] = data.references[hostname]
      ? data.references[hostname] + 1
      : 1;
  }

  for (const type of types) {
    data.types[type] = data.types[type]
      ? data.types[type] + 1
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
