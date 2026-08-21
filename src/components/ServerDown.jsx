import { useState } from "react";
import axios from "axios";
import "./ServerDown.css";
import API from "../services/api"

const ServerDown = ({ onRetry }) => {

    const [checking, setChecking] = useState(false);

    const handleRetry = async () => {

        setChecking(true);

        try {
            await axios.get("API/health");
            onRetry();
        } catch {
            // still down
        } finally {
            setChecking(false);
        }

    };

    return (

        <div className="server-down-page">

            <h1>This site can't be reached</h1>

            <p>ZENVYX's server took too long to respond.</p>

            <button onClick={handleRetry} disabled={checking}>
                {checking ? "Checking..." : "Retry"}
            </button>

        </div>

    );

};

export default ServerDown;