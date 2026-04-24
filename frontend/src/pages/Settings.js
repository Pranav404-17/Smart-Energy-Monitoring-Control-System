import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Bell, DollarSign, Download, Shield, Laptop, Moon } from 'lucide-react';
import { getSettings, updateSettings } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';

export default function Settings() {
  const [settings, setSettings] = useState({
    user: { name: '', email: '' },
    rate: 0.15,
    notifications: { email: true, push: true, sms: false }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSettings();
      if (res.data) {
        setSettings(prev => ({
          ...prev,
          ...res.data
        }));
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateSettings(settings);
      alert('Settings saved successfully');
    } catch (e) {
      console.error(e);
      alert('Failed to save settings');
    }
  };

  const containerVars = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVars = { hidden: { opacity: 0, scale: 0.98 }, show: { opacity: 1, scale: 1 } };

  return (
    <motion.div variants={containerVars} initial="hidden" animate="show" className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account preferences and application settings.</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
          {/* Profile */}
          <motion.div variants={itemVars}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-slate-400" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your profile details and contact info.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <Input 
                      value={settings.user?.name || ''} 
                      onChange={e => setSettings({ ...settings, user: { ...settings.user, name: e.target.value } })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Email Address</label>
                    <Input 
                      type="email"
                      value={settings.user?.email || ''} 
                      onChange={e => setSettings({ ...settings, user: { ...settings.user, email: e.target.value } })} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences */}
          <motion.div variants={itemVars}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                  Tariff & Billing
                </CardTitle>
                <CardDescription>Configure your energy rate calculation.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-w-xs">
                  <label className="text-sm font-medium text-slate-700">Electricity Rate ($/kWh)</label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={settings.rate || 0.15} 
                    onChange={e => setSettings({ ...settings, rate: parseFloat(e.target.value) })} 
                  />
                  <p className="text-xs text-slate-500">Used to estimate cost and savings.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVars}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-slate-400" />
                  Notifications
                </CardTitle>
                <CardDescription>Choose how you want to receive alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium text-slate-900">Email Notifications</h4>
                    <p className="text-xs text-slate-500">Receive weekly summaries and critical alerts.</p>
                  </div>
                  <Switch 
                    checked={settings.notifications?.email || false}
                    onCheckedChange={c => setSettings({ ...settings, notifications: { ...settings.notifications, email: c } })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium text-slate-900">Push Notifications</h4>
                    <p className="text-xs text-slate-500">Real-time alerts on your device.</p>
                  </div>
                  <Switch 
                    checked={settings.notifications?.push || false}
                    onCheckedChange={c => setSettings({ ...settings, notifications: { ...settings.notifications, push: c } })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-medium text-slate-900">SMS Alerts</h4>
                    <p className="text-xs text-slate-500">Text messages for urgent network events.</p>
                  </div>
                  <Switch 
                    checked={settings.notifications?.sms || false}
                    onCheckedChange={c => setSettings({ ...settings, notifications: { ...settings.notifications, sms: c } })}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar settings sections */}
        <div className="md:col-span-4 space-y-6">
          <motion.div variants={itemVars}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Appearance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium">Dark Mode</span>
                  </div>
                  <Switch checked={false} disabled />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVars}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Data & Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start text-slate-600 font-normal">
                  <Download className="mr-2 h-4 w-4" /> Download All Data (CSV)
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-600 font-normal">
                  <Download className="mr-2 h-4 w-4" /> Download PDF Report
                </Button>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
