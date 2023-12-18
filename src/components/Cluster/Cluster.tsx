import React, { useState } from 'react';
import {
  Container,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Typography,
  Paper,
  TextField,
  Grid,
  Button,
} from '@mui/material';
import axios from 'axios';
import './Cluster.css'
import { saveAs } from 'file-saver'; 


function Cluster() {
  
  
  const [clusterKMeansResults, setClusterKMeansResults] = useState({});
  const [clusterHierarchicalResults, setClusterHierarchicalResults] = useState({});
  const [clusterDBScanResults, setClusterDBScanResults] = useState({});
  
  const [base64Image, setBase64Image] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [totalIterations, setTotalIterations] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  
  const displayKMeansResults = () => {
    const clusters = Object.keys(clusterKMeansResults);
    
    return clusters.map((clusterIndex) => {
      // Exclude "total_iterations" and "total_time" entries
      if (clusterIndex === "total_iterations" || clusterIndex === "total_time") {
        return null;
      }
      
      return (
        <div key={clusterIndex}>
        <Typography variant="h6">Cluster {clusterIndex}</Typography>
        {/* Check if clusterKMeansResults[clusterIndex] is an array before using map */}
        {Array.isArray(clusterKMeansResults[clusterIndex])
          ? clusterKMeansResults[clusterIndex].map((filePath) => (
            <div key={filePath} className="search-results-header">
            <Typography variant="subtitle1">{getFilenameFromPath(filePath)}</Typography>
            {/* Add similarity information if available */}
            <Button onClick={() => handleDownload(filePath)} sx={{ marginTop: "1rem", fontSize: "0.8rem" }} variant='contained'>Download File</Button>
            </div>
            ))
            : <Typography variant="body1"></Typography>
          }
          </div>
          );
        });
      };
      
      const displayHierarchicalResults = () => {
        const clusters = Object.keys(clusterHierarchicalResults?.clusters || {});
        const filesMapping = clusterHierarchicalResults?.files_mapping || {};
        
        return (
          <div className="result-section">
              {/* Display files_mapping information */}
              <div className="files-mapping-container">
              <Typography variant="subtitle1">Files Mapping:</Typography>
              <ul>
              {Object.keys(filesMapping).map((fileIndex) => (
                <div key={fileIndex} className="cluster-file">
                <Typography variant="subtitle1">
                {fileIndex}: {getFilenameFromPath(filesMapping[fileIndex])}
                </Typography>
                <Button onClick={() => handleDownload(filesMapping[fileIndex])} variant="contained">
                Download File
                </Button>
                </div>
                ))}
                </ul>
                </div>
          {clusters.map((clusterIndex) => (
            <div key={clusterIndex} className="cluster-container">
            <Typography variant="h6">Cluster {clusterIndex}</Typography>
            <div className="cluster-files">
            {clusterHierarchicalResults?.clusters?.[clusterIndex]?.map((filePath) => (
              <div key={filePath} className="cluster-file">
              <Typography variant="subtitle1">{getFilenameFromPath(filePath)}</Typography>
              <Button onClick={() => handleDownload(filePath)} variant="contained">
              Download File
              </Button>
              </div>
              ))}
              </div>
              
            
                </div>
                ))}
                </div>
                );
              };
              
              const displayDBScanResults = () => {
                const clusters = clusterDBScanResults?.clusters || {};
                
                return Object.keys(clusters).map((clusterIndex) => {
                  return (
                    <div key={clusterIndex} className="result-section">
                    <Typography variant="h6">Cluster {clusterIndex}</Typography>
                    {/* Check if clusters[clusterIndex] is an array before using map */}
                    {Array.isArray(clusters[clusterIndex])
                      ? clusters[clusterIndex].map((filePath) => (
                        <div key={filePath} className="cluster-file">
                        <Typography variant="subtitle1">{getFilenameFromPath(filePath)}</Typography>
                        <Button onClick={() => handleDownload(filePath)} variant="contained">
                        Download File
                        </Button>
                        </div>
                        ))
                        : <Typography variant="body1"></Typography>
                      }
                      </div>
                      );
                    });
                  };
                  
                  
                  function handleDownload(key) {
                    console.log(key);
                    axios
                    .get(`${import.meta.env.VITE_LOCALHOST}/indexing_tables/get_txt_file?txt_file_path=${key}`, { responseType: 'text' }) // Specify responseType as 'text'
                    .then((response) => {
                      console.log('Server Response:', response.data);
                      
                      // Create a Blob with the text content
                      const blob = new Blob([response.data], { type: 'text/plain' });
                      
                      // Use file-saver library to save the Blob as a file and trigger download
                      saveAs(blob, 'downloadedFile.txt');
                    })
                    .catch((error) => {
                      console.error('Error:', error);
                      // Check the error response for more details
                      if (error.response) {
                        console.error('Server Error Response:', error.response.data);
                      }
                    });
                  }
                  
                  
                  
                  function getFilenameFromPath(filePath) {
                    // Split the path using forward slashes
                    const pathParts = filePath.split('/');
                    
                    // Get the last part of the path (filename)
                    const filename = pathParts[pathParts.length - 1];
                    
                    return filename;
                  }
                  
                  
                  const [kMeansOptions, setKMeansOptions] = useState({
                    clusters: 1,
                    directoryName: '',
                    weightStrategy: 'TF',
                    similarityStrategy: 'cosine',
                    maxIterations: 1
                  });
                  
                  const [agglomerativeOptions, setAgglomerativeOptions] = useState({
                    clusters: 1,
                    directoryName: '',
                    weightStrategy: 'TF',
                    distanceStrategy: 'single',
                    similarityStrategy: 'cosine',
                  });
                  
                  const [dbScanOptions, setDBScanOptions] = useState({
                    minSamples: 1,
                    directoryName: '',
                    weightStrategy: 'TF',
                    similarityStrategy: 'cosine',
                    EPS: 0.1,
                  });
                  
                  const [fileNames, setFileNames] = useState([]);
                  const [vsmSim, setVsmSim] = useState('');
                  const [vsmTime, setVsmTime] = useState('');
                  
                  const handleSelectedCompare = (event) => {
                    setSelectedCompare(event.target.value);
                  };
                  
                  const handleWeightOptionChange = (event, row) => {
                    const { value } = event.target;
                    switch (row) {
                      case 'kMeans':
                      setKMeansOptions((prevOptions) => ({ ...prevOptions, weightStrategy: value }));
                      break;
                      case 'agglomerative':
                      setAgglomerativeOptions((prevOptions) => ({ ...prevOptions, weightStrategy: value }));
                      break;
                      case 'dbScan':
                      setDBScanOptions((prevOptions) => ({ ...prevOptions, weightStrategy: value }));
                      break;
                      default:
                      break;
                    }
                  };

                  
                  const handleSimilarityOptionChange = (event, row) => {
                    const { value } = event.target;
                    switch (row) {
                      case 'kMeans':
                      setKMeansOptions((prevOptions) => ({ ...prevOptions, weightStrategy: value }));
                      break;
                      case 'agglomerative':
                      setAgglomerativeOptions((prevOptions) => ({ ...prevOptions, weightStrategy: value }));
                      break;
                      case 'dbScan':
                      setDBScanOptions((prevOptions) => ({ ...prevOptions, weightStrategy: value }));
                      break;
                      default:
                      break;
                    }
                  };

                  
                  const handleDistanceOptionChange = (event, row) => {
                    const { value } = event.target;
                    switch (row) {
                      case 'kMeans':
                      setKMeansOptions((prevOptions) => ({ ...prevOptions, distanceStrategy: value }));
                      break;
                      case 'agglomerative':
                      setAgglomerativeOptions((prevOptions) => ({ ...prevOptions, distanceStrategy: value }));
                      break;
                      case 'dbScan':
                      setDBScanOptions((prevOptions) => ({ ...prevOptions, distanceStrategy: value }));
                      break;
                      default:
                      break;
                    }
                  };
                  
                  const handleMetricChange = (event, row) => {
                    const { value } = event.target;
                    switch (row) {
                      case 'kMeans':
                      setKMeansOptions((prevOptions) => ({ ...prevOptions, similarityStrategy: value }));
                      break;
                      case 'agglomerative':
                      setAgglomerativeOptions((prevOptions) => ({ ...prevOptions, similarityStrategy: value }));
                      break;
                      case 'dbScan':
                      setDBScanOptions((prevOptions) => ({ ...prevOptions, similarityStrategy: value }));
                      break;
                      default:
                      break;
                    }
                  };
                  
                  
                  const handleKMeansSubmit = (event) => {
                    event.preventDefault();
                    axios.post(`${import.meta.env.VITE_LOCALHOST}/clustering/cluster_k_means`,
                    {
                      directory_name: kMeansOptions.directoryName,
                      weight_strategy: kMeansOptions.weightStrategy,
                      similarity_strategy: kMeansOptions.similarityStrategy,
                      number_of_clusters: kMeansOptions.clusters,
                      maximum_number_of_iterations: 0, // Replace with your desired value
                    }
                    )
                    .then((response) => {
                      console.log('Server Response:', response.data);
                      // Update state with response data
                      setClusterKMeansResults(response.data);
                      setTotalIterations(response.data.total_iterations);
                      setTotalTime(response.data.total_time);
                    })
                    .catch((error) => {
                      console.error('Error sending POST request:', error);
                      // Check the error response for more details
                      if (error.response) {
                        console.error('Server Error Response:', error.response.data);
                      }
                    });
                  };
                  
                  const handleAgglomerativeSubmit = (event) => {
                    event.preventDefault();
                    setLoading(true);
                    setError(null);
                    
                    axios
                    .post(`${import.meta.env.VITE_LOCALHOST}/clustering/cluster_hierarchical`, {
                      directory_name: agglomerativeOptions.directoryName,
                      weight_strategy: agglomerativeOptions.weightStrategy,
                      similarity_strategy: agglomerativeOptions.similarityStrategy,
                      cluster_distance_strategy: agglomerativeOptions.distanceStrategy,
                      number_of_clusters: agglomerativeOptions.clusters,
                    })
                    .then((response) => {
                      setClusterHierarchicalResults(response.data);
                      setLoading(false);
                      setBase64Image(response.data.image)
                      console.log('Server Response:', response.data);
                    })
                    .catch((error) => {
                      setLoading(false);
                      setError('An error occurred while fetching data.');
                      console.error('Error sending POST request:', error);
                      if (error.response) {
                        console.error('Server Error Response:', error.response.data);
                      }
                    });
                  };
                  
                  const handleDBScanSubmit = (event) => {
                    event.preventDefault();
                    axios.post(`${import.meta.env.VITE_LOCALHOST}/clustering/cluster_dbscan`,
                    {
                      directory_name: dbScanOptions.directoryName,
                      min_samples: dbScanOptions.minSamples,
                      eps: dbScanOptions.EPS,
                      weight_strategy: dbScanOptions.weightStrategy,
                      similarity_strategy: dbScanOptions.similarityStrategy,
                    }
                    )
                    .then(response => {
                      setClusterDBScanResults(response.data)
                      console.log('Server Response:', response.data);
                    })
                    .catch(error => {
                      console.error('Error sending POST request:', error);
                      // Check the error response for more details
                      if (error.response) {
                        console.error('Server Error Response:', error.response.data);
                      }
                    }); 
                  };
                  
                  
                  return (
                    <div className="cluster-container">
                    <h1 className="main-title">Clustering</h1>
                    
                    <Container maxWidth="md" className="main-container">
                    {/* Row 1: K-Means */}
                    <div className="cluster-row">
                    <Typography style={{marginBottom:"2rem"}} variant="h5">Cluster using k means</Typography>
                    {/* Parameter inputs for k-means */}
                    <Grid container spacing={2}>
                    <Grid item xs={4}>
                    <TextField
                    label="Number of clusters"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={kMeansOptions.clusters}
                    onChange={(e) =>
                      setKMeansOptions((prevOptions) => ({
                        ...prevOptions,
                        clusters: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    />
                    
                    </Grid>
                    <Grid item xs={4}>
                    <TextField
                    label="Max Iterations"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={kMeansOptions.maxIterations}
                    onChange={(e) =>
                      setKMeansOptions((prevOptions) => ({
                        ...prevOptions,
                        maxIterations: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    />
                    
                    </Grid>
                    <Grid item xs={4}>
                    <TextField
                    label="Directory name"
                    value={kMeansOptions.directoryName}
                    onChange={(e) =>
                      setKMeansOptions((prevOptions) => ({
                        ...prevOptions,
                        directoryName: e.target.value,
                      }))
                    }
                    />
                    </Grid>
                    <Grid item xs={3}>
                    <FormControl component="fieldset">
                    <RadioGroup
                    value={kMeansOptions.weightStrategy}
                    onChange={(e) => handleWeightOptionChange(e, 'kMeans')}
                    >
                    <FormControlLabel value="TF" control={<Radio />} label="TF" />
                    <FormControlLabel value="TF-IDF" control={<Radio />} label="TF-IDF" />
                    </RadioGroup>
                    </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                    <FormControl component="fieldset">
                    <RadioGroup
                    value={kMeansOptions.similarityStrategy}
                    onChange={(e) => handleMetricChange(e, 'kMeans')}
                    >
                    <FormControlLabel value="cosine" control={<Radio />} label="Cosine" />
                    <FormControlLabel value="euclidian" control={<Radio />} label="Euclidean" />
                    <FormControlLabel value="manhattan" control={<Radio />} label="Manhattan" />
                    </RadioGroup>
                    </FormControl>
                    </Grid>
                    </Grid>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={handleKMeansSubmit}
                    style={{ margin: '16px 0px' }}
                    >
                    Submit K-Means
                    </Button>
                    </div>
                    
                    {/* K-Means Results Section */}
                    <div style={{marginBottom:"2rem"}} className="result-section">
                    <Paper elevation={3} className="result-card">
                    <Typography variant="h6">K-Means Results</Typography>
                    {/* Display total iterations and total time */}
                    <Typography variant="body1">Total Iterations: {totalIterations}</Typography>
                    <Typography variant="body1">Total Time: {totalTime?.toFixed(5)} </Typography>
                    {/* Display cluster results */}
                    {displayKMeansResults()}
                    </Paper>
                    </div>
                    
                    
                    {/* Row 2: Agglomerative */}
                    <div className="cluster-row">
                    <Typography style={{marginBottom:"2rem"}} variant="h5">Cluster using Agglomerative</Typography>
                    {/* Parameter inputs for Agglomerative */}
                    <Grid container spacing={2}>
                    <Grid item xs={4}>
                    <TextField
                    label="Number of clusters"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={agglomerativeOptions.clusters}
                    onChange={(e) =>
                      setAgglomerativeOptions((prevOptions) => ({
                        ...prevOptions,
                        clusters: parseInt(e.target.value, 10) || 1,
                      }))
                    }
                    />
                    </Grid>
                    <Grid item xs={4}>
                    <TextField
                    label="Directory name"
                    value={agglomerativeOptions.directoryName}
                    onChange={(e) =>
                      setAgglomerativeOptions((prevOptions) => ({
                        ...prevOptions,
                        directoryName: e.target.value,
                      }))
                    }
                    />
                    </Grid>
                    <Grid item xs={4}>
                    <FormControl component="fieldset">
                    <RadioGroup
                    value={agglomerativeOptions.weightStrategy}
                    onChange={(e) => handleWeightOptionChange(e, 'agglomerative')}
                    >
                    <FormControlLabel value="TF" control={<Radio />} label="TF" />
                    <FormControlLabel value="TF-IDF" control={<Radio />} label="TF-IDF" />
                    </RadioGroup>
                    </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                    <FormControl component="fieldset">
                    <RadioGroup
                    value={agglomerativeOptions.distanceStrategy}
                    onChange={(e) => handleDistanceOptionChange(e, 'agglomerative')}
                    >
                    <FormControlLabel value="single" control={<Radio />} label="Single" />
                    <FormControlLabel value="complete" control={<Radio />} label="Complete" />
                    <FormControlLabel value="average" control={<Radio />} label="Average" />
                    
                    </RadioGroup>
                    </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                    <FormControl component="fieldset">
                    <RadioGroup
                    value={agglomerativeOptions.similarityStrategy}
                    onChange={(e) => handleMetricChange(e, 'agglomerative')}
                    >
                    <FormControlLabel value="cosine" control={<Radio />} label="Cosine" />
                    <FormControlLabel value="euclidian" control={<Radio />} label="Euclidean" />
                    <FormControlLabel value="manhattan" control={<Radio />} label="Manhattan" />
                    </RadioGroup>
                    </FormControl>
                    </Grid>
                    <Grid item xs={3}>
                    {/* Add additional input fields as needed */}
                    </Grid>
                    </Grid>
                    <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAgglomerativeSubmit}
                    style={{ margin: '16px 0px' }}
                    >
                    Submit Agglomerative
                    </Button>
                    </div>
                    
                    
                    {/* Agglomerative Results Section */}
                    <div style={{ marginBottom: '2rem' }} className="result-section">
                    <Paper elevation={3} className="result-card" style={{ width: '80%', margin: 'auto' }}>
                    <Typography variant="h6">Agglomerative Results</Typography>
                    
                    {base64Image && (
                      <img
                      src={`data:image/png;base64, ${base64Image}`}
                      alt="Cluster Visualization"
                      style={{ width: '100%', borderRadius: '8px', marginTop: '1rem' }}
                      />
                      )}
                      {displayHierarchicalResults()}
                      </Paper>
                      </div>
                      
                      {/* Row 3: DBScan */}
                      <div  className="cluster-row">
                      <Typography style={{marginBottom:"2rem"}} variant="h5">Cluster using density-based DBScan</Typography>
                      {/* Parameter inputs for DBScan */}
                      <Grid container spacing={2}>
                      <Grid item xs={4}>
                      <TextField
                      label="Minimum number of samples"
                      type="number"
                      inputProps={{ min: 1 }}
                      value={dbScanOptions.minSamples}
                      onChange={(e) =>
                        setDBScanOptions((prevOptions) => ({
                          ...prevOptions,
                          minSamples: parseInt(e.target.value, 10) || 1,
                        }))
                      }
                      />
                      </Grid>
                      <Grid item xs={4}>
                      <TextField
                      label="Directory name"
                      value={dbScanOptions.directoryName}
                      onChange={(e) =>
                        setDBScanOptions((prevOptions) => ({
                          ...prevOptions,
                          directoryName: e.target.value,
                        }))
                      }
                      />
                      
                      </Grid>
                      <Grid item xs={4}>
                      <TextField
                      label="EPS"
                      type='number'
                      value={dbScanOptions.EPS}
                      onChange={(e) =>
                        setDBScanOptions((prevOptions) => ({
                          ...prevOptions,
                          EPS: parseFloat(e.target.value) ,
                        }))
                      }
                      />
                      
                      </Grid>
                      <Grid item xs={3}>
                      <FormControl component="fieldset">
                      <RadioGroup
                      value={dbScanOptions.weightStrategy}
                      onChange={(e) => handleWeightOptionChange(e, 'dbScan')}
                      >
                      <FormControlLabel value="TF" control={<Radio />} label="TF" />
                      <FormControlLabel value="TF-IDF" control={<Radio />} label="TF-IDF" />
                      </RadioGroup>
                      </FormControl>
                      </Grid>
                      <Grid item xs={3}>
                      <FormControl component="fieldset">
                      <RadioGroup
                      value={dbScanOptions.similarityStrategy}
                      onChange={(e) => handleMetricChange(e, 'dbScan')}
                      >
                      <FormControlLabel value="cosine" control={<Radio />} label="Cosine" />
                      <FormControlLabel value="euclidian" control={<Radio />} label="Euclidean" />
                      <FormControlLabel value="manhattan" control={<Radio />} label="Manhattan" />
                      </RadioGroup>
                      
                      </FormControl>
                      </Grid>
                      
                      </Grid>
                      <Button
                      variant="contained"
                      color="primary"
                      onClick={handleDBScanSubmit}
                      style={{ margin: '16px 0px' }}
                      >
                      Submit DBScan
                      </Button>
                      </div>
                      {/* DBScan Results Section */}
                      <div style={{marginBottom:"2rem"}} className="result-section">
                      <Paper elevation={3} className="result-card">
                      <Typography variant="h6"> DBScan Results</Typography>
                      {/* Display total iterations and total time */}
                      
                      {/* Display cluster results */}
                      {displayDBScanResults()}
                      </Paper>
                      </div>
                      
                      </Container>
                      </div>
                      );
                    }
                    
                    export default Cluster;