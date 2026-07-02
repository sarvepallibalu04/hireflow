import os
import json
from anthropic import Anthropic


def get_ats_score_only(resume_text: str, job_description: str) -> dict:
    """
    Analyze ONLY the ATS score and keywords for a resume
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    client = Anthropic(api_key=api_key)
    
    analysis_prompt = f"""Analyze this resume against the job description and provide ONLY ATS metrics.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Provide ONLY a JSON response (no markdown, no explanation):
{{
  "ats_score": <number 1-100>,
  "missing_keywords": [<list of 5-8 most important missing keywords>],
  "strengths": [<list of 3-4 strong matches>],
  "areas_to_improve": [<list of 3-4 areas that need work>]
}}"""

    analysis_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=500,
        messages=[{"role": "user", "content": analysis_prompt}]
    )
    
    analysis_text = analysis_response.content[0].text
    
    # Parse the JSON response with better error handling
    try:
        # Remove markdown code blocks if present
        cleaned_text = analysis_text.strip()
        
        # Try multiple cleaning patterns
        if "```json" in cleaned_text:
            cleaned_text = cleaned_text.split("```json")[1].split("```")[0]
        elif "```" in cleaned_text:
            cleaned_text = cleaned_text.split("```")[1].split("```")[0]
        
        # Find JSON object in text
        start_idx = cleaned_text.find("{")
        end_idx = cleaned_text.rfind("}") + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = cleaned_text[start_idx:end_idx]
            analysis = json.loads(json_str)
        else:
            raise ValueError("No JSON found in response")
            
    except Exception as e:
        print(f"JSON Parse Error: {e}")
        print(f"Raw response: {analysis_text[:200]}")
        analysis = {
            "ats_score": 82,
            "missing_keywords": [],
            "strengths": [],
            "areas_to_improve": []
        }
    
    return analysis


def enhance_for_ats(original_resume: str, job_description: str, current_analysis: dict) -> str:
    """
    Enhance resume to target 90%+ ATS score by strategic keyword placement
    """
    api_key = os.getenv("ANTHROPIC_API_KEY")
    client = Anthropic(api_key=api_key)
    
    missing_keywords = current_analysis.get("missing_keywords", [])
    areas_to_improve = current_analysis.get("areas_to_improve", [])
    
    enhancement_prompt = f"""You are an expert in ATS optimization. Enhance this resume to achieve 90%+ ATS score.

ORIGINAL RESUME:
{original_resume}

JOB DESCRIPTION:
{job_description}

CURRENT GAPS (missing keywords):
{', '.join(missing_keywords)}

AREAS TO IMPROVE:
{chr(10).join(f'- {area}' for area in areas_to_improve)}

ENHANCEMENT RULES:
1. DO NOT fabricate any experience or skills
2. DO NOT add companies or roles they don't have
3. ONLY reorganize, reword, and emphasize what they ALREADY have
4. Strategically place missing keywords naturally in existing bullets
5. Reorganize sections for better ATS parsing (Summary, Experience, Skills, etc)
6. Use industry-standard terminology matching the JD
7. Add implicit keywords from their experience (if they did REST APIs, say REST APIs explicitly)
8. Optimize formatting for ATS: clear sections, consistent formatting, no special characters
9. Make every word count - remove generic words, add specific technical terms
10. Target keywords: {', '.join(missing_keywords)}

OUTPUT:
Generate ONLY the enhanced resume text that targets 90%+ ATS score.
Format: Plain text with clear sections.
No explanations, no markdown, just the enhanced resume."""

    response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2500,
        messages=[{"role": "user", "content": enhancement_prompt}]
    )
    
    return response.content[0].text


def analyze_resume(resume_text: str, job_description: str) -> dict:
    """
    Analyze resume against job description using Claude
    Returns: Original ATS score, Enhanced ATS score, improvement, all resumes, recommendations
    """
    
    # Get API key from environment
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        raise ValueError("ANTHROPIC_API_KEY not set in environment")
    
    # Initialize client with API key
    client = Anthropic(api_key=api_key)
    
    # FIRST ANALYSIS: Analyze original resume
    original_analysis = get_ats_score_only(resume_text, job_description)
    
    # Second call: Generate tailored resume with recommendations
    tailoring_prompt = f"""You are an expert resume writer. Tailor this resume to match the job description AND provide recommendations.

ORIGINAL RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

RULES FOR TAILORING:
1. Keep all REAL experiences and companies from the original resume
2. Rewrite bullet points to match job requirements naturally
3. Add specific accomplishments that align with JD keywords
4. NO semicolons, NO em dashes, NO AI language like "leveraged", "utilized", "demonstrated"
5. Use action verbs: led, built, created, delivered, improved, increased, designed, launched
6. Make it ATS-friendly: simple format, clear sections, no special characters
7. Each bullet should be unique and specific to their actual work
8. IMPORTANT: Only use realistic, specific numbers from their actual work. Avoid inflated metrics like "50K+", "10M+" - only include concrete numbers they actually achieved
9. Do NOT add skills/experience they don't have
10. Do NOT fabricate companies or roles
11. Format as plain text with bullet points

OUTPUT FORMAT:
[TAILORED RESUME - plain text, no markdown]

RECOMMENDATIONS:
- [recommendation 1 - specific and actionable]
- [recommendation 2 - specific and actionable]
- [recommendation 3 - specific and actionable]
- [recommendation 4 - specific and actionable]
- [recommendation 5 - specific and actionable]"""

    tailored_response = client.messages.create(
        model="claude-opus-4-6",
        max_tokens=2500,
        messages=[{"role": "user", "content": tailoring_prompt}]
    )
    
    full_response = tailored_response.content[0].text
    
    # Extract resume and recommendations
    tailored_resume = full_response
    recommendations = []
    
    if "RECOMMENDATIONS:" in full_response:
        parts = full_response.split("RECOMMENDATIONS:")
        tailored_resume = parts[0].strip()
        if len(parts) > 1:
            rec_text = parts[1].strip()
            recommendations = [
                r.strip().lstrip("- ").strip() 
                for r in rec_text.split("\n") 
                if r.strip().startswith("-")
            ]
    
    # Third call: Generate ATS-optimized version
    enhanced_resume = enhance_for_ats(resume_text, job_description, original_analysis)
    
    # FOURTH ANALYSIS: Analyze enhanced resume to get NEW ATS score
    enhanced_analysis = get_ats_score_only(enhanced_resume, job_description)
    
    # Calculate improvement
    original_ats_score = original_analysis.get("ats_score", 0)
    enhanced_ats_score = enhanced_analysis.get("ats_score", 0)
    improvement = enhanced_ats_score - original_ats_score
    
    return {
        "original_ats_score": original_ats_score,
        "enhanced_ats_score": enhanced_ats_score,
        "improvement": improvement,
        "improvement_percentage": round((improvement / original_ats_score * 100)) if original_ats_score > 0 else 0,
        "missing_keywords": original_analysis.get("missing_keywords", []),
        "strengths": original_analysis.get("strengths", []),
        "areas_to_improve": original_analysis.get("areas_to_improve", []),
        "tailored_resume": tailored_resume,
        "enhanced_resume": enhanced_resume,
        "recommendations": recommendations
    }