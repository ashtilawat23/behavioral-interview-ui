import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [audioFile, setAudioFile] = useState(null);
  const audioInputRef = useRef(null);
  const audioPlayerRef = useRef(null);

  const handleAudioSubmit = (event) => {
    event.preventDefault();
    const files = audioInputRef.current.files;
    if (files.length > 0) {
      setAudioFile(files[0]);
    }
  };

  useEffect(() => {
    if (audioFile) {
      const formData = new FormData();
      formData.append('audio', audioFile);

      axios.post('http://localhost:8000/respond', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'blob',
      })
      .then((response) => {
        const audioUrl = URL.createObjectURL(response.data);
        audioPlayerRef.current.src = audioUrl;
        audioPlayerRef.current.play();
      })
      .catch((error) => console.error('Error sending audio:', error));
    }
  }, [audioFile]);

  return (
    <div>
      <form onSubmit={handleAudioSubmit}>
        <input type="file" accept="audio/*" ref={audioInputRef} />
        <button type="submit">Send</button>
      </form>
      <audio ref={audioPlayerRef} controls />
    </div>
  );
}

export default App;
