'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Loader2, Send, Image as ImageIcon, Mic, Bot, User, Settings, History, Plus, Copy, Download, MoreVertical, Sun, Moon, Trash2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { ThemeToggle } from '@/components/theme-toggle'
import { copyToClipboard, downloadImage, formatMessageTime } from '@/lib/utils-extended'
import { useToast } from '@/hooks/use-toast'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

const textModels = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'gpt-4', name: 'GPT-4' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'llama-2', name: 'Llama 2' },
  { id: 'mistral', name: 'Mistral' }
]

const imageModels = [
  { id: 'dall-e-3', name: 'DALL-E 3' },
  { id: 'stable-diffusion', name: 'Stable Diffusion' },
  { id: 'midjourney', name: 'Midjourney' }
]

const voiceModels = [
  { id: 'alloy', name: 'Alloy' },
  { id: 'echo', name: 'Echo' },
  { id: 'fable', name: 'Fable' },
  { id: 'onyx', name: 'Onyx' },
  { id: 'nova', name: 'Nova' },
  { id: 'shimmer', name: 'Shimmer' }
]

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [imagePrompt, setImagePrompt] = useState('')
  const [selectedImageModel, setSelectedImageModel] = useState('dall-e-3')
  const [voicePrompt, setVoicePrompt] = useState('')
  const [selectedVoiceModel, setSelectedVoiceModel] = useState('alloy')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    scrollToBottom()
  }, [currentSession?.messages, autoScroll])

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100 // Increased threshold for better detection
      setAutoScroll(isAtBottom)
    }
  }

  const scrollToBottom = (force = false) => {
    if ((force || autoScroll) && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleCopyMessage = async (content: string) => {
    const success = await copyToClipboard(content)
    if (success) {
      toast({
        title: "Copied to clipboard",
        description: "Message content has been copied to your clipboard.",
      })
    } else {
      toast({
        title: "Copy failed",
        description: "Failed to copy message to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadImage = async () => {
    if (!generatedImage) return
    
    try {
      // If it's a proxy URL, fetch it first to get the actual image data
      if (generatedImage.startsWith('/api/proxy-image')) {
        const response = await fetch(generatedImage)
        if (!response.ok) {
          throw new Error('Failed to fetch image for download')
        }
        
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `kuweni-ai-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // For direct URLs, use the existing downloadImage function
        await downloadImage(generatedImage, `kuweni-ai-${Date.now()}.png`)
      }
      
      toast({
        title: "Download started",
        description: "Image download has been initiated.",
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "Download failed",
        description: "Failed to download the image.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMessage = (messageId: string) => {
    if (!currentSession) return

    const updatedMessages = currentSession.messages.filter(msg => msg.id !== messageId)
    const updatedSession = {
      ...currentSession,
      messages: updatedMessages,
      title: updatedMessages.length > 0 ? currentSession.title : 'New Chat'
    }

    setCurrentSession(updatedSession)
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s))

    toast({
      title: "Message deleted",
      description: "The message has been removed from the conversation.",
    })
  }

  const handleDeleteSession = (sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId)
    setSessions(updatedSessions)
    
    if (currentSession?.id === sessionId) {
      setCurrentSession(updatedSessions.length > 0 ? updatedSessions[0] : null)
    }

    toast({
      title: "Chat deleted",
      description: "The chat session has been removed.",
    })
  }

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date()
    }
    setSessions(prev => [newSession, ...prev])
    setCurrentSession(newSession)
  }

  const handleSendMessage = async () => {
    if (!input.trim() || !currentSession || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      title: currentSession.messages.length === 0 ? input.slice(0, 50) + '...' : currentSession.title
    }

    setCurrentSession(updatedSession)
    setSessions(prev => prev.map(s => s.id === currentSession.id ? updatedSession : s))
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          sessionId: currentSession.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }

      const finalSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, assistantMessage]
      }

      setCurrentSession(finalSession)
      setSessions(prev => prev.map(s => s.id === currentSession.id ? finalSession : s))
    } catch (error) {
      console.error('Error:', error)
      
      // Add error message to the chat
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }

      const errorSession = {
        ...updatedSession,
        messages: [...updatedSession.messages, errorMessage]
      }

      setCurrentSession(errorSession)
      setSessions(prev => prev.map(s => s.id === currentSession.id ? errorSession : s))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return

    setImageLoading(true)
    setImageError(null)
    setGeneratedImage(null)
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          model: selectedImageModel
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate image')
      }

      const data = await response.json()
      console.log('Image generation response:', data)
      
      // Use the proxy URL instead of the direct URL to avoid CORS issues
      const imageUrl = data.proxyUrl || data.imageUrl
      setGeneratedImage(imageUrl)
      setImageLoading(false)
      
    } catch (error) {
      console.error('Error:', error)
      setImageError(error instanceof Error ? error.message : 'Failed to generate image')
      setImageLoading(false)
      toast({
        title: "Image generation failed",
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: "destructive",
      })
    }
  }

  const handleGenerateVoice = async () => {
    if (!voicePrompt.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: voicePrompt,
          voice: selectedVoiceModel
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate voice')
      }

      const data = await response.json()
      setGeneratedAudio(data.audioUrl)
    } catch (error) {
      console.error('Error:', error)
      alert(`Failed to generate voice: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - Hidden on mobile */}
      <div className="hidden md:flex md:w-64 lg:w-80 bg-muted border-r flex flex-col">
        <div className="p-4">
          <Button onClick={createNewSession} className="w-full" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-2">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`group relative p-3 rounded-lg cursor-pointer hover:bg-accent mb-1 ${
                  currentSession?.id === session.id ? 'bg-accent' : ''
                }`}
                onClick={() => setCurrentSession(session)}
              >
                <div className="text-sm font-medium truncate pr-8">{session.title}</div>
                <div className="text-xs text-muted-foreground">
                  {session.messages.length} messages
                </div>
                <div className="absolute top-2 right-2 opacity-70 hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this entire chat session? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteSession(session.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div className="p-4 border-t space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">About Us</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.open('/about', '_blank')}
              className="h-6 w-6 p-0 hover:bg-accent"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link">
                <path d="M15 3h6v6"/>
                <path d="M10 14 21 3"/>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="md:hidden border-b p-3 sm:p-4 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <Button onClick={createNewSession} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">New</span>
            </Button>
          </div>
          <h1 className="text-lg sm:text-xl font-bold">kuweni.ai 🇱🇰</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-b p-2 bg-muted/50">
          <nav className="flex items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <button 
              onClick={() => window.open('/', '_blank')}
              className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
            >
              New Tab
            </button>
            <button 
              onClick={() => window.open('/about', '_blank')}
              className="text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded"
            >
              About Us
            </button>
          </nav>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex border-b p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6">
              <h1 className="text-2xl font-bold">kuweni.ai 🇱🇰</h1>
              <nav className="flex items-center gap-4">
                <button 
                  onClick={() => window.open('/', '_blank')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  New Tab
                </button>
                <button 
                  onClick={() => window.open('/about', '_blank')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">Powered by Pollinations.AI</Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 mx-2 sm:mx-3 md:mx-4 mt-2 md:mt-4 h-10 sm:h-11 md:h-auto">
              <TabsTrigger value="chat" className="text-xs sm:text-sm">Chat</TabsTrigger>
              <TabsTrigger value="image" className="text-xs sm:text-sm">Image</TabsTrigger>
              <TabsTrigger value="voice" className="text-xs sm:text-sm">Voice</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col p-2 sm:p-3 md:p-4">
              {currentSession ? (
                <>
                  <div className="flex-1 overflow-hidden mb-2 sm:mb-3 md:mb-4">
                    <ScrollArea className="h-full max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh]" ref={scrollAreaRef} onScroll={handleScroll}>
                      <div className="space-y-2 sm:space-y-3 md:space-y-4 pb-4"> {/* Added padding for better scroll experience */}
                        {currentSession.messages.map(message => (
                          <div
                            key={message.id}
                            className={`flex gap-2 sm:gap-3 ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div className={`flex gap-2 sm:gap-3 max-w-[85%] sm:max-w-[80%] md:max-w-[75%] ${
                              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                              <div className="flex-shrink-0">
                                {message.role === 'user' ? (
                                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary-foreground" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-secondary rounded-full flex items-center justify-center">
                                    <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-secondary-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className={`rounded-lg p-2 sm:p-2.5 md:p-3 relative group ${
                                message.role === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <div className="prose prose-xs sm:prose-sm md:prose-sm max-w-none dark:prose-invert">
                                  <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                                <div className="absolute top-1 right-1 opacity-70 hover:opacity-100 transition-opacity">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className={`h-5 w-5 sm:h-6 sm:w-6 p-0 ${
                                          message.role === 'user' 
                                            ? 'hover:bg-primary/20' 
                                            : 'hover:bg-accent'
                                        }`}
                                      >
                                        <MoreVertical className="h-3 w-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleCopyMessage(message.content)}>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Copy
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <span className="text-xs text-muted-foreground">
                                          {formatMessageTime(message.timestamp)}
                                        </span>
                                      </DropdownMenuItem>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Are you sure you want to delete this message? This action cannot be undone.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeleteMessage(message.id)}>
                                              Delete
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex gap-2 sm:gap-3 justify-start">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-secondary rounded-full flex items-center justify-center">
                              <Bot className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-secondary-foreground" />
                            </div>
                            <div className="bg-muted rounded-lg p-2 sm:p-2.5 md:p-3">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="border-t pt-2 sm:pt-3 md:pt-4">
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue placeholder="Select model" />
                        </SelectTrigger>
                        <SelectContent>
                          {textModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1 resize-none"
                        rows={1}
                        style={{ minHeight: '2.5rem', maxHeight: '8rem' }}
                      />
                      <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()} size="sm" className="sm:size-auto">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    {!autoScroll && (
                      <Button 
                        onClick={() => scrollToBottom(true)}
                        variant="outline" 
                        size="sm"
                        className="mt-2"
                      >
                        Scroll to bottom
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center p-4">
                    <h2 className="text-xl sm:text-2xl font-bold mb-4">Welcome to kuweni.ai</h2>
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">Start a new chat to begin</p>
                    <Button onClick={createNewSession}>
                      <Plus className="w-4 h-4 mr-2" />
                      Start New Chat
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="image" className="flex-1 p-2 sm:p-3 md:p-4 overflow-hidden">
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5 md:space-y-6 h-full flex flex-col">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Generate Image</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Image Prompt</label>
                      <Textarea
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Describe the image you want to generate..."
                        rows={3}
                        style={{ minHeight: '3rem', maxHeight: '10rem' }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Model</label>
                      <Select value={selectedImageModel} onValueChange={setSelectedImageModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleGenerateImage} 
                      disabled={imageLoading || !imagePrompt.trim()}
                      className="w-full"
                    >
                      {imageLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ImageIcon className="w-4 h-4 mr-2" />
                      )}
                      {imageLoading ? 'Generating...' : 'Generate Image'}
                    </Button>
                  </CardContent>
                </Card>

                {(generatedImage || imageLoading || imageError) && (
                  <Card className="flex-1 flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl flex items-center justify-between">
                        {imageLoading ? 'Generating Image...' : imageError ? 'Error' : 'Generated Image'}
                        {generatedImage && !imageError && (
                          <Button onClick={handleDownloadImage} variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center min-h-0">
                      {imageLoading && (
                        <div className="flex items-center justify-center h-full w-full">
                          <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">Generating your image...</p>
                          </div>
                        </div>
                      )}
                      
                      {imageError && (
                        <div className="flex items-center justify-center h-full w-full">
                          <div className="text-center">
                            <div className="text-destructive mb-4">❌</div>
                            <p className="text-sm text-muted-foreground mb-4">{imageError}</p>
                            <Button 
                              onClick={handleGenerateImage} 
                              variant="outline" 
                              size="sm"
                              disabled={imageLoading || !imagePrompt.trim()}
                            >
                              Try Again
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {generatedImage && !imageError && !imageLoading && (
                        <div className="relative group w-full h-full flex items-center justify-center">
                          <ScrollArea className="w-full h-full max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] overflow-auto">
                            <div className="flex items-center justify-center min-h-full p-4">
                              <img 
                                src={generatedImage} 
                                alt={`AI generated image: ${imagePrompt}`}
                                className="max-w-full h-auto rounded-lg object-contain shadow-lg"
                                onLoad={() => console.log('Image loaded successfully')}
                                onError={(e) => {
                                  console.error('Image render error:', e)
                                  console.log('Failed image URL:', generatedImage)
                                  setImageError('Failed to display the generated image. Please try generating again.')
                                }}
                              />
                            </div>
                          </ScrollArea>
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <Button onClick={handleDownloadImage} variant="secondary">
                              <Download className="w-4 h-4 mr-2" />
                              Download Image
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="voice" className="flex-1 p-2 sm:p-3 md:p-4">
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-5 md:space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Generate Voice</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Text to Speech</label>
                      <Textarea
                        value={voicePrompt}
                        onChange={(e) => setVoicePrompt(e.target.value)}
                        placeholder="Enter the text you want to convert to speech..."
                        rows={3}
                        style={{ minHeight: '3rem', maxHeight: '10rem' }}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Voice</label>
                      <Select value={selectedVoiceModel} onValueChange={setSelectedVoiceModel}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {voiceModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleGenerateVoice} 
                      disabled={isLoading || !voicePrompt.trim()}
                      className="w-full"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Mic className="w-4 h-4 mr-2" />
                      )}
                      {isLoading ? 'Generating...' : 'Generate Voice'}
                    </Button>
                  </CardContent>
                </Card>

                {generatedAudio && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg sm:text-xl">Generated Audio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <audio controls className="w-full">
                        <source src={generatedAudio} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}