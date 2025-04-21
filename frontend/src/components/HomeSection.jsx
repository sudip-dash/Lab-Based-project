import React, { useState, useEffect } from "react";
import "./HomeSection.css";
import aiResumeImage from "../assets/resume-report.png"; // Make sure this image exists in your project

const HomeSection = () => {
  const text =
    "Enhance your resume with AI-powered insights! Our system reviews your resume, highlights strengths, and identifies areas for improvement using the latest technology—helping you stand out in today's competitive job market.";

  const [displayedText, setDisplayedText] = useState("");
  const [animationClass, setAnimationClass] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length - 1) {
        setDisplayedText((prev) => prev + text[index]);
        index++;
      }
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const features = [
    "AI-Powered Resume Analysis",
    "Real-Time Suggestions",
    "Highlights Strengths & Weaknesses",
    "ATS Optimization",
    "Professional Formatting Tips",
    "Tailored for Job Roles",
  ];

  return (
    <div className="homesection">
      <div className="top-section">
        <div className="text-container">
          <p className={animationClass}>{displayedText}</p>
        </div>

        <div className="image-container">
          <img src={aiResumeImage} alt="AI Resume Review" />
        </div>
      </div>

      {/* Feature Slider */}
      <div className="features-slider-container">
        <div className="features-slider">
          {features.concat(features).map((feature, index) => (
            <div className="feature-box" key={index}>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeSection;
