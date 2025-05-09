import https from "https";

interface InfoItem {
  label: string;
  value: string | number | boolean | null;
}

async function checkDomain(url: string): Promise<InfoItem[]> {
  // Remove protocol and path if present
  const domain = url.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];

  return new Promise((resolve, reject) => {
    const apiUrl = `https://whois.whoisxmlapi.com/api/v1?apiKey=at_demo_key&domainName=${domain}`;

    https
      .get(apiUrl, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          try {
            const whoisData = JSON.parse(data);
            const result: InfoItem[] = [];

            if (whoisData.WhoisRecord) {
              const record = whoisData.WhoisRecord;

              // Basic domain info
              result.push({
                label: "Domain Name",
                value: record.domainName || null,
              });

              // Registration dates
              if (record.createdDate) {
                result.push({
                  label: "Creation Date",
                  value: new Date(record.createdDate).toISOString(),
                });
              }

              if (record.updatedDate) {
                result.push({
                  label: "Updated Date",
                  value: new Date(record.updatedDate).toISOString(),
                });
              }

              if (record.expiresDate) {
                result.push({
                  label: "Expiration Date",
                  value: new Date(record.expiresDate).toISOString(),
                });
              }

              // Registrar info
              if (record.registrarName) {
                result.push({
                  label: "Registrar",
                  value: record.registrarName,
                });
              }

              // Nameservers
              if (record.nameServers && record.nameServers.hostNames) {
                record.nameServers.hostNames.forEach(
                  (ns: string, index: number) => {
                    result.push({
                      label: `Nameserver ${index + 1}`,
                      value: ns,
                    });
                  }
                );
              }

              // WHOIS Server
              if (record.whoisServer) {
                result.push({
                  label: "WHOIS Server",
                  value: record.whoisServer,
                });
              }

              // Domain status
              if (record.status) {
                result.push({ label: "Domain Status", value: record.status });
              }
            } else {
              // Fallback to basic info if the API doesn't return expected format
              result.push({ label: "Domain", value: domain });
              result.push({
                label: "API Response",
                value: "Limited information available",
              });
            }

            resolve(result);
          } catch (error) {
            reject(
              new Error(`Failed to parse domain information: ${error.message}`)
            );
          }
        });
      })
      .on("error", (error) => {
        reject(
          new Error(`Failed to fetch domain information: ${error.message}`)
        );
      });
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

    const siteInfo = await checkDomain(siteUrl);
    console.log(
      JSON.stringify({
        siteInfo,
      })
    );
  } catch (err) {
    console.error('{"error": "Invalid input data"}');
    process.exit(1);
  }
});
