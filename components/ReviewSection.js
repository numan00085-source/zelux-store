// components/ReviewSection.js — professional review section
import { useState, useEffect } from 'react';
import StarRating from './StarRating';

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zelux-gray w-3">{star}</span>
      <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <div className="flex-1 h-1.5 bg-zelux-navy-light rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-zelux-gray w-6 text-right">{count}</span>
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className="border border-zelux-gray-mid/20 rounded-2xl p-5 bg-zelux-navy-light hover:border-zelux-gray-mid/40 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-zelux-cyan/10 border border-zelux-cyan/30 flex items-center justify-center flex-shrink-0">
            <span className="text-zelux-cyan text-sm font-semibold">{(review.name || 'C')[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-zelux-white">{review.name || 'Customer'}</p>
            {review.verified && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified Purchase
              </span>
            )}
          </div>
        </div>
        <p className="text-[11px] text-zelux-gray">{review.date}</p>
      </div>
      <div className="mb-2.5">
        <StarRating value={review.rating} size="sm" />
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
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-zelux-white">Thank you for your review!</p>
        <p className="text-sm text-zelux-gray mt-1">Your review has been published.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-zelux-navy-light border border-zelux-gray-mid/20 rounded-2xl p-6">
      <h4 className="text-sm font-semibold text-zelux-white mb-5">Write a Review</h4>

      <div className="mb-5">
        <label className="block text-[10px] text-zelux-gray mb-2 uppercase tracking-widest">Your Rating</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="mb-4">
        <label className="block text-[10px] text-zelux-gray mb-2 uppercase tracking-widest">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-zelux-navy border border-zelux-gray-mid/30 rounded-xl px-4 py-3 text-sm text-zelux-white placeholder-zelux-gray/50 focus:outline-none focus:border-zelux-cyan/50 transition-colors"
          maxLength={50}
        />
        <p className="text-[10px] text-zelux-gray/60 mt-1.5">Only first 4 letters will be shown publicly</p>
      </div>

      <div className="mb-5">
        <label className="block text-[10px] text-zelux-gray mb-2 uppercase tracking-widest">Your Review</label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          rows={4}
          className="w-full bg-zelux-navy border border-zelux-gray-mid/30 rounded-xl px-4 py-3 text-sm text-zelux-white placeholder-zelux-gray/50 focus:outline-none focus:border-zelux-cyan/50 transition-colors resize-none"
          maxLength={500}
          spellCheck={false}
          required
        />
        <p className="text-[10px] text-zelux-gray/60 mt-1.5 text-right">{comment.length}/500</p>
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-zelux-cyan text-zelux-navy py-3 rounded-xl text-xs font-semibold tracking-widest uppercase hover:bg-zelux-cyan/90 transition-colors disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

export default function ReviewSection({ productId, orderId = null }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Rating breakdown
  const breakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }));

  function handleNewReview(review) {
    setReviews(prev => [review, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="mt-16 border-t border-zelux-gray-mid/20 pt-12">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <h3 className="text-xl font-bold text-zelux-white">Customer Reviews</h3>
        {orderId && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="border border-zelux-cyan/40 text-zelux-cyan px-5 py-2.5 text-[10px] tracking-widest uppercase hover:bg-zelux-cyan hover:text-zelux-navy transition-all duration-200 rounded-xl"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating summary — only if there are reviews */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-6 mb-10 bg-zelux-navy-light border border-zelux-gray-mid/20 rounded-2xl p-6">
          {/* Big score */}
          <div className="flex flex-col items-center justify-center sm:border-r border-zelux-gray-mid/20 sm:pr-6 sm:min-w-[120px]">
            <span className="text-5xl font-bold text-zelux-white mb-1">{avgRating}</span>
            <StarRating value={Math.round(parseFloat(avgRating))} size="sm" />
            <span className="text-xs text-zelux-gray mt-2">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
          </div>
          {/* Breakdown bars */}
          <div className="flex-1 flex flex-col justify-center gap-2">
            {breakdown.map(({ star, count }) => (
              <RatingBar key={star} star={star} count={count} total={reviews.length} />
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && orderId && (
        <div className="mb-8">
          <ReviewForm productId={productId} orderId={orderId} onSubmitted={handleNewReview} />
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="shimmer-bg rounded-2xl h-36" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-zelux-gray-mid/20 rounded-2xl">
          <svg className="w-10 h-10 text-zelux-gray/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-zelux-gray text-sm">No reviews yet. Be the first!</p>
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
