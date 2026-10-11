// components/ReviewSection.js — full review section for product page
import { useState, useEffect } from 'react';
import StarRating from './StarRating';

function ReviewCard({ review }) {
  return (
    <div className="border border-zelux-gray-mid/30 rounded-xl p-5 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StarRating value={review.rating} size="sm" />
            {review.verified && (
              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Verified Purchase
              </span>
            )}
          </div>
          <p className="font-semibold text-zelux-black text-sm">{review.name}</p>
        </div>
        <p className="text-xs text-zelux-gray">{review.date}</p>
      </div>
      <p className="text-sm text-zelux-gray leading-relaxed">{review.comment}</p>
    </div>
  );
}

function ReviewForm({ productId, orderId, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!comment.trim()) { setError('Please write your review'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rating, comment, orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        onSubmitted && onSubmitted(data.review);
      } else {
        setError(data.error || 'Failed to submit');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="font-semibold text-green-800">Thank you for your review!</p>
        <p className="text-sm text-green-600 mt-1">Your review has been published.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-zelux-gray-light rounded-xl p-6">
      <h4 className="font-semibold text-zelux-black mb-4">Write a Review</h4>

      <div className="mb-4">
        <label className="block text-xs text-zelux-gray mb-2 uppercase tracking-wider">Your Rating</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="mb-4">
        <label className="block text-xs text-zelux-gray mb-2 uppercase tracking-wider">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="w-full border border-zelux-gray-mid rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-zelux-black transition-colors"
          maxLength={50}
        />
        <p className="text-xs text-zelux-gray mt-1">Only first 4 letters will be shown publicly</p>
      </div>

      <div className="mb-4">
        <label className="block text-xs text-zelux-gray mb-2 uppercase tracking-wider">Your Review</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full border border-zelux-gray-mid rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-zelux-black transition-colors resize-none"
          maxLength={500}
          required
        />
        <p className="text-xs text-zelux-gray mt-1">{comment.length}/500</p>
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-zelux-black text-white py-3 rounded-lg text-sm font-medium tracking-wider uppercase hover:bg-zelux-gold transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default function ReviewSection({ productId, orderId = null }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  // Only show form if customer came with a valid orderId (i.e. their order is delivered)
  const [showForm, setShowForm] = useState(!!orderId);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/reviews?productId=${productId}`)
      .then(r => r.json())
      .then(data => { setReviews(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [productId]);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  function handleNewReview(review) {
    setReviews(prev => [review, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="mt-16 border-t border-zelux-gray-mid/30 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h3 className="font-display text-2xl font-light text-zelux-black">Customer Reviews</h3>
          {avgRating && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating value={Math.round(parseFloat(avgRating))} size="sm" />
              <span className="text-sm font-semibold text-zelux-black">{avgRating}</span>
              <span className="text-sm text-zelux-gray">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>
        {/* Only verified buyers (with orderId) can write a review */}
        {orderId && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="border border-zelux-black text-zelux-black px-6 py-2.5 text-xs tracking-widest uppercase hover:bg-zelux-black hover:text-white transition-colors rounded-lg"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form — only for verified buyers */}
      {showForm && orderId && (
        <div className="mb-8">
          <ReviewForm productId={productId} orderId={orderId} onSubmitted={handleNewReview} />
        </div>
      )}

      {/* Reviews List — visible to everyone */}
      {loading ? (
        <div className="text-center py-8 text-zelux-gray text-sm">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zelux-gray-mid rounded-xl">
          <svg className="w-12 h-12 text-zelux-gray-mid mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-zelux-gray text-sm">No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
