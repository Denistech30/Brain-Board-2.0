import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  Chip,
  Badge,
  Fade,
  Zoom,
  Paper,
  Avatar,
  useMediaQuery
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Preview as PreviewIcon,
  GetApp as DownloadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
  Print as PrintIcon,
  Palette as PaletteIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import TemplateDataModal, { SubjectLite, TemplateExtraData } from './TemplateDataModal';
import { templatesRegistry } from '../templates/registry';

// Create SVG placeholder function
const createSVGPlaceholder = (width: number, height: number, bgColor: string, textColor: string, text: string) => {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${textColor}">
        ${text}
      </text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const templates = [
  {
    id: 'classic-a4',
    name: 'Classic A4 Portrait',
    thumbnail: createSVGPlaceholder(300, 400, '#E3F2FD', '#1976D2', 'Classic A4'),
    category: 'Traditional',
    description: 'A classic portrait template with student summary and comprehensive three-term breakdown. Perfect for formal academic reports.',
    features: ['Portrait Layout', 'Three Terms', 'Grade Summary', 'Comments Section'],
    popular: true,
    previewUrl: '/templates/classic-a4-template.html'
  },
  {
    id: 'modern-landscape',
    name: 'Modern Landscape',
    thumbnail: createSVGPlaceholder(400, 300, '#F3E5F5', '#7B1FA2', 'Modern Landscape'),
    category: 'Modern',
    description: 'A sleek landscape layout with visual elements, perfect for detailed term-by-term analysis and performance tracking.',
    features: ['Landscape Layout', 'Visual Charts', 'Performance Graphs', 'Color Coded'],
    popular: false
  },
  {
    id: 'compact-view',
    name: 'Compact Summary',
    thumbnail: createSVGPlaceholder(300, 400, '#E8F5E8', '#388E3C', 'Compact View'),
    category: 'Efficient',
    description: 'A space-efficient design that fits all essential information on a single page without compromising readability.',
    features: ['Single Page', 'Condensed Layout', 'Essential Info', 'Print Friendly'],
    popular: true
  },
  {
    id: 'detailed-report',
    name: 'Detailed Analytics',
    thumbnail: createSVGPlaceholder(300, 400, '#FFF3E0', '#F57C00', 'Detailed Report'),
    category: 'Comprehensive',
    description: 'An extensive report with charts, graphs, and detailed analytics for comprehensive performance tracking.',
    features: ['Charts & Graphs', 'Analytics', 'Progress Tracking', 'Detailed Breakdown'],
    popular: false
  },
  {
    id: 'minimalist-style',
    name: 'Minimalist Clean',
    thumbnail: createSVGPlaceholder(300, 400, '#FAFAFA', '#424242', 'Minimalist Style'),
    category: 'Clean',
    description: 'A clean, minimalist template focusing on clarity and readability with elegant typography.',
    features: ['Clean Design', 'Typography Focus', 'High Readability', 'Professional'],
    popular: true
  },
  {
    id: 'colorful-design',
    name: 'Vibrant Colors',
    thumbnail: createSVGPlaceholder(300, 400, '#FCE4EC', '#C2185B', 'Colorful Design'),
    category: 'Creative',
    description: 'A vibrant, colorful design to make report cards more engaging and visually appealing for students.',
    features: ['Colorful Theme', 'Engaging Design', 'Student Friendly', 'Visual Appeal'],
    popular: false
  }
];

interface Template {
  id: string;
  name: string;
  thumbnail: string;
  category: string;
  description: string;
  features: string[];
  popular: boolean;
  previewUrl?: string;
}

interface TemplateGalleryPageProps {
  onSelectTemplate: (templateId: string, extraData?: TemplateExtraData) => void;
  onBack: () => void;
  subjects?: SubjectLite[];
  // key-value map of data already available in the app (e.g., student attributes, school info, etc.)
  availableData?: Record<string, unknown>;
}

const TemplateGalleryPage: React.FC<TemplateGalleryPageProps> = ({ onSelectTemplate, onBack, subjects = [], availableData = {} }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['classic-a4', 'compact-view']);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [missingFields, setMissingFields] = useState<Array<{ key: string; label: string; type: 'text' | 'number' | 'date' | 'textarea' | 'url'; section?: 'student' | 'school' | 'term' | 'subject' | 'other'; placeholder?: string; optional?: boolean; }>>([]);

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleClose = () => {
    setSelectedTemplate(null);
  };

  const handleUseTemplate = (templateId: string) => {
    // Open modal to collect extra data required for the template
    setPendingTemplateId(templateId);
    // Determine required fields from registry and filter out those already available
    const def = templatesRegistry[templateId];
    if (def && def.requiredFields) {
      const missing = def.requiredFields.filter(f => {
        const v = (availableData as any)[f.key];
        return v === undefined || v === null || v === '';
      });
      setMissingFields(missing);
    } else {
      setMissingFields([]);
    }
    // If nothing is missing and no subject meta is needed, proceed immediately
    const willOpenModal = (def && def.requiredFields && def.requiredFields.length > 0 && 
      def.requiredFields.some(f => {
        const v = (availableData as any)[f.key];
        return v === undefined || v === null || v === '';
      })) || (subjects && subjects.length > 0);

    if (!willOpenModal) {
      onSelectTemplate(templateId);
      handleClose();
      return;
    }
    setModalOpen(true);
  };

  const toggleFavorite = (templateId: string) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Traditional': theme.palette.primary.main,
      'Modern': theme.palette.secondary.main,
      'Efficient': theme.palette.success.main,
      'Comprehensive': theme.palette.warning.main,
      'Clean': theme.palette.info.main,
      'Creative': theme.palette.error.main
    };
    return colors[category as keyof typeof colors] || theme.palette.grey[500];
  };

  return (
    <Container 
      maxWidth="xl" 
      sx={{ 
        mt: { xs: 1, sm: 2 }, 
        mb: { xs: 10, sm: 4 }, // Extra bottom margin for mobile to account for bottom nav
        px: { xs: 1, sm: 2, md: 3 }
      }}
    >
      {/* Header */}
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 4 }, borderRadius: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
          mb: 2 
        }}>
          <IconButton 
            onClick={onBack} 
            aria-label="back"
            sx={{ 
              mr: { xs: 0, sm: 2 },
              alignSelf: { xs: 'flex-start', sm: 'center' },
              bgcolor: theme.palette.primary.main,
              color: 'white',
              '&:hover': { bgcolor: theme.palette.primary.dark }
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ 
            display: 'flex', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 },
            width: '100%'
          }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.primary.main,
              display: { xs: 'none', sm: 'flex' }
            }}>
              <PaletteIcon />
            </Avatar>
            <Box sx={{ width: '100%' }}>
              <Typography 
                component="h1" 
                variant="h4"
                gutterBottom
                sx={{ 
                  fontWeight: 'bold',
                  textAlign: 'center',
                  mb: 4,
                  fontSize: { xs: '1.5rem', sm: '2.125rem' }
                }}
              >
                {t('template_gallery') || 'Template Gallery'}
              </Typography>
              <Typography 
                component="div"
                variant="body2"
                color="text.secondary"
                sx={{ 
                  mb: 2,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
              >
                {t('choose_report_template') || 'Choose the perfect template for your student reports'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Stats */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 3 }, 
          mt: { xs: 2, sm: 3 },
          '& .MuiChip-root': {
            fontSize: { xs: '0.7rem', sm: '0.8125rem' }
          }
        }}>
          <Chip 
            icon={<AssessmentIcon sx={{ fontSize: { xs: '16px', sm: '20px' } }} />} 
            label={`${templates.length} Templates Available`}
            variant="outlined"
            color="primary"
            size="small"
          />
          <Chip 
            icon={<StarIcon sx={{ fontSize: { xs: '16px', sm: '20px' } }} />} 
            label={`${templates.filter(t => t.popular).length} Popular`}
            variant="outlined"
            color="secondary"
            size="small"
          />
          <Chip 
            icon={<SchoolIcon sx={{ fontSize: { xs: '16px', sm: '20px' } }} />} 
            label="Student Reports"
            variant="outlined"
            color="success"
            size="small"
          />
        </Box>
      </Paper>

      {/* Template Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }}>
        {templates.map((template, index) => (
          <Grid item key={template.id} xs={12} sm={6} md={4} lg={3}>
            <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: { xs: 'none', sm: 'translateY(-8px)' },
                    boxShadow: { xs: 2, sm: 6 }
                  }
                }}
              >
                {/* Popular Badge */}
                {template.popular && (
                  <Chip
                    icon={<StarIcon sx={{ fontSize: { xs: '14px', sm: '18px' } }} />}
                    label="Popular"
                    size="small"
                    color="warning"
                    sx={{
                      position: 'absolute',
                      top: { xs: 6, sm: 8 },
                      left: { xs: 6, sm: 8 },
                      zIndex: 1,
                      fontWeight: 'bold',
                      fontSize: { xs: '0.65rem', sm: '0.75rem' }
                    }}
                  />
                )}

                {/* Favorite Button */}
                <IconButton
                  onClick={() => toggleFavorite(template.id)}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: { xs: 6, sm: 8 },
                    right: { xs: 6, sm: 8 },
                    zIndex: 1,
                    color: favorites.includes(template.id) ? 'red' : 'grey.400',
                    '&:hover': {
                      color: 'red'
                    },
                    fontSize: { xs: '1rem', sm: '1.25rem' }
                  }}
                >
                  {favorites.includes(template.id) ? (
                    <StarIcon color="warning" sx={{ fontSize: { xs: '16px', sm: '20px' } }} />
                  ) : (
                    <StarBorderIcon sx={{ fontSize: { xs: '16px', sm: '20px' } }} />
                  )}
                </IconButton>

                <CardMedia
                  component="img"
                  height={200}
                  image={template.thumbnail}
                  alt={template.name}
                  sx={{ 
                    objectFit: 'cover',
                    height: { xs: 200, sm: 250 }
                  }}
                />

                <CardContent sx={{ flexGrow: 1, pb: 1, p: { xs: 1.5, sm: 2 } }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 0.5, sm: 1 }, 
                    mb: 1 
                  }}>
                    <Typography 
                      gutterBottom 
                      variant="h6" 
                      component="div" 
                      sx={{ 
                        mb: 0, 
                        flexGrow: 1,
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                        lineHeight: { xs: 1.2, sm: 1.6 }
                      }}
                    >
                      {template.name}
                    </Typography>
                    <Chip 
                      label={template.category} 
                      size="small" 
                      variant="outlined" 
                      sx={{ 
                        mb: 1, 
                        mr: 1,
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' }
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 2,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: { xs: 1.3, sm: 1.43 },
                      display: '-webkit-box',
                      WebkitLineClamp: { xs: 2, sm: 3 },
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {template.description}
                  </Typography>

                  {/* Features */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 0.3, sm: 0.5 } }}>
                    {template.features.slice(0, 2).map((feature) => (
                      <Chip
                        key={feature}
                        label={feature}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          height: { xs: 18, sm: 24 }
                        }}
                      />
                    ))}
                    {template.features.length > 2 && (
                      <Chip
                        label={`+${template.features.length - (window.innerWidth < 600 ? 1 : 2)} more`}
                        size="small"
                        variant="outlined"
                        sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.7rem' },
                          height: { xs: 18, sm: 24 }
                        }}
                      />
                    )}
                  </Box>
                </CardContent>

                <CardActions sx={{ 
                  justifyContent: 'space-between', 
                  pt: 0, 
                  px: { xs: 1.5, sm: 2 },
                  pb: { xs: 1.5, sm: 2 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 0 }
                }}>
                  <Button 
                    size="small"
                    startIcon={<PreviewIcon sx={{ fontSize: { xs: '16px', sm: '18px' } }} />}
                    onClick={() => handlePreview(template)}
                    sx={{ 
                      textTransform: 'none',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {t('preview') || 'Preview'}
                  </Button>
                  <Button 
                    size="small"
                    variant="contained" 
                    startIcon={<PrintIcon sx={{ fontSize: { xs: '16px', sm: '18px' } }} />}
                    onClick={() => handleUseTemplate(template.id)}
                    sx={{ 
                      textTransform: 'none',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    {t('use_template') || 'Use Template'}
                  </Button>
                </CardActions>
              </Card>
            </Zoom>
          </Grid>
        ))}
      </Grid>

      {/* Preview Dialog */}
      {selectedTemplate && (
        <Dialog 
          open={!!selectedTemplate} 
          onClose={handleClose} 
          fullWidth 
          maxWidth="lg"
          fullScreen={isXs}
          PaperProps={{
            sx: { 
              borderRadius: { xs: 0, sm: 3 },
              m: { xs: 0, sm: 2 },
              maxHeight: { xs: '100vh', sm: '90vh' }
            }
          }}
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, sm: 2 },
            p: { xs: 2, sm: 3 },
            flexDirection: { xs: 'row', sm: 'row' }
          }}>
            <Avatar sx={{ 
              bgcolor: getCategoryColor(selectedTemplate.category),
              width: { xs: 32, sm: 40 },
              height: { xs: 32, sm: 40 }
            }}>
              <AssessmentIcon sx={{ fontSize: { xs: '18px', sm: '24px' } }} />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography 
                variant="h6"
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                {selectedTemplate.name}
              </Typography>
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {selectedTemplate.category} Template
              </Typography>
            </Box>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              size="small"
              sx={{
                color: theme.palette.grey[500],
              }}
            >
              <CloseIcon sx={{ fontSize: { xs: '20px', sm: '24px' } }} />
            </IconButton>
          </DialogTitle>
          
          <DialogContent 
            dividers
            sx={{ 
              p: { xs: 2, sm: 3 },
              overflow: 'auto'
            }}
          >
            {selectedTemplate.previewUrl ? (
              <iframe
                src={selectedTemplate.previewUrl}
                title={selectedTemplate.name}
                style={{ 
                  width: '100%', 
                  height: window.innerWidth < 600 ? '50vh' : '70vh', 
                  border: 'none', 
                  borderRadius: '8px' 
                }}
              />
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                gap: { xs: 2, sm: 3 } 
              }}>
                <Box sx={{ flex: 1 }}>
                  <CardMedia
                    component="img"
                    image={selectedTemplate.thumbnail}
                    alt={selectedTemplate.name}
                    sx={{ 
                      objectFit: 'contain',
                      maxHeight: { xs: 250, sm: 400 },
                      width: '100%',
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Template Features
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                  >
                    {selectedTemplate.description}
                  </Typography>
                  
                  <Typography 
                    variant="subtitle2" 
                    gutterBottom 
                    sx={{ 
                      mt: 2,
                      fontSize: { xs: '0.8rem', sm: '0.875rem' }
                    }}
                  >
                    Included Features:
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: { xs: 0.5, sm: 1 } 
                  }}>
                    {selectedTemplate.features.map((feature) => (
                      <Chip
                        key={feature}
                        label={feature}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ 
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          height: { xs: 24, sm: 28 }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: { xs: 2, sm: 3 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}>
            <Button 
              onClick={handleClose} 
              sx={{ 
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 2, sm: 1 }
              }}
            >
              {t('cancel') || 'Cancel'}
            </Button>
            <Button 
              variant="contained" 
              startIcon={<DownloadIcon sx={{ fontSize: { xs: '18px', sm: '20px' } }} />}
              onClick={() => handleUseTemplate(selectedTemplate.id)}
              sx={{ 
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
                order: { xs: 1, sm: 2 }
              }}
            >
              {t('use_this_template') || 'Use This Template'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {/* Data Collection Modal */}
      <TemplateDataModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        templateId={pendingTemplateId || 'unknown'}
        subjects={subjects}
        fields={missingFields}
        onSave={(data) => {
          if (pendingTemplateId) {
            onSelectTemplate(pendingTemplateId, data);
          }
          setModalOpen(false);
          setPendingTemplateId(null);
          handleClose();
        }}
      />
    </Container>
  );
};

export default TemplateGalleryPage;
