import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Interview from './components/Interview';
import Form from './components/Form';
import FormDataProvider from './context/FormDataProvider';

const App = () => {
    return (
        <BrowserRouter>
            <FormDataProvider>
                <Routes>
                    <Route path="/" element={<Form />} />
                    <Route path="/interview" element={<Interview />} />
                </Routes>
            </FormDataProvider>
        </BrowserRouter>
    );
};

export default App;
