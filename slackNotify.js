/** Sends a Slack message with formatted test results and a link to the GitHub actions workflow run.
 * Only meant to be used within a CI workflow, GitHub Actions in this example, but it can be modified to use other
 * providers as well.
 * @example
 * NO_COLOR=1 npx cypress run | tee cyOutput.txt
 * node slackNotify.js cyOutput.txt
 */
const fs = require('fs');
const { WebClient } = require('@slack/web-api');

const ghActionsRunID = process.env.GITHUB_RUN_ID;
const ghActionsRunUrl = `https://github.com/your-project/actions/runs/${ghActionsRunID}`;
const qaSlackGroupId = process.env.SLACK_QA_GROUP_ID;
const slackBotToken = process.env.SLACK_BOT_TOKEN;
const slackChannelNameAll = process.env.SLACK_CHANNEL_NAME_ALL;
const slackChannelNameFails = process.env.SLACK_CHANNEL_NAME_FAILS;

/**
 * Parses the Cypress output provided as the content of a file
 * @param {String} filename The filename of the file which contains the redirected Cypress run command output
 */
function parseCypressOutput({ filename }) {
    const cyOutput = fs.readFileSync(filename, 'utf8');
    const statuses = ['Tests', 'Passing', 'Failing', 'Pending', 'Skipped'];
    let parsedResults = { noTestsFound: false };

    if (cyOutput.match(/.*no spec files were found.*/)) {
        parsedResults.noTestsFound = true;
    } else {
        for (const status of statuses) {
            let re = new RegExp(`.*${status}:\\s+ ([0-9]+) .*`, 'g');
            let matches = [...cyOutput.matchAll(re)];
            let total = matches
                .map((match) => parseInt(match[1]))
                .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
            parsedResults[status] = total;
        }
        parsedResults['duration'] = cyOutput.match(
            /.*(?:All specs passed!|[0-9]+ of [0-9]+ failed.*)\s+ ([0-9]+:[0-9]+|[0-9]+ms) .*/,
        )[1];
    }
    return parsedResults;
}

/**
 * Constucts the Slack message to send to the results channels
 * @param {String} parsedResults The parsed results of the Cypress output. The value of this parameter is expected to 
 * be the return value of function parseCypressOutput.
 */
function constructSlackMessage({ parsedResults }) {
    let slackMessage = '---------- *TEST RESULTS* ----------\n';
    let mentionQaGroup = false;

    // If no tests were selected, i.e. no tests ran
    if (parsedResults.noTestsFound) {
        slackMessage += ':interrobang: No tests were selected. Was that intended?\n';
        mentionQaGroup = true;
    } else {
        for (const [status, numOfTests] of Object.entries(parsedResults)) {
            if (status === 'Passing') {
                slackMessage += `:large_green_circle: *${numOfTests} PASSED*\n`;
            } else if (status === 'Failing') {
                slackMessage += `:red_circle: *${numOfTests} FAILED*\n`;
                if (numOfTests) {
                    mentionQaGroup = true;
                }
            } else if (status === 'Pending') {
                slackMessage += `:heavy_minus_sign: *${numOfTests} PENDING*\n`;
            } else if (status === 'Skipped') {
                slackMessage += `:double_vertical_bar: *${numOfTests} SKIPPED*\n`;
            }
        }
    }

    slackMessage += mentionQaGroup
        ? `\n* :x: FAILURE - There were test failures or no tests!* :x: <!subteam^${qaSlackGroupId}>\n`
        : `\n* :white_check_mark: SUCCESS - No unexpected failures/errors!* :white_check_mark:\n`;

    if (!parsedResults.noTestsFound) {
        slackMessage += `\nTests elapsed time: *${parsedResults.duration}*.\n`;
    }
    slackMessage += `<${ghActionsRunUrl}|Run URL (ID: ${ghActionsRunID})>`;

    return slackMessage;
}

/**
 * Posts the Slack message with the formatted content to the corresponding slack channels
 * @param {String} slackMessage The formatted slack message to send. The value of this parameter is expected to 
 * be the return value of function constructSlackMessage.
 * @param {String} slackBotToken The token of the Slack bot app which would send the message
 * @param {String} slackChannel The name of the Slack channel, which contains all test results
 * @param {String} slackFailuresChannel The name of the Slack channel, which contains only test results with failures
 */
function postMessage({ slackMessage, slackBotToken, slackChannel, slackFailuresChannel }) {
    const client = new WebClient(slackBotToken);
    (async () => {
        await client.chat.postMessage({
            text: slackMessage,
            channel: slackChannel,
        });
    })();
    // If a subteam is being mentioned, then there were failures
    if (slackMessage.includes('<!subteam^')) {
        (async () => {
            await client.chat.postMessage({
                text: slackMessage,
                channel: slackFailuresChannel,
            });
        })();
    }
}

postMessage({
    slackMessage: constructSlackMessage({ parsedResults: parseCypressOutput({ filename: process.argv.slice(-1)[0] }) }),
    slackBotToken: slackBotToken,
    slackChannel: slackChannelNameAll,
    slackFailuresChannel: slackChannelNameFails,
});