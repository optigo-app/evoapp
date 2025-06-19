import axios from "axios";

const APIURL = (window.location.hostname === 'localhost'
    || window.location.hostname === 'nzen'
  ) ? 'http://nzen/jo/ExpressApp/EvoApp.aspx' : 'https://view.optigoapps.com/ExpressApp/EvoApp.aspx';

// const APIURL = "https://api.optigoapps.com/ReactStore/ReactStore.aspx";
// const APIURL = "https://livenx.optigoapps.com/api/report";
// const APIURL = "http://nzen/jo/ExpressApp/EvoApp.aspx";



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
