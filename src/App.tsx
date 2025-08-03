import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  TrendingDown,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

interface GameResult {
  type: "win" | "loss" | "insufficient";
  amount?: number;
  multiplier?: number;
  symbol?: string;
  message?: string;
}

interface HistoryEntry {
  bet: number;
  result: "win" | "loss";
  amount: number;
  balance: number;
  manipulation: string;
}

interface WinCheck {
  win: boolean;
  multiplier: number;
  symbol?: string;
  type: "jackpot" | "small_win" | "loss";
}

interface AlgorithmResult {
  reels: string[][];
  manipulation: string;
}

const SlotMachineSimulator: React.FC = () => {
  const [balance, setBalance] = useState<number>(100000);
  const [bet, setBet] = useState<number>(1000);
  const [totalBets, setTotalBets] = useState<number>(0);
  const [totalWins, setTotalWins] = useState<number>(0);
  const [totalLosses, setTotalLosses] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<GameResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Slot symbols
  const symbols: string[] = ["🍒", "🍋", "🍊", "🍇", "🔔", "💎", "7️⃣", "⭐"];
  const [reels, setReels] = useState<string[][]>([
    ["🍒", "🍋", "🍊"],
    ["🍇", "🔔", "💎"],
    ["7️⃣", "⭐", "🍒"],
  ]);
  // const [finalReels, setFinalReels] = useState<string[][]>([
  //   ['🍒', '🍋', '🍊'],
  //   ['🍇', '🔔', '💎'],
  //   ['7️⃣', '⭐', '🍒']
  // ]);

  // Algoritma Manipulasi Settings
  const [houseEdge, setHouseEdge] = useState<number>(15);
  const [falseHope, setFalseHope] = useState<number>(30);
  const [bigLossProtection, setBigLossProtection] = useState<number>(80);
  const [nearMissRate, setNearMissRate] = useState<number>(25);
  const [showAlgorithm, setShowAlgorithm] = useState<boolean>(false);

  // Psychological manipulation
  const [nearMissCount, setNearMissCount] = useState<number>(0);
  const [winStreak, setWinStreak] = useState<number>(0);
  const [lossStreak, setLossStreak] = useState<number>(0);
  const [lastManipulation, setLastManipulation] = useState<string>("");

  const spinIntervalRef = useRef<number | null>(null);
  const autoPlayRef = useRef<number | null>(null);

  const resetGame = (): void => {
    setBalance(100000);
    setTotalBets(0);
    setTotalWins(0);
    setTotalLosses(0);
    setCurrentResult(null);
    setHistory([]);
    setNearMissCount(0);
    setWinStreak(0);
    setLossStreak(0);
    setAutoPlay(false);
    setIsSpinning(false);
    setLastManipulation("");
  };

  const getRandomSymbol = (): string =>
    symbols[Math.floor(Math.random() * symbols.length)];

  const generateRandomReel = (): string[] => [
    getRandomSymbol(),
    getRandomSymbol(),
    getRandomSymbol(),
  ];

  const checkWin = (reels: string[][]): WinCheck => {
    const middleRow: string[] = [reels[0][1], reels[1][1], reels[2][1]];

    // Check for exact matches
    if (middleRow[0] === middleRow[1] && middleRow[1] === middleRow[2]) {
      const symbol = middleRow[0];
      const multipliers: { [key: string]: number } = {
        "💎": 10,
        "7️⃣": 8,
        "⭐": 6,
        "🔔": 4,
        "🍇": 3,
        "🍊": 2.5,
        "🍋": 2,
        "🍒": 1.5,
      };
      return {
        win: true,
        multiplier: multipliers[symbol] || 2,
        symbol,
        type: "jackpot",
      };
    }

    // Check for two matches
    if (
      middleRow[0] === middleRow[1] ||
      middleRow[1] === middleRow[2] ||
      middleRow[0] === middleRow[2]
    ) {
      return { win: true, multiplier: 1.2, type: "small_win" };
    }

    return { win: false, multiplier: 0, type: "loss" };
  };

  const createNearMiss = (): string[][] => {
    const targetSymbol = symbols[Math.floor(Math.random() * symbols.length)];
    return [
      [getRandomSymbol(), targetSymbol, getRandomSymbol()],
      [getRandomSymbol(), targetSymbol, getRandomSymbol()],
      [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()], // Third reel different
    ];
  };

  const manipulatedSlotAlgorithm = (): AlgorithmResult => {
    const random = Math.random() * 100;
    const baseWinChance = 50 - houseEdge;

    // Algoritma 1: False Hope - beri kemenangan saat hampir bangkrut
    if (balance < bet * 3 && Math.random() * 100 < falseHope) {
      const winningSymbol = symbols[Math.floor(Math.random() * 4) + 4]; // Better symbols
      const winReels: string[][] = [
        [getRandomSymbol(), winningSymbol, getRandomSymbol()],
        [getRandomSymbol(), winningSymbol, getRandomSymbol()],
        [getRandomSymbol(), winningSymbol, getRandomSymbol()],
      ];
      return { reels: winReels, manipulation: "False Hope Activated! 🎁" };
    }

    // Algoritma 2: Big Loss Protection - cegah kemenangan besar
    // Algoritma 2: Big Loss Protection - cegah kemenangan besar
    if (winStreak >= 2 && Math.random() * 100 < bigLossProtection) {
      let lossReels: string[][] = [
        generateRandomReel(),
        generateRandomReel(),
        generateRandomReel(),
      ];

      // Ensure it's a loss
      while (checkWin(lossReels).win) {
        // Acak ulang KETIGA reel untuk menghindari infinite loop
        lossReels = [
          generateRandomReel(),
          generateRandomReel(),
          generateRandomReel(),
        ];
      }
      return { reels: lossReels, manipulation: "Big Win Prevention! 🚫" };
    }

    // Algoritma 3: Near Miss untuk menciptakan kecanduan
    if (random > baseWinChance && random < baseWinChance + nearMissRate) {
      setNearMissCount((prev) => prev + 1);
      return {
        reels: createNearMiss(),
        manipulation: "Near Miss Psychology! 😤",
      };
    }

    // Algoritma 4: Normal win (rare)
    if (random < baseWinChance) {
      const winSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const winReels: string[][] = [
        [getRandomSymbol(), winSymbol, getRandomSymbol()],
        [getRandomSymbol(), winSymbol, getRandomSymbol()],
        [getRandomSymbol(), winSymbol, getRandomSymbol()],
      ];
      return { reels: winReels, manipulation: "Lucky Win! 🍀" };
    } else {
      // Normal loss
      const lossReels: string[][] = [
        generateRandomReel(),
        generateRandomReel(),
        generateRandomReel(),
      ];
      while (checkWin(lossReels).win) {
        // Acak ulang KETIGA reel agar bisa keluar dari kondisi menang
        lossReels[0] = generateRandomReel();
        lossReels[1] = generateRandomReel();
        lossReels[2] = generateRandomReel();
      }
      return { reels: lossReels, manipulation: "House Edge! 🏠" };
    }
  };

  const animateReels = (): void => {
    let iterations = 0;
    const maxIterations = 20;

    spinIntervalRef.current = setInterval(() => {
      setReels([
        generateRandomReel(),
        generateRandomReel(),
        generateRandomReel(),
      ]);
      iterations++;

      if (iterations >= maxIterations) {
        if (spinIntervalRef.current) {
          clearInterval(spinIntervalRef.current);
        }

        // Apply manipulation algorithm
        const { reels: finalReels, manipulation } = manipulatedSlotAlgorithm();
        // setFinalReels(finalReels);
        setReels(finalReels);
        setLastManipulation(manipulation);

        // Calculate result
        const result = checkWin(finalReels);
        let newBalance = balance - bet;

        if (result.win) {
          const winAmount = bet * result.multiplier;
          newBalance += winAmount;
          setTotalWins((prev) => prev + 1);
          setWinStreak((prev) => prev + 1);
          setLossStreak(0);
          setCurrentResult({
            type: "win",
            amount: winAmount,
            multiplier: result.multiplier,
            symbol: result.symbol,
          });
        } else {
          setTotalLosses((prev) => prev + 1);
          setLossStreak((prev) => prev + 1);
          setWinStreak(0);
          setCurrentResult({ type: "loss", amount: bet });
        }

        setBalance(newBalance);
        setTotalBets((prev) => prev + 1);
        setIsSpinning(false);

        // Add to history
        setHistory((prev) => [
          ...prev.slice(-9),
          {
            bet,
            result: result.win ? "win" : "loss",
            amount: result.win ? bet * result.multiplier : bet,
            balance: newBalance,
            manipulation,
          },
        ]);
      }
    }, 100);
  };

  const spin = (): void => {
    console.log("spin");
    if (balance < bet || isSpinning) return;

    setIsSpinning(true);
    setCurrentResult(null);
    animateReels();

    console.log("spin finish ");
  };

  const toggleAutoPlay = (): void => {
    if (autoPlay) {
      setAutoPlay(false);
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    } else {
      setAutoPlay(true);
    }
  };

  useEffect(() => {
    if (autoPlay && !isSpinning && balance >= bet) {
      autoPlayRef.current = setTimeout(() => {
        spin();
      }, 1500);
    } else if (balance < bet) {
      setAutoPlay(false);
    }

    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [autoPlay, isSpinning, balance, bet]);

  const winRate =
    totalBets > 0 ? ((totalWins / totalBets) * 100).toFixed(1) : "0";
  const profitLoss = balance - 100000;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-red-900 to-pink-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            🎰 MESIN SLOT ONLINE SIMULATOR
          </h1>
          <p className="text-yellow-300 text-xl">
            Lihat bagaimana algoritma slot dimanipulasi untuk merugikan pemain!
          </p>
          <div className="mt-4 p-4 bg-red-600/20 border border-red-500 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-red-300">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold">
                PERINGATAN: Ini adalah simulasi edukasi. Judi online adalah
                ILEGAL di Indonesia!
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Slot Machine */}
          <div className="xl:col-span-3">
            <div className="bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-2xl p-8 border-4 border-yellow-400 shadow-2xl">
              {/* Balance Display */}
              <div className="text-center mb-6">
                <div className="bg-black rounded-lg p-4 mb-4">
                  <div className="text-5xl font-bold text-green-400 mb-2">
                    💰 Rp {balance.toLocaleString("id-ID")}
                  </div>
                  <div
                    className={`text-2xl font-semibold ${
                      profitLoss >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {profitLoss >= 0 ? "📈 +" : "📉 "}Rp{" "}
                    {Math.abs(profitLoss).toLocaleString("id-ID")}
                  </div>
                </div>
              </div>

              {/* Slot Machine Reels */}
              <div className="bg-black rounded-xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {reels.map((reel, reelIndex) => (
                    <div
                      key={reelIndex}
                      className="bg-white rounded-lg border-4 border-gray-300"
                    >
                      {reel.map((symbol, symbolIndex) => (
                        <div
                          key={symbolIndex}
                          className={`text-6xl text-center py-4 border-b-2 border-gray-200 last:border-b-0 ${
                            symbolIndex === 1 ? "bg-yellow-100" : "bg-gray-50"
                          } ${isSpinning ? "animate-pulse" : ""}`}
                        >
                          {symbol}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Payline indicator */}
                <div className="text-center text-yellow-400 font-bold text-lg mb-4">
                  ← PAYLINE →
                </div>

                {/* Current Result */}
                <div className="h-20 flex items-center justify-center">
                  {currentResult && (
                    <div className="text-center">
                      {currentResult.type === "win" && (
                        <div className="text-green-400 animate-bounce">
                          <div className="text-4xl font-bold">
                            🎉 JACKPOT! 🎉
                          </div>
                          <div className="text-2xl">
                            +Rp {currentResult.amount?.toLocaleString("id-ID")}
                          </div>
                          <div className="text-lg">
                            ({currentResult.multiplier}x multiplier)
                          </div>
                        </div>
                      )}
                      {currentResult.type === "loss" && (
                        <div className="text-red-400">
                          <div className="text-4xl font-bold">
                            💸 TRY AGAIN!
                          </div>
                          <div className="text-xl">
                            -Rp {currentResult.amount?.toLocaleString("id-ID")}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {lastManipulation && (
                    <div className="text-orange-300 text-sm mt-2">
                      🤖 {lastManipulation}
                    </div>
                  )}
                </div>
              </div>

              {/* Bet Controls */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <button
                  onClick={() => setBet(Math.max(1000, bet - 1000))}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold text-xl"
                >
                  -1K
                </button>
                <div className="text-center bg-black rounded-lg px-6 py-3">
                  <div className="text-yellow-400 text-sm font-semibold">
                    BET AMOUNT
                  </div>
                  <div className="text-3xl font-bold text-white">
                    Rp {bet.toLocaleString("id-ID")}
                  </div>
                </div>
                <button
                  onClick={() => setBet(Math.min(balance, bet + 1000))}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-xl"
                >
                  +1K
                </button>
              </div>

              {/* Game Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={spin}
                  disabled={balance < bet || isSpinning}
                  className={`${
                    isSpinning ? "animate-spin" : ""
                  } bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:opacity-50 text-white px-12 py-4 rounded-xl font-bold text-2xl flex items-center gap-3 shadow-lg`}
                >
                  <Play className="w-6 h-6" />
                  {isSpinning ? "SPINNING..." : "SPIN!"}
                </button>
                <button
                  onClick={toggleAutoPlay}
                  disabled={balance < bet}
                  className={`${
                    autoPlay
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  } disabled:opacity-50 text-white px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-2`}
                >
                  {autoPlay ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                  {autoPlay ? "STOP AUTO" : "AUTO PLAY"}
                </button>
                <button
                  onClick={resetGame}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-4 rounded-xl font-bold text-xl flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  RESET
                </button>
              </div>

              {/* Paytable */}
              <div className="mt-6 bg-black/50 rounded-lg p-4">
                <h4 className="text-yellow-400 font-bold mb-3 text-center">
                  💰 PAYTABLE
                </h4>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div className="text-center text-white">💎💎💎 = 10x</div>
                  <div className="text-center text-white">7️⃣7️⃣7️⃣ = 8x</div>
                  <div className="text-center text-white">⭐⭐⭐ = 6x</div>
                  <div className="text-center text-white">🔔🔔🔔 = 4x</div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Statistics */}
            <div className="bg-black/40 backdrop-blur-sm border border-blue-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" />
                STATISTIK
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Spins:</span>
                  <span className="text-white font-semibold">{totalBets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Wins:</span>
                  <span className="text-green-400 font-semibold">
                    {totalWins}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Losses:</span>
                  <span className="text-red-400 font-semibold">
                    {totalLosses}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Win Rate:</span>
                  <span className="text-yellow-400 font-semibold">
                    {winRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Near Misses:</span>
                  <span className="text-orange-400 font-semibold">
                    {nearMissCount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Win Streak:</span>
                  <span className="text-green-400 font-semibold">
                    {winStreak}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Loss Streak:</span>
                  <span className="text-red-400 font-semibold">
                    {lossStreak}
                  </span>
                </div>
              </div>
            </div>

            {/* Algorithm Settings */}
            <div className="bg-black/40 backdrop-blur-sm border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-red-400 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  ALGORITMA
                </h3>
                <button
                  onClick={() => setShowAlgorithm(!showAlgorithm)}
                  className="text-gray-400 hover:text-white"
                >
                  {showAlgorithm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>

              {showAlgorithm && (
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="block text-gray-300 mb-2">
                      House Edge: {houseEdge}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      value={houseEdge}
                      onChange={(e) => setHouseEdge(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">
                      False Hope: {falseHope}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={falseHope}
                      onChange={(e) => setFalseHope(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">
                      Big Loss Protection: {bigLossProtection}%
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="95"
                      value={bigLossProtection}
                      onChange={(e) =>
                        setBigLossProtection(parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2">
                      Near Miss Rate: {nearMissRate}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      value={nearMissRate}
                      onChange={(e) =>
                        setNearMissRate(parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Recent History */}
            <div className="bg-black/40 backdrop-blur-sm border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-400 mb-4">HISTORY</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history
                  .slice(-8)
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-xs p-2 bg-white/5 rounded"
                    >
                      <span
                        className={`font-semibold ${
                          entry.result === "win"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {entry.result === "win" ? "✅ WIN" : "❌ LOSS"}
                      </span>
                      <span className="text-gray-300">
                        {entry.result === "win" ? "+" : "-"}Rp{" "}
                        {entry.amount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testing Evidence Panel */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bukti Settingan */}
          <div className="p-6 bg-red-600/20 border border-red-500 rounded-xl">
            <h3 className="text-2xl font-bold text-red-400 mb-4">
              🔍 BUKTI BAHWA INI "SETTINGAN":
            </h3>
            <div className="space-y-4 text-white text-sm">
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-400 mb-2">
                  1. 📊 STATISTIK MATEMATIS
                </h4>
                <p>
                  • Win Rate aktual:{" "}
                  <span className="text-red-400 font-bold">{winRate}%</span>{" "}
                  (Seharusnya ~50% jika fair)
                </p>
                <p>
                  • Total kerugian:{" "}
                  <span className="text-red-400 font-bold">
                    Rp{" "}
                    {Math.abs(Math.min(0, profitLoss)).toLocaleString("id-ID")}
                  </span>
                </p>
                <p>
                  • Near Miss:{" "}
                  <span className="text-orange-400 font-bold">
                    {nearMissCount} kali
                  </span>{" "}
                  (Tidak natural!)
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-400 mb-2">
                  2. 🤖 ALGORITMA TRANSPARAN
                </h4>
                <p>• Buka panel "ALGORITMA" → Lihat slider manipulation</p>
                <p>• Ubah House Edge dari 15% ke 5% → Win rate naik</p>
                <p>• Ubah ke 25% → Win rate turun drastis</p>
                <p>
                  •{" "}
                  <span className="text-red-400 font-bold">
                    INI BUKTI LANGSUNG!
                  </span>
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-bold text-yellow-400 mb-2">
                  3. 🎯 PATTERN RECOGNITION
                </h4>
                <p>
                  • Perhatikan: Saat saldo kurang dari Rp 5,000 → Tiba-tiba
                  menang
                </p>
                <p>• Saat win streak 3x → Langsung kalah beruntun</p>
                <p>• Near miss muncul 25% lebih sering dari normal</p>
              </div>
            </div>
          </div>

          {/* Cara Testing */}
          <div className="p-6 bg-blue-600/20 border border-blue-500 rounded-xl">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">
              🧪 CARA MENGUJI SETTINGAN:
            </h3>
            <div className="space-y-4 text-white text-sm">
              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-bold text-green-400 mb-2">
                  TEST 1: House Edge
                </h4>
                <p className="mb-2">
                  📝 <strong>Langkah:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Set House Edge = 5%, spin 50x</li>
                  <li>Catat win rate → Reset game</li>
                  <li>Set House Edge = 25%, spin 50x</li>
                  <li>Bandingkan win rate</li>
                </ol>
                <p className="mt-2 text-yellow-300">
                  ✅ <strong>Expected:</strong> Win rate berbeda signifikan
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-bold text-green-400 mb-2">
                  TEST 2: False Hope
                </h4>
                <p className="mb-2">
                  📝 <strong>Langkah:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Biarkan saldo hampir habis (kurang dari Rp 3,000)</li>
                  <li>Set False Hope = 50%</li>
                  <li>Spin beberapa kali</li>
                  <li>Perhatikan: Tiba-tiba menang!</li>
                </ol>
                <p className="mt-2 text-yellow-300">
                  ✅ <strong>Expected:</strong> Win "ajaib" saat hampir bangkrut
                </p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <h4 className="font-bold text-green-400 mb-2">
                  TEST 3: Win Prevention
                </h4>
                <p className="mb-2">
                  📝 <strong>Langkah:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1 ml-4">
                  <li>Dapatkan win streak 2-3x</li>
                  <li>Set Big Loss Protection = 90%</li>
                  <li>Spin lagi → Pasti kalah!</li>
                  <li>Turunkan ke 50% → Win chance naik</li>
                </ol>
                <p className="mt-2 text-yellow-300">
                  ✅ <strong>Expected:</strong> Algoritma cegah big win
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Footer */}
        <div className="mt-6 p-6 bg-yellow-600/20 border border-yellow-500 rounded-xl">
          <h3 className="text-2xl font-bold text-yellow-400 mb-4">
            🧠 MANIPULASI MESIN SLOT:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white text-sm">
            <div>
              <h4 className="font-bold text-red-400 mb-2">🏠 House Edge</h4>
              <p>
                Mesin diprogram agar bandar selalu untung jangka panjang. RTP
                (Return to Player) selalu lebih rendah dari 100%.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-yellow-400 mb-2">🎁 False Hope</h4>
              <p>
                Algoritma memberikan kemenangan palsu saat saldo hampir habis
                untuk membuat pemain deposit lagi.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-blue-400 mb-2">😤 Near Miss</h4>
              <p>
                Sistem sengaja menampilkan "hampir jackpot" untuk memicu
                dopamine dan membuat pemain terus bermain.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-green-400 mb-2">
                🚫 Win Prevention
              </h4>
              <p>
                Saat pemain mulai beruntung, algoritma menurunkan peluang menang
                untuk mencegah kerugian besar bandar.
              </p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-red-500/20 rounded-lg">
            <p className="text-center text-red-300 font-bold">
              ⚠️ INGAT: Semua mesin slot online menggunakan RNG (Random Number
              Generator) yang sudah dimanipulasi! Tidak ada skill atau strategi
              yang bisa mengalahkan algoritma ini!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotMachineSimulator;
