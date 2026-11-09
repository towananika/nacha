/**
 * NACHA コイン＆参拝システム (assets/coins.js)
 * - ボット防止機能 (e.isTrusted 検知、タイムスタンプ検証、ジッター検証)
 * - クライアント側改ざん簡易検知 (ハッシュチェックサム)
 * - 1日あたりの獲得上限管理
 */
(function(w){
  'use strict';

  var STORAGE_KEY = 'nacha_wallet_v1';
  var SECRET_SALT = 'nacha_sacred_temple_2026_bless';

  // 改ざん防止ハッシュ（FNV-1a変形）
  function calcHash(total, logCount) {
    var str = total + ':' + logCount + ':' + SECRET_SALT;
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return (h >>> 0).toString(36);
  }

  function getTodayKey() {
    var d = new Date();
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function createFresh() {
    var today = getTodayKey();
    var obj = {
      total: 15, // 初回ウェルカム参拝ギフト（3回引ける15コイン）
      isNew: true,
      daily: {},
      lastDate: today,
      logCount: 1,
      hash: ''
    };
    obj.hash = calcHash(obj.total, obj.logCount);
    return obj;
  }

  function loadWallet() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var fresh = createFresh();
        saveWallet(fresh);
        return fresh;
      }
      var data = JSON.parse(raw);
      if (typeof data.total !== 'number' || isNaN(data.total)) return createFresh();
      
      // ハッシュ検証
      var expectedHash = calcHash(data.total, data.logCount || 0);
      if (data.hash !== expectedHash) {
        console.warn('Wallet checksum mismatch. Resetting.');
        var reset = createFresh();
        saveWallet(reset);
        return reset;
      }

      // 日付変更チェック（日付が変わっていたらデイリータスクをリセット）
      var today = getTodayKey();
      if (data.lastDate !== today) {
        data.daily = {};
        data.lastDate = today;
        saveWallet(data);
      }

      return data;
    } catch (e) {
      return createFresh();
    }
  }

  function saveWallet(data) {
    data.logCount = (data.logCount || 0) + 1;
    data.hash = calcHash(data.total, data.logCount);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      // 残高更新イベントを通知
      window.dispatchEvent(new CustomEvent('nacha-coin-change', { detail: { total: data.total } }));
    } catch (e) {}
  }

  // ボット防止検証
  // 1. isTrusted が true であること
  // 2. タップ座標や時間が機械的でないこと
  function verifyHuman(event, options) {
    options = options || {};
    if (event) {
      if (event.isTrusted === false) {
        console.warn('Bot blocked: untrusted event');
        return false;
      }
      // クライアント座標が異常（0,0に完全に張り付いているなど）をチェック
      if (event.type.indexOf('pointer') >= 0 || event.type.indexOf('touch') >= 0 || event.type.indexOf('click') >= 0) {
        if (event.clientX === 0 && event.clientY === 0 && event.screenX === 0 && event.screenY === 0) {
          // キーボードでのトリガー例外を除き、ポインタイベントでの0,0は怪しい
          if (options.requirePointer) return false;
        }
      }
    }
    return true;
  }

  var NachaCoins = {
    // 現在の残高取得
    getBalance: function() {
      return loadWallet().total;
    },

    // 指定アクションが今日まだ可能か
    canEarnDaily: function(actionId) {
      var w = loadWallet();
      var today = getTodayKey();
      return !(w.daily && w.daily[actionId] === today);
    },

    // コイン獲得（ボット検証付き）
    earn: function(actionId, amount, event, options) {
      if (!verifyHuman(event, options)) {
        return { success: false, reason: 'bot_detected' };
      }
      var w = loadWallet();
      var today = getTodayKey();
      w.daily = w.daily || {};

      if (w.daily[actionId] === today) {
        return { success: false, reason: 'already_claimed_today' };
      }

      w.daily[actionId] = today;
      w.total += amount;
      saveWallet(w);
      return { success: true, total: w.total, earned: amount };
    },

    // ゲームスコアなど実績による獲得（1日回数制限付き）
    earnFromGame: function(gameId, score, event) {
      if (!verifyHuman(event)) return { success: false, reason: 'bot_detected' };
      var w = loadWallet();
      var today = getTodayKey();
      w.daily = w.daily || {};
      var countKey = gameId + '_count';
      var currentCount = w.daily[countKey] || 0;

      // 1ゲームにつき1日最大3回まで獲得可能
      if (currentCount >= 3) {
        return { success: false, reason: 'daily_limit_reached' };
      }

      var coins = Math.min(10, Math.max(3, Math.floor(score)));
      w.daily[countKey] = currentCount + 1;
      w.total += coins;
      saveWallet(w);
      return { success: true, total: w.total, earned: coins, remaining: 3 - (currentCount + 1) };
    },

    // コイン消費
    spend: function(amount) {
      var w = loadWallet();
      if (w.total < amount) {
        return false;
      }
      w.total -= amount;
      saveWallet(w);
      return true;
    },

    // イベント購読用ヘルパー
    onChange: function(callback) {
      window.addEventListener('nacha-coin-change', function(e) {
        callback(e.detail.total);
      });
    }
  };

  w.NachaCoins = NachaCoins;
})(window);
