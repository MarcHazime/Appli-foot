import React from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
    return (
        <div className={`toast toast-${type}`}>
            <span>{message}</span>
            <button onClick={onClose} className="toast-close">&times;</button>
        </div>
    );
};

export default Toast;
