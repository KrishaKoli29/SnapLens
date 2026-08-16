import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [stats, setStats] = useState({ totalInteractions: 0, smiles: 0, kisses: 0, taps: 0, recentLog: [] });

  useEffect(() => {
    socket.on('dashboardUpdate', (data) => setStats(data));
    return () => socket.off('dashboardUpdate');
  }, []);

  return (
    <div style={{ backgroundColor: '#09090b', color: '#fff', minHeight: '100vh', padding: '40px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #27272a', paddingBottom: '20px', marginBottom: '40px' }}>
        <h1 style={{ color: '#ec4899', margin: 0 }}>✨ SnapSight: Glam Analytics</h1>
        <p style={{ color: '#a1a1aa', margin: '5px 0 0 0' }}>Real-time Lens Engagement Metrics</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <StatCard title="Total Engagement" value={stats.totalInteractions} color="#fbbf24" />
        <StatCard title="Smiles Detected" value={stats.smiles} color="#ec4899" />
        <StatCard title="Kisses Blown" value={stats.kisses} color="#f43f5e" />
        <StatCard title="Screen Taps" value={stats.taps} color="#8b5cf6" />
      </div>

      <div style={{ backgroundColor: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
        <h3 style={{ marginTop: 0, color: '#e4e4e7' }}>Live Interaction Feed</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {stats.recentLog.length === 0 ? <p style={{ color: '#71717a' }}>Waiting for user interaction...</p> : null}
          {stats.recentLog.map((log, index) => (
            <div key={index} style={{ padding: '12px 16px', backgroundColor: '#27272a', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold', color: '#f472b6' }}>{log.action}</span>
              <span style={{ color: '#a1a1aa' }}>{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Reusable UI Component for the numbers
function StatCard({ title, value, color }) {
  return (
    <div style={{ backgroundColor: '#18181b', padding: '24px', borderRadius: '16px', border: '1px solid #27272a' }}>
      <h4 style={{ color: '#a1a1aa', margin: '0 0 10px 0', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>{title}</h4>
      <p style={{ color: color, fontSize: '3rem', margin: 0, fontWeight: 'bold' }}>{value}</p>
    </div>
  );
}

export default App;