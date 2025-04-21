import React, { useRef, useState, useEffect } from "react";
import FileUploader from "./FileUploader.jsx";
import Logout from "./Logout.jsx";
import HomeSection from "./HomeSection.jsx";
import About from "./About.jsx";
import "./Home.css";

function Home() {
  const sections = {
    Home: useRef(null),
    Resume: useRef(null),
    About: useRef(null),
    Logout: useRef(null),
  };

  const [aboutTrigger, setAboutTrigger] = useState(false);
  const [resumeTrigger, setResumeTrigger] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const resumeFullText =
    "Upload your resume document to store and manage it efficiently.";
  const resumeRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setResumeTrigger(true);
        }
      },
      { threshold: 0.5 }
    );

    if (resumeRef.current) {
      observer.observe(resumeRef.current);
    }

    return () => {
      if (resumeRef.current) {
        observer.unobserve(resumeRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (resumeTrigger) {
      setResumeText("");
      let i = 0;
      const typeText = () => {
        if (i <= resumeFullText.length) {
          setResumeText(resumeFullText.substring(0, i));
          i++;
          setTimeout(typeText, 30);
        }
      };
      typeText();
    }
  }, [resumeTrigger]);

  const scrollToSection = (section) => {
    if (sections[section].current) {
      sections[section].current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      if (section === "About") {
        setAboutTrigger(true);
      }
    }
  };
  useEffect(() => {
    const copyrightElement = document.getElementById("copyright");
    if (copyrightElement) {
      copyrightElement.innerHTML =
        "&copy; 2025 - " +
        new Date().getFullYear() +
        " www.ResumeEnhancer.com - All Rights Reserved.";
    }
  }, []);

  return (
    <div className="parent">
      <nav className="navbar">
        <div className="nav-left">
          {["Home", "Resume", "About"].map((section) => (
            <button key={section} onClick={() => scrollToSection(section)}>
              {section}
            </button>
          ))}
        </div>
        <div className="nav-right">
          <Logout />
        </div>
      </nav>

      <section ref={sections.Home} className="section home">
        <HomeSection />
      </section>
      <div className="section-wrapper">
        <div className="section-divider"></div>
      </div>

      <section
        ref={(el) => {
          sections.Resume.current = el;
          resumeRef.current = el;
        }}
        className="section resume"
      >
        <p>{resumeText}</p>
        <FileUploader />
      </section>
      <div className="section-wrapper">
        <div className="section-divider"></div>
      </div>

      <section ref={sections.About} className="section about">
        <div>
          <h2 className="section-header">About Us</h2>
        </div>

        <About isVisible={aboutTrigger} setIsVisible={setAboutTrigger} />
      </section>
      <div className="section-wrapper">
        <div className="section-divider"></div>
      </div>

      <section ref={sections.Logout} className="section logout">
        <div className="footer-container">
          <div className="contact-details">
            <h2>Contact Me</h2>
            <p>
              <strong>Phone:</strong> +91 98765 43210
            </p>
            <p>
              <strong>Email:</strong> sudip.dash@example.com
            </p>
            <p>
              <strong>LinkedIn:</strong>
              <a
                href="https://linkedin.com/in/sudip-dash"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin.com/in/sudip-dash
              </a>
            </p>
            <p>
              <strong>GitHub:</strong>
              <a
                href="https://github.com/sudip-dash"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/sudip-dash
              </a>
            </p>
          </div>

          <div id="copyright" align="center">
            &copy; 2025 - 2025 www.ResumeEnhancer.com - All Rights Reserved.
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
