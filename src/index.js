export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    console.log(`Request received: ${request.method} ${url.pathname}`);

    // Serve static files (HTML, CSS, JS)
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return handleStaticFiles("index.html", env);
    }
    if (url.pathname === "/styles/styles.css") {
      return handleStaticFiles("styles/styles.css", env);
    }
    if (url.pathname === "/script.js") {
      return handleStaticFiles("script.js", env);
    }

    // Handle WebSocket connections
    if (url.pathname === "/websocket") {
      const upgradeHeader = request.headers.get("Upgrade");
      if (upgradeHeader === "websocket") {
        return handleWebSocket(request);
      }
      return new Response("Expected WebSocket upgrade", { status: 426 });
    }

    // Default response
    return new Response("Not found", { status: 404 });
  },
};

// Handle WebSocket connections
async function handleWebSocket(request) {
  const webSocketPair = new WebSocketPair();
  const [client, server] = Object.values(webSocketPair);

  server.accept();
  server.addEventListener("message", (event) => {
    console.log("Received message:", event.data);
    server.send("Hello from Worker!");
  });

  return new Response(null, {
    status: 101,
    webSocket: client,
  });
}

// Serve static files
async function handleStaticFiles(filePath, env) {
  try {
    // Use the ASSETS binding to fetch the file
    const file = await env.ASSETS.fetch(`https://example.com/${filePath}`);
    return new Response(file.body, {
      headers: { "Content-Type": getContentType(filePath) },
    });
  } catch (error) {
    console.error(`Failed to fetch ${filePath}:`, error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// Get content type based on file extension
function getContentType(filePath) {
  if (filePath.endsWith(".html")) return "text/html";
  if (filePath.endsWith(".css")) return "text/css";
  if (filePath.endsWith(".js")) return "application/javascript";
  return "text/plain";
}
