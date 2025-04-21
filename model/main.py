import os
import re
import requests
import pytesseract
import numpy as np
import cv2
from dotenv import load_dotenv
from pdf2image import convert_from_path
from docx2txt import process
from PIL import Image
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from google import genai
import sys

# Download required NLTK data silently

class DocumentProcessor:
    def __init__(self, input_file=None, gemini_api=None):
        # Initialize with file path if provided
        self.input_file = input_file
        self.processed_image = None
        self.ocr_text = None
        self.points = []
        
        # Initialize Gemini
        self.gemini_api = gemini_api
        self.gemini_client = None
        if gemini_api:
            self.gemini_client = genai.Client(api_key=gemini_api)
        else:
            raise ValueError("Gemini API key is required")
    
    def convert_document_to_image(self):
        """Convert PDF or DOCX to image"""
        if not self.input_file:
            raise ValueError("No input file provided")
        
        if self.input_file.lower().endswith(".pdf"):
            # Convert PDF to image
            pages = convert_from_path(self.input_file, dpi=300)
            if not pages:
                raise Exception("No pages found in PDF.")
            # Use first page image
            self.processed_image = np.array(pages[0])
            self.points.append("PDF converted to image")
            
        elif self.input_file.lower().endswith(".docx"):
            # Extract text from DOCX
            text = process(self.input_file)
            
            # Create blank white image with text
            blank_img = np.ones((800, 600, 3), dtype=np.uint8) * 255
            y = 30
            for line in text.split('\n')[:20]:  # Limit lines to avoid overflow
                cv2.putText(blank_img, line.strip(), (20, y), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
                y += 30
            
            self.processed_image = blank_img
            self.points.append("DOCX converted to image")
        else:
            raise ValueError("Unsupported file type. Only PDF and DOCX are supported.")
        
        return self.processed_image
    
    def preprocess_image(self):
        """Preprocess image for better OCR results"""
        if self.processed_image is None:
            raise ValueError("No image to process. Call convert_document_to_image first.")
        
        # Convert to grayscale if image is color
        if len(self.processed_image.shape) == 3:
            gray = cv2.cvtColor(self.processed_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = self.processed_image
        
        # Remove noise
        blur = cv2.medianBlur(gray, 3)
        
        # Resize for better OCR
        resized = cv2.resize(blur, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
        
        self.processed_image = resized
        self.points.append("Image preprocessed for OCR")
        return self.processed_image
    
    def perform_ocr(self):
        """Extract text from processed image using OCR"""
        if self.processed_image is None:
            raise ValueError("No image to process. Call preprocess_image first.")
        
        # Convert numpy array to PIL Image for Tesseract
        pil_image = Image.fromarray(self.processed_image)
        
        # Perform OCR
        self.ocr_text = pytesseract.image_to_string(pil_image)
        self.points.append(f"OCR completed: extracted {len(self.ocr_text)} characters")
        return self.ocr_text
    
    def analyze_text_styles(self):
        """Analyze text style characteristics"""
        if not self.ocr_text:
            raise ValueError("No OCR text available")
        
        lines = self.ocr_text.splitlines()
        word_lengths = []
        upper_case_lines = 0
        
        for line in lines:
            words = line.split()
            word_lengths.extend(len(word) for word in words)
            if line.strip().isupper():
                upper_case_lines += 1
        
        if word_lengths:
            avg_len = sum(word_lengths) / len(word_lengths)
            self.points.append(f"Average word length: {avg_len:.2f}")
        else:
            self.points.append("No words found.")
        
        if lines:
            upper_pct = (upper_case_lines / len(lines)) * 100
            self.points.append(f"Lines in ALL CAPS: {upper_case_lines} ({upper_pct:.2f}%)")
        else:
            self.points.append("No lines found.")
    
    def check_urls(self):
        """Check if URLs in text are valid"""
        if not self.ocr_text:
            raise ValueError("No OCR text available")
        
        url_pattern = r'https?://[^\s<>"]+|www\.[^\s<>"]+'
        urls = re.findall(url_pattern, self.ocr_text)
        
        self.points.append("URL CHECK RESULTS:")
        if urls:
            for url in urls:
                if not url.startswith("http"):
                    url = "http://" + url
                try:
                    response = requests.get(url, timeout=5)
                    if response.status_code == 200:
                        self.points.append(f"Link is working: {url}")
                    else:
                        self.points.append(f"Link returned status code {response.status_code}: {url}")
                except requests.exceptions.RequestException as e:
                    self.points.append(f"Error opening link: {url} - Reason: {str(e)[:100]}")
        else:
            self.points.append("No URLs found in the OCR text.")
    
    def get_keywords_for_role(self, job_role):
        """Get predefined keywords for common job roles"""
        # Define job role keywords
        keywords_by_role = {
            "AI/ML Developer": [
                "machine learning", "python", "tensorflow", "pytorch", "neural networks", 
                "deep learning", "data science", "algorithms", "NLP", "computer vision",
                "data analysis", "scikit-learn", "model training", "keras", "jupyter",
                "AI", "artificial intelligence", "data preprocessing", "feature engineering",
                "hyperparameter tuning", "reinforcement learning", "GANs", "transformers"
            ],
            "Software Engineer": [
                "java", "python", "c++", "javascript", "git", "algorithms", "data structures",
                "cloud", "agile", "CI/CD", "API", "testing", "software development", "programming",
                "object-oriented", "microservices", "REST", "design patterns", "databases", "SQL",
                "debugging", "problem-solving", "scalability", "team collaboration"
            ],
            "Data Scientist": [
                "python", "R", "sql", "statistics", "machine learning", "data analysis",
                "visualization", "pandas", "numpy", "jupyter", "big data", "algorithms",
                "data cleaning", "regression", "classification", "clustering", "feature selection",
                "hypothesis testing", "A/B testing", "data mining", "predictive modeling"
            ],
            "Web Developer": [
                "html", "css", "javascript", "react", "angular", "node.js", "responsive design",
                "frontend", "backend", "api", "git", "web development", "frameworks",
                "vue.js", "express", "webpack", "sass", "less", "bootstrap", "ui/ux",
                "accessibility", "SEO", "performance optimization", "cross-browser compatibility"
            ],
            "Data Engineer": [
                "python", "sql", "nosql", "etl", "data pipelines", "data warehousing", "big data",
                "spark", "hadoop", "kafka", "airflow", "docker", "kubernetes", "cloud platforms",
                "data modeling", "database optimization", "data governance", "data security"
            ],
            "DevOps Engineer": [
                "ci/cd", "docker", "kubernetes", "terraform", "ansible", "jenkins", "git",
                "cloud services", "aws", "azure", "gcp", "linux", "scripting", "monitoring",
                "infrastructure as code", "automation", "security", "networking", "troubleshooting"
            ],
            "Product Manager": [
                "product strategy", "agile", "roadmap", "user stories", "market research",
                "user experience", "stakeholder management", "prioritization", "analytics",
                "competitive analysis", "customer feedback", "product lifecycle", "leadership"
            ],
            "UX/UI Designer": [
                "user research", "wireframing", "prototyping", "figma", "sketch", "adobe xd",
                "user testing", "accessibility", "interaction design", "visual design",
                "information architecture", "responsive design", "design systems", "typography"
            ]
        }
        
        # Find the closest matching role
        job_role_lower = job_role.lower()
        for role, keywords in keywords_by_role.items():
            if role.lower() in job_role_lower or job_role_lower in role.lower():
                return role, keywords
        
        # If no direct match, return generic tech keywords
        return "Generic Technical Role", [
            "programming", "software", "development", "technology", "communication", 
            "problem-solving", "teamwork", "project management", "analytical skills",
            "data analysis", "critical thinking", "attention to detail", "time management",
            "documentation", "leadership", "adaptability", "research", "innovation"
        ]
    
    def analyze_keywords(self, job_role):
        """Analyze document for keywords relevant to the job role"""
        if not self.ocr_text:
            raise ValueError("No OCR text available")
        
        # Get keywords for the job role
        matched_role, role_keywords = self.get_keywords_for_role(job_role)
        
        # Process OCR text
        ocr_text_lower = self.ocr_text.lower()
        tokens = word_tokenize(ocr_text_lower)
        stop_words = set(stopwords.words('english'))
        ocr_keywords = [word for word in tokens if word.isalpha() and word not in stop_words]
        
        # Check for keywords in text
        found_keywords = []
        missing_keywords = []
        
        for keyword in role_keywords:
            keyword_lower = keyword.lower()
            # Check for both exact matches and partial matches for multi-word keywords
            if keyword_lower in ocr_text_lower or any(part in ocr_keywords for part in keyword_lower.split()):
                found_keywords.append(keyword)
            else:
                missing_keywords.append(keyword)
        
        # Calculate score
        total_keywords = len(role_keywords)
        found_count = len(found_keywords)
        
        if total_keywords > 0:
            keyword_score = (found_count / total_keywords) * 100
            
            self.points.append(f"\nKEYWORD ANALYSIS:")
            self.points.append(f"Matched Role: {matched_role}")
            self.points.append(f"Keyword Match Score: {keyword_score:.2f}%")
            
            self.points.append(f"Found Keywords ({found_count}/{total_keywords}):")
            for keyword in found_keywords[:5]:  # Show only first 5
                self.points.append(f"+ {keyword}")
            if len(found_keywords) > 5:
                self.points.append(f"+ ...and {len(found_keywords) - 5} more")
            
            self.points.append(f"Missing Keywords ({len(missing_keywords)}/{total_keywords}):")
            for keyword in missing_keywords[:10]:  # Show only first 10
                self.points.append(f"- {keyword}")
            if len(missing_keywords) > 10:
                self.points.append(f"- ...and {len(missing_keywords) - 10} more")
    
    def generate_ai_analysis(self, job_role):
        """Generate AI analysis using Gemini with tailored instructions"""
        if not self.gemini_client:
            raise ValueError("Gemini client not initialized")
        
        if not self.ocr_text:
            raise ValueError("No OCR text available")
        
        # Create a comprehensive prompt for Gemini
        analysis_summary = "\n".join(self.points)
        
        prompt = f"""
        You are a professional resume and document advisor.

        Take the following instructions and suggest improvements tailored for this user based on the job role: {job_role}

        Document OCR Text:
        {self.ocr_text}

        Document Analysis:
        {analysis_summary}

        Please provide specific, actionable improvements to make this document more effective for the {job_role} position. 
        Focus on content, formatting, keywords, and overall presentation. Highlight both strengths and areas for improvement.
        
        Structure your response with clear headings and bullet points for easy reading. Include:
        1. Overall assessment
        2. Keyword recommendations (what to add, emphasize or modify)
        3. Formatting and presentation suggestions
        4. Content improvements
        5. Additional tips specific to the {job_role} role
        """
        
        try:
            response = self.gemini_client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            return response.text
        except Exception as e:
            return f"Error generating AI analysis: {e}"
    
    def process_document(self, job_role):
        """Process document through the pipeline and return only Gemini analysis"""
        try:
            # Core processing steps
            self.convert_document_to_image()
            self.preprocess_image()
            self.perform_ocr()
            self.analyze_text_styles()
            self.check_urls()
            self.analyze_keywords(job_role)
            
            # Generate and return only the Gemini analysis
            return self.generate_ai_analysis(job_role)
            
        except Exception as e:
            return f"Error processing document: {str(e)}"


# Main execution
def main():
    load_dotenv()  # Load environment variables from .env file
    
    # Get configuration from environment variables
    input_file = os.getenv("INPUT_FILE")
    gemini_api = os.getenv("GEMINI_API")
    
    if not input_file:
        print("Error: INPUT_FILE environment variable not set")
        return
    
    if not gemini_api:
        print("Error: GEMINI_API environment variable not set")
        return
    
    # Create processor instance
    try:
        processor = DocumentProcessor(
            input_file=input_file,
            gemini_api=gemini_api
        )
        
        # Get job role from user input
        for line in sys.stdin:
            job_role = line.strip()
        if not job_role.strip():
            job_role = "Generic professional position"
        
        # Process document and print only Gemini output
        gemini_output = processor.process_document(job_role)
        print("\n" + "="*50)
        print("GEMINI AI RECOMMENDATIONS:")
        print("="*50)
        print(gemini_output)
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()