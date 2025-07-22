
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  MessageSquare, 
  X, 
  Send, 
  Volume2, 
  VolumeX,
  RotateCcw,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface InterviewSessionProps {
  jobApplication: any;
  onComplete: (score: number) => void;
  onExit: () => void;
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  score?: number;
  feedback?: string;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ jobApplication, onComplete, onExit }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [sessionStartTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const interviewQuestions = [
    "Tell me about yourself and your experience with frontend development.",
    "How do you approach debugging a complex JavaScript application?",
    "Describe a challenging project you worked on and how you overcame obstacles.",
    "How do you stay updated with the latest web development trends?",
    "What's your experience with React and modern JavaScript frameworks?"
  ];

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - sessionStartTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionStartTime]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with first question
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      type: 'ai',
      content: `Welcome to your interview for ${jobApplication.position} at ${jobApplication.company}! I'm your AI interviewer. Let's start with our first question: ${interviewQuestions[0]}`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    // Simulate AI response with scoring
    setTimeout(() => {
      const score = Math.floor(Math.random() * 30) + 70; // Random score between 70-100
      const feedback = generateFeedback(score);
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(currentQuestion, score),
        timestamp: new Date(),
        score,
        feedback
      };

      setMessages(prev => [...prev, aiResponse]);

      // Move to next question or complete interview
      if (currentQuestion < interviewQuestions.length - 1) {
        setTimeout(() => {
          setCurrentQuestion(prev => prev + 1);
          const nextQuestion: Message = {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: `Great! Let's move to the next question: ${interviewQuestions[currentQuestion + 1]}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, nextQuestion]);
        }, 2000);
      } else {
        // Complete interview
        setTimeout(() => {
          completeInterview();
        }, 2000);
      }
    }, 1500);
  };

  const generateFeedback = (score: number) => {
    if (score >= 90) return "Excellent answer! You demonstrated strong technical knowledge and communication skills.";
    if (score >= 80) return "Good answer! Consider providing more specific examples to strengthen your response.";
    if (score >= 70) return "Decent answer, but try to be more detailed and structured in your explanation.";
    return "Your answer could be improved. Focus on being more specific and demonstrating your expertise.";
  };

  const generateAIResponse = (questionIndex: number, score: number) => {
    const responses = [
      `Thank you for that introduction. ${generateFeedback(score)} I can see you have relevant experience.`,
      `Interesting approach to debugging. ${generateFeedback(score)} Your systematic thinking is valuable.`,
      `That sounds like a challenging project. ${generateFeedback(score)} Your problem-solving skills are evident.`,
      `Good awareness of industry trends. ${generateFeedback(score)} Staying current is crucial in our field.`,
      `Nice overview of your React experience. ${generateFeedback(score)} Your technical foundation seems solid.`
    ];
    
    return responses[questionIndex] || "Thank you for your response.";
  };

  const completeInterview = () => {
    const averageScore = Math.floor(Math.random() * 20) + 80; // Random final score
    setFinalScore(averageScore);
    setIsInterviewComplete(true);
    
    const completionMessage: Message = {
      id: 'completion',
      type: 'ai',
      content: `Congratulations! You've completed the interview. Your overall performance score is ${averageScore}/100. Would you like to download your detailed feedback report?`,
      timestamp: new Date(),
      score: averageScore
    };
    
    setMessages(prev => [...prev, completionMessage]);
    
    toast({
      title: "Interview Completed!",
      description: `You scored ${averageScore}/100. Great job!`,
      duration: 5000,
    });
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast({
        title: "Voice Recording Started",
        description: "Speak your answer clearly",
        duration: 2000,
      });
    } else {
      toast({
        title: "Voice Recording Stopped",
        description: "Converting speech to text...",
        duration: 2000,
      });
      // Simulate speech-to-text conversion
      setTimeout(() => {
        setCurrentMessage("This is a simulated speech-to-text response. In a real implementation, this would be the transcribed audio.");
      }, 1000);
    }
  };

  const downloadReport = () => {
    toast({
      title: "Downloading Report",
      description: "Your interview feedback report is being prepared...",
      duration: 3000,
    });
    // Simulate download
    setTimeout(() => {
      onComplete(finalScore);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      {/* Main Interview Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-sm border-b p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{jobApplication.logo}</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{jobApplication.position}</h1>
                <p className="text-gray-600">{jobApplication.company}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(elapsedTime)}
              </Badge>
              
              <Badge variant="outline">
                Question {currentQuestion + 1} of {interviewQuestions.length}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onExit}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </motion.header>

        {/* Progress Bar */}
        <div className="bg-white px-4 pb-4">
          <Progress 
            value={(currentQuestion / interviewQuestions.length) * 100} 
            className="h-2"
          />
        </div>

        {/* Interview Content */}
        <div className="flex-1 flex">
          {/* Video/Avatar Area */}
          <div className="flex-1 flex items-center justify-center p-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <div className="w-32 h-32 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow">
                <Bot className="w-16 h-16 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Interviewer</h2>
              <p className="text-gray-600 mb-6">I'm here to help you practice and improve</p>
              
              {/* Voice Controls */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  size="lg"
                  onClick={handleVoiceToggle}
                  className={`${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-green-500 hover:bg-green-600'
                  } text-white px-6 py-3`}
                >
                  {isRecording ? <MicOff className="w-5 h-5 mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="px-6 py-3"
                >
                  {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
              </div>
              
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-red-600 font-medium"
                >
                  🔴 Recording... Speak clearly
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Chat Sidebar */}
          <AnimatePresence>
            {isChatOpen && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="w-96 bg-white shadow-xl border-l"
              >
                <div className="h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Interview Chat
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsChatOpen(false)}
                        className="text-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <div className="flex items-center mb-1">
                              {message.type === 'user' ? (
                                <User className="w-4 h-4 mr-1" />
                              ) : (
                                <Bot className="w-4 h-4 mr-1" />
                              )}
                              <span className="text-xs opacity-75">
                                {message.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.content}</p>
                            
                            {message.score && (
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <div className="flex items-center justify-between text-xs">
                                  <span>Score: {message.score}/100</span>
                                  {message.score >= 80 ? (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                  )}
                                </div>
                                {message.feedback && (
                                  <p className="text-xs mt-1 opacity-75">{message.feedback}</p>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    {isInterviewComplete ? (
                      <div className="space-y-3">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            {finalScore}/100
                          </div>
                          <p className="text-sm text-gray-600 mb-4">Final Score</p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={downloadReport}
                            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Report
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={() => onComplete(finalScore)}
                            className="flex-1"
                          >
                            Accept Results
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setIsInterviewComplete(false);
                            setCurrentQuestion(0);
                            setMessages([]);
                            toast({
                              title: "Interview Restarted",
                              description: "Starting fresh practice session",
                              duration: 2000,
                            });
                          }}
                          className="w-full text-blue-600"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restart Interview
                        </Button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <Input
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          placeholder="Type your answer or use voice..."
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!currentMessage.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Toggle Button */}
        {!isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-6 right-6"
          >
            <Button
              onClick={() => setIsChatOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 shadow-lg"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default InterviewSession;
