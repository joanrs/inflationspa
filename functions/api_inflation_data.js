const { inflationData } = require('./inflation_data');

exports.handler = async (event, context) => {
    try {
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inflationData)
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch inflation data' })
        };
    }
};