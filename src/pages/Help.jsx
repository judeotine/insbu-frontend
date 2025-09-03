import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  TextField,
  Chip,
  Divider,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  ContactSupport as ContactIcon,
  QuestionAnswer as QuestionIcon,
  Book as BookIcon,
  VideoLibrary as VideoIcon,
  BugReport as BugReportIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Description as DocumentIcon,
  Security as SecurityIcon,
  Dashboard as DashboardIcon,
  Article as ArticleIcon
} from '@mui/icons-material'

const Help = () => {
  const [openContactDialog, setOpenContactDialog] = useState(false)
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    category: 'general'
  })

  const faqs = [
    {
      question: 'How do I access the dashboard?',
      answer: 'After logging in, you will automatically be redirected to your dashboard. You can also click on the "Dashboard" menu item in the sidebar to navigate there.',
      category: 'Navigation'
    },
    {
      question: 'How do I upload documents?',
      answer: 'Navigate to the Documents section and click the "Upload Document" button. Select your file, fill in the required information, and click upload. Supported formats include PDF, Word, Excel, and images.',
      category: 'Documents'
    },
    {
      question: 'How do I create or edit news articles?',
      answer: 'Go to the News section and click "Create Article" for new articles, or click the edit icon on existing articles. Use the rich text editor to format your content and set publication status.',
      category: 'News'
    },
    {
      question: 'What are user roles and permissions?',
      answer: 'There are three user roles: Admin (full access), Editor (can create/edit content), and User (read-only access). Your role determines what features you can access.',
      category: 'Users'
    },
    {
      question: 'How do I change my password?',
      answer: 'Go to Settings > Security Settings and click "Change Password". Enter your current password and choose a new secure password.',
      category: 'Security'
    },
    {
      question: 'How do I download documents?',
      answer: 'In the Documents section, find the document you need and click the download button. Some documents may require special permissions to access.',
      category: 'Documents'
    },
    {
      question: 'How do I enable dark mode?',
      answer: 'Go to Settings > Appearance Settings and toggle the "Dark Mode" switch. The interface will immediately switch to the dark theme.',
      category: 'Settings'
    },
    {
      question: 'How do I manage notification preferences?',
      answer: 'Visit Settings > Notification Settings to customize what notifications you receive via email and within the application.',
      category: 'Settings'
    }
  ]

  const quickLinks = [
    {
      title: 'Getting Started Guide',
      description: 'Learn the basics of using the INSBU portal',
      icon: <BookIcon color="primary" />,
      action: 'Read Guide'
    },
    {
      title: 'Video Tutorials',
      description: 'Watch step-by-step video tutorials',
      icon: <VideoIcon color="secondary" />,
      action: 'Watch Videos'
    },
    {
      title: 'User Manual',
      description: 'Comprehensive user documentation',
      icon: <DocumentIcon color="info" />,
      action: 'Download PDF'
    },
    {
      title: 'Security Best Practices',
      description: 'Learn how to keep your account secure',
      icon: <SecurityIcon color="error" />,
      action: 'Learn More'
    }
  ]

  const supportChannels = [
    {
      title: 'Email Support',
      description: 'support@insbu.bi',
      icon: <EmailIcon color="primary" />,
      subtitle: 'Response within 24 hours'
    },
    {
      title: 'Phone Support',
      description: '+257 22 21 46 83',
      icon: <PhoneIcon color="success" />,
      subtitle: 'Mon-Fri, 8AM-6PM'
    },
    {
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: <ChatIcon color="info" />,
      subtitle: 'Available during business hours'
    }
  ]

  const handleContactSubmit = () => {
    // Simulate form submission
    setOpenContactDialog(false)
    setContactForm({ subject: '', message: '', category: 'general' })
  }

  const getIconForCategory = (category) => {
    switch (category.toLowerCase()) {
      case 'navigation': return <DashboardIcon />
      case 'documents': return <DocumentIcon />
      case 'news': return <ArticleIcon />
      case 'users': return <ContactIcon />
      case 'security': return <SecurityIcon />
      default: return <HelpIcon />
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Help & Support
      </Typography>

      <Grid container spacing={3}>
        {/* Quick Links */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Quick Links
            </Typography>
            <Grid container spacing={2}>
              {quickLinks.map((link, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card sx={{ height: '100%', cursor: 'pointer', '&:hover': { elevation: 4 } }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 2 }}>
                        {link.icon}
                      </Box>
                      <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                        {link.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {link.description}
                      </Typography>
                      <Button variant="outlined" size="small">
                        {link.action}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* FAQ Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Frequently Asked Questions
            </Typography>
            
            {faqs.map((faq, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box sx={{ mr: 2 }}>
                      {getIconForCategory(faq.category)}
                    </Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1">{faq.question}</Typography>
                      <Chip label={faq.category} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Paper>
        </Grid>

        {/* Support Channels */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Contact Support
            </Typography>
            
            <List>
              {supportChannels.map((channel, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    {channel.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={channel.title}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {channel.description}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          {channel.subtitle}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Button
              fullWidth
              variant="contained"
              startIcon={<ContactIcon />}
              onClick={() => setOpenContactDialog(true)}
            >
              Send Message
            </Button>

            <Alert severity="info" sx={{ mt: 2 }}>
              For urgent issues, please call our support line directly.
            </Alert>
          </Paper>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
              System Status
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip label="Operational" color="success" sx={{ mb: 1 }} />
                  <Typography variant="body2">All Systems</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip label="99.9%" color="success" sx={{ mb: 1 }} />
                  <Typography variant="body2">Uptime</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip label="v2.1.0" color="info" sx={{ mb: 1 }} />
                  <Typography variant="body2">Current Version</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center' }}>
                  <Chip label="Scheduled" color="warning" sx={{ mb: 1 }} />
                  <Typography variant="body2">Next Maintenance</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Contact Form Dialog */}
      <Dialog open={openContactDialog} onClose={() => setOpenContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Contact Support</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="Category"
            value={contactForm.category}
            onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="general">General Inquiry</option>
            <option value="technical">Technical Issue</option>
            <option value="bug">Bug Report</option>
            <option value="feature">Feature Request</option>
            <option value="account">Account Issue</option>
          </TextField>

          <TextField
            fullWidth
            label="Subject"
            value={contactForm.subject}
            onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Message"
            multiline
            rows={4}
            value={contactForm.message}
            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
            margin="normal"
            placeholder="Describe your issue or question in detail..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenContactDialog(false)}>Cancel</Button>
          <Button onClick={handleContactSubmit} variant="contained">
            Send Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Help