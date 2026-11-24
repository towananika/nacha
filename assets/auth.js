/**
 * NACHA & とわなにか 統合ログインシステム (nacha/assets/auth.js)
 * 
 * 1. REMITECH / NACHA 統合ログイン (localStorage: 'nacha-auth', 'remitech-auth')
 * 2. とわなにか / Triathlon Firebase Google ログイン (UID: 3wzoIaBNjLf9x0BW3HRUcqOHCAG2)
 * いずれかでログインしたオーナーを統一判定し、画面要素を制御します。
 */
(function () {
  'use strict';

  // オーナーの Firebase UID（とわなにか・トライアスロン共通）
  var OWNER_UID = '3wzoIaBNjLf9x0BW3HRUcqOHCAG2';
  var KEY_NACHA = 'nacha-auth';
  var KEY_HUB = 'remitech-auth';

  // 1. スタイルの即時挿入（非オーナー・非ログイン要素を隠す）
  var css = document.createElement('style');
  css.textContent = 
    'html:not(.nacha-owner) [data-owner-only] { display: none !important; }\n' +
    'html:not(.nacha-logged-in) [data-logged-in-only] { display: none !important; }\n' +
    'html.nacha-logged-in [data-guest-only] { display: none !important; }';
  document.head.appendChild(css);

  var currentUser = null;
  var listeners = [];

  function readStorage(key) {
    try {
      var v = JSON.parse(localStorage.getItem(key) || 'null');
      if (v && v.token && v.exp > Date.now() && v.user) return v;
    } catch (e) {}
    return null;
  }

  // 同期判定（localStorageベース）
  function evaluateSync() {
    var authData = readStorage(KEY_NACHA) || readStorage(KEY_HUB);
    var isOwner = false;
    var isAdmin = false;
    var isLoggedIn = false;
    var userObj = null;

    if (authData && authData.user) {
      isLoggedIn = true;
      var u = authData.user;
      isOwner = !!u.owner;
      isAdmin = !!(u.owner || u.admin);
      userObj = {
        id: u.id || '',
        email: u.google || u.email || '',
        role: isOwner ? 'owner' : (isAdmin ? 'admin' : (u.member ? 'member' : 'user')),
        isOwner: isOwner,
        isAdmin: isAdmin,
        source: 'nacha-hub'
      };
    }

    applyState(userObj, isOwner, isAdmin, isLoggedIn);
  }

  function applyState(userObj, isOwner, isAdmin, isLoggedIn) {
    currentUser = userObj;
    var de = document.documentElement;
    de.classList.toggle('nacha-owner', !!isOwner);
    de.classList.toggle('nacha-admin', !!isAdmin);
    de.classList.toggle('nacha-logged-in', !!isLoggedIn);

    // バインドされたUIの更新
    updateBoundUI();

    // イベント発火
    listeners.forEach(function (fn) {
      try { fn(currentUser); } catch (e) {}
    });
    document.dispatchEvent(new CustomEvent('nacha-auth-change', { detail: currentUser }));
  }

  function updateBoundUI() {
    var btns = document.querySelectorAll('[data-nacha-auth-link]');
    btns.forEach(function (el) {
      if (currentUser) {
        el.textContent = 'マイページ';
        el.setAttribute('title', (currentUser.email || currentUser.id) + ' でログイン中');
      } else {
        el.textContent = 'ログイン';
        el.removeAttribute('title');
      }
    });
  }

  // 2. Firebase Auth (Triathlon/とわなにか共通ログイン) との連携
  function initFirebaseAuth() {
    // ページ相対パスから triathlon/login/auth.js へのパスを推定
    var scriptPath = '';
    var path = location.pathname;
    if (path.indexOf('/nacha/kpi/') >= 0) {
      scriptPath = '../../triathlon/login/auth.js?v=0.28';
    } else if (path.indexOf('/nacha/') >= 0) {
      scriptPath = '../triathlon/login/auth.js?v=0.28';
    } else {
      scriptPath = '/triathlon/login/auth.js?v=0.28';
    }

    // dynamic import で Firebase Auth をチェック
    try {
      import(scriptPath).then(function () {
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js').then(function (fb) {
          var auth = fb.getAuth();
          fb.onAuthStateChanged(auth, function (user) {
            if (user) {
              var isOwner = (user.uid === OWNER_UID && user.emailVerified);
              var fbUser = {
                id: user.displayName || 'Googleユーザー',
                email: user.email || '',
                role: isOwner ? 'owner' : 'user',
                isOwner: isOwner,
                isAdmin: isOwner,
                uid: user.uid,
                source: 'firebase-google'
              };
              // 既に nacha-hub でオーナーの場合はオーナー優先
              if (!isOwner && currentUser && currentUser.isOwner) {
                return;
              }
              applyState(fbUser, isOwner, isOwner, true);
            } else {
              // Firebase未ログインの場合、localStorageベースで再評価
              evaluateSync();
            }
          });
        }).catch(function () {});
      }).catch(function () {});
    } catch (e) {}
  }

  // 実行
  evaluateSync();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      updateBoundUI();
      initFirebaseAuth();
    });
  } else {
    updateBoundUI();
    initFirebaseAuth();
  }

  // グローバルAPI
  window.NachaAuth = {
    getUser: function () { return currentUser; },
    isOwner: function () { return !!(currentUser && currentUser.isOwner); },
    isAdmin: function () { return !!(currentUser && currentUser.isAdmin); },
    isLoggedIn: function () { return !!currentUser; },
    onAuthChange: function (fn) {
      if (typeof fn === 'function') {
        listeners.push(fn);
        if (currentUser !== null) fn(currentUser);
      }
    },
    logout: function () {
      try { localStorage.removeItem(KEY_NACHA); } catch (e) {}
      if (window.triLogout) window.triLogout().catch(function () {});
      applyState(null, false, false, false);
      location.reload();
    }
  };

})();
