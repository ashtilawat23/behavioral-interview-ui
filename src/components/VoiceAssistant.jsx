import React, { useState } from 'react';

const VoiceAssistant = () => {
    const [conversation, setConversation] = useState([]);

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error("SpeechRecognition is not supported in this browser");
            setConversation(prev => [...prev, { type: 'error', text: "Speech recognition is not supported in this browser." }]);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();

        recognition.onresult = async (event) => {
            const speechToText = event.results[0][0].transcript;
            setConversation(prev => [...prev, { type: 'user', text: `You said: ${speechToText}` }]);

            try {
                const response = await fetch('http://localhost:8000/respond', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: speechToText }),
                });

                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const data = await response.json();
                const assistantResponse = data.response;
                setConversation(prev => [...prev, { type: 'assistant', text: `Assistant said: ${assistantResponse}` }]);

                // Convert the text response to speech
                const utterance = new SpeechSynthesisUtterance(assistantResponse);
                window.speechSynthesis.speak(utterance);
            } catch (error) {
                console.error('Error:', error);
                setConversation(prev => [...prev, { type: 'error', text: `Error: ${error.message}` }]);
            }
        };
    };

    return (
        <div>
            <button onClick={startListening}>Start Listening</button>
            <div>
                {conversation.map((part, index) => (
                    <p key={index} className={part.type}>{part.text}</p>
                ))}
            </div>
        </div>
    );
};

export default VoiceAssistant;
