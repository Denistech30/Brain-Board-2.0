import React, { useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  useTheme,
  Avatar,
  Card,
  CardContent,
  Button,
  Chip,
  Fade,
  Zoom,
  Divider,
  IconButton,
  Tooltip,
  CardActionArea,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Timeline as TimelineIcon,
  DateRange as DateRangeIcon,
  PieChart as PieChartIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { SequenceResult, TermResult, AnnualResult } from '../types';

interface EnhancedResultsPageProps {
  selectedResultView: 'sequence' | 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual';
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
  onResultViewChange: (view: 'sequence' | 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual') => void;
  onDownloadPDF: () => void;
}

const EnhancedResultsPage: React.FC<EnhancedResultsPageProps> = ({
  selectedResultView,
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
  onResultViewChange,
  onDownloadPDF,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [viewMode, setViewMode] = useState<'selection' | 'fullpage-results'>('selection');
  const [selectedFeature, setSelectedFeature] = useState<'sequence' | 'terms' | null>(null);
  const [sequenceExpanded, setSequenceExpanded] = useState(false);
  const [termsExpanded, setTermsExpanded] = useState(false);
  const [fullPageResultType, setFullPageResultType] = useState<'sequence' | 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual' | null>(null);

  // Define available sequences and terms
  const sequences = [
    { key: 'sequence', label: t('sequence_results') || 'Sequence Results', results: sequenceResults, average: sequenceClassAverage, passRate: sequencePassPercentage },
  ];

  const terms = [
    { key: 'firstTerm', label: t('first_term_results') || 'First Term Results', results: firstTermResults, average: firstTermClassAverage, passRate: firstTermPassPercentage },
    { key: 'secondTerm', label: t('second_term_results') || 'Second Term Results', results: secondTermResults, average: secondTermClassAverage, passRate: secondTermPassPercentage },
    { key: 'thirdTerm', label: t('third_term_results') || 'Third Term Results', results: thirdTermResults, average: thirdTermClassAverage, passRate: thirdTermPassPercentage },
    { key: 'annual', label: t('annual_results') || 'Annual Results', results: annualResults, average: annualClassAverage, passRate: annualPassPercentage },
  ];

  // Handle selection - Switch to full page view
  const handleResultSelection = (resultType: 'sequence' | 'firstTerm' | 'secondTerm' | 'thirdTerm' | 'annual') => {
    onResultViewChange(resultType);
    setFullPageResultType(resultType);
    setViewMode('fullpage-results');
  };

  const handleBackToSelection = () => {
    setViewMode('selection');
    setFullPageResultType(null);
    setSelectedFeature(null);
    setSequenceExpanded(false);
    setTermsExpanded(false);
  };

  // Get current results based on full page type
  const getCurrentResults = () => {
    switch (fullPageResultType) {
      case 'sequence': return sequenceResults;
      case 'firstTerm': return firstTermResults;
      case 'secondTerm': return secondTermResults;
      case 'thirdTerm': return thirdTermResults;
      case 'annual': return annualResults;
      default: return sequenceResults;
    }
  };

  const getCurrentAverage = () => {
    switch (fullPageResultType) {
      case 'sequence': return sequenceClassAverage;
      case 'firstTerm': return firstTermClassAverage;
      case 'secondTerm': return secondTermClassAverage;
      case 'thirdTerm': return thirdTermClassAverage;
      case 'annual': return annualClassAverage;
      default: return sequenceClassAverage;
    }
  };

  const getCurrentPassPercentage = () => {
    switch (fullPageResultType) {
      case 'sequence': return sequencePassPercentage;
      case 'firstTerm': return firstTermPassPercentage;
      case 'secondTerm': return secondTermPassPercentage;
      case 'thirdTerm': return thirdTermPassPercentage;
      case 'annual': return annualPassPercentage;
      default: return sequencePassPercentage;
    }
  };

  const getViewDisplayName = (view: string) => {
    switch (view) {
      case 'sequence': return t('sequence_results') || 'Sequence Results';
      case 'firstTerm': return t('first_term_results') || 'First Term Results';
      case 'secondTerm': return t('second_term_results') || 'Second Term Results';
      case 'thirdTerm': return t('third_term_results') || 'Third Term Results';
      case 'annual': return t('annual_results') || 'Annual Results';
      default: return view;
    }
  };

  const currentResults = getCurrentResults();
  const currentAverage = getCurrentAverage();
  const currentPassPercentage = getCurrentPassPercentage();
  const hasResults = currentResults.length > 0;

  // Calculate additional statistics
  const topPerformer = hasResults ? currentResults[0] : null;
  const totalStudents = currentResults.length;
  const passedStudents = currentResults.filter(result => {
    if ('average' in result) {
      return result.average >= passingMark;
    } else if ('finalAverage' in result) {
      return result.finalAverage >= passingMark;
    }
    return false;
  }).length;

  // Full Page Results View
  if (viewMode === 'fullpage-results') {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        p: 2
      }}>
        {/* Header with Back Button and Download */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2,
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={handleBackToSelection}
              sx={{ 
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold" color="primary">
              {getViewDisplayName(fullPageResultType || '')}
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            onClick={onDownloadPDF}
            startIcon={<DownloadIcon />}
            sx={{ 
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {t('download_pdf') || 'Download PDF'}
          </Button>
        </Box>

        {/* Full Width Results Table */}
        <Paper sx={{ 
          width: '100%', 
          overflow: 'hidden',
          borderRadius: 2,
          boxShadow: 2
        }}>
          <TableContainer sx={{ 
            maxHeight: 'calc(100vh - 140px)',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              background: theme.palette.primary.main,
              borderRadius: '3px',
            },
          }}>
            <Table stickyHeader size="small" sx={{
              width: '100%',
              '& .MuiTableHead-root': {
                '& .MuiTableCell-root': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '0.65rem',
                  padding: '6px 8px',
                  borderBottom: 'none',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2
                }
              },
              '& .MuiTableBody-root': {
                '& .MuiTableRow-root': {
                  '&:nth-of-type(even)': {
                    bgcolor: '#f8f9fa',
                  },
                  '&:hover': {
                    bgcolor: theme.palette.action.hover,
                  },
                },
                '& .MuiTableCell-root': {
                  padding: '4px 8px',
                  fontSize: '0.6rem',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  whiteSpace: 'nowrap',
                  lineHeight: 1.2,
                  '& .MuiChip-root': {
                    fontSize: '0.55rem',
                    height: '18px',
                    '& .MuiChip-label': {
                      padding: '0 4px'
                    }
                  }
                }
              }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ width: '50px' }}>
                    {t('rank') || 'Rank'}
                  </TableCell>
                  <TableCell sx={{ minWidth: 120 }}>
                    {t('student') || 'Student'}
                  </TableCell>
                  
                  {fullPageResultType === 'sequence' && (
                    <>
                      <TableCell align="center" sx={{ width: '80px' }}>
                        {t('total_marks') || 'Total'}
                      </TableCell>
                      <TableCell align="center" sx={{ width: '60px' }}>
                        {t('average') || 'Avg'}
                      </TableCell>
                    </>
                  )}
                  
                  {(fullPageResultType === 'firstTerm' || fullPageResultType === 'secondTerm' || fullPageResultType === 'thirdTerm') && (
                    <>
                      <TableCell align="center" sx={{ width: '80px' }}>
                        {t('total_marks') || 'Total'}
                      </TableCell>
                      <TableCell align="center" sx={{ width: '60px' }}>
                        {t('average') || 'Avg'}
                      </TableCell>
                    </>
                  )}
                  
                  {fullPageResultType === 'annual' && (
                    <>
                      <TableCell align="center" sx={{ width: '60px' }}>
                        {t('first_term') || '1st'}
                      </TableCell>
                      <TableCell align="center" sx={{ width: '60px' }}>
                        {t('second_term') || '2nd'}
                      </TableCell>
                      <TableCell align="center" sx={{ width: '60px' }}>
                        {t('third_term') || '3rd'}
                      </TableCell>
                      <TableCell align="center" sx={{ width: '70px' }}>
                        {t('final_average') || 'Final'}
                      </TableCell>
                    </>
                  )}
                  
                  <TableCell align="center" sx={{ width: '60px' }}>
                    {t('status') || 'Status'}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentResults().map((result: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell align="center">
                      <Chip 
                        label={result.rank || index + 1}
                        color={index < 3 ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'medium' }}>
                      {result.student}
                    </TableCell>
                    
                    {fullPageResultType === 'sequence' && (
                      <>
                        <TableCell align="center">
                          {result.totalMarks}
                        </TableCell>
                        <TableCell align="center">
                          {result.average?.toFixed(1)}
                        </TableCell>
                      </>
                    )}
                    
                    {(fullPageResultType === 'firstTerm' || fullPageResultType === 'secondTerm' || fullPageResultType === 'thirdTerm') && (
                      <>
                        <TableCell align="center">
                          {result.totalMarks}
                        </TableCell>
                        <TableCell align="center">
                          {result.average?.toFixed(1)}
                        </TableCell>
                      </>
                    )}
                    
                    {fullPageResultType === 'annual' && (
                      <>
                        <TableCell align="center">
                          {result.firstTermAverage?.toFixed(1)}
                        </TableCell>
                        <TableCell align="center">
                          {result.secondTermAverage?.toFixed(1)}
                        </TableCell>
                        <TableCell align="center">
                          {result.thirdTermAverage?.toFixed(1)}
                        </TableCell>
                        <TableCell align="center">
                          {result.finalAverage?.toFixed(1)}
                        </TableCell>
                      </>
                    )}
                    
                    <TableCell align="center">
                      <Chip
                        label={(
                          fullPageResultType === 'annual' 
                            ? result.finalAverage >= passingMark 
                            : result.average >= passingMark
                        ) ? t('pass') || 'PASS' : t('fail') || 'FAIL'}
                        color={(
                          fullPageResultType === 'annual' 
                            ? result.finalAverage >= passingMark 
                            : result.average >= passingMark
                        ) ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Statistics Info Section */}
        <Paper sx={{ 
          mt: 3,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: 3
        }}>
          <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom sx={{ mb: 3 }}>
            📊 {t('class_statistics') || 'Class Statistics'}
          </Typography>
          
          <Grid container spacing={3}>
            {/* Class Average */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}10, ${theme.palette.primary.light}15)`,
                border: `1px solid ${theme.palette.primary.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${theme.palette.primary.main}20`
                }
              }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  mx: 'auto', 
                  mb: 1.5, 
                  width: 48, 
                  height: 48,
                  boxShadow: 2
                }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ mb: 0.5 }}>
                  {getCurrentAverage()?.toFixed(1) || '0.0'}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  {t('class_average') || 'Class Average'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {getCurrentAverage() && getCurrentAverage()! >= 50 ? '🎯 Above Passing' : '⚠️ Below Passing'}
                </Typography>
              </Box>
            </Grid>

            {/* Pass Rate */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main}10, ${theme.palette.success.light}15)`,
                border: `1px solid ${theme.palette.success.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${theme.palette.success.main}20`
                }
              }}>
                <Avatar sx={{ 
                  bgcolor: 'success.main', 
                  mx: 'auto', 
                  mb: 1.5, 
                  width: 48, 
                  height: 48,
                  boxShadow: 2
                }}>
                  <CheckCircleIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ mb: 0.5 }}>
                  {getCurrentPassPercentage()?.toFixed(0) || '0'}%
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  {t('pass_rate') || 'Pass Rate'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {passedStudents} of {totalStudents} passed
                </Typography>
              </Box>
            </Grid>

            {/* Total Students */}
            <Grid item xs={12} sm={4}>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.info.main}10, ${theme.palette.info.light}15)`,
                border: `1px solid ${theme.palette.info.main}20`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${theme.palette.info.main}20`
                }
              }}>
                <Avatar sx={{ 
                  bgcolor: 'info.main', 
                  mx: 'auto', 
                  mb: 1.5, 
                  width: 48, 
                  height: 48,
                  boxShadow: 2
                }}>
                  <SchoolIcon />
                </Avatar>
                <Typography variant="h4" fontWeight="bold" color="info.main" sx={{ mb: 0.5 }}>
                  {totalStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  {t('total_students') || 'Total Students'}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {topPerformer ? `🏆 Top: ${topPerformer.student}` : '📊 Enrolled'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Additional Insights */}
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'grey.50',
            border: `1px solid ${theme.palette.divider}`
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              💡 <strong>Quick Insight:</strong> 
              {getCurrentPassPercentage() && getCurrentPassPercentage()! >= 80 
                ? 'Excellent class performance! Most students are excelling.' 
                : getCurrentPassPercentage() && getCurrentPassPercentage()! >= 60
                ? 'Good class performance with room for improvement.'
                : 'Class needs additional support to improve overall performance.'
              }
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Selection View
  return (
    <Container sx={{ pb: '120px', pt: 2 }}>
      {/* Enhanced Header Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.info.main}15, ${theme.palette.success.main}15)`,
          border: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
            <AssessmentIcon fontSize="large" />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" fontWeight="bold" color="info.main">
              {t('results_analytics') || 'Results & Analytics'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('view_analyze_results') || 'View and analyze calculated student results with advanced insights'}
            </Typography>
          </Box>
        </Box>

        {/* Navigation Breadcrumb */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, alignItems: 'center' }}>
          {(viewMode as string) === 'fullpage-results' && (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={handleBackToSelection}
                sx={{ borderRadius: 2 }}
              >
                ← {t('back_to_selection') || 'Back to Selection'}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mx: 1 }}>
                / {getViewDisplayName(selectedResultView)}
              </Typography>
            </>
          )}
        </Box>

        {/* Quick Statistics */}
        {viewMode === 'selection' && (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" color="success.main">
                    {currentAverage?.toFixed(1) || '0.0'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('class_average') || 'Class Average'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                    <PieChartIcon />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" color="info.main">
                    {currentPassPercentage?.toFixed(0) || '0'}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('pass_rate') || 'Pass Rate'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                    <VisibilityIcon />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" color="warning.main">
                    {passedStudents}/{totalStudents}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('passed_students') || 'Passed Students'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.main', mx: 'auto', mb: 1, width: 40, height: 40 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" color="error.main">
                    {topPerformer?.rank || '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('top_rank') || 'Top Rank'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>

      {/* Main Content - Selection Mode Only */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Zoom in={true}>
            <Card 
              elevation={4}
              sx={{ 
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  boxShadow: 8, 
                  transform: 'translateY(-4px)' 
                },
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.primary.dark}15)`,
                border: `1px solid ${theme.palette.primary.main}30`
              }}
            >
              <CardActionArea onClick={() => setSequenceExpanded(!sequenceExpanded)}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 64, height: 64 }}>
                    <TimelineIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                    {t('sequence_feature') || 'Sequence'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {t('view_sequence_results') || 'View results for individual sequences'}
                  </Typography>
                  <Chip 
                    label={sequences.filter(s => s.results.length > 0).length + ' ' + (t('available') || 'Available')}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                  <Box sx={{ mt: 2 }}>
                    {sequenceExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                </CardContent>
              </CardActionArea>
              
              <Collapse in={sequenceExpanded} timeout="auto" unmountOnExit>
                <Divider />
                <List sx={{ px: 2, pb: 2 }}>
                  {sequences.map((seq) => (
                    <ListItemButton
                      key={seq.key}
                      onClick={() => handleResultSelection(seq.key as any)}
                      disabled={seq.results.length === 0}
                      sx={{ 
                        borderRadius: 2, 
                        mb: 1,
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                      }}
                    >
                      <ListItemIcon>
                        {seq.results.length > 0 ? 
                          <CheckCircleIcon color="success" /> : 
                          <RadioButtonUncheckedIcon color="disabled" />
                        }
                      </ListItemIcon>
                      <ListItemText 
                        primary={seq.label}
                        secondary={seq.results.length > 0 ? 
                          `${seq.results.length} students • Avg: ${seq.average?.toFixed(1) || 'N/A'}` :
                          t('no_data_available') || 'No data available'
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Card>
          </Zoom>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Zoom in={true} style={{ transitionDelay: '200ms' }}>
            <Card 
              elevation={4}
              sx={{ 
                borderRadius: 3,
                transition: 'all 0.3s ease-in-out',
                '&:hover': { 
                  boxShadow: 8, 
                  transform: 'translateY(-4px)' 
                },
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}15, ${theme.palette.secondary.dark}15)`,
                border: `1px solid ${theme.palette.secondary.main}30`
              }}
            >
              <CardActionArea onClick={() => setTermsExpanded(!termsExpanded)}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2, width: 64, height: 64 }}>
                    <DateRangeIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" color="secondary" gutterBottom>
                    {t('terms_feature') || 'Terms'}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    {t('view_term_results') || 'View results for terms and annual averages'}
                  </Typography>
                  <Chip 
                    label={terms.filter(t => t.results.length > 0).length + ' ' + (t('available') || 'Available')}
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                  <Box sx={{ mt: 2 }}>
                    {termsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </Box>
                </CardContent>
              </CardActionArea>
              
              <Collapse in={termsExpanded} timeout="auto" unmountOnExit>
                <Divider />
                <List sx={{ px: 2, pb: 2 }}>
                  {terms.map((term) => (
                    <ListItemButton
                      key={term.key}
                      onClick={() => handleResultSelection(term.key as any)}
                      disabled={term.results.length === 0}
                      sx={{ 
                        borderRadius: 2, 
                        mb: 1,
                        '&:hover': { bgcolor: 'secondary.main', color: 'white' }
                      }}
                    >
                      <ListItemIcon>
                        {term.results.length > 0 ? 
                          <CheckCircleIcon color="success" /> : 
                          <RadioButtonUncheckedIcon color="disabled" />
                        }
                      </ListItemIcon>
                      <ListItemText 
                        primary={term.label}
                        secondary={term.results.length > 0 ? 
                          `${term.results.length} students • Avg: ${term.average?.toFixed(1) || 'N/A'}` :
                          t('no_data_available') || 'No data available'
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </Card>
          </Zoom>
        </Grid>

        {/* No Results Message */}
        {!hasResults && (
          <Grid item xs={12}>
            <Paper 
              elevation={2}
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.grey[100]}, ${theme.palette.grey[200]})`
              }}
            >
              <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 64, height: 64 }}>
                <PieChartIcon fontSize="large" />
              </Avatar>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {t('no_results_available') || 'No Results Available'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                {t('calculate_results_first') || 'Please calculate results first to view analytics and insights.'}
              </Typography>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => window.location.hash = '#calculate'}
                startIcon={<AssessmentIcon />}
              >
                {t('go_to_calculate') || 'Go to Calculate'}
              </Button>
            </Paper>
          </Grid>
        )}
      </Grid>


    </Container>
  );
};

export default EnhancedResultsPage;
