import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Eye, Smile, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EmojiPicker from 'emoji-picker-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * ThreadCard - Tarjeta de hilo tipo Twitter con reacciones y respuestas
 */
export default function ThreadCard({ 
  thread, 
  user, 
  onLike, 
  onReply,
  onShare,
  isLiked = false,
  likeCount = 0,
  viewCount = 0,
  shareCount = 0,
  replies = []
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim() || replyContent.length > 50) return;

    setIsReplying(true);
    try {
      await onReply(thread.id, replyContent.trim());
      setReplyContent('');
      setShowReplyInput(false);
    } catch (error) {
      console.error('Error replying:', error);
    } finally {
      setIsReplying(false);
    }
  };

  const handleEmojiClick = (emojiData) => {
    if (replyContent.length + emojiData.emoji.length <= 50) {
      setReplyContent(prev => prev + emojiData.emoji);
      setShowEmojiPicker(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/80 border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {user?.display_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{user?.display_name || 'Usuario'}</span>
            <span className="text-gray-400 text-sm">@{user?.username || 'usuario'}</span>
            <span className="text-gray-500 text-sm">·</span>
            <span className="text-gray-500 text-sm">
              {formatDistanceToNow(new Date(thread.created_at), { 
                addSuffix: true
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-200 whitespace-pre-wrap break-words">{thread.content}</p>
        
        {/* GIF if exists */}
        {thread.gif && (
          <div className="mt-3 rounded-lg overflow-hidden">
            <img 
              src={thread.gif} 
              alt="GIF" 
              className="w-full max-h-64 object-cover"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-gray-400 mb-3">
        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span>{viewCount || 0}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span>{replies.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="w-4 h-4" />
          <span>{shareCount || 0}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-700/50">
        {/* Like */}
        <button
          onClick={() => onLike(thread.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
            isLiked
              ? 'text-pink-400 bg-pink-500/20'
              : 'text-gray-400 hover:text-pink-400 hover:bg-pink-500/10'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          <span className="text-sm font-medium">{likeCount || 0}</span>
        </button>

        {/* Reply */}
        <button
          onClick={() => setShowReplyInput(!showReplyInput)}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">Responder</span>
        </button>

        {/* Share */}
        <button
          onClick={() => onShare(thread.id)}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      {/* Reply Input */}
      <AnimatePresence>
        {showReplyInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-700/50"
          >
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  value={replyContent}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setReplyContent(e.target.value);
                    }
                  }}
                  placeholder="Escribe una respuesta (máx 50 caracteres)..."
                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-500 pr-20"
                  maxLength={50}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Smile className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-gray-500">
                    {replyContent.length}/50
                  </span>
                </div>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-10">
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      theme="dark"
                      width={300}
                      height={350}
                    />
                  </div>
                )}
              </div>
              <Button
                onClick={handleReply}
                disabled={!replyContent.trim() || isReplying}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isReplying ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Send className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/30 space-y-3">
          {replies.slice(0, 3).map((reply) => (
            <div key={reply.id} className="flex gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {reply.user_name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <span className="font-semibold text-gray-300">{reply.user_name || 'Usuario'}</span>
                <span className="text-gray-500 ml-2">{reply.content}</span>
              </div>
            </div>
          ))}
          {replies.length > 3 && (
            <button className="text-purple-400 text-sm hover:underline">
              Ver {replies.length - 3} respuestas más
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

