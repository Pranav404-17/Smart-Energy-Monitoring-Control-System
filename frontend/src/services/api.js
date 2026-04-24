import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000'
});

export const getDevices = () => API.get('/devices/');
export const addDevice = (data) => API.post('/devices/', data);
export const updateDevice = (id, data) => API.put(`/devices/${id}`, data);
export const deleteDevice = (id) => API.delete(`/devices/${id}`);
export const toggleDevice = (id) => API.post(`/devices/${id}/toggle`);

export const getRealtime = () => API.get('/energy/realtime');
export const getToday = () => API.get('/energy/today');
export const getMonthly = () => API.get('/energy/monthly');
export const getBill = () => API.get('/energy/bill');
export const getHistory = () => API.get('/energy/history');
export const getDaily = () => API.get('/energy/daily');
export const getWeekly = () => API.get('/energy/weekly');
export const getHourly = () => API.get('/energy/hourly');
export const getCompare = () => API.get('/energy/compare');
export const getPeakHours = () => API.get('/energy/peak-hours');

export const getAlerts = () => API.get('/alerts/');
export const addAlert = (data) => API.post('/alerts/', data);
export const updateAlert = (id, data) => API.put(`/alerts/${id}`, data);
export const deleteAlert = (id) => API.delete(`/alerts/${id}`);
export const checkThreshold = (data) => API.post('/alerts/check-threshold', data);

export const getRules = () => API.get('/automation/');
export const addRule = (data) => API.post('/automation/', data);
export const updateRule = (id, data) => API.put(`/automation/${id}`, data);
export const deleteRule = (id) => API.delete(`/automation/${id}`);
export const evaluateRules = () => API.post('/automation/evaluate');

export const getSettings = () => API.get('/settings');
export const updateSettings = (data) => API.put('/settings', data);

export const getByRoom = () => API.get('/energy/by-room');
export const getByDevice = () => API.get('/energy/by-device');
export const getCostTrend = () => API.get('/energy/cost-trend');
export const getEfficiency = () => API.get('/energy/efficiency');

export const getDeviceStats = () => API.get('/devices/stats');

export const getAlertStats = () => API.get('/alerts/stats');

