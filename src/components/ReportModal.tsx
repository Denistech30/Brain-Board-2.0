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
  // Optional: enable choosing which term/annual to generate
  enableTermChoice?: boolean;
  onChangeResultView?: (view: 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual') => void;
}

const ReportModal: React.FC<ReportModalProps> = ({
  open,
  onClose,
  students,
  onGenerateReport,
  onGenerateAllReports,
  selectedSequence,
  selectedResultView,
  enableTermChoice,
  onChangeResultView,
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
            {t("generate_student_reports")} - {t(selectedSequence)} ({t(selectedResultView)})
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {enableTermChoice && (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="term-select-label">{t('select_term') || 'Select term'}</InputLabel>
            <Select
              labelId="term-select-label"
              value={selectedResultView}
              label={t('select_term') || 'Select term'}
              onChange={(e) => onChangeResultView && onChangeResultView(e.target.value as any)}
            >
              <MenuItem value="firstTerm">{t('firstTerm') || 'First Term'}</MenuItem>
              <MenuItem value="secondTerm">{t('secondTerm') || 'Second Term'}</MenuItem>
              <MenuItem value="thirdTerm">{t('thirdTerm') || 'Third Term'}</MenuItem>
              <MenuItem value="annual">{t('annual') || 'Annual'}</MenuItem>
            </Select>
          </FormControl>
        )}
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