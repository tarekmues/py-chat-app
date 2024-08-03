from fastapi import FastAPI
from fastapi.websockets import WebSocket, WebSocketState, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from typing import Dict, List

app = FastAPI()

#app.mount("/", StaticFiles(directory="frontend/dist", html=True), name="frontend/dist")

conn_by_chat: Dict[str, List[WebSocket]] = {}

@app.websocket("/chat/{chat_id}/")
async def websocket_endpoint(websocket: WebSocket, chat_id: str):
    await websocket.accept()

    if chat_id in conn_by_chat:
        conn_by_chat[chat_id].append(websocket)
    else:
        conn_by_chat.setdefault(chat_id, []).append(websocket)

    try:
        while True:

            if websocket.client_state != WebSocketState.CONNECTED:
                print(f"Client State was not connected")
                conn_by_chat.get(chat_id).remove(websocket)
                break

            data = await websocket.receive_text()

            for i, e in enumerate(conn_by_chat.get(chat_id)):
                await e.send_text(f"{data}")

    except WebSocketDisconnect as e:
        print(f"Disconnect block triggered")
        conn_by_chat.get(chat_id).remove(websocket)
