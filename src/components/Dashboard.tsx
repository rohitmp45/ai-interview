import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  Plus, 
  BarChart3, 
  Calendar, 
  Settings, 
  LogOut, 
  Briefcase, 
  Play, 
  TrendingUp,
  Clock,
  Award,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import InterviewSession from '@/components/InterviewSession';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedJobApplication, setSelectedJobApplication] = useState<any>(null);
  const { toast } = useToast();

  const jobApplications = [
    {
      id: 1,
      company: 'Google',
      position: 'Senior Frontend Developer',
      status: 'Interview Scheduled',
      interviewDate: '2024-01-15',
      difficulty: 'Advanced',
      completed: false,
      score: null,
      logo: '🔍'
    },
    {
      id: 2,
      company: 'Microsoft',
      position: 'Full Stack Engineer',
      status: 'Applied',
      interviewDate: '2024-01-20',
      difficulty: 'Intermediate',
      completed: true,
      score: 85,
      logo: '⊞'
    },
    {
      id: 3,
      company: 'Apple',
      position: 'iOS Developer',
      status: 'Phone Screen',
      interviewDate: '2024-01-12',
      difficulty: 'Advanced',
      completed: false,
      score: null,
      logo: '🍎'
    },
    {
      id: 4,
      company: 'Netflix',
      position: 'React Developer',
      status: 'Technical Round',
      interviewDate: '2024-01-18',
      difficulty: 'Intermediate',
      completed: true,
      score: 92,
      logo: '🎬'
    }
  ];

  const recentStats = {
    totalInterviews: 12,
    averageScore: 87,
    improvementRate: 15,
    hoursSpent: 24
  };

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'applications', label: 'Job Applications', icon: Briefcase },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const startInterview = (application: any) => {
    setSelectedJobApplication(application);
    toast({
      title: "Starting Interview Session",
      description: `Preparing questions for ${application.position} at ${application.company}`,
      duration: 3000,
    });
  };

  if (selectedJobApplication) {
    return (
      <InterviewSession 
        jobApplication={selectedJobApplication}
        onComplete={(score) => {
          // Handle interview completion
          setSelectedJobApplication(null);
          toast({
            title: "Interview Completed!",
            description: `You scored ${score}/100. Great job!`,
            duration: 5000,
          });
        }}
        onExit={() => setSelectedJobApplication(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="flex">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -250 }}
          animate={{ x: 0 }}
          className="w-64 bg-white shadow-xl h-screen sticky top-0"
        >
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">AI Interview Coach</h2>
                <p className="text-sm text-gray-500">Welcome back, John!</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </Button>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
                  <p className="text-gray-600 mt-1">Track your interview preparation progress</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Application
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    label: 'Total Interviews', 
                    value: recentStats.totalInterviews, 
                    icon: Target, 
                    color: 'from-blue-500 to-blue-600',
                    change: '+3 this week'
                  },
                  { 
                    label: 'Average Score', 
                    value: `${recentStats.averageScore}%`, 
                    icon: Award, 
                    color: 'from-green-500 to-green-600',
                    change: '+5% improvement'
                  },
                  { 
                    label: 'Practice Hours', 
                    value: recentStats.hoursSpent, 
                    icon: Clock, 
                    color: 'from-purple-500 to-purple-600',
                    change: '+8 hrs this month'
                  },
                  { 
                    label: 'Applications', 
                    value: jobApplications.length, 
                    icon: Briefcase, 
                    color: 'from-orange-500 to-orange-600',
                    change: '2 pending'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                          </div>
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Recent Applications */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    Recent Job Applications
                  </CardTitle>
                  <CardDescription>
                    Your active job applications and interview progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobApplications.slice(0, 3).map((app, index) => (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">{app.logo}</div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{app.position}</h3>
                            <p className="text-sm text-gray-600">{app.company}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge variant={app.completed ? "default" : "secondary"}>
                            {app.status}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => startInterview(app)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Practice
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {activeTab === 'applications' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Job Applications</h1>
                  <p className="text-gray-600 mt-1">Manage your job applications and practice interviews</p>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Application
                </Button>
              </div>

              <div className="grid gap-6">
                {jobApplications.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-3xl">{app.logo}</div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{app.position}</h3>
                              <p className="text-gray-600">{app.company}</p>
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge variant="outline">{app.difficulty}</Badge>
                                <span className="text-sm text-gray-500">Interview: {app.interviewDate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {app.completed && app.score && (
                              <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{app.score}%</div>
                                <div className="text-xs text-gray-500">Last Score</div>
                              </div>
                            )}
                            <Badge 
                              variant={app.status === 'Interview Scheduled' ? "default" : "secondary"}
                              className={app.status === 'Interview Scheduled' ? 'bg-green-100 text-green-800' : ''}
                            >
                              {app.status}
                            </Badge>
                            <Button
                              onClick={() => startInterview(app)}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Interview
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Other tabs would be implemented similarly */}
          {activeTab === 'analytics' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600 mt-1">Track your interview performance over time</p>
              </div>
              
              <div className="grid gap-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Your improvement over the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Technical Skills</span>
                          <span>85%</span>
                        </div>
                        <Progress value={85} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Communication</span>
                          <span>92%</span>
                        </div>
                        <Progress value={92} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Problem Solving</span>
                          <span>78%</span>
                        </div>
                        <Progress value={78} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
