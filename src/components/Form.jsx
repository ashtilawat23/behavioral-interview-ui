import React, { useState } from 'react';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Checkbox,
  CheckboxGroup,
  Stack,
  Button,
  Heading,
  Select,
  FormHelperText,
  Input,
  Text,
  Divider
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const Form = () => {
  const [formData, setFormData] = useState({
    interview_for: '',
    skill_to_be_assessed: [], // Changed to an array to hold multiple skills
  });

  const skillsOptions = {
    FrontendEngineer: ['React', 'CSS/HTML', 'Responsive Design', 'JavaScript'],
    BackendEngineer: ['Node.js', 'Database Management', 'API Development', 'Security Practices'],
    SoftwareEngineer: ['Algorithm Design', 'System Architecture', 'Version Control', 'Testing & Debugging'],
    ProductManager: ['Roadmap Planning', 'Agile Methodologies', 'User Research', 'Data Analysis'],
    ProductMarketingManager: ['Market Analysis', 'Product Positioning', 'Content Strategy', 'Lead Generation'],
    BusinessAnalyst: ['Business Process Modeling', 'Requirements Engineering', 'Data Visualization', 'Stakeholder Analysis'],
    DataScientist: ['Machine Learning', 'Data Mining', 'Statistical Analysis', 'Programming (Python/R)'],
    DataAnalyst: ['SQL', 'Data Cleaning', 'Data Visualization Tools', 'Statistical Analysis'],
    FinanceIntern: ['Financial Modeling', 'Excel Proficiency', 'Budgeting', 'Market Research'],
    MarketingIntern: ['Social Media Management', 'Content Creation', 'SEO/SEM', 'Data Analysis'],
  };

  const handleRoleChange = (e) => {
    setFormData({
      ...formData,
      interview_for: e.target.value,
      skill_to_be_assessed: '', // Reset selected skill when role changes
    });
  };

  const handleSkillChange = (selectedSkills) => {
    setFormData({
      ...formData,
      skill_to_be_assessed: selectedSkills,
    });
  };

  const navigate = useNavigate(); // Instantiate useNavigate hook

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    navigate('/interview'); // Navigate to /interview
  };

  const handleShareClick = async (e) => {
    e.preventDefault();
    const email = document.getElementById('shareEmail').value; // Get the email value directly from the input field
    if (email) {
      try {
        const response = await fetch('http://localhost:8000/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        if (response.ok) {
          console.log("Email shared successfully");
        } else {
          console.error("Failed to share email");
        }
      } catch (error) {
        console.error("Error sharing email:", error);
      }
    }
  };

  const currentSkillsOptions = formData.interview_for ? skillsOptions[formData.interview_for] : [];

  return (
    <Box p={25} shadow="lg" borderWidth="1px">
      <Heading mb={4}>Configure AI Phone Screen Demo</Heading>
      {/* Guidelines */}
      <Text fontSize='lg' as='em'>One last thing before we get started!</Text>
      <Text fontSize="md" mb={4} mt={4}>You've got <strong>3 minutes</strong> to shine before our AI interviewer decides it's game over at the zero mark. Think of this as our <strong>proof of concept</strong>. It's a bit rough around the edges, but hey, so are all great things at the start! If you're itching to share the demo, we've worked tirelessly on this, and it deserves a chance to shine. <strong>Give us the email, and we'll ensure it lands in their inbox.</strong></Text>

      <form onSubmit={handleSubmit}>
        {/* Email Sharing */}
        <FormControl id="email" mt={4}>
          <Flex>
            <FormLabel>Share the Demo via Email:</FormLabel>
            <Input
              w='60%'
              size='sm'
              id="shareEmail"
              type="email"
              placeholder="Enter email address"
              mr={2} // Add some space between the input and button
            />
            <Button size='sm' colorScheme="blue" onClick={handleShareClick}>
              Share
            </Button>
          </Flex>
        </FormControl>
      </form>
      <Divider my={8} />
      <form onSubmit={handleSubmit}>
        {/* Role Selection */}
        <FormControl id="interview_for" isRequired>
          <FormLabel>Choose the Role to Interview For</FormLabel>
          <Select
            placeholder="Select role"
            value={formData.interview_for}
            onChange={handleRoleChange}
          >
            {Object.keys(skillsOptions).map((role, index) => (
              <option key={index} value={role}>{role.replace(/([A-Z])/g, ' $1').trim()}</option>
            ))}
          </Select>
          <FormHelperText>Step 1: Choose the role for which you're conducting the interview from the list provided.</FormHelperText>
        </FormControl>

        {/* Skill Evaluation */}
        <FormControl id="skill_to_be_assessed" mt={4} isRequired>
        <FormLabel>Select the Key Skills to Evaluate</FormLabel>
        <CheckboxGroup onChange={handleSkillChange} value={formData.skill_to_be_assessed}>
          <Stack direction="column">
            {currentSkillsOptions.map((skill, index) => (
              <Checkbox key={index} value={skill}>{skill}</Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
        <FormHelperText>Step 2: Once a role is selected, a list of related skills will be displayed. Select the skills you want to evaluate to tailor the interview to the role's key requirements.</FormHelperText>
      </FormControl>

        <Button mt={4} colorScheme="blue" type="submit">
          Start Interview
        </Button>
      </form>
    </Box>
  );
};

export default Form;
