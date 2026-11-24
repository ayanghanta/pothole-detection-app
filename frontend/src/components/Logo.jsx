import { Link } from "react-router-dom";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img
        src="pothole-logo.png"
        alt="RoadSight Logo"
        className="w-9 h-9 object-contain"
      />

      <Link to="/" className="text-xl font-extrabold tracking-tight">
        RoadSight<span className="text-[#52B788]">.</span>
      </Link>
    </div>
  );
}
