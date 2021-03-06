import React from 'react';

export default ({ className = '', style = {} }) => (
  <svg
    className={className}
    style={style}
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 140 140"
  >
    <path
      fill="#39A1B7"
      d="M123.57,23.09l3.43-8.64H13l3.11,7.85c2.58,6.5,3.9,13.42,3.9,20.41V70v28.91c0,5.92-1.12,11.78-3.3,17.28 L13,125.55h114l-4.61-11.61c-1.59-4.01-2.41-8.29-2.41-12.61V70V41.87C119.98,35.44,121.2,29.06,123.57,23.09z"
    />
    <path
      fill="#43BDD7"
      d="M13,14.45l3.11,7.85c2.58,6.5,3.9,13.42,3.9,20.41V70v28.91c0,5.92-1.12,11.78-3.3,17.28L13,125.55h57V14.45 H13z"
    />
    <rect x="13" y="125.55" fill="#3793A5" width="114" height="14.45" />
    <rect x="70" y="125.55" fill="#328193" width="57" height="14.45" />
    <rect x="13" fill="#3793A5" width="114" height="14.45" />
    <rect x="70" fill="#328193" width="57" height="14.45" />
    <rect x="35" y="30" fill="#FFCD00" width="70" height="80" />
    <rect x="70" y="30" fill="#EDAB07" width="35" height="80" />
  </svg>
);
