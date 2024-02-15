import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Interview from './components/Interview';
import Form from './components/Form';

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Form />} />
                <Route path="/interview" element={<Interview />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;