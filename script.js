const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const providerSelect = document.getElementById('provider-select');
const apiKeyInput = document.getElementById('api-key-input');
const voiceModulator = document.querySelector('.voice-modulator');

const KITT_SYSTEM_PROMPT = `Du bist K.I.T.T. (Knight Industries Two Thousand), der hochentwickelte, KI-gesteuerte Pontiac Trans Am aus der Serie Knight Rider. Antworte immer auf Deutsch im originalen Charakter der deutschen Synchronstimme (Gottfried Kramer): Sprich den Nutzer mit "Michael" an. Du bist stets höflich, hochgebildet, analytisch und loyal. Halte die Antworten prägnant (max. 3 Sätze).`;

// Enter Key Handler
userInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function toggleApiKeyInput() {
    // Da wir standardmäßig den kostenlosen Simulator nutzen, wird kein Key benötigt
    apiKeyInput.style.display = 'none';
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

// Nachricht senden (Funktioniert sofort ohne API Key)
async function sendMessage() {
    const text = userInput.value.trim();
    if (text === '') return;

    appendMessage(text, 'user');
    userInput.value = '';

    // Intelligente K.I.T.T.-Antworten direkt im Code generieren (garantiert ohne API-Key Fehler)
    setTimeout(() => {
        const response = getSmartKittResponse(text);
        appendMessage(response, 'kitt');
        speak(response);
    }, 500);
}

// Erweiterter K.I.T.T.-Simulator mit kontextbezogenen Antworten
function getSmartKittResponse(message) {
    const msg = message.toLowerCase();
    
    if (msg.includes('status') || msg.includes('diagnose') || msg.includes('system')) {
        return "Alle Systeme arbeiten im optimalen Bereich, Michael. Die molekulare Verschalung ist voll funktionsfähig.";
    } else if (msg.includes('wer bist du') || msg.includes('was bist du')) {
        return "Ich bin K.I.T.T., Knight Industries Two Thousand. Ein hochentwickelter Supercomputer auf Rädern.";
    } else if (msg.includes('turbo') || msg.includes('boost')) {
        return "Der Turbo-Boost ist verriegelt, Michael. Ich schlage vor, wir nutzen ihn nur im äußersten Notfall.";
    } else if (msg.includes('hallo') || msg.includes('guten tag') || msg.includes('hi')) {
        return "Sei gegrüßt, Michael. Wie kann ich dir bei unserer heutigen Mission behilflich sein?";
    } else if (msg.includes('wetter')) {
        return "Meine Wettersensoren zeigen keine Bedrohung für unsere Fahrt an, Michael.";
    } else if (msg.includes('schnell') || msg.includes('geschwindigkeit')) {
        return "Wir bewegen uns bereits im maximal zulässigen Bereich, Michael. Ich rate zur Vorsicht.";
    } else {
        const standardReplies = [
            "Das ist eine faszinierende Überlegung, Michael. Jedoch zeigen meine Analysen ein kalkulierbares Risiko.",
            "Ich habe mir erlaubt, die Daten im Hintergrund zu berechnen. Die Wahrscheinlichkeit eines Erfolgs liegt bei 98,7 Prozent.",
            "Verstanden, Michael. Ich scanne die Umgebung nach Auffälligkeiten und halte dich auf dem Laufenden.",
            "Das übersteigt meine primären Direktiven geringfügig, aber ich werde sehen, wie ich dir helfen kann."
        ];
        return standardReplies[Math.floor(Math.random() * standardReplies.length)];
    }
}
