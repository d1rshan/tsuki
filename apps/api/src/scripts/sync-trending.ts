import { syncTrendingAnime } from "../modules/anime";

async function main() {
  console.log("Starting manual sync of trending anime...");
  try {
    await syncTrendingAnime();
    console.log("Sync complete. Exiting...");
    process.exit(0);
  } catch (error) {
    console.error("Manual sync failed:", error);
    process.exit(1);
  }
}

main();
