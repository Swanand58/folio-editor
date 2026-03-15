'use client';

import { FolioEditor } from '../components/FolioEditor';

export default function Home() {
  return (
    <div>
      <header style={{
        padding: '12px 24px',
        borderBottom: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          Folio Editor
        </h1>
        <span style={{ fontSize: '13px', color: '#888' }}>
          Phase 1 — MVP Demo
        </span>
      </header>
      <FolioEditor />
    </div>
  );
}
