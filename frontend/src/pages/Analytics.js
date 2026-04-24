import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { Calendar, TrendingDown, TrendingUp, Zap, Clock, BatteryCharging } from 'lucide-react';
import {
  getDaily, getWeekly, getCompare, getPeakHours, getHourly,
  getCostTrend, getByRoom, getByDevice, getEfficiency
} from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#06B6D4', '#8B5CF6', '#EC4899', '#64748B'];

export default function Analytics() {
  const [daily, setDaily] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [compare, setCompare] = useState({ current_month: 0, previous_month: 0, difference: 0 });
  const [peak, setPeak] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [costTrend, setCostTrend] = useState([]);
  const [byRoom, setByRoom] = useState([]);
  const [byDevice, setByDevice] = useState([]);
  const [efficiency, setEfficiency] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [d, w, c, p, h, ct, br, bd, e] = await Promise.all([
      getDaily(), getWeekly(), getCompare(), getPeakHours(), getHourly(),
      getCostTrend(), getByRoom(), getByDevice(), getEfficiency()
    ]);
    setDaily(d.data);
    setWeekly(w.data);
    setCompare(c.data);
    setPeak(p.data);
    setHourly(h.data);
    setCostTrend(ct.data);
    setByRoom(br.data);
    setByDevice(bd.data);
    setEfficiency(e.data);
  };

  const isMore = compare.difference > 0;
  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Analytics Insights</h1>
          <p className="text-sm text-slate-500 mt-1">Deep dive into your energy usage patterns and forecasts.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Month to Date</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-900">{compare.current_month} kWh</div>
              <p className={`text-xs mt-1 font-medium flex items-center ${isMore ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isMore ? <TrendingUp className="mr-1 h-3 w-3"/> : <TrendingDown className="mr-1 h-3 w-3"/>}
                {Math.abs(compare.difference)} kWh vs last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Avg Hourly Usage</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-900">{efficiency.avg_hourly_usage || 0} kWh</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Peak/Off-Peak Ratio</CardTitle>
              <Zap className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight text-slate-900">{efficiency.peak_to_offpeak_ratio || 0}</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVars}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Most Efficient</CardTitle>
              <BatteryCharging className="h-4 w-4 text-cyan-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold tracking-tight text-slate-900 truncate">
                {efficiency.most_efficient_device || '-'}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Usage */}
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Daily Overview</CardTitle>
              <CardDescription>Energy consumption for the last 14 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="date" tickFormatter={v => v.slice(5)} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: '#F1F5F9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="usage" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Hourly Usage */}
        <motion.div variants={itemVars}>
          <Card>
            <CardHeader>
              <CardTitle>Hourly Footprint</CardTitle>
              <CardDescription>Average usage by hour of the day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHour" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="hour" tickFormatter={v => v.slice(5)} stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                    <Area type="monotone" dataKey="usage" stroke="#10B981" fillOpacity={1} fill="url(#colorHour)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Peak Usage */}
        <motion.div variants={itemVars} className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Heatmap (Simulated)</CardTitle>
              <CardDescription>Identifying maximum load times across the network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={peak} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="hour" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="usage" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: '#EF4444' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

    </motion.div>
  );
}
