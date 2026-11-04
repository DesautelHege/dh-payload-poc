import React from 'react'

// The DH mark drawn in currentColor so it follows the admin's light and dark modes
const DHMark: React.FC<{ className?: string; title?: string }> = ({ className, title = 'DH' }) => (
  <svg
    aria-label={title}
    className={className}
    role="img"
    viewBox="0 0 271.078 149.626"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M252.943,58.121c-11.705-11.804-27.737-18.293-44.357-17.953-2.069,0-4.137.157-6.04.316V.016h-69.952v62.041c-2.369-15.379-9.744-29.548-20.982-40.312C97.554,7.457,78.228-.404,58.188.016H0v149.594h58.188c20.085.42,39.459-7.438,53.577-21.729,11.138-10.818,18.449-24.969,20.828-40.312v62.041h138.474v-47.555c.318-16.526-6.247-32.44-18.124-43.935Z"
      fill="currentColor"
    />
  </svg>
)

// Login and create-first-user screens
export const AdminLogo: React.FC = () => (
  <div className="dh-admin-logo">
    <DHMark />
    {/* <span>Content studio</span> */}
  </div>
)

// Top-left of the nav
export const AdminIcon: React.FC = () => <DHMark className="dh-admin-icon" />
