'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { ArrowLeft, Bot, Image as ImageIcon, Mic, Users, Target, Zap, Shield } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Bot,
      title: 'AI Chat',
      description: 'Conversational AI with multiple model support including GPT-4, Claude, and more.'
    },
    {
      icon: ImageIcon,
      title: 'Image Generation',
      description: 'Create stunning images from text descriptions using advanced AI models.'
    },
    {
      icon: Mic,
      title: 'Voice Synthesis',
      description: 'Convert text to natural-sounding speech with various voice options.'
    }
  ]

  const values = [
    {
      icon: Users,
      title: 'User-Focused',
      description: 'Designed with simplicity and ease of use in mind.'
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Leveraging cutting-edge AI technology for the best results.'
    },
    {
      icon: Zap,
      title: 'Speed',
      description: 'Fast and responsive AI interactions for seamless experience.'
    },
    {
      icon: Shield,
      title: 'Reliability',
      description: 'Built with robust error handling and fallback mechanisms.'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => window.history.back()} 
              variant="outline" 
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">About kuweni.ai</h1>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline">Powered by Pollinations.AI</Badge>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Welcome to kuweni.ai
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your comprehensive AI platform powered by Pollinations.AI, offering chat, image generation, 
            and voice synthesis capabilities in one seamless interface.
          </p>
        </div>

        {/* Features Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">What We Offer</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our powerful AI features designed to enhance your creativity and productivity.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">Our Values</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide our development and service delivery.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <CardTitle className="text-lg">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Technology Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">Powered By</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with modern technologies and powered by leading AI APIs.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="font-semibold mb-2">Frontend</div>
                  <div className="text-sm text-muted-foreground">Next.js 15, React, TypeScript</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold mb-2">Styling</div>
                  <div className="text-sm text-muted-foreground">Tailwind CSS, shadcn/ui</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold mb-2">AI Engine</div>
                  <div className="text-sm text-muted-foreground">Pollinations.AI APIs</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold mb-2">Features</div>
                  <div className="text-sm text-muted-foreground">Dark Mode, Responsive, PWA</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6">
          <h3 className="text-3xl font-bold">Ready to Get Started?</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the power of AI with kuweni.ai. Start chatting, generating images, 
            or creating voice content today.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => window.open('/', '_blank')}
              size="lg"
            >
              Try kuweni.ai
            </Button>
            <Button 
              onClick={() => window.open('/', '_blank')}
              variant="outline" 
              size="lg"
            >
              Open in New Tab
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-8 border-t">
          <p>&copy; 2024 kuweni.ai. Powered by Pollinations.AI. Built with Next.js and modern web technologies.</p>
        </div>
      </div>
    </div>
  )
}