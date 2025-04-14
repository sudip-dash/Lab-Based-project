import React, { useState, useEffect } from "react";
import "./HomeSection.css";
import aiResumeImage from "../assets/ai-resume.png"; // Ensure this image exists in assets

const HomeSection = () => {
  const text =
    "Enhance your resume with AI-powered insights! Our system reviews your resume, highlights strengths, and identifies areas for improvement using the latest technology—helping you stand out in today's competitive job market.";

  const [displayedText, setDisplayedText] = useState("");
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      } else {
        clearInterval(interval);
        setAnimationClass("glow"); // Adds glow effect after text completes
      }
    }, 40); // Adjust speed of animation

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homesection">
      <div className="image-container">
        <img src={aiResumeImage} alt="AI Resume Review" />
      </div>

      {/* Vertical Line */}
      <div className="divider"></div>

      <div className="text-container">
        <p className={animationClass}>{displayedText}</p>
      </div>
    </div>
  );
};

export default HomeSection;
