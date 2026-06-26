"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  Leaf,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Activity,
  FileText,
  Search,
  Menu,
  X,
  Home,
  BarChart3,
  Settings,
  User,
  ChevronLeft,
  Download,
  Share2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";

interface Disease {
  name: string;
  confidence: number;
  severity: "low" | "medium" | "high";
  description: string;
  treatment: string[];
}

interface AnalysisResult {
  disease: Disease;
  affectedArea: number;
  detectedAt: string;
  recommendations: string[];
}

const AGRIXA_Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState("Dashboard");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { name: "Dashboard", icon: Home },
    { name: "Detection", icon: Camera },
    { name: "History", icon: FileText },
    { name: "Analytics", icon: BarChart3 },
    { name: "Profile", icon: User },
    { name: "Settings", icon: Settings },
  ];

  const mockDiseases: Disease[] = [
    {
      name: "Late Blight",
      confidence: 94.5,
      severity: "high",
      description: "A serious fungal disease affecting leaves and stems",
      treatment: [
        "Remove infected plants immediately",
        "Apply copper-based fungicide",
        "Improve air circulation",
        "Avoid overhead watering",
      ],
    },
    {
      name: "Leaf Spot",
      confidence: 87.3,
      severity: "medium",
      description: "Fungal infection causing circular spots on leaves",
      treatment: [
        "Remove affected leaves",
        "Apply organic fungicide",
        "Ensure proper spacing between plants",
        "Water at soil level",
      ],
    },
    {
      name: "Powdery Mildew",
      confidence: 91.2,
      severity: "medium",
      description: "White powdery coating on leaves and stems",
      treatment: [
        "Spray with neem oil solution",
        "Increase sunlight exposure",
        "Reduce humidity levels",
        "Apply sulfur-based fungicide",
      ],
    },
  ];

  const recentActivity = [
    { action: "Disease detected", crop: "Tomato", time: "2 hours ago", status: "warning" },
    { action: "Analysis completed", crop: "Potato", time: "5 hours ago", status: "success" },
    { action: "Report generated", crop: "Wheat", time: "1 day ago", status: "info" },
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadstart = () => {
        setUploadProgress(0);
      };
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress((e.loaded / e.total) * 100);
        }
      };
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setUploadProgress(100);
        setTimeout(() => setUploadProgress(0), 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    // After the loader completes, the onComplete will trigger the result
  };

  const onAnalysisComplete = async () => {
    if (!selectedImage) return;

    try {
      // 1. Convert the on-screen image back into a file format
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      
      // 2. Package the image to send to the Python API
      const formData = new FormData();
      formData.append("file", blob, "upload.jpg");

      // 3. Send it to port 8000 (Your AI Bridge)
      const apiResponse = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      // 4. Get the AI's prediction back
      const data = await apiResponse.json();

      // 5. Update the dashboard with the REAL results!
      setAnalysisResult({
        disease: {
          // Clean up the name (e.g., "Tomato___Late_blight" -> "Tomato Late blight")
          name: data.disease.replace(/___/g, ' - ').replace(/_/g, ' '),
          confidence: data.confidence,
          // Automatically set severity based on if it is healthy or not
          severity: data.disease.toLowerCase().includes("healthy") ? "low" : "high",
          description: "Analyzed by AI Disease Detection Model",
          // Wrap the treatment string in an array so the UI list works
          treatment: [data.treatment], 
        },
        affectedArea: data.disease.toLowerCase().includes("healthy") ? 0 : Math.floor(Math.random() * 40) + 10,
        detectedAt: new Date().toLocaleString(),
        recommendations: [data.treatment],
      });

    } catch (error) {
      console.error("Failed to reach Python AI:", error);
      alert("Could not connect to the AI. Make sure api.py is running on port 8000!");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-secondary/10">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-border hover:bg-accent transition-colors"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-white border-r border-border transition-all duration-300 z-40 shadow-xl ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            {!isSidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-foreground">AGRIXA</h1>
                <p className="text-xs text-muted-foreground">AI disease detection</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronLeft
              size={20}
              className={`transition-transform ${isSidebarCollapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenuItem === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setActiveMenuItem(item.name);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
              >
                <Icon size={20} />
                {!isSidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile & Credits */}
        {!isSidebarCollapsed && (
          <div className="p-4 border-t border-border space-y-4">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-accent">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">AG</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Agro Expert</p>
                <p className="text-xs text-muted-foreground truncate">Senior Agronomist</p>
              </div>
            </div>

            <div className="px-4 py-2 bg-muted/30 rounded-lg">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-2">Team Credits</p>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground flex justify-between"><span>Member 1:</span> <span className="text-foreground font-medium">ML Model</span></p>
                <p className="text-[10px] text-muted-foreground flex justify-between"><span>Member 2:</span> <span className="text-foreground font-medium">Software UI</span></p>
                <p className="text-[10px] text-muted-foreground flex justify-between"><span>Member 3:</span> <span className="text-foreground font-medium">Integration</span></p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`transition-all duration-300 ${isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
          }`}
      >
        <div className="p-4 sm:p-8 ml-16 lg:ml-0">
          {activeMenuItem === "Dashboard" && (
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-bold text-foreground">AGRIXA Dashboard</h2>
                <p className="text-muted-foreground">Overview of your agricultural detection network</p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 border-l-4 border-l-primary">
                  <CheckCircle className="text-primary mb-2" />
                  <div className="text-2xl font-bold">1,247</div>
                  <div className="text-sm text-muted-foreground">Healthy Crops</div>
                </Card>
                <Card className="p-6 border-l-4 border-l-secondary">
                  <AlertCircle className="text-secondary-foreground mb-2" />
                  <div className="text-2xl font-bold">89</div>
                  <div className="text-sm text-muted-foreground">Active Detections</div>
                </Card>
                <Card className="p-6 border-l-4 border-l-blue-500">
                  <TrendingUp className="text-blue-500 mb-2" />
                  <div className="text-2xl font-bold">94.5%</div>
                  <div className="text-sm text-muted-foreground">System Accuracy</div>
                </Card>
              </div>
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex gap-4 p-3 bg-muted/30 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${a.status === 'success' ? 'bg-primary' : 'bg-yellow-500'}`} />
                      <div>
                        <p className="font-medium">{a.action}</p>
                        <p className="text-xs text-muted-foreground">{a.crop} • {a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeMenuItem === "Detection" && (
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-bold text-foreground">Disease Detection</h2>
                <p className="text-muted-foreground">Upload leaf images for immediate AI diagnosis</p>
              </motion.div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card className="p-8">
                    {!selectedImage ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="font-medium text-lg">Select Leaf Image</p>
                        <p className="text-sm text-muted-foreground">Supports JPG, PNG</p>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative rounded-lg overflow-hidden border">
                          <img src={selectedImage} className="w-full h-80 object-cover" alt="Selected" />
                          <button onClick={() => { setSelectedImage(null); setAnalysisResult(null); }} className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow"><X size={18} /></button>
                        </div>
                        {isAnalyzing ? (
                          <div className="py-8"><ProgressiveFluxLoader duration={5} onComplete={onAnalysisComplete} /></div>
                        ) : !analysisResult ? (
                          <Button onClick={handleAnalyze} className="w-full h-12 text-lg">Start AI Analysis</Button>
                        ) : (
                          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-primary/5 border border-primary/20 rounded-xl">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <Badge className={getSeverityColor(analysisResult.disease.severity)}>{analysisResult.disease.severity.toUpperCase()} SEVERITY</Badge>
                                <h4 className="text-2xl font-bold mt-2">{analysisResult.disease.name}</h4>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-muted-foreground uppercase font-bold tracking-tighter">Confidence</div>
                                <div className="text-2xl font-black text-primary">{analysisResult.disease.confidence}%</div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="p-4 bg-white border rounded-lg shadow-sm">
                                <h5 className="font-bold flex items-center gap-2 mb-2"><Info size={16} className="text-primary" /> Treatment Plan</h5>
                                <ul className="space-y-1">
                                  {analysisResult.disease.treatment.map((t, i) => <li key={i} className="text-sm text-muted-foreground flex gap-2"><span>•</span> {t}</li>)}
                                </ul>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
                <div className="space-y-6">
                  <Card className="p-6 bg-primary/5">
                    <h3 className="font-bold mb-4 flex gap-2 items-center"><Search size={18} /> Detection Tips</h3>
                    <ul className="text-sm space-y-3 text-muted-foreground">
                      <li>• Ensure the leaf is flat and well-lit.</li>
                      <li>• Avoid shadows or direct camera glare.</li>
                      <li>• Focus on the infected area of the leaf.</li>
                      <li>• High resolution images yield better accuracy.</li>
                    </ul>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeMenuItem === "History" && (
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-bold text-foreground">Detection History</h2>
                <p className="text-muted-foreground">Detailed log of past agricultural analyses</p>
              </motion.div>
              <Card className="overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="p-4 font-semibold text-sm">Date</th>
                      <th className="p-4 font-semibold text-sm">Crop</th>
                      <th className="p-4 font-semibold text-sm">Diagnosis</th>
                      <th className="p-4 font-semibold text-sm">Confidence</th>
                      <th className="p-4 font-semibold text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentActivity.map((a, i) => (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="p-4 text-sm">{a.time}</td>
                        <td className="p-4 text-sm font-medium">{a.crop}</td>
                        <td className="p-4 text-sm">{a.action === 'Disease detected' ? 'Late Blight' : 'Healthy'}</td>
                        <td className="p-4 text-sm">{90 + i}%</td>
                        <td className="p-4"><Badge variant="outline" className={a.status === 'success' ? 'border-primary text-primary' : 'border-yellow-600 text-yellow-600'}>{a.status.toUpperCase()}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>
          )}

          {activeMenuItem === "Analytics" && (
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-bold text-foreground">AI Analytics</h2>
                <p className="text-muted-foreground">Trends and predictive analysis for crop health</p>
              </motion.div>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="font-bold mb-6 flex items-center gap-2"><BarChart3 size={18} /> Monthly Health Trend</h3>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-muted-foreground">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="font-bold mb-6">Distribution of Diseases</h3>
                  <div className="space-y-4">
                    {['Late Blight', 'Leaf Spot', 'Powdery Mildew'].map((d, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-sm"><span>{d}</span><span>{30 - i * 5}%</span></div>
                        <Progress value={30 - i * 5} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeMenuItem === "Settings" && (
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-3xl font-bold text-foreground">Global Settings</h2>
                <p className="text-muted-foreground">Configure your AGRIXA profile and preferences</p>
              </motion.div>
              <Card className="p-8 max-w-2xl">
                <div className="space-y-6">
                  <div className="flex justify-between items-center py-4 border-b">
                    <div>
                      <p className="font-bold">Aggressive Scanning</p>
                      <p className="text-xs text-muted-foreground">Increases sensitivity for minor disease symptoms</p>
                    </div>
                    <div className="w-12 h-6 bg-primary rounded-full relative"><div className="w-5 h-5 bg-white rounded-full absolute right-1 top-0.5" /></div>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b">
                    <div>
                      <p className="font-bold">Expert Verification</p>
                      <p className="text-xs text-muted-foreground">Automatically send high-severity cases to expert review</p>
                    </div>
                    <div className="w-12 h-6 bg-muted rounded-full relative"><div className="w-5 h-5 bg-white rounded-full absolute left-1 top-0.5" /></div>
                  </div>
                  <Button variant="outline" className="w-fit">Save Preferences</Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AGRIXA_Dashboard;
