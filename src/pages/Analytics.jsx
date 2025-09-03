import React, { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Article as ArticleIcon,
  CloudDownload as DownloadIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
} from 'chart.js'
import { api } from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
)

const Analytics = () => {
  const [stats, setStats] = useState({})
  const [monthlyData, setMonthlyData] = useState([])
  const [roleDistribution, setRoleDistribution] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState(6)

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const [statsResponse, monthlyResponse, roleResponse] = await Promise.all([
        api.get('/stats/dashboard'),
        api.get(`/stats/monthly-activity?months=${timeRange}`),
        api.get('/stats/role-distribution')
      ])

      setStats(statsResponse.data)
      setMonthlyData(monthlyResponse.data)
      setRoleDistribution(roleResponse.data)
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const MetricCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            p: 1, 
            borderRadius: 2, 
            backgroundColor: `${color}.main`,
            color: 'white',
            mr: 2 
          }}>
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {title}
            </Typography>
          </Box>
        </Box>
        {change !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUpIcon 
              fontSize="small" 
              sx={{ 
                mr: 0.5, 
                color: change >= 0 ? 'success.main' : 'error.main',
                transform: change < 0 ? 'rotate(180deg)' : 'none'
              }} 
            />
            <Typography 
              variant="body2" 
              sx={{ 
                color: change >= 0 ? 'success.main' : 'error.main' 
              }}
            >
              {Math.abs(change)}% {change >= 0 ? 'increase' : 'decrease'}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Activity Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const chartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Users',
        data: monthlyData.map(item => item.users),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
      {
        label: 'News Articles',
        data: monthlyData.map(item => item.news),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.1,
      },
      {
        label: 'Documents',
        data: monthlyData.map(item => item.documents),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1,
      },
    ],
  }

  const roleChartData = {
    labels: roleDistribution.map(item => item.role),
    datasets: [
      {
        data: roleDistribution.map(item => item.count),
        backgroundColor: [
          '#FF6384',
          '#36A2EB', 
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40'
        ],
        borderWidth: 2,
      },
    ],
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Analytics Dashboard</Typography>
        <LinearProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Analytics Dashboard
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value={3}>3 Months</MenuItem>
            <MenuItem value={6}>6 Months</MenuItem>
            <MenuItem value={12}>12 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Users"
            value={stats.users?.total || 0}
            change={stats.users?.growth_percentage}
            icon={<PeopleIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Published News"
            value={stats.news?.published || 0}
            change={stats.news?.growth_percentage}
            icon={<ArticleIcon />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Documents"
            value={stats.documents?.total || 0}
            change={stats.documents?.growth_percentage}
            icon={<DownloadIcon />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Downloads"
            value={stats.documents?.total_downloads || 0}
            icon={<AnalyticsIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Activity Trends</Typography>
            <Line data={chartData} options={chartOptions} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '400px' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>User Roles Distribution</Typography>
            <Box sx={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Doughnut data={roleChartData} options={{ maintainAspectRatio: false }} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* User Activity Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recent Activity Summary</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">New Users</TableCell>
                <TableCell align="right">News Articles</TableCell>
                <TableCell align="right">Documents</TableCell>
                <TableCell align="right">Downloads</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {monthlyData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {row.month}
                  </TableCell>
                  <TableCell align="right">{row.users}</TableCell>
                  <TableCell align="right">{row.news}</TableCell>
                  <TableCell align="right">{row.documents}</TableCell>
                  <TableCell align="right">{row.downloads}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default Analytics