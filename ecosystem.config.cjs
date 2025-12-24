// ecosystem.config.cjs
// AI News 用の PM2 設定
// - ai-news-discord: Discord 監視（常駐）
// - ai-news-queue  : queue_worker を 10分ごとに実行
// - ai-news-feeds  : 毎朝 8:05 に RSS から URL をキューに投入

module.exports = {
  apps: [
    {
      name: "ai-news-discord",
      script: "scripts/discord_queue_bot.mjs",
      node_args: "--env-file=.env",
      env: {
        NEWS_ROOT: "../ai-news",
      },
      autorestart: true,
    },
    {
      name: "ai-news-queue",
      script: "scripts/queue_worker.mjs",
      node_args: "--env-file=.env",
      env: {
        NEWS_ROOT: "../ai-news",
      },
      // 10分ごとに1回キューを掃除して要約する
      cron_restart: "*/10 * * * *",
      autorestart: false, // 1回終わったら終了。cronで再起動。
    },
    {
      name: "ai-news-feeds",
      script: "scripts/fetch_feeds_to_queue.mjs",
      node_args: "--env-file=.env",
      env: {
        NEWS_ROOT: "../ai-news",
      },
      // 例：30分ごとにRSS巡回
      cron_restart: "*/30 * * * *",

      autorestart: false,
    },
  ],
};
