# vulBERT


CVE-2001-1432
- https://nvd.nist.gov/vuln/detail/CVE-2001-1432
- https://www.kb.cert.org/vuls/id/464827
- http://www.securityfocus.com/bid/3772
- https://exchange.xforce.ibmcloud.com/vulnerabilities/7799
- https://www.securityfocus.com/bid/3772/discuss


The enriching of NVD reports based on the content of some carefully selected valuable extra refrences could be very promissing. Here I try to explain why: For example for this report https://nvd.nist.gov/vuln/detail/CVE-2001-0136 we have a third party advisory linked to https://exchange.xforce.ibmcloud.com/vulnerabilities/5801 

The interesting part is that both of these pages are referring to the exact same vulnerability (ID: CVE-2001-0136) but with different language style and terminology that is used which is very valuebe. For example one is saying `cause a denial of service` and the other say `consume all available CPU resources on the server` which both related to DOS attack. 

> Memory leak in ProFTPd 1.2.0rc2 allows remote attackers to cause a denial of service via a series of USER commands, and possibly SIZE commands if the server has been improperly installed.

> ProFTPD may be vulnerable to a denial of service attack, due to a memory leak when using the SIZE or USER FTP command. An attacker can send 5000 SIZE commands or more to the ProFTPD to consume all available CPU resources on the server.

This is exactly we want, we want to have the training dataset that explain a same vulnerability with different language style and based on that we train our BERT model to be able to understand the type of vulnerability

another example would be
https://nvd.nist.gov/vuln/detail/CVE-2001-0103
https://www.securityfocus.com/bid/2107/discuss
https://exchange.xforce.ibmcloud.com/vulnerabilities/5744

Same vulnerability with ID CVE-2001-0103 was reported in 3 different places by different secpro with different language style


> CoffeeCup Direct and Free FTP clients uses weak encryption to store passwords in the FTPServers.ini file, which could allow attackers to easily decrypt the passwords.


> A vulnerability exists in the FTP clients CoffeCupt Direct and CoffeeCup Free. The clients use the file FTPServers.ini to store password information for sites to which the client has been connected. The encryption method designed to obfuscate these passwords can be easily defeated. As a result, a malicious user able to read the FTPServers.ini will be able to obtain the passwords to any of the stored FTP servers, compromising their security.

> CoffeeCup Direct FTP client uses a weak encryption algorithm to store usernames and passwords for remote FTP servers. The password information is stored in the FTPServers.ini file on the client's computer. An attacker with access to this file could decrypt the passwords contained in the file to gain access to the remote FTP servers.

What is important here is that we want to enrich our initial training data set with external advisory/POC resources that are linked from each report. We want to build a comprehensive vulnerability report  training dataset that includes different variations of human language explaining the same vulnerability in en with different writing styles and different terminology/keywords and we train a system that can understand the vulnerability despite the fact people might explain it in different ways.

another example would be
- https://docs.microsoft.com/en-us/security-updates/securitybulletins/1999/ms99-005
- https://nvd.nist.gov/vuln/detail/CVE-1999-0372

another example
- https://nvd.nist.gov/vuln/detail/CVE-2002-1874
- https://www.securityfocus.com/bid/6105/discuss
- https://securitytracker.com/id?1005523

> It is reported that a remote user can supply a specially crafted URL to the 'astrocam.cgi' script to cause programs on the system to be executed. The script does not filter the user-supplied input to remove pipe ('|') and or symbols ('||') and to prevent input and output redirection ('<' and '>').

> AstroCam is prone to a vulnerability which may allow remote attackers to execute commands. This problem is reported to occur because the 'astrocam.cgi' does not sufficiently sanitize shell metacharacters from input supplied via CGI parameters. As a result, an attacker may cause commands to be executed through the underlying shell with the privileges of the webserver process.

> astrocam.cgi in AstroCam 0.9-1-1 through 1.4.0 allows remote attackers to execute arbitrary commands via shell metacharacters in an HTTP request. NOTE: earlier disclosures stated that the affected versions were 1.7.1 through 2.1.2, but the vendor explicitly stated that these were incorrect.

## Enrichment References
The NVD report comes with a list of hyperlinks to some external supporting and advisory references. Not all these external references are valuable or can be used to enrich reports. We extracted the full list of all references and we filtered out any reference that can not be used based on the following reasons in the Useless references section.
### Useless references
- Noisy
  - lists.fedoraproject.org
  - source.android.com
  - lists.apache.org
  - lists.opensuse.org
  - openwall.com
  - access.redhat.com
  - packetstormsecurity.org
  - packetstormsecurity.com
  - seclists.org
  - www-01.ibm.com
  - lists.debian.org
  - us-cert.gov
  - zerodayinitiative.com
  - helpx.adobe.com
  - code.google.com
  - wordpress.org
  - h20566.www2.hpe.com
  - security.netapp.com
  - crbug.com
- Good but noisy  
  - support.apple.com
  - lists.apple.com
  - marc.info
  - docs.microsoft.com
  - securityreason.com
- Not in a human language
  - exploit-db.com
- Not public
  - vupen.com
  - docs.google.com
  - cisco.com
- Access denied for Crawler
  - drupal.org  
  - us-cert.cisa.gov
- Not responding for Crawler
  - gentoo.org  
- Copy and paste of NVD
  - oval.cisecurity.org  
- Shut Down Permanently
  - oracle.com
  - iss.net
  - redhat.com
  - rhn.redhat.com
  - novell.com
  - mandriva.com
  - osvdb.org
  - archives.neohapsis.com
  - secunia.com
  - tools.cisco.com
  - ibm.com
  - sourceforge.net
  - sunsolve.sun.com
  - novell.com  
  - googlechromereleases.blogspot.com
  - chromereleases.googleblog.com
  
### Valuable references

- debian.org
- security.gentoo.org
- ubuntu.com
- marc.info big content take care when I am using it
- bugzilla.mozilla.org amazing title and description and also thread of conversations
- kb.cert.org

### References with some issues 
- jvn.jp has some Japanes content need to be filtered
- git.kernel.org some page does not exit https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux-2.6.27.y.git/commit/?id=81156928f8fe31621e467490b9d441c0285998c3
- https://us-cert.cisa.gov/ abit noise, just select maybe the OVERVIEW and IMPACT sections


### Vulnerability report POC
These are bug reports that are link to a vulnerability
- crbug.com   // they also use Labels: -Restrict-View-SecurityNotify
- bugs.debian.org  
