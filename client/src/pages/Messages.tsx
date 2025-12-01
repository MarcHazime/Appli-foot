import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';

interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender: any;
    receiver: any;
}

interface Conversation {
    user: any;
    messages: Message[];
    lastMessage: Message;
    unreadCount: number;
}

const Messages: React.FC = () => {
    const { user } = useAuth();
    const { t, language } = useLanguage();
    const { showToast } = useToast();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [replyContent, setReplyContent] = useState<string>('');

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll for new messages
        return () => clearInterval(interval);
    }, [user]);

    const fetchMessages = async () => {
        if (!user) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/messages/all`, {
                headers: { Authorization: `Bearer ${user.token} ` }
            });

            // Group by other user
            const grouped: { [key: number]: Conversation } = {};
            const currentUserId = Number(user.userId);

            if (Array.isArray(res.data)) {
                res.data.forEach((msg: Message) => {
                    const isSender = msg.senderId === currentUserId;
                    const otherId = isSender ? msg.receiverId : msg.senderId;
                    const otherUser = isSender ? msg.receiver : msg.sender;

                    if (!grouped[otherId]) {
                        grouped[otherId] = {
                            user: otherUser,
                            messages: [],
                            lastMessage: msg, // Placeholder, will be updated
                            unreadCount: 0
                        };
                    }
                    grouped[otherId].messages.push(msg);
                    grouped[otherId].lastMessage = msg;
                    if (msg.receiverId === currentUserId && !msg.isRead) {
                        grouped[otherId].unreadCount++;
                    }
                });
            } else {
                console.error("API returned non-array:", res.data);
            }

            // Convert to array and sort by last message date
            const sortedConversations = Object.values(grouped).sort((a, b) =>
                new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
            );

            setConversations(sortedConversations);

            // Update selected conversation if it exists (to show new messages in real-time)
            if (selectedConversation) {
                const updatedSelected = sortedConversations.find(c => c.user.id === selectedConversation.user.id);
                if (updatedSelected) {
                    setSelectedConversation(updatedSelected);
                }
            }

        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectConversation = async (conv: Conversation) => {
        setSelectedConversation(conv);
        // Mark as read
        if (conv.unreadCount > 0 && user) {
            try {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/messages/read`, {}, {
                    headers: { Authorization: `Bearer ${user.token} ` }
                });
                fetchMessages();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim() || !selectedConversation || !user) return;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/messages`, {
                receiverId: selectedConversation.user.id,
                content: replyContent
            }, {
                headers: { Authorization: `Bearer ${user.token} ` }
            });
            setReplyContent('');
            fetchMessages(); // Refresh immediately
            showToast('Reply sent!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Failed to send reply', 'error');
        }
    };

    if (!user) return null;

    return (
        <div className="dashboard-container" style={{ display: 'flex', height: '80vh', gap: '1rem' }}>

            {/* Conversation List */}
            <div className="conversation-list" style={{ width: '30%', borderRight: '1px solid #444', overflowY: 'auto' }}>
                <h3>{t.messages.conversations}</h3>
                {conversations.length === 0 && <p>{t.messages.noMessages}</p>}
                {conversations.map(conv => {
                    const profile = conv.user.playerProfile || conv.user.clubProfile;
                    const name = profile ? (profile.firstName ? `${profile.firstName} ${profile.lastName} ` : profile.clubName) : 'Unknown';

                    return (
                        <div
                            key={conv.user.id}
                            onClick={() => handleSelectConversation(conv)}
                            className="card"
                            style={{
                                cursor: 'pointer',
                                background: selectedConversation?.user.id === conv.user.id ? '#333' : 'rgba(0,0,0,0.5)',
                                marginBottom: '0.5rem',
                                padding: '1rem',
                                height: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong>{name}</strong>
                                {conv.unreadCount > 0 && <span style={{ background: 'red', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{conv.unreadCount}</span>}
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#ccc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {conv.lastMessage.content}
                            </p>
                            <small style={{ fontSize: '0.7rem', color: '#888' }}>{new Date(conv.lastMessage.createdAt).toLocaleDateString()}</small>
                        </div>
                    );
                })}
            </div>

            {/* Conversation Detail */}
            <div className="conversation-detail" style={{ width: '70%', display: 'flex', flexDirection: 'column' }}>
                {selectedConversation ? (
                    <>
                        <div className="messages-thread" style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {selectedConversation.messages.map((msg, index) => {
                                const isMe = msg.senderId === Number(user.userId);
                                const currentDate = new Date(msg.createdAt).toLocaleDateString();
                                const prevDate = index > 0 ? new Date(selectedConversation.messages[index - 1].createdAt).toLocaleDateString() : null;
                                const showDate = currentDate !== prevDate;

                                return (
                                    <React.Fragment key={msg.id}>
                                        {showDate && (
                                            <div style={{ textAlign: 'center', margin: '1rem 0', opacity: 0.6, fontSize: '0.8rem' }}>
                                                {new Date(msg.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        )}
                                        <div style={{
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            background: isMe ? '#4CAF50' : '#444',
                                            padding: '0.5rem 1rem',
                                            borderRadius: '10px',
                                            maxWidth: '70%'
                                        }}>
                                            <p style={{ margin: 0 }}>{msg.content}</p>
                                            <small style={{ fontSize: '0.7rem', opacity: 0.7, display: 'block', textAlign: 'right' }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </small>
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSendReply} style={{ padding: '1rem', borderTop: '1px solid #444', display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={t.messages.typePlaceholder}
                                style={{ flex: 1, padding: '0.5rem' }}
                            />
                            <button type="submit">{t.messages.send}</button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <p>{t.messages.selectConversation}</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default Messages;
