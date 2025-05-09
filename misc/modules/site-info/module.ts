import https from "https";

interface InfoItem {
  label: string;
  value: string | number | boolean | null;
}

async function checkSiteInfo(url: string): Promise<InfoItem[]> {
  const infoItems: InfoItem[] = [];

  try {
    // Check if site is up and get SSL info
    const startTime = Date.now();
    await new Promise<void>((resolve) => {
      const req = https.request(
        {
          hostname: url,
          port: 443,
          path: "/",
          method: "HEAD",
          timeout: 10000,
          rejectUnauthorized: false, // We want to check invalid certs too
        },
        (res) => {
          const responseTime = Date.now() - startTime;

          // Add performance info
          infoItems.push({
            label: "Response Time",
            value: `${responseTime}ms`,
          });

          infoItems.push({
            label: "Status Code",
            value: res.statusCode || null,
          });

          // Get SSL certificate info
          const socket = res.socket as any;
          if (socket && socket.getPeerCertificate) {
            const cert = socket.getPeerCertificate();
            if (cert && Object.keys(cert).length > 0) {
              infoItems.push({
                label: "SSL Valid",
                value: socket.authorized || false,
              });

              if (cert.valid_from) {
                infoItems.push({
                  label: "SSL Issued On",
                  value: new Date(cert.valid_from).toISOString().split("T")[0],
                });
              }

              if (cert.valid_to) {
                infoItems.push({
                  label: "SSL Expires On",
                  value: new Date(cert.valid_to).toISOString().split("T")[0],
                });
              }

              if (cert.issuer && cert.issuer.O) {
                infoItems.push({
                  label: "SSL Issuer",
                  value: cert.issuer.O,
                });
              }

              if (cert.subject && cert.subject.CN) {
                infoItems.push({
                  label: "SSL Subject",
                  value: cert.subject.CN,
                });
              }
            }
          }

          resolve();
        }
      );

      req.on("error", (error) => {
        infoItems.push({
          label: "Connection Error",
          value: error.message,
        });
        resolve();
      });

      req.on("timeout", () => {
        req.destroy();
        infoItems.push({
          label: "Connection",
          value: "Timed out",
        });
        resolve();
      });

      req.end();
    });
  } catch (error) {
    const err = error as Error;
    infoItems.push({
      label: "Error",
      value: err.message || "Unknown error occurred",
    });
  }

  return infoItems;
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

    const siteInfo = await checkSiteInfo(siteUrl);
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
