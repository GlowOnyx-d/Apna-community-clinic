import React from 'react';

/**
 * HealthcareBackground
 * 
 * Master atmospheric healthcare architectural background layer.
 * Warm ivory base, directional sage glows, soft illuminated halos,
 * oversized organic network circles (8-12% opacity), and flowing curves.
 * 
 * Designed for Apple-style minimalism + premium healthcare SaaS.
 */
export default function HealthcareBackground({ className = '' }) {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`} 
      aria-hidden="true"
    >
      {/* 1. Base Multi-Stop Atmospheric Depth Gradient */}
      {/* Clean warm ivory top -> luminous core -> muted sage-earth cream foundation */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(135% 95% at 50% 32%, #FFFFFF 0%, #FAF8F3 34%, #F3EFE4 68%, #EAE2D0 100%)'
        }}
      />
      <div 
        className="absolute inset-0 hidden dark:block"
        style={{
          background: 'radial-gradient(135% 95% at 50% 32%, #19231A 0%, #131813 36%, #0D120E 70%, #070A07 100%)'
        }}
      />

      {/* Top Crisp Atmospheric Wash (Keeps top mostly clean ivory with subtle green atmosphere) */}
      <div 
        className="absolute top-0 left-0 right-0 h-44 sm:h-64"
        style={{
          background: 'linear-gradient(180deg, rgba(254, 253, 250, 0.95) 0%, rgba(248, 246, 240, 0.5) 50%, transparent 100%)'
        }}
      />
      <div 
        className="absolute top-0 left-0 right-0 h-44 sm:h-64 hidden dark:block"
        style={{
          background: 'linear-gradient(180deg, rgba(19, 25, 19, 0.85) 0%, rgba(16, 21, 16, 0.35) 50%, transparent 100%)'
        }}
      />

      {/* Bottom Atmospheric Grounding Gradient (Deeper green/cream atmospheric transition) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-52 sm:h-72"
        style={{
          background: 'linear-gradient(0deg, rgba(222, 215, 199, 0.55) 0%, rgba(234, 228, 216, 0.22) 45%, transparent 100%)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-52 sm:h-72 hidden dark:block"
        style={{
          background: 'linear-gradient(0deg, rgba(8, 12, 8, 0.7) 0%, rgba(11, 15, 11, 0.25) 45%, transparent 100%)'
        }}
      />

      {/* 2. Soft Light Halos (White/Green illuminated aura behind center viewport) */}
      {/* Primary Ambient Light Bed (Large diffused ellipse centered directly behind focal content) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1150px] sm:w-[1450px] lg:w-[1600px] h-[750px] sm:h-[950px] lg:h-[1050px] rounded-[100%] blur-[95px] sm:blur-[125px] opacity-95 dark:opacity-35"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.98) 0%, rgba(246, 251, 247, 0.82) 34%, rgba(232, 244, 236, 0.42) 56%, rgba(218, 235, 224, 0.16) 72%, transparent 86%)'
        }}
      />

      {/* Secondary Edge Rim Halo (Tighter luminous rim illuminating card boundaries) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1040px] h-[660px] rounded-[36px] blur-[55px] opacity-75 dark:opacity-20"
        style={{
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.7) 0%, rgba(230, 242, 234, 0.35) 48%, transparent 75%)'
        }}
      />

      {/* 3. Ambient Green Glows (Directional sage/emerald glows with blurred diffused edges) */}
      {/* Glow 1: Large Glow behind Left Side (Muted deep emerald/sage branding anchor) */}
      <div 
        className="absolute top-1/2 left-[24%] sm:left-[26%] -translate-x-1/2 -translate-y-1/2 w-[850px] sm:w-[1100px] h-[850px] sm:h-[1100px] rounded-full blur-[130px] sm:blur-[150px] opacity-85 dark:opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(45, 106, 79, 0.18) 0%, rgba(64, 138, 104, 0.10) 35%, rgba(82, 183, 136, 0.035) 62%, transparent 75%)'
        }}
      />

      {/* Glow 2: Subtle Glow behind Upper-Right Area (Eucalyptus & pale mint atmosphere) */}
      <div 
        className="absolute -top-28 sm:-top-20 right-[6%] sm:right-[10%] w-[680px] sm:w-[900px] h-[680px] sm:h-[900px] rounded-full blur-[120px] sm:blur-[140px] opacity-80 dark:opacity-45"
        style={{
          background: 'radial-gradient(circle, rgba(58, 125, 92, 0.11) 0%, rgba(98, 142, 116, 0.055) 44%, rgba(138, 172, 150, 0.02) 65%, transparent 72%)'
        }}
      />

      {/* Glow 3: Smaller Glow toward Bottom-Right (Warm sage-earth transition) */}
      <div 
        className="absolute -bottom-28 sm:-bottom-20 right-[4%] sm:right-[8%] w-[580px] sm:w-[760px] h-[580px] sm:h-[760px] rounded-full blur-[110px] sm:blur-[130px] opacity-75 dark:opacity-40"
        style={{
          background: 'radial-gradient(circle, rgba(45, 106, 79, 0.10) 0%, rgba(188, 172, 142, 0.065) 44%, transparent 72%)'
        }}
      />

      {/* 4. Large Translucent Organic Circles & Network Geometry (8-12% visible & subtle) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        viewBox="0 0 1600 1000" 
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* DEFINITIONS & GRADIENTS */}
        <defs>
          <linearGradient id="globalCurveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.04" />
            <stop offset="25%" stopColor="#2D6A4F" stopOpacity="0.12" />
            <stop offset="70%" stopColor="#408A68" stopOpacity="0.11" />
            <stop offset="100%" stopColor="#52B788" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="globalCurveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#357A5B" stopOpacity="0.03" />
            <stop offset="35%" stopColor="#357A5B" stopOpacity="0.10" />
            <stop offset="75%" stopColor="#2D6A4F" stopOpacity="0.11" />
            <stop offset="100%" stopColor="#6B8E78" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="globalCurveGrad3" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#408A68" stopOpacity="0.03" />
            <stop offset="40%" stopColor="#408A68" stopOpacity="0.10" />
            <stop offset="80%" stopColor="#2D6A4F" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#357A5B" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="globalCurveGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.04" />
            <stop offset="45%" stopColor="#2D6A4F" stopOpacity="0.095" />
            <stop offset="85%" stopColor="#6B8E78" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#8A9A86" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* GROUP A: UPPER-RIGHT CELESTIAL NETWORK ORBITS (8-12% Noticeably Visible) */}
        {/* Great Outer Orbit (11% Opacity - clearly visible) */}
        <circle 
          cx="1480" 
          cy="-70" 
          r="1020" 
          stroke="#2D6A4F" 
          strokeWidth="1.2" 
          opacity="0.11" 
          className="dark:stroke-[#52B788] dark:opacity-13" 
        />
        {/* Intermediate Concentric Orbit (8.5% Opacity) */}
        <circle 
          cx="1480" 
          cy="-70" 
          r="800" 
          stroke="#408A68" 
          strokeWidth="0.95" 
          opacity="0.085" 
          className="dark:stroke-[#52B788] dark:opacity-10" 
        />
        {/* Rhythmic Segmented Network Orbit (Pulse spacing) */}
        <circle 
          cx="1480" 
          cy="-70" 
          r="670" 
          stroke="#357A5B" 
          strokeWidth="1.1" 
          strokeDasharray="6 12" 
          opacity="0.09" 
          className="dark:stroke-[#52B788] dark:opacity-11" 
        />
        {/* Inner Visible Ring (10% Opacity) */}
        <circle 
          cx="1480" 
          cy="-70" 
          r="540" 
          stroke="#2D6A4F" 
          strokeWidth="1.05" 
          opacity="0.10" 
          className="dark:stroke-[#52B788] dark:opacity-12" 
        />
        {/* Subtle Delicate Inner Orbit (5% Opacity) */}
        <circle 
          cx="1480" 
          cy="-70" 
          r="380" 
          stroke="#52B788" 
          strokeWidth="0.75" 
          opacity="0.05" 
          className="dark:stroke-[#52B788] dark:opacity-07" 
        />

        {/* Intersecting Upper-Right Eccentric Arc (Creates lens/mandorla network geometry) */}
        <circle 
          cx="1190" 
          cy="-180" 
          r="650" 
          stroke="#357A5B" 
          strokeWidth="1.1" 
          opacity="0.095" 
          className="dark:stroke-[#52B788] dark:opacity-11" 
        />
        {/* Secondary Intersecting Elliptical Arc */}
        <ellipse 
          cx="1340" 
          cy="120" 
          rx="460" 
          ry="360" 
          stroke="#408A68" 
          strokeWidth="0.85" 
          opacity="0.06" 
          className="dark:stroke-[#52B788] dark:opacity-08" 
        />

        {/* Network Intersection Node Points (Subtle abstract data/community nodes) */}
        <circle cx="1275" cy="460" r="3" fill="#2D6A4F" opacity="0.13" className="dark:fill-[#52B788] dark:opacity-15" />
        <circle cx="1470" cy="598" r="3.5" fill="#357A5B" opacity="0.12" className="dark:fill-[#52B788] dark:opacity-14" />
        <circle cx="798" cy="276" r="2.5" fill="#408A68" opacity="0.11" className="dark:fill-[#52B788] dark:opacity-13" />

        {/* GROUP B: LOWER-LEFT SWEEPING PLANETARY ARCS (8-11% Noticeably Visible) */}
        {/* Great Outer Arc (11% Opacity) */}
        <circle 
          cx="-130" 
          cy="1100" 
          r="1050" 
          stroke="#2D6A4F" 
          strokeWidth="1.25" 
          opacity="0.11" 
          className="dark:stroke-[#52B788] dark:opacity-13" 
        />
        {/* Sweeping Harmonic Arc (9.5% Opacity) */}
        <circle 
          cx="-130" 
          cy="1100" 
          r="840" 
          stroke="#357A5B" 
          strokeWidth="1.0" 
          opacity="0.095" 
          className="dark:stroke-[#52B788] dark:opacity-11" 
        />
        {/* Rhythmic Segmented Arc */}
        <circle 
          cx="-130" 
          cy="1100" 
          r="730" 
          stroke="#52B788" 
          strokeWidth="0.95" 
          strokeDasharray="5 10" 
          opacity="0.08" 
          className="dark:stroke-[#52B788] dark:opacity-10" 
        />
        {/* Mid Arc (7.5% Opacity) */}
        <circle 
          cx="-130" 
          cy="1100" 
          r="630" 
          stroke="#408A68" 
          strokeWidth="0.85" 
          opacity="0.075" 
          className="dark:stroke-[#52B788] dark:opacity-09" 
        />
        {/* Earthy Warm Sage Base Arc (5.5% Opacity) */}
        <circle 
          cx="-130" 
          cy="1100" 
          r="450" 
          stroke="#8A9A86" 
          strokeWidth="0.75" 
          opacity="0.055" 
          className="dark:stroke-[#A3B18A] dark:opacity-07" 
        />

        {/* Intersecting Lower-Left Ellipse (Organic network cross-arc) */}
        <ellipse 
          cx="170" 
          cy="1160" 
          rx="740" 
          ry="580" 
          stroke="#2D6A4F" 
          strokeWidth="1.0" 
          opacity="0.09" 
          className="dark:stroke-[#52B788] dark:opacity-11" 
        />
        {/* Lower-left network nodes */}
        <circle cx="310" cy="595" r="3" fill="#2D6A4F" opacity="0.12" className="dark:fill-[#52B788] dark:opacity-14" />
        <circle cx="585" cy="740" r="2.5" fill="#357A5B" opacity="0.10" className="dark:fill-[#52B788] dark:opacity-12" />

        {/* GROUP C: UPPER-LEFT GENTLE ORBIT (Echoes rounded curves) */}
        <circle 
          cx="-70" 
          cy="-70" 
          r="680" 
          stroke="#2D6A4F" 
          strokeWidth="1.0" 
          opacity="0.085" 
          className="dark:stroke-[#52B788] dark:opacity-10" 
        />

        {/* GROUP D: BOTTOM-RIGHT GROUNDING ARC (Subtle geometric arcs at bottom) */}
        <circle 
          cx="1560" 
          cy="1100" 
          r="620" 
          stroke="#5E7A67" 
          strokeWidth="1.05" 
          opacity="0.09" 
          className="dark:stroke-[#52B788] dark:opacity-11" 
        />
        <circle 
          cx="1560" 
          cy="1100" 
          r="430" 
          stroke="#8A9A86" 
          strokeWidth="0.75" 
          opacity="0.05" 
          className="dark:stroke-[#A3B18A] dark:opacity-07" 
        />

        {/* 5. FLOWING CURVES (4 Elegant, extremely thin flowing curves traveling naturally around content) */}
        
        {/* Curve 1: Upper Atmospheric Crest (Travels gracefully across upper field) */}
        <path
          d="M -120 180 C 240 60, 520 140, 800 95 C 1080 50, 1340 125, 1720 70"
          stroke="url(#globalCurveGrad1)"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        {/* Curve 1 Ghost Echo (Parallel precision contour line) */}
        <path
          d="M -120 196 C 240 76, 520 156, 800 111 C 1080 66, 1340 141, 1720 86"
          stroke="#408A68"
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.04"
          className="dark:stroke-[#52B788] dark:opacity-06"
        />

        {/* Curve 2: Lower Foundation Wave (Cradles the bottom with natural buoyant sweep) */}
        <path
          d="M -90 820 C 220 885, 480 930, 820 885 C 1140 835, 1380 915, 1710 860"
          stroke="url(#globalCurveGrad2)"
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        {/* Curve 2 Ghost Echo */}
        <path
          d="M -90 834 C 220 899, 480 944, 820 899 C 1140 849, 1380 929, 1710 874"
          stroke="#6B8E78"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0.04"
          className="dark:stroke-[#52B788] dark:opacity-05"
        />

        {/* Curve 3: Right Flank Architectural Sweep (Frames right negative space with vertical movement) */}
        <path
          d="M 1360 -70 C 1500 220, 1540 500, 1460 740 C 1410 880, 1490 970, 1640 1020"
          stroke="url(#globalCurveGrad3)"
          strokeWidth="1.0"
          strokeLinecap="round"
        />

        {/* Curve 4: Left Margin Organic Embrace (Loosely echoes natural curves) */}
        <path
          d="M 240 -80 C 110 180, 60 440, 110 700 C 140 840, 80 940, -40 1010"
          stroke="url(#globalCurveGrad4)"
          strokeWidth="1.05"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
