* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    background-color: #030303;
    color: #ff3333;
    font-family: 'Courier New', Courier, monospace;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
}

/* Tesla Frontpanel mit integriertem K.I.T.T. Scanner */
.tesla-front-panel {
    background-color: #0b0b0b;
    border-bottom: 2px solid #220000;
    padding: 5px 0;
    text-align: center;
}

.scanner-container {
    width: 100%;
    height: 18px;
    background-color: #110000;
    display: flex;
    align-items: center;
    overflow: hidden;
    box-shadow: inset 0 0 10px #550000;
}

.scanner-light {
    width: 15%;
    height: 100%;
    background: linear-gradient(90deg, transparent, #ff0000, #ffcccc, #ff0000, transparent);
    box-shadow: 0 0 12px #ff0000, 0 0 20px #ff0000;
    animation: scan 1.2s infinite alternate ease-in-out;
}

@keyframes scan {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(650%); }
}

.car-badge {
    font-size: 0.75rem;
    color: #888;
    letter-spacing: 3px;
    margin-top: 4px;
}

/* Header & Voice Modulator Visualizer */
header {
    text-align: center;
    padding: 10px;
    border-bottom: 1px dashed #ff3333;
    background: rgba(15, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
}

h1 {
    font-size: 1.2rem;
    letter-spacing: 2px;
    text-shadow: 0 0 8px #ff0000;
}

.voice-modulator {
    display: flex;
    gap: 5px;
    height: 18px;
    align-items: center;
}

.v-bar {
    width: 22px;
    height: 5px;
    background-color: #ff0000;
    box-shadow: 0 0 6px #ff0000;
    transition: height 0.1s ease;
}

.speaking .v-bar:nth-child(1) { animation: voicePulse 0.2s infinite alternate; }
.speaking .v-bar:nth-child(2) { animation: voicePulse 0.3s infinite alternate 0.05s; }
.speaking .v-bar:nth-child(3) { animation: voicePulse 0.25s infinite alternate 0.1s; }

@keyframes voicePulse {
    0% { height: 3px; opacity: 0.4; }
    100% { height: 16px; opacity: 1; }
}

/* Chat Messages */
#chat-container {
    flex: 1;
    overflow-y: auto;
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.message {
    padding: 10px 15px;
    border-radius: 4px;
    max-width: 80%;
    line-height: 1.4;
    font-size: 1rem;
}

.kitt-msg {
    background-color: #1a0000;
    border-left: 4px solid #ff0000;
    color: #ff6666;
    align-self: flex-start;
    box-shadow: 0 0 8px rgba(255, 0, 0, 0.2);
}

.user-msg {
    background-color: #001a1a;
    border-right: 4px solid #00ffff;
    color: #66ffff;
    align-self: flex-end;
}

/* Provider / Key Settings Bar */
.settings-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 15px;
    background-color: #080000;
    border-top: 1px solid #330000;
    font-size: 0.85rem;
}

.settings-bar select, .settings-bar input {
    background: #000;
    color: #ff3333;
    border: 1px solid #aa0000;
    padding: 4px 8px;
    font-family: inherit;
    outline: none;
}

/* Input Area */
.input-area {
    display: flex;
    padding: 10px;
    background-color: #0d0000;
    border-top: 2px solid #ff0000;
}

input[type="text"] {
    flex: 1;
    background-color: #000;
    border: 1px solid #ff3333;
    color: #ff3333;
    padding: 10px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 1rem;
    outline: none;
}

input[type="text"]:focus {
    border-color: #ff0000;
    box-shadow: 0 0 8px #ff0000;
}

button {
    background-color: #ff0000;
    color: #000;
    border: none;
    padding: 0 18px;
    margin-left: 8px;
    font-weight: bold;
    font-family: 'Courier New', Courier, monospace;
    font-size: 1rem;
    cursor: pointer;
    transition: 0.2s;
}

button:hover {
    background-color: #ff6666;
    box-shadow: 0 0 10px #ff0000;
}

.voice-btn {
    background-color: #330000;
    color: #ff3333;
    border: 1px solid #ff0000;
}

.voice-btn.listening {
    background-color: #ff0000;
    color: #ffffff;
    animation: pulse 1s infinite;
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
    70% { box-shadow: 0 0 0 10px rgba(255, 0, 0, 0); }
    100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
}
