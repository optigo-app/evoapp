import { CommonAPI } from "../CommonAPI/CommonAPI";

export const GetCartWishApi = async ({ mode }) => {
    if (!mode) {
        return console.error("Mode is required for GetCartApi");
    }
    const reqData = [
        {
            ForEvt: mode,
            DeviceToken: "QZYYPPF24GECMJEH",
            AppId: "3",
            CustomerId: "18699",
            IsVisitor: "0",
        }
    ];
    try {
        const body = {
            Mode: mode,
            Token: "QZYYPPF24GECMJEH",
            ReqData: JSON.stringify(reqData),
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
