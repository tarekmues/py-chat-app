import {FC, useState} from 'react';
import './App.css';

export enum ConnectionState {
    Connected = "Connected",
    Connecting = "Connecting",
    NotConnected = "Not Connected"
}

export const App: FC = () => {

    const [connState, setConnState] = useState<ConnectionState>(ConnectionState.NotConnected);

    return (
        <>
            <h1 className="text-3xl font-semibold">Chat</h1>
            <h1 className="text-3xl font-semibold">{connState}</h1>
        </>
    );
}