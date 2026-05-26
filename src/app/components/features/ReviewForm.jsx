import React, { useState } from "react";
import { Star, Send, FileText, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ReviewForm({ 
  onSubmit, 
  initialData = {}, 
  title = "Write a Review", 
  submitLabel = "Submit Review",
  variant = "standard" 
}) {
  const [rating, setRating] = useState(initialData.rating || 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialData.comment || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }
    onSubmit({ rating, comment });
  };

  if (variant === "formal") {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <form 
          onSubmit={handleSubmit} 
          className="bg-[#fcfbf9] p-8 md:p-12 rounded-sm shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#e5e0d8] relative overflow-hidden"
        >
          {/* Subtle document background pattern */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#d5d0c8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          />
          
          <div className="relative z-10">
            {/* Document Header */}
            <div className="border-b-2 border-gray-800 pb-6 mb-8 text-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-gray-700" />
                  <h2 className="text-2xl font-serif font-bold tracking-wide uppercase">Official Evaluation</h2>
                </div>
                <div className="text-sm font-mono text-gray-500 bg-white/50 px-3 py-1 border border-gray-200 rounded">
                  DATE: {new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-2 font-serif text-sm bg-white/40 p-4 rounded border border-gray-200/50">
                <p><strong className="tracking-widest">TO:</strong> University Administration</p>
                <p><strong className="tracking-widest">SUBJECT:</strong> {title}</p>
              </div>
            </div>

            <div className="space-y-8 font-serif text-gray-800">
              <p className="leading-relaxed text-[15px]">
                To whom it may concern,
                <br /><br />
                We are writing to officially document our evaluation of the student's performance during their engagement with our company. Please find our comprehensive rating and detailed observations below.
              </p>

              {/* Formal Rating */}
              <div className="bg-white/80 backdrop-blur-sm p-6 border border-gray-200 rounded shadow-sm">
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-700 mb-4">Overall Assessment Rating</label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1 focus:outline-none transition-transform duration-200 hover:scale-110"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                      >
                        <Star
                          size={32}
                          fill={(hover || rating) >= star ? "#1f2937" : "none"}
                          color={(hover || rating) >= star ? "#1f2937" : "#9ca3af"}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="font-mono text-sm font-medium bg-gray-100 text-gray-700 px-4 py-1.5 rounded border border-gray-200">
                    {rating > 0 ? `${rating} / 5 STARS` : "PENDING EVALUATION"}
                  </span>
                </div>
              </div>

              {/* Formal Comment */}
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-700 mb-3">Detailed Observations</label>
                <textarea
                  className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-300 rounded shadow-sm focus:ring-1 focus:ring-gray-800 focus:border-gray-800 min-h-[180px] resize-y text-gray-800 font-sans leading-relaxed text-[15px]"
                  placeholder="Please detail the student's professional conduct, skill application, and overall contribution..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {/* Signature Area */}
              <div className="pt-8 border-t border-gray-200 mt-10">
                <p className="mb-12 font-italic text-lg">Sincerely,</p>
                <div className="w-64 border-b-2 border-gray-800 mb-3 relative">
                  <span className="absolute bottom-1 right-2 text-xs text-gray-400 font-sans italic">Sign here</span>
                </div>
                <p className="text-sm text-gray-800 uppercase tracking-widest font-bold">Company Representative</p>
                <p className="text-xs text-gray-500 uppercase mt-1">Authorized Signatory</p>
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <button
                type="submit"
                disabled={rating === 0}
                className="flex items-center space-x-3 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3.5 rounded-sm font-serif tracking-widest uppercase text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgb(0,0,0,0.3)] hover:-translate-y-0.5"
              >
                <Send size={18} />
                <span>{submitLabel}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    );
  }

  // Standard variant (for students reviewing company)
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-xl mx-auto"
    >
      <form onSubmit={handleSubmit} className="relative z-10 bg-white/90 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-white/60">
        
        {/* Decorative background blur inside the form area */}
        <div className="absolute top-0 right-0 -z-10 w-full h-full overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl mix-blend-multiply" />
        </div>

        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-50 to-indigo-50 shadow-inner mb-5"
          >
            <Star className="w-8 h-8 text-blue-500 fill-blue-500/20" />
          </motion.div>
          <h3 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-2">
            {title}
          </h3>
          <p className="text-gray-500 text-sm">Your feedback helps us maintain a high-quality community.</p>
        </div>
        
        <div className="space-y-8">
          <div className="flex flex-col items-center space-y-5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Rate your experience</label>
            <div className="flex items-center space-x-1 sm:space-x-3 bg-gray-50/80 p-3 rounded-2xl border border-gray-100 shadow-inner">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-2 sm:p-3 focus:outline-none transition-all duration-300 relative group"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <AnimatePresence>
                    {(hover || rating) >= star && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-amber-100/50 rounded-full -z-10"
                      />
                    )}
                  </AnimatePresence>
                  <Star
                    size={36}
                    fill={(hover || rating) >= star ? "#FBBF24" : "none"}
                    color={(hover || rating) >= star ? "#FBBF24" : "#D1D5DB"}
                    strokeWidth={(hover || rating) >= star ? 1.5 : 2}
                    className={`transition-all duration-300 ${(hover || rating) >= star ? "scale-110 drop-shadow-md text-amber-400" : "scale-100 hover:scale-110 hover:text-gray-400"}`}
                  />
                </button>
              ))}
            </div>
            <div className="h-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {rating > 0 && (
                  <motion.div
                    key="rating-badge"
                    initial={{ opacity: 0, y: 5, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.9 }}
                    className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 py-1.5 rounded-full border border-amber-200/50"
                  >
                    <span className="text-sm font-semibold text-amber-600">{rating} out of 5 stars</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Tell us more <span className="font-normal text-gray-400/70 capitalize tracking-normal">(Optional)</span></label>
            <div className="relative group">
              <textarea
                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all duration-300 min-h-[140px] resize-y text-gray-700 placeholder:text-gray-400 shadow-sm"
                placeholder="What did you like? What could be improved?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="group relative w-full py-4 px-6 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-2xl shadow-[0_4px_14px_0_rgb(0,0,0,0.1)] hover:shadow-[0_6px_25px_rgb(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none overflow-hidden"
            disabled={rating === 0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
            <div className="relative flex items-center justify-center space-x-2">
              <span className="tracking-wide">{submitLabel}</span>
              <CheckCircle size={20} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 ease-out" />
            </div>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
