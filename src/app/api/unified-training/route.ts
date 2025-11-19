import { NextRequest, NextResponse } from 'next/server';

// Domain-specific configurations
const DOMAIN_CONFIGS = {
  mineral: {
    name: 'Mineral Exploration',
    targets: ['gold', 'copper', 'lithium', 'silver', 'base_metals'],
    focus: ['alteration_minerals', 'structural_traps', 'geochemical_halos'],
    output: ['prospectivity_maps', 'drill_targets'],
    dataTypes: ['geochemistry', 'geophysics', 'structural', 'remote_sensing']
  },
  hydrocarbon: {
    name: 'Hydrocarbon Exploration',
    targets: ['oil', 'gas', 'condensate', 'unconventional'],
    focus: ['petroleum_systems', 'reservoir_quality', 'seal_integrity'],
    output: ['prospect_maps', 'reserve_estimates', 'risk_assessments'],
    dataTypes: ['well_data', 'seismic', 'source_rock', 'reservoir', 'migration']
  },
  unified: {
    name: 'Unified Resource Assessment',
    targets: ['multi_commodity'],
    focus: ['overall_resource_potential', 'integrated_analysis'],
    output: ['integrated_potential_maps', 'resource_rankings'],
    dataTypes: ['all']
  }
};

// Training profiles for different domains
const TRAINING_PROFILES = {
  mineral: {
    quick_screening: {
      name: 'Quick Mineral Screening',
      duration: '2-4 hours',
      epochs: 20,
      batchSize: 64,
      architecture: 'cnn_ensemble'
    },
    detailed_assessment: {
      name: 'Detailed Mineral Assessment',
      duration: '1-2 days',
      epochs: 50,
      batchSize: 128,
      architecture: 'transformer_ensemble'
    },
    comprehensive_evaluation: {
      name: 'Comprehensive Mineral Evaluation',
      duration: '3-5 days',
      epochs: 100,
      batchSize: 256,
      architecture: 'multi_scale_attention'
    }
  },
  hydrocarbon: {
    frontier_basin_screening: {
      name: 'Frontier Basin Screening',
      duration: '6-12 hours',
      epochs: 30,
      batchSize: 32,
      architecture: 'petroleum_system_transformer'
    },
    mature_basin_infill: {
      name: 'Mature Basin Infill',
      duration: '1-2 days',
      epochs: 60,
      batchSize: 64,
      architecture: 'reservoir_property_predictor'
    },
    unconventional_sweet_spot: {
      name: 'Unconventional Sweet Spot',
      duration: '2-3 days',
      epochs: 80,
      batchSize: 128,
      architecture: 'bayesian_neural_network'
    }
  },
  unified: {
    rapid_screening: {
      name: 'Rapid Multi-Commodity Screening',
      duration: '4-8 hours',
      epochs: 25,
      batchSize: 64,
      architecture: 'multi_task_transformer'
    },
    integrated_assessment: {
      name: 'Integrated Resource Assessment',
      duration: '2-4 days',
      epochs: 75,
      batchSize: 128,
      architecture: 'cross_domain_attention'
    }
  }
};

// Hydrocarbon-specific sample datasets
const HYDROCARBON_DATASETS = [
  {
    id: 'permian_basin',
    name: 'Permian Basin Unconventional',
    description: 'Complete unconventional oil and gas dataset from West Texas',
    region: 'West Texas, USA',
    domain: 'hydrocarbon',
    basinType: 'mature_basin',
    playType: 'unconventional',
    size: '680 MB',
    format: 'LAS + CSV + Seismic',
    files: [
      {
        name: 'well_logs.las',
        type: 'well_data',
        size: '180 MB',
        description: 'Gamma ray, resistivity, porosity logs from 245 wells'
      },
      {
        name: 'production_history.csv',
        type: 'production',
        size: '45 MB',
        description: 'Monthly production data for 180 producing wells'
      },
      {
        name: 'seismic_attributes.tif',
        type: 'seismic',
        size: '320 MB',
        description: 'Seismic attribute volumes and structural interpretation'
      },
      {
        name: 'reservoir_properties.csv',
        type: 'reservoir',
        size: '67 MB',
        description: 'Core analysis and reservoir property measurements'
      },
      {
        name: 'sweet_spot_locations.csv',
        type: 'labels',
        size: '8 MB',
        description: 'Known sweet spot locations and production characteristics'
      }
    ],
    metadata: {
      coordinateSystem: 'NAD83 UTM Zone 14N',
      resolution: 'Variable',
      coverage: '2.5° × 2.0°',
      acquisitionYear: '2020-2024',
      dataQuality: 'Excellent',
      wellCount: 245,
      producingWells: 180
    },
    preview: {
      totalWells: 245,
      producingWells: 180,
      averageIP: '850 BOEPD',
      averageEUR: '450 MBOE',
      sweetSpots: 23
    }
  },
  {
    id: 'gulf_of_mexico_deepwater',
    name: 'Gulf of Mexico Deepwater',
    description: 'Deepwater Gulf of Mexico exploration dataset with 3D seismic',
    region: 'Gulf of Mexico',
    domain: 'hydrocarbon',
    basinType: 'frontier_basin',
    playType: 'structural',
    size: '1.2 GB',
    format: 'SEGY + CSV + Shapefile',
    files: [
      {
        name: '3d_seismic_volume.segy',
        type: 'seismic',
        size: '850 MB',
        description: '3D seismic volume with full migration'
      },
      {
        name: 'well_control.csv',
        type: 'well_data',
        size: '120 MB',
        description: 'Well control data and formation tops'
      },
      {
        name: 'prospect_inventory.csv',
        type: 'prospects',
        size: '45 MB',
        description: 'Identified prospects with risk assessment'
      },
      {
        name: 'salt_tectonics.shp',
        type: 'structure',
        size: '89 MB',
        description: 'Salt body geometry and related structures'
      },
      {
        name: 'discoveries.csv',
        type: 'labels',
        size: '12 MB',
        description: 'Historical discoveries and reserve data'
      }
    ],
    metadata: {
      coordinateSystem: 'WGS84 UTM Zone 15N',
      resolution: '25m',
      coverage: '3.0° × 2.5°',
      acquisitionYear: '2018-2023',
      dataQuality: 'Very High',
      waterDepth: '1500-3000m',
      wellCount: 67
    },
    preview: {
      totalWells: 67,
      discoveries: 12,
      averageReserveSize: '85 MMBOE',
      successRate: '18%',
      prospects: 45
    }
  },
  {
    id: 'williston_basin_bakken',
    name: 'Williston Basin Bakken Play',
    description: 'Bakken Formation unconventional oil dataset with horizontal wells',
    region: 'North Dakota/Montana, USA',
    domain: 'hydrocarbon',
    basinType: 'mature_basin',
    playType: 'unconventional',
    size: '890 MB',
    format: 'LAS + CSV + GeoTIFF',
    files: [
      {
        name: 'horizontal_well_las.las',
        type: 'well_data',
        size: '340 MB',
        description: 'Horizontal well logs and completion data'
      },
      {
        name: 'fracture_stages.csv',
        type: 'completion',
        size: '78 MB',
        description: 'Hydraulic fracturing stage data and results'
      },
      {
        name: 'bakken_properties.tif',
        type: 'reservoir',
        size: '267 MB',
        description: 'Bakken formation property maps'
      },
      {
        name: 'production_analysis.csv',
        type: 'production',
        size: '125 MB',
        description: 'Detailed production analysis and decline curves'
      },
      {
        name: 'core_analysis.csv',
        type: 'reservoir',
        size: '80 MB',
        description: 'Core analysis and petrophysical properties'
      }
    ],
    metadata: {
      coordinateSystem: 'NAD83 UTM Zone 13N',
      resolution: '30m',
      coverage: '2.0° × 1.8°',
      acquisitionYear: '2019-2024',
      dataQuality: 'High',
      horizontalWells: 189,
      totalLength: '2.1M ft'
    },
    preview: {
      totalWells: 189,
      averageIP: '1250 BOEPD',
      averageEUR: '650 MBOE',
      sweetSpots: 34,
      avgLateralLength: '11,200 ft'
    }
  }
];

// Training job storage
const trainingJobs = new Map();

// Auto-detection algorithm
function detectDomainFromData(dataFiles: any[], regionContext?: string): string {
  // Analyze file types and patterns
  const hasWellData = dataFiles.some(f => f.type === 'well_data' || f.name.includes('.las'));
  const hasSeismic = dataFiles.some(f => f.type === 'seismic' || f.name.includes('.segy'));
  const hasProduction = dataFiles.some(f => f.type === 'production' || f.name.includes('production'));
  const hasGeochemistry = dataFiles.some(f => f.type === 'geochemistry');
  
  // Regional context analysis
  const sedimentaryBasinKeywords = ['basin', 'gulf', 'shelf', 'platform', 'foreland'];
  const mineralDistrictKeywords = ['trend', 'belt', 'district', 'camp', 'field'];
  
  let domainScore = { mineral: 0, hydrocarbon: 0, unified: 0 };
  
  // File type scoring
  if (hasWellData) domainScore.hydrocarbon += 3;
  if (hasSeismic) domainScore.hydrocarbon += 2;
  if (hasProduction) domainScore.hydrocarbon += 2;
  if (hasGeochemistry) domainScore.mineral += 2;
  
  // Regional context scoring
  if (regionContext) {
    const context = regionContext.toLowerCase();
    sedimentaryBasinKeywords.forEach(keyword => {
      if (context.includes(keyword)) domainScore.hydrocarbon += 2;
    });
    mineralDistrictKeywords.forEach(keyword => {
      if (context.includes(keyword)) domainScore.mineral += 2;
    });
  }
  
  // Determine domain
  const maxScore = Math.max(domainScore.mineral, domainScore.hydrocarbon);
  if (maxScore === 0) return 'unified';
  
  if (Math.abs(domainScore.mineral - domainScore.hydrocarbon) <= 1) {
    return 'unified';
  }
  
  return domainScore.mineral > domainScore.hydrocarbon ? 'mineral' : 'hydrocarbon';
}

// Simulate domain-specific training
async function simulateDomainTraining(jobId: string, domain: string, profile: string, target: string) {
  const job = trainingJobs.get(jobId);
  if (!job) return;

  const domainConfig = DOMAIN_CONFIGS[domain as keyof typeof DOMAIN_CONFIGS];
  const profileConfig = TRAINING_PROFILES[domain as keyof typeof TRAINING_PROFILES]?.[profile];

  // Domain-specific training steps
  const steps = domain === 'hydrocarbon' ? [
    { name: 'Loading well data and logs', duration: 2000, progress: 10 },
    { name: 'Processing seismic attributes', duration: 3000, progress: 20 },
    { name: 'Analyzing petroleum systems', duration: 4000, progress: 35 },
    { name: 'Evaluating reservoir properties', duration: 3000, progress: 50 },
    { name: 'Assessing trap and seal integrity', duration: 3000, progress: 65 },
    { name: 'Modeling migration pathways', duration: 2000, progress: 75 },
    { name: 'Training petroleum system network', duration: 5000, progress: 90 },
    { name: 'Generating reserve estimates', duration: 2000, progress: 100 }
  ] : domain === 'mineral' ? [
    { name: 'Processing geochemical data', duration: 2000, progress: 10 },
    { name: 'Analyzing geophysical signatures', duration: 3000, progress: 25 },
    { name: 'Mapping structural features', duration: 3000, progress: 40 },
    { name: 'Extracting alteration minerals', duration: 2000, progress: 55 },
    { name: 'Training mineral prospectivity model', duration: 4000, progress: 75 },
    { name: 'Generating drill targets', duration: 2000, progress: 90 },
    { name: 'Validating geological consistency', duration: 1000, progress: 100 }
  ] : [
    { name: 'Multi-domain data integration', duration: 3000, progress: 15 },
    { name: 'Cross-commodity analysis', duration: 4000, progress: 30 },
    { name: 'Resource potential assessment', duration: 5000, progress: 50 },
    { name: 'Unified model training', duration: 6000, progress: 80 },
    { name: 'Integrated resource ranking', duration: 2000, progress: 100 }
  ];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    
    job.status = i === steps.length - 1 ? 'completed' : 'training';
    job.currentStep = step.name;
    job.progress = step.progress;
    
    await new Promise(resolve => setTimeout(resolve, step.duration));
  }

  // Generate domain-specific results
  const results = domain === 'hydrocarbon' ? {
    modelId: `hydrocarbon_model_${Date.now()}`,
    domain,
    architecture: profileConfig?.architecture || 'petroleum_system_transformer',
    performance: {
      prospectAccuracy: 0.78 + Math.random() * 0.15,
      reserveEstimateError: 0.25 + Math.random() * 0.15,
      dryHolePrediction: 0.65 + Math.random() * 0.20,
      geologicalPlausibility: 0.85 + Math.random() * 0.10
    },
    prospects: generateHydrocarbonProspects(),
    reserveEstimates: generateReserveEstimates(),
    riskAssessment: generateRiskAssessment(),
    trainingTime: Date.now() - job.startTime,
    profile,
    target
  } : domain === 'mineral' ? {
    modelId: `mineral_model_${Date.now()}`,
    domain,
    architecture: profileConfig?.architecture || 'cnn_ensemble',
    performance: {
      depositAccuracy: 0.82 + Math.random() * 0.13,
      targetRankingCorrelation: 0.75 + Math.random() * 0.20,
      geologicalConsistency: 0.88 + Math.random() * 0.10
    },
    drillTargets: generateMineralTargets(),
    prospectivityMaps: generateProspectivityMaps(),
    trainingTime: Date.now() - job.startTime,
    profile,
    target
  } : {
    modelId: `unified_model_${Date.now()}`,
    domain,
    architecture: profileConfig?.architecture || 'multi_task_transformer',
    performance: {
      resourcePotentialAccuracy: 0.75 + Math.random() * 0.20,
      domainClassificationAccuracy: 0.88 + Math.random() * 0.10,
      crossDomainInsights: Math.random() > 0.5
    },
    resourceRankings: generateResourceRankings(),
    integratedPotentialMaps: generateIntegratedMaps(),
    trainingTime: Date.now() - job.startTime,
    profile,
    target
  };

  job.results = results;
  job.status = 'completed';
  job.completedAt = new Date().toISOString();
}

function generateHydrocarbonProspects() {
  const prospects = [];
  const prospectCount = 8 + Math.floor(Math.random() * 7);
  
  for (let i = 0; i < prospectCount; i++) {
    const chanceOfSuccess = 0.15 + Math.random() * 0.40;
    prospects.push({
      id: `PROSPECT_${String(i + 1).padStart(3, '0')}`,
      name: `Prospect ${String.fromCharCode(65 + i)}-${String(i + 1).padStart(3, '0')}`,
      type: ['structural', 'stratigraphic', 'combination', 'unconventional'][Math.floor(Math.random() * 4)],
      chanceOfSuccess,
      estimatedReserves: {
        low: 10 + Math.random() * 40,
        best: 50 + Math.random() * 150,
        high: 100 + Math.random() * 300
      },
      depth: {
        top: 8000 + Math.random() * 4000,
        base: 10000 + Math.random() * 6000
      },
      confidence: 0.6 + Math.random() * 0.35,
      riskFactors: generateRiskFactors()
    });
  }
  
  return prospects.sort((a, b) => b.chanceOfSuccess - a.chanceOfSuccess);
}

function generateReserveEstimates() {
  return {
    totalProspectiveResources: {
      low: 250 + Math.random() * 500,
      best: 500 + Math.random() * 1000,
      high: 1000 + Math.random() * 2000
    },
    riskedResources: {
      p90: 50 + Math.random() * 100,
      p50: 150 + Math.random() * 300,
      p10: 400 + Math.random() * 800
    },
    commodityBreakdown: {
      oil: 0.6 + Math.random() * 0.3,
      gas: 0.2 + Math.random() * 0.3,
      condensate: 0.05 + Math.random() * 0.1
    }
  };
}

function generateRiskAssessment() {
  return {
    geologicalRisk: 0.3 + Math.random() * 0.4,
    reservoirRisk: 0.2 + Math.random() * 0.3,
    sealRisk: 0.15 + Math.random() * 0.25,
    chargeRisk: 0.25 + Math.random() * 0.35,
    overallRisk: 0.35 + Math.random() * 0.30
  };
}

function generateRiskFactors() {
  const allFactors = ['Source rock quality', 'Reservoir presence', 'Seal integrity', 'Trap geometry', 'Timing', 'Preservation'];
  const numFactors = 2 + Math.floor(Math.random() * 3);
  const factors = [];
  
  for (let i = 0; i < numFactors; i++) {
    const factor = allFactors[Math.floor(Math.random() * allFactors.length)];
    if (!factors.includes(factor)) {
      factors.push(factor);
    }
  }
  
  return factors;
}

function generateMineralTargets() {
  const targets = [];
  const targetCount = 5 + Math.floor(Math.random() * 5);
  
  for (let i = 0; i < targetCount; i++) {
    targets.push({
      id: `MINERAL_TARGET_${String(i + 1).padStart(3, '0')}`,
      name: `Target ${String.fromCharCode(65 + i)}-${String(i + 1).padStart(3, '0')}`,
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
      confidence: 0.6 + Math.random() * 0.35,
      depth: {
        min: 100 + Math.random() * 200,
        max: 300 + Math.random() * 300
      },
      estimatedGrade: {
        min: 0.5 + Math.random() * 1.5,
        max: 1.5 + Math.random() * 2.5
      },
      coordinates: {
        lat: -30 + Math.random() * 20,
        lon: -120 + Math.random() * 40
      }
    });
  }
  
  return targets.sort((a, b) => b.confidence - a.confidence);
}

function generateProspectivityMaps() {
  return {
    alterationMap: 'high_prospectivity_alteration.tif',
    structuralMap: 'structural_control_map.tif',
    geochemicalMap: 'geochemical_anomaly_map.tif',
    integratedMap: 'integrated_prospectivity_map.tif'
  };
}

function generateResourceRankings() {
  return [
    { resource: 'Oil', potential: 0.75, confidence: 0.82 },
    { resource: 'Gold', potential: 0.68, confidence: 0.79 },
    { resource: 'Copper', potential: 0.62, confidence: 0.76 },
    { resource: 'Natural Gas', potential: 0.58, confidence: 0.74 },
    { resource: 'Lithium', potential: 0.45, confidence: 0.71 }
  ];
}

function generateIntegratedMaps() {
  return {
    resourcePotentialMap: 'multi_commodity_potential.tif',
    domainClassificationMap: 'mineral_vs_hydrocarbon_domains.tif',
    economicViabilityMap: 'economic_threshold_analysis.tif'
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, domain, files, target, profile, options } = body;
    
    switch (action) {
      case 'auto_detect_domain':
        return await autoDetectDomain(files, options?.regionContext);
      
      case 'start_unified_training':
        return await startUnifiedTraining(domain, files, target, profile, options);
      
      case 'get_domain_config':
        return await getDomainConfig(domain);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Unified training error:', error);
    return NextResponse.json(
      { error: 'Failed to process unified training request' },
      { status: 500 }
    );
  }
}

async function autoDetectDomain(files: any[], regionContext?: string) {
  const detectedDomain = detectDomainFromData(files, regionContext);
  const recommendations = generateDomainRecommendations(detectedDomain, files);
  
  return NextResponse.json({
    success: true,
    detectedDomain,
    confidence: calculateDetectionConfidence(files, detectedDomain),
    recommendations
  });
}

function generateDomainRecommendations(domain: string, files: any[]) {
  const config = DOMAIN_CONFIGS[domain as keyof typeof DOMAIN_CONFIGS];
  
  return {
    recommendedDomain: domain,
    alternativeDomains: domain === 'unified' ? ['mineral', 'hydrocarbon'] : ['unified'],
    suggestedProfiles: Object.keys(TRAINING_PROFILES[domain as keyof typeof TRAINING_PROFILES] || {}),
    dataRequirements: config.dataTypes,
    expectedOutputs: config.output,
    processingTime: domain === 'hydrocarbon' ? '6-48 hours' : '2-24 hours'
  };
}

function calculateDetectionConfidence(files: any[], domain: string): number {
  const fileTypes = files.map(f => f.type);
  const domainConfig = DOMAIN_CONFIGS[domain as keyof typeof DOMAIN_CONFIGS];
  
  const matchingTypes = fileTypes.filter(type => domainConfig.dataTypes.includes(type));
  return Math.min(0.95, (matchingTypes.length / fileTypes.length) + 0.2);
}

async function startUnifiedTraining(domain: string, files: any[], target: string, profile: string, options: any) {
  const generatedJobId = `unified_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const job = {
    id: generatedJobId,
    domain,
    target,
    profile,
    status: 'initializing',
    progress: 0,
    currentStep: 'Initializing unified training...',
    startTime: Date.now(),
    files: files || [],
    options: options || {},
    results: null
  };

  trainingJobs.set(generatedJobId, job);
  simulateDomainTraining(generatedJobId, domain, profile, target);

  return NextResponse.json({
    success: true,
    jobId: generatedJobId,
    domain,
    message: `Started ${domain} training for ${target} using ${profile} profile`
  });
}

async function getDomainConfig(domain: string) {
  const config = DOMAIN_CONFIGS[domain as keyof typeof DOMAIN_CONFIGS];
  const profiles = TRAINING_PROFILES[domain as keyof typeof TRAINING_PROFILES];
  
  return NextResponse.json({
    success: true,
    domain: config,
    profiles,
    sampleDatasets: domain === 'hydrocarbon' ? HYDROCARBON_DATASETS : []
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  
  if (!jobId) {
    // Return all jobs
    const jobs = Array.from(trainingJobs.values());
    return NextResponse.json({
      success: true,
      jobs
    });
  }

  const job = trainingJobs.get(jobId);
  
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    job
  });
}