import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Avatar, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Modal,
  useTheme,
  Grid,
  Chip,
  IconButton,
  Fade,
  Paper
} from '@mui/material';
import { 
  TrendingUp, 
  School, 
  EmojiEvents, 
  Feedback,
  CalendarToday,
  Close
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import emailjs from '@emailjs/browser';
import PerformanceCharts from './PerformanceCharts';

// --- Enhanced Event Data with more details ---
const schoolEvents = [
  { 
    date: '15 May', 
    title: 'BEPC (Lower-Secondary)', 
    description: 'Official start of BEPC exams for all students in Forms 4',
    type: 'exam',
    priority: 'high'
  },
  { 
    date: '26 May', 
    title: 'BAC (Upper-Secondary)', 
    description: 'Baccalauréat exams for Series A, C, D, E, F students',
    type: 'exam',
    priority: 'high'
  },
  { 
    date: '7 Jun', 
    title: 'National Day', 
    description: 'Public holiday – no classes. Celebrate Cameroon!',
    type: 'holiday',
    priority: 'medium'
  },
  { 
    date: '28 Jul', 
    title: 'Vacances', 
    description: 'Second-term break starts. Time to rest and recharge!',
    type: 'break',
    priority: 'medium'
  },
  { 
    date: '2 Sep', 
    title: 'Rentrée', 
    description: 'Back to school 2025-2026. New academic year begins!',
    type: 'academic',
    priority: 'high'
  },
];

// Enhanced testimonials with more variety
const testimonials = [
  {
    name: 'Mme. Evelyne',
    role: 'Mathematics Teacher',
    message: 'Brain-Board cut my grading time in half! Now I can focus more on teaching.',
    rating: 5
  },
  {
    name: 'Mr. Ngwa',
    role: 'Physics Teacher', 
    message: 'Students love seeing their progress live. It motivates them to work harder.',
    rating: 5
  },
  {
    name: 'Dr. Mbah',
    role: 'School Principal',
    message: 'The analytics help us make better decisions for our students.',
    rating: 5
  },
  {
    name: 'Mme. Fon',
    role: 'Chemistry Teacher',
    message: 'PDF reports are professional and save me hours of manual work.',
    rating: 5
  }
];

interface HomePageProps {
  firstTermAverage: number | null;
  secondTermAverage: number | null;
  thirdTermAverage: number | null;
  annualAverage: number | null;
  annualPassPercentage: number | null;
  totalStudents: number;
  totalSubjects: number;
}

const HomePage: React.FC<HomePageProps> = ({ 
  firstTermAverage,
  secondTermAverage,
  thirdTermAverage,
  annualAverage,
  annualPassPercentage,
  totalStudents,
  totalSubjects,
}) => {
  const theme = useTheme();
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<typeof schoolEvents[0] | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [greeting, setGreeting] = useState('');

  // Dynamic greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting(t('good_morning') || 'Good morning');
    } else if (hour < 17) {
      setGreeting(t('good_afternoon') || 'Good afternoon');
    } else {
      setGreeting(t('good_evening') || 'Good evening');
    }
  }, [t]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenModal = (event: typeof schoolEvents[0]) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    // Note: Replace with actual EmailJS credentials when ready
    const serviceId = 'YOUR_SERVICE_ID';
    const templateId = 'YOUR_TEMPLATE_ID';
    const publicKey = 'YOUR_PUBLIC_KEY';

    // For demo purposes, simulate sending
    setTimeout(() => {
      setIsSent(true);
      setFeedbackName('');
      setFeedbackMessage('');
      setTimeout(() => setIsSent(false), 5000);
      setIsSending(false);
    }, 2000);

    // Uncomment when EmailJS is configured:
    /*
    emailjs.send(serviceId, templateId, { 
      from_name: feedbackName, 
      message: feedbackMessage,
      user_email: currentUser?.email 
    }, publicKey)
      .then(() => {
        setIsSent(true);
        setFeedbackName('');
        setFeedbackMessage('');
        setTimeout(() => setIsSent(false), 5000);
      })
      .catch(() => {
        alert('Failed to send feedback. Please try again.');
      })
      .finally(() => {
        setIsSending(false);
      });
    */
  };

  const getEventTypeColor = (type: string): 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (type) {
      case 'exam': return 'error';
      case 'holiday': return 'success';
      case 'break': return 'info';
      case 'academic': return 'primary';
      default: return 'secondary';
    }
  };

  const userName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  return (
    <Container sx={{ pb: '120px', pt: 2 }}>
      {/* Enhanced Greeting Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            {userName.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {greeting}, {userName}! 👋
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('welcome_back') || 'Welcome back to Brain-Board'}
            </Typography>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {totalStudents}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('students')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h4" color="secondary" fontWeight="bold">
                {totalSubjects}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('subjects')}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box textAlign="center">
              <Typography variant="h4" fontWeight="bold" sx={{ color: 'success.main' }}>
                {annualPassPercentage?.toFixed(0) || '0'}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('pass_rate') || 'Pass Rate'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Performance Charts */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TrendingUp color="primary" />
          <Typography variant="h5" component="h2" fontWeight="bold">
            {t('student_performance') || 'Student Performance'}
          </Typography>
        </Box>
        <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <PerformanceCharts 
            firstTermAverage={firstTermAverage}
            secondTermAverage={secondTermAverage}
            thirdTermAverage={thirdTermAverage}
            annualAverage={annualAverage}
            annualPassPercentage={annualPassPercentage}
          />
        </Card>
      </Box>

      {/* Enhanced Events Slider */}
      <Box sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CalendarToday color="primary" />
          <Typography variant="h5" component="h2" fontWeight="bold">
            {t('school_events') || 'School Year Activities'}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            animation: 'marquee 30s linear infinite',
            '@keyframes marquee': {
              '0%': { transform: 'translateX(0%)' },
              '100%': { transform: 'translateX(-100%)' },
            },
            '&:hover': {
              animationPlayState: 'paused',
            },
          }}
        >
          {[...schoolEvents, ...schoolEvents].map((event, index) => (
            <Box key={index} sx={{ flexShrink: 0, width: '200px', pr: 2 }}>
              <Card 
                sx={{ 
                  borderRadius: 3, 
                  cursor: 'pointer', 
                  height: '140px',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }} 
                onClick={() => handleOpenModal(event)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="body2" component="strong" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                      {event.date}
                    </Typography>
                    <Chip 
                      size="small" 
                      label={event.type} 
                      color={getEventTypeColor(event.type)}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                    {event.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {event.description}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Enhanced Testimonials */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <EmojiEvents color="primary" />
          <Typography variant="h5" component="h2" fontWeight="bold">
            {t('testimonials') || 'What teachers say'}
          </Typography>
        </Box>
        <Fade in={true} key={currentTestimonial}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
                "{testimonials[currentTestimonial].message}"
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle2" color="primary" fontWeight="bold">
                    {testimonials[currentTestimonial].name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {testimonials[currentTestimonial].role}
                  </Typography>
                </Box>
                <Box>
                  {'⭐'.repeat(testimonials[currentTestimonial].rating)}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>

      {/* Enhanced Feedback Section */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Feedback color="primary" />
          <Typography variant="h6" component="h3" fontWeight="bold">
            {t('share_experience') || 'Share your experience'}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {t('feedback_description') || 'Tell us how Brain-Board helped you improve your teaching and student management.'}
        </Typography>
        <form onSubmit={handleFeedbackSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                label={t('your_name') || 'Your Name'} 
                value={feedbackName} 
                onChange={(e) => setFeedbackName(e.target.value)} 
                fullWidth 
                required 
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                label={t('your_role') || 'Your Role'} 
                placeholder="e.g., Mathematics Teacher"
                fullWidth 
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                label={t('your_feedback') || 'Your Feedback'} 
                value={feedbackMessage} 
                onChange={(e) => setFeedbackMessage(e.target.value)} 
                fullWidth 
                required 
                multiline 
                rows={4} 
                variant="outlined"
                placeholder={t('feedback_placeholder') || 'Share your experience with Brain-Board...'}
              />
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={isSending || !feedbackName || !feedbackMessage}
                sx={{ borderRadius: 2 }}
              >
                {isSending ? (t('sending') || 'Sending...') : (t('send_feedback') || 'Send Feedback')}
              </Button>
              {isSent && (
                <Typography color="success.main" sx={{ mt: 1, fontWeight: 'medium' }}>
                  ✅ {t('feedback_sent') || 'Thanks! Your feedback has been sent.'}
                </Typography>
              )}
            </Grid>
          </Grid>
        </form>
      </Card>

      {/* Enhanced Event Modal */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)', 
          bgcolor: 'background.paper', 
          borderRadius: 3, 
          p: 4, 
          width: 'min(400px, 90%)',
          boxShadow: 24
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h6" component="h2" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                {selectedEvent?.date} – {selectedEvent?.title}
              </Typography>
              <Chip 
                size="small" 
                label={selectedEvent?.type} 
                color={getEventTypeColor(selectedEvent?.type || '')}
                sx={{ mt: 1 }}
              />
            </Box>
            <IconButton onClick={handleCloseModal} size="small">
              <Close />
            </IconButton>
          </Box>
          <Typography sx={{ mb: 3, lineHeight: 1.6 }}>
            {selectedEvent?.description}
          </Typography>
          <Button onClick={handleCloseModal} variant="contained" fullWidth sx={{ borderRadius: 2 }}>
            {t('close') || 'Close'}
          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default HomePage;
