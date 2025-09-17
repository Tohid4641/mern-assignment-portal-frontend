import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { list as listAssignments, create as createAssignment, changeStatus } from '../services/assignmentService';
import { listForTeacher } from '../services/submissionService';
import { useAuth } from '../hooks/useAuth';
import { 
  Container, 
  Button, 
  Typography, 
  Box, 
  Select, 
  MenuItem, 
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
  IconButton,
  Avatar,
  Grid,
  Divider,
  Paper
} from '@mui/material';
import { Add, MoreVert, Assignment, Schedule, Visibility } from '@mui/icons-material';

export default function TeacherDashboard(){
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', dueDate:'' });
  const [dueDateValue, setDueDateValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetch = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await listAssignments({ status: statusFilter });
      setAssignments(res.data.assignments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetch(); }, [statusFilter]);

  const create = async () => {
    try {
      setSubmitting(true);
      setFormError('');
      
      if (!form.title.trim()) {
        setFormError('Title is required');
        return;
      }
      
      const formData = { ...form };
      if (dueDateValue) {
        formData.dueDate = new Date(dueDateValue).toISOString();
      }
      
      await createAssignment(formData);
      setOpen(false);
      setForm({ title:'', description:'', dueDate:'' });
      setDueDateValue('');
      setSuccess('Assignment created successfully!');
      fetch();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create assignment');
      console.error('Error creating assignment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const change = async (id, nextStatus) => {
    try {
      setError('');
      await changeStatus(id, nextStatus);
      setSuccess(`Assignment status changed to ${nextStatus}`);
      fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change assignment status');
      console.error('Error changing status:', err);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setForm({ title:'', description:'', dueDate:'' });
    setDueDateValue('');
    setFormError('');
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
                Teacher Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                Manage your assignments and track student progress
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

        {/* Controls */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          backgroundColor: 'white',
          p: 2,
          borderRadius: 2,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#2563eb',
              },
              px: 3,
              py: 1.5,
              borderRadius: 2
            }}
          >
            Create Assignment
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
              Filter by status:
            </Typography>
            <Select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              displayEmpty
              size="small"
              sx={{ 
                minWidth: 150,
                backgroundColor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: '2px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#2563eb',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6',
                  borderWidth: '2px',
                },
                '& .MuiSelect-select': {
                  color: statusFilter ? '#374151' : '#9ca3af',
                  fontWeight: statusFilter ? 500 : 400,
                }
              }}
            >
              <MenuItem value='' sx={{ color: '#374151' }}>
                All
              </MenuItem>
              <MenuItem value='Draft' sx={{ color: '#374151' }}>Draft</MenuItem>
              <MenuItem value='Published' sx={{ color: '#374151' }}>Published</MenuItem>
              <MenuItem value='Completed' sx={{ color: '#374151' }}>Completed</MenuItem>
            </Select>
          </Box>
        </Box>

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
              No assignments found
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Create your first assignment to get started
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {assignments.map(a => (
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
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
                        <Chip 
                          label={a.status}
                          size="small"
                          sx={{
                            backgroundColor: 
                              a.status === 'Published' ? '#dbeafe' :
                              a.status === 'Draft' ? '#fef3c7' : '#dcfce7',
                            color: 
                              a.status === 'Published' ? '#1e40af' :
                              a.status === 'Draft' ? '#92400e' : '#166534',
                            fontWeight: 500,
                            border: 'none'
                          }}
                        />
                      </Box>
                      <IconButton size="small" sx={{ color: '#94a3b8' }}>
                        <MoreVert />
                      </IconButton>
                    </Box>
                    
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b', 
                        mb: 3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
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
                  </CardContent>
                  
                  <Divider />
                  
                  <CardActions sx={{ p: 2, pt: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', width: '100%' }}>
                      {a.status === 'Draft' && (
                        <Button 
                          size="small" 
                          variant="contained"
                          onClick={() => change(a._id, 'Published')}
                          sx={{
                            backgroundColor: '#10b981',
                            '&:hover': { backgroundColor: '#059669' },
                            textTransform: 'none',
                            fontSize: '0.75rem'
                          }}
                        >
                          Publish
                        </Button>
                      )}
                      {a.status === 'Published' && (
                        <Button 
                          size="small" 
                          variant="outlined"
                          onClick={() => change(a._id, 'Completed')}
                          sx={{
                            borderColor: '#e2e8f0',
                            color: '#64748b',
                            textTransform: 'none',
                            fontSize: '0.75rem'
                          }}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button 
                        size="small" 
                        variant="text"
                        startIcon={<Visibility sx={{ fontSize: 16 }} />}
                        onClick={() => navigate(`/teacher/submissions/${a._id}`)}
                        sx={{
                          color: '#3b82f6',
                          textTransform: 'none',
                          fontSize: '0.75rem',
                          ml: 'auto'
                        }}
                      >
                        View Submissions
                      </Button>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      <Dialog 
        open={open} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
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
          Create New Assignment
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
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
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField 
              fullWidth 
              label="Assignment Title" 
              value={form.title} 
              onChange={e=>setForm({...form,title:e.target.value})} 
              required
              error={!!formError && !form.title.trim()}
              helperText={!!formError && !form.title.trim() ? "Title is required" : "Enter a clear, descriptive title"}
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
            
            <TextField 
              fullWidth 
              label="Description" 
              multiline 
              rows={4} 
              value={form.description} 
              onChange={e=>setForm({...form,description:e.target.value})} 
              helperText="Provide detailed instructions and requirements"
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
            
            <TextField 
              fullWidth 
              label="Due Date" 
              type="datetime-local"
              value={dueDateValue} 
              onChange={e=>setDueDateValue(e.target.value)} 
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16),
              }}
              helperText="Set a deadline for student submissions"
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
          </Box>
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
            Cancel
          </Button>
          <Button 
            onClick={create} 
            variant="contained" 
            disabled={!form.title.trim() || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : <Add />}
            sx={{
              backgroundColor: '#3b82f6',
              '&:hover': { backgroundColor: '#2563eb' },
              px: 3,
              py: 1.5,
              borderRadius: 2
            }}
          >
            {submitting ? 'Creating Assignment...' : 'Create Assignment'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
