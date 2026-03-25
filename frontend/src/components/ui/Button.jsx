import React from 'react';

const Button = ({ children, variant = 'primary', className = '', style = {}, ...props }) => {
    const baseStyle = {
        padding: '0.75rem 1.5rem',
        borderRadius: 'var(--radius-full)',
        fontWeight: '600',
        fontSize: '1rem',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const variants = {
        primary: {
            background: 'linear-gradient(135deg, var(--color-neon-primary), #00d2ff)',
            color: '#000',
            border: 'none',
            boxShadow: '0 4px 15px rgba(0, 255, 157, 0.3)'
        },
        secondary: {
            backgroundColor: 'transparent',
            color: 'var(--color-neon-secondary)',
            border: '1px solid var(--color-neon-secondary)',
            boxShadow: '0 0 10px rgba(0, 210, 255, 0.1)'
        },
        outline: {
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: 'white',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(5px)'
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--color-text-muted)',
        }
    };

    return (
        <button
            className={`hover-lift ${className}`}
            style={{ ...baseStyle, ...variants[variant], ...style }}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
