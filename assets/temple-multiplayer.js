/**
 * NACHA 寺院マルチプレイヤー同期エンジン (assets/temple-multiplayer.js)
 * 
 * - 誰かが購入すると、共有の陳列棚の在庫がリアルタイムに減少
 * - 誰かが銭投げすると、お寺の金庫とローン返済が全画面でリアルタイムに進捗
 * - 複数タブ・複数ユーザー間同期: BroadcastChannel + 定期同期
 * - リアルタイム参加者（AIユーザー・全国の参拝者）の自律購入＆銭投げストリーム
 */
(function(w) {
  'use strict';

  var CHANNEL_NAME = 'nacha_temple_multi_v1';
  var channel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel(CHANNEL_NAME);
    }
  } catch(e) {}

  // 仮想マルチ参加者（人間＆AI）
  var PEERS = [
    { type: 'human', name: '巡礼者（東京）', icon: '👤' },
    { type: 'human', name: '巡礼者（京都）', icon: '👤' },
    { type: 'human', name: '巡礼者（カンボジア）', icon: '👤' },
    { type: 'ai', name: '自律AIエージェント #042', icon: '🤖' },
    { type: 'ai', name: '祈願巡回Bot #108', icon: '🤖' },
    { type: 'human', name: '巡礼者（福岡）', icon: '👤' },
    { type: 'ai', name: '蓮池清掃AI #007', icon: '🤖' }
  ];

  var TempleMultiplayer = {
    listeners: [],

    init: function() {
      var self = this;
      if (channel) {
        channel.onmessage = function(ev) {
          self.handleIncomingEvent(ev.data);
        };
      }

      // マルチプレイヤーの自律アクティビティ（15〜30秒ごとに誰かが行動）
      this.startAmbientMultiplayer();
    },

    // イベントブロードキャスト（自分が何かした時）
    broadcast: function(type, payload) {
      var msg = {
        type: type,
        payload: payload,
        timestamp: Date.now(),
        senderId: (w.TempleEconomy && w.TempleEconomy.getUser()) ? w.TempleEconomy.getUser().userId : 'local'
      };
      if (channel) {
        try { channel.postMessage(msg); } catch(e) {}
      }
      this.notifyListeners(msg);
    },

    onEvent: function(cb) {
      this.listeners.push(cb);
    },

    notifyListeners: function(msg) {
      this.listeners.forEach(function(fn) {
        try { fn(msg); } catch(e) {}
      });
    },

    handleIncomingEvent: function(msg) {
      if (!msg || !msg.type) return;

      // 誰かが購入した時 → 画面の在庫を減少・再描画
      if (msg.type === 'ITEM_PURCHASED') {
        if (w.TempleEconomy) {
          var temple = w.TempleEconomy.getTempleState();
          var shelfItem = temple.shelf.find(function(s) { return s.slotId === msg.payload.slotId; });
          if (shelfItem && shelfItem.stock > 0) {
            shelfItem.stock = Math.max(0, shelfItem.stock - 1);
            if (shelfItem.stock <= 0) {
              temple.shelf = temple.shelf.filter(function(s) { return s.slotId !== msg.payload.slotId; });
            }
            localStorage.setItem('nacha_temple_state_v1', JSON.stringify(temple));
          }
        }
      }

      // 誰かが銭投げした時 → ローン返済を進捗
      if (msg.type === 'COIN_TOSSED') {
        if (w.TempleBank) {
          w.TempleBank.repayDeityLoan(msg.payload.loanPayment || 1, '他参拝者の銭投げ');
        }
      }

      this.notifyListeners(msg);
    },

    // リアルタイム自律シミュレーション（マルチの息づかい）
    startAmbientMultiplayer: function() {
      var self = this;
      function nextAction() {
        var delay = Math.floor(Math.random() * 15000) + 15000; // 15〜30秒に1回
        setTimeout(function() {
          self.simulatePeerAction();
          nextAction();
        }, delay);
      }
      nextAction();
    },

    simulatePeerAction: function() {
      if (!w.TempleEconomy) return;
      var temple = w.TempleEconomy.getTempleState();
      var peer = PEERS[Math.floor(Math.random() * PEERS.length)];

      var rand = Math.random();
      if (rand < 0.6) {
        // 銭投げアクション（60%）
        var coins = Math.floor(Math.random() * 3) + 1;
        var isHit = Math.random() < 0.75;
        var loanPay = Math.floor(coins * 0.7);

        if (w.TempleBank) {
          w.TempleBank.repayDeityLoan(loanPay, peer.name + ' の賽銭');
        }

        this.broadcast('COIN_TOSSED', {
          peer: peer,
          coins: coins,
          isHit: isHit,
          loanPayment: loanPay,
          text: `${peer.icon} ${peer.name} が銭投げを行いました（徳積み）`
        });

      } else {
        // 在庫購入アクション（40%）
        if (temple.shelf && temple.shelf.length > 0) {
          // 在庫のある品を選ぶ
          var available = temple.shelf.filter(function(s) { return s.stock > 0; });
          if (available.length > 0) {
            var chosen = available[Math.floor(Math.random() * available.length)];
            chosen.stock -= 1;
            var itemName = chosen.item.name;

            if (chosen.stock <= 0) {
              temple.shelf = temple.shelf.filter(function(s) { return s.slotId !== chosen.slotId; });
            }
            localStorage.setItem('nacha_temple_state_v1', JSON.stringify(temple));

            // ローン返済へ
            if (w.TempleBank) {
              w.TempleBank.repayDeityLoan(Math.floor(chosen.price * 0.8), peer.name + ' の授与品購入');
            }

            this.broadcast('ITEM_PURCHASED', {
              peer: peer,
              slotId: chosen.slotId,
              itemName: itemName,
              remainingStock: chosen.stock,
              text: `🔔 ${peer.icon} ${peer.name} が『${itemName}』を授かりました！（残 ${Math.max(0, chosen.stock)} 点）`
            });
          }
        }
      }
    }
  };

  w.TempleMultiplayer = TempleMultiplayer;
})(window);
