import { useNavigate } from "react-router-dom";
import { FaGithub } from "react-icons/fa";

import ControllButton from "./ControllButton";
import Logo from "./Logo";
// import logo from "../assets/logo.png";

function HomePage() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-[#F3F6F2] font-manrope text-[#26352D]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#E1E9E1]">
        <Logo />

        <span className="block uppercase text-xs font-semibold tracking-widest text-[#718176]">
          YOLO-powered pothole detection system
        </span>
      </nav>

      <section className="px-5 md:px-12 pt-8 pb-10">
        <div
          className="relative min-h md:min-h-145 flex items-center overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1800&q=85')",
          }}
        >
          <div className="absolute inset-0 bg-[#102B1D]/65" />

          <div className="relative z-10 max-w-3xl px-7 py-16 md:px-16">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.12] tracking-tight text-white">
              Smarter roads.
              <br />
              <span className="text-[#72D4A0]">Safer journeys.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-[#E0EAE3]">
              Detect potholes in real time using AI-powered computer vision.
              Monitor road conditions directly through your camera.
            </p>

            <div className="mt-9">
              <ControllButton onClick={() => navigate("/detections")}>
                <span className="flex items-center gap-3">
                  Start Detection
                  <span>→</span>
                </span>
              </ControllButton>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-5">
          <span className="text-xs font-semibold tracking-widest text-[#718176]">
            REAL-TIME POTHOLE DETECTION
          </span>
        </div>
      </section>
      <footer className="w-full border-t border-[#E2EAE3] bg-[#F3F6F2]">
        <div className="max-w-7xl mx-auto px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#718176]">
            © {new Date().getFullYear()}{" "}
            <span className="font-bold text-[#26352D]">RoadSight</span>. All
            rights reserved.
          </p>

          <a
            href="https://github.com/ayanghanta/pothole-detection-app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View RoadSight on GitHub"
            className="flex items-center gap-2 text-xs font-semibold text-[#718176] hover:text-[#2D8A60] transition-colors"
          >
            <FaGithub size={17} />
            <span>View on GitHub</span>
          </a>
        </div>
      </footer>
    </main>
  );
}

export default HomePage;
