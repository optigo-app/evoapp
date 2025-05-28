import { CommonAPI } from "../CommonAPI/CommonAPI";

export const AddToCart = async (jobNumber) => {
    
  let Device_Token = sessionStorage.getItem('device_token');
  try {
    const body = {
      Mode: "AddToCart",
      Token: `"${Device_Token}"`,
      ReqData:
      '[{"ForEvt":"AddToCart","DeviceToken":"QZYYPPF24GECMJEH","AppId":"3","JobNo":"1/281339","CustomerId":18699,"IsWishList":0,"IsVisitor":0,"DiscountOnId":1,"Discount":100}]',
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
