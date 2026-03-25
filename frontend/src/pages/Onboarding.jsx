import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { calculateBMI, calculateBMR, calculateTDEE, getHealthStatus } from '../utils/calculator';
import { ChevronRight, ChevronLeft, Activity, Heart, Utensils } from 'lucide-react';
import authService from '../services/authService';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        // name: '', // Name is in Auth
        age: '',
        gender: 'male',
        height: '',
        weight: '',
        activity: 'sedentary',
        preference: 'vegetarian',
        cuisine: 'North Indian',
        allergies: '',
        conditions: []
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            // Handle multi-select for conditions logic if needed, simple implementation for now
            setFormData(prev => ({
                ...prev,
                conditions: checked
                    ? [...prev.conditions, value]
                    : prev.conditions.filter(c => c !== value)
            }));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const finishOnboarding = async () => {
        // Determine detailed stats
        const bmi = calculateBMI(formData.weight, formData.height);
        const bmr = calculateBMR(formData.weight, formData.height, formData.age, formData.gender);
        const tdee = calculateTDEE(bmr, formData.activity);
        const healthStatus = getHealthStatus(bmi);

        const userProfile = {
            ...formData,
            bmi,
            bmr,
            tdee,
            healthStatus
        };

        try {
            await authService.updateProfile(userProfile);
            navigate('/dashboard');
        } catch (error) {
            alert('Failed to save profile: ' + error.message);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '600px', padding: '4rem 1rem' }}>
            <div className="text-center animate-fade-in-up">
                <h1 className="text-gradient">Design Your Plan</h1>
                <p className="text-muted">Step {step} of 3</p>
                <div style={{ height: '4px', background: 'var(--color-surface-hover)', borderRadius: '4px', margin: '2rem 0', overflow: 'hidden' }}>
                    <div style={{
                        width: `${(step / 3) * 100}%`,
                        background: 'var(--color-primary)',
                        height: '100%',
                        transition: 'width 0.4s ease'
                    }} />
                </div>
            </div>

            <div className="glass-panel animate-fade-in" style={{ padding: '2rem', border: '1px solid var(--color-neon-primary)', background: 'var(--color-bg-card)', boxShadow: '0 0 30px rgba(0, 255, 157, 0.05)' }}>
                {step === 1 && (
                    <div className="step-content">
                        <h2 className="flex items-center gap-sm"><Activity size={24} color="var(--color-neon-primary)" /> Personal Details</h2>
                        <div className="flex-col gap-md">

                            <div className="flex gap-md">
                                <Input label="Age" name="age" type="number" value={formData.age} onChange={handleChange} style={{ width: '100%' }} />
                                <div className="flex-col gap-sm" style={{ width: '100%' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Gender</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                                        <option value="male" style={{ color: 'black' }}>Male</option>
                                        <option value="female" style={{ color: 'black' }}>Female</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-md">
                                <Input label="Height (cm)" name="height" type="number" value={formData.height} onChange={handleChange} />
                                <Input label="Weight (kg)" name="weight" type="number" value={formData.weight} onChange={handleChange} />
                            </div>
                            <div className="flex-col gap-sm">
                                <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Activity Level</label>
                                <select name="activity" value={formData.activity} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                                    <option value="sedentary" style={{ color: 'black' }}>Sedentary (Little/No Exercise)</option>
                                    <option value="light" style={{ color: 'black' }}>Lightly Active (1-3 days/week)</option>
                                    <option value="moderate" style={{ color: 'black' }}>Moderately Active (3-5 days/week)</option>
                                    <option value="active" style={{ color: 'black' }}>Very Active (6-7 days/week)</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-between" style={{ marginTop: '2rem' }}>
                            <div></div>
                            <Button onClick={nextStep}>Next <ChevronRight size={18} /></Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="step-content animate-fade-in">
                        <h2 className="flex items-center gap-sm"><Utensils size={24} color="var(--color-neon-secondary)" /> Dietary Preferences</h2>
                        <div className="flex-col gap-md">
                            <div className="flex-col gap-sm">
                                <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Diet Type</label>
                                <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                                    {['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Jain', 'Vegan'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFormData({ ...formData, preference: type.toLowerCase() })}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: 'var(--radius-full)',
                                                border: `1px solid ${formData.preference === type.toLowerCase() ? 'var(--color-neon-primary)' : 'rgba(255,255,255,0.1)'}`,
                                                background: formData.preference === type.toLowerCase() ? 'rgba(0, 255, 157, 0.1)' : 'transparent',
                                                color: formData.preference === type.toLowerCase() ? 'var(--color-neon-primary)' : 'var(--color-text-muted)',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-col gap-sm">
                                <label style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--color-text-muted)' }}>Regional Cuisine Preference</label>
                                <select name="cuisine" value={formData.cuisine} onChange={handleChange} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)', width: '100%', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
                                    <option value="North Indian" style={{ color: 'black' }}>North Indian (Roti/Curry dominant)</option>
                                    <option value="South Indian" style={{ color: 'black' }}>South Indian (Rice/Idli dominant)</option>
                                    <option value="East Indian" style={{ color: 'black' }}>East Indian (Rice/Fish dominant)</option>
                                    <option value="West Indian" style={{ color: 'black' }}>West Indian (Balanced/Spicy)</option>
                                    <option value="Mixed" style={{ color: 'black' }}>Mixed Indian</option>
                                </select>
                            </div>

                            <Input label="Food Allergies (Optional)" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Peanuts, Gluten" />
                        </div>
                        <div className="flex justify-between" style={{ marginTop: '2rem' }}>
                            <Button variant="ghost" onClick={prevStep}><ChevronLeft size={18} /> Back</Button>
                            <Button onClick={nextStep}>Next <ChevronRight size={18} /></Button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="step-content animate-fade-in">
                        <h2 className="flex items-center gap-sm"><Heart size={24} color="var(--color-neon-danger)" /> Medical Profile</h2>
                        <p className="text-muted" style={{ fontSize: '0.9rem' }}>Select any existing conditions to adjust nutrition.</p>

                        <div className="flex-col gap-sm" style={{ margin: '1rem 0' }}>
                            {['Diabetes (Type 2)', 'Hypertension (BP)', 'Thyroid (Hypo/Hyper)', 'PCOS/PCOD', 'High Cholesterol'].map(condition => (
                                <label key={condition} className="flex items-center gap-sm" style={{ padding: '0.75rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: 'rgba(255,255,255,0.02)' }}>
                                    <input
                                        type="checkbox"
                                        name="conditions"
                                        value={condition}
                                        checked={formData.conditions.includes(condition)}
                                        onChange={handleChange}
                                        style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-neon-primary)' }}
                                    />
                                    <span>{condition}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-between" style={{ marginTop: '2rem' }}>
                            <Button variant="ghost" onClick={prevStep}><ChevronLeft size={18} /> Back</Button>
                            <Button onClick={finishOnboarding} style={{ background: 'var(--color-neon-secondary)', color: 'black', fontWeight: 'bold' }}>Generate Plan</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Onboarding;
