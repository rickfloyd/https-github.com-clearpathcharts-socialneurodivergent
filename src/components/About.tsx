import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/FirebaseContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Save, Edit3, BookOpen, MapPin, Link as LinkIcon, 
  Mail, Twitter, MessageSquare, Users, Heart, Grid, 
  Image as ImageIcon, Play, Settings, CheckCircle2, 
  Camera, MoreHorizontal, Share2, Pin, Building2
} from 'lucide-react';
import LegalFooter from './LegalFooter';
import { InterfaceProfile, TimelinePost } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface AboutProps {
  profile: InterfaceProfile;
}

export default function About({ profile }: AboutProps) {
  const { userProfile, updateProfile, updateUserImages, posts } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes'>('posts');

  const compressImage = (base64: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(base64);
        }
      };
      img.onerror = () => resolve(base64);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      let base64 = reader.result as string;
      if (base64.length > 300000) {
        console.log('[About] Compressing upload...');
        base64 = await compressImage(base64);
      }
      await updateUserImages({ [type]: base64 }).catch(console.error);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpdate = (type: 'avatar' | 'cover') => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e: any) => handleImageUpload(e, type);
      input.click();
    } else {
      const promptMsg = type === 'avatar' ? 'Direct Image/GIF URL for Profile:' : 'Direct Image/GIF URL for Banner:';
      const currentUrl = type === 'avatar' ? userProfile?.photoURL : userProfile?.coverURL;
      const url = window.prompt(promptMsg, currentUrl || '');
      if (url !== null && url.trim() !== '') {
        updateUserImages({ [type]: url }).catch(console.error);
      }
    }
  };
  
  // Local state for editing
  const [editData, setEditData] = useState({
    displayName: '',
    username: '',
    bio: '',
    location: '',
    company: '',
    linkInBio: '',
    twitter: '',
    discord: '',
    instagram: '',
    website: ''
  });

  useEffect(() => {
    if (userProfile) {
      setEditData({
        displayName: userProfile.displayName || '',
        username: userProfile.username || userProfile.displayName?.toLowerCase().replace(/\s+/g, '') || '',
        bio: userProfile.bio || userProfile.intro?.bio || '',
        location: userProfile.intro?.location || '',
        company: userProfile.intro?.company || '',
        linkInBio: userProfile.linkInBio || '',
        twitter: userProfile.contactInfo?.twitter || '',
        discord: userProfile.contactInfo?.discord || '',
        instagram: (userProfile as any).contactInfo?.instagram || '',
        website: (userProfile as any).contactInfo?.website || ''
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    await updateProfile({
      displayName: editData.displayName,
      username: editData.username,
      bio: editData.bio,
      linkInBio: editData.linkInBio,
      intro: {
        bio: editData.bio,
        location: editData.location,
        company: editData.company
      },
      contactInfo: {
        ...userProfile?.contactInfo,
        twitter: editData.twitter,
        discord: editData.discord,
        instagram: editData.instagram,
        website: editData.website
      } as any
    });
    setIsEditing(false);
  };

  const userPosts = posts.filter(p => p.uid === userProfile?.uid);
  const pinnedPosts = userPosts.slice(0, 1); // Mock pinned post

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Profile Header Section */}
      <div className="relative group">
        {/* Cover Photo */}
        <div className="h-48 md:h-64 w-full bg-zinc-900 overflow-hidden relative">
          <img 
            src={userProfile?.coverURL || `https://picsum.photos/seed/${userProfile?.uid || 'cover'}/1200/400`} 
            alt="Cover" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60" />
          
          <button 
            onClick={() => handleImageUpdate('cover')}
            className={`absolute bottom-4 right-4 p-2 rounded-full bg-black/50 border border-white/20 text-white hover:bg-black/70 transition-all z-20 ${isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <Camera size={20} />
          </button>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-6 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="relative">
              {/* Profile Picture */}
              <div className="w-32 h-32 rounded-3xl border-4 border-black overflow-hidden shadow-2xl relative bg-zinc-800">
                <img 
                  src={userProfile?.photoURL || `https://picsum.photos/seed/${userProfile?.uid || 'avatar'}/200/200`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => handleImageUpdate('avatar')}
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 text-white transition-opacity z-20 ${isEditing ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}
                >
                  <Camera size={24} />
                </button>
              </div>
              
              {/* Verification Badge */}
              {userProfile?.isVerified !== false && (
                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border-2 border-black">
                  <CheckCircle2 size={24} className="text-indigo-500 fill-indigo-500/20" />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pb-2">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="px-6 py-2 rounded-full font-black uppercase tracking-widest text-xs transition-all flex items-center space-x-2"
                  style={{ backgroundColor: profile.ui.accent, color: '#000' }}
                >
                  <Save size={14} />
                  <span>Save Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 rounded-full border-2 font-black uppercase tracking-widest text-xs transition-all flex items-center space-x-2 hover:bg-white/5"
                  style={{ borderColor: profile.ui.accent, color: profile.ui.accent }}
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              )}
              <button className="p-2 rounded-full border border-white/10 text-gray-400 hover:text-white transition-all">
                <Settings size={20} />
              </button>
            </div>
          </div>

          {/* Identity Info */}
          <div className="mt-4 space-y-1">
            <div className="flex items-center space-x-2 text-[8px] font-black uppercase tracking-[0.4em] text-indigo-500/80 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_5px_rgba(99,102,241,0.8)]" />
              <span>Neural Identity: Neurodivergent Profile Active</span>
            </div>
            {isEditing ? (
              <div className="space-y-2 max-w-sm">
                <input 
                  value={editData.displayName}
                  onChange={e => setEditData({...editData, displayName: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xl font-black uppercase italic tracking-tighter"
                  placeholder="Display Name"
                  style={{ color: profile.ui.accent }}
                />
                <div className="flex items-center bg-white/5 border border-white/10 rounded-lg px-4 py-2">
                  <span className="text-gray-500 mr-1">@</span>
                  <input 
                    value={editData.username}
                    onChange={e => setEditData({...editData, username: e.target.value})}
                    className="w-full bg-transparent border-none p-0 text-sm font-mono focus:ring-0"
                    placeholder="username"
                    style={{ color: profile.ui.text }}
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-2" style={{ color: profile.ui.accent }}>
                  {userProfile?.displayName || 'Anonymous Trader'}
                </h1>
                <p className="text-sm font-mono text-gray-500">
                  @{userProfile?.username || userProfile?.displayName?.toLowerCase().replace(/\s+/g, '') || 'anonymous'}
                </p>
              </>
            )}
          </div>

          {/* Bio & Links */}
          <div className="mt-4 space-y-4">
            {isEditing ? (
              <textarea 
                value={editData.bio}
                onChange={e => setEditData({...editData, bio: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm leading-relaxed focus:ring-0 resize-none h-24"
                placeholder="Describe your institutional focus and market edge..."
                style={{ color: profile.ui.text }}
              />
            ) : (
              <p className="text-sm leading-relaxed max-w-2xl" style={{ color: profile.ui.text }}>
                {userProfile?.bio || "Institutional profile pending. Define your background for the network."}
              </p>
            )}

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-[11px] font-mono uppercase tracking-widest text-gray-500">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <MapPin size={14} />
                    <input 
                      value={editData.location}
                      onChange={e => setEditData({...editData, location: e.target.value})}
                      className="bg-transparent border-none p-0 text-[11px] focus:ring-0 w-full"
                      placeholder="Location"
                    />
                  </div>
                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <Building2 size={14} />
                    <input 
                      value={editData.company}
                      onChange={e => setEditData({...editData, company: e.target.value})}
                      className="bg-transparent border-none p-0 text-[11px] focus:ring-0 w-full"
                      placeholder="Company / Affiliation"
                    />
                  </div>
                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <LinkIcon size={14} />
                    <input 
                      value={editData.linkInBio}
                      onChange={e => setEditData({...editData, linkInBio: e.target.value})}
                      className="bg-transparent border-none p-0 text-[11px] focus:ring-0 w-full"
                      placeholder="Primary Link"
                    />
                  </div>
                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <Twitter size={14} />
                    <input 
                      value={editData.twitter}
                      onChange={e => setEditData({...editData, twitter: e.target.value})}
                      className="bg-transparent border-none p-0 text-[11px] focus:ring-0 w-full"
                      placeholder="Twitter Handle"
                    />
                  </div>
                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <MessageSquare size={14} />
                    <input 
                      value={editData.discord}
                      onChange={e => setEditData({...editData, discord: e.target.value})}
                      className="bg-transparent border-none p-0 text-[11px] focus:ring-0 w-full"
                      placeholder="Discord Handle"
                    />
                  </div>
                  <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <ImageIcon size={14} />
                    <input 
                      value={editData.instagram}
                      onChange={e => setEditData({...editData, instagram: e.target.value})}
                      className="bg-transparent border-none p-0 text-[11px] focus:ring-0 w-full"
                      placeholder="Instagram"
                    />
                  </div>
                </div>
              ) : (
                <>
                  {userProfile?.intro?.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} />
                      <span>{userProfile.intro.location}</span>
                    </div>
                  )}
                  {userProfile?.intro?.company && (
                    <div className="flex items-center space-x-1">
                      <Building2 size={14} />
                      <span>{userProfile.intro.company}</span>
                    </div>
                  )}
                  {userProfile?.linkInBio && (
                    <div className="flex items-center space-x-1">
                      <LinkIcon size={14} />
                      <a href={userProfile.linkInBio} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">
                        {userProfile.linkInBio.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {userProfile?.contactInfo?.twitter && (
                    <div className="flex items-center space-x-1">
                      <Twitter size={14} />
                      <span>@{userProfile.contactInfo.twitter}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <BookOpen size={14} />
                    <span>Joined {userProfile?.createdAt ? new Date(userProfile.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}</span>
                  </div>
                </>
              )}
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-white/5">
              <div className="flex items-center space-x-1">
                <span className="font-black text-white">{userProfile?.metrics?.following || 0}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Following</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-black text-white">{userProfile?.metrics?.followers || 0}</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Followers</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-black text-indigo-500">89.4%</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Neural Precision</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="font-black text-white">4.2k</span>
                <span className="text-[10px] uppercase tracking-widest text-gray-500">Alpha Blocks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-8 border-b border-white/5">
        <div className="flex px-6">
          {[
            { id: 'posts', label: 'Feed', icon: Grid },
            { id: 'media', label: 'Media', icon: ImageIcon },
            { id: 'likes', label: 'Likes', icon: Heart }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 flex items-center justify-center space-x-2 border-b-2 transition-all ${
                activeTab === tab.id 
                  ? 'border-indigo-500 text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <tab.icon size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Feed */}
      <div className="mt-6 px-4 md:px-6 space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'posts' && (
            <motion.div 
              key="posts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Pinned Posts */}
              {pinnedPosts.map(post => (
                <div key={`pinned-${post.id}`} className="relative">
                  <div className="absolute -top-3 left-4 z-10 flex items-center space-x-1 bg-indigo-500 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">
                    <Pin size={10} />
                    <span>Pinned</span>
                  </div>
                  <PostCard post={post} profile={profile} />
                </div>
              ))}

              {/* Main Feed */}
              {userPosts.length > 0 ? (
                userPosts.slice(1).map(post => (
                  <PostCard key={post.id} post={post} profile={profile} />
                ))
              ) : (
                <div className="py-20 text-center space-y-4 bg-white/5 rounded-3xl border border-white/5 border-dashed">
                  <div className="flex justify-center">
                    <MessageSquare size={40} className="text-gray-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-bold uppercase tracking-widest text-xs">No posts yet</p>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">Your institutional insights will appear here</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div 
              key="media"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-1"
            >
              {userPosts.filter(p => p.mediaUrl).map(post => (
                <div key={`media-${post.id}`} className="aspect-square bg-zinc-900 relative group cursor-pointer overflow-hidden">
                  <img 
                    src={post.mediaUrl} 
                    alt="Media" 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  {post.mediaType === 'video' && (
                    <div className="absolute top-2 right-2">
                      <Play size={16} className="text-white fill-white" />
                    </div>
                  )}
                </div>
              ))}
              {userPosts.filter(p => p.mediaUrl).length === 0 && (
                <div className="col-span-3 py-20 text-center text-gray-500 font-mono text-[10px] uppercase tracking-widest">
                  No media assets found
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-20">
        <LegalFooter profile={profile} />
      </div>
    </div>
  );
}

function PostCard({ post, profile }: { post: TimelinePost, profile: InterfaceProfile }) {
  return (
    <div className="glass rounded-3xl border border-white/5 overflow-hidden transition-all hover:border-white/10">
      <div className="p-4 md:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-800">
              <img src={post.authorPhoto} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-black uppercase tracking-tight text-sm text-white">{post.authorName}</span>
                <CheckCircle2 size={12} className="text-indigo-500 fill-indigo-500/20" />
              </div>
              <p className="text-[10px] font-mono text-gray-500">
                {post.createdAt ? formatDistanceToNow(post.createdAt.seconds * 1000) + ' ago' : 'Just now'}
              </p>
            </div>
          </div>
          <button className="text-gray-500 hover:text-white transition-all">
            <MoreHorizontal size={20} />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-gray-300">
          {post.content}
        </p>

        {post.mediaUrl && (
          <div className="rounded-2xl overflow-hidden border border-white/5 bg-zinc-900">
            <img 
              src={post.mediaUrl} 
              alt="Post media" 
              className="w-full max-h-[500px] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-all group">
              <Heart size={18} className="group-hover:fill-red-500/20" />
              <span className="text-xs font-black">{post.likesCount || 0}</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-500 hover:text-indigo-500 transition-all group">
              <MessageSquare size={18} className="group-hover:fill-indigo-500/20" />
              <span className="text-xs font-black">0</span>
            </button>
          </div>
          <button className="text-gray-500 hover:text-white transition-all">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
