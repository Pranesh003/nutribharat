import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <div className="animate-fade-in-up">
                    <h1 className="text-gradient" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                        Personalized Nutrition for<br />Every Indian Home
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
                        NutriBharat AI creates custom diet plans based on your regional preferences, health goals, and lifestyle.
                    </p>
                    <div className="flex justify-center gap-md">
                        <Link to="/onboarding">
                            <Button variant="primary" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
                                Start Your Journey
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
                                Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
