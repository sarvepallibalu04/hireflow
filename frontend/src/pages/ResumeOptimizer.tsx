import React, { useState } from 'react';
import { FileText, Download, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface AnalysisResult {
  original_ats_score: number;
  enhanced_ats_score: number;
  improvement: number;
  improvement_percentage: number;
  missing_keywords: string[];
  strengths: string[];
  areas_to_improve: string[];
  tailored_resume: string;
  enhanced_resume: string;
  recommendations: string[];
}

interface EnhanceMoreResult {
  previous_ats_score: number;
  new_ats_score: number;
  improvement: number;
  more_enhanced_resume: string;
  missing_keywords: string[];
  strengths: string[];
  areas_to_improve: string[];
}

const ResumeOptimizer: React.FC = () => {
  const [resumeInput, setResumeInput] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [enhanceLoading, setEnhanceLoading] = useState(false);
  const [enhanceResult, setEnhanceResult] = useState<EnhanceMoreResult | null>(null);
  const [displayedResume, setDisplayedResume] = useState('enhanced');
  const [enhanceCount, setEnhanceCount] = useState(0);
  const [customPrompt, setCustomPrompt] = useState('');
  const [customEnhanceLoading, setCustomEnhanceLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setResumeInput(`${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
    }
  };

  const handleAnalyze = async () => {
    if ((!resumeInput.trim() && !resumeFile) || !jobDescription.trim()) {
      setError('Please provide both resume and job description');
      return;
    }

    setLoading(true);
    setError('');
    setEnhanceCount(0);

    try {
      const formData = new FormData();
      
      if (resumeFile) {
        formData.append('resume_file', resumeFile);
      } else {
        formData.append('resume_text', resumeInput);
      }
      
      formData.append('job_description', jobDescription);

      const response = await fetch(
        'http://localhost:8000/api/v1/resume/analyze',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to analyze resume');
      }

      const data = await response.json();
      setAnalysisResult(data);
      setDisplayedResume('enhanced');
      setEnhanceResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEnhanceMore = async () => {
    if (!analysisResult && !enhanceResult) return;

    setEnhanceLoading(true);
    setError('');

    try {
      const resumeToEnhance = enhanceResult?.more_enhanced_resume || analysisResult?.enhanced_resume || '';

      const formData = new FormData();
      formData.append('enhanced_resume', resumeToEnhance);
      formData.append('job_description', jobDescription);

      const response = await fetch(
        'http://localhost:8000/api/v1/resume/enhance-more',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to enhance resume further');
      }

      const data = await response.json();
      setEnhanceResult(data);
      setDisplayedResume('more-enhanced');
      setEnhanceCount(enhanceCount + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setEnhanceLoading(false);
    }
  };

  const handleCustomEnhance = async () => {
    if (!customPrompt.trim()) {
      setError('Please enter custom enhancement requirements');
      return;
    }

    setCustomEnhanceLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume_text', resumeInput);
      formData.append('job_description', jobDescription);
      formData.append('custom_prompt', customPrompt);

      const response = await fetch(
        'http://localhost:8000/api/v1/resume/enhance-custom',
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to apply custom enhancement');
      }

      const data = await response.json();
      setEnhanceResult(data);
      setDisplayedResume('more-enhanced');
      setEnhanceCount(enhanceCount + 1);
      setCustomPrompt('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCustomEnhanceLoading(false);
    }
  };

  const downloadResume = async (format: 'txt' | 'docx' = 'txt') => {
    let content = '';
    let filename = 'resume';

    if (displayedResume === 'enhanced' && analysisResult) {
      content = analysisResult.enhanced_resume;
      filename = `enhanced-resume-${analysisResult.enhanced_ats_score}`;
    } else if (displayedResume === 'more-enhanced' && enhanceResult) {
      content = enhanceResult.more_enhanced_resume;
      filename = `enhanced-resume-${enhanceResult.new_ats_score}`;
    } else if (analysisResult) {
      content = analysisResult.tailored_resume;
      filename = 'tailored-resume';
    }

    if (format === 'docx') {
      try {
        const paragraphs = content.split('\n').map(
          (line) => new Paragraph({
            text: line || ' ',
            spacing: { line: 240, lineRule: 'auto' },
          })
        );

        const doc = new Document({
          sections: [
            {
              properties: {},
              children: paragraphs,
            },
          ],
        });

        const blob = await Packer.toBlob(doc);
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', `${filename}.docx`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        setError('Failed to generate DOCX file');
      }
    } else {
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
      element.setAttribute('download', `${filename}.txt`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const currentScore = enhanceResult?.new_ats_score || analysisResult?.enhanced_ats_score || 0;
  const originalScore = analysisResult?.original_ats_score || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-sky-600" />
            <h1 className="text-4xl font-bold text-slate-900">Resume Optimizer</h1>
          </div>
          <p className="text-lg text-slate-600">
            Powered by Claude AI • Achieve 90%+ ATS Score
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Upload Resume</h2>

              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded font-medium transition ${
                    activeTab === 'upload'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`px-4 py-2 rounded font-medium transition ${
                    activeTab === 'paste'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Paste Text
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-sky-600 transition">
                  <input
                    type="file"
                    accept=".txt,.pdf,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="resume-file"
                  />
                  <label htmlFor="resume-file" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-slate-400" />
                      <p className="font-medium text-slate-700">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-slate-500">TXT, PDF or DOCX file</p>
                    </div>
                  </label>
                </div>
              ) : (
                <textarea
                  value={resumeInput}
                  onChange={(e) => {
                    setResumeInput(e.target.value);
                    setResumeFile(null);
                  }}
                  placeholder="Paste your resume here..."
                  className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
                />
              )}

              {resumeInput && (
                <p className="text-sm text-slate-600 mt-2">
                  ✓ Resume loaded ({resumeInput.length} characters)
                </p>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Job Description</h2>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here..."
                className="w-full h-40 p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
              {jobDescription && (
                <p className="text-sm text-slate-600 mt-2">
                  ✓ Job description loaded ({jobDescription.length} characters)
                </p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || (!resumeInput.trim() && !resumeFile) || !jobDescription.trim()}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-400 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {loading ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </div>

          <div className="space-y-6">
            {analysisResult ? (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-2xl font-semibold text-slate-900 mb-4">ATS Score</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Original</span>
                        <span className="text-lg font-bold text-slate-900">{originalScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{ width: `${originalScore}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">
                          Enhanced {enhanceCount > 0 ? `(Pass ${enhanceCount + 1})` : ''}
                        </span>
                        <span className="text-lg font-bold text-slate-900">{currentScore}/100</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            currentScore >= 90 ? 'bg-green-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${currentScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-sky-50 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-sky-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sky-900">
                          +{currentScore - originalScore} points
                        </p>
                        <p className="text-sm text-sky-700">
                          {Math.round(((currentScore - originalScore) / originalScore) * 100)}% improvement
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-xl font-semibold text-slate-900 mb-4">Analysis</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {(enhanceResult?.missing_keywords || analysisResult?.missing_keywords || [])
                          .slice(0, 5)
                          .map((keyword, i) => (
                            <span
                              key={i}
                              className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {keyword}
                            </span>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-slate-700 mb-2">Strengths</h4>
                      <div className="space-y-2">
                        {(enhanceResult?.strengths || analysisResult?.strengths || [])
                          .slice(0, 3)
                          .map((strength, i) => (
                            <p key={i} className="text-sm text-slate-600 flex gap-2">
                              <span className="text-green-600">✓</span> {strength}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setDisplayedResume('tailored')}
                      className={`px-4 py-2 rounded font-medium transition ${
                        displayedResume === 'tailored'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Tailored
                    </button>
                    <button
                      onClick={() => setDisplayedResume('enhanced')}
                      className={`px-4 py-2 rounded font-medium transition ${
                        displayedResume === 'enhanced'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Enhanced
                    </button>
                    {enhanceResult && (
                      <button
                        onClick={() => setDisplayedResume('more-enhanced')}
                        className={`px-4 py-2 rounded font-medium transition ${
                          displayedResume === 'more-enhanced'
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Pass {enhanceCount + 1}
                      </button>
                    )}
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                      {displayedResume === 'tailored'
                        ? analysisResult.tailored_resume
                        : displayedResume === 'enhanced'
                        ? analysisResult.enhanced_resume
                        : enhanceResult?.more_enhanced_resume}
                    </pre>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => downloadResume('txt')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download TXT
                    </button>
                    <button
                      onClick={() => downloadResume('docx')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      Download DOCX
                    </button>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleEnhanceMore}
                      disabled={enhanceLoading || enhanceCount >= 2}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      {enhanceLoading ? 'Enhancing...' : 'Enhance More'}
                    </button>
                  </div>

                  {enhanceCount >= 2 && (
                    <p className="text-sm text-slate-600 text-center mt-2">
                      Maximum enhancement passes reached (95%+ score achieved)
                    </p>
                  )}

                  <div className="mt-6 border-t pt-6">
                    <h4 className="font-semibold text-slate-900 mb-3">Custom Enhancement</h4>
                    <p className="text-sm text-slate-600 mb-3">
                      Tell Claude what to enhance (e.g., "Add more cloud architecture details", "Highlight leadership experience")
                    </p>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="E.g., Add more details about distributed systems, highlight DevOps expertise..."
                      className="w-full h-20 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-600 text-sm"
                    />
                    <button
                      onClick={handleCustomEnhance}
                      disabled={customEnhanceLoading || !customPrompt.trim()}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Zap className="w-5 h-5" />
                      {customEnhanceLoading ? 'Applying Enhancement...' : 'Apply Custom Enhancement'}
                    </button>
                  </div>
                </div>

                {(analysisResult.recommendations || []).length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-3">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysisResult.recommendations.slice(0, 3).map((rec, i) => (
                        <li key={i} className="text-sm text-blue-800 flex gap-2">
                          <span className="flex-shrink-0">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 text-lg">
                  Upload your resume and paste a job description to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export { ResumeOptimizer };
