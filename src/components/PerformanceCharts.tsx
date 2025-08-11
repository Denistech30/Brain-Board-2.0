import React from 'react';
import { Box, Typography, LinearProgress, Grid, Card, CardContent } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface PerformanceChartsProps {
  firstTermAverage: number | null;
  secondTermAverage: number | null;
  thirdTermAverage: number | null;
  annualAverage: number | null;
  annualPassPercentage: number | null;
}

const PerformanceCharts: React.FC<PerformanceChartsProps> = ({
  firstTermAverage,
  secondTermAverage,
  thirdTermAverage,
  annualAverage,
  annualPassPercentage,
}) => {
  const { t } = useTranslation();

  const getProgressColor = (value: number | null): 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (!value) return 'primary';
    if (value >= 15) return 'success';
    if (value >= 10) return 'warning';
    return 'error';
  };

  const formatValue = (value: number | null) => {
    return value ? value.toFixed(2) : '0.00';
  };

  const progressData = [
    { label: t('first_term'), value: firstTermAverage, max: 20 },
    { label: t('second_term'), value: secondTermAverage, max: 20 },
    { label: t('third_term'), value: thirdTermAverage, max: 20 },
    { label: t('annual_summary'), value: annualAverage, max: 20 },
  ];

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Term Averages */}
        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            {t('class_average', { value: '' })}
          </Typography>
          {progressData.map((item, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">{item.label}</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatValue(item.value)}/{item.max}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={((item.value || 0) / item.max) * 100}
                color={getProgressColor(item.value)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          ))}
        </Grid>

        {/* Pass Percentage Card */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
            <CardContent sx={{ textAlign: 'center', width: '100%' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {formatValue(annualPassPercentage)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('pass_percentage', { value: '' })}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={annualPassPercentage || 0}
                  color={getProgressColor(annualPassPercentage)}
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PerformanceCharts;
