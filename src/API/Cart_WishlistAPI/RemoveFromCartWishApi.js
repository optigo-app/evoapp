import { CommonAPI } from "../CommonAPI/CommonAPI";

export const RemoveFromCartWishApi = async ({
  mode,
  flag,
  cartWishData,
  IsRemoveAll = 0,
}) => {
  const Device_Token = sessionStorage.getItem("device_token");
  if (!mode && !cartWishData) {
    return console.error("Mode are required for RemoveFromCartApi");
  }
  try {
    const body = {
      Mode: mode || "",
      Token: `${Device_Token}`,
      ReqData: JSON.stringify([
        {
          ForEvt: mode,
          DeviceToken: Device_Token,
          AppId: "3",
          CartWishId: flag == "single" ? cartWishData?.CartWishId : "",
          CustomerId: cartWishData?.CustomerId,
          IsVisitor: cartWishData?.IsVisitor,
          IsRemoveAll: IsRemoveAll,
        },
      ]),
    };

    console.log('body: ', body);
    const response = await CommonAPI(body);
    return response?.Data || [];
  } catch (error) {
    console.error("Error in RemoveFromCartApi:", error);
    return [];
  }
};
