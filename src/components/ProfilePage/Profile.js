import React from "react";
import "./Profile.scss";
import { Button } from "@mui/material";
import { House } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();

  return (
    <div>
      <div className="Header_main">
        <div className="header-container">
          <p className="header_title">Profile</p>
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
    </div>
  );
};

export default Profile;
