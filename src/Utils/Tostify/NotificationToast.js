import React, { useEffect } from "react";
import "./NotificationToast.scss";

const NotificationToast = ({ message, bgColor, fontColor, duration = 10000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const animationStyle = {
    animation: `slideDown 0.5s ease-out forwards, slideUp 0.5s ease-in ${duration - 500}ms forwards`, // minus entry time
  };

  return (
    <div
      className="notification-toast"
      style={{
        backgroundColor: bgColor || "#4caf50",
        color: fontColor || "#fff",
        ...animationStyle,
      }}
    >
      {message}
    </div>
  );
};

export default NotificationToast;
