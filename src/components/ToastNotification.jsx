import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import '../styles/ToastNotification.css';

const ToastNotification = () => {
    const { toastNotification, dismissToast } = useNotifications();

    if (!toastNotification) return null;

    const getSeverityClass = (severity) => {
        const severityMap = {
            SUCCESS: 'toast-success',
            INFO: 'toast-info',
            WARNING: 'toast-warning',
            ERROR: 'toast-error'
        };
        return severityMap[severity] || 'toast-info';
    };

    const getSeverityIcon = (severity) => {
        const iconMap = {
            SUCCESS: '✓',
            INFO: 'ℹ',
            WARNING: '⚠',
            ERROR: '✕'
        };
        return iconMap[severity] || 'ℹ';
    };

    return (
        <div className={`toast-notification ${getSeverityClass(toastNotification.severity)}`}>
            <div className="toast-content">
                <div className="toast-icon">
                    {getSeverityIcon(toastNotification.severity)}
                </div>
                <div className="toast-message">
                    <div className="toast-title">{toastNotification.title}</div>
                    <div className="toast-text">{toastNotification.message}</div>
                </div>
                <button className="toast-close" onClick={dismissToast}>
                    ×
                </button>
            </div>
        </div>
    );
};

export default ToastNotification;
