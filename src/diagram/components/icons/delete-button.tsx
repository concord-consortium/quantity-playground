import React from "react";

interface IProps {
  onClick?: () => void;
  x: number;
  y: number;
}
export const IconDeleteButton = ({ onClick, x, y }: IProps) => {
  const size = 20;
  // This svg has been modified from the original from zepelin. Be careful when updating or replacing it.
  return (
    <svg width={`${size}px`} height={`${size}px`} viewBox={`0 0 ${size} ${size}`} x={x - size / 2} y={y - size / 2} xmlns="http://www.w3.org/2000/svg">
      <g className="delete-button" onClick={onClick} stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <rect fillOpacity="0" fill="#BFE0F7" x="0" y="0" width="20" height="20"></rect>
        <rect fill="#7E7E7E" x="1" y="1" width="18" height="18" rx="9"></rect>
        <path d="M11.4121,10 L13.9271,7.485 C14.0241,7.388 14.0241,7.229 13.9271,7.132 L12.8681,6.073 C12.7701,5.976 12.6121,5.976 12.5151,6.073 L10.0001,8.588 L7.4851,6.073 C7.3881,5.976 7.2291,5.976 7.1321,6.073 L6.0731,7.132 C5.9751,7.229 5.9751,7.388 6.0731,7.485 L8.5881,10 L6.0731,12.515 C5.9751,12.612 5.9751,12.771 6.0731,12.868 L7.1321,13.927 C7.2291,14.024 7.3881,14.024 7.4851,13.927 L10.0001,11.412 L12.5151,13.927 C12.6121,14.024 12.7701,14.024 12.8681,13.927 L13.9271,12.868 C14.0241,12.771 14.0241,12.612 13.9271,12.515 L11.4121,10 Z" fill="#FFFFFF"></path>
      </g>
    </svg>
  );
};
