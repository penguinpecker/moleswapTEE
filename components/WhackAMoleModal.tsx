"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import { X } from "lucide-react";
import MoleWhack from "@/screens/MoleWhack";

interface WhackAMoleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onXpClaimed: () => void;
  xpClaimed: boolean;
}

export default function WhackAMoleModal({
  open,
  onOpenChange,
  onXpClaimed,
  xpClaimed,
}: WhackAMoleModalProps) {
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [hasWon, setHasWon] = useState(false);
  const [showWinMessage, setShowWinMessage] = useState(false);
  const [showXpClaimedMessage, setShowXpClaimedMessage] = useState(false);
  const [totalXp, setTotalXp] = useState(0);
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneText, setMilestoneText] = useState("");

  // Reset game state when modal opens
  useEffect(() => {
    if (open) {
      setGameStartTime(Date.now());
      setHasWon(false);
      setShowWinMessage(false);
      setShowXpClaimedMessage(xpClaimed);
      setTotalXp(0);
      setShowMilestone(false);
    }
  }, [open, xpClaimed]);

  // Milestone thresholds
  const milestones = [
    { xp: 500, text: "🎯 500 XP Milestone!" },
    { xp: 1000, text: "🔥 1000 XP Milestone!" },
    { xp: 1500, text: "⚡ 1500 XP Milestone!" },
    { xp: 2000, text: "💎 2000 XP Milestone!" },
    { xp: 2500, text: "🏆 2500 XP Milestone!" },
  ];

  // Hide XP claimed message after 10 seconds
  useEffect(() => {
    if (showXpClaimedMessage && !showWinMessage) {
      const timer = setTimeout(() => {
        setShowXpClaimedMessage(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showXpClaimedMessage, showWinMessage]);

  const handleMoleHit = (xpGained: number) => {
    if (!gameStartTime || xpClaimed || hasWon) return;

    // Update total XP and check for milestones and win condition
    setTotalXp((prev) => {
      const newXp = prev + xpGained;

      // Check for 3000 XP win condition
      if (newXp >= 3000 && !hasWon) {
        setHasWon(true);
        setShowWinMessage(true);
        onXpClaimed();
      }

      // Check if we hit a milestone
      const milestone = milestones.find((m) => newXp >= m.xp && prev < m.xp);

      if (milestone) {
        setMilestoneText(milestone.text);
        setShowMilestone(true);
        setTimeout(() => {
          setShowMilestone(false);
        }, 3000);
      }

      return newXp;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="h-[70vh] max-h-[90vh] w-[70vw] overflow-hidden rounded-none border-4 border-black bg-white p-0 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)] sm:max-w-3xl"
        showCloseButton={true}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white">
          <div className="relative flex h-full w-full items-center justify-center">
            {/* Close Button */}
            <DialogClose asChild>
              <button
                className="absolute top-4 right-4 z-[10001] flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-red-500 text-white transition-all hover:scale-110 hover:bg-red-600 sm:h-12 sm:w-12"
                style={{
                  boxShadow:
                    "4px 4px 0px 0px #000000, 2px 2px 0px 0px #8A4836, inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)",
                }}
                aria-label="Close game"
              >
                <X className="h-6 w-6" />
              </button>
            </DialogClose>
            <MoleWhack onMoleHit={handleMoleHit} xpClaimed={xpClaimed} />
            {showWinMessage && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70">
                <div className="relative mx-4 max-w-md rounded-lg border-4 border-green-500 bg-green-900 p-6 text-center">
                  <h2 className="font-family-ThaleahFat mb-4 text-3xl font-bold text-green-100 sm:text-4xl">
                    🎉 Congratulations!
                  </h2>
                  <p className="font-family-ThaleahFat mb-2 text-xl text-green-200 sm:text-2xl">
                    You reached 3000 XP!
                  </p>
                  <p className="font-family-ThaleahFat mb-4 text-2xl text-green-300 sm:text-3xl">
                    +1500 XP Claimed!
                  </p>
                  <button
                    onClick={() => {
                      setShowWinMessage(false);
                      onOpenChange(false);
                    }}
                    className="font-family-ThaleahFat cursor-pointer rounded-lg bg-green-600 px-6 py-3 text-lg font-bold text-white transition-colors hover:bg-green-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            {xpClaimed && hasWon && !showWinMessage && showXpClaimedMessage && (
              <div className="absolute right-4 bottom-4 z-[10000] rounded-lg border-2 border-yellow-500 bg-yellow-900/90 px-4 py-2">
                <p className="font-family-ThaleahFat text-sm text-yellow-100 sm:text-base">
                  ✅ XP Already Claimed
                </p>
              </div>
            )}
            {showMilestone && (
              <div className="absolute top-1/2 left-1/2 z-[10001] -translate-x-1/2 -translate-y-1/2 rounded-lg border-4 border-green-500 bg-green-900 px-6 py-4 shadow-lg">
                <p className="font-family-ThaleahFat text-2xl font-bold text-green-100 sm:text-3xl md:text-4xl">
                  {milestoneText}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
