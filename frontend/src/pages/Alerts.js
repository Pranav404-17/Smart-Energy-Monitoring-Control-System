import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getAlerts, deleteAlert, checkThreshold, getAlertStats } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const COLORS = ['#F59E0B', '#EF4444', '#3B82F6'];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [threshold, setThreshold] = useState(5.0);
  const [stats, setStats] = useState({ total: 0, unread: 0, critical: 0, by_type: [], by_day: [] });
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const [alertsRes, statsRes] = await Promise.all([getAlerts(), getAlertStats()]);
      setAlerts(alertsRes.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setStats(statsRes.data);
    } catch(e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    await deleteAlert(id);
    fetchAlerts();
    window.dispatchEvent(new CustomEvent('alertsChanged'));
  };

  const handleCheck = async () => {
    await checkThreshold({ threshold });
    fetchAlerts();
    window.dispatchEvent(new CustomEvent('alertsChanged'));
  };

  const filteredAlerts = alerts.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'critical') return a.type === 'critical';
    if (filter === 'warning') return a.type === 'warning';
    return true;
  });

  const getAlertIcon = (type) => {
    switch(type) {
      case 'critical': return <ShieldAlert className="h-5 w-5 text-rose-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0 } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Alerts Center</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor system events and anomalies.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Action Required</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{stats.unread}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Critical Incidents</CardTitle>
            <ShieldAlert className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold tracking-tight ${stats.critical > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{stats.critical}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main List */}
        <div className="md:col-span-2 space-y-4">
          <Card className="h-full border-slate-200">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between">
                <CardTitle>Timeline</CardTitle>
                <div className="flex space-x-2">
                  <Badge variant={filter === 'all' ? 'default' : 'secondary'} className="cursor-pointer" onClick={() => setFilter('all')}>All</Badge>
                  <Badge variant={filter === 'critical' ? 'destructive' : 'secondary'} className="cursor-pointer" onClick={() => setFilter('critical')}>Critical</Badge>
                  <Badge variant={filter === 'warning' ? 'warning' : 'secondary'} className="cursor-pointer" onClick={() => setFilter('warning')}>Warning</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
                  <motion.div key={alert.id} variants={itemVars} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                    <div className={`p-2 rounded-full mt-1 flex-shrink-0 ${alert.type === 'critical' ? 'bg-rose-100' : alert.type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-slate-900">{alert.type === 'critical' ? 'Critical Alert' : alert.type === 'warning' ? 'Warning' : 'Information'}</h4>
                        <span className="text-xs text-slate-500">{new Date(alert.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{alert.message}</p>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(alert.id)} className="h-7 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Resolve
                      </Button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="p-8 text-center text-slate-500 text-sm">No alerts found.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Side Panel Charts & Tools */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Threshold Check</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 mb-4">Run an immediate system wide threshold check to verify current compliance.</p>
              <div className="flex items-center gap-2">
                <Input type="number" step="0.1" value={threshold} onChange={e => setThreshold(parseFloat(e.target.value))} placeholder="Limit (kW)" className="w-[100px]" />
                <Button onClick={handleCheck} className="flex-1">Execute Check</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.by_type} dataKey="count" nameKey="type" cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                      {stats.by_type.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Volume Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.by_day} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tickFormatter={v => v.slice(5)} stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="#EF4444" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
