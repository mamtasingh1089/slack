import React from "react";
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";

// Import all SVG assets from 9Amfigma
import AM from "../../assets/9Amfigma/AM.svg";
import BoyGirl from "../../assets/9Amfigma/Boy_Girl.svg";
import BoyGirl2 from "../../assets/9Amfigma/boy_girl2.png";
import City from "../../assets/9Amfigma/city.svg";
import Sun from "../../assets/9Amfigma/sun.svg";
import FirstHill from "../../assets/9Amfigma/firsthill.svg";
import SecondHill from "../../assets/9Amfigma/secondhill.svg";
import ThirdHill from "../../assets/9Amfigma/thirdhill.svg";
import FourthHill from "../../assets/9Amfigma/fourthhill.svg";
import LeftLeaves from "../../assets/9Amfigma/left-leaves.svg";
import RightLeaves from "../../assets/9Amfigma/right-leaves.svg";
import Plane from "../../assets/9Amfigma/plane.svg";

// Import Clouds assets
import Cloud1 from "../../assets/9Amfigma/Clouds/cloud1.svg";
import Cloud2 from "../../assets/9Amfigma/Clouds/cloud2.svg";
import TopLeftCloud from "../../assets/9Amfigma/Clouds/topLeft.svg";

const SharedAuthBrandPanel = ({ isRegister = false }) => {
  const shouldReduceMotion = useReducedMotion();

  // Mouse Coordinates for Interactive Parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for tracking the mouse position
  const springX = useSpring(mouseX, { stiffness: 35, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 35, damping: 18 });

  // Map Springs to translation distances for 3D Parallax Depth Layers
  const parallaxBgCloudX = useTransform(springX, [-1, 1], [-4, 4]);
  const parallaxBgCloudY = useTransform(springY, [-1, 1], [-2, 2]);

  const parallaxSunX = useTransform(springX, [-1, 1], [-2, 2]);
  const parallaxCityX = useTransform(springX, [-1, 1], [-2, 2]);
  const parallaxHill4X = useTransform(springX, [-1, 1], [-3, 3]);
  const parallaxHill3X = useTransform(springX, [-1, 1], [-6, 6]);
  const parallaxHill1X = useTransform(springX, [-1, 1], [-9, 9]);
  const parallaxHill2X = useTransform(springX, [-1, 1], [-12, 12]);

  const parallaxLeftLeavesX = useTransform(springX, [-1, 1], [-15, 15]);
  const parallaxLeftLeavesY = useTransform(springY, [-1, 1], [-4, 4]);
  const parallaxRightLeavesX = useTransform(springX, [-1, 1], [-15, 15]);
  const parallaxRightLeavesY = useTransform(springY, [-1, 1], [-4, 4]);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    
    // Normalized coordinates (-1 to 1) relative to center
    const x = ((clientX - left) - width / 2) / (width / 2);
    const y = ((clientY - top) - height / 2) / (height / 2);
    
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="hidden lg:flex w-full relative flex-col justify-between overflow-hidden h-screen bg-[#F8FAF9] pt-12 px-12 xl:pt-16 xl:px-16 pb-0 select-none cursor-default transition-colors duration-1000"
      style={{ backgroundColor: isRegister ? "#FFFBF7" : "#F8FAF9" }}
    >
      
      {/* SKY GRADIENT 1: Morning Dawn (Active on Login) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-[#E3EFEA] via-[#DCECE5] to-[#C9E5DE] z-0 pointer-events-none"
        animate={{ opacity: isRegister ? 0 : 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* SKY GRADIENT 2: Sunset Golden Hour (Active on Register) */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-[#FFF2E6] via-[#FFE2C8] to-[#FFC79A] z-0 pointer-events-none"
        animate={{ opacity: isRegister ? 1 : 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />

      {/* Background TopLeft Cloud Shape */}
      <motion.img
        src={TopLeftCloud}
        alt=""
        className="absolute top-0 left-0 w-[260px] xl:w-[320px] opacity-80 pointer-events-none z-0"
        initial={shouldReduceMotion ? {} : { opacity: 0, x: -30 }}
        animate={{ opacity: isRegister ? 0.75 : 0.9, x: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      {/* Grid Dots decorations in the background */}
      <div className="absolute top-8 left-8 flex flex-col gap-1.5 z-0 pointer-events-none">
        <div className="flex gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-1000 ${isRegister ? 'bg-[#E58004]' : 'bg-[#0A5D65]'}`}></span>
          <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-1000 ${isRegister ? 'bg-[#E58004]' : 'bg-[#0A5D65]'}`}></span>
          <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-1000 ${isRegister ? 'bg-[#E58004]' : 'bg-[#0A5D65]'}`}></span>
        </div>
        <div className="flex gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-1000 ${isRegister ? 'bg-[#E58004]' : 'bg-[#0A5D65]'}`}></span>
          <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-1000 ${isRegister ? 'bg-[#E58004]' : 'bg-[#0A5D65]'}`}></span>
          <span className={`w-1.5 h-1.5 rounded-full transition-colors duration-1000 ${isRegister ? 'bg-[#E58004]' : 'bg-[#0A5D65]'}`}></span>
        </div>
      </div>

      {/* Cloud Cluster on the Right Side */}
      <motion.img
        src={Cloud1}
        alt=""
        className="absolute right-[-70px] bottom-[14%] w-[260px] xl:w-[300px] pointer-events-none z-0 transition-opacity duration-1000"
        style={shouldReduceMotion ? {} : { x: parallaxBgCloudX, y: parallaxBgCloudY }}
        animate={{ opacity: isRegister ? 0.8 : 0.95 }}
      />
      <motion.img
        src={Cloud2}
        alt=""
        className="absolute right-[70px] bottom-[6%] w-[180px] xl:w-[210px] pointer-events-none z-0 transition-opacity duration-1000"
        style={shouldReduceMotion ? {} : { x: parallaxBgCloudX, y: parallaxBgCloudY }}
        animate={{ opacity: isRegister ? 0.8 : 0.95 }}
      />

      {/* UPPER SECTION: Big 9 (BoyGirl) + AM Logo & Brand Details */}
      <motion.div
        className="flex items-center gap-0.5 mt-4 ml-2 z-10 flex-shrink-0"
        initial={shouldReduceMotion ? {} : { y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Left Column: Giant "9" Illustration */}
        <div className="w-[190px] xl:w-[230px] flex-shrink-0">
          <img
            src={BoyGirl2}
            alt="9AM Work Illustration"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Right Column: AM Logo & Titles */}
        <div className="flex flex-col justify-center -ml-5 xl:-ml-7">
          <img
            src={AM}
            alt="AM"
            className="w-[160px] xl:w-[200px] h-auto object-contain"
          />
          <h1 className="text-3xl xl:text-4xl font-extrabold text-[#16231F] tracking-tight -mt-1 xl:-mt-2">
            nineAm
          </h1>
          <p className="text-xs font-semibold text-[#5F6F69] tracking-wider mt-0">
            Communicate <span className="text-[#119480]">•</span> Collaborate <span className="text-[#F28B06]">•</span> Create
          </p>
        </div>
      </motion.div>

      {/* MIDDLE SECTION: Hero Text & Flying Plane */}
      <div className="relative flex flex-col justify-center flex-grow mt-8 pl-6 pr-6 pb-[240px] xl:pb-[280px] z-10">
        
        {/* Animated Hero Text Switcher */}
        <div className="h-[140px] relative">
          <AnimatePresence mode="wait">
            {!isRegister ? (
              <motion.div
                key="login-text"
                className="absolute inset-0 flex flex-col gap-3 max-w-[340px] xl:max-w-[420px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl xl:text-3xl font-extrabold text-[#16231F] leading-snug">
                    Work together.
                  </h2>
                  <h2 className="text-2xl xl:text-3xl font-extrabold text-[#16231F] leading-snug">
                    From first message to <span className="text-[#119480]">big impact.</span>
                  </h2>
                </div>

                <p className="text-sm xl:text-base text-[#5F6F69] font-medium leading-relaxed mt-2">
                  Group chats, channels, files and more —<br />
                  everything your team needs in one place.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register-text"
                className="absolute inset-0 flex flex-col gap-3 max-w-[340px] xl:max-w-[420px]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl xl:text-3xl font-extrabold text-[#16231F] leading-snug">
                    Get started today.
                  </h2>
                  <h2 className="text-2xl xl:text-3xl font-extrabold text-[#16231F] leading-snug">
                    Create your space to <span className="text-[#F28B06]">build together.</span>
                  </h2>
                </div>

                <p className="text-sm xl:text-base text-[#5F6F69] font-medium leading-relaxed mt-2">
                  Setup your profile, join channels, and start<br />
                  communicating with your team in minutes.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Flying Plane SVG */}
        <motion.div
          className="absolute right-0 bottom-[140px] xl:bottom-[170px] w-[180px] xl:w-[220px]"
          initial={shouldReduceMotion ? {} : { x: -80, y: 80, scale: 0.7, opacity: 0 }}
          animate={
            shouldReduceMotion
              ? { x: 0, y: 0, scale: 1, opacity: 1 }
              : {
                  x: [0, 6, -6, 0],
                  y: [0, -7, 7, 0],
                  rotate: [0, 2.5, -2.5, 0],
                  scale: 1,
                  opacity: 1
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 1.5 }
              : {
                  x: { duration: 9, repeat: Infinity, ease: "easeInOut" },
                  y: { duration: 9, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 9, repeat: Infinity, ease: "easeInOut" },
                  default: { duration: 2.2, ease: "easeOut", delay: 0.6 }
                }
          }
        >
          <img
            src={Plane}
            alt="Flying Plane"
            className="w-full h-auto object-contain"
          />
        </motion.div>

      </div>

      {/* BOTTOM SECTION: Landscape Layered SVGs (Transition filters smoothly based on isRegister) */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[220px] xl:h-[260px] pointer-events-none select-none z-10 overflow-hidden">
        
        {/* Sun rising behind back hills */}
        <motion.img
          src={Sun}
          alt=""
          className={`absolute bottom-[24%] left-[18%] w-[65px] xl:w-[75px] h-auto z-5 transition-all duration-1000 ${
            isRegister ? "hue-rotate-[15deg] saturate-150" : ""
          }`}
          style={shouldReduceMotion ? {} : { x: parallaxSunX }}
          initial={shouldReduceMotion ? {} : { y: 50, scale: 0.7, opacity: 0 }}
          animate={
            shouldReduceMotion
              ? { y: 0, scale: 1, opacity: 1 }
              : {
                  y: 0,
                  scale: [0.97, 1.03, 0.97],
                  opacity: [0.95, 1, 0.95]
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 1.5 }
              : {
                  scale: { duration: 7, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 7, repeat: Infinity, ease: "easeInOut" },
                  default: { type: "spring", stiffness: 40, damping: 10, delay: 0.3 }
                }
          }
        />

        {/* City/bars silhouette */}
        <motion.img
          src={City}
          alt=""
          className={`absolute bottom-[18%] left-[24%] w-[260px] xl:w-[320px] h-auto z-5 transition-all duration-1000 ${
            isRegister ? "opacity-60 sepia saturate-150" : "opacity-75"
          }`}
          style={shouldReduceMotion ? {} : { x: parallaxCityX }}
          initial={shouldReduceMotion ? {} : { y: 25, opacity: 0 }}
          animate={{ y: 0 }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.1 }}
        />

        {/* Layer 1: Fourth Hill */}
        <motion.img
          src={FourthHill}
          alt=""
          className={`absolute bottom-0 left-0 w-full h-auto object-cover object-bottom z-10 scale-x-105 transition-all duration-1000 ${
            isRegister ? "hue-rotate-[25deg] saturate-[60%]" : ""
          }`}
          style={shouldReduceMotion ? {} : { x: parallaxHill4X }}
          initial={shouldReduceMotion ? {} : { y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.3, ease: "easeOut", delay: 0.05 }}
        />

        {/* Layer 2: Third Hill */}
        <motion.img
          src={ThirdHill}
          alt=""
          className={`absolute bottom-0 left-0 w-full h-auto object-cover object-bottom z-20 scale-x-105 transition-all duration-1000 ${
            isRegister ? "hue-rotate-[25deg] saturate-[60%]" : ""
          }`}
          style={shouldReduceMotion ? {} : { x: parallaxHill3X }}
          initial={shouldReduceMotion ? {} : { y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.1 }}
        />

        {/* Layer 3: First Hill */}
        <motion.img
          src={FirstHill}
          alt=""
          className={`absolute bottom-0 left-0 w-full h-auto object-cover object-bottom z-30 scale-x-105 transition-all duration-1000 ${
            isRegister ? "hue-rotate-[25deg] saturate-[60%]" : ""
          }`}
          style={shouldReduceMotion ? {} : { x: parallaxHill1X }}
          initial={shouldReduceMotion ? {} : { y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.15 }}
        />

        {/* Layer 4: Second Hill */}
        <motion.img
          src={SecondHill}
          alt=""
          className={`absolute bottom-0 left-0 w-full h-auto object-cover object-bottom z-40 scale-x-105 transition-all duration-1000 ${
            isRegister ? "hue-rotate-[25deg] saturate-[60%]" : ""
          }`}
          style={shouldReduceMotion ? {} : { x: parallaxHill2X }}
          initial={shouldReduceMotion ? {} : { y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.2 }}
        />

        {/* Layer 5: Left & Right framing leaves */}
        <motion.img
          src={LeftLeaves}
          alt=""
          className={`absolute bottom-0 left-0 w-[12%] max-w-[80px] h-auto object-contain z-50 origin-bottom-left transition-all duration-1000 ${
            isRegister ? "hue-rotate-[15deg] sepia" : ""
          }`}
          style={shouldReduceMotion ? {} : { x: parallaxLeftLeavesX, y: parallaxLeftLeavesY, transformOrigin: "bottom left" }}
          initial={shouldReduceMotion ? {} : { y: 40, rotate: -15, opacity: 0 }}
          animate={
            shouldReduceMotion
              ? { y: 0, rotate: 0, opacity: 1 }
              : { y: 0, rotate: [-1, 2, -1], opacity: 1 }
          }
          transition={
            shouldReduceMotion
              ? { duration: 1.5 }
              : {
                  rotate: { duration: 5, repeat: Infinity, ease: "easeInOut" },
                  default: { duration: 1.8, ease: "easeOut", delay: 0.35 }
                }
          }
        />
        <motion.img
          src={RightLeaves}
          alt=""
          className={`absolute bottom-0 right-0 w-[20%] max-w-[130px] h-auto object-contain z-50 origin-bottom-right transition-all duration-1000 ${
            isRegister ? "hue-rotate-[15deg] sepia" : ""
          }`}
          style={shouldReduceMotion ? {} : { x: parallaxRightLeavesX, y: parallaxRightLeavesY, transformOrigin: "bottom right" }}
          initial={shouldReduceMotion ? {} : { y: 40, rotate: 15, opacity: 0 }}
          animate={
            shouldReduceMotion
              ? { y: 0, rotate: 0, opacity: 1 }
              : { y: 0, rotate: [1, -2, 1], opacity: 1 }
          }
          transition={
            shouldReduceMotion
              ? { duration: 1.5 }
              : {
                  rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  default: { duration: 1.8, ease: "easeOut", delay: 0.4 }
                }
          }
        />

      </div>

    </div>
  );
};

export default SharedAuthBrandPanel;
