import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchApplicationReviews, createReview } from "../../../modules/services/reviewService";
import ReviewForm from "../../features/ReviewForm";
import ReviewsList from "../../features/ReviewsList";

export default function ReviewTab({ application }) {
  const dispatch = useDispatch();
  const { applicationReviews, loading } = useSelector((state) => state.reviews);

  useEffect(() => {
    if (application?.id) {
      dispatch(fetchApplicationReviews(application.id));
    }
  }, [dispatch, application?.id]);

  const handleReviewSubmit = (reviewData) => {
    dispatch(createReview({
      application_id: application.id,
      type: "COMPANY_TO_APPLICANT",
      ...reviewData
    })).then(() => {
        dispatch(fetchApplicationReviews(application.id));
    });
  };

  // Filter only reviews sent by the company about the applicant
  const companyReviews = applicationReviews.filter(r => r.type === "COMPANY_TO_APPLICANT");

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Review</h3>
        <p className="text-sm text-gray-500 mb-6">
          This review is private and only visible to you and the admin. The candidate will not see this.
        </p>
        
        <ReviewsList 
            reviews={companyReviews} 
            emptyMessage="You haven't reviewed this applicant yet."
        />
      </div>

      {companyReviews.length === 0 && (
        <ReviewForm 
          onSubmit={handleReviewSubmit} 
          title="Review this Applicant" 
          submitLabel="Save Review"
        />
      )}
    </div>
  );
}
