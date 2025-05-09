import https from "https";

function checkSiteStatus(url: string): Promise<boolean> {
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
    console.log(`{"uptimeData": ${isUp ? '"1"' : '"0"'}}`);
  } catch (err) {
    console.error('{"error": "Invalid input data"}');
    process.exit(1);
  }
});
