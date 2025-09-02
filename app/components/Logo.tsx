import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ size = 48, className = '', showText = false }) => {
  return (
    <div className={`logo-wrapper ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img 
        src="/logo-final.jpg"
        alt="LoopWar Logo"
        width={size} 
        height={size} 
        style={{
          objectFit: 'contain',
          borderRadius: '8px',
          filter: 'var(--logo-filter)',
          background: 'transparent'
        }}
        className="logo-image"
      />
      
      {showText && (
        <span className="logo-text" style={{
          color: 'currentColor',
          fontSize: `${size * 0.5}px`,
          fontWeight: 600,
          fontFamily: 'var(--font-sora), Sora, sans-serif',
          letterSpacing: '1px'
        }}>
          LOOPWAR
        </span>
      )}
    </div>
  );
};

export default Logo;
