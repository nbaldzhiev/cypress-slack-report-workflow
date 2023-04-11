# Cypress Slack Test Run Report

A repository containing a GitHub Actions workflow and a Node.js script to send parsed Cypress results report as a Slack message.
Note that this repository doesn't include an actual Cypress project, but rather it can be integrated within your project to allow for Slack reporting 
of Cypress test results.

## Packages used

* [@slack/web-api](https://www.npmjs.com/package/@slack/web-api) - provides Slack's Web-API for Node.js;
* [mochawesome](https://www.npmjs.com/package/mochawesome) - provides an HTML report of the test results;
* [mochawesome-report-generator](https://www.npmjs.com/package/mochawesome-report-generator) - allows for generating a unified Mochawesome report;
* [mochawesome-merge](https://www.npmjs.com/package/mochawesome-merge) - allows for merging of multiple Mochawesome JSON reports into one.