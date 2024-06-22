import React, { useState, useEffect } from 'react';
import { Grid,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem, Select, FormControl, InputLabel, Typography, Container, Box } from '@mui/material';
import { styled } from '@mui/system';
import './Filter.css';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Header = styled(Typography)({
  textAlign: 'center',
  color: 'black',
 
});

const DropdownContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginBottom: '20px',
});

const Dropdown = styled(FormControl)({
  minWidth: 200,
  '& .MuiInputLabel-root': {
    color: '#ba2c1b',
  },
  '& .MuiSelect-root': {
    color: 'blue',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#ba2c1b',
  },
});

const FilterSearch = () => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState('');
  const [blockData, setBlockData] = useState({});
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [departmentData, setDepartmentData] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryData, setCategoryData] = useState({});
  const [selectedTable, setSelectedTable] = useState('');
  const [excelGenerated, setExcelGenerated] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      const response = await fetch('https://miscbit-8.onrender.com/api/block/blocks');
      if (!response.ok) {
        throw new Error('Failed to fetch blocks');
      }
      const data = await response.json();
      setBlocks(data.map(block => block.Block));
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const fetchBlockData = async (blockName) => {
    try {
      const response = await fetch(`https://miscbit-8.onrender.com/api/block/data/${blockName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch block data');
      }
      const data = await response.json();
      console.log(Object.keys(blockData));
      setBlockData(data);
    } catch (error) {
      console.error('Error fetching block data:', error);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async (blockName) => {
    try {
      if (blockName) {
        const response = await fetch(`https://miscbit-8.onrender.com/api/block/departments/${blockName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        setDepartments(data);
      } else {
        // Fetch departments without specifying a block
        const response = await fetch(`https://miscbit-8.onrender.com/api/block/departments`);
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        setDepartments(data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };
  
  const fetchDepartmentData = async (departmentName) => {
    try {
      const response = await fetch(`https://miscbit-8.onrender.com/api/block/department/datas/${departmentName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch department data');
      }
      const data = await response.json();
      setDepartmentData(data);
    } catch (error) {
      console.error('Error fetching department data:', error);
    }
  };

  const fetchCategoriesForBlock = async (blockName) => {
    try {
      const response = await fetch(`https://miscbit-8.onrender.com/api/block/blocks/categories/${blockName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories for block');
      }
      const data = await response.json();
      setCategories(data.categories);
    } catch (error) {
      console.error('Error fetching categories for block:', error);
    }
  };

  const fetchCategories = async (blockName, departmentName) => {
    if (departmentName) {
      try {
        const response = await fetch(`https://miscbit-8.onrender.com/api/block/fetchcategories/${blockName}/${departmentName}`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data.documentNames);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    } else {
      await fetchCategoriesForBlock(blockName);
    }
  };

  const fetchCategoryData = async (blockName, departmentName, categoryName) => {
    try {
      const response = await fetch(`https://miscbit-8.onrender.com/api/block/category/data/${blockName}/${departmentName}/${categoryName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch category data');
      }
      const data = await response.json();
      setCategoryData(data);
    } catch (error) {
      console.error('Error fetching category data:', error);
    }
  };

  useEffect(() => {
    if (selectedBlock) {
      fetchDepartments(selectedBlock);
      fetchBlockData(selectedBlock);
      fetchCategories(selectedBlock, selectedDepartment);
    }
  }, [selectedBlock]);

  useEffect(() => {
    if (selectedDepartment) {
      fetchDepartmentData(selectedDepartment);
      fetchCategories(selectedBlock, selectedDepartment);
    }
  }, [selectedDepartment]);

  const handleBlockChange = (event) => {
    const blockName = event.target.value;
    setSelectedBlock(blockName);
    setSelectedDepartment('');
    setDepartments([]);
    setDepartmentData({});
    setSelectedCategory('');
    setCategories([]);
    setCategoryData({});
  };

  const handleDepartmentChange = (event) => {
    const departmentName = event.target.value;
    setSelectedDepartment(departmentName);
    setSelectedCategory('');
    setCategories([]);
    setCategoryData({});
  };

  const handleCategoryChange = (event) => {
    const categoryName = event.target.value;
    setSelectedCategory(categoryName);
    fetchCategoryData(selectedBlock, selectedDepartment, categoryName);
  };

  const handleTableChange = (event) => {
    setSelectedTable(event.target.value);
  };
  const convertJsonToExcel = () => {
    const timestamp = new Date().toLocaleString().replace(/:/g, '-');
    console.log(blockData)
    const createSheetData = (data, keys) => {
      return data.map(item => {
          const row = {};
          keys.forEach(key => {
              if (key !== '_id') {
                  row[key] = item[key];
              }
          });
          return row;
      });
  };

  const workBook = XLSX.utils.book_new();

  const categories = [
      "Department",
      "Labs",
      "classrooms",
      "SeminarHalls",
      "Timetables",
      "Student",
      "Faculty",
      "Research",
      "Committe",
      "Mentoring",
      "EventsOrganized",
      "EventsParticipated",
      "Clubs"
  ];

  categories.forEach(category => {
      const data = [];
      blockData.forEach(block => {
          if (block[category] && Array.isArray(block[category])) {
              block[category].forEach(item => {
                  const row = { Block: block.Block, ...item };
                  data.push(row);
              });
          }
      });
      if (data.length > 0) {
          const keys = Object.keys(data[0]);
          const sheetData = createSheetData(data, keys);
          const workSheet = XLSX.utils.json_to_sheet(sheetData);
          XLSX.utils.book_append_sheet(workBook, workSheet, category);
      }
  });
  

  XLSX.writeFile(workBook, `${selectedBlock}-BlockData.xlsx`);
  setExcelGenerated(true);

  };

  /*
    const headerImage = 'data:image/jpeg;base64,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'; // Add your base64 image string here

  */

    const convertJsonToPDF = () => {
      const doc = new jsPDF();

      const headerImage = 'data:image/jpeg;base64,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'; // Add your base64 image string here
        const footerName = "CBIT - Management Information System";
        const timestamp = new Date().toLocaleString().replace(/:/g, '-');
        let pageNumber = 0;
        
        // Function to add header, footer, and timestamp
        const addHeaderFooter = () => {
          const width = doc.internal.pageSize.getWidth();
          const height = doc.internal.pageSize.getHeight();
          
          // Header
          doc.addImage(headerImage, 'JPEG', 10, 10, width * 0.9, 25); // Adjust the dimensions as needed
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal'); // Reset font to normal for the timestamp
          doc.text(timestamp, width - 10, 10, { align: 'right' });
          
          // Footer line
          doc.setDrawColor(200, 200, 200); // Light gray color
          doc.line(10, height - 15, width - 10, height - 15);
          
          // Footer
          doc.setFontSize(10);
          doc.text(footerName, 10, height - 10);
          doc.text(`Page ${pageNumber}`, width - 10, height - 10, { align: 'right' });
        };
        
        const drawTable = (title, data, keys) => {
          if (pageNumber > 0) {
            doc.addPage();
          }
          pageNumber++;
          addHeaderFooter();
          
          // Print category title
          const formattedTitle = title.toUpperCase();
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(formattedTitle, doc.internal.pageSize.getWidth() / 2, 40, { align: 'center' });
          
          // Underline the title
          const titleWidth = doc.getTextWidth(formattedTitle);
          doc.line(
            (doc.internal.pageSize.getWidth() - titleWidth) / 2, 
            42, 
            (doc.internal.pageSize.getWidth() + titleWidth) / 2, 
            42
          );
          
          doc.autoTable({
            head: [keys],
            body: data,
            startY: 45, // Start below the title
            didDrawPage: () => {
              addHeaderFooter();
            }
          });
        };
        
        blockData.forEach(block => {
          // Handle Labs
          if (block.Labs && block.Labs.length > 0) {
            const labKeys = Object.keys(block.Labs[0]).filter(key => key !== '_id');
            const labData = block.Labs.map(lab => labKeys.map(key => lab[key]));
            drawTable(`${selectedBlock} Block - Labs`, labData, labKeys);
          }
          
          // Handle Classrooms
          if (block.classrooms && block.classrooms.length > 0) {
            const classroomKeys = Object.keys(block.classrooms[0]).filter(key => key !== '_id');
            const classroomData = block.classrooms.map(classroom => classroomKeys.map(key => classroom[key]));
            drawTable(`${selectedBlock} Block - Classrooms`, classroomData, classroomKeys);
          }
          
          // Handle Seminar Halls
          if (block.SeminarHalls && block.SeminarHalls.length > 0) {
            const seminarHallKeys = Object.keys(block.SeminarHalls[0]).filter(key => key !== '_id');
            const seminarHallData = block.SeminarHalls.map(hall => seminarHallKeys.map(key => hall[key]));
            drawTable(`${selectedBlock} Block - Seminar Halls`, seminarHallData, seminarHallKeys);
          }
          
          // Handle Washrooms
          if (block.Washrooms && block.Washrooms.length > 0) {
            const washroomsKeys = Object.keys(block.Washrooms[0]).filter(key => key !== '_id');
            const washroomsData = block.Washrooms.map(washroom => washroomsKeys.map(key => washroom[key]));
            drawTable(`${selectedBlock} Block - Washrooms`, washroomsData, washroomsKeys);
          }
        });
        
        doc.save(`${selectedBlock}-Blockdata [${timestamp}].pdf`);
        setPdfGenerated(true);
      };
      
    
  
  
  
  
  
  return (
    <div className="container">
      <Grid item xs={12}>
        <Paper style={{ padding: '20px', background: '#fff' }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h1" sx={{ color: '#ba2c1b' }}>
                ALL DATA FILTER
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
      <br />
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Typography variant="h3" style={{ marginBottom: '30px', color: '#ba2c1b', fontWeight: 'bold' }}>
          SELECT A BLOCK DEPARTMENT & CATEGORY
        </Typography>
      </div>
      <Grid container spacing={2} style={{ marginBottom: '20px' }}>
        <Grid item xs={12} sm={4}>
          <InputLabel>BLOCK</InputLabel>
          <Select
            variant="outlined"
            fullWidth
            value={selectedBlock}
            onChange={handleBlockChange}
            label="BLOCK"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {blocks.map((block, index) => (
              <MenuItem key={index} value={block}>
                {block}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
          <InputLabel>DEPARTMENT</InputLabel>
          <Select
            variant="outlined"
            fullWidth
            value={selectedDepartment}
            onChange={handleDepartmentChange}
            label="DEPARTMENT"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {departments.map((department, index) => (
              <MenuItem key={index} value={department}>
                {department}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={4}>
          <InputLabel id="table-select-label">Table</InputLabel>
          <Select
            labelId="table-select-label"
            fullWidth
            value={selectedTable}
            onChange={handleTableChange}
            label="Table"
          >
            <MenuItem value="">All Tables</MenuItem>
            <MenuItem value="Classrooms">Classrooms</MenuItem>
            <MenuItem value="Labs">Labs</MenuItem>
            <MenuItem value="Faculty">Washrooms</MenuItem>
            <MenuItem value="SeminarHalls">SeminarHalls</MenuItem>
            {/* Add more menu items for other tables */}
          </Select>
        </Grid>
      </Grid>
      {selectedBlock && Object.keys(blockData).length > 0 && !selectedDepartment && (
        <div>
          {(!selectedTable || selectedTable === 'Classrooms') && (
            <div>
              <Typography variant="h3" style={{ marginBottom: '20px', color: '#ba2c1b', fontWeight: 'bold' }}>
                CLASSROOMS
              </Typography>
              <TableContainer component={Paper} style={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Classroom Number</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Department Id</TableCell>
                      <TableCell>Floor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {blockData.flatMap((block) =>
                      block.classrooms.map((classroom) => (
                        <TableRow key={classroom._id}>
                          <TableCell>{classroom.number}</TableCell>
                          <TableCell>{classroom.capacity}</TableCell>
                          <TableCell>{classroom.DepartmentId}</TableCell>
                          <TableCell>{classroom.Floor}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {(!selectedTable || selectedTable === 'Labs') && (
            <div>
              <br />
              <Typography variant="h3" style={{ marginBottom: '20px', color: '#ba2c1b', fontWeight: 'bold' }}>
                LABS
              </Typography>
              <TableContainer component={Paper} style={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Lab Number</TableCell>
                      <TableCell>Lab Name</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Equipment Status</TableCell>
                      <TableCell>Floor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {blockData.flatMap((block) =>
                      block.Labs.map((lab) => (
                        <TableRow key={lab._id}>
                          <TableCell>{lab.Lab_num}</TableCell>
                          <TableCell>{lab.name}</TableCell>
                          <TableCell>{lab.Department}</TableCell>
                          <TableCell>{lab.Equipment_status}</TableCell>
                          <TableCell>{lab.Floor}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {(!selectedTable || selectedTable === 'Faculty') && (
            <div>
              <br />
              <Typography variant="h3" style={{ marginBottom: '20px', color: '#ba2c1b', fontWeight: 'bold' }}>
                WASHROOMS
              </Typography>
              <TableContainer component={Paper} style={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>S_NO</TableCell>
                      <TableCell>TYPE</TableCell>
                      <TableCell>GENDER</TableCell>
                      <TableCell>FLOOR</TableCell>
                      <TableCell>COUNT</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {blockData.flatMap((block) =>
                      block.Washrooms.map((faculty) => (
                        <TableRow key={faculty._id}>
                          <TableCell>{faculty.S_NO}</TableCell>
                          <TableCell>{faculty.TYPE}</TableCell>
                          <TableCell>{faculty.GENDER}</TableCell>
                          <TableCell>{faculty.FLOOR}</TableCell>
                          <TableCell>{faculty.COUNT}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

{(!selectedTable || selectedTable === 'SeminarHalls') && (
            <div>
              <Typography variant="h3" style={{ marginBottom: '20px', color: '#ba2c1b', fontWeight: 'bold' }}>
                SeminarHalls
              </Typography>
              <TableContainer component={Paper} style={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Hall Number</TableCell>
                      <TableCell>Name</TableCell>
                      
                      <TableCell>Capacity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {blockData.flatMap((block) =>
                      block.SeminarHalls.map((classroom) => (
                        <TableRow key={classroom.Hall_number}>
                          <TableCell>{classroom.Hall_number}</TableCell>
                          <TableCell>{classroom.name}</TableCell>
                          <TableCell>{classroom.capacity}</TableCell>
                          
                          
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
          {/* Add other tables for Students, Research, Committees, Mentoring, EventsOrganized, EventsParticipated, Clubs in a similar manner */}
        </div>
      )}

      {selectedDepartment && Object.keys(departmentData).length > 0 && !selectedCategory && (
        <div>
          {(!selectedTable || selectedTable === 'Classrooms') && (
            <div>
              <Typography variant="h3" style={{ marginBottom: '20px', color: '#ba2c1b', fontWeight: 'bold' }}>
                CLASSROOMS
              </Typography>
              <TableContainer component={Paper} style={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Classroom Number</TableCell>
                      <TableCell>Capacity</TableCell>
                      <TableCell>Department Id</TableCell>
                      <TableCell>Floor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentData.classrooms.map((classroom) => (
                      <TableRow key={classroom._id}>
                        <TableCell>{classroom.number}</TableCell>
                        <TableCell>{classroom.capacity}</TableCell>
                        <TableCell>{classroom.DepartmentId}</TableCell>
                        <TableCell>{classroom.Floor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {(!selectedTable || selectedTable === 'Labs') && (
            <div>
              <br />
              <Typography variant="h3" style={{ marginBottom: '20px', color: '#ba2c1b', fontWeight: 'bold' }}>
                LABS
              </Typography>
              <TableContainer component={Paper} style={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Lab Number</TableCell>
                      <TableCell>Lab Name</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Equipment Status</TableCell>
                      <TableCell>Floor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentData.Labs.map((lab) => (
                      <TableRow key={lab._id}>
                        <TableCell>{lab.Lab_num}</TableCell>
                        <TableCell>{lab.name}</TableCell>
                        <TableCell>{lab.Department}</TableCell>
                        <TableCell>{lab.Equipment_status}</TableCell>
                        <TableCell>{lab.Floor}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}

          {(!selectedTable || selectedTable === 'Washrooms') && (
            <div>
              <br />
              <Typography variant="h3" style={{ marginBottom: '20px', color: '#ba2c1b', fontWeight: 'bold' }}>
                WASHROOMS
              </Typography>
              <TableContainer component={Paper} style={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>S_NO</TableCell>
                      <TableCell>TYPE</TableCell>
                      <TableCell>GENDER</TableCell>
                      <TableCell>FLOOR</TableCell>
                      <TableCell>COUNT</TableCell>
                      
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentData.Washrooms.map((faculty) => (
                      <TableRow key={faculty.S_NO}>
                        <TableCell>{faculty.TYPE}</TableCell>
                        <TableCell>{faculty.GENDER}</TableCell>
                        <TableCell>{faculty.FLOOR}</TableCell>
                        <TableCell>{faculty.COUNT}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
           {(!selectedTable || selectedTable === 'SeminarHalls') && (
            <div>
              <br />
              <Typography variant="h3" style={{ marginBottom: '20px', color: '#ba2c1b', fontWeight: 'bold' }}>
                SEMINAR HALLS
              </Typography>
              <TableContainer component={Paper} style={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>HALL NUMBER</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Capacity</TableCell>
                     
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {departmentData.SeminarHalls.map((hall) => (
                      <TableRow key={hall.Hall_number}>
                        <TableCell>{hall.Hall_number}</TableCell>
                        <TableCell>{hall.name}</TableCell>
                        <TableCell>{hall.capacity}</TableCell>
                       
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
          {/* Render other tables (Seminar Halls, Students, Research, etc.) similarly */}
        </div>
      )}

      {selectedCategory && (
        <div>
          <Typography variant="h2">Category Data</Typography>
          <pre>{JSON.stringify(categoryData, null, 2)}</pre>
        </div>
      )}
      <div className="button-container" style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="button" onClick={convertJsonToExcel}>
          Generate Excel
        </button>
        <button className="button" onClick={convertJsonToPDF}>
          Generate PDF
        </button>
        {/* {excelGenerated && <p className="message">Excel file generated successfully.</p>}
        {pdfGenerated && <p className="message">PDF file generated successfully.</p>} */}
      </div>
    </div>
  );
};

  

export default FilterSearch;
