import React, { useEffect, useState } from 'react';
import { list as listAssignments } from '../services/assignmentService';
import { submit as submitAnswer, mySubmission } from '../services/submissionService';
import { useAuth } from '../hooks/useAuth';
import { 
  Container, 
  Button, 
  Typography, 
  Box, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import { Assignment, Schedule, Edit, CheckCircle } from '@mui/icons-material';

export default function StudentDashboard(){
  const { logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [answer, setAnswer] = useState('');
  const [mySubmissions, setMySubmissions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetch = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await listAssignments();
      setAssignments(res.data.assignments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetch(); }, []);

  const openSubmit = async (a) => {
    try {
      setCurrent(a);
      setFormError('');
      const res = await mySubmission(a._id);
      setMySubmissions(prev => ({...prev, [a._id]: res.data.submission}));
      setAnswer(res.data.submission.answer || '');
    } catch (err) {
      // No existing submission, start with empty answer
      setAnswer('');
    }
    setOpen(true);
  };

  const submit = async () => {
    try {
      setSubmitting(true);
      setFormError('');
      
      if (!answer.trim()) {
        setFormError('Answer is required');
        return;
      }
      
      await submitAnswer({ assignmentId: current._id, answer });
      setOpen(false);
      setSuccess('Assignment submitted successfully!');
      fetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to submit assignment');
      console.error('Error submitting assignment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setAnswer('');
    setFormError('');
    setCurrent(null);
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Container maxWidth="lg">
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
          <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Student Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                View and submit your assignments
              </Typography>
            </Box>
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
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        
        <Snackbar 
          open={!!success} 
          autoHideDuration={4000} 
          onClose={() => setSuccess('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>

        {/* Assignments Grid */}
        {loading ? (
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'white' }}>
            <CircularProgress size={40} sx={{ color: '#3b82f6' }} />
            <Typography sx={{ mt: 2, color: '#64748b' }}>Loading assignments...</Typography>
          </Paper>
        ) : assignments.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', backgroundColor: 'white' }}>
            <Assignment sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
              No assignments available
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Check back later for new assignments from your teachers
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {assignments.map(a => {
              const hasSubmission = mySubmissions[a._id];
              const isOverdue = a.dueDate && new Date(a.dueDate) < new Date();
              
              return (
                <Grid item xs={12} md={6} lg={4} key={a._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      border: '1px solid #e2e8f0',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#1e293b',
                            mb: 1,
                            lineHeight: 1.3
                          }}
                        >
                          {a.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Chip 
                            label="Published"
                            size="small"
                            sx={{
                              backgroundColor: '#dbeafe',
                              color: '#1e40af',
                              fontWeight: 500,
                              border: 'none'
                            }}
                          />
                          {hasSubmission && (
                            <Chip 
                              icon={<CheckCircle sx={{ fontSize: 16 }} />}
                              label="Submitted"
                              size="small"
                              sx={{
                                backgroundColor: '#dcfce7',
                                color: '#166534',
                                fontWeight: 500,
                                border: 'none'
                              }}
                            />
                          )}
                          {isOverdue && !hasSubmission && (
                            <Chip 
                              label="Overdue"
                              size="small"
                              sx={{
                                backgroundColor: '#fee2e2',
                                color: '#dc2626',
                                fontWeight: 500,
                                border: 'none'
                              }}
                            />
                          )}
                        </Box>
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#64748b', 
                          mb: 3,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {a.description || 'No description provided'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', color: '#64748b', mb: 2 }}>
                        <Schedule sx={{ fontSize: 16, mr: 1 }} />
                        <Typography variant="body2">
                          Due: {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'No due date'}
                        </Typography>
                      </Box>

                      {hasSubmission && (
                        <Box sx={{ 
                          backgroundColor: '#f0fdf4', 
                          p: 2, 
                          borderRadius: 1,
                          border: '1px solid #bbf7d0'
                        }}>
                          <Typography variant="body2" sx={{ color: '#166534', fontWeight: 500 }}>
                            Submitted: {new Date(hasSubmission.submittedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions sx={{ p: 2, pt: 1.5 }}>
                      <Button 
                        fullWidth
                        variant={hasSubmission ? "outlined" : "contained"}
                        startIcon={hasSubmission ? <Edit /> : <Assignment />}
                        onClick={() => openSubmit(a)}
                        sx={{
                          backgroundColor: hasSubmission ? 'transparent' : '#3b82f6',
                          color: hasSubmission ? '#3b82f6' : 'white',
                          borderColor: hasSubmission ? '#3b82f6' : 'transparent',
                          '&:hover': {
                            backgroundColor: hasSubmission ? '#eff6ff' : '#2563eb',
                          },
                          textTransform: 'none',
                          py: 1.5,
                          borderRadius: 2
                        }}
                      >
                        {hasSubmission ? 'View Submission' : 'Submit Assignment'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>

      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1, 
          fontSize: '1.5rem', 
          fontWeight: 600, 
          color: '#1e293b',
          borderBottom: '1px solid #e2e8f0'
        }}>
          {mySubmissions[current?._id] ? 'View Submission' : 'Submit Assignment'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {current && (
            <Box sx={{ mb: 3, p: 3, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                {current.title}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>
                {current.description || 'No description provided'}
              </Typography>
              {current.dueDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
                  <Schedule sx={{ fontSize: 16, mr: 1 }} />
                  <Typography variant="body2">
                    Due: {new Date(current.dueDate).toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {formError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.875rem'
                }
              }}
            >
              {formError}
            </Alert>
          )}
          
          <TextField 
            fullWidth 
            multiline 
            rows={8} 
            label="Your Answer" 
            value={answer} 
            onChange={e=>setAnswer(e.target.value)} 
            error={!!formError && !answer.trim()}
            helperText={!!formError && !answer.trim() ? "Answer is required" : "Provide your detailed response here"}
            disabled={submitting}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8fafc',
                '& fieldset': {
                  borderColor: '#e2e8f0',
                },
                '&:hover fieldset': {
                  borderColor: '#cbd5e1',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3b82f6',
                }
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2, gap: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button 
            onClick={handleCloseDialog} 
            disabled={submitting}
            sx={{
              color: '#64748b',
              borderColor: '#e2e8f0',
              '&:hover': {
                backgroundColor: '#f8fafc',
                borderColor: '#cbd5e1'
              }
            }}
            variant="outlined"
          >
            Close
          </Button>
          <Button 
            onClick={submit} 
            variant="contained"
            disabled={!answer.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <Assignment />}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': { backgroundColor: '#2563eb' },
              px: 3,
              py: 1.5,
              borderRadius: 2
            }}
          >
            {submitting ? 'Submitting Answer...' : 'Submit Answer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
