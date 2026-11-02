// src/indoor/CheckIn.jsx — the indoor's one front-desk QR code (the same one the app
// shows: jogo-venue:{id}). Show it on a screen at the desk, print it or save it.
// The printed sheet is pure black on white, so it comes out the same on a
// black-and-white office printer, a color one or at a print shop.
import React, { useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { BadgeCheck, Download, Printer } from 'lucide-react';
import { DISPLAY } from '../App.jsx';
import { asDate } from './actions';

const PRINT_CSS = `@media print {
  body * { visibility: hidden !important; }
  #qr-sheet, #qr-sheet * { visibility: visible !important; }
  #qr-sheet { position: fixed; inset: 0; display: flex !important; }
  @page { margin: 0.5in; }
}`;

export default function CheckIn({ venue, games }) {
  const code = `jogo-venue:${venue.id}`;
  const canvasRef = useRef(null);
  const save = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'jogo-check-in-code.png';
    a.click();
  };
  const now = new Date();
  const today = games.filter((g) => g.status !== 'cancelled' && asDate(g.startDateTime)?.toDateString() === now.toDateString());
  const booked = today.reduce((n, g) => n + (g.players || []).length, 0);
  const here = today.reduce((n, g) => n + (g.players || []).filter((p) => g.arrivals?.[p.userId]?.status === 'arrived').length, 0);
  return (
    <div className="space-y-4">
      <style>{PRINT_CSS}</style>
      <section className="bg-[#0B0D10] rounded-3xl p-6 sm:p-8 text-white text-center">
        <div className="text-xs font-extrabold tracking-[0.16em] uppercase text-[#4ADE80]">Front desk</div>
        <h2 style={DISPLAY} className="text-3xl sm:text-4xl leading-[1.35]">SCAN TO CHECK IN</h2>
        <p className="font-semibold text-white/70 text-sm">{venue.name}</p>
        <div className="bg-white rounded-3xl p-3 sm:p-4 mx-auto mt-4 w-full max-w-[300px]">
          <QRCodeSVG value={code} level="M" marginSize={1} style={{ width: '100%', height: 'auto', display: 'block' }} title="Your check-in code" />
        </div>
        <p className="font-semibold text-white/70 text-sm mt-4 max-w-sm mx-auto">Players scan this with the Jogo app when they arrive. It tells them their field, and shows here as verified.</p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          <button type="button" onClick={() => window.print()} className="h-11 px-5 rounded-full bg-white text-[#0B0D10] font-extrabold inline-flex items-center gap-2"><Printer size={17} /> Print</button>
          <button type="button" onClick={save} className="h-11 px-5 rounded-full bg-white/15 text-white font-extrabold inline-flex items-center gap-2"><Download size={17} /> Save image</button>
        </div>
      </section>

      <section className="bg-white rounded-3xl border border-[#E6E8EC] p-5 flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-[#E4F5EA] text-[#0E7A43] inline-flex items-center justify-center shrink-0"><BadgeCheck size={21} /></span>
        <div>
          <div className="font-extrabold text-[#0B0D10]">{today.length ? `${here} of ${booked} checked in today` : 'No games today'}</div>
          <div className="text-sm font-semibold text-[#6B7280]">{today.length ? 'This updates as players scan.' : 'Check-ins show here on game days.'}</div>
        </div>
      </section>

      {/* A full-resolution copy for Save image, off screen. */}
      <div ref={canvasRef} className="hidden"><QRCodeCanvas value={code} size={1200} level="M" marginSize={4} /></div>

      {/* The printed sheet: one ink, no fills. */}
      <div id="qr-sheet" className="hidden" style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', color: '#000000', textAlign: 'center' }}>
        <div style={{ ...DISPLAY, fontSize: 64, lineHeight: 1.3 }}>SCAN TO CHECK IN</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 28 }}>{venue.name}</div>
        <QRCodeSVG value={code} level="M" marginSize={2} fgColor="#000000" bgColor="#FFFFFF" style={{ width: '5.5in', height: '5.5in' }} />
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 28 }}>Open the Jogo app and tap Scan on your game.</div>
      </div>
    </div>
  );
}
