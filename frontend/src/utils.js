// src/utils.js
export const formatCurrency = (value) => {
  if (value == null) return '0 VND';
  return new Intl.NumberFormat('vi-VN', { 
    style: 'decimal', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value) + ' VND';
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};