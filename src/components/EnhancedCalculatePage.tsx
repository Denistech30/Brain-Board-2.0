import React, { useState, useEffect } from 'react';
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
  Avatar,
  LinearProgress,
  Chip,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Fade,
  Zoom,
  Alert,
  Snackbar,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Assessment as AssessmentIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
  AutoFixHigh as AutoFixHighIcon
} from '@mui/icons-material';
import BulkUpdateIcon from '@mui/icons-material/Update';
import { useTranslation } from 'react-i18next';
import { StudentMarks, SequenceResult, TermResult, AnnualResult } from '../types';
import MarksTable from './MarksTable';

interface EnhancedCalculatePageProps {
  students: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string; total: number }>;
  marks: StudentMarks[];
  selectedSequence: keyof StudentMarks;
  studentComments: {[key: number]: {[key: string]: string}};
  hasMarks: boolean;
  onSequenceChange: (sequence: keyof StudentMarks) => void;
  onMarkChange: (studentIndex: number, subject: string, value: string, maxTotal: number) => void;
  onCommentChange: (studentIndex: number, sequence: string, comment: string) => void;
  onCalculateSequenceResults: () => void;
  onCalculateTermResults: () => void;
  onOpenBulkMarksModal: () => void;
}

const EnhancedCalculatePage: React.FC<EnhancedCalculatePageProps> = ({
  students,
  subjects,
  marks,
  selectedSequence,
  studentComments,
  hasMarks,
  onSequenceChange,
  onMarkChange,
  onCommentChange,
  onCalculateSequenceResults,
  onCalculateTermResults,
  onOpenBulkMarksModal,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  
  // Enhanced state management
  const [calculating, setCalculating] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 0 });
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Calculate completion statistics
  useEffect(() => {
    if (students.length > 0 && subjects.length > 0) {
      let completed = 0;
      let total = students.length * subjects.length;
      
      students.forEach((_, studentIndex) => {
        subjects.forEach(subject => {
          const mark = marks[studentIndex]?.[selectedSequence]?.[subject.name];
          if (mark !== undefined && mark !== null && mark !== '') {
            completed++;
          }
        });
      });
      
      setCompletionStats({ completed, total });
    }
  }, [marks, selectedSequence, students, subjects]);

  // Enhanced calculation handlers
  const handleEnhancedSequenceCalculation = async () => {
    setCalculating(true);
    setActiveStep(1);
    
    // Simulate calculation progress
    setTimeout(() => {
      onCalculateSequenceResults();
      setCalculating(false);
      setShowSuccessAlert(true);
      setActiveStep(2);
    }, 1500);
  };

  const handleEnhancedTermCalculation = async () => {
    setCalculating(true);
    setActiveStep(1);
    
    // Simulate calculation progress
    setTimeout(() => {
      onCalculateTermResults();
      setCalculating(false);
      setShowSuccessAlert(true);
      setActiveStep(2);
    }, 2000);
  };

  // Auto-save simulation
  const simulateAutoSave = () => {
    setAutoSaveStatus('saving');
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 1000);
  };

  const completionPercentage = completionStats.total > 0 
    ? (completionStats.completed / completionStats.total) * 100 
    : 0;

  const getSequenceDisplayName = (sequence: keyof StudentMarks) => {
    const sequenceNames = {
      firstSequence: t('first_sequence') || 'First Sequence',
      secondSequence: t('second_sequence') || 'Second Sequence',
      thirdSequence: t('third_sequence') || 'Third Sequence',
      fourthSequence: t('fourth_sequence') || 'Fourth Sequence',
      fifthSequence: t('fifth_sequence') || 'Fifth Sequence',
      sixthSequence: t('sixth_sequence') || 'Sixth Sequence',
    };
    return sequenceNames[sequence];
  };

  const steps = [
    {
      label: t('enter_marks') || 'Enter Marks',
      description: t('input_student_marks') || 'Input student marks and comments',
    },
    {
      label: t('calculate') || 'Calculate',
      description: t('process_calculations') || 'Process calculations and generate results',
    },
    {
      label: t('view_results') || 'View Results',
      description: t('review_calculated_results') || 'Review calculated results in Results page',
    },
  ];

  return (
    <Container sx={{ pb: '120px', pt: 2 }}>
      {/* Enhanced Header Section */}
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <CalculateIcon fontSize="large" />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {t('calculate_marks') || 'Calculate Marks'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('enter_marks_and_calculate') || 'Enter student marks, add comments, and calculate results'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {autoSaveStatus === 'saving' && <CircularProgress size={20} />}
            {autoSaveStatus === 'saved' && (
              <Tooltip title={t('auto_saved') || 'Auto-saved'}>
                <CheckCircleIcon color="success" />
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Progress Statistics */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {completionStats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('marks_entered') || 'Marks Entered'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <SpeedIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {completionPercentage.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('completion_rate') || 'Completion Rate'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                  <TimelineIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {getSequenceDisplayName(selectedSequence)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('current_sequence') || 'Current Sequence'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Completion Progress Bar */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {t('overall_progress') || 'Overall Progress'}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {completionStats.completed} / {completionStats.total}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={completionPercentage} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: theme.palette.grey[200],
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: completionPercentage >= 100 
                  ? `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
                  : `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }} 
          />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Marks Entry Section - Moved to top for better UX */}
        {students.length > 0 && subjects.length > 0 && (
          <Grid item xs={12}>
            <Fade in={true}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-2px)'
                  },
                  overflowX: 'auto'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {t('marks_entry_section') || 'Marks Entry Section'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('enter_marks_and_comments_desc') || 'Enter marks and comments for each student'}
                    </Typography>
                  </Box>
                  <Chip 
                    label={`${completionPercentage.toFixed(0)}% ${t('complete') || 'Complete'}`}
                    color={completionPercentage >= 100 ? 'success' : completionPercentage >= 50 ? 'warning' : 'error'}
                    variant="outlined"
                  />
                </Box>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>{t('select_sequence') || 'Select Sequence'}</InputLabel>
                  <Select
                    value={selectedSequence}
                    label={t('select_sequence') || 'Select Sequence'}
                    onChange={(e) => {
                      onSequenceChange(e.target.value as keyof StudentMarks);
                      setActiveStep(0);
                    }}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="firstSequence">{t('first_sequence')}</MenuItem>
                    <MenuItem value="secondSequence">{t('second_sequence')}</MenuItem>
                    <MenuItem value="thirdSequence">{t('third_sequence')}</MenuItem>
                    <MenuItem value="fourthSequence">{t('fourth_sequence')}</MenuItem>
                    <MenuItem value="fifthSequence">{t('fifth_sequence')}</MenuItem>
                    <MenuItem value="sixthSequence">{t('sixth_sequence')}</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ width: '100%', overflowX: 'auto', mb: 3 }}>
                  <MarksTable
                    students={students.map(s => s.name)}
                    subjects={subjects.map(s => ({ name: s.name, total: s.total }))}
                    marks={marks}
                    selectedSequence={selectedSequence}
                    studentComments={studentComments}
                    onMarkChange={(studentIndex, subject, value, maxTotal) => {
                      onMarkChange(studentIndex, subject, value, maxTotal);
                      simulateAutoSave();
                    }}
                    onCommentChange={(studentIndex, sequence, comment) => {
                      onCommentChange(studentIndex, sequence, comment);
                      simulateAutoSave();
                    }}
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: 'center'
                }}>
                  <Zoom in={!calculating}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleEnhancedSequenceCalculation}
                      disabled={!hasMarks || calculating}
                      startIcon={calculating ? <CircularProgress size={20} /> : <CalculateIcon />}
                      sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        '&:hover': {
                          background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          transform: 'translateY(-2px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      {calculating ? (t('calculating') || 'Calculating...') : (t('calculate_sequence') || 'Calculate Sequence')}
                    </Button>
                  </Zoom>

                  <Zoom in={!calculating} style={{ transitionDelay: '100ms' }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      size="large"
                      onClick={handleEnhancedTermCalculation}
                      disabled={!hasMarks || calculating}
                      startIcon={calculating ? <CircularProgress size={20} /> : <AssessmentIcon />}
                      sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      {calculating ? (t('calculating') || 'Calculating...') : (t('calculate_terms') || 'Calculate Terms')}
                    </Button>
                  </Zoom>

                  <Zoom in={!calculating} style={{ transitionDelay: '200ms' }}>
                    <Button
                      variant="contained"
                      color="warning"
                      size="large"
                      onClick={onOpenBulkMarksModal}
                      startIcon={<BulkUpdateIcon />}
                      sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 6
                        }
                      }}
                    >
                      {t('bulk_entry') || 'Bulk Entry'}
                    </Button>
                  </Zoom>
                </Box>
              </Paper>
            </Fade>
          </Grid>
        )}

        {/* Process Stepper - Moved below marks entry */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon color="primary" />
              {t('calculation_process') || 'Calculation Process'}
            </Typography>
            <Stepper activeStep={activeStep} orientation="horizontal" sx={{ mt: 2 }}>
              {steps.map((step) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>

        {/* Empty State */}
        {(students.length === 0 || subjects.length === 0) && (
          <Grid item xs={12}>
            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 64, height: 64 }}>
                <WarningIcon fontSize="large" />
              </Avatar>
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
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => window.location.hash = '#grades'}
                startIcon={<AutoFixHighIcon />}
              >
                {t('go_to_grades') || 'Go to Grades'}
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Success Alert */}
      <Snackbar 
        open={showSuccessAlert} 
        autoHideDuration={4000} 
        onClose={() => setShowSuccessAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessAlert(false)} 
          severity="success" 
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {t('calculation_complete') || 'Calculation completed successfully! Check the Results page to view detailed results.'}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EnhancedCalculatePage;
