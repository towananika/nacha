/**
 * NACHA 悠遊観音堂 寺院経済・クラフト・ローン・インベントリ統合システム
 * assets/temple-economy.js
 */
(function(w) {
  'use strict';

  var USER_KEY = 'nacha_user_economy_v1';
  var TEMPLE_KEY = 'nacha_temple_state_v1';
  var AUTH_KEY = 'nacha-auth';

  // 1日あたりの制作上限マスタ
  var ITEM_CATALOG = {
    'suikinrei': {
      id: 'suikinrei',
      name: '手彫り水琴鈴',
      icon: '🔔',
      creator: 'ナチャ',
      desc: 'シャラン…と清らかな音色。魔を払い心を澄ます。',
      costToMake: 5,     // 制作資材費
      retailPrice: 20,   // 授与価格（コイン）
      matureDays: 30,    // 熟成・祈祷期間（30日）
      dailyLimit: 3      // 1日の制作上限
    },
    'lotus_amulet': {
      id: 'lotus_amulet',
      name: '白檀蓮花守り',
      icon: '🪷',
      creator: '白衣観音',
      desc: '天然白檀を丁寧に削り出し、慈悲の祈りを込めた霊符。',
      costToMake: 10,
      retailPrice: 35,
      matureDays: 30,
      dailyLimit: 2
    },
    'flame_talisman': {
      id: 'flame_talisman',
      name: '不動火焔木札',
      icon: '🔥',
      creator: '不動明王',
      desc: '護摩の炎で燻し清められた剛毅な厄除け木札。',
      costToMake: 8,
      retailPrice: 28,
      matureDays: 21,
      dailyLimit: 3
    },
    'crane_gourd': {
      id: 'crane_gourd',
      name: '延寿瓢箪根付',
      icon: '🍶',
      creator: '南極老人',
      desc: '無病息災・長寿を祈念して乾燥漆塗りされた瓢箪。',
      costToMake: 6,
      retailPrice: 22,
      matureDays: 28,
      dailyLimit: 4
    },
    'fukubiki_ticket': {
      id: 'fukubiki_ticket',
      name: '開運福引之符',
      icon: '🎟️',
      creator: '四柱合同',
      desc: 'ガラポン福引所でガラガラ回せる特別な縁起札。',
      costToMake: 2,
      retailPrice: 10,
      matureDays: 7,
      dailyLimit: 10
    }
  };

  function getTodayStr() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // ── お寺の聖樹エリアマスタ ──
  var FORESTS = [
    {
      id: 'backyard',
      name: '境内・裏庭の木立',
      distance: '近場（歩いてすぐ）',
      icon: '🏡',
      treesCount: 3,         // 植えられている木の本数
      tripDurationMs: 15000, // 持ってくるのに15秒
      branchRatePerMin: 1.2, // 1分あたり1.2本
      maxAccumulate: 15,     // 近くはすぐ拾うので上限控えめ
      woodType: '境内の小枝'
    },
    {
      id: 'ancient_path',
      name: '参道古道・白檀林',
      distance: '中距離（山道散策）',
      icon: '🌲',
      treesCount: 5,
      tripDurationMs: 60000, // 持ってくるのに1分
      branchRatePerMin: 3.5, // 1分あたり3.5本
      maxAccumulate: 50,     // 中程度に溜まる
      woodType: '上質な白檀枝'
    },
    {
      id: 'sacred_summit',
      name: '奥山・霊峰の神木林',
      distance: '遠方（険しい霊山奥地）',
      icon: '🏔️',
      treesCount: 8,
      tripDurationMs: 180000, // 遠いので持ってくるのに3分かかる！
      branchRatePerMin: 8.0,  // 人が来ないためドッサリ大量に枝が溜まりやすい！
      maxAccumulate: 150,     // 非常に溜まりやすい！
      woodType: '霊峰の神木霊枝'
    }
  ];

  // --- お寺全体の初期状態 ---
  function createFreshTemple() {
    var now = Date.now();
    var day = 86400000;
    return {
      loanTotal: 100000,    // ナチャたちの工房・資材ローン総額 (100,000コイン)
      loanPaid: 12400,      // これまでの返済累計
      templeVault: 320,     // 現在の金庫（賽銭・売上）
      totalOfferingsReceived: 12400,
      lastResetDate: getTodayStr(),
      dailyCraftCounts: {}, // 今日のアイテム別制作数

      // お寺の聖樹・枝溜まり状態
      forestState: {
        lastHarvest: {
          backyard: now - 300000,     // 5分前
          ancient_path: now - 900000, // 15分前
          sacred_summit: now - 3600000 // 1時間前（遠いので枝が山盛りに溜まっている！）
        },
        activeDispatches: {} // 進行中の遠征 { forestId: { startedAt, finishAt, branchesPicked } }
      },

      // 授与所の陳列棚（最大6スロット）
      // 初期状態として、1ヶ月前に制作され熟成完了した希少な手作り品が少数並んでいる
      shelf: [
        {
          slotId: 1,
          item: {
            id: 'item_init_01',
            catalogId: 'suikinrei',
            name: '手彫り水琴鈴 · 壱之型',
            icon: '🔔',
            creator: 'ナチャ',
            serialNo: '#0007',
            craftedAt: now - 35 * day,
            maturedAt: now - 5 * day,
            quality: '特選・熟成満願'
          },
          stock: 2,
          price: 20
        },
        {
          slotId: 2,
          item: {
            id: 'item_init_02',
            catalogId: 'lotus_amulet',
            name: '白檀蓮花守り · 初陣',
            icon: '🪷',
            creator: '白衣観音',
            serialNo: '#0003',
            craftedAt: now - 40 * day,
            maturedAt: now - 10 * day,
            quality: '極上・三十日祈祷'
          },
          stock: 1,
          price: 35
        },
        {
          slotId: 3,
          item: {
            id: 'item_init_03',
            catalogId: 'fukubiki_ticket',
            name: '開運福引之符',
            icon: '🎟️',
            creator: '四柱合同',
            serialNo: '#0108',
            craftedAt: now - 10 * day,
            maturedAt: now - 3 * day,
            quality: '吉兆'
          },
          stock: 5,
          price: 10
        }
      ],

      // 熟成・祈祷中工房キュー
      workshopQueue: [
        {
          craftId: 'craft_demo_01',
          catalogId: 'suikinrei',
          name: '手彫り水琴鈴',
          icon: '🔔',
          creator: 'ナチャ',
          serialNo: '#0012',
          craftedAt: now - 20 * day, // 20日前に制作（あと10日で完成）
          matureDaysRequired: 30,
          readyAt: now + 10 * day
        },
        {
          craftId: 'craft_demo_02',
          catalogId: 'flame_talisman',
          name: '不動火焔木札',
          icon: '🔥',
          creator: '不動明王',
          serialNo: '#0015',
          craftedAt: now - 15 * day, // 15日前に制作（あと6日で完成）
          matureDaysRequired: 21,
          readyAt: now + 6 * day
        }
      ]
    };
  }

  function loadTemple() {
    try {
      var raw = localStorage.getItem(TEMPLE_KEY);
      if (!raw) {
        var t = createFreshTemple();
        saveTemple(t);
        return t;
      }
      var t = JSON.parse(raw);
      // 日付変更チェック
      var today = getTodayStr();
      if (t.lastResetDate !== today) {
        t.dailyCraftCounts = {};
        t.lastResetDate = today;
        saveTemple(t);
      }
      return t;
    } catch(e) {
      return createFreshTemple();
    }
  }

  function saveTemple(t) {
    try {
      localStorage.setItem(TEMPLE_KEY, JSON.stringify(t));
      window.dispatchEvent(new CustomEvent('nacha-temple-change', { detail: t }));
    } catch(e) {}
  }

  // --- ユーザーインベントリの初期状態 ---
  function getAuthUser() {
    try {
      var raw = localStorage.getItem(AUTH_KEY);
      if (raw) {
        var a = JSON.parse(raw);
        if (a && a.user) return a.user;
      }
    } catch(e) {}
    return null;
  }

  function createFreshUser() {
    var auth = getAuthUser();
    return {
      userId: auth ? auth.id : 'guest_' + Math.random().toString(36).slice(2, 8),
      username: auth ? (auth.email || auth.id) : '参拝者（巡礼）',
      isLoggedIn: !!auth,
      coins: 30,       // 初期所持コイン
      toku: 10,        // 徳ポイント（善行・お賽銭・参拝で蓄積）
      inventory: [
        {
          id: 'inv_init_01',
          name: '巡礼のはじまり守り',
          icon: '🧧',
          quality: '謹製',
          obtainedAt: Date.now(),
          desc: '初めて観音堂を訪れた記念に授かった小さなお守り。'
        }
      ],
      stats: {
        tossCount: 0,
        tossHits: 0,
        totalTossedCoins: 0,
        purchases: 0
      }
    };
  }

  function loadUser() {
    try {
      var raw = localStorage.getItem(USER_KEY);
      if (!raw) {
        var u = createFreshUser();
        saveUser(u);
        return u;
      }
      var u = JSON.parse(raw);
      // ログイン状態同期
      var auth = getAuthUser();
      if (auth && !u.isLoggedIn) {
        u.isLoggedIn = true;
        u.userId = auth.id;
        u.username = auth.email || auth.id;
        saveUser(u);
      }
      return u;
    } catch(e) {
      return createFreshUser();
    }
  }

  function saveUser(u) {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      window.dispatchEvent(new CustomEvent('nacha-user-economy-change', { detail: u }));
    } catch(e) {}
  }

  // ==========================================
  // 公開 API (TempleEconomy)
  // ==========================================
  var TempleEconomy = {
    CATALOG: ITEM_CATALOG,

    // --- ユーザーアカウント & インベントリ ---
    getUser: function() {
      return loadUser();
    },

    getInventory: function() {
      return loadUser().inventory || [];
    },

    // --- お寺の財政 & ローン ---
    getTempleState: function() {
      return loadTemple();
    },

    // --- 銭投げ（賽銭投げ）システム ---
    // 成功すると徳アップ、投げたコインはお寺の金庫に入りローン返済に直行！
    tossCoin: function(amount, isHit, targetName) {
      amount = Math.max(1, parseInt(amount, 10) || 1);
      var user = loadUser();
      if (user.coins < amount) {
        return { success: false, reason: 'insufficient_coins' };
      }

      user.coins -= amount;
      user.stats.tossCount += 1;
      user.stats.totalTossedCoins += amount;

      var tokuEarned = 0;
      if (isHit) {
        user.stats.tossHits += 1;
        tokuEarned = amount * 3 + 5; // 命中ボーナス
        user.toku += tokuEarned;
      } else {
        tokuEarned = amount; // 投げ入れだけでも徳が積まれる
        user.toku += tokuEarned;
      }
      saveUser(user);

      // お寺側の金庫とローンへ還元
      var temple = loadTemple();
      temple.templeVault += amount;
      temple.totalOfferingsReceived += amount;

      // 賽銭収入の 70% をナチャたちのローン返済に自動充当！
      var loanPayment = Math.floor(amount * 0.7);
      if (loanPayment > 0 && temple.loanPaid < temple.loanTotal) {
        temple.loanPaid = Math.min(temple.loanTotal, temple.loanPaid + loanPayment);
        temple.templeVault -= loanPayment;
        if (w.TempleBank) {
          try { w.TempleBank.repayDeityLoan(loanPayment, '賽銭投げ充当'); } catch(e) {}
        }
      }
      saveTemple(temple);

      return {
        success: true,
        isHit: isHit,
        tokuEarned: tokuEarned,
        userCoins: user.coins,
        userToku: user.toku,
        loanPaid: temple.loanPaid,
        loanRemaining: temple.loanTotal - temple.loanPaid
      };
    },

    // --- 授与所（棚）からの購入 ---
    buyFromShelf: function(slotId) {
      var temple = loadTemple();
      var shelfItem = temple.shelf.find(function(s) { return s.slotId === slotId; });
      if (!shelfItem || shelfItem.stock <= 0) {
        return { success: false, reason: 'out_of_stock' };
      }

      var user = loadUser();
      if (user.coins < shelfItem.price) {
        return { success: false, reason: 'insufficient_coins' };
      }

      // ユーザー支払い
      user.coins -= shelfItem.price;
      user.stats.purchases += 1;
      user.inventory.push(Object.assign({}, shelfItem.item, {
        obtainedAt: Date.now()
      }));
      saveUser(user);

      // 在庫減少
      shelfItem.stock -= 1;
      // 売上はお寺の金庫へ、そしてローン返済へ
      var revenue = shelfItem.price;
      temple.templeVault += revenue;
      var loanPayment = Math.floor(revenue * 0.8); // 売上の80%をローン返済へ
      if (temple.loanPaid < temple.loanTotal) {
        temple.loanPaid = Math.min(temple.loanTotal, temple.loanPaid + loanPayment);
        temple.templeVault -= loanPayment;
        if (w.TempleBank) {
          try { w.TempleBank.repayDeityLoan(loanPayment, '授与品売上充当: ' + shelfItem.item.name); } catch(e) {}
        }
      }

      // 在庫ゼロなら棚から除外（空きスロットになる）
      if (shelfItem.stock <= 0) {
        temple.shelf = temple.shelf.filter(function(s) { return s.slotId !== slotId; });
      }
      saveTemple(temple);

      return {
        success: true,
        item: shelfItem.item,
        remainingCoins: user.coins,
        loanRemaining: temple.loanTotal - temple.loanPaid
      };
    },

    // --- 工房制作（1日上限制限つき） ---
    craftNewItem: function(catalogId) {
      var cat = ITEM_CATALOG[catalogId];
      if (!cat) return { success: false, reason: 'unknown_item' };

      var temple = loadTemple();
      var currentTodayCount = temple.dailyCraftCounts[catalogId] || 0;
      if (currentTodayCount >= cat.dailyLimit) {
        return { success: false, reason: 'daily_limit_reached', max: cat.dailyLimit };
      }

      // ナチャたちがお寺の金庫から資材費を支出
      if (temple.templeVault < cat.costToMake) {
        // 金庫不足の場合はローン残高を増やして資材を調達（先行投資借入！）
        temple.loanTotal += cat.costToMake;
      } else {
        temple.templeVault -= cat.costToMake;
      }

      var now = Date.now();
      var matureMs = cat.matureDays * 86400000;
      var craftItem = {
        craftId: 'craft_' + now + '_' + Math.random().toString(36).slice(2, 6),
        catalogId: catalogId,
        name: cat.name,
        icon: cat.icon,
        creator: cat.creator,
        serialNo: '#' + String(Math.floor(Math.random() * 900) + 100),
        craftedAt: now,
        matureDaysRequired: cat.matureDays,
        readyAt: now + matureMs
      };

      temple.workshopQueue.push(craftItem);
      temple.dailyCraftCounts[catalogId] = currentTodayCount + 1;
      saveTemple(temple);

      return {
        success: true,
        craftItem: craftItem,
        todayCount: temple.dailyCraftCounts[catalogId],
        dailyLimit: cat.dailyLimit
      };
    },

    // --- 熟成・祈祷完了アイテムを棚へ陳列 ---
    placeMaturedItemOnShelf: function(craftId) {
      var temple = loadTemple();
      var idx = temple.workshopQueue.findIndex(function(c) { return c.craftId === craftId; });
      if (idx < 0) return { success: false, reason: 'not_found' };

      var item = temple.workshopQueue[idx];
      var now = Date.now();
      if (now < item.readyAt) {
        return { success: false, reason: 'still_maturing', daysLeft: Math.ceil((item.readyAt - now) / 86400000) };
      }

      // 棚の最大スロット（最大6スロット）
      if (temple.shelf.length >= 6) {
        return { success: false, reason: 'shelf_full' };
      }

      var cat = ITEM_CATALOG[item.catalogId];
      var newSlotId = temple.shelf.length > 0 ? Math.max.apply(null, temple.shelf.map(function(s){return s.slotId;})) + 1 : 1;

      var shelfObj = {
        slotId: newSlotId,
        item: {
          id: item.craftId,
          catalogId: item.catalogId,
          name: item.name + ' · 満願熟成',
          icon: item.icon,
          creator: item.creator,
          serialNo: item.serialNo,
          craftedAt: item.craftedAt,
          maturedAt: now,
          quality: '三十日祈祷・満願'
        },
        stock: 1,
        price: cat ? cat.retailPrice : 20
      };

      temple.workshopQueue.splice(idx, 1);
      temple.shelf.push(shelfObj);
      saveTemple(temple);

      return { success: true, shelfObj: shelfObj };
    },

    // --- 仏前へ奉納（所持品をお供えして徳へ還元・循環） ---
    offerItemToTemple: function(invId) {
      var user = loadUser();
      var idx = (user.inventory || []).findIndex(function(it) { return it.id === invId; });
      if (idx < 0) return { success: false, reason: 'item_not_found' };

      var item = user.inventory[idx];
      user.inventory.splice(idx, 1);

      // 徳ポイント付与（品物に応じて15〜40徳）
      var tokuGain = item.price ? Math.floor(item.price * 1.5) : 20;
      user.toku += tokuGain;
      saveUser(user);

      // お寺側の記録
      var temple = loadTemple();
      temple.totalOfferingsReceived += tokuGain;
      saveTemple(temple);

      return { success: true, item: item, tokuGain: tokuGain, totalToku: user.toku };
    },

    // --- 🏮 ガラポン開運福引システム ---
    drawFukubiki: function() {
      var user = loadUser();
      var ticketIdx = (user.inventory || []).findIndex(function(it) {
        return it.catalogId === 'fukubiki_ticket' || it.name.indexOf('福引') >= 0;
      });

      if (ticketIdx < 0) {
        return { success: false, reason: 'no_ticket', message: '「開運福引之符」をお持ちではありません。授与所でお求めください。' };
      }

      // チケットを1枚消費
      user.inventory.splice(ticketIdx, 1);

      var rand = Math.random() * 100;
      var prize = null;
      var ballColor = 'white';
      var grade = '三等';

      if (rand < 10) {
        // 特等（10%）金玉
        ballColor = 'gold';
        grade = '特等';
        prize = {
          id: 'fuku_gold_' + Date.now(),
          catalogId: 'gold_statue',
          name: '黄金ナチャ尊像 · 満願成就',
          icon: '👑',
          creator: '四柱合同',
          serialNo: '#' + String(Math.floor(Math.random() * 90) + 10),
          quality: '純金箔祈祷 · 非売品',
          obtainedAt: Date.now(),
          desc: '福引の特賞で授かった、黄金の輝きを放つナチャの尊像。'
        };
      } else if (rand < 35) {
        // 一等（25%）赤玉
        ballColor = 'red';
        grade = '一等';
        prize = {
          id: 'fuku_red_' + Date.now(),
          catalogId: 'spear_charm',
          name: '白檀手彫り火焔槍チャーム',
          icon: '🔥',
          creator: '不動明王',
          serialNo: '#' + String(Math.floor(Math.random() * 900) + 100),
          quality: '護摩祈祷 · 厄除特撰',
          obtainedAt: Date.now(),
          desc: '福引の一等で授かった、白檀の香りと炎の加護を宿す槍飾り。'
        };
      } else if (rand < 70) {
        // 二等（35%）青玉
        ballColor = 'blue';
        grade = '二等';
        prize = {
          id: 'fuku_blue_' + Date.now(),
          catalogId: 'lotus_bell',
          name: '蓮華水琴鈴根付',
          icon: '🔔',
          creator: '白衣観音',
          serialNo: '#' + String(Math.floor(Math.random() * 900) + 100),
          quality: '清音 · 良縁祈念',
          obtainedAt: Date.now(),
          desc: '福引の二等で授かった、涼やかな水琴の音を奏でる蓮の鈴。'
        };
      } else {
        // 三等（30%）白玉
        ballColor = 'white';
        grade = '三等';
        prize = {
          id: 'fuku_white_' + Date.now(),
          catalogId: 'incense_pouch',
          name: '観音堂お清め塗香袋',
          icon: '🌿',
          creator: '南極老人',
          serialNo: '#' + String(Math.floor(Math.random() * 900) + 100),
          quality: '除災招福 · 吉祥',
          obtainedAt: Date.now(),
          desc: '福引の三等で授かった、天然香木を調合した清めのお香袋。'
        };
      }

      user.inventory.push(prize);
      user.toku += 10; // 福引を引くこと自体で徳積み
      saveUser(user);

      // お寺側のローン返済（福引による祈祷納入）
      if (w.TempleBank) {
        w.TempleBank.repayDeityLoan(5, '開運福引祈祷充当');
      }

      return {
        success: true,
        ballColor: ballColor,
        grade: grade,
        prize: prize,
        remainingTickets: user.inventory.filter(function(it) {
          return it.catalogId === 'fukubiki_ticket' || it.name.indexOf('福引') >= 0;
        }).length
      };
    },

    // ==========================================
    // 🍂 枝拾い（遠征・放置収穫）システム
    // ==========================================
    FORESTS: FORESTS,

    getForestStatus: function() {
      var temple = loadTemple();
      if (!temple.forestState) {
        temple.forestState = { lastHarvest: {}, activeDispatches: {} };
      }
      var now = Date.now();

      return FORESTS.map(function(f) {
        var lastTime = temple.forestState.lastHarvest[f.id] || (now - 600000);
        var elapsedMin = Math.max(0, (now - lastTime) / 60000);

        // 溜まっている枝数（木の本数 × レート × 経過時間、上限あり）
        // 遠いところは上限が高く、枝がドッサリ溜まりやすい！
        var accumulated = Math.min(f.maxAccumulate, Math.floor(elapsedMin * f.branchRatePerMin));

        var dispatch = temple.forestState.activeDispatches[f.id] || null;
        var isDispatched = !!dispatch;
        var isReady = false;
        var secondsLeft = 0;

        if (dispatch) {
          if (now >= dispatch.finishAt) {
            isReady = true;
          } else {
            secondsLeft = Math.ceil((dispatch.finishAt - now) / 1000);
          }
        }

        return {
          id: f.id,
          name: f.name,
          distance: f.distance,
          icon: f.icon,
          treesCount: f.treesCount,
          woodType: f.woodType,
          tripDurationMs: f.tripDurationMs,
          tripDurationSec: Math.round(f.tripDurationMs / 1000),
          maxAccumulate: f.maxAccumulate,
          currentBranches: accumulated,
          isDispatched: isDispatched,
          isReady: isReady,
          secondsLeft: secondsLeft,
          carryingBranches: dispatch ? dispatch.branchesPicked : 0
        };
      });
    },

    // お寺から出かけて枝拾いへ出発！
    startBranchGathering: function(forestId) {
      var f = FORESTS.find(function(item) { return item.id === forestId; });
      if (!f) return { success: false, reason: 'unknown_forest' };

      var temple = loadTemple();
      temple.forestState = temple.forestState || { lastHarvest: {}, activeDispatches: {} };

      if (temple.forestState.activeDispatches[forestId]) {
        return { success: false, reason: 'already_dispatched' };
      }

      var now = Date.now();
      var lastTime = temple.forestState.lastHarvest[f.id] || (now - 600000);
      var elapsedMin = Math.max(0, (now - lastTime) / 60000);
      var pickedCount = Math.max(1, Math.min(f.maxAccumulate, Math.floor(elapsedMin * f.branchRatePerMin)));

      // 枝を拾ったのでエリアの溜まり時間はリセット
      temple.forestState.lastHarvest[f.id] = now;

      // 遠いほど戻ってくるのに時間がかかる！
      temple.forestState.activeDispatches[f.id] = {
        startedAt: now,
        finishAt: now + f.tripDurationMs,
        branchesPicked: pickedCount
      };
      saveTemple(temple);

      return {
        success: true,
        forest: f,
        branchesPicked: pickedCount,
        durationSec: Math.round(f.tripDurationMs / 1000)
      };
    },

    // 戻ってきた枝を収穫！
    claimBranchHarvest: function(forestId) {
      var temple = loadTemple();
      if (!temple.forestState || !temple.forestState.activeDispatches[forestId]) {
        return { success: false, reason: 'not_dispatched' };
      }

      var dispatch = temple.forestState.activeDispatches[forestId];
      var now = Date.now();
      if (now < dispatch.finishAt) {
        return { success: false, reason: 'still_on_the_way', secondsLeft: Math.ceil((dispatch.finishAt - now) / 1000) };
      }

      var branchesGained = dispatch.branchesPicked;
      delete temple.forestState.activeDispatches[forestId];
      saveTemple(temple);

      var user = loadUser();
      user.branches = (user.branches || 0) + branchesGained;
      user.toku = (user.toku || 0) + Math.max(1, Math.floor(branchesGained * 0.5)); // 掃除作務の徳
      saveUser(user);

      return {
        success: true,
        branchesGained: branchesGained,
        totalBranches: user.branches,
        totalToku: user.toku
      };
    },

    // ナチャ工房へ枝を納品（買い取り＆ローン返済充当）
    sellBranchesToWorkshop: function(count) {
      count = parseInt(count, 10);
      if (isNaN(count) || count <= 0) return { success: false, reason: 'invalid_count' };

      var user = loadUser();
      if ((user.branches || 0) < count) {
        return { success: false, reason: 'not_enough_branches' };
      }

      user.branches -= count;
      var coinsEarned = count * 2; // 1本 = 2コイン
      var tokuEarned = count * 1;  // 1本 = 1徳
      user.coins += coinsEarned;
      user.toku += tokuEarned;
      saveUser(user);

      // ナチャたちの資材調達ローン返済へ還元！
      var loanRepay = count * 1; // 1本につき1コインのローン返済
      if (w.TempleBank) {
        w.TempleBank.repayDeityLoan(loanRepay, '木製資材（枝）の調達充当');
      }

      return {
        success: true,
        soldCount: count,
        coinsEarned: coinsEarned,
        tokuEarned: tokuEarned,
        totalCoins: user.coins,
        remainingBranches: user.branches
      };
    }
  };

  w.TempleEconomy = TempleEconomy;
})(window);
