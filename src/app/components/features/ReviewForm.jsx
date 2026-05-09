import React, { useState } from "react";
import { Star } from "lucide-react";

export default function ReviewForm({ onSubmit, initialData = {}, title = "Write a Review", submitLabel = "Submit Review" }) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">Rating</label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-colors duration-200"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                size={32}
                fill={(hover || rating) >= star ? "#FBBF24" : "none"}
                color={(hover || rating) >= star ? "#FBBF24" : "#D1D5DB"}
                className={(hover || rating) >= star ? "scale-110" : "scale-100"}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {rating > 0 ? `${rating} / 5` : "Select a rating"}
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium text-gray-700">Comment (Optional)</label>
        <textarea
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
          placeholder="Share your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200 disabled:opacity-50"
        disabled={rating === 0}
      >
        {submitLabel}
      </button>
    </form>
  );
}
