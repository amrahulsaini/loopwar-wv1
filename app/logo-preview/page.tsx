'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '../components/Logo';

export default function LogoPreviews() {
  const variants = [
    { name: 'Modern Gaming', variant: 'modern' as const, description: 'Vibrant hexagonal design with gaming aesthetics' },
    { name: 'Minimal Clean', variant: 'minimal' as const, description: 'Simple and professional for business use' },
    { name: 'Gaming/Esports', variant: 'gaming' as const, description: 'Bold and energetic for gaming platforms' },
    { name: 'Tech Professional', variant: 'tech' as const, description: 'Circuit-inspired design for tech companies' }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '40px 20px', 
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', fontWeight: 'bold' }}>
            LoopWar Logo Variants
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8 }}>
            Choose the logo style that best fits your vision
          </p>
          <Link href="/" style={{ 
            display: 'inline-block', 
            marginTop: '20px', 
            padding: '10px 20px', 
            background: 'var(--color-primary)', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '5px' 
          }}>
            ← Back to Home
          </Link>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '30px' 
        }}>
          {variants.map((logoData, index) => (
            <div key={index} style={{
              background: 'var(--bg-secondary)',
              padding: '30px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
              transition: 'transform 0.3s ease'
            }}>
              <h3 style={{ 
                fontSize: '1.4rem', 
                marginBottom: '15px', 
                fontWeight: '600' 
              }}>
                {logoData.name}
              </h3>
              
              <p style={{ 
                fontSize: '0.9rem', 
                opacity: 0.7, 
                marginBottom: '25px' 
              }}>
                {logoData.description}
              </p>

              {/* Icon Only */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Icon Only</h4>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center' }}>
                  <Logo size={24} variant={logoData.variant} />
                  <Logo size={32} variant={logoData.variant} />
                  <Logo size={48} variant={logoData.variant} />
                  <Logo size={64} variant={logoData.variant} />
                </div>
              </div>

              {/* With Text */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>With Text</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                  <Logo size={32} showText={true} variant={logoData.variant} />
                  <Logo size={40} showText={true} variant={logoData.variant} />
                  <Logo size={48} showText={true} variant={logoData.variant} />
                </div>
              </div>

              {/* Dark Background Preview */}
              <div style={{
                background: '#1a1a1a',
                padding: '20px',
                borderRadius: '8px',
                marginTop: '20px'
              }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'white' }}>Dark Background</h4>
                <Logo size={40} showText={true} variant={logoData.variant} />
              </div>

              <button
                onClick={() => {
                  const newVariant = logoData.variant;
                  // Update homepage to use this variant
                  alert(`To use this logo, update your page.tsx to use variant="${newVariant}"`);
                }}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Use This Logo
              </button>
            </div>
          ))}
        </div>

        {/* Custom Logo Request */}
        <div style={{
          marginTop: '40px',
          padding: '30px',
          background: 'var(--bg-secondary)',
          borderRadius: '12px',
          border: '2px dashed var(--border-color)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '15px' }}>Don't Like Any of These?</h3>
          <p style={{ fontSize: '1rem', opacity: 0.8, marginBottom: '20px' }}>
            Tell me what style you want! I can create:
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px', 
            marginBottom: '20px' 
          }}>
            <div>• Minimalist text-only logos</div>
            <div>• Abstract geometric shapes</div>
            <div>• Gaming controller icons</div>
            <div>• Sword/weapon themes</div>
            <div>• Circuit/tech patterns</div>
            <div>• Custom color schemes</div>
          </div>
          <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>
            Just describe what you want and I'll create it!
          </p>
        </div>
      </div>
    </div>
  );
}
