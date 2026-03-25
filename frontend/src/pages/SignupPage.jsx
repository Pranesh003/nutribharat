import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import authService from '../services/authService';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await authService.register(formData.name, formData.email, formData.password);
            // Auto login after register
            await authService.login(formData.email, formData.password);
            navigate('/onboarding'); // Go to onboarding after signup
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel animate-fade-in-up" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
                <h2 className="text-center" style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>Create Account</h2>
                <p className="text-center text-muted" style={{ marginBottom: '2rem' }}>Join NutriBharat AI today</p>
                {error && <div style={{ color: 'var(--color-neon-danger)', marginBottom: '1rem', textAlign: 'center', background: 'rgba(255, 0, 85, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>{error}</div>}
                <form onSubmit={handleSubmit} className="flex-col gap-md">
                    <Input
                        label="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <Button type="submit" style={{ marginTop: '1rem', width: '100%' }}>Sign Up</Button>
                </form>
                <p className="text-center text-muted" style={{ marginTop: '1.5rem' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--color-neon-primary)' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
