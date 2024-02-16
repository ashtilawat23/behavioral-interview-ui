import React, { useState, useEffect, useRef, useContext } from 'react';
import { Box, Text, useToast, Flex, VStack, Center, Button } from '@chakra-ui/react';
import { FormDataContext } from '../context/FormDataProvider';

const Interview = () => {
    const { formData } = useContext(FormDataContext);
    const [conversation, setConversation] = useState([]);
    const [timer, setTimer] = useState(180);
    const [timerRunning, setTimerRunning] = useState(false);
    const [listening, setListening] = useState(false);
    const toast = useToast();
    const bottomRef = useRef(null);


    // Get the SpeechRecognition instance
    const getRecognitionInstance = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            return new SpeechRecognition();
        } else {
            console.error("SpeechRecognition is not supported in this browser");
            return null;
        }
    };

    const [recognition, setRecognition] = useState(null);

    useEffect(() => {
        setRecognition(getRecognitionInstance());
    }, []);

    // Check if recognition is available
    const toggleListening = () => {
        if (!recognition) {
            setConversation(prev => [...prev, { type: 'error', text: "Speech recognition is not supported in this browser." }]);
            return;
        }

        if (listening) {
            recognition.stop();
        } else {
            if (!timerRunning) {
                setTimer(180); // Reset timer only if we're starting a new session
                setConversation([]); // Clear conversation only at the start of a new session
                setTimerRunning(true);
            }
            recognition.start();
        }
    };

    // Starts the interview
    const startInterview = () => {
        setTimer(180);
        setTimerRunning(true);
        setConversation([]);
    };

    // Speech recognition events
    useEffect(() => {
        if (!recognition) return;

        recognition.lang = 'en-US';
        recognition.onstart = () => setListening(true);
        recognition.onend = () => setListening(false);
        recognition.onresult = async (event) => {
            const speechToText = event.results[0][0].transcript;
            processSpeech(speechToText);
        };

        return () => recognition.stop();
    }, [recognition]);

    // Processes speech-to-text conversion and fetches the assistant response
    const processSpeech = async (speechToText) => {
        setConversation(prev => [...prev, { type: 'user', text: speechToText }]);
        try {
            const response = await fetch('http://localhost:8000/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: speechToText }),
            });

            if (!response.ok) throw new Error(`Error: ${response.statusText}`);

            const { response: assistantResponse } = await response.json();
            setConversation(prev => [...prev, { type: 'assistant', text: assistantResponse }]);
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(assistantResponse));
        } catch (error) {
            console.error('Error:', error);
            setConversation(prev => [...prev, { type: 'error', text: `Error: ${error.message}` }]);
        }
    };

    // Timer management
    useEffect(() => {
        if (!timerRunning) return;
        if (timer > 0) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }

        setTimerRunning(false);
        setListening(false);
        recognition.stop();
        toast({
            title: "Interview Complete",
            description: "The interview has completed. Click restart to begin again.",
            status: "success",
            duration: 9000,
            isClosable: true,
        });
    }, [timerRunning, timer, toast, recognition]);

    // Scroll to bottom on new conversation entry
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation]);

    // Announce start of interview
    useEffect(() => {
        if (!timerRunning) return;
        const startMessage = `Today, I'll be screening you for the ${formData.interview_for} position at Meta. You will have 3 minutes to respond to each question. When you're ready, click the Respond button and start speaking. Good luck!`;
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(startMessage));
    }, [timerRunning, formData.interview_for]);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <Flex direction="column" h="100vh">
            {/* Timer and Buttons */}
            <Flex justify="flex-end" p={4}>
                {timerRunning && (
                    <Box p={3} bg="gray.100" borderRadius="md">
                        <Text fontSize="2xl" fontWeight="bold">Timer: {formatTime(timer)}</Text>
                    </Box>
                )}
            </Flex>

            <Center flex="1" flexDirection="column">
                {!timerRunning && (
                    <Button size="lg" fontSize="xl" colorScheme="blue" onClick={startInterview}>
                        Start Interview
                    </Button>
                )}

                {timerRunning && timer !== 0 && (
                    <Button size="lg" fontSize="xl" colorScheme="blue" onClick={toggleListening}>
                        {listening ? "I'm Done Talking" : "Respond"}
                    </Button>
                )}

                {timer === 0 && (
                    <Button mt={4} size="lg" fontSize="xl" colorScheme="green" onClick={startInterview}>
                        Restart Interview
                    </Button>
                )}
            </Center>

            {/* Conversation display */}
            <Box h="50vh" overflowY="auto" p={4} bg="gray.50">
                <VStack spacing={4} align="stretch">
                    {conversation.map((part, index) => (
                        <Flex key={index} justify={part.type === 'user' ? 'flex-end' : 'flex-start'}>
                            <Box
                                bg={part.type === 'user' ? 'blue.500' : 'gray.100'}
                                p={3}
                                borderRadius="lg"
                                maxWidth="80%"
                                boxShadow="sm"
                                display="flex"
                                alignItems="center"
                            >
                                {part.type === 'assistant' && <FaRobot color="#CBD5E0" size="20" style={{ marginRight: '8px' }} />}
                                <Text color={part.type === 'user' ? 'white' : 'gray.800'}>{part.text}</Text>
                            </Box>
                        </Flex>
                    ))}
                    <div ref={bottomRef} />
                </VStack>
            </Box>
        </Flex>
    );
};

export default Interview;