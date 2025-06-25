import React, { useState } from "react";
import "./FeedBack.scss";
import {
  Box,
  Button,
  Typography,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { House } from "lucide-react";

const questions = [
  { id: 1, question: "How would you rate our service?" },
  { id: 2, question: "Was our support helpful?" },
  { id: 3, question: "Was our team polite and professional?" },
  { id: 4, question: "Would you recommend us to others?" },
];

const FeedBack = () => {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});

  const handleChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSave = () => {
    console.log("Feedback submitted:", answers);
    navigate("/"); // or stay on the page
  };

  return (
    <div>
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Add Customer</p>
          <div style={{ display: "flex", gap: "15px" }}>
            <Button
              className="AddCustomer_Btn"
              onClick={() => navigate("/")}
              variant="contained"
            >
              <House />
            </Button>
          </div>
        </div>
      </div>
      <div className="feedback-wrapper">
        <Box className="feedback-form">
          {questions.map((q) => (
            <FormControl key={q.id} fullWidth className="question-block">
              <Typography className="question-text">{q.question}</Typography>
              <RadioGroup
                row
                value={answers[q.id] || ""}
                onChange={(e) => handleChange(q.id, e.target.value)}
              >
                <FormControlLabel
                  value="Good"
                  control={<Radio />}
                  label="Good"
                />
                <FormControlLabel
                  value="Average"
                  control={<Radio />}
                  label="Average"
                />
                <FormControlLabel value="Bad" control={<Radio />} label="Bad" />
              </RadioGroup>
            </FormControl>
          ))}

          <Box className="action-buttons">
            <Button variant="contained" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => navigate("/")}>
              Cancel
            </Button>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default FeedBack;
