import https from "https";
import fs from "fs";
import path from "path";

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

const inputsPath = path.join(__dirname, "inputs.json");
const inputs = JSON.parse(fs.readFileSync(inputsPath, "utf-8"));
const siteUrl = inputs.domain;

checkSiteStatus(siteUrl)
  .then((isUp) => {
    console.log(`${siteUrl} is ${isUp ? "up" : "down"}`);
  })
  .catch((err) => {
    console.error("Error checking site status:", err);
  });
