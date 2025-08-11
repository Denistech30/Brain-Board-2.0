import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  useTheme,
  Avatar
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import BulkUpdateIcon from '@mui/icons-material/Update';
import { useTranslation } from 'react-i18next';
import { StudentMarks, SequenceResult, TermResult, AnnualResult } from '../types';
import MarksTable from './MarksTable';
import ResultsTable from './ResultsTable';

interface CalculatePageProps {
  students: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string; total: number }>;
  marks: StudentMarks[];
  selectedSequence: keyof StudentMarks;
  selectedResultView: 'sequence' | 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual';
  studentComments: {[key: number]: {[key: string]: string}};
  sequenceResults: SequenceResult[];
  firstTermResults: TermResult[];
  secondTermResults: TermResult[];
  thirdTermResults: TermResult[];
  annualResults: AnnualResult[];
  sequenceClassAverage: number | null;
  firstTermClassAverage: number | null;
  secondTermClassAverage: number | null;
  thirdTermClassAverage: number | null;
  annualClassAverage: number | null;
  sequencePassPercentage: number | null;
  firstTermPassPercentage: number | null;
  secondTermPassPercentage: number | null;
  thirdTermPassPercentage: number | null;
  annualPassPercentage: number | null;
  passingMark: number;
  hasMarks: boolean;
  onSequenceChange: (sequence: keyof StudentMarks) => void;
  onResultViewChange: (view: 'sequence' | 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual') => void;
  onMarkChange: (studentIndex: number, subject: string, value: string, maxTotal: number) => void;
  onCommentChange: (studentIndex: number, sequence: string, comment: string) => void;
  onCalculateSequenceResults: () => void;
  onCalculateTermResults: () => void;
  onOpenReportModal: () => void;
  onOpenBulkMarksModal: () => void;
  onDownloadPDF: () => void;
}

const CalculatePage: React.FC<CalculatePageProps> = ({
  students,
  subjects,
  marks,
  selectedSequence,
  selectedResultView,
  studentComments,
  sequenceResults,
  firstTermResults,
  secondTermResults,
  thirdTermResults,
  annualResults,
  sequenceClassAverage,
  firstTermClassAverage,
  secondTermClassAverage,
  thirdTermClassAverage,
  annualClassAverage,
  sequencePassPercentage,
  firstTermPassPercentage,
  secondTermPassPercentage,
  thirdTermPassPercentage,
  annualPassPercentage,
  passingMark,
  hasMarks,
  onSequenceChange,
  onResultViewChange,
  onMarkChange,
  onCommentChange,
  onCalculateSequenceResults,
  onCalculateTermResults,
  onOpenReportModal,
  onOpenBulkMarksModal,
  onDownloadPDF,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Container sx={{ pb: '120px', pt: 2 }}>
      {/* Header Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}15)`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <CalculateIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {t('calculate_results') || 'Calculate Results'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('enter_marks_calculate') || 'Enter marks and calculate student results'}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Marks Entry Section */}
        {students.length > 0 && subjects.length > 0 && (
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 1.5, sm: 3 },
                borderRadius: 2,
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: 6,
                },
                overflowX: 'auto'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {t('enter_marks_comments')}
              </Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>{t('sequence')}</InputLabel>
                <Select
                  value={selectedSequence}
                  label={t('sequence')}
                  onChange={(e) => onSequenceChange(e.target.value as keyof StudentMarks)}
                >
                  <MenuItem value="firstSequence">{t('first_sequence')}</MenuItem>
                  <MenuItem value="secondSequence">{t('second_sequence')}</MenuItem>
                  <MenuItem value="thirdSequence">{t('third_sequence')}</MenuItem>
                  <MenuItem value="fourthSequence">{t('fourth_sequence')}</MenuItem>
                  <MenuItem value="fifthSequence">{t('fifth_sequence')}</MenuItem>
                  <MenuItem value="sixthSequence">{t('sixth_sequence')}</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <MarksTable
                  students={students.map(s => s.name)}
                  subjects={subjects.map(s => ({ name: s.name, total: s.total }))}
                  marks={marks}
                  selectedSequence={selectedSequence}
                  studentComments={studentComments}
                  onMarkChange={onMarkChange}
                  onCommentChange={onCommentChange}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 }, mt: 3, flexWrap: 'wrap', flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  variant="contained"
                  onClick={onCalculateSequenceResults}
                  disabled={!hasMarks}
                  startIcon={<CalculateIcon />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {t('calculate_results')}
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={onCalculateTermResults}
                  disabled={!hasMarks}
                  startIcon={<AssessmentIcon />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {t('term_results')}
                </Button>
                <Button
                  variant="contained"
                  color="info"
                  onClick={onOpenReportModal}
                  disabled={!hasMarks}
                  startIcon={<PrintIcon />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {t('student_reports')}
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={onOpenBulkMarksModal}
                  startIcon={<BulkUpdateIcon />}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {t('bulk_marks_entry')}
                </Button>
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Results Section */}
        {sequenceResults.length > 0 && (
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: { xs: 1.5, sm: 3 },
                borderRadius: 2,
                mt: 2,
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: 6,
                },
                overflowX: 'auto'
              }}
            >
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <ResultsTable
                  selectedResultView={selectedResultView}
                  onResultViewChange={onResultViewChange}
                  sequenceResults={sequenceResults}
                  firstTermResults={firstTermResults}
                  secondTermResults={secondTermResults}
                  thirdTermResults={thirdTermResults}
                  annualResults={annualResults}
                  sequenceClassAverage={sequenceClassAverage}
                  firstTermClassAverage={firstTermClassAverage}
                  secondTermClassAverage={secondTermClassAverage}
                  thirdTermClassAverage={thirdTermClassAverage}
                  annualClassAverage={annualClassAverage}
                  sequencePassPercentage={sequencePassPercentage}
                  firstTermPassPercentage={firstTermPassPercentage}
                  secondTermPassPercentage={secondTermPassPercentage}
                  thirdTermPassPercentage={thirdTermPassPercentage}
                  annualPassPercentage={annualPassPercentage}
                  passingMark={passingMark}
                  onDownloadPDF={onDownloadPDF}
                  isDownloadDisabled={false}
                />
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Empty State */}
        {(students.length === 0 || subjects.length === 0) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <CalculateIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('setup_required') || 'Setup Required'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {students.length === 0 && subjects.length === 0 
                  ? t('add_students_subjects_first') || 'Please add students and subjects first in the Grades section'
                  : students.length === 0 
                  ? t('add_students_first') || 'Please add students first in the Grades section'
                  : t('add_subjects_first') || 'Please add subjects first in the Grades section'
                }
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default CalculatePage;
