import https from "https";

async function checkSiteStatus(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      resolve(res.statusCode === 200);
    });

    req.on("error", () => {
      resolve(false);
    });

    req.end();
  });
}

// Generate historical uptime data (for example purposes)
function generateHistoricalData(currentStatus: boolean): number[] {
  // Create array with 30 days of data (1 = up, 0 = down)
  // TODO: Replace with actual historical data retrieval
  const data = Array(30).fill(1); // Start with all up

  // Add a few random outages (2-3 outages)
  const numOutages = Math.floor(Math.random() * 2) + 2;
  for (let i = 0; i < numOutages; i++) {
    const outageIndex = Math.floor(Math.random() * 30);
    data[outageIndex] = 0;
  }

  // Set the current day (last element) to the actual status
  data[data.length - 1] = currentStatus ? 1 : 0;

  return data;
}

// Calculate uptime percentages
function calculateUptimeStats(data: number[]): {
  overall: string;
  last24Hours: string;
  last7Days: string;
  last30Days: string;
} {
  const sum = data.reduce((acc, val) => acc + val, 0);
  const overall = (sum / data.length) * 100;

  // Last 24 hours (just the last element)
  const last24Hours = data[data.length - 1] * 100;

  // Last 7 days
  const last7DaysData = data.slice(-7);
  const last7Days =
    (last7DaysData.reduce((acc, val) => acc + val, 0) / last7DaysData.length) *
    100;

  // All 30 days
  const last30Days = overall;

  return {
    overall: overall.toFixed(2) + "%",
    last24Hours: last24Hours.toFixed(2) + "%",
    last7Days: last7Days.toFixed(2) + "%",
    last30Days: last30Days.toFixed(2) + "%",
  };
}

let inputData = "";

process.stdin.on("data", (chunk) => {
  inputData += chunk.toString();
});

process.stdin.on("end", async () => {
  try {
    const inputs = JSON.parse(inputData);
    const siteUrl = inputs.site?.domain;

    if (!siteUrl) {
      console.error('{"error": "No site domain provided in input"}');
      process.exit(1);
    }

    const isUp = await checkSiteStatus(siteUrl);
    const uptimeHistory = generateHistoricalData(isUp);
    const uptimeStats = calculateUptimeStats(uptimeHistory);

    // Output properly structured JSON for the widget
    console.log(
      JSON.stringify({
        uptimeData: uptimeHistory,
        uptimeStats: uptimeStats,
      })
    );
  } catch (err) {
    console.error('{"error": "Invalid input data"}');
    process.exit(1);
  }
});
