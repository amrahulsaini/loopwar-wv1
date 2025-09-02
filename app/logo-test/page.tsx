'use client';

import Logo from '../components/Logo';

export default function LogoTest() {
  return (
    <div style={{ 
      padding: '50px', 
      background: 'white', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '30px'
    }}>
      <h1>Logo Test Page</h1>
      
      <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '10px' }}>
        <h3>Small Logo (32px)</h3>
        <Logo size={32} />
      </div>
      
      <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '10px' }}>
        <h3>Medium Logo (40px)</h3>
        <Logo size={40} />
      </div>
      
      <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '10px' }}>
        <h3>Large Logo (64px)</h3>
        <Logo size={64} />
      </div>
      
      <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '10px' }}>
        <h3>Logo with Text (40px)</h3>
        <Logo size={40} showText={true} />
      </div>
      
      <div style={{ background: '#333', padding: '20px', borderRadius: '10px' }}>
        <h3 style={{ color: 'white' }}>Logo on Dark Background</h3>
        <Logo size={40} showText={true} />
      </div>
    </div>
  );
}
