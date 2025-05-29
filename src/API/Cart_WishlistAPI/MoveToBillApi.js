import { CommonAPI } from "../CommonAPI/CommonAPI";

export const moveToBillApi = async ({
    cartWishData,
    IsMoveAll = 0,
}) => {
    const Device_Token = sessionStorage.getItem("device_token");
    if (!cartWishData) {
        return console.error("cartWishData are required for moveToBillApi");
    }
    try {
        const body = {
            Mode: "moveToBillApi",
            Token: `${Device_Token}`,
            ReqData: JSON.stringify([
                {
                    ForEvt: "moveToBillApi",
                    DeviceToken: Device_Token,
                    AppId: "3",
                    CartWishId: cartWishData?.CartWishId,
                    CustomerId: cartWishData?.CustomerId,
                    IsVisitor: cartWishData?.IsVisitor,
                    IsMoveAll: IsMoveAll,
                },
            ]),
        };
        console.log('body: ', body);

        const response = await CommonAPI(body);
        return response?.Data || [];
    } catch (error) {
        console.error("Error in moveToBillApi:", error);
        return [];
    }
};
