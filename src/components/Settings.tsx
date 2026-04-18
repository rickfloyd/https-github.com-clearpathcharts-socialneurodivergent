import React from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Shield, 
  Bell, 
  Eye, 
  Moon, 
  Sun, 
  Monitor, 
  Lock, 
  LogOut, 
  ChevronRight, 
  Settings as SettingsIcon,
  Palette,
  Accessibility,
  BrainCircuit,
  Volume2
} from 'lucide-react';
import { useAuth } from '../contexts/FirebaseContext';
import { logout } from '../firebase';
import { InterfaceProfile } from '../types';
import LegalFooter from './LegalFooter';

interface SettingsProps {
  profile: InterfaceProfile;
}

const Settings: React.FC<SettingsProps> = ({ profile: interfaceProfile }) => {
  const { user, userProfile, updateProfile } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleSetting = (key: string) => {
    // This would update the profile in Firebase
    console.log('Toggle setting:', key);
  };

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-10">
        <div className="p-3 rounded-2xl border shadow-xl glass" style={{ background: `${interfaceProfile.ui.bgBottom}33`, borderColor: `${interfaceProfile.ui.accent}22` }}>
          <SettingsIcon size={24} style={{ color: interfaceProfile.ui.accent }} />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: interfaceProfile.ui.accent }}>Settings</h2>
          <p className="text-sm font-medium opacity-50" style={{ color: interfaceProfile.ui.text }}>Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-8">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          {[
            { id: 'account', label: 'Account', icon: User },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'appearance', label: 'Appearance', icon: Palette },
            { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
            { id: 'neuro', label: 'Workflow Adaptive', icon: BrainCircuit },
          ].map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group border ${
                item.id === 'account' ? '' : 'border-transparent opacity-50 hover:opacity-100'
              }`}
              style={{ 
                background: item.id === 'account' ? `${interfaceProfile.ui.accent}11` : 'transparent',
                borderColor: item.id === 'account' ? `${interfaceProfile.ui.accent}33` : 'transparent',
                color: item.id === 'account' ? interfaceProfile.ui.accent : interfaceProfile.ui.text
              }}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={18} />
                <span className="font-bold text-sm lava-hot-text">{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
          
          <div className="pt-8">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-sm"
            >
              <LogOut size={18} />
              <span className="lava-hot-text">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          {/* Profile Section */}
          <section className="rounded-3xl p-6 shadow-xl border glass" style={{ background: `${interfaceProfile.ui.bgBottom}33`, borderColor: `${interfaceProfile.ui.accent}22` }}>
            <h3 className="text-lg font-bold mb-6 flex items-center" style={{ color: interfaceProfile.ui.accent }}>
              <User size={18} className="mr-3" /> Public Profile
            </h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <img src={userProfile?.photoURL || user?.photoURL || ''} className="w-20 h-20 rounded-full object-cover border-2 transition-all" style={{ borderColor: interfaceProfile.ui.accent }} />
                  <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full text-white text-[10px] font-bold uppercase">
                    <span className="lava-hot-text">Change</span>
                  </button>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold" style={{ color: interfaceProfile.ui.text }}>{userProfile?.displayName || user?.displayName}</h4>
                  <p className="text-xs font-medium opacity-50" style={{ color: interfaceProfile.ui.text }}>{userProfile?.email || user?.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: interfaceProfile.ui.text }}>Display Name</label>
                  <input 
                    type="text" 
                    defaultValue={userProfile?.displayName || user?.displayName || ''}
                    className="w-full bg-black/20 border rounded-xl p-3 text-sm focus:outline-none transition-all"
                    style={{ color: interfaceProfile.ui.text, borderColor: `${interfaceProfile.ui.accent}22` }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-50" style={{ color: interfaceProfile.ui.text }}>Location</label>
                  <input 
                    type="text" 
                    defaultValue={userProfile?.intro?.location || ''}
                    className="w-full bg-black/20 border rounded-xl p-3 text-sm focus:outline-none transition-all"
                    style={{ color: interfaceProfile.ui.text, borderColor: `${interfaceProfile.ui.accent}22` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="rounded-3xl p-6 shadow-xl border glass" style={{ background: `${interfaceProfile.ui.bgBottom}33`, borderColor: `${interfaceProfile.ui.accent}22` }}>
            <h3 className="text-lg font-bold mb-6 flex items-center" style={{ color: interfaceProfile.ui.accent }}>
              <Palette size={18} className="mr-3" /> Preferences
            </h3>
            <div className="space-y-4">
              {[
                { id: 'dark_mode', label: 'Dark Mode', icon: Moon, value: true },
                { id: 'high_contrast', label: 'High Contrast', icon: Eye, value: false },
                { id: 'reduced_motion', label: 'Reduced Motion', icon: Monitor, value: false },
                { id: 'sound_effects', label: 'Sound Effects', icon: Volume2, value: true },
              ].map((setting) => (
                <div key={setting.id} className="flex items-center justify-between p-4 rounded-xl border" style={{ background: `${interfaceProfile.ui.accent}05`, borderColor: `${interfaceProfile.ui.accent}11` }}>
                  <div className="flex items-center space-x-4">
                    <div className="p-2 rounded-lg" style={{ background: `${interfaceProfile.ui.accent}11`, color: interfaceProfile.ui.accent }}>
                      <setting.icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold lava-hot-text">{setting.label}</p>
                      <p className="text-[10px] font-medium opacity-50 lava-hot-text">Adjust your visual experience</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSetting(setting.id)}
                    className="w-12 h-6 rounded-full relative transition-all"
                    style={{ backgroundColor: setting.value ? interfaceProfile.ui.accent : '#333' }}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${setting.value ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Security Section */}
          <section className="rounded-3xl p-6 shadow-xl border glass" style={{ background: `${interfaceProfile.ui.bgBottom}33`, borderColor: `${interfaceProfile.ui.accent}22` }}>
            <h3 className="text-lg font-bold mb-6 flex items-center" style={{ color: interfaceProfile.ui.accent }}>
              <Shield size={18} className="mr-3" /> Security
            </h3>
            <div className="space-y-4">
              <button 
                className="w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left"
                style={{ background: `${interfaceProfile.ui.accent}05`, borderColor: `${interfaceProfile.ui.accent}11` }}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg" style={{ background: `${interfaceProfile.ui.accent}11`, color: interfaceProfile.ui.accent }}>
                    <Lock size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold lava-hot-text">Two-Factor Authentication</p>
                    <p className="text-[10px] font-medium opacity-50 lava-hot-text">Add an extra layer of security</p>
                  </div>
                </div>
                <ChevronRight size={18} className="opacity-50" style={{ color: interfaceProfile.ui.text }} />
              </button>
            </div>
          </section>
        </div>
      </div>
      <div className="mt-12">
        <LegalFooter profile={interfaceProfile} />
      </div>
    </div>
  );
};

;

export default Settings;
