import {FC, useCallback, useState} from 'react';
import './App.css';
import useWebSocket, {ReadyState} from "react-use-websocket";

export interface ChatMessage extends ApiChatMessage {
    identifier: string;
}

export interface ApiChatMessage {
    clientId: string;
    message: string;
}

export const App: FC = () => {

    const [socketUrl, setSocketUrl] = useState<string | null>(null);
    const {sendJsonMessage, readyState} = useWebSocket(socketUrl,
        {onMessage: (event: WebSocketEventMap['message']) => appendNewMessage(JSON.parse(event.data))});

    const [clientId, setClientId] = useState<string | undefined>(undefined);

    const [chatId, setChatId] = useState<string | undefined>(undefined);
    const [chatIdForm, setChatIdForm] = useState<string>("");
    const [userIdForm, setUserIdForm] = useState<string>("");

    const [messageForm, setMessageForm] = useState<string>("");

    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    function appendNewMessage(content: ApiChatMessage): void {
        const identifier = generateRandomString(15);
        setChatHistory([...chatHistory, {identifier, message: content.message, clientId: content.clientId}]);
    }

    function initSocket(chatIdFormValue: string, userIdFormValue: string): void {
        if (chatIdFormValue != "" && userIdFormValue != "") {
            setSocketUrl("ws://16.171.116.146:80/chat/" + chatIdFormValue);
            setChatId(chatIdFormValue);
            setClientId(userIdFormValue);
        } else {
            console.error("Chat id and client id must not be empty");
        }
    }

    const handleClickSendMessage = useCallback((messageContent: string) => {
        if (readyState == ReadyState.OPEN) {
            if (messageContent != "") {
                sendJsonMessage<ApiChatMessage>({clientId, message: messageContent});
            } else {
                console.error("Message content must not be empty.");
            }
        } else {
            console.error(`Socket is in state ${connectionStatus} while trying to send messages`);
        }
    }, [readyState]);


    function generateRandomString(length: number): string {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    return (
        <>
            <h1 className="text-3xl font-semibold">Chat</h1>
            <h1 className="text-3xl font-semibold">{chatId != undefined ? chatId : "Chat nicht gesetzt"}</h1>
            <h1 className="text-3xl font-semibold">{clientId}</h1>
            <h1 className="text-3xl font-semibold">{connectionStatus}</h1>

            <div className="flex w-full place-content-center">
                <div className="flex flex-col m-8">
                    <label>
                        ChatId: <input value={chatIdForm} onChange={e => setChatIdForm(e.target.value)}
                               className="input input-bordered" type="text" autoComplete="off"/>
                    </label>
                    <label>
                        UserId: <input value={userIdForm} onChange={e => setUserIdForm(e.target.value)}
                               className="input input-bordered" type="text" autoComplete="off"/>
                    </label>
                    <button className="btn btn-info" onClick={() => initSocket(chatIdForm, userIdForm)}>Set Chat</button>
                </div>
                <div className="flex m-8">
                    <input value={messageForm} onChange={e => setMessageForm(e.target.value)}
                           className="input input-bordered" type="text" autoComplete="off"/>
                    <button className="btn btn-info" onClick={() => handleClickSendMessage(messageForm)}>Absenden
                    </button>
                </div>
            </div>
            <div>
                <ul>
                    {chatHistory.map(msg => <li key={msg.identifier}>{msg.clientId}: {msg.message}</li>)}
                </ul>
            </div>
        </>
    );
}