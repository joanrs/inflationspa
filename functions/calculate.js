const express = require('express');
const serverless = require('serverless-http');
const inflationData = require('./inflation_data');

const app = express();
app.use(express.json());

function getIpcData(startYear, startMonth, endYear, endMonth) {
  const data = [];
  let currentYear = parseInt(startYear);
  let currentMonth = parseInt(startMonth);
  const endYearInt = parseInt(endYear);
  const endMonthInt = parseInt(endMonth);

  while (currentYear < endYearInt || (currentYear === endYearInt && currentMonth <= endMonthInt)) {
    const monthKey = currentMonth.toString().padStart(2, '0');
    if (inflationData[currentYear] && inflationData[currentYear][monthKey]) {
      data.push({
        date: `${currentYear}-${monthKey}`,
        ipc: inflationData[currentYear][monthKey]
      });
    }
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  return data;
}

function calculateSavingsLoss(initialSavings, startYear, startMonth, endYear, endMonth) {
  let currentSavings = initialSavings;
  let currentYear = parseInt(startYear);
  let currentMonth = parseInt(startMonth);
  const endYearInt = parseInt(endYear);
  const endMonthInt = parseInt(endMonth);

  while (currentYear < endYearInt || (currentYear === endYearInt && currentMonth <= endMonthInt)) {
    const monthKey = currentMonth.toString().padStart(2, '0');
    if (inflationData[currentYear] && inflationData[currentYear][monthKey]) {
      const monthlyInflationRate = inflationData[currentYear][monthKey] / 1200;
      currentSavings = currentSavings / (1 + monthlyInflationRate);
    }
    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
  return currentSavings;
}

app.post('/calculate', (req, res) => {
  try {
    const { initial_savings, start_month, start_year, end_month, end_year } = req.body;
    if (!initial_savings || !start_month || !start_year || !end_month || !end_year) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const initialSavings = parseFloat(initial_savings);
    const startDate = `${start_month}-${start_year}`;
    const endDate = `${end_month}-${end_year}`;
    const finalSavings = calculateSavingsLoss(initialSavings, start_year, start_month, end_year, end_month);
    const ipcData = getIpcData(start_year, start_month, end_year, end_month);

    res.json({
      initial_savings: initialSavings.toFixed(2),
      start_date: startDate,
      end_date: endDate,
      final_savings: finalSavings.toFixed(2),
      loss: (initialSavings - finalSavings).toFixed(2),
      ipcOh: ((initialSavings - finalSavings) / initialSavings * 100).toFixed(2),
      cumulative_ipc: ((initialSavings / finalSavings - 1) * 100).toFixed(2),
      ipc_data: ipcData
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports.handler = serverless(app);