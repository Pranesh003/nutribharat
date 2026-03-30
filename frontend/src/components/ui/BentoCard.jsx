import React from 'react';

const BentoCard = ({ children, className = '', colSpan = 1, rowSpan = 1, title, icon }) => {
    // col-span-X and row-span-Y classes should be handled by styled-components or inline styles
    // for this raw implementation, we'll use inline style gridColumn/gridRow if provided, 
    // or rely on utility classes if Tailwind was present. Since we use vanilla CSS, we'll use style props.

    
    const style = {
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
    };

    return (
        <div
            className={`glass-panel ${className}`}
            style={style}
        >
            <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {(title || icon) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                        {icon && <div style={{ color: 'var(--color-neon-primary)' }}>{icon}</div>}
                        {title && <h3 style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{title}</h3>}
                    </div>
                )}
                <div style={{ flex: 1 }}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default BentoCard;
