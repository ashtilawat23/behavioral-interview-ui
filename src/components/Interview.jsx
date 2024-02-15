import React, { useState, useEffect } from 'react';
import { Box, Button, Text, useToast } from '@chakra-ui/react';

const Interview = () => {
    const [conversation, setConversation] = useState([]);
    const [timer, setTimer] = useState(180); // Initialize timer to 180 seconds (3 minutes)
    const [timerRunning, setTimerRunning] = useState(false);
    const toast = useToast();

    useEffect(() => {
        let interval = null;
        if (timerRunning && timer > 0) {
            interval = setInterval(() => {
                setTimer((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(interval);
            setTimerRunning(false); // Stop the timer
            // Show toast when the interview completes
            toast({
                title: "Interview Complete",
                description: "The interview has completed. Click restart to begin again.",
                status: "success",
                duration: 9000,
                isClosable: true,
            });
        }
        return () => clearInterval(interval);
    }, [timerRunning, timer, toast]);

    const startListening = () => {
        setTimer(180); // Reset timer to 3 minutes
        setTimerRunning(true);
        setConversation([]); // Clear previous conversation

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error("SpeechRecognition is not supported in this browser");
            setConversation(prev => [...prev, { type: 'error', text: "Speech recognition is not supported in this browser." }]);
            setTimerRunning(false);
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

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <Box>
            <Button colorScheme="blue" onClick={startListening}>Start Listening</Button>
            {timerRunning && <Text mt={4} fontSize="lg">Timer: {formatTime(timer)}</Text>}
            <Box mt={4}>
                {conversation.map((part, index) => (
                    <Text key={index} color={part.type === 'error' ? 'red.500' : (part.type === 'assistant' ? 'green.500' : 'blue.500')} mb={2}>
                        {part.text}
                    </Text>
                ))}
            </Box>
            {timer === 0 && (
                <Button mt={4} colorScheme="green" onClick={() => startListening()}>
                    Restart Interview
                </Button>
            )}
        </Box>
    );
};

export default Interview;