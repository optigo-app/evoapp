import { CommonAPI } from "../CommonAPI/CommonAPI";

export const GetProfileData = async () => {
  try {
    const body = {
      Mode: "GetProfileData",
      Token: "QZYYPPF24GECMJEH",
      ReqData:
        '[{"ForEvt":"GetProfileData","DeviceToken":"QZYYPPF24GECMJEH","AppId":"3"}]',
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
