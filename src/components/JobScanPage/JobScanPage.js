import React, { useState, useEffect, useRef } from "react";
import "./JobScanPage.scss";
import {
  AiOutlineQrcode,
  AiOutlineHeart,
  AiOutlineShoppingCart,
  AiOutlineFileText,
} from "react-icons/ai";
import { Box, Typography, IconButton, Stack } from "@mui/material";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CartPage from "../../Page/Cart/CartPage";

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
        return <div className="tab-content">Scan Job content here</div>;
      case "wishlist":
        return <div className="tab-content">Wishlist content here</div>;
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
          <IconButton>
            <ChevronLeft className="back-arrow" onClick={() => navigate("/")} />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            Tab Control
          </Typography>
          <Box textAlign="right"></Box>
        </Stack>
      </Box>

      <div className={`top-tabs ${tabsFixed ? "fixed" : ""}`}>
        <div
          className={`tab-item ${activeTab === "scan" ? "active" : ""}`}
          onClick={() => setActiveTab("scan")}
        >
          <AiOutlineQrcode size={20} />
          <span>Scan Job</span>
        </div>
        <div
          className={`tab-item ${activeTab === "wishlist" ? "active" : ""}`}
          onClick={() => setActiveTab("wishlist")}
        >
          <AiOutlineHeart size={20} />
          <span>Wishlist</span>
        </div>
        <div
          className={`tab-item ${activeTab === "cart" ? "active" : ""}`}
          onClick={() => setActiveTab("cart")}
        >
          <AiOutlineShoppingCart size={20} />
          <span>Cart</span>
        </div>
        <div
          className={`tab-item ${activeTab === "note" ? "active" : ""}`}
          onClick={() => setActiveTab("note")}
        >
          <AiOutlineFileText size={20} />
          <span>Note</span>
        </div>
      </div>

      <div className="tab-body">{renderTabContent()}</div>
    </div>
  );
};

export default JobScanPage;
