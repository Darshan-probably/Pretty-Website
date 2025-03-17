// WebSocket URL (centralized variable)
const websocketUrl = "{{WEBSOCKET_URL}}"; // Placeholder to be replaced during build

// WebSocket and state variables
let socket;
let heartbeatInterval;
const messageQueue = [];
const connectionStatus = document.getElementById("connectionStatus");

// Function to initialize WebSocket connection
function connectWebSocket() {
    socket = new WebSocket(websocketUrl);

    // Handle WebSocket connection open
    socket.addEventListener("open", () => {
        console.log("Connected to WebSocket server");
        connectionStatus.textContent = "Connected";
        connectionStatus.style.color = "green";

        // Send queued messages
        while (messageQueue.length > 0) {
            const message = messageQueue.shift();
            socket.send(message);
        }

        // Start heartbeat
        heartbeatInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ type: "heartbeat" }));
            }
        }, 30000); // Send heartbeat every 30 seconds
    });

    // Handle incoming messages
    socket.addEventListener("message", (event) => {
        try {
            const data = JSON.parse(event.data);
            switch (data.type) {
                case "connected":
                    console.log(data.message);
                    break;
                case "play_status":
                    console.log(data.message);
                    break;
                case "stop_status":
                    console.log(data.message);
                    break;
                case "loop_status":
                    console.log(data.message);
                    break;
                case "queue_status":
                    console.log(data.message);
                    updateQueue(data.queue); // Update the queue list
                    break;
                default:
                    console.log("Unknown message type:", data);
            }
        } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
        }
    });

    // Handle WebSocket errors
    socket.addEventListener("error", (error) => {
        console.error("WebSocket error:", error);
    });

    // Handle WebSocket connection close
    socket.addEventListener("close", () => {
        console.log("WebSocket connection closed. Reconnecting...");
        connectionStatus.textContent = "Disconnected";
        connectionStatus.style.color = "red";
        clearInterval(heartbeatInterval); // Stop heartbeat
        setTimeout(connectWebSocket, 3000); // Reconnect after 3 seconds
    });
}

// Function to send messages
function sendMessage(message) {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(message);
    } else {
        messageQueue.push(message); // Add message to queue
    }
}

// Function to update the queue list
function updateQueue(queue) {
    const queueList = document.getElementById("queueList");
    queueList.innerHTML = ""; // Clear the current queue

    queue.forEach((song, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${song}`;
        queueList.appendChild(listItem);
    });
}

// Initialize WebSocket connection
connectWebSocket();

// Play button
document.getElementById("playBtn").addEventListener("click", () => {
    const message = JSON.stringify({ type: "play", song: "Example Song" });
    sendMessage(message);
});

// Stop button
document.getElementById("stopBtn").addEventListener("click", () => {
    const message = JSON.stringify({ type: "stop" });
    sendMessage(message);
});

// Loop button
document.getElementById("loopBtn").addEventListener("click", () => {
    const message = JSON.stringify({ type: "loop" });
    sendMessage(message);
});

// Queue button
document.getElementById("queueBtn").addEventListener("click", () => {
    const message = JSON.stringify({ type: "get_queue" });
    sendMessage(message);
});

// Search button
document.getElementById("searchSubmitBtn").addEventListener("click", () => {
    const query = document.getElementById("searchQuery").value;
    if (query) {
        const message = JSON.stringify({ type: "search", query });
        sendMessage(message);
    }
});

// Invite button
document.getElementById("inviteBtn").addEventListener("click", () => {
    // Redirect to the Discord bot invite URL
    window.open("https://discord.com/oauth2/authorize?client_id=1247095774735761419&permissions=4298443840&integration_type=0&scope=bot+applications.commands", "_blank");
});
