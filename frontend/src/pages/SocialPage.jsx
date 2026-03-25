import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ChevronLeft, Users, Trophy, Activity, UserPlus, Zap } from 'lucide-react';

const SocialPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('feed');
    const [feed, setFeed] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };
            
            if (activeTab === 'feed') {
                const res = await fetch('http://localhost:5000/api/social/feed', { headers });
                const data = await res.json();
                setFeed(data);
            } else if (activeTab === 'leaderboard') {
                 const res = await fetch('http://localhost:5000/api/social/leaderboard', { headers });
                const data = await res.json();
                setLeaderboard(data);
            } else {
                 const res = await fetch('http://localhost:5000/api/social/friends', { headers });
                const data = await res.json();
                setFriends(data.friends);
                setRequests(data.requests);
            }
        } catch (error) {
            console.error("Social Fetch Error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddFriend = async () => {
        if (!email) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/social/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.success) {
                alert("Friend request sent!");
                setEmail('');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert("Failed to send request");
        }
    };

    const handleAccept = async (requestId) => {
        try {
             const token = localStorage.getItem('token');
            await fetch('http://localhost:5000/api/social/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ requestId })
            });
            fetchData(); // Refresh
        } catch (error) {
             alert("Failed to accept");
        }
    };

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem 1rem', paddingBottom: '6rem' }}>
            <div className="flex items-center gap-md mb-6">
                <Button variant="ghost" onClick={() => navigate('/dashboard')}><ChevronLeft size={20} /> Back</Button>
                <h1 className="text-gradient">Community</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-dark-50 p-1 rounded-full w-max">
                {['feed', 'leaderboard', 'friends'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab ? 'bg-neon-primary text-black' : 'text-muted hover:text-white'}`}
                        style={{ textTransform: 'capitalize' }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="glass-panel p-4 min-h-[400px]">
                {loading ? (
                    <div className="flex justify-center p-8"><Activity className="animate-spin" /></div>
                ) : (
                    <>
                        {activeTab === 'feed' && (
                            <div className="flex-col gap-4">
                                {feed.length === 0 ? <p className="text-muted text-center py-8">No recent activity. Start moving!</p> : feed.map((item, i) => (
                                    <div key={i} className="flex items-center gap-md p-3 border-b border-white/10 last:border-0">
                                        <div className="w-10 h-10 rounded-full bg-neon-secondary/20 flex items-center justify-center text-neon-secondary">
                                            <Zap size={20} />
                                        </div>
                                        <div>
                                            <p><span className="font-bold text-white">{item.user}</span> <span className="text-gray-300">{item.action}</span></p>
                                            <span className="text-xs text-muted">{new Date(item.time).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'leaderboard' && (
                            <div className="flex-col gap-2">
                                {leaderboard.map((user, i) => (
                                    <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${i === 0 ? 'bg-neon-primary/10 border border-neon-primary' : 'bg-dark-50'}`}>
                                        <div className="flex items-center gap-md">
                                            <span className={`text-xl font-bold w-6 ${i === 0 ? 'text-neon-primary' : 'text-muted'}`}>{i + 1}</span>
                                            <span className="font-medium text-lg">{user.name}</span>
                                        </div>
                                        <div className="flex items-center gap-sm">
                                            <Activity size={16} className="text-neon-secondary" />
                                            <span className="font-mono text-xl">{user.score}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'friends' && (
                            <div className="flex-col gap-8">
                                {/* Add Friend */}
                                <div className="flex gap-2">
                                    <Input placeholder="Friend's Email" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1 }} />
                                    <Button onClick={handleAddFriend}><UserPlus size={20} /></Button>
                                </div>

                                {/* Requests */}
                                {requests.length > 0 && (
                                    <div>
                                        <h3 className="text-neon-primary text-sm uppercase mb-2">Requests</h3>
                                        <div className="flex-col gap-2">
                                            {requests.map(req => (
                                                <div key={req.id} className="flex justify-between items-center bg-dark-50 p-3 rounded">
                                                    <span>{req.name}</span>
                                                    <Button size="sm" onClick={() => handleAccept(req.requestId)}>Accept</Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* List */}
                                <div>
                                    <h3 className="text-muted text-sm uppercase mb-2">My Squad</h3>
                                    {friends.length === 0 ? <p className="text-sm text-gray-500">No friends yet.</p> : (
                                        <div className="grid grid-cols-2 gap-2">
                                            {friends.map(f => (
                                                <div key={f.id} className="p-3 bg-white/5 rounded flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-primary to-blue-500"></div>
                                                    <span>{f.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SocialPage;
