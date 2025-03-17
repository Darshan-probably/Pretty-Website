#!/bin/bash
# Replace placeholders in script.js
sed -i "s|{{WEBSOCKET_URL}}|$WEBSOCKET_URL|g" script.js
