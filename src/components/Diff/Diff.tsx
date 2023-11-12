import { useState } from 'react';
import './Diff.css';
import {
  Container,
  Button,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Typography,
  Paper,
} from '@mui/material';
import axios from 'axios';

function Diff() {
  const [selectedOption, setSelectedOption] = useState('TF');
  const [selectedMetric, setSelectedMetric] = useState('cosine');
  const [selectedCompare,setSelectedCompare] = useState('content')
  const [vsmSim, setVsmSim] = useState('');
  const [vsmTime, setVsmTime] = useState('');
  const [fileNames,setFileNames] = useState([]);


  
  const [fileContent1, setFileContent1] = useState('');
  const [fileContent2, setFileContent2] = useState('');
  
  

  

  const handleSelectedCompare = event => {
    setSelectedCompare(event.target.value);
    console.log(event.target.value)
  };


  const handleOptionChange = event => {
    setSelectedOption(event.target.value);
  };
  
  const handleMetricChange = event => {
    setSelectedMetric(event.target.value);
  };
  
  
  const handleFileChange1 = event => {
    setFileContent1(event.target)
    const file = event.target.files[0];
  
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
          setFileNames(prevFileNames => Array.from(new Set([...prevFileNames, newFileName])));
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
  
  
  
  const handleFileChange2 = event => {
    setFileContent2(event.target)
    const file = event.target.files[0];
  
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
          setFileNames(prevFileNames => Array.from(new Set([...prevFileNames, newFileName])));
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

  
  const handleSubmit = event => {
    event.preventDefault();
    
    if (fileContent1 && fileContent2) {
      const data = {
        content_to_compare: {
          name_file_one: fileNames[0],
          name_file_two: fileNames[1]
        },
        weight_strategy: selectedOption,
        similarity_strategy: selectedMetric
      };

      console.log(data)

      if(selectedCompare === "content"){
        console.log("Content")
        axios.post(`${import.meta.env.VITE_LOCALHOST}/compare/compare_content_only`, data)
        .then(response => {
          console.log('Server Response:', response.data);
          const formattedVsmSim = response.data.similarity.toFixed(5);
          const formattedVsmTime = response.data.time.toFixed(5);
  
          setVsmSim(formattedVsmSim);
          setVsmTime(formattedVsmTime);
        })
        .catch(error => {
          console.error('Error sending POST request:', error);
        });
      }
      if(selectedCompare === "contentandstructure"){
        console.log("Structure")
        axios.post(`${import.meta.env.VITE_LOCALHOST}/compare/compare_content_and_structure`, data)
        .then(response => {
          console.log('Server Response:', response.data);
          const formattedVsmSim = response.data.similarity.toFixed(5);
          const formattedVsmTime = response.data.time.toFixed(5);
  
          setVsmSim(formattedVsmSim);
          setVsmTime(formattedVsmTime);
        })
        .catch(error => {
          console.error('Error sending POST request:', error);
        });
      }
      
    
    } else {
      alert('Please select both files');
    }
  };
  
  
  return (
    
    <div className="diff-container">
    <h1 className='main-title'>Difference</h1>
    
    <Container className="main-container">
    
    <form className="file-upload-form" onSubmit={handleSubmit}>
    <div className="file-inputs">
    <div className="file-input">
    <label className="file-label">Choose your first file</label>
    <input type="file" name="file1" className="file-selector" onChange={handleFileChange1} />
    <div className="file-input">
    <label className="file-label">Choose your second file</label>
    <input type="file" name="file2" className="file-selector" onChange={handleFileChange2} />            </div>
    </div>
    </div>
    <div className='choice-section'>
    
    
    <div className="radio-section">
    <Typography variant="h6" className="radio-title">Choose</Typography>
    <FormControl component="fieldset">
    <RadioGroup value={selectedOption} onChange={handleOptionChange}>
    <FormControlLabel value="TF" control={<Radio />} label="TF" />
    <FormControlLabel value="TF-IDF" control={<Radio />} label="TF-IDF" />
    </RadioGroup>

    <Typography variant="h6" className="radio-title">Choose</Typography>
    <RadioGroup value={selectedCompare} onChange={handleSelectedCompare}>
    <FormControlLabel value="content" control={<Radio />} label="Content Only" />
    <FormControlLabel value="contentandstructure" control={<Radio />} label="Content and Structure"/>
    </RadioGroup>
    </FormControl>

    </div>
    <div className="similarity-radio-section">
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
    </div>
    </div>
    <button type="submit" className="submit-btn">Submit</button>
    </form>
    
    <div className="result-section">
    <Paper className="result-card">
    <Typography variant="h6">Results</Typography>
    <ul className="list-unstyled">
    <li>Similarity: {vsmSim}</li>
    <li>Time: {vsmTime}</li>
    </ul>
    </Paper>

    </div>
    </Container>
    </div>
    );
  }
  
  export default Diff;
  