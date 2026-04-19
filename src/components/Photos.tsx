import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Heart, MessageSquare, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/FirebaseContext';
import LegalFooter from './LegalFooter';
import { InterfaceProfile } from '../types';

interface PhotosProps {
  profile: InterfaceProfile;
}

const Photos: React.FC<PhotosProps> = ({ profile }) => {
  const { posts } = useAuth();
  
  // Extract all media from posts
  const allMedia = posts
    .filter(post => post.mediaUrl && post.mediaType !== 'none')
    .map(post => ({
      url: post.mediaUrl!,
      type: post.mediaType,
      postId: post.id,
      authorName: post.authorName,
      likes: post.likesCount || 0,
      comments: 0 // Comments not implemented yet
    }));

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase" style={{ color: profile.ui.accent }}>Media Gallery</h2>
          <p className="text-sm font-medium opacity-50" style={{ color: profile.ui.text }}>Visual insights from the community</p>
        </div>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all"
            style={{ backgroundColor: profile.ui.accent, color: '#000' }}
          >
            <span className="lava-hot-text">All Photos</span>
          </button>
          <button 
            className="px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest transition-all border"
            style={{ background: `${profile.ui.accent}11`, color: profile.ui.accent, borderColor: `${profile.ui.accent}22` }}
          >
            <span className="lava-hot-text">Videos</span>
          </button>
        </div>
      </div>

      {allMedia.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed" style={{ background: `${profile.ui.accent}05`, borderColor: `${profile.ui.accent}22` }}>
          <ImageIcon size={48} className="mb-4 opacity-20" style={{ color: profile.ui.accent }} />
          <p className="font-medium opacity-50" style={{ color: profile.ui.text }}>No media shared yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allMedia.map((media, idx) => (
            <motion.div
              key={`${media.postId}-${idx}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="relative aspect-square rounded-3xl overflow-hidden group cursor-pointer border shadow-xl glass"
              style={{ borderColor: `${profile.ui.accent}22` }}
            >
              {media.type === 'video' ? (
                <video 
                  src={media.url} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  muted
                  playsInline
                  onError={() => console.error('Video gallery load failed')}
                />
              ) : (
                <img 
                  src={media.url} 
                  alt="Community media" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                <div className="flex items-center justify-between text-white">
                  <div className="flex space-x-3">
                    <div className="flex items-center text-xs font-bold">
                      <Heart size={14} className="mr-1 fill-red-500 text-red-500" /> {media.likes}
                    </div>
                    <div className="flex items-center text-xs font-bold">
                      <MessageSquare size={14} className="mr-1" /> {media.comments}
                    </div>
                  </div>
                  <Maximize2 size={16} style={{ color: profile.ui.accent }} />
                </div>
                <p className="text-[10px] mt-2 truncate font-bold">by {media.authorName}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <div className="mt-12">
        <LegalFooter profile={profile} />
      </div>
    </div>
  );
};

export default Photos;
