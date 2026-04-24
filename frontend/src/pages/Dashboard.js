import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, Legend
} from 'recharts';
import { Zap, TrendingUp, DollarSign, Activity, Cpu, BatteryCharging } from 'lucide-react';
import {
  getDevices, getRealtime, getToday, getMonthly, getBill, getHistory,
  getByRoom, getByDevice, getCostTrend, getPeakHours
} from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#06B6D4', '#8B5CF6', '#EC4899', '#64748B'];

export default function Dashboard() {
  const [devices, setDevices] = useState([]);
  const [realtime, setRealtime] = useState({ usage: 0, cost: 0 });
  const [today, setToday] = useState(0);
  const [monthly, setMonthly] = useState(0);
  const [bill, setBill] = useState(0);
  const [history, setHistory] = useState([]);
  const [byRoom, setByRoom] = useState([]);
  const [byDevice, setByDevice] = useState([]);
  const [costTrend, setCostTrend] = useState([]);
  const [peakHour, setPeakHour] = useState('-');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [devRes, rtRes, todayRes, monthRes, billRes, histRes, roomRes, deviceRes, costRes, peakRes] = await Promise.all([
        getDevices(), getRealtime(), getToday(), getMonthly(), getBill(), getHistory(),
        getByRoom(), getByDevice(), getCostTrend(), getPeakHours()
      ]);
      setDevices(devRes.data);
      setRealtime(rtRes.data);
      setToday(todayRes.data.total);
      setMonthly(monthRes.data.total);
      setBill(billRes.data.estimated_bill);
      setHistory(histRes.data.slice(-24).map(d => ({ time: d.timestamp.slice(11, 16), usage: d.usage })));
      setByRoom(roomRes.data);
      setByDevice(deviceRes.data.slice(0, 5));
      setCostTrend(costRes.data.slice(-14));
      const peak = peakRes.data.reduce((max, curr) => curr.usage > max.usage ? curr : max, peakRes.data[0] || { hour: '-' });
      setPeakHour(peak ? peak.hour : '-');
    } catch (e) {
      console.error(e);
    }
  };

  const activeCount = devices.filter(d => d.status === 'on').length;
  // Mock efficiency score
  const efficiencyScore = 92;

  const kpis = [
    { title: "Current Usage", metric: `${realtime.usage} kW`, icon: Zap, trend: "+4%", isGood: false },
    { title: "Today's Usage", metric: `${today} kWh`, icon: Activity, trend: "-12%", isGood: true },
    { title: "Estimated Bill", metric: `$${bill.toFixed(2)}`, icon: DollarSign, trend: "+2.1%", isGood: false },
    { title: "Active Devices", metric: activeCount, icon: Cpu, trend: null },
    { title: "Efficiency Score", metric: `${efficiencyScore}/100`, icon: BatteryCharging, trend: "+4 pts", isGood: true },
  ];

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi, i) => (
          <motion.div key={i} variants={itemVars}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-slate-900">{kpi.metric}</div>
                {kpi.trend && (
                  <p className={`text-xs mt-1 font-medium ${kpi.isGood ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {kpi.trend} from last period
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 md:grid-cols-7">
        <motion.div variants={itemVars} className="md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Real-time Energy Consumption</CardTitle>
              <CardDescription>Live power draw across your network (kW)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Area type="monotone" dataKey="usage" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsage)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars} className="md:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Energy by Room</CardTitle>
              <CardDescription>Distribution of usage today</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byRoom} dataKey="usage" nameKey="room" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {byRoom.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Top Consuming Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byDevice} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                    <XAxis type="number" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="device" type="category" width={100} stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="usage" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Cost Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tickFormatter={v => v.slice(5)} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Area type="monotone" dataKey="cost" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
}
