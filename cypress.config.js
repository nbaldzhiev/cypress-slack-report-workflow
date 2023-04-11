const { defineConfig } = require('cypress');

module.exports = defineConfig({
    reporter: 'mochawesome',
    reporterOptions: {
        reportDir: 'cypress/reports/mochawesome',
        overwrite: false,
        charts: true,
        html: false,
        json: true,
    },
});