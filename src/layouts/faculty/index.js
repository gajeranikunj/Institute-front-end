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
import { fontSize, height, styled } from "@mui/system";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";

import { MdOutlineInsertPhoto } from "react-icons/md";

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
import { Link } from "react-router-dom";

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
    { Header: "Faculty", accessor: "faculty", width: "25%", align: "left" },
    { Header: "Phone", accessor: "phone", align: "center" },
    { Header: "Email", accessor: "email", align: "center" },
    { Header: "Salary", accessor: "salary", align: "center" },
    { Header: "Students", accessor: "totalStudents", align: "center" },
    { Header: "Expertise", accessor: "expertise", align: "center" },
    { Header: "Experience", accessor: "experienceYears", align: "center" },
    { Header: "Status", accessor: "status", align: "center" },
    { Header: "Actions", accessor: "actions", align: "center" }, // 👈 added
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
    const facultyData = row.originalData;

    // Double click opens details
    const clickHandler = () => handleDoubleClick(facultyData);

    return {
      ...row,

      // Salary styled
      salary: (
        <span style={{ fontWeight: 500, color: "#16a34a" }}>
          ₹{facultyData.salary.toLocaleString()}
        </span>
      ),

      // Experience styled
      experienceYears: <span style={{ fontWeight: 500 }}>{facultyData.experienceYears} yrs</span>,

      // Faculty column with avatar + name
      faculty: (
        <div
          onDoubleClick={clickHandler}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
            padding: "6px 8px",
            borderRadius: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f3f4f6")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Avatar src={facultyData.photo} alt={facultyData.name} sx={{ width: 40, height: 40 }} />
          <span style={{ fontWeight: 600, color: "#111827" }}>{facultyData.name}</span>
        </div>
      ),

      // Phone
      phone: (
        <Link
          href={`tel:${facultyData.phone}`} // 👈 tel link
          underline="hover"
          style={{ cursor: "pointer", fontWeight: 500, color: "#2563eb" }}
          onDoubleClick={clickHandler}
        >
          {facultyData.phone}
        </Link>
      ),

      // Email
      email: (
        <div
          style={{
            cursor: "pointer",
            color: "#2563eb",
            fontWeight: 500,
          }}
          onDoubleClick={clickHandler}
        >
          {facultyData.email}
        </div>
      ),

      // Total Students
      totalStudents: (
        <div style={{ cursor: "pointer", fontWeight: 500 }} onDoubleClick={clickHandler}>
          👥 {facultyData.totalStudents}
        </div>
      ),

      // Expertise
      expertise: (
        <div
          style={{
            cursor: "pointer",
            fontSize: "14px",
            color: "#374151",
          }}
          onDoubleClick={clickHandler}
        >
          {facultyData.expertise.join(", ")}
        </div>
      ),

      // Actions column
      actions: (
        <Box display="flex" gap={1} justifyContent="center">
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={() => handleDoubleClick(facultyData)}
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => console.log("Delete", facultyData._id)} // 👈 replace with delete API
          >
            Delete
          </Button>
        </Box>
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
            <Grid container spacing={3} mt={0}>
              {/* Profile Image */}
              <Grid
                item
                xs={12}
                p={0}
                width={100}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <img
                  src={formData.photo}
                  alt="Profile"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    padding: "0px",
                    boxShadow: "0px 4px 12px rgba(0,0,0,0.2)", // subtle shadow
                  }}
                />
              </Grid>

              {/* Info Section */}
              <Grid container spacing={2} px={2}>
                {[
                  { name: "name", label: "Full Name" },
                  { name: "email", label: "Email" },
                  // { name: "password", label: "Password" },
                  { name: "salary", label: "Salary" },
                  { name: "totalStudents", label: "Total Students" },
                  { name: "expertise", label: "Expertise" },
                  { name: "experienceYears", label: "Experience Years" },
                  { name: "address", label: "Address" },
                ].map(({ name, label }) => (
                  <Grid item xs={name === "address" ? 12 : 6} key={name}>
                    <div style={{ fontWeight: 600, color: "#555", marginBottom: "4px" }}>
                      {label}
                    </div>
                    <div
                      style={{
                        color: "#222",
                        padding: "8px 12px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        background: "#fafafa",
                      }}
                    >
                      {formData[name] || "-"}
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </DialogContent>
        ) : (
          <DialogContent>
            <Grid container spacing={3} mt={0}>
              {/* Profile Image Upload OR Preview */}
              <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
                {infoOpen ? (
                  // --- View Mode (Readonly image preview)
                  <img
                    src={formData.photo}
                    alt="Profile"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      boxShadow: "0px 4px 12px rgba(0,0,0,0.2)",
                    }}
                  />
                ) : (
                  // --- Edit Mode (Upload image)
                  <UploadBox
                    htmlFor="faculty-photo"
                    sx={{
                      mb: "10px",
                      width: "140px",
                      height: "140px",
                      borderRadius: "50%",
                      border: "2px dashed #ccc",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      overflow: "hidden",
                      backgroundColor: "#f9fafb",
                      position: "relative",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: "#4f46e5",
                        backgroundColor: "#eef2ff",
                        transform: "scale(1.05)",
                        boxShadow: "0px 4px 15px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {formData.photo ? (
                      <img
                        src={formData.photo}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "50%",
                          objectFit: "cover",
                          transition: "0.3s ease",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          flexDirection: "column",
                          padding: "10px",
                          textAlign: "center",
                          color: "#6b7280",
                        }}
                      >
                        <MdOutlineInsertPhoto
                          style={{
                            fontSize: "40px",
                            color: "#9ca3af",
                          }}
                        />
                        <span style={{ fontSize: "14px", fontWeight: 500 }}>Click to upload</span>
                      </Box>
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
                )}
              </Grid>

              {/* Info Section */}
              <Grid container spacing={2} px={2}>
                {[
                  { name: "name", label: "Full Name" },
                  { name: "email", label: "Email" },
                  { name: "password", label: "Password", hideInView: true },
                  { name: "salary", label: "Salary" },
                  { name: "totalStudents", label: "Total Students" },
                  { name: "expertise", label: "Expertise" },
                  { name: "experienceYears", label: "Experience Years" },
                  { name: "address", label: "Address" },
                ].map(({ name, label, hideInView }) =>
                  infoOpen ? (
                    // --- View Mode (Readonly boxes)
                    !hideInView && (
                      <Grid item xs={name === "address" ? 12 : 6} key={name}>
                        <div style={{ fontWeight: 600, color: "#555", marginBottom: "4px" }}>
                          {label}
                        </div>
                        <div
                          style={{
                            color: "#222",
                            padding: "8px 12px",
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            background: "#fafafa",
                          }}
                        >
                          {formData[name] || "-"}
                        </div>
                      </Grid>
                    )
                  ) : (
                    // --- Edit Mode (TextFields)
                    <Grid item xs={12} sm={name === "address" ? 12 : 6} key={name}>
                      <TextField
                        fullWidth
                        type="text"
                        label={label}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        error={!!errors[name]}
                        helperText={errors[name]}
                        multiline={name === "address"}
                        rows={name === "address" ? 3 : 1}
                      />
                    </Grid>
                  )
                )}
              </Grid>
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
