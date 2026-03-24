import React, { useEffect, useState } from "react";
import { InputData } from "./world/input.jsx";

// import { io } from "socket.io-client";

const socket = io();


const RemoteApp = () => {
    const [dateTime, setDateTime] = useState("");

    useEffect(() => {
        socket.emit("join-remote");

        // Update date/time
        const updateDateTime = () => {
            const now = new Date();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            setDateTime(`${month}.${day}.${hours}:${minutes}:${seconds}`);
        };

        updateDateTime();
        const interval = setInterval(updateDateTime, 1000); // Update every second

        return () => clearInterval(interval);
    }, []);

    return (
        <div
            style={{
                background: "#1C1C1C"
            }}>
            <p className="date">{dateTime}</p>
            <InputData socket={socket} />
            <button className="btn">next</button>
            <p className="page">sys_data_[1|5]</p>
        </div>
    );
};

export default RemoteApp;