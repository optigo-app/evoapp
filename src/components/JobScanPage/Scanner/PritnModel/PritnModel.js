import React from "react";
import "./PritnModel.scss";
import { ToWords } from "to-words";

const PritnModel = ({ activeDetail }) => {
  const toWords = new ToWords({
    localeCode: "en-IN", // Indian English
    converterOptions: {
      currency: true, // treat number as money
      ignoreDecimal: false, // keep paise
      doNotAddOnly: false, // add “only” at the end
      currencyOptions: {
        // optional – override defaults
        name: "Rupee",
        plural: "Rupees",
        symbol: "₹",
        fractionalUnit: {
          name: "Paise",
          plural: "Paise",
        },
      },
    },
  });

  console.log("activeDetailactiveDetail", activeDetail);
  const userInfo = JSON.parse(sessionStorage.getItem("profileData"));
  const today = new Date();
  const formattedDate = today
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toLowerCase();

  const totals = (activeDetail || []).reduce(
    (acc, item) => {
      acc.totalTaxAmount += Number(item.taxAmount) || 0;
      acc.totalPrice += Number(item.price) || 0;
      acc.allTotalDiscount += Number(item.discountValue) || 0;
      return acc;
    },
    {
      totalTaxAmount: 0,
      totalPrice: 0,
      allTotalDiscount: 0,
    }
  );
  totals.finalAmount = totals.totalTaxAmount + totals.totalPrice;
  return (
    <div className="printModelMain">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <p className="P_toptitle">{userInfo?.CompanyFullName}</p>
        <p className="p_address">
          {userInfo?.CompanyAddress} {userInfo?.CompanyAddress2}{" "}
        </p>
        <p className="p_city">
          {userInfo?.CompanyCity}-{userInfo?.CompanyPinCode}
        </p>
        <p className="p_gst">{userInfo?.GSTNo}</p>
        <p className="p_estimate">Estimate</p>
      </div>
      <div className="info_section_main">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0px 5px",
          }}
        >
          <div style={{ display: "flex", gap: "2px" }}>
            <p className="p_info_title">Customer name : </p>
            <p className="p_info_value">
              {userInfo?.firstname} {userInfo?.lastname}
            </p>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            <p className="p_info_title">Date : </p>
            <p className="p_info_value">{formattedDate}</p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            padding: "0px 5px",
            gap: "2px",
          }}
        >
          <p className="p_info_title">Phone number : </p>
          <p className="p_info_value">{userInfo?.CompanyTellNo}</p>
        </div>
      </div>

      {activeDetail?.map((dataa, index) => {
        return (
          <div
            key={index}
            style={{
              borderBottom: "1px dotted black",
              padding: "5px",
              marginTop: "5px",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p className="deatilTitle_p">Sr# : {index + 1}</p>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "2px" }}
                >
                  <p className="deatil_title_view">Job# : </p>
                  <p style={{ fontSize: "8px", margin: "0px" }}>
                    {dataa?.JobNo}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: "2px",
                }}
              >
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Category</p>
                  <p className="deatilTitle_com">:</p>
                  <p style={{ fontSize: "8px", margin: "0px" }}>
                    {dataa?.Category}
                  </p>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "2px" }}
                >
                  <p className="deatil_title_view">Design# : </p>
                  <p style={{ fontSize: "8px", margin: "0px" }}>
                    {dataa?.designNo}
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "0px",
                }}
              >
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Net wt</p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">{dataa?.netWeight}</p>
                </div>
                <div>
                  <p className="deatil_totla_p">₹ {dataa?.TotalMetalCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Dia wt</p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">
                    {dataa?.DiamondWtP?.replace(/ct/gi, "")
                      .replace(/pc/gi, "")
                      .trim()}
                  </p>
                </div>
                <div>
                  <p className="deatil_totla_p">₹ {dataa?.TotalDiamondCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">CS wt</p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">
                    {dataa?.colorStoneWtP
                      ?.replace(/ct/gi, "")
                      .replace(/pc/gi, "")
                      .trim()}
                  </p>
                </div>
                <div>
                  <p className="deatil_totla_p">
                    ₹ {dataa?.TotalColorstoneCost}
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Misc wt </p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">
                    {dataa?.MiscWtP?.replace(/gm/gi, "")
                      .replace(/pc/gi, "")
                      .trim()}
                  </p>
                </div>
                <div>
                  <p className="deatil_totla_p">₹ {dataa?.TotalMiscCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Making</p>
                  <p className="deatilTitle_com">:</p>
                </div>
                <div>
                  <p className="deatil_totla_p">₹ {dataa?.TotalMakingCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Gross wt</p>
                  <p className="deatilTitle_com">:</p>
                  <p className="deatil_value_p">{dataa?.GrossWeight} gm</p>
                </div>
                <div>
                  <p className="deatil_totla_p">₹ {dataa?.price}</p>
                </div>
              </div>

              {dataa?.discountValue && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex" }}>
                    <p className="deatilTitle_p">Discount</p>
                    <p
                      className="deatil_totla_p"
                      style={{
                        minWidth: "85px",
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      ₹ {dataa?.discountValue}
                    </p>
                  </div>
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Amount</p>
                  <p
                    className="deatil_totla_p"
                    style={{
                      minWidth: "35px",
                      display: "flex",
                      justifyContent: "flex-end",
                    }}
                  >
                    <b>
                      ₹{" "}
                      {dataa?.discountValue
                        ? dataa?.price - dataa?.discountValue
                        : dataa?.price}
                    </b>
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div style={{ display: "flex" }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px" }}>
              <b>Total Discount</b>
            </p>
            <p className="totalPriceValus">
              <b>₹ {totals.allTotalDiscount}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px" }}>
              <b>Total Amount</b>
            </p>
            <p className="totalPriceValus">
              <b>₹ {totals.totalPrice}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px" }}>
              <b>Tax Amount</b>
            </p>
            <p className="totalPriceValus">
              <b>₹ {totals.totalTaxAmount}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px" }}>
              <b>Final Amount</b>
            </p>
            <p className="totalPriceValus">
              <b>₹ {totals.finalAmount}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px dotted black",
              paddingBottom: "2px",
            }}
          >
            <p style={{ margin: "2px", fontSize: "8px", width: "12%" }}>
              <b>In Word :</b>
            </p>
            <p
              style={{
                margin: "2px",
                minWidth: "100px",
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "8px",
                width: "88%",
              }}
            >
              <b>{toWords.convert(Number(totals.finalAmount))}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PritnModel;
