import React from "react";

// Import all SVG assets from 9Amfigma
import AM from "../../assets/9Amfigma/AM.svg";
import BoyGirl from "../../assets/9Amfigma/Boy_Girl.svg";
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

const AuthBrandPanel = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden border-r border-[#DFE7E3] h-screen bg-[#F8FAF9] pt-12 px-12 xl:pt-16 xl:px-16 pb-0 select-none">
      
      {/* Background TopLeft Cloud Shape */}
      <img
        src={TopLeftCloud}
        alt=""
        className="absolute top-0 left-0 w-[260px] xl:w-[320px] opacity-90 pointer-events-none z-0"
      />

      {/* Grid Dots decorations in the background */}
      <div className="absolute top-8 left-8 flex flex-col gap-1.5 opacity-25 z-0 pointer-events-none">
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
        </div>
      </div>

      <div className="absolute top-[40%] left-6 flex flex-col gap-1.5 opacity-25 z-0 pointer-events-none">
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
        </div>
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#0A5D65]"></span>
        </div>
      </div>

      {/* Cloud Cluster on the Right Side (Made even smaller for more realistic proportions) */}
      <img
        src={Cloud1}
        alt=""
        className="absolute right-[-50px] bottom-[16%] w-[180px] xl:w-[210px] opacity-95 pointer-events-none z-0"
      />
      <img
        src={Cloud2}
        alt=""
        className="absolute right-[40px] bottom-[8%] w-[120px] xl:w-[140px] opacity-95 pointer-events-none z-0"
      />

      {/* UPPER SECTION: Big 9 (BoyGirl) + AM Logo & Brand Details */}
      <div className="flex items-center gap-8 mt-4 ml-2 z-10 flex-shrink-0">
        
        {/* Left Column: Giant "9" Illustration */}
        <div className="w-[190px] xl:w-[230px] flex-shrink-0">
          <img
            src={BoyGirl}
            alt="9AM Work Illustration"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Right Column: AM Logo & Titles */}
        <div className="flex flex-col justify-center">
          <img
            src={AM}
            alt="AM"
            className="w-[160px] xl:w-[200px] h-auto object-contain"
          />
          <h1 className="text-3xl xl:text-4xl font-extrabold text-[#16231F] tracking-tight mt-3">
            nineAm
          </h1>
          <p className="text-xs font-semibold text-[#5F6F69] tracking-wider mt-1.5">
            Communicate <span className="text-[#119480]">•</span> Collaborate <span className="text-[#F28B06]">•</span> Create
          </p>
        </div>

      </div>

      {/* MIDDLE SECTION: Hero Text & Flying Plane (with bottom padding to prevent overlap with hills) */}
      <div className="relative flex flex-col justify-center flex-grow mt-8 pl-6 pr-6 pb-[240px] xl:pb-[280px] z-10">
        
        {/* Hero Headings and Description */}
        <div className="flex flex-col gap-3 max-w-[340px] xl:max-w-[420px]">
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
        </div>

        {/* Flying Plane SVG positioned relative to the Hero Text area */}
        <div className="absolute right-0 bottom-[140px] xl:bottom-[170px] w-[180px] xl:w-[220px]">
          <img
            src={Plane}
            alt="Flying Plane"
            className="w-full h-auto object-contain"
          />
        </div>

      </div>

      {/* BOTTOM SECTION: Landscape Layered SVGs (absolute positioned to bottom-0 of the screen) */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[220px] xl:h-[260px] pointer-events-none select-none z-10">
        
        {/* Sun rising behind back hills (Scaled down for realistic layout proportions) */}
        <img
          src={Sun}
          alt=""
          className="absolute bottom-[24%] left-[18%] w-[65px] xl:w-[75px] h-auto z-5"
        />

        {/* City/bars silhouette */}
        <img
          src={City}
          alt=""
          className="absolute bottom-[18%] left-[24%] w-[260px] xl:w-[320px] h-auto opacity-75 z-5"
        />

        {/* Layer 1: Fourth Hill (backmost, light mint/teal) */}
        <img
          src={FourthHill}
          alt=""
          className="absolute bottom-0 left-0 w-full h-auto object-cover object-bottom z-10"
        />

        {/* Layer 2: Third Hill (medium teal) */}
        <img
          src={ThirdHill}
          alt=""
          className="absolute bottom-0 left-0 w-full h-auto object-cover object-bottom z-20"
        />

        {/* Layer 3: First Hill (darker teal/blue) */}
        <img
          src={FirstHill}
          alt=""
          className="absolute bottom-0 left-0 w-full h-auto object-cover object-bottom z-30"
        />

        {/* Layer 4: Second Hill (foreground, darkest blue-green) */}
        <img
          src={SecondHill}
          alt=""
          className="absolute bottom-0 left-0 w-full h-auto object-cover object-bottom z-40"
        />

        {/* Layer 5: Left & Right framing leaves */}
        <img
          src={LeftLeaves}
          alt=""
          className="absolute bottom-0 left-0 w-[12%] max-w-[80px] h-auto object-contain z-50 origin-bottom-left"
        />
        <img
          src={RightLeaves}
          alt=""
          className="absolute bottom-0 right-0 w-[20%] max-w-[130px] h-auto object-contain z-50 origin-bottom-right"
        />

      </div>

    </div>
  );
};

export default AuthBrandPanel;
