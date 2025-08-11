import * as React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import GradingIcon from '@mui/icons-material/Grading';
import CalculateIcon from '@mui/icons-material/Calculate';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PrintIcon from '@mui/icons-material/Print';
import { useTranslation } from 'react-i18next';

interface BottomNavProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0,
        zIndex: 1000, // Ensure it's above other content
        display: { xs: 'block', sm: 'none' } // Only show on mobile
      }} 
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={onChange}
        sx={{
          '& .Mui-selected': {
            '& .MuiSvgIcon-root, & .MuiBottomNavigationAction-label': {
              color: 'primary.main'
            },
            transform: 'translateY(-3px)',
            transition: 'transform 0.2s ease-in-out',
          },
          '& .MuiBottomNavigationAction-root': {
            transition: 'transform 0.2s ease-in-out',
            minWidth: 0, // Allow items to shrink
            padding: '6px 2px', // Adjust padding for smaller screens
            '@media (maxWidth: 380px)': {
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.65rem', // Reduce font size on very small screens
              },
            },
          }
        }}
      >
        <BottomNavigationAction label={t('home')} icon={<HomeIcon />} />
        <BottomNavigationAction label={t('grades')} icon={<GradingIcon />} />
        <BottomNavigationAction label={t('calculate')} icon={<CalculateIcon />} />
        <BottomNavigationAction label={t('results')} icon={<AssessmentIcon />} />
        <BottomNavigationAction label={t('print')} icon={<PrintIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;
