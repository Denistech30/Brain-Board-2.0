import React, { useState } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Fab,
  Avatar,
  Chip,
  IconButton,
  Paper,
  LinearProgress,
  Divider,
  Badge,
  Tooltip,
  Zoom,
  Fade
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Book as BookIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';

interface GradesPageProps {
  students: Array<{ id: string; name: string; imageUrl?: string }>;
  subjects: Array<{ id: string; name: string; total: number }>;
  onAddStudent: (name: string) => void;
  onEditStudent: (index: number, name: string) => void;
  onDeleteStudent: (index: number) => void;
  onAddSubject: (name: string, total: number) => void;
  onEditSubject: (index: number, name: string, total: number) => void;
  onDeleteSubject: (index: number) => void;
  onOpenStudentModal: () => void;
  onOpenSubjectModal: () => void;
}

const GradesPage: React.FC<GradesPageProps> = ({
  students,
  subjects,
  onOpenStudentModal,
  onOpenSubjectModal,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState<'students' | 'subjects'>('students');

  // Calculate statistics
  const totalStudents = students.length;
  const totalSubjects = subjects.length;
  const averageSubjectTotal = subjects.length > 0 
    ? (subjects.reduce((sum, subject) => sum + subject.total, 0) / subjects.length).toFixed(1)
    : '0';

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const getRandomColor = (index: number) => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'info', 'error'];
    return colors[index % colors.length];
  };

  return (
    <Container sx={{ pb: '120px', pt: 2 }}>
      {/* Header Section with Statistics */}
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
            <SchoolIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
              {t('grades_management') || 'Grades Management'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('manage_students_subjects') || 'Manage your students and subjects efficiently'}
            </Typography>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                  <PersonIcon />
                </Avatar>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {totalStudents}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('total_students') || 'Total Students'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                  <BookIcon />
                </Avatar>
                <Typography variant="h3" fontWeight="bold" color="secondary">
                  {totalSubjects}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('total_subjects') || 'Total Subjects'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
              <CardContent sx={{ textAlign: 'center', py: 3 }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 48, height: 48 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Typography variant="h3" fontWeight="bold" sx={{ color: 'success.main' }}>
                  {averageSubjectTotal}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('avg_subject_total') || 'Avg Subject Total'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* Tab Navigation */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <Chip
          label={`${t('students')} (${totalStudents})`}
          onClick={() => setSelectedTab('students')}
          color={selectedTab === 'students' ? 'primary' : 'default'}
          variant={selectedTab === 'students' ? 'filled' : 'outlined'}
          icon={<PersonIcon />}
          sx={{ 
            px: 2, 
            py: 1, 
            fontSize: '1rem',
            '&:hover': { boxShadow: 2 }
          }}
        />
        <Chip
          label={`${t('subjects')} (${totalSubjects})`}
          onClick={() => setSelectedTab('subjects')}
          color={selectedTab === 'subjects' ? 'secondary' : 'default'}
          variant={selectedTab === 'subjects' ? 'filled' : 'outlined'}
          icon={<BookIcon />}
          sx={{ 
            px: 2, 
            py: 1, 
            fontSize: '1rem',
            '&:hover': { boxShadow: 2 }
          }}
        />
      </Box>

      {/* Students Section */}
      {selectedTab === 'students' && (
        <Fade in={selectedTab === 'students'}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                {t('students_list') || 'Students List'}
              </Typography>
              <Badge badgeContent={totalStudents} color="primary">
                <PersonIcon color="primary" />
              </Badge>
            </Box>

            {students.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('no_students_yet') || 'No students added yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('add_first_student') || 'Add your first student to get started'}
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {students.map((student, index) => (
                  <Grid item xs={12} sm={6} md={4} key={student.id}>
                    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                      <Card 
                        sx={{ 
                          borderRadius: 3, 
                          boxShadow: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            boxShadow: 6, 
                            transform: 'translateY(-4px)' 
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar 
                              src={student.imageUrl}
                              sx={{ 
                                bgcolor: `${getRandomColor(index)}.main`,
                                width: 48,
                                height: 48,
                                fontSize: '1.2rem',
                                fontWeight: 'bold'
                              }}
                            >
                              {getInitials(student.name)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight="bold" noWrap>
                                {student.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('student_id')}: {student.id.slice(-6)}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              size="small" 
                              label={t('active') || 'Active'} 
                              color="success" 
                              variant="outlined"
                            />
                            <Box>
                              <Tooltip title={t('view_details') || 'View Details'}>
                                <IconButton size="small" color="primary">
                                  <StarIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Fade>
      )}

      {/* Subjects Section */}
      {selectedTab === 'subjects' && (
        <Fade in={selectedTab === 'subjects'}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight="bold">
                {t('subjects_list') || 'Subjects List'}
              </Typography>
              <Badge badgeContent={totalSubjects} color="secondary">
                <BookIcon color="secondary" />
              </Badge>
            </Box>

            {subjects.length === 0 ? (
              <Card sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
                <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('no_subjects_yet') || 'No subjects added yet'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {t('add_first_subject') || 'Add your first subject to get started'}
                </Typography>
              </Card>
            ) : (
              <Grid container spacing={2}>
                {subjects.map((subject, index) => (
                  <Grid item xs={12} sm={6} md={4} key={subject.id}>
                    <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                      <Card 
                        sx={{ 
                          borderRadius: 3, 
                          boxShadow: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            boxShadow: 6, 
                            transform: 'translateY(-4px)' 
                          }
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: `${getRandomColor(index + 3)}.main`,
                                width: 48,
                                height: 48
                              }}
                            >
                              <BookIcon />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight="bold" noWrap>
                                {subject.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('max_score')}: {subject.total} {t('points') || 'points'}
                              </Typography>
                            </Box>
                          </Box>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                {t('difficulty_level') || 'Difficulty Level'}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {subject.total >= 20 ? t('high') || 'High' : 
                                 subject.total >= 15 ? t('medium') || 'Medium' : 
                                 t('low') || 'Low'}
                              </Typography>
                            </Box>
                            <LinearProgress 
                              variant="determinate" 
                              value={(subject.total / 20) * 100} 
                              color={subject.total >= 20 ? 'error' : subject.total >= 15 ? 'warning' : 'success'}
                              sx={{ borderRadius: 2, height: 6 }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Chip 
                              size="small" 
                              label={`${subject.total} pts`} 
                              color="secondary" 
                              variant="outlined"
                            />
                            <Box>
                              <Tooltip title={t('view_analytics') || 'View Analytics'}>
                                <IconButton size="small" color="secondary">
                                  <TrendingUpIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Fade>
      )}

      {/* Floating Action Buttons */}
      <Box sx={{ position: 'fixed', bottom: 140, right: 24, zIndex: 1000 }}>
        {selectedTab === 'students' ? (
          <Tooltip title={t('add_student') || 'Add Student'}>
            <Fab 
              color="primary" 
              onClick={onOpenStudentModal}
              sx={{ 
                boxShadow: 4,
                '&:hover': { boxShadow: 8 }
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        ) : (
          <Tooltip title={t('add_subject') || 'Add Subject'}>
            <Fab 
              color="secondary" 
              onClick={onOpenSubjectModal}
              sx={{ 
                boxShadow: 4,
                '&:hover': { boxShadow: 8 }
              }}
            >
              <AddIcon />
            </Fab>
          </Tooltip>
        )}
      </Box>
    </Container>
  );
};

export default GradesPage;
