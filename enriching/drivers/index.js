const securityfocus = require('./securityfocus.js');
const docsMicrosoft = require('./docs-microsoft.js');
const exchangeXforceIbmcloud = require('./exchange-xforce-ibmcloud.js');
const securitytracker = require('./securitytracker.js');
const github = require('./github.js');
const debian = require('./debian.js');
const securitygentoo = require('./security-gentoo.js');
const ubuntu = require('./ubuntu.js');
const kbcert = require('./kb-cert.js');
const bugzillaRedhat = require('./bugzilla-redhat.js');

/**
 * List of drivers, Each driver can return object of shape
 * { 
 *   title, 
 *   subTitle, 
 *   background, // explain the context 
 *   overview, // Short overview of the issue
 *   body, // Deprecated and need to be migrated to description
 *   description, // Main POC
 *   impact,
 *   
 *   extra, // Deprecated and need to be migrated
 *   meta: { extraType: 'impact' }, // Deprecated and need to be migrated
 * };
 */
exports.drivers = {
  "securityfocus.com": securityfocus,
  "exchange.xforce.ibmcloud.com": exchangeXforceIbmcloud,
  "securitytracker.com": securitytracker,
  "github.com": github,
  "debian.org": debian,
  "security.gentoo.org": securitygentoo,
  "ubuntu.com": ubuntu,
  "kb.cert.org": kbcert,
  "bugzilla.redhat.com": bugzillaRedhat,
  // "lists.apple.com": ,
  // "usn.ubuntu.com": ,
  // "portal.msrc.microsoft.com": ,
  "docs.microsoft.com": docsMicrosoft,
  // "bugzilla.mozilla.org": ,
  // "mozilla.org": ,
  // "security.netapp.com": ,
  // "jvn.jp": ,
  // "drupal.org": ,
  // "git.kernel.org": ,
  // "ics-cert.us-cert.gov": ,
  // "crbug.com": ,
  // "gentoo.org": ,
  // "talosintelligence.com": ,
  // "support.f5.com": ,
}