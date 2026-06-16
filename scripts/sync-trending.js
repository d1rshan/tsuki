async function main() {
  const url = process.env.API_URL || "https://tsuki-api.vercel.app";
  const secret = process.env.CRON_SECRET || "";

  console.log(`Triggering manual cron sync at ${url}/anime/sync-trending...`);

  try {
    const response = await fetch(`${url}/anime/sync-trending`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    console.log("Success:", data);
  } catch (error) {
    console.error("Manual sync failed:", error);
    process.exit(1);
  }
}

main();
