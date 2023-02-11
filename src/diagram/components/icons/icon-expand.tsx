import React from "react";

export const IconExpand = () => {
  // Class name "foreground" is used to set the icon's color in the CSS.
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h20v20H0z"/>
        <circle cx="10" cy="10" r="8"/>
        <path className="foreground" fillRule="nonzero" d="M12.056 7.5 10 9.606 7.945 7.5 6.5 8.915 10 12.5l3.501-3.585z"/>
      </g>
    </svg>
  );
};
