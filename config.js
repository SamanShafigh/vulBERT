exports.global = {
  years: [
    2002, 
    2003, 2004, 2005,
    2006, 2007, 2008, 2009,
    2010, 2011, 2012, 2013,
    2014, 2015, 2016, 2017,
    2018, 2019, 2020, 2021
  ],
  rawDataPath: './data/raw',
  parsedDataPath: './data/parsed',
  finalParsedDataPath: './data/parsed/final',
  mergedDataPath: './data/merged',
  enrichedDataPath: './data/enriched',
  nvdUrl: 'https://nvd.nist.gov/vuln/detail',
  cveUrl: 'https://cve.mitre.org/cgi-bin/cvename.cgi',
  // https://cwe.mitre.org/top25/archive/2021/2021_cwe_top25.html
  // not Imbalanced, just for test
  top5VulnerabilityTypes: {
    "CWE-89": 0,  //  Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')  14.69   +4
    "CWE-79": 1, 
    "CWE-20": 2, 
    "CWE-264": 3, 
    "CWE-200": 4, 
  },
  top10VulnerabilityTypes: {
    "CWE-787": 0, // Out-of-bounds Write 65.93   +1
    "CWE-79": 1,  //  Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')    46.84   -1
    "CWE-125": 2, // Out-of-bounds Read  24.9    +1
    "CWE-20": 3,  //  Improper Input Validation   20.47   -1
    "CWE-78": 4,  //  Improper Neutralization of Special Elements used in an OS Command ('OS Command Injection')  19.55   +5
    "CWE-89": 5,  //  Improper Neutralization of Special Elements used in an SQL Command ('SQL Injection')    19.54   0
    "CWE-416": 6, // Use After Free  16.83   +1
    "CWE-22": 7,  //  Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')  14.69   +4
    "CWE-352": 8, // Cross-Site Request Forgery (CSRF)   14.46   0
    "CWE-190": 9, // Integer Overflow or Wraparound 7.12	-1
  },
  top20VulnerabilityTypes: {
    "CWE-79": 0,
    "CWE-119": 1,
    "CWE-20": 2,
    "CWE-200": 3,
    "CWE-89": 4,
    "CWE-264": 5,
    "CWE-787": 6,
    "CWE-22": 7,
    "CWE-125": 8,
    "CWE-352": 9,
    "CWE-94": 10,
    "CWE-399": 11,
    "CWE-310": 12,
    "CWE-287": 13,
    "CWE-416": 14,
    "CWE-269": 15,
    "CWE-78": 16,
    "CWE-190": 17,
    "CWE-476": 18,
    "CWE-189": 19,
  },
  referencesConfig: {
    "securityfocus.com": { symbol: "a" },
    "exchange.xforce.ibmcloud.com": { symbol: "b" },
    "securitytracker.com": { symbol: "c" },
    "github.com": { symbol: "d" },
    "debian.org": { symbol: "e" },
    "security.gentoo.org": { symbol: "f" },
    "ubuntu.com": { symbol: "g" },
    "kb.cert.org": { symbol: "h" },
    "bugzilla.redhat.com": { symbol: "i" },
    "lists.apple.com": { symbol: "j" },
    "usn.ubuntu.com": { symbol: "k" },
    "portal.msrc.microsoft.com": { symbol: "l" },
    "bugzilla.mozilla.org": { symbol: "n" },
    "mozilla.org": { symbol: "o" },
    "git.kernel.org": { symbol: "s" },
  }
}
