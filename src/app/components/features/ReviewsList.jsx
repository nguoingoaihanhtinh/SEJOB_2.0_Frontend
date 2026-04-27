import React from "react";
import { Star, User } from "lucide-react";

export default function ReviewsList({ reviews = [], emptyMessage = "No reviews yet." }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 italic bg-gray-50 rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {review.reviewer_name || "Anonymous User"}
                </h4>
                <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
              </div>
            </div>
            <div className="flex bg-yellow-50 px-2 py-1 rounded-lg">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  fill={review.rating >= star ? "#FBBF24" : "none"}
                  color={review.rating >= star ? "#FBBF24" : "#D1D5DB"}
                />
              ))}
            </div>
          </div>
          
          {review.comment && (
            <div className="mt-4 text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg italic">
              "{review.comment}"
            </div>
          )}
          
          {!review.is_approved && review.type === 'APPLICANT_TO_COMPANY' && (
             <p className="mt-2 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded inline-block">
               * Pending Admin Approval
             </p>
          )}
        </div>
      ))}
    </div>
  );
}
