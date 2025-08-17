import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Button,
  Avatar,
  Stack,
  Tooltip,
  FormHelperText,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

interface StudentModalProps {
  open: boolean;
  onClose: () => void;
  students: string[];
  onAddStudent: (name: string, file?: File) => void;
  onEditStudent: (index: number, name: string, file?: File) => void;
  onDeleteStudent: (index: number) => void;
  studentImageUrls?: (string | undefined)[];
}

const StudentModal: React.FC<StudentModalProps> = ({
  open,
  onClose,
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  studentImageUrls,
}) => {
  const { t } = useTranslation();
  const [newStudentName, setNewStudentName] = useState<string>("");
  const [newStudentFile, setNewStudentFile] = useState<File | undefined>(undefined);
  const [newFileError, setNewFileError] = useState<string>("");
  const [editStudentIndex, setEditStudentIndex] = useState<number | null>(null);
  const [editStudentValue, setEditStudentValue] = useState<string>("");
  const [editStudentFile, setEditStudentFile] = useState<File | undefined>(undefined);
  const [editFileError, setEditFileError] = useState<string>("");

  const maxSize = 2 * 1024 * 1024; // 2MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  const validateFile = (file?: File) => {
    if (!file) return "";
    if (!allowedTypes.includes(file.type)) return "Only JPG, PNG, or WEBP allowed";
    if (file.size > maxSize) return "Max size 2MB";
    return "";
  };

  const handleNewFileChange = (file?: File) => {
    const err = validateFile(file);
    setNewFileError(err);
    if (!err) setNewStudentFile(file);
  };

  const handleEditFileChange = (file?: File) => {
    const err = validateFile(file);
    setEditFileError(err);
    if (!err) setEditStudentFile(file);
  };

  const handleAddStudent = () => {
    if (newStudentName.trim() === "") return;
    if (newFileError) return;
    onAddStudent(newStudentName.trim(), newStudentFile);
    setNewStudentName("");
    setNewStudentFile(undefined);
    setNewFileError("");
  };

  const handleEditStudent = (index: number) => {
    setEditStudentIndex(index);
    setEditStudentValue(students[index]);
  };

  const handleSaveStudentEdit = () => {
    if (editStudentIndex === null || editStudentValue.trim() === "") return;
    if (editFileError) return;
    onEditStudent(editStudentIndex, editStudentValue.trim(), editStudentFile);
    setEditStudentIndex(null);
    setEditStudentValue("");
    setEditStudentFile(undefined);
    setEditFileError("");
  };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "100vw", sm: "80vw", md: 600 },
    maxWidth: "100vw",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: { xs: 1, sm: 4 },
    borderRadius: { xs: 0, sm: 2 },
    maxHeight: { xs: '100vh', sm: '80vh' },
    height: { xs: '100vh', sm: 'auto' },
    overflowY: "auto" as const,
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
          >
            {t("student_list")}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Table
          sx={{
            "& th, & td": {
              padding: { xs: "4px", sm: "8px" },
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>{t("name")}</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student, index) => (
              <TableRow key={index}>
                <TableCell>
                  {editStudentIndex === index ? (
                    <TextField
                      value={editStudentValue}
                      onChange={(e) => setEditStudentValue(e.target.value)}
                      size="small"
                      onBlur={handleSaveStudentEdit}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") handleSaveStudentEdit();
                      }}
                      autoFocus
                      sx={{ width: { xs: "100%", sm: "200px" } }}
                    />
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Avatar sx={{ width: 28, height: 28 }} src={studentImageUrls?.[index]} />
                      <span>{student}</span>
                    </Stack>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    {editStudentIndex === index && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <input
                          id={`edit-file-${index}`}
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => handleEditFileChange(e.target.files?.[0])}
                        />
                        <Tooltip title="Upload image (JPG/PNG/WEBP, max 2MB)">
                          <label htmlFor={`edit-file-${index}`}>
                            <Button variant="outlined" component="span" size="small">
                              {t("upload") || "Upload"}
                            </Button>
                          </label>
                        </Tooltip>
                        <Avatar
                          sx={{ width: 36, height: 36 }}
                          src={editStudentFile ? URL.createObjectURL(editStudentFile) : (studentImageUrls?.[index] || undefined)}
                          alt="preview"
                        />
                        {editFileError && (
                          <FormHelperText error sx={{ ml: 1 }}>{editFileError}</FormHelperText>
                        )}
                      </Stack>
                    )}
                    {editStudentIndex === index ? (
                      <IconButton onClick={handleSaveStudentEdit}>
                        <SaveIcon color="success" fontSize="small" />
                      </IconButton>
                    ) : (
                      <IconButton onClick={() => handleEditStudent(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton onClick={() => onDeleteStudent(index)}>
                      <DeleteIcon color="error" fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <TextField
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder={t("enter_student_name")}
                    size="small"
                    sx={{ width: { xs: "100%", sm: "200px" } }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleAddStudent();
                    }}
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <input
                      id="add-file"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => handleNewFileChange(e.target.files?.[0])}
                    />
                    <Tooltip title="Upload image (JPG/PNG/WEBP, max 2MB)">
                      <label htmlFor="add-file">
                        <Button variant="outlined" component="span" size="small">
                          {t("upload") || "Upload"}
                        </Button>
                      </label>
                    </Tooltip>
                    <Avatar
                      sx={{ width: 36, height: 36 }}
                      src={newStudentFile ? URL.createObjectURL(newStudentFile) : undefined}
                      alt="preview"
                    />
                    {newFileError && (
                      <FormHelperText error sx={{ ml: 1 }}>{newFileError}</FormHelperText>
                    )}
                  </Stack>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddStudent}
                    disabled={newStudentName.trim() === ""}
                    startIcon={<AddIcon />}
                  >
                    {t("add")}
                  </Button>
                </Box>
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Modal>
  );
};

export default StudentModal;