import { useState, useRef, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { BACKEND_URL, getToken, WEBSOCKET_URL, WEBSOCKET_CONFIG } from "../config"
import { useUser } from "../contexts/userContext"
import toast from "react-hot-toast"
import { 
  Play, 
  Pause, 
  Square, 
  Upload, 
  ArrowLeft,
  Loader2
} from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export const Interview = function () {
  const { jobId, applicationId } = useParams<{ jobId: string, applicationId: string }>()
  const navigate = useNavigate()
  const { user } = useUser()
  
  // Core states
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false)
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string>("")
  const [resumeText, setResumeText] = useState<string>("")
  const [micEnabled, setMicEnabled] = useState<boolean>(false)
  const [interviewResult, setInterviewResult] = useState<{score: number, reasoning: string} | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'failed'>('connecting')
  
  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const silenceTimeoutRef = useRef<number | null>(null)
  const micEnabledRef = useRef<boolean>(false)
  const websocketRef = useRef<WebSocket | null>(null)
  const retryCountRef = useRef<number>(0)
  const maxRetriesRef = useRef<number>(WEBSOCKET_CONFIG.maxRetries)
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isManualCloseRef = useRef<boolean>(false)
  
  const manualRetry = () => {
    retryCountRef.current = 0 // Reset retry count for manual retry
    setConnectionStatus('connecting')
    
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }
    
    // Close existing connection if any
    if (websocketRef.current) {
      isManualCloseRef.current = true
      websocketRef.current.close()
      websocketRef.current = null
      isManualCloseRef.current = false
    }
    
    // Start new connection
    connectWebSocket()
  }
  
  const connectWebSocket = () => {
    if (!applicationId || !user.userId) return
    
    setConnectionStatus('connecting')
    
    try {
      websocketRef.current = new WebSocket(WEBSOCKET_URL)
      
      websocketRef.current.onopen = () => {
        retryCountRef.current = 0 
        setConnectionStatus('connected')
        
        websocketRef.current?.send(JSON.stringify({
          event:'join',
          userId:user.userId,
          jobId:jobId,
          name:user.name,
        }))
        
        if (retryCountRef.current > 0) {
          toast.success('Reconnected to interview server')
        }
      }
      
      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('failed')
        if (retryCountRef.current === 0) {
          toast.error('Failed to connect to interview server')
        }
      }
      
      websocketRef.current.onclose = (event) => {
        // Don't retry if it was a manual close or normal closure
        if (isManualCloseRef.current || event.code === 1000) {
          return
        }
        
        // Retry connection with exponential backoff
        if (retryCountRef.current < maxRetriesRef.current) {
          retryCountRef.current++
          setConnectionStatus('connecting')
          const delay = Math.min(WEBSOCKET_CONFIG.baseDelay * Math.pow(2, retryCountRef.current - 1), WEBSOCKET_CONFIG.maxDelay)
          toast.error(`Connection lost. Retrying... (${retryCountRef.current}/${maxRetriesRef.current})`)
          
          retryTimeoutRef.current = setTimeout(() => {
            connectWebSocket()
          }, delay)
        } else {
          setConnectionStatus('failed')
        }
      }
      

      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      toast.error('Failed to create WebSocket connection')
    }
  }
  
  useEffect(() => {
    if (applicationId && user.userId) {
      connectWebSocket()
    }
    
    // Cleanup function
    return () => {
      isManualCloseRef.current = true
      
      // Clear any pending retry timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
        retryTimeoutRef.current = null
      }
      
      // Close WebSocket connection
      if (websocketRef.current) {
        try {
          websocketRef.current.send(JSON.stringify({
            event:'leave',
            userId:user.userId,
            jobId:jobId,
          }))
        } catch (error) {
          console.error('Error sending leave message:', error)
        }
        
        websocketRef.current.close()
        websocketRef.current = null
      }
    }
  }, [applicationId, user.userId, jobId])
  // Fetch resume content and check existing results when component mounts
  useEffect(() => {
    const fetchResume = async () => {
      if (!applicationId || !user.userId) return
      
      try {
        
        // Get user details using the userId from context
        const userDetailsResponse = await fetch(`${BACKEND_URL}/userdetails/getuserdetails/${user.userId}`, {
          method: "GET",
          headers: {
            Authorization: getToken() || "",
          },
        })
        
        if (userDetailsResponse.ok) {
          const userDetailsData = await userDetailsResponse.json()
          // Check if there's a resume link in the user details
          const resumeLink = userDetailsData.result?.resumelink
          
          if (resumeLink) {
            // Parse the resume using the parseresume endpoint
            const parseResponse = await fetch(`${BACKEND_URL}/application/parseresume`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: getToken() || "",
              },
              body: JSON.stringify({
                resumelink: resumeLink
              }),
            })
            
            if (parseResponse.ok) {
              const parseData = await parseResponse.json()
              const resume = parseData.resumeText || ""
              setResumeText(resume)
            } else {
              setResumeText("")
            }
          } else {
            setResumeText("")
          }
        } else {
          setResumeText("")
        }
      } catch (error) {
        setResumeText("") // Continue without resume if fetch fails
      }
    }
    
    fetchResume()
  }, [applicationId, user.userId])

  // Check for existing interview results
  useEffect(() => {
    const checkExistingResults = async () => {
      if (!applicationId) return
      
      try {
        const response = await fetch(`${BACKEND_URL}/application/${applicationId}`, {
          method: "GET",
          headers: {
            Authorization: getToken() || "",
          },
        })
        
        if (response.ok) {
          const appData = await response.json()
          
          // If there's already a score and comment, show the results
          if (appData.relevancescore !== null && appData.relevancecomment !== null) {
            setInterviewResult({
              score: appData.relevancescore,
              reasoning: appData.relevancecomment
            })
          }
        }
      } catch (error) {
        console.warn("Could not check existing results:", error)
      }
    }
    
    checkExistingResults()
  }, [applicationId])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Start Speech Recognition - with automatic mic management
  const startSpeechRecognition = (clearTranscript = false) => {
    // Don't start if mic is not enabled
    if (!micEnabledRef.current) {
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this browser.")
      return
    }

    // Clean up any existing recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }

    // Clear transcript only when starting fresh, not when resuming
    if (clearTranscript) {
      setTranscript("")
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
    }

    recognition.onresult = (event: any) => {
      
      // Only process if mic is enabled and interviewer is not speaking and no request is being processed
      if (!micEnabledRef.current || isInterviewerSpeaking || isLoading) {
        return
      }
      
      // Also check if any audio is currently playing
      const isAudioPlaying = audioRef.current && !audioRef.current.paused
      if (isAudioPlaying) {
        return
      }
      
      let currentTranscript = ""
      let hasFinalResult = false
      
      // Get the latest complete transcript from all results
      for (let i = 0; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript
        currentTranscript += chunk
        if (event.results[i].isFinal) {
          hasFinalResult = true
        }
      }
      
      // Replace the transcript with the complete current text
      setTranscript(currentTranscript)

      // Only set timeout for final results to prevent premature sending
      if (hasFinalResult && currentTranscript.trim()) {
        // Reset silence timer
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = window.window.setTimeout(() => {
          // Get the current full transcript for sending
          setTranscript(fullTranscript => {
            if (fullTranscript.trim() && micEnabledRef.current && !isInterviewerSpeaking && !isLoading) {
              // Double-check before sending
              if (micEnabledRef.current && !isLoading && !isInterviewerSpeaking) {
                sendTranscriptToBackend(fullTranscript.trim())
                return "" // reset after sending
              }
            }
            return fullTranscript // keep current transcript if not sending
          })
        }, 3000) // Reduced to 3 seconds for faster response
      }
    }

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event)
      
      // Handle specific errors
      if (event.error === 'no-speech') {
        window.setTimeout(() => {
          if (interviewStarted && micEnabledRef.current && !isInterviewerSpeaking && !isLoading) {
            startSpeechRecognition()
          }
        }, 1000)
      } else if (event.error === 'network') {
        toast.error("Network error with speech recognition")
      } else if (event.error === 'not-allowed') {
        toast.error("Microphone permission denied")
      } else if (event.error === 'aborted') {
      } else if (event.error === 'audio-capture') {
        toast.error("Microphone not working properly")
      } else {
        console.error("Unknown speech recognition error:", event.error)
      }
      
      // Restart recognition after a short delay for recoverable errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        window.setTimeout(() => {
          if (interviewStarted && micEnabledRef.current && !isInterviewerSpeaking && !isLoading) {
            startSpeechRecognition()
          }
        }, 1000)
      }
    }

    recognition.onend = () => {
      // Restart recognition if interview is still active and mic is enabled and not processing
      if (interviewStarted && micEnabledRef.current && !isInterviewerSpeaking && !isLoading) {
        window.setTimeout(() => {
          startSpeechRecognition(false) // Don't clear transcript when auto-restarting
        }, 100) // Very fast restart
      }
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
    } catch (error) {
      console.error("Failed to start speech recognition:", error)
      toast.error("Failed to start microphone")
    }
  }

  // Restart speech recognition when interviewer stops speaking
  const _restartSpeechRecognition = () => {
    if (recognitionRef.current && interviewStarted) {
      recognitionRef.current.stop()
      // Clear any existing timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      // Immediate restart for faster response
      window.setTimeout(() => {
        if (interviewStarted && micEnabledRef.current && !isInterviewerSpeaking && !isLoading) {
          startSpeechRecognition(false) // Don't clear transcript when restarting
        }
      }, 200) // Much faster restart - only 200ms delay
    } else if (interviewStarted && micEnabledRef.current && !isInterviewerSpeaking && !isLoading) {
      // Start fresh if no existing recognition
      startSpeechRecognition(false)
    }
  }

  // Stop speech recognition
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
  }

  // Enable microphone manually
  const enableMic = () => {
    
    // Don't allow mic if interview is completed
    if (interviewResult) {
      toast.error("Interview is already completed. Microphone is disabled.")
      return
    }
    
    if (interviewStarted && !isPaused && !isInterviewerSpeaking && !isLoading) {
      setMicEnabled(true)
      micEnabledRef.current = true
      
      // Start speech recognition after state update
      window.setTimeout(() => {
        startSpeechRecognition()
      }, 100)
      
      toast.success("Microphone enabled! You can now speak.")
    } else {
      toast.error("Cannot enable mic right now. Wait for AI to finish or resume interview.")
    }
  }

  // Disable microphone manually
  const disableMic = () => {
    setMicEnabled(false)
    micEnabledRef.current = false
    stopSpeechRecognition()
    toast.success("Microphone disabled.")
  }

  // Send transcript to backend
  const sendTranscriptToBackend = async (text: string) => {
    if (isLoading) return
    
    setIsLoading(true)
    setTranscript("")
    
    try {
      const newMessage: Message = { role: "user", content: text }
      
      // Create complete message history locally (including the new message)
      const completeMessageHistory = [...(messages || []), newMessage]
      
      // Update state for UI
      setMessages(completeMessageHistory)
      
      
      // Get AI response from streaming endpoint
      const response = await fetch(`${BACKEND_URL}/application/chat/stream/${applicationId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: getToken() || "",
        },
        body: JSON.stringify({
          resumeText,
          message: text,
          messageHistory: completeMessageHistory
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No response body")

      let aiResponse = ""
      setIsInterviewerSpeaking(true)
      
      // Read stream
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = new TextDecoder().decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                aiResponse += data.content
              }
              if (data.isComplete) {
                break
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      // Play AI response using TTS endpoint
      if (aiResponse.trim()) {
        // Disable mic and stop speech recognition while AI is speaking
        setMicEnabled(false)
        micEnabledRef.current = false
        stopSpeechRecognition()
        
        const audioResponse = await fetch(`${BACKEND_URL}/application/tts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken() || "",
          },
          body: JSON.stringify({ text: aiResponse }),
        })

        if (audioResponse.ok) {
          const audioBlob = await audioResponse.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          
          // Store audio reference for detection
          audioRef.current = audio
          
          audio.onended = () => {
            setIsInterviewerSpeaking(false)
            URL.revokeObjectURL(audioUrl)
            audioRef.current = null
            
            // Don't auto-restart mic - user must manually enable it
            toast.success("AI finished speaking. Click 'Enable Mic' to continue.")
          }
          
          audio.play()
        }
        
        setMessages(prev => [...(prev || []), { role: "assistant", content: aiResponse }])
      }
      
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    } finally {
      setIsLoading(false)
    }
  }

  // Start interview
  const startInterview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      streamRef.current = stream
      // Store the stream for video display
      setVideoUrl("stream") // Use a placeholder since we'll use srcObject
      
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.start(1000) // Collect data every 1 second
      setIsRecording(true)
      setInterviewStarted(true)
      
      toast.success("Interview started! Click 'Enable Mic' to begin speaking.")
      
    } catch (error) {
      console.error("Error starting interview:", error)
      toast.error("Failed to start interview. Please check permissions.")
    }
  }

  // Pause interview
  const pauseInterview = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause()
      setIsRecording(false)
      setIsPaused(true)
      stopSpeechRecognition()
      toast.success("Interview paused")
    }
  }

  // Resume interview
  const resumeInterview = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume()
      setIsRecording(true)
      setIsPaused(false)
      toast.success("Interview resumed. Click 'Enable Mic' to begin speaking.")
    }
  }

  // Stop interview and auto-submit
  const stopInterview = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      setInterviewStarted(false)
      stopSpeechRecognition()
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
    
    // Always submit, even without video
    toast.success("Interview completed! Submitting...")
    await submitInterview()
  }

  // Submit interview
  const submitInterview = async () => {
    const loadingToastId = toast.loading("Submitting interview...", { duration: Infinity })
    
    try {
      const formData = new FormData()
      
      // Check if video exists and is not too large (500MB limit)
      if (mediaRecorderRef.current && chunksRef.current.length > 0) {
        const videoBlob = new Blob(chunksRef.current, { type: "video/webm" })
        const videoSizeMB = videoBlob.size / (1024 * 1024)
        
        if (videoSizeMB <= 500) {
          setVideoBlob(videoBlob)
          formData.append("video", videoBlob)
          toast.success(`Video included (${videoSizeMB.toFixed(1)}MB)`)
        } else {
          toast.error(`Video too large (${videoSizeMB.toFixed(1)}MB), submitting text only`)
        }
      }
      
      formData.append("resumeText", resumeText)
      formData.append("messageHistory", JSON.stringify(messages))
      
      const response = await fetch(`${BACKEND_URL}/application/${applicationId}/submit`, {
        method: "POST",
        headers: {
          Authorization: getToken() || "",
        },
        body: formData,
      })

      if (!response.ok) {
        // Check if it's a 409 conflict (already submitted)
        if (response.status === 409) {
          const conflictResult = await response.json()
          
          // Show existing results
          setInterviewResult({
            score: conflictResult.score,
            reasoning: conflictResult.reasoning
          })
          
          toast.dismiss(loadingToastId)
          toast.success("Interview was already submitted. Showing previous results.")
          return
        }
        throw new Error("Failed to submit interview")
      }

      const result = await response.json()
      
      // Extract score and reasoning from the response
      if (result.resume) {
        try {
          // The backend returns the AI response in result.resume
          let jsonText = result.resume.trim()
          
          // Remove markdown code blocks if present
          if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '')
          } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '')
          }
          
          const parsedResult = JSON.parse(jsonText)
          setInterviewResult({
            score: parsedResult.score,
            reasoning: parsedResult.reasoning
          })
          
        } catch (parseError) {
          console.error("Failed to parse interview result:", parseError)
          setInterviewResult({
            score: 0,
            reasoning: "Unable to parse interview results"
          })
        }
      }

      toast.dismiss(loadingToastId)
      toast.success("Interview submitted successfully!")
      // Don't navigate immediately - show results first
      
    } catch (error) {
      console.error("Error submitting interview:", error)
      toast.dismiss(loadingToastId)
      toast.error("Failed to submit interview")
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-auto" style={{background: 'linear-gradient(to bottom right, #0f0f0f, #1a1a1a, #2a2a2a)'}}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gray-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/jobs")}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors duration-200"
            style={{backgroundColor: '#1a1a1a', borderColor: '#374151', color: 'white'}}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2a2a'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a1a1a'}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">AI Interview</h1>
            <p className="text-gray-400">Job ID: {jobId}</p>
            
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                connectionStatus === 'disconnected' ? 'bg-gray-400' :
                'bg-red-500'
              }`}></div>
              <span className={`text-xs font-medium ${
                connectionStatus === 'connected' ? 'text-green-400' :
                connectionStatus === 'connecting' ? 'text-yellow-400' :
                connectionStatus === 'disconnected' ? 'text-gray-400' :
                'text-red-400'
              }`}>
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 connectionStatus === 'disconnected' ? 'Disconnected' :
                 'Connection Failed'}
              </span>
              {(connectionStatus === 'failed' || connectionStatus === 'disconnected') && (
                <button
                  onClick={manualRetry}
                  className="ml-2 px-2 py-1 text-xs text-white rounded transition-colors duration-200"
                  style={{backgroundColor: '#ea580c'}}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
          
          <div className="w-24"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Video Section */}
          <div className="space-y-6">
            <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
              <h3 className="text-lg font-semibold text-white mb-4">Video Preview</h3>
              
              {videoUrl ? (
                <video
                  ref={(video) => {
                    if (video && streamRef.current) {
                      video.srcObject = streamRef.current
                    }
                  }}
                  autoPlay
                  muted
                  className="w-full h-64 rounded-lg object-cover"
                  style={{backgroundColor: '#2a2a2a'}}
                />
              ) : (
                <div className="w-full h-64 rounded-lg flex items-center justify-center" style={{backgroundColor: '#2a2a2a'}}>
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{backgroundColor: '#374151'}}>
                      <Play className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400">Start interview to see video</p>
                  </div>
                </div>
              )}
            </div>

            {/* Interview Controls */}
            <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
              <h3 className="text-lg font-semibold text-white mb-4">Interview Controls</h3>
              
              <div className="flex flex-wrap gap-3">
                {!interviewStarted ? (
                  <button
                    onClick={startInterview}
                    className="flex items-center gap-2 px-6 py-3 text-white rounded-xl transition-colors duration-200"
                    style={{backgroundColor: '#22c55e'}}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                  >
                    <Play className="w-5 h-5" />
                    Start Interview
                  </button>
                ) : (
                  <>
                    {isPaused ? (
                      <button
                        onClick={resumeInterview}
                        disabled={!!interviewResult}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl transition-colors duration-200 text-white"
                        style={{backgroundColor: interviewResult ? '#4b5563' : '#ea580c'}}
                        onMouseEnter={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#dc5500')}
                        onMouseLeave={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#ea580c')}
                      >
                        <Play className="w-5 h-5" />
                        Resume
                      </button>
                    ) : (
                      <button
                        onClick={pauseInterview}
                        disabled={!!interviewResult}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl transition-colors duration-200 text-white"
                        style={{backgroundColor: interviewResult ? '#4b5563' : '#eab308'}}
                        onMouseEnter={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#ca8a04')}
                        onMouseLeave={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#eab308')}
                      >
                        <Pause className="w-5 h-5" />
                        Pause
                      </button>
                    )}
                    
                    <button
                      onClick={stopInterview}
                      disabled={!!interviewResult}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl transition-colors duration-200 text-white"
                      style={{backgroundColor: interviewResult ? '#4b5563' : '#ea580c'}}
                      onMouseEnter={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#dc5500')}
                      onMouseLeave={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#ea580c')}
                    >
                      <Upload className="w-5 h-5" />
                      {interviewResult ? 'Interview Completed' : 'Complete Interview'}
                    </button>
                  </>
                )}
              </div>
              
              {/* Microphone Controls */}
              {interviewStarted && (
                <div className="mt-4 pt-4" style={{borderTop: '1px solid', borderColor: '#374151'}}>
                  <h4 className="text-sm font-medium text-white mb-3">Microphone Control</h4>
                  <div className="flex gap-3">
                    {micEnabled ? (
                      <button
                        onClick={disableMic}
                        disabled={!!interviewResult}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-white"
                        style={{backgroundColor: interviewResult ? '#4b5563' : '#ef4444'}}
                        onMouseEnter={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#dc2626')}
                        onMouseLeave={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#ef4444')}
                      >
                        <Square className="w-4 h-4" />
                        Disable Mic
                      </button>
                    ) : (
                      <button
                        onClick={enableMic}
                        disabled={isInterviewerSpeaking || isLoading || !!interviewResult}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 text-white"
                        style={{backgroundColor: interviewResult ? '#4b5563' : '#22c55e'}}
                        onMouseEnter={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#16a34a')}
                        onMouseLeave={(e) => !interviewResult && (e.currentTarget.style.backgroundColor = '#22c55e')}
                      >
                        <Play className="w-4 h-4" />
                        {interviewResult ? 'Interview Completed' : 'Enable Mic'}
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {interviewResult 
                      ? "Interview completed - microphone disabled" 
                      : micEnabled 
                        ? "Microphone is active - you can speak" 
                        : "Microphone is disabled - click to enable"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className="space-y-6">
            {/* Live Transcript */}
            <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
              <h3 className="text-lg font-semibold text-white mb-4">
                Live Transcript
                {isLoading && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
              </h3>
              
              <div className="min-h-[100px] p-4 rounded-lg" style={{backgroundColor: '#2a2a2a'}}>
                {transcript ? (
                  <p className="text-white">{transcript}</p>
                ) : (
                  <p className="text-gray-400 italic">
                    {isInterviewerSpeaking ? "AI is speaking..." : "Start speaking..."}
                  </p>
                )}
              </div>
            </div>

            {/* Message History */}
            <div className="backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
              <h3 className="text-lg font-semibold text-white mb-4">Conversation</h3>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {(messages || []).length === 0 ? (
                  <p className="text-gray-400 italic text-center py-8">
                    No messages yet. Start the interview to begin.
                  </p>
                ) : (
                  (messages || []).map((message, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "ml-8"
                          : "mr-8"
                      }`}
                      style={{
                        backgroundColor: message.role === "user" ? '#ea580c33' : '#2a2a2a'
                      }}
                    >
                      <p className="text-sm text-white">
                        {message.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Interview Results */}
        {interviewResult && (
          <div className="mt-8 backdrop-blur-sm rounded-xl border shadow-lg p-6" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
            <h3 className="text-xl font-semibold text-white mb-6">Interview Results</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Score Section */}
              <div className="rounded-lg p-6" style={{backgroundColor: '#2a2a2a'}}>
                <h4 className="text-lg font-medium text-white mb-3">Overall Score</h4>
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold ${
                    interviewResult.score >= 8 ? 'text-green-400' :
                    interviewResult.score >= 6 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {interviewResult.score}/10
                  </div>
                  <div className="flex-1">
                    <div className="w-full rounded-full h-3 mb-2" style={{backgroundColor: '#374151'}}>
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          interviewResult.score >= 8 ? 'bg-green-500' :
                          interviewResult.score >= 6 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${(interviewResult.score / 10) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400">
                      {interviewResult.score >= 8 ? 'Excellent Fit' :
                       interviewResult.score >= 6 ? 'Good Fit' :
                       interviewResult.score >= 4 ? 'Fair Fit' :
                       'Poor Fit'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reasoning Section */}
              <div className="rounded-lg p-6" style={{backgroundColor: '#2a2a2a'}}>
                <h4 className="text-lg font-medium text-white mb-3">Detailed Assessment</h4>
                <div className="max-h-48 overflow-y-auto">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {interviewResult.reasoning}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => navigate("/jobs")}
                className="px-6 py-3 text-white rounded-xl transition-colors duration-200"
                style={{backgroundColor: '#ea580c'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc5500'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ea580c'}
              >
                Back to Jobs
              </button>
              <button
                onClick={() => setInterviewResult(null)}
                className="px-6 py-3 text-white rounded-xl transition-colors duration-200"
                style={{backgroundColor: '#374151'}}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#374151'}
              >
                Close Results
              </button>
            </div>
          </div>
        )}

        {/* Status Indicators */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-green-500' : isPaused ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-300">
              {isRecording ? 'Recording' : isPaused ? 'Paused' : 'Stopped'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 border rounded-lg" style={{backgroundColor: '#1a1a1a', borderColor: '#374151'}}>
            <div className={`w-3 h-3 rounded-full ${
              interviewResult ? 'bg-blue-500' :
              isInterviewerSpeaking ? 'bg-blue-500' : 
              micEnabled ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-300">
              {interviewResult ? 'Interview Completed' :
               isInterviewerSpeaking ? 'AI Speaking' : 
               micEnabled ? 'Mic Active' : 'Mic Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
