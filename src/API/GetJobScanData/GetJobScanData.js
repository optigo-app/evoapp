import { CommonAPI } from "../CommonAPI/CommonAPI";

export const GetJobScanData = async (jobNumber) => {
    
  let Device_Token = sessionStorage.getItem('device_token');
  try {
    const body = {
      Mode: "GetScanJobData",
      Token: `"${Device_Token}"`,
      ReqData:
        `[{"ForEvt":"GetScanJobData","DeviceToken":"${Device_Token}","AppId":"3","JobNo":"${jobNumber}"}]`,
    };
    const response = await CommonAPI(body);
    if (response?.Data) {
      return response?.Data;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};
