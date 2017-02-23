import React from 'react';

const zeroPadMonth = (month) => {
  const prefix = month < 10 ? '0' : '';
  return `${prefix}${month}`;
};

const formatExpiry = ({ expMonth, expYear }) => `${zeroPadMonth(expMonth)}/${expYear % 100}`;

const Mastercard = () =>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 155 20">
    <path fill="#FFFFFF" d="M23.47,19.65v-8.8c0-3.31-2.11-5.54-5.51-5.57c-1.79-0.03-3.64,0.53-4.93,2.49c-0.97-1.55-2.49-2.49-4.63-2.49c-1.5,0-2.96,0.44-4.11,2.08V5.63H1.25v14.02h3.08v-7.77c0-2.43,1.35-3.72,3.43-3.72c2.02,0,3.05,1.32,3.05,3.69v7.8h3.08v-7.77c0-2.43,1.41-3.72,3.43-3.72c2.08,0,3.08,1.32,3.08,3.69v7.8H23.47z M69.05,5.63h-4.99V1.38h-3.08v4.25h-2.84v2.79h2.84v6.39c0,3.25,1.26,5.19,4.87,5.19c1.32,0,2.84-0.41,3.81-1.09l-0.88-2.61c-0.91,0.53-1.91,0.79-2.7,0.79c-1.52,0-2.02-0.94-2.02-2.35V8.42h4.99V5.63z M95.06,5.28c-1.76,0-2.9,0.82-3.69,2.05v-1.7h-3.02v14.02h3.05v-7.86c0-2.32,1-3.61,2.99-3.61c0.62,0,1.26,0.09,1.91,0.35l0.94-2.87C96.55,5.4,95.67,5.28,95.06,5.28L95.06,5.28z M55.73,6.74c-1.47-0.97-3.49-1.47-5.72-1.47c-3.55,0-5.84,1.7-5.84,4.49c0,2.29,1.7,3.7,4.84,4.14l1.44,0.21c1.67,0.23,2.46,0.67,2.46,1.47c0,1.09-1.11,1.7-3.2,1.7c-2.11,0-3.64-0.67-4.66-1.47l-1.44,2.38C45.29,19.41,47.4,20,49.69,20c4.05,0,6.39-1.91,6.39-4.57c0-2.46-1.85-3.75-4.9-4.19l-1.44-0.21c-1.32-0.18-2.38-0.44-2.38-1.38c0-1.03,1-1.64,2.67-1.64c1.79,0,3.52,0.67,4.37,1.2L55.73,6.74z M137.43,5.28c-1.76,0-2.9,0.82-3.69,2.05v-1.7h-3.02v14.02h3.05v-7.86c0-2.32,1-3.61,2.99-3.61c0.62,0,1.26,0.09,1.91,0.35l0.94-2.87C138.93,5.4,138.05,5.28,137.43,5.28L137.43,5.28z M98.14,12.64c0,4.25,2.96,7.36,7.48,7.36c2.11,0,3.52-0.47,5.04-1.67l-1.47-2.46c-1.14,0.82-2.35,1.26-3.67,1.26c-2.43-0.03-4.22-1.79-4.22-4.49c0-2.7,1.79-4.46,4.22-4.49c1.32,0,2.52,0.44,3.67,1.26l1.47-2.46c-1.52-1.2-2.93-1.67-5.04-1.67C101.1,5.28,98.14,8.39,98.14,12.64L98.14,12.64z M126.7,12.64V5.63h-3.05v1.7c-0.97-1.26-2.43-2.05-4.43-2.05c-3.93,0-7.01,3.08-7.01,7.36c0,4.28,3.08,7.36,7.01,7.36c1.99,0,3.46-0.79,4.43-2.05v1.7h3.05V12.64z M115.35,12.64c0-2.46,1.61-4.49,4.25-4.49c2.52,0,4.22,1.94,4.22,4.49c0,2.55-1.7,4.49-4.22,4.49C116.96,17.13,115.35,15.1,115.35,12.64L115.35,12.64z M78.55,5.28c-4.11,0-6.98,2.99-6.98,7.36c0,4.46,2.99,7.36,7.18,7.36c2.11,0,4.05-0.53,5.75-1.97l-1.5-2.26c-1.17,0.94-2.67,1.47-4.08,1.47c-1.96,0-3.75-0.91-4.19-3.43h10.41c0.03-0.38,0.06-0.76,0.06-1.17C85.18,8.27,82.48,5.28,78.55,5.28L78.55,5.28z M78.49,8.01c1.96,0,3.23,1.23,3.55,3.4h-7.27C75.09,9.38,76.32,8.01,78.49,8.01L78.49,8.01z M155,12.64V0h-3.05v7.33c-0.97-1.26-2.43-2.05-4.43-2.05c-3.93,0-7.01,3.08-7.01,7.36c0,4.28,3.08,7.36,7.01,7.36c1.99,0,3.46-0.79,4.43-2.05v1.7H155V12.64z M143.65,12.64c0-2.46,1.61-4.49,4.25-4.49c2.52,0,4.22,1.94,4.22,4.49c0,2.55-1.7,4.49-4.22,4.49C145.26,17.13,143.65,15.1,143.65,12.64L143.65,12.64z M40.66,12.64V5.63h-3.05v1.7c-0.97-1.26-2.43-2.05-4.43-2.05c-3.93,0-7.01,3.08-7.01,7.36c0,4.28,3.08,7.36,7.01,7.36c1.99,0,3.46-0.79,4.43-2.05v1.7h3.05V12.64z M29.31,12.64c0-2.46,1.61-4.49,4.25-4.49c2.52,0,4.22,1.94,4.22,4.49c0,2.55-1.7,4.49-4.22,4.49C30.92,17.13,29.31,15.1,29.31,12.64z" />
  </svg>;

const Visa = () =>
  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 155 20">
    <path fill="#FFFFFF" d="M150.77,0.37h-4.08c-1.26,0-2.23,0.33-2.78,1.6l-7.83,17.74h5.53c0,0,0.89-2.37,1.11-2.89h6.75c0.15,0.67,0.63,2.89,0.63,2.89h4.9L150.77,0.37L150.77,0.37z M144.28,12.84c0.45-1.11,2.12-5.42,2.12-5.42c-0.04,0.04,0.45-1.11,0.71-1.86l0.37,1.67c0,0,1,4.64,1.22,5.6H144.28z M137.23,0.82l-0.7,4.19l-0.48-0.22c-0.96-0.41-2.23-0.78-3.93-0.74c-2.08,0-3.01,0.85-3.01,1.67c0,0.89,1.11,1.52,2.97,2.41c3.04,1.37,4.45,3.04,4.42,5.27c-0.04,4.01-3.64,6.6-9.2,6.6c-2.37-0.04-4.64-0.48-5.9-1.04l0.74-4.34l0.67,0.3c1.74,0.71,2.86,1,4.97,1c1.52,0,3.15-0.59,3.15-1.89c0-0.85-0.67-1.45-2.75-2.41c-2-0.93-4.64-2.49-4.64-5.27c0.07-3.71,3.75-6.35,8.98-6.35C134.55,0,136.19,0.41,137.23,0.82L137.23,0.82z M112.81,19.7l3.3-19.37h5.27l-3.3,19.37H112.81z M114,0.33l-8.31,19.33h-5.6L95.37,2.86c-1.6-0.89-3.45-1.6-5.53-2.12l0.07-0.41h8.5c1.15,0.04,2.08,0.41,2.41,1.63l1.86,8.91l0.56,2.67l5.16-13.21H114z" />
  </svg>;

export default ({ brand = '', last4 = '****',  expMonth = '00', expYear = '0000' }) =>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 310 202">
    <defs>
      <rect id="topup-card-rect" x="0" y="0" width="306" height="198" rx="12"></rect>
      <filter id="topup-card-filter" width="200%" height="200%" x="-50%" y="-50%" filterUnits="objectBoundingBox">
        <feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1" result="shadowBlurOuter1" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" in="shadowBlurOuter1" />
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g transform="translate(2 1)">
        <use fill="#000" filter="url(#topup-card-filter)" href="#topup-card-rect" />
        <use fill="#14415F" href="#topup-card-rect" />
      </g>
      <path fill="#FFF" d="M121.064 155.2v-1.912h1.176c.208 0 .4-.112.4-.4 0-.288-.192-.4-.4-.4h-1.176v-1.912h2.752c.208 0 .4-.112.4-.4 0-.288-.192-.4-.4-.4h-3.552V156h3.552c.208 0 .4-.112.4-.4 0-.288-.192-.4-.4-.4h-2.752zm5.056.136c-.056.088-.096.176-.096.288 0 .208.192.376.392.376.264 0 .352-.2.464-.392l1.12-1.912 1.12 1.912c.112.192.2.392.464.392.2 0 .392-.168.392-.376 0-.112-.04-.2-.096-.288l-1.424-2.448 1.424-2.448c.056-.088.096-.176.096-.288 0-.208-.192-.376-.392-.376-.264 0-.352.2-.464.392L128 152.08l-1.12-1.912c-.112-.192-.2-.392-.464-.392-.2 0-.392.168-.392.376 0 .112.04.2.096.288l1.424 2.448-1.424 2.448zm6.464-1.688h1.752c.432 0 .76-.032 1.072-.384.296-.328.328-.616.328-1.024v-1.088c0-.432-.032-.728-.376-1.048-.288-.272-.552-.328-.92-.328h-2.656v5.824c0 .256.112.4.4.4.288 0 .4-.144.4-.4v-1.952zm0-3.072h1.776c.472 0 .576.12.576.576v1.12c0 .456-.104.576-.576.576h-1.776v-2.272z" opacity=".5" />
      <path fill="#FFF" fillOpacity=".5" d="M25 74.2148C25 72.9968 25.9964 72 27.2148 72h15.2316v12.7784H38.602l-5.2356-5.2356H25v-5.328zm22.1144 11.6708v8.2288h-8.2288v-8.2288h8.2288zM25 80.6504h7.9076l4.8708 4.8708v3.9252H25v-8.796zm0 9.9032h12.7784v3.9252l-4.8708 4.8708H25v-8.796zM42.446 108H27.2148C25.9964 108 25 107.0032 25 105.7852v-5.328h8.3664l5.2352-5.2352h3.8444V108zM61 105.7852c0 1.218-.9968 2.2148-2.2148 2.2148H43.5536V95.2216h3.8448l5.2352 5.2352H61v5.3284zm0-6.4356h-7.9076l-4.8708-4.8704V90.554H61v8.7956zm0-9.9032H48.2216v-3.9252l4.8708-4.8708H61v8.796zm0-9.9036h-8.3664l-5.2352 5.2356h-3.8448V72h15.2316C60.0032 72 61 72.9968 61 74.2148v5.328z" />
      <g transform="translate(130, -20) scale(0.5)">
        {brand.toLowerCase() === 'visa' ? <Visa /> : brand.toLowerCase() === 'mastercard' ? <Mastercard /> : null}
      </g>
      <text x="25" y="135" fill="#FFF" fillOpacity=".5" fontSize="25" fontFamily="monospace">
        <tspan>****</tspan>
        <tspan dx="13">****</tspan>
        <tspan dx="13">****</tspan>
        <tspan dx="13" fillOpacity="1">{last4}</tspan>
      </text>
      <text x="150" y="160" fill="#FFF" fillOpacity="1" fontSize="15">
        {formatExpiry({ expMonth, expYear })}
      </text>
    </g>
  </svg>;
