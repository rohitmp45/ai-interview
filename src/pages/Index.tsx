
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Users, BarChart3, MessageSquare, Mic, Download, Target, Zap, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AuthModal from '@/components/AuthModal';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const { toast } = useToast();

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setIsAuthModalOpen(false);
    toast({
      title: "Welcome to AI Interview Coach!",
      description: "Ready to ace your next interview?",
      duration: 3000,
    });
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  if (isAuthenticated) {
    return <Dashboard />;
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Questions",
      description: "Get personalized interview questions powered by GPT-4o",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Mic,
      title: "Voice Recognition",
      description: "Practice speaking naturally with real-time voice interaction",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: BarChart3,
      title: "Performance Analytics",
      description: "Track your progress with detailed feedback and scoring",
      gradient: "from-green-500 to-blue-600"
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description: "Interactive conversation flow with instant AI responses",
      gradient: "from-orange-500 to-red-600"
    },
    {
      icon: Target,
      title: "Role-Specific Prep",
      description: "Tailored questions for your specific job applications",
      gradient: "from-cyan-500 to-blue-600"
    },
    {
      icon: Download,
      title: "Export Results",
      description: "Download your interview feedback and performance reports",
      gradient: "from-indigo-500 to-purple-600"
    }
  ];

  const stats = [
    { label: "Success Rate", value: "94%", icon: Target },
    { label: "Questions Asked", value: "50K+", icon: MessageSquare },
    { label: "Happy Users", value: "2.5K+", icon: Users },
    { label: "Average Score", value: "8.7/10", icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="container mx-auto px-4 py-6"
      >
        <nav className="flex items-center justify-between">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Interview Coach
            </span>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => openAuthModal('login')}
              className="text-slate-600 hover:text-blue-600 transition-colors"
            >
              Login
            </Button>
            <Button 
              onClick={() => openAuthModal('signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Get Started
            </Button>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            <Zap className="w-4 h-4 mr-1" />
            Powered by GPT-4o
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Ace Your Next
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block">
              Interview
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Practice with our AI-powered interview coach. Get real-time feedback, 
            personalized questions, and boost your confidence before the big day.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg"
              onClick={() => openAuthModal('signup')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Start Practicing
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => openAuthModal('login')}
              className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg transition-all duration-300"
            >
              <Shield className="w-5 h-5 mr-2" />
              Sign In
            </Button>
          </div>
        </motion.div>

        {/* Floating Animation */}
        <motion.div
          className="mt-16 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-3xl animate-pulse-slow" />
          <div className="relative glass rounded-3xl p-8 max-w-2xl mx-auto animate-float">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Why Choose AI Interview Coach?
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need to prepare for your dream job interview
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-slate-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20" />
          <Card className="relative border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Land Your Dream Job?
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of successful candidates who aced their interviews with our AI coach
              </p>
              <Button 
                size="lg"
                onClick={() => openAuthModal('signup')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onSuccess={handleAuthSuccess}
        onModeChange={(mode) => setAuthMode(mode)}
      />
    </div>
  );
};

export default Index;
