import React, { useState } from 'react';

const VoiceAssistant = () => {
    const [transcription, setTranscription] = useState('');
    const [response, setResponse] = useState('');

    const startListening = () => {
        const recognition = new window.SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.start();

        recognition.onresult = async (event) => {
            const speechToText = event.results[0][0].transcript;
            setTranscription(`You said: ${speechToText}`);

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
                setResponse(`Assistant said: ${assistantResponse}`);

                // Convert the text response to speech
                const utterance = new SpeechSynthesisUtterance(assistantResponse);
                window.speechSynthesis.speak(utterance);
            } catch (error) {
                console.error('Error:', error);
            }
        };
    };

    return (
        <div>
            <button onClick={startListening}>Start Listening</button>
            <p>{transcription}</p>
            <p>{response}</p>
        </div>
    );
};

export default VoiceAssistant;