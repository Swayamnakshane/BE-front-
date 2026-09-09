
import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  percentage: number;
  color: string;
  size?: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage, color, size = 160 }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background Ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="10"
          fill="transparent"
        />
        {/* Progress Ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 10px ${color})`
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold mono" style={{ color }}>
          {percentage}%
        </span>
        <span className="text-xs uppercase tracking-widest text-slate-400">Confidence</span>
      </div>
    </div>
  );
};

export default CircularProgress;
