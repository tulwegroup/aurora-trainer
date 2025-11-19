import { NextRequest, NextResponse } from 'next/server';

// Sample geological datasets
const SAMPLE_DATASETS = [
  {
    id: 'carlin_trend_sample',
    name: 'Carlin Trend Gold District Sample',
    description: 'Complete geological dataset for Carlin Trend, Nevada including geochemistry, geophysics, and structural data',
    region: 'Nevada, USA',
    depositType: 'gold',
    size: '245 MB',
    format: 'CSV + GeoTIFF',
    files: [
      {
        name: 'geochemical_assays.csv',
        type: 'geochemistry',
        size: '45 MB',
        description: 'Gold, silver, and pathfinder element assays from 1,247 samples'
      },
      {
        name: 'magnetic_anomaly.tif',
        type: 'geophysics',
        size: '68 MB',
        description: 'High-resolution airborne magnetic survey data'
      },
      {
        name: 'gravity_geoid.tif',
        type: 'geophysics',
        size: '52 MB',
        description: 'Ground gravity measurements with geoid corrections'
      },
      {
        name: 'structural_lineaments.shp',
        type: 'structure',
        size: '12 MB',
        description: 'Mapped geological structures and fault lines'
      },
      {
        name: 'known_deposits.csv',
        type: 'labels',
        size: '2 MB',
        description: 'Coordinates and characteristics of known gold deposits'
      }
    ],
    metadata: {
      coordinateSystem: 'WGS84 UTM Zone 11N',
      resolution: '30m',
      coverage: '1.5° × 1.0°',
      acquisitionYear: '2023',
      dataQuality: 'High',
      processingLevel: 'Level 2A (Calibrated)'
    },
    preview: {
      totalSamples: 1247,
      positiveCases: 23,
      negativeCases: 1224,
      elementRange: {
        au: { min: 0.001, max: 45.2, unit: 'ppm' },
        ag: { min: 0.01, max: 12.8, unit: 'ppm' },
        cu: { min: 1.2, max: 280, unit: 'ppm' }
      }
    }
  },
  {
    id: 'porphyry_copper_chile',
    name: 'Chilean Porphyry Copper Belt Sample',
    description: 'Comprehensive porphyry copper dataset from northern Chile with multispectral imagery',
    region: 'Antofagasta, Chile',
    depositType: 'copper',
    size: '380 MB',
    format: 'GeoTIFF + CSV',
    files: [
      {
        name: 'aster_mineral_indices.tif',
        type: 'remote_sensing',
        size: '125 MB',
        description: 'ASTER-derived clay, iron oxide, and alteration indices'
      },
      {
        name: 'sentinel2_composite.tif',
        type: 'remote_sensing',
        size: '98 MB',
        description: 'Sentinel-2 multispectral composite imagery'
      },
      {
        name: 'copper_geochemistry.csv',
        type: 'geochemistry',
        size: '67 MB',
        description: 'Copper, molybdenum, and gold assay data from 892 samples'
      },
      {
        name: 'magnetics_radar.tif',
        type: 'geophysics',
        size: '78 MB',
        description: 'Combined magnetic and radar interferometry data'
      },
      {
        name: 'porphyry_targets.csv',
        type: 'labels',
        size: '3 MB',
        description: 'Known porphyry copper occurrences and prospects'
      }
    ],
    metadata: {
      coordinateSystem: 'WGS84 UTM Zone 19S',
      resolution: '15m',
      coverage: '2.0° × 1.5°',
      acquisitionYear: '2024',
      dataQuality: 'Very High',
      processingLevel: 'Level 1B (Atmospheric Correction Applied)'
    },
    preview: {
      totalSamples: 892,
      positiveCases: 18,
      negativeCases: 874,
      elementRange: {
        cu: { min: 5.2, max: 1250, unit: 'ppm' },
        mo: { min: 0.8, max: 89, unit: 'ppm' },
        au: { min: 0.002, max: 2.8, unit: 'ppm' }
      }
    }
  },
  {
    id: 'witwatersrand_basin',
    name: 'Witwatersrand Basin Paleoplacer Sample',
    description: 'Historic gold mining district data with modern geophysical integration',
    region: 'Gauteng, South Africa',
    depositType: 'gold',
    size: '520 MB',
    format: 'Multiple Formats',
    files: [
      {
        name: 'borehole_logs.las',
        type: 'borehole',
        size: '180 MB',
        description: 'Downhole geophysical logs from 342 boreholes'
      },
      {
        name: 'seismic_section.segy',
        type: 'geophysics',
        size: '156 MB',
        description: '2D seismic reflection profiles across basin'
      },
      {
        name: 'reef_correlation.csv',
        type: 'geology',
        size: '45 MB',
        description: 'Stratigraphic correlations and reef thickness data'
      },
      {
        name: 'gold_grades.csv',
        type: 'geochemistry',
        size: '89 MB',
        description: 'Historical gold grade and thickness measurements'
      },
      {
        name: 'mining_titles.shp',
        type: 'administrative',
        size: '12 MB',
        description: 'Mining rights and claim boundaries'
      }
    ],
    metadata: {
      coordinateSystem: 'WGS84 UTM Zone 35S',
      resolution: 'Variable',
      coverage: '2.5° × 1.8°',
      acquisitionYear: '2022-2024',
      dataQuality: 'Excellent',
      processingLevel: 'Level 3 (Interpreted)'
    },
    preview: {
      totalSamples: 2156,
      positiveCases: 47,
      negativeCases: 2109,
      elementRange: {
        au: { min: 0.05, max: 68.9, unit: 'g/t' },
        u: { min: 0.1, max: 245, unit: 'ppm' },
        th: { min: 2.3, max: 189, unit: 'ppm' }
      }
    }
  },
  {
    id: 'volcanogenic_massive_sulphide',
    name: 'VMS Base Metal District Sample',
    description: 'Volcanogenic Massive Sulphide dataset with multi-element geochemistry',
    region: 'Newfoundland, Canada',
    depositType: 'base_metals',
    size: '195 MB',
    format: 'CSV + GeoTIFF',
    files: [
      {
        name: 'multi_element_assays.csv',
        type: 'geochemistry',
        size: '78 MB',
        description: 'Complete multi-element analysis including Cu, Zn, Pb, Ag, Au'
      },
      {
        name: 'electromagnetic_survey.tif',
        type: 'geophysics',
        size: '67 MB',
        description: 'Airborne electromagnetic survey data'
      },
      {
        name: 'volcanic_lithology.shp',
        type: 'geology',
        size: '23 MB',
        description: 'Detailed volcanic rock type classifications'
      },
      {
        name: 'vms_occurrences.csv',
        type: 'labels',
        size: '4 MB',
        description: 'Known VMS deposits and showings'
      }
    ],
    metadata: {
      coordinateSystem: 'NAD83 UTM Zone 21N',
      resolution: '25m',
      coverage: '1.2° × 0.8°',
      acquisitionYear: '2023',
      dataQuality: 'High',
      processingLevel: 'Level 2B (Processed)'
    },
    preview: {
      totalSamples: 1567,
      positiveCases: 12,
      negativeCases: 1555,
      elementRange: {
        cu: { min: 2.1, max: 450, unit: 'ppm' },
        zn: { min: 8.5, max: 890, unit: 'ppm' },
        pb: { min: 3.2, max: 234, unit: 'ppm' },
        ag: { min: 0.5, max: 45, unit: 'ppm' }
      }
    }
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const datasetId = searchParams.get('datasetId');
  
  if (datasetId) {
    const dataset = SAMPLE_DATASETS.find(d => d.id === datasetId);
    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      dataset
    });
  }
  
  return NextResponse.json({
    success: true,
    datasets: SAMPLE_DATASETS
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, datasetId } = body;
    
    switch (action) {
      case 'download_sample':
        return await downloadSampleDataset(datasetId);
      
      case 'prepare_for_training':
        return await prepareDatasetForTraining(datasetId);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Sample data error:', error);
    return NextResponse.json(
      { error: 'Failed to process sample data request' },
      { status: 500 }
    );
  }
}

async function downloadSampleDataset(datasetId: string) {
  const dataset = SAMPLE_DATASETS.find(d => d.id === datasetId);
  if (!dataset) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  }
  
  // Simulate download preparation
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const downloadId = `download_${Date.now()}`;
  const downloadUrl = `/api/samples/download/${downloadId}`;
  
  return NextResponse.json({
    success: true,
    downloadId,
    downloadUrl,
    filename: `${dataset.name.replace(/\s+/g, '_')}.zip`,
    size: dataset.size,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
  });
}

async function prepareDatasetForTraining(datasetId: string) {
  const dataset = SAMPLE_DATASETS.find(d => d.id === datasetId);
  if (!dataset) {
    return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
  }
  
  // Simulate data preparation
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const trainingDataId = `training_data_${Date.now()}`;
  
  return NextResponse.json({
    success: true,
    trainingDataId,
    datasetInfo: {
      name: dataset.name,
      depositType: dataset.depositType,
      totalSamples: dataset.preview.totalSamples,
      positiveCases: dataset.preview.positiveCases,
      features: dataset.files.map(f => f.name),
      readyForTraining: true
    },
    preprocessingResults: {
      missingValuesHandled: true,
      outliersRemoved: true,
      featuresEngineered: true,
      dataBalanced: dataset.preview.positiveCases < 50 ? 'SMOTE applied' : 'Balanced',
      validationSplit: '20% holdout with spatial cross-validation'
    }
  });
}