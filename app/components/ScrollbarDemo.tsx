'use client';

export default function ScrollbarDemo() {
  const sampleContent = Array.from({ length: 50 }, (_, i) => 
    `This is line ${i + 1} - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Custom Scrollbar Showcase</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Default Scrollbar */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Default Scrollbar</h3>
          <div className="h-48 overflow-y-auto border rounded p-3 bg-gray-50">
            {sampleContent.map((line, i) => (
              <p key={i} className="text-sm mb-2">{line}</p>
            ))}
          </div>
        </div>

        {/* Custom Scrollbar */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Custom Scrollbar</h3>
          <div className="custom-scrollbar h-48 border rounded p-3 bg-gray-50">
            {sampleContent.map((line, i) => (
              <p key={i} className="text-sm mb-2">{line}</p>
            ))}
          </div>
        </div>

        {/* Thin Scrollbar */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Thin Scrollbar</h3>
          <div className="thin-scrollbar h-48 overflow-y-auto border rounded p-3 bg-gray-50">
            {sampleContent.map((line, i) => (
              <p key={i} className="text-sm mb-2">{line}</p>
            ))}
          </div>
        </div>

        {/* Content Area Scrollbar */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Content Area Scrollbar</h3>
          <div className="content-area border rounded p-3 bg-gray-50">
            {sampleContent.map((line, i) => (
              <p key={i} className="text-sm mb-2">{line}</p>
            ))}
          </div>
        </div>

        {/* Hidden Scrollbar */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Hidden Scrollbar</h3>
          <div className="hide-scrollbar h-48 overflow-y-auto border rounded p-3 bg-gray-50">
            <p className="text-xs text-gray-600 mb-2">Scrollable but no visible scrollbar</p>
            {sampleContent.map((line, i) => (
              <p key={i} className="text-sm mb-2">{line}</p>
            ))}
          </div>
        </div>

        {/* Animated Scrollbar */}
        <div className="border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">Animated Scrollbar</h3>
          <div className="animated-scrollbar h-48 overflow-y-auto border rounded p-3 bg-gray-50">
            <p className="text-xs text-purple-600 mb-2">Gradient animated scrollbar</p>
            {sampleContent.map((line, i) => (
              <p key={i} className="text-sm mb-2">{line}</p>
            ))}
          </div>
        </div>

        {/* Code Scrollbar */}
        <div className="border rounded-lg p-4 md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-semibold mb-3">Code Block Scrollbar</h3>
          <div className="code-scrollbar h-32 overflow-auto border rounded p-3 bg-gray-900 text-green-400 font-mono text-sm">
            <pre>{`// Sample code with horizontal scrolling
function customScrollbarDemo() {
  const styles = {
    width: '8px',
    background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '10px',
    transition: 'all 0.3s ease'
  };
  
  return (
    <div className="scrollable-content">
      <p>This is a code block with custom scrollbar styling</p>
      <p>Perfect for displaying code snippets with beautiful scrollbars</p>
    </div>
  );
}

// Features included:
// - Smooth gradients
// - Hover effects  
// - Dark mode support
// - Mobile optimization
// - Cross-browser compatibility`}</pre>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Scrollbar Features Implemented:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <ul className="space-y-2">
            <li>✅ <strong>Cross-browser support</strong> (Webkit & Firefox)</li>
            <li>✅ <strong>Dark/Light mode compatibility</strong></li>
            <li>✅ <strong>Mobile responsive</strong> with touch scrolling</li>
            <li>✅ <strong>Smooth animations</strong> and hover effects</li>
            <li>✅ <strong>Multiple variants</strong> (thin, hidden, animated)</li>
          </ul>
          <ul className="space-y-2">
            <li>✅ <strong>Gradient backgrounds</strong> with visual appeal</li>
            <li>✅ <strong>Utility classes</strong> for easy implementation</li>
            <li>✅ <strong>Code-specific styling</strong> for syntax highlighting</li>
            <li>✅ <strong>Content area optimization</strong></li>
            <li>✅ <strong>Performance optimized</strong> CSS-only solution</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
