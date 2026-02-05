"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pickaxe, Hammer, Zap } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dapp");
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-5xl font-bold text-white">
            🎮 Arcade Gaming Hub
          </h1>
          <p className="text-xl text-purple-200">Play games and earn tokens!</p>
        </div>

        {/* Games Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Token Swap Card */}
          <Card className="border-2 border-purple-500 bg-slate-800 shadow-lg transition-shadow hover:shadow-purple-500/50">
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <Zap className="h-12 w-12 text-yellow-400" />
              </div>
              <CardTitle className="text-center text-white">
                Token Swap
              </CardTitle>
              <CardDescription className="text-center text-purple-200">
                Exchange your tokens instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-sm text-gray-300">
                Swap your earned tokens for other cryptocurrencies
              </p>
              <Link href="/dapp" rel="noopener noreferrer">
                <Button className="w-full bg-yellow-500 font-bold text-black hover:bg-yellow-600">
                  Go to Swap
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Diamond Miner Card */}
          <Card className="border-2 border-blue-500 bg-slate-800 shadow-lg transition-shadow hover:shadow-blue-500/50">
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <Pickaxe className="h-12 w-12 text-blue-400" />
              </div>
              <CardTitle className="text-center text-white">
                Diamond Miner
              </CardTitle>
              <CardDescription className="text-center text-purple-200">
                Mine diamonds and collect treasures
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-sm text-gray-300">
                Collect diamonds while avoiding rocks. Earn tokens!
              </p>
              <Link href="/diamond-miner">
                <Button className="w-full bg-blue-500 font-bold text-white hover:bg-blue-600">
                  Play Now
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Mole Whack Card */}
          <Card className="border-2 border-red-500 bg-slate-800 shadow-lg transition-shadow hover:shadow-red-500/50">
            <CardHeader>
              <div className="mb-4 flex justify-center">
                <Hammer className="h-12 w-12 text-red-400" />
              </div>
              <CardTitle className="text-center text-white">
                Mole Whack
              </CardTitle>
              <CardDescription className="text-center text-purple-200">
                Hit the moles before they hide
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="mb-4 text-sm text-gray-300">
                Quick reflexes game. Hit as many moles as you can!
              </p>
              <Link href="/mole-whack">
                <Button className="w-full bg-red-500 font-bold text-white hover:bg-red-600">
                  Play Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400">
          <p>🏆 Complete games to earn tokens and climb the leaderboard!</p>
        </div>
      </div>
    </main>
  );
}
