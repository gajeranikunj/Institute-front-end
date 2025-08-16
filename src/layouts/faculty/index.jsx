// src/layouts/faculty/index.js
import { useState, useEffect, useCallback } from "react";
import {
  Grid,
  Card,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";

// Material Dashboard components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Layout components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DataTable from "examples/Tables/DataTable";

// API
import { getallfaculty, addfaculty } from "../../api/faculty";

// Styled upload box
const UploadBox = styled("label")({
  height: 200,
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
  cursor: "pointer",
  alignItems: "center",
  justifyContent: "center",
  border: "2px dashed #cacaca",
  backgroundColor: "#fff",
  padding: "1.5rem",
  borderRadius: "10px",
  boxShadow: "0px 48px 35px -48px rgba(0,0,0,0.1)",
  "& svg": { height: "80px", fill: "rgba(75, 85, 99, 1)" },
  "& span": { fontWeight: 400, color: "rgba(75, 85, 99, 1)" },
});

// Field configuration
const FIELD_CONFIG = [
  { name: "name", label: "Full Name" },
  { name: "email", label: "Email", type: "email" },
  { name: "password", label: "Password", type: "password" },
  { name: "phone", label: "Phone Number", type: "tel" },
];

const OTHER_FIELDS = [
  { name: "salary", label: "Salary", type: "number" },
  { name: "totalStudents", label: "Total Students", type: "number" },
  { name: "address", label: "Address", multiline: true, rows: 2 },
  { name: "expertise", label: "Expertise (comma separated)" },
  { name: "experienceYears", label: "Experience (Years)", type: "number" },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  phone: "",
  photo: "",
  salary: "",
  totalStudents: "",
  address: "",
  expertise: "",
  experienceYears: "",
};

// Convert image to base64
const convertToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

function Faculty() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [loader, setLoader] = useState(true);
  const [infoOpen, setInfoOpen] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  const columns = [
    { Header: "faculty", accessor: "faculty", width: "30%", align: "left" },
    { Header: "phone", accessor: "phone", align: "center" },
    { Header: "email", accessor: "email", align: "center" },
    { Header: "salary", accessor: "salary", align: "center" },
    { Header: "students", accessor: "totalStudents", align: "center" },
    { Header: "expertise", accessor: "expertise", align: "center" },
    { Header: "experience", accessor: "experienceYears", align: "center" },
    { Header: "status", accessor: "status", align: "center" },
  ];

  // Fetch faculty data
  const fetchFaculties = useCallback(async () => {
    try {
      setLoader(true);
      const faculties = await getallfaculty();
      const mappedData = faculties.map((faculty) => ({
        faculty: (
          <MDBox display="flex" alignItems="center" lineHeight={1}>
            <Avatar src={faculty.photo} alt={faculty.name} sx={{ width: 36, height: 36, mr: 1 }} />
            <MDTypography variant="button" fontWeight="medium">
              {faculty.name}
            </MDTypography>
          </MDBox>
        ),
        phone: faculty.phone,
        email: faculty.email,
        salary: faculty.salary,
        totalStudents: faculty.totalStudents,
        expertise: faculty.expertise.join(", "),
        experienceYears: faculty.experienceYears,
        status: (
          <MDTypography
            variant="caption"
            color={faculty.isActive ? "success" : "error"}
            fontWeight="medium"
          >
            {faculty.isActive ? "Active" : "Inactive"}
          </MDTypography>
        ),
        originalData: faculty,
      }));
      setRows(mappedData);
    } catch (error) {
      console.error("Error fetching faculty data:", error);
    } finally {
      setLoader(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculties();
  }, [fetchFaculties]);

  // Handle input change
  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === "photo" && files?.[0]) {
      const base64 = await convertToBase64(files[0]);
      setFormData((prev) => ({ ...prev, photo: base64 }));
      setErrors((prev) => ({ ...prev, photo: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = ["name", "email", "password", "phone", "photo", "address"];
    const newErrors = requiredFields.reduce((acc, field) => {
      if (!formData[field]?.trim()) acc[field] = `${field} is required`;
      return acc;
    }, {});
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;
    const payload = {
      ...formData,
      expertise: formData.expertise.split(",").map((e) => e.trim()),
    };
    try {
      await addfaculty(payload);
      setOpen(false);
      setInfoOpen(false);
      setFormData(EMPTY_FORM);
      setErrors({});
      fetchFaculties();
    } catch (error) {
      console.error("Error adding faculty:", error);
    }
  };

  // Handle double click to open info
  const handleDoubleClick = (faculty) => {
    setFormData({ ...faculty, expertise: faculty.expertise.join(", "), password: "" });
    setInfoOpen(true);
    setOpen(true);
  };

  const displayRows = rows.map((row) => {
    const clickHandler = () => handleDoubleClick(row.originalData);
    return {
      ...row,
      salary: `₹${row.salary.toLocaleString()}`,
      experienceYears: `${row.experienceYears} yrs`,
      faculty: (
        <div style={{ cursor: "pointer" }} onDoubleClick={clickHandler}>
          {row.faculty}
        </div>
      ),
      phone: (
        <div style={{ cursor: "pointer" }} onDoubleClick={clickHandler}>
          {row.phone}
        </div>
      ),
      email: (
        <div style={{ cursor: "pointer" }} onDoubleClick={clickHandler}>
          {row.email}
        </div>
      ),
      totalStudents: (
        <div style={{ cursor: "pointer" }} onDoubleClick={clickHandler}>
          {row.totalStudents}
        </div>
      ),
      expertise: (
        <div style={{ cursor: "pointer" }} onDoubleClick={clickHandler}>
          {row.expertise}
        </div>
      ),
    };
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox
                mx={2}
                mt={-3}
                py={3}
                px={2}
                variant="gradient"
                bgColor="info"
                borderRadius="lg"
                coloredShadow="info"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <MDTypography variant="h6" color="white">
                  Faculty Table
                </MDTypography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setFormData(EMPTY_FORM);
                    setInfoOpen(false);
                    setOpen(true);
                  }}
                >
                  Add Faculty
                </Button>
              </MDBox>
              <MDBox pt={1}>
                {loader ? (
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                  </MDBox>
                ) : (
                  <DataTable
                    table={{ columns, rows: displayRows }}
                    isSorted
                    entriesPerPage
                    canSearch
                    showTotalEntries
                    noEndBorder
                  />
                )}
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />

      {/* Modal */}
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setInfoOpen(false);
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{infoOpen ? "Faculty Information" : "Add Faculty"}</DialogTitle>
        {infoOpen ? (
          <DialogContent>
            <Grid container spacing={2} mt={1}>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <img
                  src={formData.photo}
                  alt=""
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    objectFit: "cover", // ✅ Keeps aspect ratio
                  }}
                />
              </Grid>
              <Grid container spacing={2}>
                {[
                  { name: "name", label: "Name" },
                  { name: "email", label: "Email" },
                  { name: "password", label: "Password" },
                  { name: "salary", label: "Salary" },
                  { name: "totalStudents", label: "Total Students" },
                  { name: "expertise", label: "Expertise" },
                  { name: "experienceYears", label: "Experience Years" },
                  { name: "address", label: "Address" },
                ].map(({ name, label }) => {
                  return (
                    <Grid item xs={name == "address" ? 12 : 6} key={name}>
                      <strong>{label}:</strong>
                      <div style={{ color: "black", padding: "4px 0" }}>
                        {formData[name] || "-"}
                      </div>
                    </Grid>
                  );
                })}
              </Grid>
            </Grid>
          </DialogContent>
        ) : (
          <DialogContent>
            <Grid container spacing={2} mt={1}>
              {FIELD_CONFIG.map(({ name, label, type }) => (
                <Grid item xs={12} sm={6} key={name}>
                  <TextField
                    fullWidth
                    type={type || "text"}
                    label={label}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    error={!!errors[name]}
                    helperText={errors[name]}
                  />
                </Grid>
              ))}

              {/* Photo Upload */}
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center">
                  <UploadBox htmlFor="faculty-photo">
                    {formData.photo ? (
                      <img src={formData.photo} style={{ height: "100%" }} alt="Preview" />
                    ) : (
                      <>
                        <InsertPhotoIcon fontSize="large" />
                        <span>Click to upload image</span>
                      </>
                    )}
                    <input
                      type="file"
                      id="faculty-photo"
                      name="photo"
                      accept="image/*"
                      hidden
                      disabled={infoOpen}
                      onChange={handleChange}
                    />
                  </UploadBox>
                </Box>
                {errors.photo && infoOpen == false && (
                  <MDTypography variant="caption" color="error">
                    {errors.photo}
                  </MDTypography>
                )}
              </Grid>

              {OTHER_FIELDS.map(({ name, label, type, multiline, rows }) => (
                <Grid item xs={12} sm={name === "address" ? 12 : 6} key={name}>
                  <TextField
                    fullWidth
                    type={type || "text"}
                    label={label}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    error={!!errors[name]}
                    helperText={errors[name]}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        )}

        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setInfoOpen(false);
            }}
          >
            {infoOpen ? "Close" : "Cancel"}
          </Button>
          {!infoOpen && (
            <Button variant="contained" color="success" onClick={handleSubmit}>
              Save
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}

export default Faculty;
