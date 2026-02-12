'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreVertical,
  Phone,
  Video,
  ArrowLeft
} from 'lucide-react';
import { useAppStore } from '@/store';
import { format } from 'date-fns';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, isAuthenticated, appointments, getUser, sendMessage, getMessages } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(searchParams.get('patient'));
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/messages');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat]);

  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const chats = appointments
    .filter(a => 
      (currentUser.role === 'patient' ? a.doctorId : a.patientId) && 
      a.status === 'completed'
    )
    .reduce((acc, appointment) => {
      const otherId = currentUser.role === 'patient' ? appointment.doctorId : appointment.patientId;
      if (!acc.find(c => c.id === otherId)) {
        const otherUser = getUser(otherId);
        if (otherUser) {
          acc.push({
            id: otherId,
            name: otherUser.name,
            avatar: otherUser.name.charAt(0),
            lastMessage: '',
            unread: 0,
            online: Math.random() > 0.5,
          });
        }
      }
      return acc;
    }, [] as { id: string; name: string; avatar: string; lastMessage: string; unread: number; online: boolean }[]);

  const currentChat = selectedChat ? getUser(selectedChat) : null;
  const messages = selectedChat ? getMessages(currentUser.id, selectedChat) : [];

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      sendMessage({
        senderId: currentUser.id,
        receiverId: selectedChat,
        content: newMessage,
        type: 'text',
        read: false,
      });
      setNewMessage('');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="grid lg:grid-cols-4 h-full">
        <div className="card lg:col-span-1 flex flex-col h-full">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>No conversations yet</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                    selectedChat === chat.id ? 'bg-sky-50' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-medium">
                      {chat.avatar}
                    </div>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{chat.name}</p>
                    <p className="text-sm text-gray-500 truncate">{chat.lastMessage || 'Start a conversation'}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="hidden lg:flex lg:col-span-3 card flex-col h-full">
          {selectedChat && currentChat ? (
            <>
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-medium">
                    {currentChat.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{currentChat.name}</p>
                    <p className="text-sm text-gray-500">{currentChat.role === 'doctor' ? 'Doctor' : 'Patient'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Video className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.senderId === currentUser.id
                          ? 'bg-sky-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser.id ? 'text-sky-100' : 'text-gray-400'
                      }`}>
                        {format(new Date(message.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <Paperclip className="w-5 h-5" />
                  </button>
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
                    disabled={!newMessage.trim()}
                    className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
