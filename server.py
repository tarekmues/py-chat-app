from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.websockets import WebSocket, WebSocketState
from typing import Dict, List

from starlette.websockets import WebSocketDisconnect

app = FastAPI()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <h4 id="clientId"></h4>
        <form action="" onsubmit="applyChat(event)" style="margin-bottom: 30px;">
            <input type="text" id="chatId" autocomplete="off">
            <button>Apply Chat</button>
        </form>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            
            function generateRandomString(length) {
                const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let result = '';
                const charactersLength = characters.length;
                for (let i = 0; i < length; i++) {
                    result += characters.charAt(Math.floor(Math.random() * charactersLength));
                }
                return result;
            }
            
            const randomString = generateRandomString(10); // Generates a random string of length 10
            document.getElementById('clientId').innerHTML = randomString;
            console.log(randomString);
            
            
            var ws;
            
            function sendMessage(event) {
                var input = document.getElementById("messageText");
                if (ws != null) {
                    ws.send(input.value);
                } else {
                    console.error("Socket is null. Choose chat id before sending messages.");
                }
                input.value = '';
                event.preventDefault();
            }
            
            function applyChat(event) {
                if (ws != null) {
                    ws.            
            
                var chatId = document.getElementById("chatId")
                var newSocket = new WebSocket("ws://13.51.64.14:80/chat/" + chatId.value + "/" + randomString);
                initSocket(ws);
                ws = newSocket;
                event.preventDefault();
            }
            
            function initSocket(socket) {
                socket.onmessage = function(event) {
                    var messages = document.getElementById('messages')
                    var message = document.createElement('li')
                    var content = document.createTextNode(event.data)
                    message.appendChild(content)
                    messages.appendChild(message)
                };
            }
        </script>
    </body>
</html>
"""

connections: Dict[str, WebSocket] = {}

conn_by_chat: Dict[str, List[WebSocket]] = {}


@app.get("/")
async def get():
    return HTMLResponse(html)


@app.websocket("/chat/{chat_id}/{client_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: str, client_id: str):
    await websocket.accept()

    if chat_id in conn_by_chat:
        conn_by_chat[chat_id].append(websocket)
    else:
        conn_by_chat.setdefault(chat_id, []).append(websocket)

    try:
        while True:

            if websocket.client_state != WebSocketState.CONNECTED:
                print(f"Client State was not connected")
                connections.remove(websocket)
                break

            data = await websocket.receive_text()

            for i, e in enumerate(conn_by_chat.get(chat_id)):
                await e.send_text(f"{client_id}: {data}")

    except WebSocketDisconnect as e:
        print(f"Disconnect block triggered")
        conn_by_chat.get(chat_id).remove(websocket)