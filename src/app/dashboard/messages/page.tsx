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
} from 'lucide-react';
import { useAppStore } from '@/store';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/LanguageContext';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
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
            online: otherId.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0) % 2 === 0,
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
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold text-foreground mb-4">{t.messages.title}</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t.messages.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border bg-card text-foreground rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>{t.messages.noConversations}</p>
              </div>
            ) : (
              chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-muted transition-colors border-b border-border ${
                    selectedChat === chat.id ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                      {chat.avatar}
                    </div>
                    {chat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-card rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-foreground">{chat.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || t.messages.startConversation}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="hidden lg:flex lg:col-span-3 card flex-col h-full">
          {selectedChat && currentChat ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-medium">
                    {currentChat.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{currentChat.name}</p>
                    <p className="text-sm text-muted-foreground">{currentChat.role === 'doctor' ? t.messages.roleDoctor : t.messages.rolePatient}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
                    <Phone className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
                    <Video className="w-5 h-5" />
                  </button>
                  <button type="button" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
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
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === currentUser.id ? 'text-primary-foreground/80' : 'text-muted-foreground'
                      }`}>
                        {format(new Date(message.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <button type="button" className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.messages.typeMessage}
                    className="flex-1 px-4 py-2 border border-border bg-card text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <p className="text-lg">{t.messages.selectConversation}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
