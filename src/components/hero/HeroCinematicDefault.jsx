import React from 'react';
import { LMS_URL } from '../../constants';

/* Cinematic hero shown when admin has not yet uploaded any slide images */
export default function HeroCinematicDefault({ cta }) {
  return (
    <div className="hero-cinematic-default">
      <div className="hero-cinematic-grid" aria-hidden="true" />
      <div className="hero-cinematic-radial" aria-hidden="true" />
      <div className="hero-cinematic-content">
        <div className="hero-cinematic-eyebrow">
          <span className="hero-eyebrow-dot" />
          NERMAI IAS ACADEMY · PUDUCHERRY
        </div>
        <h1 className="hero-cinematic-title">
          Prepare with<br /><em>Purpose.</em>
        </h1>
        <p className="hero-cinematic-subtitle">
          Nermai Education · A definite path to success
        </p>
        <p className="hero-cinematic-tagline">
          Serve with Integrity.
        </p>
        <div className="hero-cinematic-actions">
          <a href={cta?.link || LMS_URL} className="btn btn-primary btn-lg" id="hero-enroll-btn" target="_blank" rel="noopener noreferrer">
            {cta?.label || 'Enroll Now'} <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }} />
          </a>
          <a href="/why-nermai" className="btn btn-ghost btn-lg">Our Story</a>
        </div>
        <div className="hero-cinematic-meta">
          UPSC · TNPSC · TN POLICE · BANKING · PUDUCHERRY EXAM
        </div>
      </div>
    </div>
  );
}
