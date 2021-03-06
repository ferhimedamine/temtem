import React from "react";
import HeaderBar from "../primitives/HeaderBar";
import NavItem from "../primitives/NavItem";
import RequireAuth from "../primitives/RequireAuth";

export default function ExchangeHeaderBar() {
  return (
    <HeaderBar
      style={{ alignItems: "flex-end !important", padding: 5, fontSize: 18 }}
    >
      <React.Fragment>
        <NavItem url="/exchange" exact>
          All Listings
        </NavItem>
        <RequireAuth>
          <NavItem url="/exchange/listings" exact>
            My Listings
          </NavItem>
        </RequireAuth>
        <RequireAuth>
          <NavItem url="/exchange/saved">My Saved</NavItem>
        </RequireAuth>
      </React.Fragment>
    </HeaderBar>
  );
}
