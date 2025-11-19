'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Map, Layers, Eye, EyeOff, Download, Share2 } from 'lucide-react';

interface DrillTarget {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  confidence: number;
  depth: { min: number; max: number };
  coordinates: { x: number; y: number };
  estimatedGrade: { min: number; max: number };
}

interface VisualizationProps {
  modelId?: string;
  targets?: DrillTarget[];
  onTargetSelect?: (target: DrillTarget) => void;
}

export default function InteractiveVisualization({ 
  modelId, 
  targets = [], 
  onTargetSelect 
}: VisualizationProps) {
  const [selectedLayer, setSelectedLayer] = useState('prospectivity');
  const [opacity, setOpacity] = useState([70]);
  const [showTargets, setShowTargets] = useState(true);
  const [selectedTarget, setSelectedTarget] = useState<DrillTarget | null>(null);

  const layers = [
    { id: 'prospectivity', name: 'Prospectivity Map', color: 'blue' },
    { id: 'uncertainty', name: 'Uncertainty Map', color: 'red' },
    { id: 'geology', name: 'Geological Map', color: 'green' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleTargetClick = (target: DrillTarget) => {
    setSelectedTarget(target);
    onTargetSelect?.(target);
  };

  return (
    <div className="space-y-6">
      {/* Map Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="w-5 h-5" />
            Interactive Prospectivity Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Map Area */}
            <div className="lg:col-span-3">
              <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border-2 border-gray-200 overflow-hidden">
                {/* Simulated Map Layers */}
                <div 
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{ opacity: opacity[0] / 100 }}
                >
                  {/* Prospectivity Layer Visualization */}
                  {selectedLayer === 'prospectivity' && (
                    <div className="absolute inset-0">
                      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-400 rounded-full opacity-60 blur-xl" />
                      <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-blue-500 rounded-full opacity-50 blur-xl" />
                      <div className="absolute bottom-1/3 right-1/4 w-36 h-36 bg-blue-600 rounded-full opacity-40 blur-xl" />
                    </div>
                  )}
                  
                  {/* Uncertainty Layer Visualization */}
                  {selectedLayer === 'uncertainty' && (
                    <div className="absolute inset-0">
                      <div className="absolute top-1/3 left-1/2 w-28 h-28 bg-red-400 rounded-full opacity-60 blur-xl" />
                      <div className="absolute bottom-1/4 left-1/3 w-36 h-36 bg-red-500 rounded-full opacity-50 blur-xl" />
                    </div>
                  )}
                  
                  {/* Geological Layer Visualization */}
                  {selectedLayer === 'geology' && (
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-full h-1/3 bg-green-300 opacity-30" />
                      <div className="absolute top-1/3 left-0 w-full h-1/3 bg-yellow-300 opacity-30" />
                      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-orange-300 opacity-30" />
                    </div>
                  )}
                </div>

                {/* Drill Targets */}
                {showTargets && targets.map((target, index) => (
                  <div
                    key={target.id}
                    className={`absolute w-4 h-4 rounded-full border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform ${getPriorityColor(target.priority)}`}
                    style={{
                      left: `${25 + (index * 15)}%`,
                      top: `${30 + (index * 10)}%`
                    }}
                    onClick={() => handleTargetClick(target)}
                    title={target.name}
                  />
                ))}

                {/* Map Controls Overlay */}
                <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2">
                  <Button variant="ghost" size="sm">
                    <Layers className="w-4 h-4" />
                  </Button>
                </div>

                {/* Scale Bar */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1 bg-black" />
                    <span className="text-xs">1 km</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls Panel */}
            <div className="space-y-4">
              {/* Layer Selection */}
              <div>
                <h4 className="font-medium mb-2">Layers</h4>
                <div className="space-y-2">
                  {layers.map((layer) => (
                    <Button
                      key={layer.id}
                      variant={selectedLayer === layer.id ? "default" : "outline"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedLayer(layer.id)}
                    >
                      <div className={`w-3 h-3 rounded-full bg-${layer.color}-500 mr-2`} />
                      {layer.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Opacity Control */}
              <div>
                <h4 className="font-medium mb-2">Opacity</h4>
                <Slider
                  value={opacity}
                  onValueChange={setOpacity}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-500 mt-1">
                  {opacity[0]}%
                </div>
              </div>

              {/* Target Toggle */}
              <div>
                <h4 className="font-medium mb-2">Targets</h4>
                <Button
                  variant={showTargets ? "default" : "outline"}
                  size="sm"
                  className="w-full"
                  onClick={() => setShowTargets(!showTargets)}
                >
                  {showTargets ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                  {showTargets ? 'Hide' : 'Show'} Targets
                </Button>
              </div>

              {/* Export Options */}
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export Map
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Target Details */}
      {selectedTarget && (
        <Card>
          <CardHeader>
            <CardTitle>Target Details: {selectedTarget.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Priority</p>
                <Badge className={getPriorityBadgeColor(selectedTarget.priority)}>
                  {selectedTarget.priority.charAt(0).toUpperCase() + selectedTarget.priority.slice(1)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Confidence</p>
                <p className="font-semibold">{(selectedTarget.confidence * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Depth Range</p>
                <p className="font-semibold">{selectedTarget.depth.min}-{selectedTarget.depth.max}m</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Grade</p>
                <p className="font-semibold">{selectedTarget.estimatedGrade.min}-{selectedTarget.estimatedGrade.max} g/t</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Target List */}
      <Card>
        <CardHeader>
          <CardTitle>Drill Targets ({targets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {targets.map((target) => (
              <div
                key={target.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                  selectedTarget?.id === target.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleTargetClick(target)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{target.name}</p>
                    <p className="text-sm text-gray-600">
                      Confidence: {(target.confidence * 100).toFixed(1)}% • Depth: {target.depth.min}-{target.depth.max}m
                    </p>
                  </div>
                  <Badge className={getPriorityBadgeColor(target.priority)}>
                    {target.priority.charAt(0).toUpperCase() + target.priority.slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}