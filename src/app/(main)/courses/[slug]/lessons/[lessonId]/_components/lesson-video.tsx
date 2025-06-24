"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play } from "lucide-react";
import { Lesson } from "@/types/custom.types";
import { useUpdateLessonProgress } from "@/hooks/lesson-progress/use-update-lesson-progress";
import { useMarkLessonComplete } from "@/hooks/lesson-progress/use-mark-lesson-complete";

// Dynamic import để tránh SSR issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

// Types for ReactPlayer
interface PlayerProgressState {
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
}

interface ReactPlayerRef {
  seekTo: (amount: number, type?: "seconds" | "fraction") => void;
  getCurrentTime: () => number;
  getSecondsLoaded: () => number;
  getDuration: () => number;
  getInternalPlayer: () => HTMLVideoElement | null;
}

interface LessonVideoProps {
  lesson: Lesson;
  courseSlug: string;
}

export default function LessonVideo({ lesson }: LessonVideoProps) {
  const playerRef = useRef<ReactPlayerRef>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [duration, setDuration] = useState(0);
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [hasBeenCompleted, setHasBeenCompleted] = useState(false);

  // Use refs to store current values for the cleanup function
  const watchedSecondsRef = useRef(0);
  const hasBeenCompletedRef = useRef(false);

  const updateProgressMutation = useUpdateLessonProgress();
  const markCompleteMutation = useMarkLessonComplete();

  // Update refs when state changes
  watchedSecondsRef.current = watchedSeconds;
  hasBeenCompletedRef.current = hasBeenCompleted;

  // Create a stable function for saving progress
  const saveProgress = useCallback(() => {
    if (watchedSecondsRef.current > 0 && lesson.id) {
      updateProgressMutation.mutate({
        lesson_id: lesson.id,
        watched_seconds: Math.floor(watchedSecondsRef.current),
        completed_at: hasBeenCompletedRef.current
          ? new Date().toISOString()
          : null,
      });
    }
  }, [lesson.id]);

  // Save progress periodically
  useEffect(() => {
    const interval = setInterval(saveProgress, 30000); // Save every 30 seconds
    return () => clearInterval(interval);
  }, [saveProgress]);

  // Save progress on unmount
  useEffect(() => {
    return () => {
      saveProgress();
    };
  }, [saveProgress]);

  // Handle player events
  const handleProgress = useCallback(
    (state: PlayerProgressState) => {
      const currentSeconds = state.playedSeconds;

      // Update watched seconds (maximum time reached)
      setWatchedSeconds((prevWatchedSeconds) => {
        if (currentSeconds > prevWatchedSeconds) {
          return currentSeconds;
        }
        return prevWatchedSeconds;
      });

      // Auto-complete lesson when 90% watched
      const completionThreshold = 0.9;
      if (
        !hasBeenCompletedRef.current &&
        duration > 0 &&
        state.played >= completionThreshold
      ) {
        setHasBeenCompleted(true);
        markCompleteMutation.mutate({
          lesson_id: lesson.id,
          watched_seconds: Math.floor(currentSeconds),
        });
      }
    },
    [duration, lesson.id]
  );

  const handleDuration = useCallback((duration: number) => {
    setDuration(duration);
  }, []);

  const handleEnded = useCallback(() => {
    if (!hasBeenCompletedRef.current) {
      setHasBeenCompleted(true);
      markCompleteMutation.mutate({
        lesson_id: lesson.id,
        watched_seconds: Math.floor(duration),
      });
    }
  }, [duration, lesson.id]);

  const handleManualComplete = useCallback(() => {
    if (!hasBeenCompleted) {
      setHasBeenCompleted(true);
      markCompleteMutation.mutate({
        lesson_id: lesson.id,
        watched_seconds: Math.floor(watchedSeconds),
      });
    }
  }, [hasBeenCompleted, watchedSeconds, lesson.id]);

  if (!lesson.video_url) {
    return (
      <Card>
        <CardContent className="aspect-video flex items-center justify-center">
          <div className="text-center">
            <Play className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Video chưa có sẵn</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-video bg-black">
        <ReactPlayer
          ref={playerRef}
          url={lesson.video_url}
          width="100%"
          height="100%"
          playing={isPlaying}
          controls={true}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onProgress={handleProgress}
          onDuration={handleDuration}
          onEnded={handleEnded}
          config={{
            file: {
              attributes: {
                controlsList: "nodownload",
                disablePictureInPicture: false,
              },
            },
          }}
        />
      </div>

      {/* Progress Information */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            {/* Lesson Completion Status */}
            {hasBeenCompleted ? (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Bài học đã hoàn thành!</span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trạng thái bài học</span>
                <Button
                  onClick={handleManualComplete}
                  variant="outline"
                  size="sm"
                  disabled={markCompleteMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Đánh dấu hoàn thành
                </Button>
              </div>
            )}

            {/* Learning Tips */}
            {!hasBeenCompleted && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Mẹo học tập:</strong> Bài học sẽ tự động được đánh
                  dấu hoàn thành khi bạn xem 90% nội dung.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
