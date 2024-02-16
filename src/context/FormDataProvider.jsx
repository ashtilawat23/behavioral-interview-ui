// FormDataProvider.jsx
import React, { useState, createContext } from 'react';

// Create a Context for the form data
export const FormDataContext = createContext();

const FormDataProvider = ({ children }) => {
  // Initialize the form data state
  const [formData, setFormData] = useState({
    interview_for: '',
    skill_to_be_assessed: [], // Assuming it's an array of skills
  });

  // Provide the form data state and updater function to the context
  return (
    <FormDataContext.Provider value={{ formData, setFormData }}>
      {children}
    </FormDataContext.Provider>
  );
};

export default FormDataProvider;
