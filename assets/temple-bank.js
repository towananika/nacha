/**
 * NACHA 寺院銀行（中央銀行システム）
 * assets/temple-bank.js
 * 
 * - 通貨: コイン
 * - 使命: 物価安定（物価上昇率 +2.0% 目標）
 * - 金融政策: 政策金利、預金利息（徳金利）、賽銭還元オペ
 * - ローン権限: 【ナチャと仲間たち専売】（資材仕入れ・設備投資専用）
 * - 対象アクター: 訪問する人間ユーザー、AIユーザー、ナチャと仲間たち
 */
(function(w) {
  'use strict';

  var BANK_STORAGE_KEY = 'nacha_temple_bank_v1';
  var TARGET_INFLATION_RATE = 0.02; // 物価安定目標: +2.0%

  // 基準バスケット品目（CPI算出用）
  var BASKET_ITEMS = [
    { id: 'water', name: '霊水（お水）', basePrice: 2 },
    { id: 'suikinrei', name: '手彫り水琴鈴', basePrice: 20 },
    { id: 'amulet', name: '白檀蓮花守り', basePrice: 35 },
    { id: 'ticket', name: '開運福引之符', basePrice: 10 }
  ];

  function getTodayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function createInitialBankState() {
    return {
      name: '悠遊観音堂 寺院銀行（中央銀行）',
      established: 2026,
      targetInflation: TARGET_INFLATION_RATE, // 2.0%
      currentInflation: 0.020, // 初期現在インフレ率 (+2.00%)
      cpiIndex: 100.0,         // 基準CPI 100.0

      // 金融政策パラメータ
      policyRate: 0.015,       // 政策金利 1.5%
      depositRate: 0.018,      // 参拝者預金金利 1.8%
      tossRewardMultiplier: 1.0, // 銭投げ還元オペ倍率

      // 通貨供給・流通量
      totalCirculation: 108000, // 現在の市場流通総コイン
      reserveFund: 42000,       // 寺院銀行の準備金

      // 【ナチャと仲間たち専用】ローン枠（Deity Exclusive Loan Facility）
      deityLoan: {
        borrower: 'ナチャと四柱の仲間たち（寺院工房）',
        totalBorrowed: 100000, // 総借入（工房設備・最高級白檀資材）
        paidBack: 14200,       // 返済済み
        interestRate: 0.012,   // 寺院特別超低金利 (1.2%)
        status: 'REPAYING',    // 返済中
        history: [
          { date: '2026-10-01', type: 'BORROW', amount: 100000, note: '工房開設・白檀原木仕入れ' },
          { date: '2026-11-01', type: 'PAYBACK', amount: 14200, note: '十月度お賽銭・授与品売上充当' }
        ]
      },

      // 銀行預金台帳
      accounts: {
        // 人間ユーザー預金総額
        pilgrimDeposits: 5800,
        // AIユーザー運用口座
        aiAgentDeposits: 3200
      },

      // 価格ログ（過去7回のCPI）
      cpiHistory: [
        { date: '2026-05', cpi: 98.2, inflation: 0.018 },
        { date: '2026-07', cpi: 98.9, inflation: 0.019 },
        { date: '2026-09', cpi: 99.4, inflation: 0.020 },
        { date: '2026-11', cpi: 100.0, inflation: 0.020 }
      ],

      lastPolicyReviewDate: getTodayStr()
    };
  }

  function loadBank() {
    try {
      var raw = localStorage.getItem(BANK_STORAGE_KEY);
      if (!raw) {
        var s = createInitialBankState();
        saveBank(s);
        return s;
      }
      return JSON.parse(raw);
    } catch(e) {
      return createInitialBankState();
    }
  }

  function saveBank(s) {
    try {
      localStorage.setItem(BANK_STORAGE_KEY, JSON.stringify(s));
      window.dispatchEvent(new CustomEvent('nacha-bank-update', { detail: s }));
    } catch(e) {}
  }

  // ==========================================
  // 寺院銀行 コア機能
  // ==========================================
  var TempleBank = {
    // 状態取得
    getState: function() {
      return loadBank();
    },

    // ── 物価指数（CPI）の計測と2%安定化政策 ──
    // 現在の授与品実勢価格から物価上昇率を再計算し、2%から乖離した場合は金利を自動調節
    rebalanceMonetaryPolicy: function(currentMarketPrices) {
      var bank = loadBank();
      currentMarketPrices = currentMarketPrices || {};

      var totalWeight = 0;
      var weightedSum = 0;
      BASKET_ITEMS.forEach(function(item) {
        var p = currentMarketPrices[item.id] || item.basePrice;
        var ratio = p / item.basePrice;
        weightedSum += ratio;
        totalWeight++;
      });

      var newCpi = (weightedSum / totalWeight) * 100.0;
      var inflationRate = (newCpi - 100.0) / 100.0 + TARGET_INFLATION_RATE;

      bank.cpiIndex = parseFloat(newCpi.toFixed(2));
      bank.currentInflation = parseFloat(inflationRate.toFixed(4));

      // 【2%目標フィードバック制御】
      var gap = bank.currentInflation - TARGET_INFLATION_RATE; // 目標との差分

      if (gap > 0.005) {
        // 物価が上がりすぎ（インフレ懸念） → 預金金利を引き上げ、市場のコインを回収
        bank.depositRate = Math.min(0.045, bank.depositRate + 0.002);
        bank.tossRewardMultiplier = 0.9; // 銭投げボーナスをやや引き締め
      } else if (gap < -0.005) {
        // 物価が下がりすぎ（デフレ懸念） → 金利を引き下げ、銭投げ還元を増やして消費刺激
        bank.depositRate = Math.max(0.005, bank.depositRate - 0.002);
        bank.tossRewardMultiplier = 1.2; // 銭投げ命中ボーナスを増額
      } else {
        // 2%目標圏内（安寧状態）
        bank.depositRate = 0.018;
        bank.tossRewardMultiplier = 1.0;
      }

      saveBank(bank);
      return {
        cpi: bank.cpiIndex,
        inflationRate: bank.currentInflation,
        target: TARGET_INFLATION_RATE,
        depositRate: bank.depositRate,
        status: Math.abs(gap) <= 0.005 ? 'STABLE' : (gap > 0 ? 'OVERHEAT' : 'COOL')
      };
    },

    // ── 【ナチャと仲間たち専売】ローンシステム ──
    // ナチャ工房だけが借入可能。一般・AIは利用不可！
    getDeityLoanStatus: function() {
      var bank = loadBank();
      var l = bank.deityLoan;
      return {
        borrower: l.borrower,
        totalBorrowed: l.totalBorrowed,
        paidBack: l.paidBack,
        remainingBalance: Math.max(0, l.totalBorrowed - l.paidBack),
        progressPercent: parseFloat(((l.paidBack / l.totalBorrowed) * 100).toFixed(1)),
        interestRate: l.interestRate,
        history: l.history
      };
    },

    // ナチャ工房が資材費を借入する（専売API）
    borrowDeityLoan: function(callerIdentity, amount, purpose) {
      if (callerIdentity !== 'nacha_and_friends') {
        return { success: false, reason: 'unauthorized', message: 'ローンはナチャと仲間たち工房のみ利用可能です。' };
      }
      var bank = loadBank();
      amount = parseInt(amount, 10);
      if (isNaN(amount) || amount <= 0) return { success: false, reason: 'invalid_amount' };

      bank.deityLoan.totalBorrowed += amount;
      bank.deityLoan.history.unshift({
        date: getTodayStr(),
        type: 'BORROW',
        amount: amount,
        note: purpose || '新資材仕入れ'
      });
      saveBank(bank);
      return { success: true, totalBorrowed: bank.deityLoan.totalBorrowed };
    },

    // 賽銭・授与所売上からローンを返済
    repayDeityLoan: function(amount, sourceNote) {
      var bank = loadBank();
      amount = parseInt(amount, 10);
      if (isNaN(amount) || amount <= 0) return { success: false, reason: 'invalid_amount' };

      var l = bank.deityLoan;
      var remaining = l.totalBorrowed - l.paidBack;
      var actualRepay = Math.min(remaining, amount);

      l.paidBack += actualRepay;
      bank.reserveFund += actualRepay; // 銀行の準備金へ蓄積
      l.history.unshift({
        date: getTodayStr(),
        type: 'PAYBACK',
        amount: actualRepay,
        note: sourceNote || '参拝者賽銭・売上充当'
      });

      saveBank(bank);
      return {
        success: true,
        actualRepay: actualRepay,
        remainingBalance: l.totalBorrowed - l.paidBack,
        progressPercent: parseFloat(((l.paidBack / l.totalBorrowed) * 100).toFixed(1))
      };
    },

    // ── ユーザー・AI預金口座 ──
    depositCoins: function(userType, amount) {
      amount = parseInt(amount, 10);
      if (isNaN(amount) || amount <= 0) return { success: false, reason: 'invalid_amount' };

      var bank = loadBank();
      if (userType === 'ai') {
        bank.accounts.aiAgentDeposits += amount;
      } else {
        bank.accounts.pilgrimDeposits += amount;
      }
      // 流通量を吸収
      bank.totalCirculation -= amount;
      saveBank(bank);
      return { success: true, depositRate: bank.depositRate };
    }
  };

  w.TempleBank = TempleBank;
})(window);
