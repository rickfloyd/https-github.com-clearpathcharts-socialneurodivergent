
import React from 'react';
import { motion } from 'motion/react';

export const SurfBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-[#050505]">
      {/* Retro Sun */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[100px]"
           style={{ background: 'radial-gradient(circle, #FF5F1F 0%, #4D00FF 100%)' }} />
      
      <div className="absolute bottom-0 left-0 w-full h-[300px] opacity-10"
           style={{ background: 'linear-gradient(to top, #4D00FF 0%, transparent 100%)' }} />

      {/* Palm Trees - Left */}
      <div className="absolute bottom-0 left-[-50px] w-[300px] h-[500px] opacity-20">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#FF5F1F] fill-current">
          <path d="M50,100 Q45,70 48,40 Q50,20 60,10 M50,100 Q55,70 52,40 Q50,20 40,10" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M48,40 Q30,35 10,45 M48,40 Q35,25 20,10 M48,40 Q50,15 60,5 M48,40 Q65,25 80,15 M48,40 Q70,40 90,50" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Palm Trees - Right */}
      <div className="absolute bottom-0 right-[-50px] w-[300px] h-[500px] opacity-20 scale-x-[-1]">
        <svg viewBox="0 0 100 100" className="w-full h-full text-[#4D00FF] fill-current">
          <path d="M50,100 Q45,70 48,40 Q50,20 60,10 M50,100 Q55,70 52,40 Q50,20 40,10" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M48,40 Q30,35 10,45 M48,40 Q35,25 20,10 M48,40 Q50,15 60,5 M48,40 Q65,25 80,15 M48,40 Q70,40 90,50" stroke="currentColor" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* Surfers */}
      <Surfer delay={0} duration={20} y="70%" color="#FF5F1F" />
      <Surfer delay={5} duration={25} y="80%" color="#4D00FF" />
      <Surfer delay={10} duration={18} y="75%" color="#FF0000" />
    </div>
  );
};

const Surfer = ({ delay, duration, y, color }: { delay: number; duration: number; y: string; color: string }) => (
  <motion.div
    initial={{ x: '-100%' }}
    animate={{ x: '200%' }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "linear"
    }}
    className="absolute"
    style={{ top: y }}
  >
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Surfboard */}
      <path d="M5 30 Q20 25 35 30 Q20 35 5 30" fill={color} opacity="0.8" />
      {/* Person Silhouette */}
      <path d="M15 28 L18 20 L22 20 L25 28" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="15" r="3" stroke={color} strokeWidth="2" />
      {/* Glow */}
      <circle cx="20" cy="20" r="15" fill={color} opacity="0.1" />
    </svg>
  </motion.div>
);
