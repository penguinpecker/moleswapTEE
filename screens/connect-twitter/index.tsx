"use client";

import { useRouter } from "next/navigation";
import { BackgroundImage, NavBar } from "../shared";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { FaXTwitter } from "react-icons/fa6";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function ConnectTwitterPage() {
  const router = useRouter();

  const handleConnect = () => {
    // Handle Twitter connection logic here
    console.log("Connecting Twitter account...");
    // Add your Twitter OAuth logic here
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center gap-4">
      <BackgroundImage />

      <div className="relative z-20 flex w-full max-w-3xl flex-1 flex-col px-1 sm:p-6 sm:px-2">
        {/* Header */}
        <div className="relative top-[20px] z-10 mx-auto flex w-[95%] items-center justify-center rounded-lg px-2 py-2 text-center sm:top-[40px] sm:w-[85%] sm:px-6 sm:py-4">
          <h1 className="text-peach-300 font-family-ThaleahFat text-shadow-header text-lg font-bold tracking-widest uppercase sm:text-3xl md:text-5xl">
            CONNECT TWITTER
          </h1>

          <Image
            src="/quest/header-quest-bg.png"
            alt="Header BG"
            width={200}
            height={200}
            className="absolute inset-0 left-0 z-[-1] h-full w-full"
          />
        </div>

        {/* Body */}
        <div className="relative mb-6 block h-full">
          <Image
            src="/quest/Quest-BG.png"
            alt="BG"
            width={200}
            height={200}
            className="absolute inset-0 z-0 h-full w-full object-fill"
          />

          {/* Connect Twitter Form */}
          <div className="relative z-50 mx-auto mt-6 mb-6 flex w-full items-center justify-center p-2 sm:mt-12 sm:w-[85%] sm:p-4">
            {/* Main Dialog Box */}
            <div className="relative z-10 w-full max-w-md">
              {/* Main Container - Brown Wooden Panel */}
              <div className="relative p-2 sm:p-4 md:p-6">
                {/* Connect Account Button */}
                <div className="mb-2 sm:mb-4 md:mb-6">
                  <button
                    onClick={handleConnect}
                    className="relative w-full cursor-pointer rounded py-2 text-base font-bold text-white transition-all hover:scale-105 sm:py-4 sm:text-xl"
                  >
                    <div className="font-family-ThaleahFat flex items-center justify-center gap-1 text-base font-thin sm:gap-2 sm:text-xl md:text-2xl">
                      <FaXTwitter className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      <span className="text-xs sm:text-base">
                        CONNECT ACCOUNT
                      </span>
                    </div>
                    <Image
                      src="/dapp/connect-wallet.png"
                      alt="Connect"
                      width={200}
                      height={200}
                      className="absolute inset-0 z-[-1] h-full w-full object-fill"
                    />
                  </button>
                </div>

                {/* Instructional Text */}
                <p className="font-family-ThaleahFat text-center text-xs text-[#B0B0B0] uppercase sm:text-2xl">
                  Link your X profile to prove you are a hooman!
                </p>
              </div>
            </div>
          </div>

          {/* // NAVIGATION ARROWS  */}
          <button
            onClick={() => router.push("/earn-xp")}
            className="group absolute bottom-0 left-2 z-50 flex h-6 w-6 cursor-pointer items-center justify-center transition-all hover:scale-110 sm:top-1/2 sm:bottom-auto sm:left-4 sm:h-10 sm:w-10 sm:-translate-y-1/2 md:h-12 md:w-12"
          >
            <Image
              src="/profile/footer-image.svg"
              alt="Previous"
              fill
              className="absolute inset-0 object-contain"
            />
            <ChevronLeft className="text-peach-300 group-hover:text-peach-400 relative z-10 h-3 w-3 transition-colors sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>
          <button
            onClick={() => router.push("/waitlist")}
            className="group absolute right-2 bottom-0 z-50 flex h-6 w-6 cursor-pointer items-center justify-center transition-all hover:scale-110 sm:top-1/2 sm:right-4 sm:bottom-auto sm:h-10 sm:w-10 sm:-translate-y-1/2 md:h-12 md:w-12"
          >
            <Image
              src="/profile/footer-image.svg"
              alt="Next"
              fill
              className="absolute inset-0 object-contain"
            />
            <ChevronRight className="text-peach-300 group-hover:text-peach-400 relative z-10 h-3 w-3 transition-colors sm:h-5 sm:w-5 md:h-6 md:w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
