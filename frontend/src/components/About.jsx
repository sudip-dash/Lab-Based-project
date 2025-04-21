import React, { useState, useEffect, useRef } from "react";
import { FaShieldAlt, FaCheckCircle, FaUsers } from "react-icons/fa";
import "./About.css";

const textData = [
  {
    title: "Reliable",
    icon: <FaShieldAlt className="about-icon" />,
    fullText: "Built on cutting-edge AI, our system ensures thorough and consistent resume analysis.",
  },
  {
    title: "Accurate",
    icon: <FaCheckCircle className="about-icon" />,
    fullText: "Identifies key strengths and weaknesses, ensuring your resume aligns with industry standards.",
  },
  {
    title: "User-Friendly",
    icon: <FaUsers className="about-icon" />,
    fullText: "Designed for ease of use, providing clear and actionable feedback to improve your resume.",
  },
];

function About({ isVisible, setIsVisible }) {
  const [renderedText, setRenderedText] = useState(["", "", ""]);
  const [hasStarted, setHasStarted] = useState(false);
  const aboutRef = useRef(null);

  // Detect if About section is in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true); // Trigger animation on scroll
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the section is visible
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => {
      if (aboutRef.current) {
        observer.unobserve(aboutRef.current);
      }
    };
  }, [setIsVisible]);

  useEffect(() => {
    if (isVisible && !hasStarted) {
      setHasStarted(true); // Prevent re-triggering

      textData.forEach((item, index) => {
        let i = 0;

        const typeText = () => {
          if (i <= item.fullText.length) {
            setRenderedText((prev) => {
              const newText = [...prev];
              newText[index] = item.fullText.substring(0, i);
              return newText;
            });
            i++;
            setTimeout(typeText, 30);
          }
        };

        setTimeout(typeText, index * 600); // Add delay for each box
      });
    }
  }, [isVisible, hasStarted]); // Runs only once when isVisible becomes true

  return (
    <div ref={aboutRef} className="about-container">
      {textData.map((item, index) => (
        <div key={index} className={`about-box ${isVisible ? "animate" : ""}`}>
          {item.icon}
          <h2>{item.title}</h2>
          <p>{renderedText[index]}</p>
        </div>
      ))}
    </div>
  );
}

export default About;
