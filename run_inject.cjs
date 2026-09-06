const fs = require('fs');
let code = fs.readFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', 'utf8');

const injection = `
import React, { useState, useEffect, useRef } from 'react';

function ErrorFallback({ error }) {
  return (
    <div className="p-10 bg-red-50 text-red-900 min-h-screen">
      <h1 className="text-2xl font-bold">Something went wrong in SuratWriter</h1>
      <pre className="mt-4 p-4 bg-white border border-red-200 rounded">{error.message}</pre>
      <pre className="mt-4 p-4 bg-white border border-red-200 rounded text-xs overflow-auto">{error.stack}</pre>
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
`;

if (!code.includes('class ErrorBoundary')) {
  code = code.replace(/import React, \{ useState, useEffect, useRef \} from ['"]react['"];/, injection);
  
  code = code.replace(/export default function SuratWriter\(\) \{/, 'function SuratWriterInner() {');
  
  code += `
export default function SuratWriter() {
  return (
    <ErrorBoundary>
      <SuratWriterInner />
    </ErrorBoundary>
  );
}
`;
  
  fs.writeFileSync('c:/APP_PROJEK/IMIGRASI SUPER WEB/src/pages/SuratWriter.jsx', code);
  console.log('ErrorBoundary injected');
} else {
  console.log('ErrorBoundary already injected');
}
