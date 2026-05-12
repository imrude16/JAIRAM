import React from "react";

const home =
  process.env.NODE_ENV === "production"
    ? "/assets/home.png"
    : "/assets/home.png";

const HeroBanner = () => {
  return (
    <div>
      <style>{`
        .hb-shell {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
          margin-bottom: 2rem;
          color: white;
          background: linear-gradient(135deg, #1a3a6b 0%, #1e5fa5 60%, #2a7fd4 100%);
        }

        .hb-orb {
          position: absolute;
          border-radius: 9999px;
          pointer-events: none;
        }

        .hb-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
          gap: 2.5rem;
          align-items: center;
          max-width: 72rem;
          margin: 0 auto;
          padding: 3.5rem 3rem;
        }

        .hb-copy h2,
        .hb-copy p,
        .hb-meta,
        .hb-meta p,
        .hb-meta h3 {
          text-align: left;
        }

        .hb-copy h2 {
          margin: 0 0 1rem;
          font-size: 2rem;
          line-height: 1.2;
          font-weight: 650;
        }

        .hb-copy p {
          margin: 0;
          color: rgba(255,255,255,0.84);
          font-size: 1rem;
          line-height: 1.9;
          max-width: 34rem;
        }

        .hb-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem;
          border-radius: 1rem;
          background: rgba(255,255,255,0.12);
          box-shadow: 0 24px 60px rgba(7, 20, 44, 0.2);
          backdrop-filter: blur(14px);
          min-width: 0;
        }

        .hb-cover {
          width: clamp(7.5rem, 22vw, 10rem);
          flex-shrink: 0;
          border-radius: 0.85rem;
          box-shadow: 0 16px 30px rgba(0,0,0,0.22);
          display: block;
        }

        .hb-meta {
          min-width: 0;
        }

        .hb-meta h3 {
          margin: 0 0 0.9rem;
          font-size: 1.2rem;
          line-height: 1.45;
          font-weight: 650;
        }

        .hb-meta p {
          margin: 0 0 0.6rem;
          font-size: 0.95rem;
          line-height: 1.65;
          color: rgba(255,255,255,0.92);
          overflow-wrap: anywhere;
        }

        .hb-meta p:last-child {
          margin-bottom: 0;
        }

        @media (max-width: 1024px) {
          .hb-inner {
            grid-template-columns: 1fr;
            gap: 1.75rem;
            padding: 2.5rem 2rem;
          }

          .hb-copy h2 {
            font-size: 1.75rem;
          }

          .hb-copy p {
            max-width: none;
          }

          .hb-card {
            justify-self: stretch;
          }

          .hb-orb--top {
            right: -90px !important;
            width: 220px !important;
            height: 220px !important;
          }

          .hb-orb--bottom {
            right: -40px !important;
            bottom: -120px !important;
            width: 250px !important;
            height: 250px !important;
          }
        }

        @media (max-width: 640px) {
          .hb-inner {
            padding: 1.5rem 1.1rem;
            gap: 1.25rem;
          }

          .hb-copy h2 {
            font-size: 1.15rem;
            line-height: 1.35;
          }

          .hb-copy p {
            font-size: 0.95rem;
            line-height: 1.7;
          }

          .hb-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
          }

          .hb-cover {
            width: min(11rem, 100%);
          }

          .hb-meta h3 {
            font-size: 1rem;
            line-height: 1.5;
          }

          .hb-meta p {
            font-size: 0.86rem;
            line-height: 1.55;
          }

          .hb-orb {
            opacity: 0.45;
          }
        }
      `}</style>

      <div className="hb-shell">
        <div
          className="hb-orb hb-orb--top"
          style={{
            top: -40,
            right: -40,
            width: 260,
            height: 260,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
        <div
          className="hb-orb hb-orb--bottom"
          style={{
            bottom: -80,
            right: 80,
            width: 360,
            height: 360,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />

        <div className="hb-inner">
          <div className="hb-copy">
            <h2>Advancing Knowledge in Acute &amp; Integrated Medicine</h2>
            <p>
              JAIRAM is an international, peer-reviewed, open-access journal
              focused on advancing high-quality research in acute and integrated
              medicine, fostering innovation, collaboration, and improved patient
              outcomes globally.
            </p>
          </div>

          <div className="hb-card">
            <img src={home} alt="cover" className="hb-cover" />

            <div className="hb-meta">
              <h3>April-May 2026 | Volume 1 | Issue 1</h3>
              <p>
                <span style={{ fontWeight: 700 }}>Editor-in-Chief:</span> Dr.
                Rajiv Ratan Singh Yadav
              </p>
              <p>
                <span style={{ fontWeight: 700 }}>Frequency:</span> 2 issues
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
