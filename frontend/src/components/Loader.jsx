import React from 'react';

const Loader = ({ text = "Loading Data", fullScreen = false }) => {
  return (
    <div className="liquid-loader-container animate-fade-in" style={fullScreen ? { minHeight: '50vh' } : { padding: '3rem 0' }}>
      <div className="liquid-loader"></div>
      <div className="loader-text">{text}...</div>
    </div>
  );
};

export default Loader;
