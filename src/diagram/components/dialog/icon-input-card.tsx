import React from "react";

export const IconInputCard = () => {
  // Class names "background, "foreground", and "border" are used to set the icon's color in the CSS.
  return (
    <svg width="60" height="24" viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" fillRule="evenodd">
        <path d="M0 0h60v24H0z"/>
        <path fill="#5A5A5A" fillRule="nonzero" d="M43 11.25h8V7.5l9 4.5-9 4.5v-3.75h-8z"/>
        <rect className="background" fillRule="nonzero" x="16" y="1" width="27" height="22" rx="2.5"/>
        <path className="border" d="M40.5 1A2.5 2.5 0 0 1 43 3.5v17a2.5 2.5 0 0 1-2.5 2.5h-22a2.5 2.5 0 0 1-2.5-2.5v-17A2.5 2.5 0 0 1 18.5 1h22zm0 1.5h-22a1 1 0 0 0-1 1v17a1 1 0 0 0 1 1h22a1 1 0 0 0 1-1v-17a1 1 0 0 0-1-1z" fillRule="nonzero"/>
        <circle fill="#949494" cx="42.75" cy="12" r="2.5"/>
        <path d="M37 5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H22a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h15zm0 1H22a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h15a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z" fill="#FFF" fillRule="nonzero"/>
        <g fill="#3F3F3F" fillRule="nonzero">
          <path d="m26.152 11.016.336 1.14h.012l.3-1.164L28.144 7.5h1.032l-2.556 6.132h-.408L23.608 7.5h1.104zM29.764 9.25h5.088v.864h-5.088V9.25zm0 1.992h5.088v.864h-5.088v-.864z"/>
        </g>
      </g>
    </svg>
  );
};
