import React, { useState } from "react";
import "./JobScanPage.scss";
import { AiOutlineQrcode, AiOutlineHeart, AiOutlineShoppingCart, AiOutlineFileText } from "react-icons/ai";

const JobScanPage = () => {
  const [activeTab, setActiveTab] = useState("scan");

  const renderTabContent = () => {
    switch (activeTab) {
      case "scan":
        return <div className="tab-content">Scan Job content here</div>;
      case "wishlist":
        return <div className="tab-content">Wishlist content here</div>;
      case "cart":
        return <div className="tab-content">Cart content here</div>;
      case "note":
        return <div className="tab-content">Note content here</div>;
      default:
        return null;
    }
  };

  return (
    <div className="JobScanPageMain">
      <div className="top-tabs">
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
