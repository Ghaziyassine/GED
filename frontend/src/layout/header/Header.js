import React from "react";
import classNames from "classnames";
import ChatDropdown from "./dropdown/chat/Chat";
import Toggle from "../sidebar/Toggle";
import Logo from "../logo/Logo";
import Menu from "../menu/Menu";
import User from "./dropdown/user/User";
import MobileMenu from "../menu/MobileMenu";
import menu from "../menu/MenuData";
import LanguageHead from "./dropdown/language/Language";

const Header = ({ fixed, theme, visibility, toggleSidebar, mobileView, className, ...props }) => {
  const headerClass = classNames({
    "nk-header is-regular": true,
    "nk-header-fixed": fixed,
    [`is-light`]: theme === "white",
    [`is-${theme}`]: theme !== "white" && theme !== "light",
    [`${className}`]: className,
  });

  return (
    <div className={headerClass}>
      <div className="container-fluid">
        <div className="nk-header-wrap">
          <div className="nk-menu-trigger mr-sm-2 d-lg-none">
            <Toggle className="nk-nav-toggle nk-quick-nav-icon" icon="menu" click={toggleSidebar} />
          </div>
          <div className="nk-header-brand">
            <Logo />
          </div>
          <div
            className={`nk-header-menu ml-auto ${mobileView ? "mobile-menu" : ""}  ${
              visibility ? "nk-header-active" : ""
            }`}
          >
            <div className="nk-header-mobile">
              <div className="nk-header-brand">
                <Logo />
              </div>
              <div className="nk-menu-trigger mr-n2">
                <Toggle className="nk-nav-toggle nk-quick-nav-icon" icon="arrow-left" click={toggleSidebar} />
              </div>
            </div>
            {mobileView ? <MobileMenu data={menu} sidebarToggle={toggleSidebar} mobileView={mobileView} /> : <Menu />}
          </div>
          {visibility && <div className="nk-header-overlay" onClick={toggleSidebar}></div>}
          <div className="nk-header-tools">
            <ul className="nk-quick-nav">
              <li className="chats-dropdown">
                <ChatDropdown />
              </li>
              <li className="language-dropdown d-none d-sm-block mr-n1">
                <LanguageHead />
              </li>
              <li className="user-dropdown">
                <User />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Header;
