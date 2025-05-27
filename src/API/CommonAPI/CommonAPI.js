import axios from "axios";

// const APIURL = (window.location.hostname === 'localhost'
//     || window.location.hostname === 'zen'
//     || window.location.hostname === 'fgstore.web') ? 'http://api.optigoapps.com/ReactStore/ReactStore.aspx' : 'http://api.optigoapps.com/ReactStore/ReactStore.aspx';

// const APIURL = "https://api.optigoapps.com/ReactStore/ReactStore.aspx";
// const APIURL = "https://livenx.optigoapps.com/api/report";
const APIURL = "http://nzen/jo/ExpressApp/EvoApp.aspx";

export const CommonAPI = async (body) => {
  try {
    const header = {
      "Content-Type": "application/json",
    };
    
    const response = await axios.post(APIURL, body, { headers: header });
    return response?.data;
  } catch (error) {
    console.error("error is..", error);
  }
};
