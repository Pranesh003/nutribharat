import React, { useEffect, useState } from 'react';
import BentoCard from '../components/ui/BentoCard';
import api from '../services/api';
import { Users, Database, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await api.get('/admin/users');
                setUsers(data);
            } catch (error) {
                console.error('Failed to fetch users', error);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="container animate-fade-in" style={{ padding: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <h1>Admin Dashboard</h1>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Back to App</Button>
            </div>

            {/* Stats Overview */}
            <div className="grid-bento" style={{ marginBottom: '2rem' }}>
                <BentoCard colSpan={6}>
                    <div className="flex items-center gap-md h-100">
                        <div style={{ background: 'rgba(0, 255, 157, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                            <Users color="var(--color-neon-primary)" size={24} />
                        </div>
                        <div>
                            <p className="text-muted" style={{ margin: 0 }}>Total Users</p>
                            <h2 style={{ margin: 0, color: 'white' }}>{users.length}</h2>
                        </div>
                    </div>
                </BentoCard>
                <BentoCard colSpan={6}>
                    <div className="flex items-center gap-md h-100">
                        <div style={{ background: 'rgba(0, 210, 255, 0.1)', padding: '1rem', borderRadius: '50%' }}>
                            <Database color="var(--color-neon-secondary)" size={24} />
                        </div>
                        <div>
                            <p className="text-muted" style={{ margin: 0 }}>Food Database</p>
                            <h2 style={{ margin: 0, color: 'white' }}>1,240</h2>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-neon-secondary)' }}>Coming Soon</span>
                        </div>
                    </div>
                </BentoCard>
            </div>

            
            {/* User List */}
            <h3>Registered Users</h3>
            <div className="flex-col gap-md">
                {users.map(user => (
                    <div key={user.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                        <div className="flex items-center gap-md">
                            <div style={{ width: '40px', height: '40px', background: 'var(--color-neon-primary)', color: 'black', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <h4 style={{ margin: 0 }}>{user.name}</h4>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{user.email}</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'white' }}>
                                Join Date: {new Date(user.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                ))}
                {users.length === 0 && <p className="text-muted">No users found.</p>}
            </div>
        </div>
    );
};

export default AdminDashboard;
