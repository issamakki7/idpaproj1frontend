import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Input,
  Button,
  Checkbox,
  FormControlLabel,
  InputLabel,
  Radio,
  RadioGroup,
  FormControl,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import './Search.css';
import axios from 'axios';
import { saveAs } from 'file-saver'; 


const Search: React.FC = () => {
  const [fileName,setFileName] = useState([]);
  const [time, setTime] = useState<number>(0);
  const [results, setResults] = useState({});
  
  const [searchInput, setSearchInput] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [indexingEnabled, setIndexingEnabled] = useState<boolean>(true);
  const [kNearestNeighbor, setKNearestNeighbor] = useState<string>('5');
  const [rangeSelector, setRangeSelector] = useState<number>(0);
  const [tfIdf, setTfIdf] = useState<string>('0');
  const [selectedMetric, setSelectedMetric] = useState('cosine');
  
  
  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const requestBody = {
      query: searchInput,
      indexing: indexingEnabled,
      weight_strategy: tfIdf === '0' ? 'TF' : 'TF-IDF',
      similarity_strategy: selectedMetric,
      nearest_neighbor: parseInt(kNearestNeighbor),
      range_selector: 0
    };
    
    console.log(requestBody)
    
    axios.post(`${import.meta.env.VITE_LOCALHOST}/compare/search_flat`, requestBody)
    .then((response) => {
      console.log('Response:', response.data.similarity);
      setResults(response.data.similarity);
      setTime(response.data.time.toFixed(5));

    })
    .catch((error) => {
      console.error('Error occurred:', error);
      // Handle errors if needed
    });
  };

  const handleFileSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const requestBody = {
      file_name: fileName,
      indexing: indexingEnabled,
      weight_strategy: tfIdf === '0' ? 'TF' : 'TF-IDF',
      similarity_strategy: selectedMetric,
      nearest_neighbor: parseInt(kNearestNeighbor),
      range_selector: 0
    };
    
    console.log(requestBody)
    
    axios.post(`${import.meta.env.VITE_LOCALHOST}/compare/search_structured`, requestBody)
    .then((response) => {
      console.log('Response:', response.data.similarity);
      setResults(response.data.similarity);
      setTime(response.data.time.toFixed(5));

    })
    .catch((error) => {
      console.error('Error occurred:', error);
      // Handle errors if needed
    });
  };
  
  const handleMetricChange = event => {
    setSelectedMetric(event.target.value);
  };
  
  const handleFileChange = event => {
    const file = event.target.files[0];
    setFile(file)
    
    
    if (file) {
      
      const formData = new FormData();
      
      const uploadFile = new File([file], file.name, { type: file.type }); // Create an UploadFile object
      
      formData.append('files', uploadFile);
      formData.append('name', file.name);
      
      axios.post(`${import.meta.env.VITE_LOCALHOST}/files/uploadfiles`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        console.log('Server Response:', response.data);
        const newFileName = response.data.file_names[0];
        setFileName(newFileName);
      })
      .catch(error => {
        console.error('Error sending POST request:', error);
        // Check the error response for more details
        if (error.response) {
          console.error('Server Error Response:', error.response.data);
        }
      });
    } else {
      alert('Please select a file');
    }
  };
  
  
  
  function handleComputeIndexingTable(){
    axios.get(`${import.meta.env.VITE_LOCALHOST}/indexing_tables/compute_txt_indexing_table`)
    .then(response => {
      console.log('Server Response:', response.data);
      
    })
    .catch(error => {
      console.error('Error sending POST request:', error);
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
  
  return (
    <div>
    <AppBar position="static">
    <Toolbar>
    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
    IDPA - Intelligent Document Processing & Analysis
    </Typography>
    </Toolbar>
    </AppBar>
    
    <div className="container">
    <div className="search-form">
    <Typography variant="h4" gutterBottom>IDPAoogle</Typography>
    <form onSubmit={handleSearch} method="post" encType="multipart/form-data" className="search-inputs">
    <div className="search-bar">
    <Input
    className="search-input"
    name="q"
    type="search"
    placeholder="Search for keywords"
    id="qry"
    fullWidth
    value={searchInput}
    onChange={(e) => setSearchInput(e.target.value)}
    />
    <Button sx={{ marginLeft: '1rem' }} variant="contained" size="large" type="submit" className="search-button">
    <SearchIcon />
    </Button>
    </div>
    <Typography variant="h5" gutterBottom>OR</Typography>
    <div className="file-upload">
    <InputLabel htmlFor="formFile" className="form-label">
    Upload a file
    </InputLabel>
    <Input
    type="file"
    name="xmlfile"
    id="formFile"
    onChange={handleFileChange}
    />
     <Button sx={{ marginLeft: '1rem' }} variant='outlined' onClick={handleFileSubmit} className="search-button">
    <SearchIcon />
    </Button>
    </div>
    <div className="search-options">
    <Checkbox
    name="indexing"
    id="flexSwitchCheckChecked"
    defaultChecked={indexingEnabled}
    onChange={(e) => setIndexingEnabled(e.target.checked)}
    />
    <label htmlFor="flexSwitchCheckChecked">Enable Indexing</label>
    <RadioGroup sx={{marginBottom:"1rem"}} row aria-label="options" name="options" value={tfIdf} onChange={(e) => setTfIdf(e.target.value)}>
    <FormControlLabel value="0" control={<Radio />} label="TF" />
    <FormControlLabel value="1" control={<Radio />} label="TF-IDF" />
    </RadioGroup>
    <Typography variant="h6" className="radio-title">Choose Similarity Measure</Typography>
    <FormControl component="fieldset">
    <RadioGroup value={selectedMetric} onChange={handleMetricChange}>
    <FormControlLabel value="cosine" control={<Radio />} label="Cosine Similarity" />
    <FormControlLabel value="PCC" control={<Radio />} label="Pearson Correlation Coefficient" />
    <FormControlLabel value="euclidian" control={<Radio />} label="Euclidean Similarity" />
    <FormControlLabel value="manhattan" control={<Radio />} label="Manhattan Similarity" />
    <FormControlLabel value="jaccard" control={<Radio />} label="Jaccard Similarity" />
    <FormControlLabel value="dice" control={<Radio />} label="Dice Similarity" />
    </RadioGroup>
    </FormControl>
    <Typography sx={{marginBottom:"1rem"}}></Typography>
    <FormControl variant="standard" sx={{ width: 190 }}>

    <InputLabel id="exampleFormControlSelect1">K-th Nearest Neighbor</InputLabel>
    <Select
    labelId="exampleFormControlSelect1"
    name="K"
    value={kNearestNeighbor}
    onChange={(e) => setKNearestNeighbor(e.target.value as string)}
    >
    <MenuItem value="5">5</MenuItem>
    <MenuItem value="10">10</MenuItem>
    <MenuItem value="15">15</MenuItem>
    <MenuItem value="20">20</MenuItem>
    </Select>
    </FormControl>
    <FormControl variant="standard" sx={{ width: 150, marginLeft: '2rem' }}>
    <InputLabel id="exampleFormControlSelect2">Range Selector</InputLabel>
    <Input
    type="number"
    inputProps={{ min: 0, max: 1, step: 0.01 }}
    name="range"
    value={rangeSelector}
    onChange={(e) => setRangeSelector(parseFloat(e.target.value))}
    />
    </FormControl>
    </div>
    </form>
   
    </div>
    </div>
    
    <div className="container search-results">
  <div className="">
    <Typography variant="h5" gutterBottom>Search Results</Typography>
    <Typography variant="body1" gutterBottom>({time}s)</Typography>
  </div>
  
  {Object.keys(results).map((key) => (
    <div key={key} className="search-results-header">
      <Typography variant="subtitle1">{getFilenameFromPath(key)}</Typography>
      <Typography variant="body1">Similarity: {results[key].toFixed(5)}</Typography>
      <Button onClick={() => handleDownload(key)} sx={{ marginTop: "1rem", fontSize: "0.8rem" }} variant='contained'>Download File</Button>
    </div>
  ))}
  <button onClick={handleComputeIndexingTable} className="compute-btn">Compute Indexing Table</button>
</div>

      
      </div>
      
      );
    };
    
    export default Search;
    