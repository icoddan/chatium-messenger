export const apiManifestRoute = app.get("/", async (ctx, req) => {
  return {
    name: "Chatium Messenger",
    short_name: "Chatium",
    description: "Мессенджер с чатами, звонками, стикерами и верификацией",
    start_url: "/land",
    display: "standalone",
    background_color: "#0f111a",
    theme_color: "#5b9bd5",
    categories: ["messaging", "social", "communication"],
    scope: "/land",
    icons: [
      { src: "data:image/svg+xml,...", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
      { src: "data:image/svg+xml,...", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
    ],
  }
})