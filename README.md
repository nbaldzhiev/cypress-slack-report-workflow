# Cypress Slack Test Results Notifier
A repository containing a GitHub Actions workflow and a Node.js script to send parsed Cypress results report as a Slack message.

> **_NOTE:_** This repository doesn't include an actual Cypress project, but rather it can be integrated within your project to allow for Slack reporting of Cypress test results.

## Notable files
* [run-tests.yml](https://github.com/nbaldzhiev/cypress-slack-report-workflow/blob/main/.github/workflows/run-tests.yml) The GitHub Actions workflow file 
containing a simple example workflow of a Cypress run of all tests in a given project.
    * The workflow uploads an artifact containing the combined Mochawesome HTML report. As a next step, this HTML report can be sent to a HTTP server, 
    a S3 bucket with enabled static webhosting can work just fine, and the link where the report is hosted can be attached to the Slack message.
* [slackNotify.js](https://github.com/nbaldzhiev/cypress-slack-report-workflow/blob/main/slackNotify.js) Node.js script which accepts the Cypress output 
an a command line argument and sends a formatted message to given Slack channels with the test results.

## Packages used
* [@slack/web-api](https://www.npmjs.com/package/@slack/web-api) - provides Slack's Web-API for Node.js;
* [mochawesome](https://www.npmjs.com/package/mochawesome) - provides an HTML report of the test results;
* [mochawesome-report-generator](https://www.npmjs.com/package/mochawesome-report-generator) - allows for generating a unified Mochawesome report;
* [mochawesome-merge](https://www.npmjs.com/package/mochawesome-merge) - allows for merging of multiple Mochawesome JSON reports into one.

## Screenshots

![Slack message with reports](https://i.snipboard.io/oH13EC.jpg)
