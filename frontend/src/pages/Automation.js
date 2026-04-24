import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Trash2, Plus, Clock, Zap, Target } from 'lucide-react';
import { getRules, addRule, deleteRule, getDevices } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

export default function Automation() {
  const [rules, setRules] = useState([]);
  const [devices, setDevices] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [form, setForm] = useState({
    name: '',
    rule_type: 'schedule',
    device_id: '',
    schedule: '',
    action: 'off',
    threshold: ''
  });

  useEffect(() => {
    fetchRules();
    fetchDevices();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await getRules();
      setRules(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await getDevices();
      setDevices(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.device_id) return;
    await addRule({
      ...form,
      threshold: parseFloat(form.threshold) || 0
    });
    setForm({ name: '', rule_type: 'schedule', device_id: '', schedule: '', action: 'off', threshold: '' });
    setShowBuilder(false);
    fetchRules();
  };

  const handleDelete = async (id) => {
    await deleteRule(id);
    fetchRules();
  };

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVars = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Automation</h1>
          <p className="text-sm text-slate-500 mt-1">Create smart rules to manage your energy consumption automatically.</p>
        </div>
        <Button onClick={() => setShowBuilder(!showBuilder)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {showBuilder && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card className="border-blue-100 shadow-blue-100/50 bg-blue-50/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                Rule Builder
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Rule Name</label>
                    <Input placeholder="e.g. Night Mode AC" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Trigger Type</label>
                    <select 
                      value={form.rule_type} 
                      onChange={e => setForm({ ...form, rule_type: e.target.value })}
                      className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="schedule">Time Schedule</option>
                      <option value="threshold">Power Threshold</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
                    <span className="px-3 py-1 bg-slate-200 rounded-md text-slate-800">IF</span>
                    
                    {form.rule_type === 'schedule' ? (
                        <div className="flex items-center gap-2">
                          <span>time is</span>
                          <Input placeholder="Cron (e.g. 0 22 * * *)" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} className="w-[180px] bg-white h-8" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                          <span>usage exceeds</span>
                          <Input type="number" step="0.1" placeholder="kW" value={form.threshold} onChange={e => setForm({ ...form, threshold: e.target.value })} className="w-[120px] bg-white h-8" />
                        </div>
                    )}

                    <span className="px-3 py-1 bg-slate-200 rounded-md text-slate-800">THEN</span>
                    
                    <div className="flex items-center gap-2">
                      <span>turn</span>
                      <select 
                        value={form.action} 
                        onChange={e => setForm({ ...form, action: e.target.value })}
                        className="h-8 rounded-md border border-input bg-white px-2 text-sm shadow-sm"
                      >
                        <option value="off">OFF</option>
                        <option value="on">ON</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0">
                      <span>device</span>
                      <select 
                        value={form.device_id} 
                        onChange={e => setForm({ ...form, device_id: e.target.value })}
                        className="h-8 rounded-md border border-input bg-white px-2 text-sm shadow-sm min-w-[150px]"
                      >
                        <option value="">Select Device</option>
                        {devices.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" type="button" onClick={() => setShowBuilder(false)}>Cancel</Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Rule</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Rules Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map(rule => {
          const isSchedule = rule.rule_type === 'schedule';
          const device = devices.find(d => d.id === rule.device_id);

          return (
            <motion.div key={rule.id} variants={itemVars}>
              <Card className="h-full flex flex-col hover:border-blue-200 transition-colors">
                <CardHeader className="pb-3 flex-row items-start justify-between space-y-0">
                  <div className="flex flex-col space-y-1">
                    <CardTitle className="text-base truncate">{rule.name}</CardTitle>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      {isSchedule ? <Clock className="h-3 w-3" /> : <Target className="h-3 w-3" />}
                      <span className="uppercase tracking-wider">{rule.rule_type} based</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="bg-slate-50 rounded-md p-3 text-sm space-y-2 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Condition</span>
                      <span className="font-medium text-slate-900">{isSchedule ? rule.schedule : `> ${rule.threshold} kW`}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Action</span>
                      <span className="font-medium text-slate-900">
                        Turn <strong className={rule.action === 'on' ? 'text-emerald-600' : 'text-rose-600'}>{rule.action.toUpperCase()}</strong>
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Target</span>
                      <span className="font-medium text-blue-600 truncate max-w-[120px]">{device?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(rule.id)} className="w-full text-slate-400 hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Rule
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )
        })}
        {rules.length === 0 && !showBuilder && (
          <div className="md:col-span-2 lg:col-span-3 p-12 text-center border-2 border-dashed rounded-xl text-slate-500">
            <Zap className="h-8 w-8 mx-auto text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No automation rules yet</h3>
            <p className="text-sm mt-1 mb-4">Create rules to automate your devices and save energy.</p>
            <Button onClick={() => setShowBuilder(true)} variant="outline">Create your first rule</Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
