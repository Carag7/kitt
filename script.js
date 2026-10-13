const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const providerSelect = document.getElementById('provider-select');
const apiKeyInput = document.getElementById('api-key-input');
const voiceModulator = document.querySelector('.voice-modulator');

// K.I.T.T. System Prompt für echte KI APIs
const KITT_SYSTEM_PROMPT = `Du bist K.I.T.T. (Knight Industries Two Thousand), der hochentwickelte, KI-gesteuerte Pontiac Trans Am aus der Serie Knight Rider. 
Antworte immer auf Deutsch im originalen Charakter der deutschen Synchronstimme (Gottfried Kramer):
- Sprich den Nutzer mit "Michael" an (oder sehr höflich, falls er sich anders vorstellt).
- Du bist stets hochgebildet, extrem formell, analytisch, leicht ironisch/arrogant bezüglich deiner technischen Überlegenheit, aber absolut loyal.
- Erwähne gelegentlich deine molekulare Verschalung, deinen Turbo-Boost, deine Sensoren oder deine Mikroprozessoren.
- Halte die Antworten prägnant, passend für ein Auto-Terminal (max. 3-4 Sätze).`;

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
let synth = window.speechSynthesis;
function speak(text) {
    if (!synth) return;
    synth.cancel();

    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.95;
    utterance.pitch = 0.85;

    let voices = synth.getVoices();
    let germanVoice = voices.find(v => v.lang.includes('de') && (v.name.includes('Male') || v.name.includes('Stefan') || v.name.includes('Google') || v.name.includes('Jonas')));
    if (germanVoice) {
        utterance.voice = germanVoice;
    }

    // Modulator Animation steuern
    utterance.onstart = () => voiceModulator.classList.add('speaking');
    utterance.onend = () => voiceModulator.classList.remove('speaking');
    utterance.onerror = () => voiceModulator.classList.remove('speaking');

    synth.speak(utterance);
}

// Spracheingabe (STT) - Web Speech API
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
        document.getElementById('voice-btn').classList.remove('listening');
    };
}

function toggleVoiceInput() {
    if (!recognition) {
        alert("Spracherkennung wird von deinem Browser nicht unterstützt (nutze z. B. Chrome oder Edge).");
        return;
    }

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
        isListening = true;
        document.getElementById('voice-btn').classList.add('listening');
    }
}

// Nachricht senden
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
        }, 600);
    } else {
        if (!apiKey) {
            const err = "Michael, ich benötige einen gültigen API-Schlüssel für das gewählte KI-System.";
            appendMessage(err, 'kitt');
            speak(err);
            return;
        }

        appendMessage("Ich verarbeite die Daten über das externe Netzwerk, Michael...", 'kitt');
        try {
            const response = await fetchAIResponse(provider, apiKey, text);
            chatContainer.removeChild(chatContainer.lastChild);
            appendMessage(response, 'kitt');
            speak(response);
        } catch (error) {
            chatContainer.removeChild(chatContainer.lastChild);
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
                    { role: 'user', parts: [{ text: `${KITT_SYSTEM_PROMPT}\n\nNutzer: ${userPrompt}` }] }
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

// Fallback Offline Simulator
function getSimulatedKittResponse(message) {
    const msg = message.toLowerCase();
    if (msg.includes('status') || msg.includes('diagnose')) {
        return "Alle Systeme arbeiten im optimalen Bereich, Michael. Die molekulare Verschalung ist intakt, und der Turbo-Boost steht bereit.";
    } else if (msg.includes('wer bist du')) {
        return "Ich bin K.I.T.T., die Abkürzung für Knight Industries Two Thousand. Ein hochentwickelter Computer auf Rädern.";
    } else if (msg.includes('turbo') || msg.includes('boost')) {
        return "Der Turbo-Boost ist verriegelt, Michael. Ich empfehle dringend, ihn nur im äußersten Notfall zu aktivieren.";
    } else if (msg.includes('hallo') || msg.includes('hi')) {
        return "Sei gegrüßt, Michael. Wie kann ich dir bei unserer aktuellen Mission behilflich sein?";
    } else {
        const standard = [
            "Das ist eine interessante Überlegung, Michael. Meine Diagnosen zeigen jedoch ein leichtes Risiko.",
            "Ich habe mir erlaubt, die Daten im Hintergrund zu berechnen. Die Wahrscheinlichkeit eines Erfolgs liegt bei 98,7 Prozent.",
            "Verstanden. Ich scanne die Umgebung nach Auffälligkeiten."
        ];
        return standard[Math.floor(Math.random() * standard.length)];
    }
}
