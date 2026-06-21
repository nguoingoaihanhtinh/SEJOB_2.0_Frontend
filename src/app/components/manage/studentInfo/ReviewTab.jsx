import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { Printer, Edit3 } from "lucide-react";
import { fetchApplicationReviews, createReview, updateReview } from "../../../modules/services/reviewService";
import ReviewForm from "../../features/ReviewForm";
export default function ReviewTab({ application }) {
  const dispatch = useDispatch();
  const { applicationReviews } = useSelector((state) => state.reviews);
  const printRef = useRef();
  const [isEditing, setIsEditing] = useState(false);

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

  const handleReviewUpdate = (reviewData) => {
    dispatch(updateReview({
      id: latestReview.id,
      data: reviewData,
    })).then(() => {
      setIsEditing(false);
      dispatch(fetchApplicationReviews(application.id));
    });
  };

  const companyReviews = applicationReviews.filter(r => r.type === "COMPANY_TO_APPLICANT");
  const latestReview = companyReviews.length > 0 ? companyReviews[0] : null;

  const handlePrintReview = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Evaluation_${application?.full_name || "Applicant"}`,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Internal Review</h3>
          <p className="text-sm text-gray-500 mt-1">
            This review is private and only visible to you and the admin. The candidate will not see this.
          </p>
        </div>
        {latestReview && !isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm text-sm"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handlePrintReview}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm text-sm"
            >
              <Printer className="w-4 h-4" />
              Print PDF
            </button>
          </div>
        )}
      </div>

      {companyReviews.length === 0 && !isEditing && (
        <ReviewForm 
          variant="formal"
          onSubmit={handleReviewSubmit} 
          title="Student Performance Evaluation" 
          submitLabel="Submit Official Evaluation"
        />
      )}

      {latestReview && !isEditing && (
        <div ref={printRef}>
          <ReviewForm
            variant="formal"
            readOnly
            initialData={{ rating: latestReview.rating, comment: latestReview.comment || "", created_at: latestReview.created_at }}
            title="Student Performance Evaluation"
          />
        </div>
      )}

      {isEditing && latestReview && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">Edit Review</h4>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancel
            </button>
          </div>
          <ReviewForm
            variant="formal"
            initialData={{ rating: latestReview.rating, comment: latestReview.comment || "" }}
            onSubmit={handleReviewUpdate}
            title="Student Performance Evaluation"
            submitLabel="Update Evaluation"
          />
        </div>
      )}
    </div>
  );
}
