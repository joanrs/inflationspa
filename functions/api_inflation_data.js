const { inflationData } = require('./inflation_data');

exports.handler = async (event, context) => {
    try {
        if (!inflationData) {
            throw new Error('inflationData is undefined or null');
        }
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(inflationData)
        };
    } catch (error) {
        console.error('Function error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: `Failed to fetch inflation data: ${error.message}` })
        };
    }
};