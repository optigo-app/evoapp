import React from "react";
import "./PritnModel.scss";

const PritnModel = ({ activeDetail }) => {
  console.log("activeDetail", activeDetail);
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
      acc.totalTaxAmount += item.taxAmount || 0;
      acc.totalPrice += item.price || 0;
      return acc;
    },
    {
      totalTaxAmount: 0,
      totalPrice: 0,
    }
  );
  totals.finalAmount = totals.totalTaxAmount + totals.totalPrice;

  console.log("totalstotals", totals);

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
            borderBottom: "0.5px solid lightgray",
            borderTop: "0.5px solid lightgray",
            alignItems: "center",
            padding: "3px",
            gap: "5px",
          }}
        >
          <p className="p_info_title">Date :</p>
          <p className="p_info_value">{formattedDate}</p>
        </div>
        <div
          style={{
            display: "flex",
            borderBottom: "0.5px solid lightgray",
            padding: "3px",
            gap: "5px",
          }}
        >
          <p className="p_info_title">Customer Name:</p>
          <p className="p_info_value">
            {userInfo?.firstname} {userInfo?.lastname}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            padding: "3px",
            borderBottom: "0.5px solid lightgray",
            gap: "5px",
          }}
        >
          <p className="p_info_title">Phone Number:</p>
          <p className="p_info_value">{userInfo?.CompanyTellNo}</p>
        </div>
      </div>

      {activeDetail?.map((dataa, index) => {
        return (
          <div
            key={index}
            style={{ borderBottom: "1px solid lightgray", padding: "5px" }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p className="deatilTitle_p">Sr# : {index + 1}</p>
                <p className="deatilTitle_p">Job# : {dataa?.JobNo}</p>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">Categoy : </p>
                  <p style={{ fontSize: "8px", margin: "0px" }}>
                    {dataa?.Category}
                  </p>
                </div>
                <div style={{ display: "flex" }}>
                  <p className="deatil_title_view">Design# : </p>
                  <p style={{ fontSize: "8px", margin: "0px" }}>
                    {dataa?.designNo}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">net wt : </p>
                  <p className="deatil_value_p">{dataa?.netWeight}</p>
                </div>
                <div>
                  <p className="deatil_totla_p">{dataa?.TotalMetalCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">dia wt : </p>
                  <p className="deatil_value_p">{dataa?.DiamondWtP}</p>
                </div>
                <div>
                  <p className="deatil_totla_p">{dataa?.TotalDiamondCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">cs wt : </p>
                  <p className="deatil_value_p">{dataa?.colorStoneWtP}</p>
                </div>
                <div>
                  <p className="deatil_totla_p">{dataa?.TotalColorstoneCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">misc wt </p>
                </div>
                <div>
                  <p className="deatil_totla_p">{dataa?.TotalMiscCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">making : </p>
                  <p className="deatil_value_p">{dataa?.MiscWtP}</p>
                </div>
                <div>
                  <p className="deatil_totla_p">{dataa?.TotalMakingCost}</p>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                  <p className="deatilTitle_p">gross wt : </p>
                  <p className="deatil_value_p">{dataa?.GrossWeight} gm</p>
                </div>
                <div>
                  <p className="deatil_totla_p">
                    <b>{dataa?.price}</b>
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
              borderBottom: "1px solid lightgray",
            }}
          >
            <p style={{ margin: "2px", fontSize: "9.5px" }}>Total</p>
            <p
              style={{
                margin: "2px",
                minWidth: "120px",
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "10px",
              }}
            >
              <b>{totals.totalPrice}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px solid lightgray",
            }}
          >
            <p style={{ margin: "2px", fontSize: "9.5px" }}>New Tax</p>
            <p
              style={{
                margin: "2px",
                minWidth: "120px",
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "10px",
              }}
            >
              <b>{totals.totalTaxAmount}</b>
            </p>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              borderBottom: "1px solid lightgray",
            }}
          >
            <p style={{ margin: "2px", fontSize: "9.5px" }}>Final Amount</p>
            <p
              style={{
                margin: "2px",
                minWidth: "120px",
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "10px",
              }}
            >
              <b>{totals.finalAmount}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PritnModel;
