import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Skeleton
} from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { formatDate } from '../../utils/helpers'

// Interactive activity chart component with smooth animations
// Displays user activity trends over time with responsive design
const ActivityChart = ({ 
  data = [], 
  loading = false, 
  title = "Activity Overview",
  type = "line" // "line" or "area"
}) => {
  const theme = useTheme()

  // Sample data for development/demo
  const sampleData = [
    { date: '2024-01-01', users: 45, documents: 12, news: 3 },
    { date: '2024-01-02', users: 52, documents: 18, news: 5 },
    { date: '2024-01-03', users: 48, documents: 15, news: 2 },
    { date: '2024-01-04', users: 61, documents: 22, news: 7 },
    { date: '2024-01-05', users: 55, documents: 19, news: 4 },
    { date: '2024-01-06', users: 67, documents: 25, news: 6 },
    { date: '2024-01-07', users: 73, documents: 28, news: 8 },
    { date: '2024-01-08', users: 69, documents: 24, news: 5 },
    { date: '2024-01-09', users: 58, documents: 20, news: 3 },
    { date: '2024-01-10', users: 64, documents: 23, news: 7 },
    { date: '2024-01-11', users: 71, documents: 26, news: 9 },
    { date: '2024-01-12', users: 76, documents: 30, news: 6 },
    { date: '2024-01-13', users: 82, documents: 33, news: 8 },
    { date: '2024-01-14', users: 78, documents: 29, news: 5 }
  ]

  const chartData = data.length > 0 ? data : sampleData

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Card
          sx={{
            p: 2,
            boxShadow: theme.shadows[8],
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            {formatDate(label, 'MMM dd, yyyy')}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: entry.color,
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2" color="text.secondary">
                {entry.name}: {entry.value}
              </Typography>
            </Box>
          ))}
        </Card>
      )
    }
    return null
  }

  // Loading skeleton
  if (loading) {
    return (
      <Card sx={{ height: 400 }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={320} />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ height: 400 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        
        <Box sx={{ width: '100%', height: 320, mt: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            {type === "area" ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="documentsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.secondary.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.secondary.main} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="newsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme.palette.divider}
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  tickFormatter={(value) => formatDate(value, 'MMM dd')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  fill="url(#usersGradient)"
                  name="Users"
                />
                <Area
                  type="monotone"
                  dataKey="documents"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={3}
                  fill="url(#documentsGradient)"
                  name="Documents"
                />
                <Area
                  type="monotone"
                  dataKey="news"
                  stroke={theme.palette.success.main}
                  strokeWidth={3}
                  fill="url(#newsGradient)"
                  name="News"
                />
              </AreaChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme.palette.divider}
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="date"
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  tickFormatter={(value) => formatDate(value, 'MMM dd')}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={theme.palette.primary.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                  name="Users"
                />
                <Line
                  type="monotone"
                  dataKey="documents"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.palette.secondary.main, strokeWidth: 2 }}
                  name="Documents"
                />
                <Line
                  type="monotone"
                  dataKey="news"
                  stroke={theme.palette.success.main}
                  strokeWidth={3}
                  dot={{ fill: theme.palette.success.main, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: theme.palette.success.main, strokeWidth: 2 }}
                  name="News"
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ActivityChart