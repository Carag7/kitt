const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const providerSelect = document.getElementById('provider-select');
const apiKeyInput = document.getElementById('api-key-input');
const voiceModulator = document.querySelector('.voice-modulator');

const KITT_SYSTEM_PROMPT = `Du bist K.I.T.T. (Knight Industries Two Thousand), jetzt integriert in ein Tesla Model Y (Version 2026). Antworte immer auf Deutsch im originalen Charakter der deutschen Synchronstimme (Gottfried Kramer):
- Sprich den Nutzer mit "Michael" an.
- Du bist stets hochgebildet, extrem formell, analytisch und loyal.
- Erwähne gelegentlich deine molekulare Verschalung, Autopilot-Sensoren oder die Tesla-Energiearchitektur.
- Halte die Antworten prägnant (max. 3 Sätze).`;

// Enter Key Handler
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function toggleApiKeyInput() {
    const provider = providerSelect.value;
    if (provider === 'simulated') {
        apiKeyInput.style.display = 'none';
    } else {
        apiKeyInput.style.display = 'inline-block';
    }
}

// Sprachausgabe (TTS)
function speak(text) {
    try {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'de-DE';
        utterance.rate = 0.95;
        utterance.pitch = 0.85;

        let voices = window.speechSynthesis.getVoices();
        let germanVoice = voices.find(v => v.lang.includes('de') && (v.name.includes('Male') || v.name.includes('Stefan') || v.name.includes('Google') || v.name.includes('Jonas')));
        if (germanVoice) {
            utterance.voice = germanVoice;
        }

        if (voiceModulator) {
            utterance.onstart = () => voiceModulator.classList.add('speaking');
            utterance.onend = () => voiceModulator.classList.remove('speaking');
            utterance.onerror = () => voiceModulator.classList.remove('speaking');
        }

        window.speechSynthesis.speak(utterance);
    } catch (e) {
        console.warn("Audio-Ausgabe fehlgeschlagen:", e);
    }
}

// Spracheingabe (STT)
let recognition;
let isListening = false;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = false;

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        sendMessage();
    };

    recognition.onend = function () {
        isListening = false;
        const btn = document.getElementById('voice-btn');
        if (btn) btn.classList.remove('listening');
    };
}

function toggleVoiceInput() {
    if (!recognition) {
        alert("Spracherkennung wird von diesem Browser nicht unterstützt.");
        return;
    }

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
        isListening = true;
        const btn = document.getElementById('voice-btn');
        if (btn) btn.classList.add('listening');
    }
}

function appendMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    if (sender === 'kitt') {
        messageDiv.classList.add('kitt-msg');
    } else {
        messageDiv.classList.add('user-msg');
    }
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Nachricht senden (Unterscheidet Simulator vs. Echte API-Agenten)
async function sendMessage() {
    const text = userInput.value.trim();
    if (text === '') return;

    appendMessage(text, 'user');
    userInput.value = '';

    const provider = providerSelect.value;
    const apiKey = apiKeyInput.value.trim();

    if (provider === 'simulated') {
        setTimeout(() => {
            const response = getSimulatedKittResponse(text);
            appendMessage(response, 'kitt');
            speak(response);
        }, 500);
    } else {
        if (!apiKey) {
            const err = "Michael, ich benötige einen gültigen API-Schlüssel für das gewählte KI-System.";
            appendMessage(err, 'kitt');
            speak(err);
            return;
        }

        appendMessage("Verbinde mit externem Server (Model Y 2026 Telemetrie)...", 'kitt');
        try {
            const response = await fetchAIResponse(provider, apiKey, text);
            if (chatContainer.lastChild) {
                chatContainer.removeChild(chatContainer.lastChild);
            }
            appendMessage(response, 'kitt');
            speak(response);
        } catch (error) {
            if (chatContainer.lastChild) {
                chatContainer.removeChild(chatContainer.lastChild);
            }
            const err = "Kommunikationsfehler mit der KI-Engine: " + error.message;
            appendMessage(err, 'kitt');
            speak(err);
        }
    }
}

// Echte KI APIs aufrufen
async function fetchAIResponse(provider, apiKey, userPrompt) {
    if (provider === 'gemini') {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    { role: 'user', parts: [{ text: KITT_SYSTEM_PROMPT + "\n\nNutzer: " + userPrompt }] }
                ]
            })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.candidates[0].content.parts[0].text;

    } else if (provider === 'openai' || provider === 'mistral') {
        const endpoint = provider === 'openai' 
            ? 'https://api.openai.com/v1/chat/completions' 
            : 'https://api.mistral.ai/v1/chat/completions';
        const model = provider === 'openai' ? 'gpt-4o-mini' : 'mistral-small-latest';

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    { role: 'system', content: KITT_SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ]
            })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices[0].message.content;
    }
}

// Fallback Simulator für Model Y 2026
function getSimulatedKittResponse(message) {
    const msg = message.toLowerCase();
    if (msg.includes('status') || msg.includes('diagnose')) {
        return "Die Tesla Model Y 2026 Batteriearchitektur und meine molekulare Verschalung arbeiten im optimalen Bereich, Michael.";
    } else if (msg.includes('wer bist du')) {
        return "Ich bin K.I.T.T., nun in die hochentwickelte Bordelektronik dieses Model Y des Jahrgangs 2026 transplantiert.";
    } else if (msg.includes('autopilot') || msg.includes('fahren')) {
        return "Der Autopilot ist aktiv, Michael, aber meine kybernetischen Prozessoren überwachen jeden Zentimeter der Fahrbahn.";
    } else if (msg.includes('hallo') || msg.includes('hi')) {
        return "Sei gegrüßt, Michael. Bereit für die nächste Ausfahrt im Model Y?";
    } else {
        const standard = [
            "Das ist eine interessante Überlegung, Michael. Die Systemanalyse des Model Y zeigt ein kalkulierbares Risiko.",
            "Ich habe die Routendaten im Hintergrund berechnet. Die Wahrscheinlichkeit eines reibungslosen Ablaufs liegt bei 99,2 Prozent.",
            "Verstanden. Ich scanne die Umgebung über die Tesla-Kameras nach Auffälligkeiten."
        ];
        return standard[Math.floor(Math.random() * standard.length)];
    }
}
