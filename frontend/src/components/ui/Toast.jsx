import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto close after 5s
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        info: 'var(--color-text-main)', // Using text color purely for info or primary
        warning: 'var(--color-warning)'
    };

    const icons = {
        success: <CheckCircle size={20} color="white" />,
        error: <AlertCircle size={20} color="white" />,
        info: <Info size={20} color="white" />,
        warning: <AlertCircle size={20} color="white" />
    };

    return (
        <div className="hover-lift" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            background: type === 'info' ? 'var(--color-primary)' : colors[type], // override info to primary for brand match
            color: 'white',
            boxShadow: 'var(--shadow-lg)',
            minWidth: '300px',
            marginBottom: '0.8rem',
            animation: 'fadeInUp 0.3s ease',
            cursor: 'pointer'
        }} onClick={onClose}>
            {icons[type]}
            <p style={{ margin: 0, fontSize: '0.95rem', flex: 1 }}>{message}</p>
            <X size={16} style={{ opacity: 0.8 }} />
        </div>
    );
};

export default Toast;
