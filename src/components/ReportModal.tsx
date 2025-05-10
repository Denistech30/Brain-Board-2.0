import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  students: string[];
  onGenerateReport: (studentIndex: number) => void;
  onGenerateAllReports: () => void;
  selectedSequence: string;
  selectedResultView: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  open,
  onClose,
  students,
  onGenerateReport,
  onGenerateAllReports,
  selectedSequence,
  selectedResultView,
}) => {
  const { t } = useTranslation();
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<
    number | null
  >(null);

  const handleGenerateReport = () => {
    if (selectedStudentIndex !== null) {
      onGenerateReport(selectedStudentIndex);
      onClose();
      setSelectedStudentIndex(null);
    }
  };

  const handleGenerateAllReports = () => {
    onGenerateAllReports();
    onClose();
    setSelectedStudentIndex(null);
  };

  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "90%", sm: "80%", md: 600 },
    maxWidth: "100%",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: { xs: 2, sm: 4 },
    borderRadius: 2,
    maxHeight: "80vh",
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
            {t("generate_student_reports")} - {t(selectedSequence)} ({t(selectedResultView)})
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="student-select-label">
            {t("select_student")}
          </InputLabel>
          <Select
            labelId="student-select-label"
            value={selectedStudentIndex !== null ? selectedStudentIndex : ""}
            label={t("select_student")}
            onChange={(e) => setSelectedStudentIndex(Number(e.target.value))}
          >
            {students.map((student, index) => (
              <MenuItem key={index} value={index}>
                {student}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateReport}
            disabled={selectedStudentIndex === null}
          >
            {t("generate_report")}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleGenerateAllReports}
          >
            {t("generate_all_reports")}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ReportModal;