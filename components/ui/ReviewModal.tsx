"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { saveReview } from "@/lib/firebaseService";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "@/components/ui/use-toast";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  productId: string;
  productName: string;
}

export default function ReviewModal({ open, onClose, orderId, productId, productName }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const currentUser = useAuthStore((s) => s.currentUser);

  const handleSubmit = async () => {
    if (!currentUser || rating === 0) return;
    setLoading(true);
    try {
      await saveReview({
        userId: currentUser.id,
        userName: currentUser.name,
        orderId,
        productId,
        productName,
        rating,
        text: text.trim(),
      });
      toast({ title: "Review submitted! ⭐", description: "Thank you for your feedback." });
      setText("");
      setRating(0);
      onClose();
    } catch (err: any) {
      console.error('Review submit error:', err?.code ?? err?.message ?? err);
      const msg = err?.code === 'permission-denied'
        ? 'Permission denied. Please deploy updated Firestore rules.'
        : 'Please try again.';
      toast({ title: 'Failed to submit review', description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review: {productName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Star Rating */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hovered || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <p className="mb-2 text-sm font-medium text-gray-700">Your Review (optional)</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Share your experience with this product..."
              className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={rating === 0 || loading}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
