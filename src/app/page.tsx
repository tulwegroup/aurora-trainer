'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Play, Settings, BarChart3, Map, FileText, Database, Brain, Target, Globe } from 'lucide-react';

interface TrainingJob {
  id: string;
  status: 'idle' | 'uploading' | 'preprocessing' | 'training' | 'completed' | 'error';
  progress: number;
  depositType?: string;
  profile: string;
  currentStep?: string;
  results?: any;
}

interface RegionalAnalysis {
  id: string;
  regionName: string;
  status: string;
  progress: number;
  currentStep: string;
  startTime: string;
  results?: any;
}

export default function AuroraDashboard() {
  const [trainingJobs, setTrainingJobs] = useState<TrainingJob[]>([]);
  const [regionalAnalyses, setRegionalAnalyses] = useState<RegionalAnalysis[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('quick_test');
  const [selectedTarget, setSelectedTarget] = useState('gold');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [analysisType, setAnalysisType] = useState('quick');
  const [showCustomRegion, setShowCustomRegion] = useState(false);
  const [customBounds, setCustomBounds] = useState({
    minLon: '',
    minLat: '',
    maxLon: '',
    maxLat: ''
  });
  const [activeResults, setActiveResults] = useState<any>(null);
  const [visualizationData, setVisualizationData] = useState<any>(null);

  const startRegionalAnalysis = async (regionName: string) => {
    try {
      const response = await fetch('/api/region-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'start_analysis',
          regionName,
          bounds: getRegionBounds(regionName),
          options: { analysisType }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Start polling for analysis status
        pollAnalysisStatus(result.analysisId);
        setSelectedRegion(regionName);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Regional analysis start error:', error);
      alert('Failed to start regional analysis: ' + error.message);
    }
  };

  const startCustomRegionAnalysis = async () => {
    if (!customBounds.minLon || !customBounds.minLat || !customBounds.maxLon || !customBounds.maxLat) {
      alert('Please fill in all coordinate fields');
      return;
    }

    try {
      const bounds = [
        parseFloat(customBounds.minLon),
        parseFloat(customBounds.minLat),
        parseFloat(customBounds.maxLon),
        parseFloat(customBounds.maxLat)
      ];

      const response = await fetch('/api/region-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'start_analysis',
          regionName: 'custom_region',
          bounds,
          options: { analysisType }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        pollAnalysisStatus(result.analysisId);
        setShowCustomRegion(false);
        setSelectedRegion('custom_region');
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Custom region analysis error:', error);
      alert('Failed to start custom region analysis: ' + error.message);
    }
  };

  const startSelectedRegionAnalysis = () => {
    if (selectedRegion) {
      startRegionalAnalysis(selectedRegion);
    }
  };

  const getRegionBounds = (regionName: string): [number, number, number, number] => {
    const bounds: Record<string, [number, number, number, number]> = {
      carlin_trend: [-116.5, 40.5, -115.5, 41.0],
      witwatersrand: [26.0, -27.0, 28.5, -25.5],
      chile_porphyry: [-71.0, -33.0, -69.0, -31.0]
    };
    return bounds[regionName] || [0, 0, 1, 1];
  };

  const pollAnalysisStatus = async (analysisId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/region-analysis?analysisId=${analysisId}`);
        const result = await response.json();
        
        if (result.success && result.analysis) {
          const analysis = result.analysis;
          
          setRegionalAnalyses(prev => {
            const existing = prev.find(a => a.id === analysisId);
            if (existing) {
              return prev.map(a => a.id === analysisId ? { ...a, ...analysis } : a);
            } else {
              return [...prev, analysis];
            }
          });

          // Continue polling if analysis is not completed
          if (analysis.status !== 'completed' && analysis.status !== 'error') {
            setTimeout(poll, 3000);
          } else if (analysis.status === 'completed' && analysis.results) {
            // Auto-load results when analysis completes
            setActiveResults(analysis.results);
            loadVisualizationData(analysis.results.modelResults?.modelId);
          }
        }
      } catch (error) {
        console.error('Analysis polling error:', error);
      }
    };

    poll();
  };

  const startTraining = async () => {
    try {
      const response = await fetch('/api/training', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: [], // Empty files array for demo
          depositType: selectedTarget,
          profile: selectedProfile,
          options: {}
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Start polling for job status
        pollJobStatus(result.jobId);
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Training start error:', error);
      alert('Failed to start training: ' + error.message);
    }
  };

  const loadVisualizationData = async (modelId: string) => {
    if (!modelId) return;
    
    try {
      const response = await fetch(`/api/results?type=visualization&modelId=${modelId}`);
      const result = await response.json();
      
      if (result.success) {
        setVisualizationData(result.visualization);
      }
    } catch (error) {
      console.error('Failed to load visualization data:', error);
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/training?jobId=${jobId}`);
        const result = await response.json();
        
        if (result.success && result.job) {
          const job = result.job;
          
          setTrainingJobs(prev => {
            const existing = prev.find(j => j.id === jobId);
            if (existing) {
              return prev.map(j => j.id === jobId ? { ...j, ...job } : j);
            } else {
              return [...prev, job];
            }
          });

          // Continue polling if job is not completed
          if (job.status !== 'completed' && job.status !== 'error') {
            setTimeout(poll, 2000);
          } else if (job.status === 'completed' && job.results) {
            // Auto-load results when training completes
            setActiveResults(job.results);
            loadVisualizationData(job.results.modelId);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    poll();
  };

  const getStatusColor = (status: TrainingJob['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'training': return 'bg-blue-500';
      case 'preprocessing': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: TrainingJob['status']) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'training': return 'Training';
      case 'preprocessing': return 'Preprocessing';
      case 'error': return 'Error';
      default: return 'Idle';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Aurora OSI Training Agent</h1>
              <p className="text-slate-600">Automated Geological Data Processing & Model Training</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="regions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="regions" className="flex items-center gap-2">
              <Map className="w-4 h-4" />
              Regions
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Data Upload
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Results
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuration
            </TabsTrigger>
          </TabsList>

          {/* Regions Tab */}
          <TabsContent value="regions" className="space-y-6">
          {/* Explanation Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Map className="w-5 h-5" />
                Regional Analysis vs Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">🗺️ Regional Analysis</h4>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Automated analysis of pre-configured mineral districts</li>
                    <li>• Includes real satellite data acquisition</li>
                    <li>• Generates drill targets automatically</li>
                    <li>• Shows results immediately in Results tab</li>
                    <li>• Best for: Quick exploration of known mineral districts</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-700 mb-2">🤖 Training</h4>
                  <ul className="text-sm text-blue-600 space-y-1">
                    <li>• Train custom models with your data</li>
                    <li>• Upload and process your geological datasets</li>
                    <li>• Create specialized models for your projects</li>
                    <li>• Full control over model parameters</li>
                    <li>• Best for: Custom projects with proprietary data</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Region Gallery */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Regional Analysis Gallery
                  </CardTitle>
                  <CardDescription>
                    One-click analysis for world-class mineral districts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => startRegionalAnalysis('carlin_trend')}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Carlin Trend, Nevada</h4>
                        <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        World-class Carlin-type gold deposits
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>3 known deposits</span>
                        <span>•</span>
                        <span>1°×0.5° area</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => startRegionalAnalysis('witwatersrand')}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Witwatersrand Basin</h4>
                        <Badge className="bg-green-100 text-green-800">Paleoplacer</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Ancient placer gold deposits in South Africa
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>2 known deposits</span>
                        <span>•</span>
                        <span>2.5°×1.5° area</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => startRegionalAnalysis('chile_porphyry')}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Chilean Porphyry Belt</h4>
                        <Badge className="bg-blue-100 text-blue-800">Porphyry</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Major porphyry copper-molybdenum deposits
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>2 known deposits</span>
                        <span>•</span>
                        <span>2°×2° area</span>
                      </div>
                    </div>
                    
                    <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setShowCustomRegion(true)}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Custom Region</h4>
                        <Badge variant="outline">New</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Define your own area of interest
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Globe className="w-4 h-4 mr-1" />
                        <span>Any location</span>
                        <span>•</span>
                        <span>Custom bounds</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Start Panel */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Start Analysis</CardTitle>
                    <CardDescription>
                      One-click regional exploration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Select Region</label>
                      <select 
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Choose a region...</option>
                        <option value="carlin_trend">Carlin Trend, Nevada</option>
                        <option value="witwatersrand">Witwatersrand Basin</option>
                        <option value="chile_porphyry">Chilean Porphyry Belt</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Analysis Type</label>
                      <select 
                        value={analysisType}
                        onChange={(e) => setAnalysisType(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="quick">Quick Analysis (2-3 hours)</option>
                        <option value="standard">Standard Analysis (6-8 hours)</option>
                        <option value="comprehensive">Comprehensive (12-24 hours)</option>
                      </select>
                    </div>
                    <Button 
                      onClick={startSelectedRegionAnalysis}
                      disabled={!selectedRegion}
                      className="w-full"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Regional Analysis
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Analyses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {regionalAnalyses.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No analyses running</p>
                      ) : (
                        regionalAnalyses.map((analysis) => (
                          <div key={analysis.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{analysis.regionName}</span>
                              <Badge variant={analysis.status === 'completed' ? 'default' : 'secondary'}>
                                {analysis.status}
                              </Badge>
                            </div>
                            <Progress value={analysis.progress} className="h-2 mb-1" />
                            <p className="text-xs text-gray-500">{analysis.currentStep}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Custom Region Modal */}
          {showCustomRegion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <CardHeader>
                  <CardTitle>Define Custom Region</CardTitle>
                  <CardDescription>
                    Enter the coordinates for your area of interest
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Min Longitude</label>
                      <input 
                        type="number"
                        value={customBounds.minLon}
                        onChange={(e) => setCustomBounds(prev => ({ ...prev, minLon: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        placeholder="-116.5"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Min Latitude</label>
                      <input 
                        type="number"
                        value={customBounds.minLat}
                        onChange={(e) => setCustomBounds(prev => ({ ...prev, minLat: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        placeholder="40.5"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Max Longitude</label>
                      <input 
                        type="number"
                        value={customBounds.maxLon}
                        onChange={(e) => setCustomBounds(prev => ({ ...prev, maxLon: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        placeholder="-115.5"
                        step="0.001"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Max Latitude</label>
                      <input 
                        type="number"
                        value={customBounds.maxLat}
                        onChange={(e) => setCustomBounds(prev => ({ ...prev, maxLat: e.target.value }))}
                        className="w-full p-2 border rounded-md"
                        placeholder="41.0"
                        step="0.001"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={startCustomRegionAnalysis}
                      disabled={!customBounds.minLon || !customBounds.minLat || !customBounds.maxLon || !customBounds.maxLat}
                      className="flex-1"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Analysis
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowCustomRegion(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </div>
            </div>
          )}

          {/* Data Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Ingestion
                </CardTitle>
                <CardDescription>
                  Upload geological data in any format. Auto-detection enabled.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed rounded-lg p-8 text-center border-gray-300">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-2">
                    Drag & drop geological data files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports: GeoTIFF, CSV, Shapefile, LAS, NetCDF, SEG-Y
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Training Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Training Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Training Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Target Deposit Type</label>
                    <select 
                      value={selectedTarget}
                      onChange={(e) => setSelectedTarget(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="gold">Gold</option>
                      <option value="copper">Copper</option>
                      <option value="porphyry">Porphyry</option>
                      <option value="epithermal">Epithermal</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Training Profile</label>
                    <select 
                      value={selectedProfile}
                      onChange={(e) => setSelectedProfile(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="quick_test">Quick Test (1-2 hours)</option>
                      <option value="standard">Standard (6-12 hours)</option>
                      <option value="production">Production (24-48 hours)</option>
                    </select>
                  </div>
                  <Button 
                    onClick={startTraining}
                    className="w-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Training
                  </Button>
                </CardContent>
              </Card>

              {/* Training Jobs */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Training Jobs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trainingJobs.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No training jobs started</p>
                    ) : (
                      trainingJobs.map((job) => (
                        <div key={job.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`} />
                              <div>
                                <p className="font-medium">{job.depositType?.toUpperCase() || 'UNKNOWN'} Training</p>
                                <p className="text-sm text-gray-500">{job.profile} profile</p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {getStatusText(job.status)}
                            </Badge>
                          </div>
                          <Progress value={job.progress} className="h-2 mb-2" />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">{Math.round(job.progress)}% complete</p>
                            {job.currentStep && (
                              <p className="text-xs text-blue-600">{job.currentStep}</p>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {activeResults ? (
              <>
                {/* Results Header */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Analysis Results
                    </CardTitle>
                    <CardDescription>
                      {activeResults.regionInfo?.name || 'Training Results'} - {activeResults.drillTargets?.length || 0} targets identified
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {activeResults.drillTargets?.length || 0}
                        </div>
                        <div className="text-sm text-blue-600">Drill Targets</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {(activeResults.modelResults?.performance?.auc || 0).toFixed(3)}
                        </div>
                        <div className="text-sm text-green-600">Model AUC</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {activeResults.drillTargets?.filter((t: any) => t.priority === 'high')?.length || 0}
                        </div>
                        <div className="text-sm text-purple-600">High Priority</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {((activeResults.drillTargets?.filter((t: any) => t.priority === 'high')?.length || 0) / (activeResults.drillTargets?.length || 1) * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-orange-600">Confidence</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Interactive 3D Visualization */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Map className="w-5 h-5" />
                        3D Prospectivity Model
                      </CardTitle>
                      <CardDescription>
                        Interactive geological prospectivity visualization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-700 rounded-lg relative overflow-hidden">
                        {/* Simulated 3D Visualization */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white">
                            <div className="mb-4">
                              <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full animate-pulse"></div>
                            </div>
                            <h4 className="text-lg font-semibold mb-2">3D Geological Model</h4>
                            <p className="text-sm opacity-75 mb-4">
                              {visualizationData ? 'Model loaded successfully' : 'Loading visualization...'}
                            </p>
                            <div className="flex justify-center gap-2">
                              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                                Rotate
                              </button>
                              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                                Zoom
                              </button>
                              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors">
                                Layers
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Overlay controls */}
                        <div className="absolute top-4 right-4 space-y-2">
                          <div className="bg-white/10 backdrop-blur-sm rounded p-2 text-white text-xs">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                              <span>High Prospectivity</span>
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                              <span>Medium Prospectivity</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                              <span>Low Prospectivity</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Layer Controls */}
                      <div className="mt-4 space-y-2">
                        <h5 className="font-medium text-sm">Layer Controls</h5>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span>Prospectivity Map</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span>Drill Targets</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="rounded" />
                            <span>Geological Boundaries</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" className="rounded" />
                            <span>Structural Features</span>
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Drill Targets */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Priority Drill Targets
                      </CardTitle>
                      <CardDescription>
                        AI-generated drilling recommendations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {activeResults.drillTargets?.map((target: any, index: number) => (
                          <div key={target.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold">{target.name}</h5>
                              <Badge className={
                                target.priority === 'high' ? 'bg-red-100 text-red-800' :
                                target.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {target.priority.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                              <div>Confidence: {(target.confidence * 100).toFixed(1)}%</div>
                              <div>Depth: {target.depth?.min}-{target.depth?.max}m</div>
                              <div>Grade: {target.estimatedGrade?.min?.toFixed(1)}-{target.estimatedGrade?.max?.toFixed(1)} g/t</div>
                              <div>Lat: {target.coordinates?.lat?.toFixed(3)}°</div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {target.recommendation}
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8 text-gray-500">
                            No drill targets available
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Model Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {(activeResults.modelResults?.performance?.auc || 0).toFixed(3)}
                        </div>
                        <div className="text-sm text-gray-600">AUC Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {((activeResults.modelResults?.performance?.accuracy || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Accuracy</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {((activeResults.modelResults?.performance?.precision || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Precision</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {((activeResults.modelResults?.performance?.recall || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-600">Recall</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="w-5 h-5" />
                      Prospectivity Maps
                    </CardTitle>
                    <CardDescription>
                      Interactive 3D prospectivity visualization
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Map className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-500">Complete regional analysis or training to generate maps</p>
                        <p className="text-xs text-gray-400 mt-2">Start with the Regions tab for automated analysis</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Drill Targets
                    </CardTitle>
                    <CardDescription>
                      AI-generated drill target recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500">Complete regional analysis or training to view targets</p>
                      <p className="text-xs text-gray-400 mt-2">Regional analysis automatically identifies targets</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Deposit Type Templates
                  </CardTitle>
                  <CardDescription>
                    Pre-configured models for different deposit types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Orogenic Gold</h4>
                        <Badge variant="outline">Structure-focused</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Deep crustal fault systems and shear zones
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Key Features:</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Structure</Badge>
                          <Badge variant="secondary" className="text-xs">Alteration</Badge>
                          <Badge variant="secondary" className="text-xs">Geochemistry</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 mt-3">
                        <p className="text-xs font-medium text-gray-700">Preferred Data:</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">Magnetics</Badge>
                          <Badge variant="outline" className="text-xs">Gravity</Badge>
                          <Badge variant="outline" className="text-xs">Hyperspectral</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Porphyry Copper</h4>
                        <Badge variant="outline">Alteration-focused</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        Large-scale intrusion-related systems
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Key Features:</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">Alteration Zoning</Badge>
                          <Badge variant="secondary" className="text-xs">Magnetic Lows</Badge>
                          <Badge variant="secondary" className="text-xs">Geochemical Halos</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 mt-3">
                        <p className="text-xs font-medium text-gray-700">Preferred Data:</p>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">Hyperspectral</Badge>
                          <Badge variant="outline" className="text-xs">Geochemistry</Badge>
                          <Badge variant="outline" className="text-xs">Magnetics</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Training Profiles</CardTitle>
                    <CardDescription>
                      Pre-configured training strategies
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Quick Test</span>
                          <Badge className="bg-green-100 text-green-800">1-2 hours</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Rapid validation with minimal data</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Standard</span>
                          <Badge className="bg-blue-100 text-blue-800">6-12 hours</Badge>
                        </div>
                        <p className="text-sm text-gray-600">Balanced approach for production</p>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Production</span>
                          <Badge className="bg-purple-100 text-purple-800">24-48 hours</Badge>
                        </div>
                        <p className="text-sm text-gray-600">High-confidence comprehensive model</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quality Gates</CardTitle>
                    <CardDescription>
                      Automated quality control thresholds
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Data Coverage</span>
                        <Badge>≥ 95%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Missing Data</span>
                        <Badge>≤ 5%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Model AUC</span>
                        <Badge>≥ 0.75</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overfitting</span>
                        <Badge>≤ 15%</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Geological Score</span>
                        <Badge>≥ 0.8</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}