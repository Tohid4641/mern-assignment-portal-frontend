import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listForTeacher } from '../services/submissionService';
import { useAuth } from '../hooks/useAuth';
import { 
  Container, 
  Button, 
  Typography, 
  Box, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Alert,
  Avatar
} from '@mui/material';
import { Assignment } from '@mui/icons-material';

export default function TeacherSubmissions() {
  const { id: assignmentId } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await listForTeacher(assignmentId);
      setSubmissions(res.data.submissions || []);
      
      // Get assignment title from first submission if available
      if (res.data.submissions && res.data.submissions.length > 0) {
        // Note: We'd need to fetch assignment details separately for the title
        // For now, we'll just show the assignment ID
        setAssignmentTitle(`Assignment ${assignmentId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch submissions');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assignmentId) {
      fetchSubmissions();
    }
  }, [assignmentId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Typography>Loading submissions...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            px: 3, 
            py: 2, 
            mb: 3, 
            backgroundColor: 'white',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Assignment Submissions
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                {assignmentTitle}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/teacher')}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                Back to Dashboard
              </Button>
              <Button 
                variant="outlined" 
                onClick={logout}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  '&:hover': {
                    borderColor: '#cbd5e1',
                    backgroundColor: '#f8fafc'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {submissions.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'white' }}>
            <Assignment sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
              No submissions yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Students haven't submitted their answers for this assignment yet.
            </Typography>
          </Paper>
        ) : (
          <Paper 
            sx={{ 
              backgroundColor: 'white',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
          >
            {/* Stats Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Submissions Overview
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                Total Submissions: {submissions.length}
              </Typography>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2, minWidth: 300 }}>Answer</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Submitted</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((submission, index) => (
                    <TableRow 
                      key={submission._id} 
                      sx={{ 
                        '&:hover': { backgroundColor: '#f9fafb' },
                        '&:nth-of-type(odd)': { backgroundColor: '#fafbfc' },
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      <TableCell sx={{ py: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            sx={{ 
                              width: 40, 
                              height: 40, 
                              mr: 2,
                              backgroundColor: '#3b82f6',
                              fontSize: '1rem',
                              fontWeight: 600
                            }}
                          >
                            {(submission.studentId?.name || 'U').charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {submission.studentId?.name || 'Unknown Student'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {submission.studentId?.email || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Box sx={{ maxWidth: 400 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#374151',
                              wordBreak: 'break-word',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.5
                            }}
                          >
                            {submission.answer}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {formatDate(submission.submittedAt)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 3 }}>
                        <Chip 
                          label={submission.reviewed ? 'Reviewed' : 'Pending Review'} 
                          sx={{
                            backgroundColor: submission.reviewed ? '#dcfce7' : '#fef3c7',
                            color: submission.reviewed ? '#166534' : '#92400e',
                            fontWeight: 500,
                            border: 'none'
                          }}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </Container>
    </Box>
  );
}
