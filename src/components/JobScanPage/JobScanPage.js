import React, { useState, useEffect, useRef } from "react";
import "./JobScanPage.scss";
import { Box, Typography, IconButton, Stack, Button } from "@mui/material";
import {
  ChevronLeft,
  FileSpreadsheet,
  Heart,
  House,
  QrCode,
  ShoppingCart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CartPage from "../../Page/Cart/CartPage";
import WishlistPage from "../../Page/Wishlist/WishlistPage";
import Scanner from "./Scanner/Scanner";

const JobScanPage = () => {
  const [activeTab, setActiveTab] = useState("scan");
  const [tabsFixed, setTabsFixed] = useState(false);
  const headerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (!headerRef.current) return;
      const headerBottom = headerRef.current.getBoundingClientRect().bottom;
      setTabsFixed(headerBottom <= 0);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case "scan":
        return (
          <div className="tab-content">
            <Scanner />
          </div>
        );
      case "wishlist":
        return (
          <div className="tab-content">
            <WishlistPage />
          </div>
        );
      case "cart":
        return (
          <div className="tab-content">
            <CartPage />
          </div>
        );
      case "note":
        return <div className="tab-content">Note content here</div>;
      default:
        return null;
    }
  };

  return (
    <div className="JobScanPageMain">
      <Box className="CartHeader_main" ref={headerRef}>
        <Stack className="header-container">
          <p
            style={{
              width: "33.33%",
              color: "white",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            Evo Control
          </p>
          <Typography
            variant="h6"
            style={{ width: "33.33%" }}
            fontWeight={600}
          ></Typography>
          <Box textAlign="right" style={{ width: "33.33%" }}>
            <Button
              className="AddCustomer_Btn"
              onClick={() => navigate("/")}
              variant="contained"
            >
              <House />
            </Button>
          </Box>
        </Stack>
      </Box>

      <div className={`top-tabs ${tabsFixed ? "fixed" : ""}`}>
        <div
          className={`tab-item ${activeTab === "scan" ? "active" : ""}`}
          onClick={() => setActiveTab("scan")}
        >
          <QrCode size={20} />
          <span>Scan Job</span>
        </div>
        <div
          className={`tab-item ${activeTab === "wishlist" ? "active" : ""}`}
          onClick={() => setActiveTab("wishlist")}
        >
          <Heart size={20} />
          <span>Wishlist</span>
        </div>
        <div
          className={`tab-item ${activeTab === "cart" ? "active" : ""}`}
          onClick={() => setActiveTab("cart")}
        >
          <ShoppingCart size={20} />
          <span>Cart</span>
        </div>
        <div
          className={`tab-item ${activeTab === "note" ? "active" : ""}`}
          onClick={() => setActiveTab("note")}
        >
          <FileSpreadsheet size={20} />
          <span>Note</span>
        </div>
      </div>

      <div className="tab-body">{renderTabContent()}</div>
    </div>
  );
};

export default JobScanPage;
