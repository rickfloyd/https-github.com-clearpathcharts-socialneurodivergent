import React from 'react';

/* EXECUTIVE TRACK RECORD COMPONENT */
export const ExecutivePerformance = () => {
  return (
    <div className="performance-card">
      <div className="performance-metric-label">30-Year Cumulative Alpha</div>
      <div className="performance-metric-value">+1,420.65%</div>
      
      <div className="track-record-row">
        <span style={{color: '#888'}}>Institutional Grade</span>
        <span style={{color: '#00ff00'}}>Tier 1 Verified</span>
      </div>
      
      <div className="track-record-row">
        <span>Drawdown Recovery</span>
        <span>&lt; 14 Days</span>
      </div>
      
      <div className="track-record-row">
        <span>Sharpe Ratio</span>
        <span>3.21</span>
      </div>

      <div style={{marginTop: '15px', fontSize: '9px', color: '#444'}}>
        CLEARPATH PROPRIETARY DATA ENGINE v4.0 - SEC COMPLIANT
      </div>
    </div>
  );
};
