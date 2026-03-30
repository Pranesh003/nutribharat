import React from 'react';


const Input = ({ label, id, type = 'text', ...props }) => {
    return (
        <div className="flex-col gap-sm" style={{ marginBottom: '1rem' }}>
            {label && (
                <label htmlFor={id} style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: 'var(--color-text-muted)'
                }}>
                    {label}
                </label>
            )}
            <input
                id={id}
                type={type}
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--glass-border)',
                    fontSize: '1rem',
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-neon-primary)';
                    e.target.style.boxShadow = '0 0 15px rgba(0, 255, 157, 0.1)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'var(--glass-border)';
                    e.target.style.boxShadow = 'none';
                }}
                {...props}
            />
        </div>
    );
};

export default Input;
