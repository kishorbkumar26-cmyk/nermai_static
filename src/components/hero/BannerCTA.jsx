import React from 'react';
import { useNavigate } from 'react-router-dom';
import BrutButton from '../brutal/BrutButton';
import Magnetic from '../motion/Magnetic';

export default function BannerCTA({ label, link, icon }) {
  const navigate = useNavigate();
  
  const isExternal = link.startsWith('http');

  const handleClick = () => {
    if (isExternal) {
      window.open(link, '_blank');
    } else {
      navigate(link);
    }
  };

  return (
    <Magnetic strength={0.3}>
      <BrutButton onClick={handleClick} variant="primary">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {label}
          {icon && <i className={icon} />}
        </span>
      </BrutButton>
    </Magnetic>
  );
}
