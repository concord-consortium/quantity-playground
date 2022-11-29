import React from "react";

export const IconColorMenu = () => {
  // Class names "foreground" and "background" are used to set the icon's colors in the CSS.
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h20v17a3 3 0 0 1-3 3H0V0z"/>
        <g transform="translate(2 2)" fillRule="nonzero">
          <circle cx="8" cy="8" r="8"/>
          <path className="foreground" d="M8 3c2.667 2.333 4 4.333 4 6 0 2.5-1.79 4-4 4s-4-1.5-4-4c0-1.667 1.333-3.667 4-6z"/>
          <path className="background" d="m8 5.04-.201.2C6.242 6.804 5.5 8.085 5.5 9c0 1.553.997 2.5 2.5 2.5 1.503 0 2.5-.947 2.5-2.5 0-.914-.742-2.195-2.299-3.76L8 5.04z"/>
        </g>
      </g>
    </svg>
  );
};
