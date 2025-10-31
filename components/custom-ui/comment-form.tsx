"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Loader2, CheckCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

interface CommentFormProps {
  movieId: number;
  onCommentSubmitted?: () => void;
}

export function CommentForm({ movieId, onCommentSubmitted }: CommentFormProps) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Basic validation
      if (!text.trim()) {
        setError("Comment text is required");
        return;
      }

      if (!session && !authorName.trim()) {
        setError("Name is required for guest comments");
        return;
      }

      // Get client IP address (for moderation purposes)
      const ipResponse = await fetch('/api/client-ip').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json().catch(() => ({})) : {};

      const payload = {
        movieId,
        text: text.trim(),
        userId: session?.user?.id || null,
        authorName: !session ? authorName.trim() : null,
        authorEmail: !session ? authorEmail.trim() || null : null,
        ipAddress: ipData.ip || null
      };

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit comment');
      }

      // Success
      setText("");
      setAuthorName("");
      setAuthorEmail("");
      setIsSubmitted(true);
      
      // Trigger refresh of comment list if user is logged in (comment is auto-approved)
      if (session) {
        onCommentSubmitted?.();
      }

      // Hide success message after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <div>
              <p className="font-medium">Comment submitted successfully!</p>
              <p className="text-sm text-muted-foreground">
                {session ? 
                  "Your comment has been posted and is now visible to other users." :
                  "Your comment is pending approval and will be visible once reviewed."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Leave a Comment
        </CardTitle>
        {!session && (
          <p className="text-sm text-muted-foreground">
            Guest comments require manual approval before appearing. 
            <Link href="/auth/login" className="text-primary hover:underline ml-1">
              Sign in
            </Link> to post comments immediately.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Guest user fields */}
          {!session && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="authorName" className="text-sm font-medium">
                  Name *
                </label>
                <Input
                  id="authorName"
                  placeholder="Your name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required={!session}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="authorEmail" className="text-sm font-medium">
                  Email (optional)
                </label>
                <Input
                  id="authorEmail"
                  type="email"
                  placeholder="your@email.com"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Logged in user info */}
          {session && (
            <div className="text-sm text-muted-foreground">
              Commenting as <span className="font-medium">{session.user?.name || session.user?.email}</span>
            </div>
          )}

          {/* Comment text */}
          <div className="space-y-2">
            <label htmlFor="commentText" className="text-sm font-medium">
              Comment *
            </label>
            <Textarea
              id="commentText"
              placeholder="Share your thoughts about this movie..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Submit button */}
          <Button 
            type="submit" 
            disabled={isSubmitting || (!session && !authorName.trim()) || !text.trim()}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Comment'
            )}
          </Button>

          {/* Info text */}
          <p className="text-xs text-muted-foreground">
            {session ? 
              "Your comment will be posted immediately and visible to other users." :
              "Guest comments require manual approval. Sign in to have your comments posted immediately."
            }
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
