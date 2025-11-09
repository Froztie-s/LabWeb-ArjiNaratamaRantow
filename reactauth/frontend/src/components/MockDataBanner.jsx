import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const MockDataBanner = () => {
  const { usingMockData, setUsingMockData } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (usingMockData) {
      setDismissed(false);
    }
  }, [usingMockData]);

  if (!usingMockData || dismissed) {
    return null;
  }

  return (
    <div className="mock-banner">
      <span>Using mock data because the API is unreachable.</span>
      <button
        type="button"
        onClick={() => {
          setDismissed(true);
          setUsingMockData(true); // still flagged, but banner stays hidden until next toggle
        }}
        aria-label="Dismiss warning"
      >
        ✕
      </button>
    </div>
  );
};

export default MockDataBanner;
