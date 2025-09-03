import React, { useState, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme
} from '@mui/material'
import {
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Add as AddIcon
} from '@mui/icons-material'
import { useDropzone } from 'react-dropzone'
import { useForm, Controller } from 'react-hook-form'
import documentService from '../../services/documentService'
import { DOCUMENT_CATEGORIES, VALIDATION_RULES } from '../../utils/constants'
import { formatFileSize, getFileIcon, validateFile } from '../../utils/helpers'
import toast from 'react-hot-toast'

// Advanced document upload component with drag-and-drop and validation
const DocumentUpload = ({ onUploadComplete, onClose }) => {
  const theme = useTheme()
  const [uploadQueue, setUploadQueue] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      is_public: true,
      tags: []
    }
  })

  const watchedValues = watch()

  // Drag and drop configuration
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    rejectedFiles.forEach(rejection => {
      const { file, errors } = rejection
      const errorMessages = errors.map(e => e.message).join(', ')
      toast.error(`${file.name}: ${errorMessages}`)
    })

    // Process accepted files
    const newFiles = acceptedFiles.map(file => {
      const validation = validateFile(file)
      return {
        id: Date.now() + Math.random(),
        file,
        status: validation.valid ? 'ready' : 'error',
        errors: validation.errors,
        progress: 0
      }
    })

    setUploadQueue(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  })

  const removeFile = (fileId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== fileId))
  }

  const uploadFile = async (fileItem, metadata) => {
    const { file, id } = fileItem

    try {
      setUploadProgress(prev => ({ ...prev, [id]: 0 }))

      await documentService.uploadDocument(
        file,
        {
          title: metadata.title || file.name.replace(/\.[^/.]+$/, ''),
          description: metadata.description,
          category: metadata.category,
          is_public: metadata.is_public,
          tags: metadata.tags
        },
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [id]: progress }))
        }
      )

      // Update file status to success
      setUploadQueue(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: 'success' }
            : item
        )
      )

      return { success: true }
    } catch (error) {
      // Update file status to error
      setUploadQueue(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: 'error', errors: [error.message] }
            : item
        )
      )

      return { success: false, error: error.message }
    }
  }

  const onSubmit = async (formData) => {
    if (uploadQueue.length === 0) {
      toast.error('Please select files to upload')
      return
    }

    const validFiles = uploadQueue.filter(item => item.status === 'ready')
    if (validFiles.length === 0) {
      toast.error('No valid files to upload')
      return
    }

    setUploading(true)

    try {
      const results = await Promise.all(
        validFiles.map(fileItem => uploadFile(fileItem, formData))
      )

      const successCount = results.filter(r => r.success).length
      const failCount = results.length - successCount

      if (successCount > 0) {
        toast.success(`${successCount} file(s) uploaded successfully!`)
        
        if (onUploadComplete) {
          onUploadComplete()
        }
      }

      if (failCount > 0) {
        toast.error(`${failCount} file(s) failed to upload`)
      }

      // Reset form if all uploads successful
      if (failCount === 0) {
        reset()
        setUploadQueue([])
        setUploadProgress({})
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const getFileStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <SuccessIcon color="success" />
      case 'error':
        return <ErrorIcon color="error" />
      default:
        return <FileIcon />
    }
  }

  const validFilesCount = uploadQueue.filter(item => item.status === 'ready').length
  const totalSize = uploadQueue.reduce((total, item) => total + item.file.size, 0)

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      {/* Upload Zone */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          mb: 3,
          border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.divider}`,
          backgroundColor: isDragActive ? theme.palette.action.hover : 'transparent',
          cursor: 'pointer',
          transition: theme.transitions.create(['border-color', 'background-color']),
          textAlign: 'center',
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover
          }
        }}
      >
        <input {...getInputProps()} />
        <UploadIcon 
          sx={{ 
            fontSize: 48, 
            color: theme.palette.text.secondary, 
            mb: 2 
          }} 
        />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          or click to browse files
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Supported formats: PDF, DOC, DOCX, XLS, XLSX, CSV, JPG, PNG, GIF
          <br />
          Maximum size: 10MB per file
        </Typography>
      </Paper>

      {/* Metadata Form */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Document Information
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Controller
            name="title"
            control={control}
            rules={{ 
              required: uploadQueue.length > 1 ? false : 'Title is required for single uploads',
              minLength: { value: 3, message: 'Title must be at least 3 characters' }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Title"
                placeholder={uploadQueue.length > 1 ? "Leave empty to use filenames" : "Document title"}
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
              />
            )}
          />

          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                placeholder="Brief description of the document"
                multiline
                rows={3}
                fullWidth
              />
            )}
          />

          <Controller
            name="category"
            control={control}
            rules={{ required: 'Category is required' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.category}>
                <InputLabel>Category</InputLabel>
                <Select {...field} label="Category">
                  {DOCUMENT_CATEGORIES.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.category.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="is_public"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>Visibility</InputLabel>
                <Select {...field} label="Visibility">
                  <MenuItem value={true}>Public</MenuItem>
                  <MenuItem value={false}>Private</MenuItem>
                </Select>
              </FormControl>
            )}
          />
        </Box>
      </Box>

      {/* File Queue */}
      {uploadQueue.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Files to Upload ({validFilesCount} valid, {formatFileSize(totalSize)} total)
          </Typography>
          
          <List>
            {uploadQueue.map((fileItem) => {
              const { id, file, status, errors: fileErrors, progress } = fileItem
              const progressValue = uploadProgress[id] || 0

              return (
                <ListItem key={id} divider>
                  <ListItemIcon>
                    {getFileStatusIcon(status)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={file.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                        
                        {status === 'error' && fileErrors && (
                          <Typography variant="caption" color="error" display="block">
                            {fileErrors.join(', ')}
                          </Typography>
                        )}
                        
                        {uploading && status === 'ready' && (
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={progressValue} 
                              sx={{ borderRadius: 1 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {progressValue}%
                            </Typography>
                          </Box>
                        )}
                        
                        {status === 'success' && (
                          <Typography variant="caption" color="success.main" display="block">
                            Uploaded successfully
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => removeFile(id)}
                      disabled={uploading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            })}
          </List>
        </Box>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        {onClose && (
          <Button onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
        )}
        
        <Button
          type="submit"
          variant="contained"
          disabled={uploading || validFilesCount === 0}
          startIcon={uploading ? null : <UploadIcon />}
        >
          {uploading ? 'Uploading...' : `Upload ${validFilesCount} File(s)`}
        </Button>
      </Box>
    </Box>
  )
}

export default DocumentUpload