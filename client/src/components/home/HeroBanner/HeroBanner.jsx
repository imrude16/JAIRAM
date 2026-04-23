import React from "react";

const home =
  process.env.NODE_ENV === "production"
    ? "/assets/home.png"
    : "/assets/home.png";

const HeroBanner = () => {
  return (
    <div>
      <div
        className="relative rounded-xl overflow-hidden text-white mb-8"
        style={{
          background:
            "linear-gradient(135deg, #1a3a6b 0%, #1e5fa5 60%, #2a7fd4 100%)",
          padding: "4rem 3rem",
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            top: -40,
            right: -40,
            width: 260,
            height: 260,
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: -80,
            right: 80,
            width: 360,
            height: 360,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        />

        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-left">
              Advancing Knowledge in Acute & Integrated Medicine
            </h2>
            <p className="text-white/80 mb-6 leading-relaxed text-base text-left">
              JAIRAM is an international, peer-reviewed, open-access journal
              focused on advancing high-quality research in acute and integrated
              medicine, fostering innovation, collaboration, and improved patient
              outcomes globally.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-xl">
            <div className="flex items-center gap-6">
              <img src={home} alt="cover" className="w-40 rounded-lg shadow-lg" />
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  April-May 2026 | Volume 1 | Issue 1
                </h3>
                <p className="text-sm text-white/90 mb-2 text-left">
                  <span className="font-semibold ">Editor-in-Chief:</span> Dr.
                  Rajiv Ratan Singh Yadav
                </p>
                <p className="text-sm text-white/90 text-left">
                  <span className="font-semibold">Frequency:</span> 2 issues
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;