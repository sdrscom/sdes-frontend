import { useId } from "react";

export default function Pattern({ className = "" }) {
  const patternId = useId();

  return (
    <div className={`absolute inset-0 opacity-[.08] ${className}`}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id={patternId}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,40 L40,0"
              stroke="#4A5578"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M-20,40 L20,0"
              stroke="#4A5578"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M20,40 L60,0"
              stroke="#4A5578"
              strokeWidth="1"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>
    </div>
  );
}