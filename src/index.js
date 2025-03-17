export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve static files (HTML, CSS, JS)
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return handleStaticFiles("public/index.html", env);
    }
    if (url.pathname === "/styles/styles.css") {
      return handleStaticFiles("public/styles/styles.css", env);
    }
    if (url.pathname === "/script.js") {
      return handleStaticFiles("public/script.js", env);
    }

    // Handle WebSocket connections
    if (url.pathname === "/websocket") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (upgradeHeader === "websocket") {
        return handleWebSocket(request, env);
      }
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    // Default response
    return new Response("Not found", { status: 404 });
  },
};

// Handle WebSocket connections
async function handleWebSocket(request, env) {
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();
  server.addEventListener("message", (event) => {
    console.log("Received message:", event.data);
    server.send(`Connected to WebSocket server at ${env.WEBSOCKET_URL}`);
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

// Serve static files
async function handleStaticFiles(filePath, env) {
  const file = await env.ASSETS.fetch(`https://example.com/${filePath}`);
  return new Response(file.body, {
    headers: { "Content-Type": getContentType(filePath) },
  });
}

// Get content type based on file extension
function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".js")) return "application/javascript";
  return "text/plain";
}