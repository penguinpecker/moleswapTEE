"use client";
import React, { useCallback, useState, useEffect } from "react";
import {
  connectWithWalletConnect,
  disconnectWalletConnect,
  getWalletConnectProvider,
} from "@/lib/wallet/walletconnect/provider";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  Wallet,
  RefreshCw,
  Copy,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { getChains, type RelayChain } from "@/lib/relay/api";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function ConnectWalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [chains, setChains] = useState<RelayChain[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const isInjectedAvailable =
    typeof window !== "undefined" && !!window.ethereum;
  const label = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Connect Wallet";

  // Load chains for switching
  useEffect(() => {
    getChains().then(setChains).catch(console.error);
  }, []);

  // Get current chain ID
  const fetchChainId = useCallback(async () => {
    try {
      if (window.ethereum) {
        const chainIdHex = await window.ethereum.request({
          method: "eth_chainId",
        });
        const chainId = parseInt(chainIdHex, 16);
        setChainId(chainId);
      } else {
        const provider = await getWalletConnectProvider();
        if (provider?.chainId) {
          setChainId(provider.chainId);
        }
      }
    } catch (error) {
      console.error("Error fetching chain ID:", error);
    }
  }, []);

  useEffect(() => {
    // Try to restore injected connection
    const eth = window.ethereum;
    if (!eth) return;

    const checkConnection = async () => {
      try {
        const accounts: string[] = await eth.request?.({
          method: "eth_accounts",
        });
        if (accounts?.[0]) {
          setAddress(accounts[0]);
          await fetchChainId();
        }
      } catch (e) {
        // Silently fail
      }
    };

    checkConnection();

    const onAccounts = (accs: string[]) => {
      if (accs?.[0]) {
        setAddress(accs[0]);
        fetchChainId();
      } else {
        setAddress(null);
        setChainId(null);
      }
    };

    const onChainChanged = () => {
      fetchChainId();
    };

    if (eth.on) {
      eth.on("accountsChanged", onAccounts);
      eth.on("chainChanged", onChainChanged);
      return () => {
        eth.removeListener?.("accountsChanged", onAccounts);
        eth.removeListener?.("chainChanged", onChainChanged);
      };
    }
  }, [fetchChainId]);

  // Listen for WalletConnect events
  useEffect(() => {
    const setupWalletConnect = async () => {
      try {
        const provider = await getWalletConnectProvider();
        if (provider) {
          provider.on("accountsChanged", (accounts: string[]) => {
            if (accounts?.[0]) {
              setAddress(accounts[0]);
              fetchChainId();
            } else {
              setAddress(null);
              setChainId(null);
            }
          });
          provider.on("chainChanged", () => {
            fetchChainId();
          });
          provider.on("disconnect", () => {
            setAddress(null);
            setChainId(null);
          });
        }
      } catch (error) {
        // Provider might not be initialized yet
      }
    };
    setupWalletConnect();
  }, [fetchChainId]);

  // Listen for custom wallet connection event from other components
  useEffect(() => {
    const handleWalletConnected = (event: Event) => {
      const customEvent = event as CustomEvent<{ address: string }>;
      if (customEvent.detail?.address) {
        setAddress(customEvent.detail.address);
        fetchChainId();
      }
    };

    window.addEventListener("walletConnected", handleWalletConnected);
    return () => {
      window.removeEventListener("walletConnected", handleWalletConnected);
    };
  }, [fetchChainId]);

  const onConnect = useCallback(async () => {
    try {
      setConnecting(true);
      if (isInjectedAvailable) {
        const accounts: string[] = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts?.[0]) {
          setAddress(accounts[0]);
          await fetchChainId();
          // Dispatch custom event to notify other components
          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("walletConnected", {
                detail: { address: accounts[0] },
              }),
            );
          }
          return;
        }
      }
      const accounts = await connectWithWalletConnect();
      if (accounts?.[0]) {
        setAddress(accounts[0]);
        await fetchChainId();
        // Dispatch custom event to notify other components
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("walletConnected", {
              detail: { address: accounts[0] },
            }),
          );
        }
      }
    } catch (e) {
      console.error("Error connecting wallet:", e);
    } finally {
      setConnecting(false);
    }
  }, [isInjectedAvailable, fetchChainId]);

  const onDisconnect = useCallback(async () => {
    try {
      // Disconnect WalletConnect if connected
      const provider = await getWalletConnectProvider();
      if (provider?.session) {
        await disconnectWalletConnect();
      }
      setAddress(null);
      setChainId(null);
      setIsOpen(false);

      // Dispatch custom event to notify other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("walletDisconnected"));
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      // Still clear local state
      setAddress(null);
      setChainId(null);
      setIsOpen(false);

      // Dispatch custom event even on error
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("walletDisconnected"));
      }
    }
  }, []);

  const onSwitchChain = useCallback(
    async (targetChainId: number) => {
      try {
        if (window.ethereum) {
          // Try to switch chain
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: `0x${targetChainId.toString(16)}` }],
            });
            await fetchChainId();
          } catch (switchError: any) {
            // If chain doesn't exist, try to add it
            if (switchError.code === 4902) {
              const chain = chains.find((c) => c.id === targetChainId);
              if (chain) {
                // Use common RPC URLs for known chains
                const rpcUrls: Record<number, string[]> = {
                  1: ["https://eth.llamarpc.com", "https://rpc.ankr.com/eth"],
                  8453: [
                    "https://mainnet.base.org",
                    "https://base.llamarpc.com",
                  ],
                  42161: [
                    "https://arb1.arbitrum.io/rpc",
                    "https://arbitrum.llamarpc.com",
                  ],
                  10: [
                    "https://mainnet.optimism.io",
                    "https://optimism.llamarpc.com",
                  ],
                  137: [
                    "https://polygon-rpc.com",
                    "https://polygon.llamarpc.com",
                  ],
                  56: [
                    "https://bsc-dataseed.binance.org",
                    "https://bsc.llamarpc.com",
                  ],
                  // Testnets
                  11155111: [
                    "https://rpc.sepolia.org",
                    "https://ethereum-sepolia-rpc.publicnode.com",
                  ],
                  84532: [
                    "https://sepolia.base.org",
                    "https://base-sepolia-rpc.publicnode.com",
                  ],
                  421614: [
                    "https://sepolia-rollup.arbitrum.io/rpc",
                    "https://arbitrum-sepolia-rpc.publicnode.com",
                  ],
                  11155420: [
                    "https://sepolia.optimism.io",
                    "https://optimism-sepolia-rpc.publicnode.com",
                  ],
                  80002: [
                    "https://rpc-amoy.polygon.technology",
                    "https://polygon-amoy-rpc.publicnode.com",
                  ],
                  97: [
                    "https://data-seed-prebsc-1-s1.binance.org:8545",
                    "https://bsc-testnet-rpc.publicnode.com",
                  ],
                };

                const explorerUrls: Record<number, string[]> = {
                  1: ["https://etherscan.io"],
                  8453: ["https://basescan.org"],
                  42161: ["https://arbiscan.io"],
                  10: ["https://optimistic.etherscan.io"],
                  137: ["https://polygonscan.com"],
                  56: ["https://bscscan.com"],
                  11155111: ["https://sepolia.etherscan.io"],
                  84532: ["https://sepolia.basescan.org"],
                  421614: ["https://sepolia.arbiscan.io"],
                  11155420: ["https://sepolia-optimism.etherscan.io"],
                  80002: ["https://amoy.polygonscan.com"],
                  97: ["https://testnet.bscscan.com"],
                };

                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: `0x${targetChainId.toString(16)}`,
                      chainName: chain.displayName || chain.name,
                      nativeCurrency: {
                        name: chain.currency?.name || "ETH",
                        symbol: chain.currency?.symbol || "ETH",
                        decimals: chain.currency?.decimals || 18,
                      },
                      rpcUrls: rpcUrls[targetChainId] || [
                        "https://eth.llamarpc.com",
                      ],
                      blockExplorerUrls: explorerUrls[targetChainId] || [],
                    },
                  ],
                });
                await fetchChainId();
              }
            } else {
              throw switchError;
            }
          }
        } else {
          // For WalletConnect, we can't programmatically switch chains
          // User needs to switch in their wallet
          alert(
            `Please switch to ${chains.find((c) => c.id === targetChainId)?.displayName || `chain ${targetChainId}`} in your wallet`,
          );
        }
        setIsOpen(false);
      } catch (error) {
        console.error("Error switching chain:", error);
      }
    },
    [chains, fetchChainId],
  );

  const currentChain = chains.find((c) => c.id === chainId);

  // If not connected, show connect button
  if (!address) {
    return (
      <button
        type="button"
        onClick={onConnect}
        disabled={connecting}
        className="flex h-full w-full cursor-pointer items-center justify-center gap-1 rounded px-3 py-1 text-black shadow transition-all hover:scale-105 disabled:opacity-60"
      >
        <Image
          src="/profile/Wallet.png"
          alt="Avatar"
          width={30}
          height={30}
          className="h-8 w-8 object-cover"
        />
        {connecting ? "Connecting..." : label}
      </button>
    );
  }

  // If connected, show dropdown menu
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex h-full w-full cursor-pointer items-center justify-center gap-4 rounded px-3 py-1 text-black shadow transition-all hover:scale-105"
        >
          <div className="flex flex-col items-start">
            <div className="font-family-ThaleahFat font-base text-xl">
              {label}
            </div>
            <span className="mt-[-8px] text-left text-[18px] font-thin text-black">
              Balance: 0 MOLE
            </span>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-black" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="font-family-ThaleahFat bg-ground w-64 rounded-lg border-2 border-[#5D2C28] p-2 text-white"
        style={{
          boxShadow:
            "4px 4px 0px 0px #5D2C28, 2px 2px 0px 0px #8A4836, inset 0px 0px 0px 1px rgba(255, 255, 255, 0.1)",
        }}
      >
        <DropdownMenuLabel className="text-peach-300 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="text-xl font-medium uppercase">
              WALLET CONNECTED
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 bg-[#5D2C28]" />

        <DropdownMenuLabel className="text-peach-300 px-2 py-1.5">
          <div className="flex flex-col gap-1">
            <div className="text-xl font-medium uppercase">ADDRESS</div>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-base font-normal text-white">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
              </span>
              {address && (
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(address);
                    } catch (err) {
                      console.error("Failed to copy:", err);
                    }
                  }}
                  className="cursor-pointer transition-opacity hover:opacity-70"
                  title="Copy address"
                >
                  <Copy className="text-peach-300 h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        {chainId && (
          <>
            <DropdownMenuSeparator className="my-1 bg-[#5D2C28]" />
            <DropdownMenuLabel className="text-peach-300 px-2 py-1.5">
              <div className="flex flex-col gap-1">
                <div className="text-xl font-medium uppercase">
                  CURRENT CHAIN
                </div>
                <div className="text-lg font-normal text-white">
                  {currentChain?.displayName ||
                    currentChain?.name ||
                    `CHAIN ${chainId}`}
                </div>
              </div>
            </DropdownMenuLabel>
          </>
        )}

        {chains.filter((c) => c.vmType === "evm" || !c.vmType).length > 0 && (
          <>
            <DropdownMenuSeparator className="my-1 bg-[#5D2C28]" />
            <DropdownMenuLabel className="text-peach-300 px-2 py-1.5">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="text-xl font-medium uppercase">
                  SWITCH CHAIN
                </span>
              </div>
            </DropdownMenuLabel>
            <div className="max-h-48 overflow-y-auto">
              {chains
                .filter((c) => c.vmType === "evm" || !c.vmType)
                .slice(0, 10)
                .map((chain) => (
                  <DropdownMenuItem
                    key={chain.id}
                    onClick={() => onSwitchChain(chain.id)}
                    className={`cursor-pointer px-2 py-1.5 transition-colors ${
                      chainId === chain.id
                        ? "!bg-[#5D2C28] hover:!bg-[#8A4836]"
                        : "hover:!bg-[#8A4836]/50"
                    }`}
                  >
                    <div className="flex w-full items-center gap-2">
                      {chain.iconUrl && (
                        <Image
                          src={chain.iconUrl}
                          alt={chain.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                      )}
                      <span className="flex-1 text-base font-normal text-white">
                        {chain.displayName || chain.name}
                      </span>
                      {chainId === chain.id && (
                        <span className="text-peach-300 text-xs">✓</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}
            </div>
          </>
        )}

        <DropdownMenuSeparator className="my-1 bg-[#5D2C28]" />
        <DropdownMenuItem
          onClick={onDisconnect}
          className="group cursor-pointer px-2 py-1.5 text-red-400 transition-colors hover:bg-[#8A4836]! hover:text-red-300!"
        >
          <div className="flex items-center gap-2">
            <LogOut className="h-4 w-4 text-red-400 transition-colors group-hover:text-red-300!" />
            <span className="text-xl font-medium uppercase">DISCONNECT</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
