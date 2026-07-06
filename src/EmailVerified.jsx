import React, { useEffect, useState } from 'react';

const PHOTOS = [
  { src: '/verified/photos/web/pic2.jpg',  w: 520, h: 388, x: 540, y: 452, r: -3,  z: 2  },
  { src: '/verified/photos/web/pic1.jpg',  w: 472, h: 407, x: 378, y: 384, r: -9,  z: 4  },
  { src: '/verified/photos/web/pic9.jpg',  w: 460, h: 345, x: 698, y: 416, r: 8,   z: 3  },
  { src: '/verified/photos/web/pic6.jpg',  w: 270, h: 385, x: 298, y: 332, r: -14, z: 5  },
  { src: '/verified/photos/web/pic4.jpg',  w: 262, h: 372, x: 566, y: 328, r: 3,   z: 6  },
  { src: '/verified/photos/web/pic7.jpg',  w: 274, h: 390, x: 766, y: 312, r: 12,  z: 6  },
  { src: '/verified/photos/web/pic10.jpg', w: 440, h: 330, x: 566, y: 634, r: -5,  z: 7  },
  { src: '/verified/photos/web/pic3.jpg',  w: 300, h: 428, x: 344, y: 594, r: -8,  z: 8  },
  { src: '/verified/photos/web/pic5.jpg',  w: 282, h: 402, x: 498, y: 576, r: 4,   z: 10 },
  { src: '/verified/photos/web/pic8.jpg',  w: 288, h: 388, x: 726, y: 626, r: 9,   z: 9  },
];

const FONTS = (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
  </>
);

export default function EmailVerified() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Desktop: scale the fixed 1080×1080 stage to fit the viewport
  useEffect(() => {
    if (isMobile) return;
    const stage = document.getElementById('verified-stage');
    if (!stage) return;
    function fit() {
      const s = Math.min(window.innerWidth, window.innerHeight) / 1080;
      stage.style.transform = `scale(${s})`;
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [isMobile]);

  // Mobile: scale only the photo cluster to fill the space between header and caption
  useEffect(() => {
    if (!isMobile) return;
    const collage = document.getElementById('verified-mobile-collage');
    const wrap    = document.getElementById('verified-mobile-wrap');
    if (!collage || !wrap) return;

    // Measured bounding box of the photo cluster within the 1080×1080 canvas
    const CX = 531, CY = 466, CW = 837, CH = 747;

    function fit() {
      // Scale to fill the full available width, then shrink the wrap to
      // exactly the cluster's rendered height — no dead space below the photos.
      const s  = wrap.clientWidth / CW;
      wrap.style.height = `${Math.ceil(CH * s)}px`;
      const dx = 540 - CX;
      const dy = 540 - CY;
      collage.style.transform =
        `translate(calc(-50% + ${dx * s}px), calc(-50% + ${dy * s}px)) scale(${s})`;
    }

    fit();
    requestAnimationFrame(fit);
    window.addEventListener('resize', fit);
    window.addEventListener('orientationchange', fit);
    if (document.fonts?.ready) document.fonts.ready.then(fit);

    return () => {
      window.removeEventListener('resize', fit);
      window.removeEventListener('orientationchange', fit);
    };
  }, [isMobile]);

  // ── Mobile layout ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{
        position: 'fixed', inset: 0, height: '100dvh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        background: '#0E0F0D', overflow: 'hidden',
        fontFamily: "'Archivo', sans-serif",
      }}>
        {FONTS}

        {/* Header */}
        <div style={{
          flexShrink: 0, position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(16px, 3.2vw, 40px) clamp(16px, 3vw, 48px)',
        }}>
          <img
            src="/verified/newIcon-final.png"
            alt="JOGO"
            style={{
              width: 88, height: 88, display: 'block',
              filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))',
            }}
          />
          <span style={{
            position: 'absolute', right: 20,
            top: '50%', transform: 'translateY(-50%)',
            fontWeight: 700, fontSize: 13,
            letterSpacing: 3, color: '#B6F03C', whiteSpace: 'nowrap',
          }}>EST. 2026</span>
        </div>

        {/* Collage — fills remaining space between header and caption */}
        <div id="verified-mobile-wrap" style={{
          flexShrink: 0, position: 'relative', overflow: 'hidden', width: '100%',
        }}>
          <div id="verified-mobile-collage" style={{
            position: 'absolute', left: '50%', top: '50%',
            width: 1080, height: 1080,
            transformOrigin: 'center center',
          }}>
            {PHOTOS.map((p, i) => (
              <img
                key={i}
                src={p.src}
                alt=""
                style={{
                  position: 'absolute', display: 'block', objectFit: 'cover',
                  border: '5px solid #B6F03C',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.55)',
                  width: p.w, height: p.h,
                  left: p.x, top: p.y,
                  transform: `translate(-50%, -50%) rotate(${p.r}deg)`,
                  zIndex: p.z,
                }}
              />
            ))}
          </div>
        </div>

        {/* Caption */}
        <div style={{
          flexShrink: 0, textAlign: 'center',
          padding: 'clamp(14px, 3vw, 40px) clamp(12px, 3vw, 48px) clamp(22px, 4vw, 48px)',
          background: 'linear-gradient(to top, #0E0F0D 70%, rgba(14,15,13,0) 100%)',
        }}>
          <div style={{ margin: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{
                fontFamily: "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900, color: '#F7F6F1',
                fontSize: 'clamp(28px, 7vw, 58px)',
                letterSpacing: -1, whiteSpace: 'nowrap', lineHeight: 1,
              }}>WELCOME TO THE</span>
              <img
                src="/verified/photos/jogo-green.png"
                alt="jogo"
                style={{ height: 'clamp(35px, 8.8vw, 74px)', width: 'auto', flexShrink: 0, marginBottom: 4 }}
              />
            </div>
            <div style={{
              fontFamily: "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900, color: '#F7F6F1',
              fontSize: 'clamp(28px, 7vw, 58px)',
              letterSpacing: -1, textAlign: 'center', lineHeight: 0.98,
            }}>MOVEMENT</div>
          </div>
          <p style={{
            margin: 'clamp(10px, 2vw, 16px) auto 0',
            color: '#c9cabf', fontWeight: 500,
            fontSize: 'clamp(17px, 4.2vw, 22px)',
            lineHeight: 1.4, maxWidth: 640,
          }}>
            You can return to the JOGO app and start creating your profile.
          </p>
        </div>
      </div>
    );
  }

  // ── Desktop layout (unchanged) ─────────────────────────────────────────────
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0E0F0D', overflow: 'hidden',
      fontFamily: "'Archivo', sans-serif",
    }}>
      {FONTS}

      <div id="verified-stage" style={{
        position: 'relative', width: 1080, height: 1080,
        background: '#0E0F0D', flexShrink: 0,
        transformOrigin: 'center center',
      }}>
        <img
          src="/verified/newIcon-final.png"
          alt="JOGO"
          style={{
            position: 'absolute', top: 38, left: '50%',
            transform: 'translateX(-50%)',
            width: 101, height: 101, zIndex: 40,
            filter: 'drop-shadow(0 3px 8px rgba(0,0,0,0.4))',
          }}
        />
        <div style={{
          position: 'absolute', top: 52, right: 48, zIndex: 40,
          fontWeight: 700, fontSize: 15, letterSpacing: 3, color: '#B6F03C',
        }}>
          EST. 2026
        </div>
        <div style={{ position: 'absolute', inset: '34px 0 0 0', zIndex: 10, transform: 'scale(0.9)' }}>
          {PHOTOS.map((p, i) => (
            <img
              key={i}
              src={p.src}
              alt=""
              style={{
                position: 'absolute', display: 'block', objectFit: 'cover',
                border: '5px solid #B6F03C',
                boxShadow: '0 12px 30px rgba(0,0,0,0.55)',
                width: p.w, height: p.h,
                left: p.x, top: p.y,
                transform: `translate(-50%, -50%) rotate(${p.r}deg)`,
                zIndex: p.z,
              }}
            />
          ))}
        </div>
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 30,
          textAlign: 'center', padding: '44px 48px',
          background: 'linear-gradient(to top, #0E0F0D 58%, rgba(14,15,13,0.85) 78%, rgba(14,15,13,0) 100%)',
        }}>
          <div style={{ margin: 0, lineHeight: 1.1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <span style={{
                fontFamily: "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                fontWeight: 900, fontSize: 50, color: '#F7F6F1', letterSpacing: -1, whiteSpace: 'nowrap',
              }}>WELCOME TO THE</span>
              <img
                src="/verified/photos/jogo-green.png"
                alt="jogo"
                style={{ height: 56, width: 'auto', flexShrink: 0, marginBottom: 4 }}
              />
            </div>
            <div style={{
              fontFamily: "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif",
              fontWeight: 900, fontSize: 50, color: '#F7F6F1', letterSpacing: -1,
              textAlign: 'center',
            }}>MOVEMENT</div>
          </div>
          <p style={{
            margin: '14px auto 0', color: '#c9cabf', fontWeight: 500,
            fontSize: 22, lineHeight: 1.35, maxWidth: 640,
          }}>
            You can return to the JOGO app and start creating your profile.
          </p>
        </div>
      </div>
    </div>
  );
}
