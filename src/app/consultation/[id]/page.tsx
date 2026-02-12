'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  MessageCircle, 
  Send,
  X,
  MoreVertical,
  Minimize,
  Maximize
} from 'lucide-react';
import { useAppStore } from '@/store';

export default function ConsultationPage() {
  const router = useRouter();
  const params = useParams();
  const { currentUser, isAuthenticated, appointments, getUser } = useAppStore();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string; time: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const appointment = appointments.find(a => a.id === params.id);
  const otherUser = appointment ? getUser(
    currentUser?.role === 'patient' ? appointment.doctorId : appointment.patientId
  ) : null;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!appointment) {
      router.push('/dashboard/appointments');
      return;
    }

    const timer = setTimeout(() => {
      setIsConnected(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, appointment, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error('Error accessing media devices:', err);
        });
    }
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    router.push('/dashboard/appointments');
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages(prev => [
        ...prev,
        {
          sender: currentUser?.name || 'You',
          text: newMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setNewMessage('');
    }
  };

  if (!isAuthenticated || !currentUser || !appointment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div className={`flex-1 flex flex-col ${showChat ? 'mr-80' : ''}`}>
        <header className="bg-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-white font-semibold">Video Consultation</h1>
            <span className="text-gray-400">
              {isConnected ? (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Connected • {formatDuration(callDuration)}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Connecting...
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${
                showChat ? 'bg-sky-500 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full max-w-4xl aspect-video bg-gray-800 rounded-xl overflow-hidden">
              {!isConnected ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl text-gray-400">{otherUser?.name?.charAt(0)}</span>
                    </div>
                    <p className="text-white text-lg">{otherUser?.name}</p>
                    <p className="text-gray-400">Waiting for connection...</p>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-700 rounded-lg overflow-hidden shadow-lg">
                    {isVideoOn ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xl text-gray-400">{currentUser.name?.charAt(0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                !isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            <button
              onClick={handleEndCall}
              className="w-14 h-14 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Phone className="w-6 h-6 rotate-[135deg]" />
            </button>

            <button className="w-14 h-14 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors">
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {showChat && (
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Chat</h3>
            <button
              onClick={() => setShowChat(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.sender === currentUser.name ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    msg.sender === currentUser.name
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${msg.sender === currentUser.name ? 'text-sky-100' : 'text-gray-400'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-gray-100">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                onClick={handleSendMessage}
                className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
