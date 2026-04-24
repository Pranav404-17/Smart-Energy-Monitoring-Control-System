import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Power, Trash2, Plus, Zap, ActivitySquare } from 'lucide-react';
import { getDevices, addDevice, deleteDevice, toggleDevice, getDeviceStats } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [stats, setStats] = useState({ total_devices: 0, total_capacity: 0, status_distribution: [] });
  const [form, setForm] = useState({ name: '', room: '', energy_consumption: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const [devRes, statsRes] = await Promise.all([getDevices(), getDeviceStats()]);
      setDevices(devRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.room) return;
    await addDevice({
      name: form.name,
      room: form.room,
      status: 'off',
      energy_consumption: parseFloat(form.energy_consumption) || 0
    });
    setForm({ name: '', room: '', energy_consumption: '' });
    setShowForm(false);
    fetchDevices();
  };

  const handleToggle = async (id) => {
    await toggleDevice(id);
    fetchDevices();
  };

  const handleDelete = async (id) => {
    await deleteDevice(id);
    fetchDevices();
  };

  const activeCount = stats.status_distribution.find(s => s.status === 'on')?.count || 0;

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };
  const itemVars = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Devices</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and monitor your connected smart devices.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Device
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="border-emerald-100 shadow-emerald-100/50">
            <CardHeader>
              <CardTitle className="text-lg">Register New Device</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-2 w-full">
                  <label className="text-sm font-medium">Device Name</label>
                  <Input placeholder="e.g. Living Room AC" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-sm font-medium">Room</label>
                  <Input placeholder="e.g. Living Room" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-sm font-medium">Energy Capacity (kW)</label>
                  <Input type="number" step="0.01" placeholder="0.00" value={form.energy_consumption} onChange={e => setForm({ ...form, energy_consumption: e.target.value })} />
                </div>
                <Button type="submit" className="w-full md:w-auto">Save</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Devices</CardTitle>
            <Cpu className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{stats.total_devices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Active Devices</CardTitle>
            <ActivitySquare className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{activeCount}</div>
            <p className="text-xs text-slate-500 mt-1">Currently drawing power</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Capacity</CardTitle>
            <Zap className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-slate-900">{stats.total_capacity.toFixed(2)} kW</div>
            <p className="text-xs text-slate-500 mt-1">Maximum potential load</p>
          </CardContent>
        </Card>
      </div>

      {/* Device Grid */}
      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {devices.map(device => {
          const isOn = device.status === 'on';
          // Mocking health & last active since API doesn't provide it
          const health = Math.floor(Math.random() * 15) + 85; 

          return (
            <motion.div key={device.id} variants={itemVars}>
              <Card className="h-full flex flex-col hover:border-slate-300 transition-colors">
                <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
                  <div className="flex flex-col">
                    <CardTitle className="text-base truncate" title={device.name}>{device.name}</CardTitle>
                    <CardDescription className="text-xs mt-1">{device.room}</CardDescription>
                  </div>
                  <div className="bg-slate-100 p-2 rounded-md">
                    <Power className={`h-4 w-4 ${isOn ? 'text-emerald-500' : 'text-slate-400'}`} />
                  </div>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-slate-500">Power Usage</span>
                      <span className="text-lg font-semibold text-slate-900">{device.energy_consumption} kW</span>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-slate-500">Health</span>
                      <span className="text-sm font-medium text-slate-700">{health}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <Badge variant={isOn ? "success" : "secondary"} className="font-medium px-2 py-0.5 text-[10px] uppercase tracking-wider">
                      {device.status}
                    </Badge>
                    <span className="text-xs text-slate-400 font-medium">Last active: Just now</span>
                  </div>
                </CardContent>
                <CardFooter className="pt-3 pb-4 bg-slate-50/50 border-t flex justify-between items-center mt-auto rounded-b-xl">
                  <Switch checked={isOn} onCheckedChange={() => handleToggle(device.id)} />
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(device.id)} className="h-8 w-8 text-slate-400 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

    </div>
  );
}
