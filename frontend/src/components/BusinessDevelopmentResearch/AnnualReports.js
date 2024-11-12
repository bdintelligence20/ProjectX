import React from 'react';
import { Box, Link, Paper, Typography, Stack } from '@mui/material';
import { PictureAsPdf as PdfIcon } from '@mui/icons-material';

export default function AnnualReports() {
  const reports = [
    { year: 2024, url: "#" },
    { year: 2023, url: "#" },
    { year: 2022, url: "#" },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight="500" gutterBottom>
        Available Reports
      </Typography>
      
      {reports.map((report) => (
        <Paper
          key={report.year}
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'action.hover',
              borderColor: 'primary.main',
            }
          }}
        >
          <Link
            href={report.url}
            underline="none"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              color: 'text.primary',
              '&:hover': {
                color: 'primary.main',
              }
            }}
          >
            <PdfIcon color="error" />
            <Typography variant="subtitle1" fontWeight="medium">
              {report.year} Annual Report
            </Typography>
          </Link>
        </Paper>
      ))}
    </Stack>
  );
}