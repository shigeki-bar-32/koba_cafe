//===============================================================
// メニュー制御用の関数とイベント設定（※バージョン2025-1）
//===============================================================
$(function(){
  //-------------------------------------------------
  // 変数の宣言
  //-------------------------------------------------
  const $menubar = $('#menubar');
  const $menubarHdr = $('#menubar_hdr');
  const breakPoint = 9999;	// ここがブレイクポイント指定箇所です

  // ▼ここを切り替えるだけで 2パターンを使い分け！
  //   false → “従来どおり”
  //   true  → “ハンバーガーが非表示の間は #menubar も非表示”
  const HIDE_MENUBAR_IF_HDR_HIDDEN = false;

  // タッチデバイスかどうかの判定
  const isTouchDevice = ('ontouchstart' in window) ||
                       (navigator.maxTouchPoints > 0) ||
                       (navigator.msMaxTouchPoints > 0);

  //-------------------------------------------------
  // debounce(処理の呼び出し頻度を抑制) 関数
  //-------------------------------------------------
  function debounce(fn, wait) {
    let timerId;
    return function(...args) {
      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        fn.apply(this, args);
      }, wait);
    };
  }

  //-------------------------------------------------
  // ドロップダウン用の初期化関数
  //-------------------------------------------------
  function initDropdown($menu, isTouch) {
    // ドロップダウンメニューが存在するliにクラス追加
    $menu.find('ul li').each(function() {
      if ($(this).find('ul').length) {
        $(this).addClass('ddmenu_parent');
        $(this).children('a').addClass('ddmenu');
      }
    });

    // ドロップダウン開閉のイベント設定
    if (isTouch) {
      // タッチデバイスの場合 → タップで開閉
      $menu.find('.ddmenu').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const $dropdownMenu = $(this).siblings('ul');
        if ($dropdownMenu.is(':visible')) {
          $dropdownMenu.hide();
        } else {
          $menu.find('.ddmenu_parent ul').hide(); // 他を閉じる
          $dropdownMenu.show();
        }
      });
    } else {
      // PCの場合 → ホバーで開閉
      $menu.find('.ddmenu_parent').hover(
        function() {
          $(this).children('ul').show();
        },
        function() {
          $(this).children('ul').hide();
        }
      );
    }
  }

  //-------------------------------------------------
  // ハンバーガーメニューでの開閉制御関数
  //-------------------------------------------------
  function initHamburger($hamburger, $menu) {
    $hamburger.on('click', function() {
      $(this).toggleClass('ham');
      if ($(this).hasClass('ham')) {
        $menu.show();
        // ▼ ブレイクポイント未満でハンバーガーが開いたら body のスクロール禁止
        //    （メニューが画面いっぱいに fixed 表示されている時に背後をスクロールさせないため）
        if ($(window).width() < breakPoint) {
          $('body').addClass('noscroll');  // ★追加
        }
      } else {
        $menu.hide();
        // ▼ ハンバーガーを閉じたらスクロール禁止を解除
        if ($(window).width() < breakPoint) {
          $('body').removeClass('noscroll');  // ★追加
        }
      }
      // ドロップダウン部分も一旦閉じる
      $menu.find('.ddmenu_parent ul').hide();
    });
  }

  //-------------------------------------------------
  // レスポンシブ時の表示制御 (リサイズ時)
  //-------------------------------------------------
  const handleResize = debounce(function() {
    const windowWidth = $(window).width();

    // bodyクラスの制御 (small-screen / large-screen)
    if (windowWidth < breakPoint) {
      $('body').removeClass('large-screen').addClass('small-screen');
    } else {
      $('body').removeClass('small-screen').addClass('large-screen');
      // PC表示になったら、ハンバーガー解除 + メニューを開く
      $menubarHdr.removeClass('ham');
      $menubar.find('.ddmenu_parent ul').hide();

      // ▼ PC表示に切り替わったらスクロール禁止も解除しておく (保険的な意味合い)
      $('body').removeClass('noscroll'); // ★追加

      // ▼ #menubar を表示するか/しないかの切り替え
      if (HIDE_MENUBAR_IF_HDR_HIDDEN) {
        $menubarHdr.hide();
        $menubar.hide();
      } else {
        $menubarHdr.hide();
        $menubar.show();
      }
    }

    // スマホ(ブレイクポイント未満)のとき
    if (windowWidth < breakPoint) {
      $menubarHdr.show();
      if (!$menubarHdr.hasClass('ham')) {
        $menubar.hide();
        // ▼ ハンバーガーが閉じている状態ならスクロール禁止も解除
        $('body').removeClass('noscroll'); // ★追加
      }
    }
  }, 200);

  //-------------------------------------------------
  // 初期化
  //-------------------------------------------------
  // 1) ドロップダウン初期化 (#menubar)
  initDropdown($menubar, isTouchDevice);

  // 2) ハンバーガーメニュー初期化 (#menubar_hdr + #menubar)
  initHamburger($menubarHdr, $menubar);

  // 3) レスポンシブ表示の初期処理 & リサイズイベント
  handleResize();
  $(window).on('resize', handleResize);

  //-------------------------------------------------
  // アンカーリンク(#)のクリックイベント
  //-------------------------------------------------
  $menubar.find('a[href^="#"]').on('click', function() {
    // ドロップダウンメニューの親(a.ddmenu)のリンクはメニューを閉じない
    if ($(this).hasClass('ddmenu')) return;

    // スマホ表示＆ハンバーガーが開いている状態なら閉じる
    if ($menubarHdr.is(':visible') && $menubarHdr.hasClass('ham')) {
      $menubarHdr.removeClass('ham');
      $menubar.hide();
      $menubar.find('.ddmenu_parent ul').hide();
      // ハンバーガーが閉じたのでスクロール禁止を解除
      $('body').removeClass('noscroll'); // ★追加
    }
  });

  //-------------------------------------------------
  // 「header nav」など別メニューにドロップダウンだけ適用したい場合
  //-------------------------------------------------
  // 例：header nav へドロップダウンだけ適用（ハンバーガー連動なし）
  //initDropdown($('header nav'), isTouchDevice);
});


//===============================================================
// スムーススクロール（※バージョン2024-1）※通常タイプ
//===============================================================
$(function() {
    // ページ上部へ戻るボタンのセレクター
    var topButton = $('.pagetop');
    // ページトップボタン表示用のクラス名
    var scrollShow = 'pagetop-show';

    // スムーススクロールを実行する関数
    // targetにはスクロール先の要素のセレクターまたは'#'（ページトップ）を指定
    function smoothScroll(target) {
        // スクロール先の位置を計算（ページトップの場合は0、それ以外は要素の位置）
        var scrollTo = target === '#' ? 0 : $(target).offset().top;
        // アニメーションでスムーススクロールを実行
        $('html, body').animate({scrollTop: scrollTo}, 500);
    }

    // ページ内リンクとページトップへ戻るボタンにクリックイベントを設定
    $('a[href^="#"], .pagetop').click(function(e) {
        e.preventDefault(); // デフォルトのアンカー動作をキャンセル
        var id = $(this).attr('href') || '#'; // クリックされた要素のhref属性を取得、なければ'#'
        smoothScroll(id); // スムーススクロールを実行
    });

    // スクロールに応じてページトップボタンの表示/非表示を切り替え
    $(topButton).hide(); // 初期状態ではボタンを隠す
    $(window).scroll(function() {
        if($(this).scrollTop() >= 300) { // スクロール位置が300pxを超えたら
            $(topButton).fadeIn().addClass(scrollShow); // ボタンを表示
        } else {
            $(topButton).fadeOut().removeClass(scrollShow); // それ以外では非表示
        }
    });

    // ページロード時にURLのハッシュが存在する場合の処理
    if(window.location.hash) {
        // ページの最上部に即時スクロールする
        $('html, body').scrollTop(0);
        // 少し遅延させてからスムーススクロールを実行
        setTimeout(function() {
            smoothScroll(window.location.hash);
        }, 10);
    }
});


//===============================================================
// 画面の高さを取得
//===============================================================
function setDynamicHeight() {
  document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`);
}

// 初回実行
setDynamicHeight();

// 画面リサイズ時にも更新
window.addEventListener('resize', setDynamicHeight);


//===============================================================
// 動画スライドショー
//===============================================================
// 即時関数で囲って、document.currentScript をキャプチャ
(function(){
  // スクリプトURLの取得は残しますが、imgBaseは絶対パス指定に変更
  var scriptEl = document.currentScript || (function(){
    var ss = document.getElementsByTagName('script');
    return ss[ss.length - 1];
  })();

  // 動画ファイルがサイトルート直下の "videos" フォルダにある想定
  var imgBase = './videos/';

  $(function(){
    var filesPortrait  = ['koba_cafe-01.mp4', 'koba_cafe-02.mp4', 'koba_cafe-03.mp4', 'koba_cafe-04.mp4', 'koba_cafe-05.mp4'],
        filesLandscape = ['koba_cafe-01.mp4', 'koba_cafe-02.mp4', 'koba_cafe-03.mp4', 'koba_cafe-04.mp4', 'koba_cafe-05.mp4'],
        slideInterval, currentIndex = 0, currentOrientation;

    function setVideoSources(orientation) {
      var files = orientation === 'portrait' ? filesPortrait : filesLandscape;
      $('#mainimg').find('video').each(function(i){
        this.pause();
        this.src = imgBase + files[i];
        this.load();
        $(this).removeClass('active');
      });
    }

    function showSlide(idx) {
      $('#mainimg').find('video').each(function(i){
        if(i === idx){
          this.currentTime = 0;
          this.play();
          $(this).addClass('active');
        } else {
          this.pause();
          $(this).removeClass('active');
        }
      });
    }

    function startSlideshow() {
      currentOrientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
      setVideoSources(currentOrientation);
      currentIndex = 0;
      showSlide(currentIndex);
      slideInterval = setInterval(function(){
        currentIndex = (currentIndex + 1) % $('#mainimg').find('video').length;
        showSlide(currentIndex);
      }, 4000);
    }

    function stopSlideshow() {
      clearInterval(slideInterval);
    }

    function handleOrientationChange() {
      var newO = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
      if(newO !== currentOrientation){
        stopSlideshow();
        startSlideshow();
      }
    }

    function debounce(fn, wait) {
      var t;
      return function() {
        clearTimeout(t);
        t = setTimeout(fn, wait);
      };
    }

    startSlideshow();
    $(window).on('resize', debounce(handleOrientationChange, 200));
  });
})();



//===============================================================
// 汎用開閉処理
//===============================================================
$(function() {
	$('.faq dt').next().hide();
	$('.faq dt').click(function() {
		// クリックした要素に active クラスをトグルする
		$(this).toggleClass('active');
		$(this).next().slideToggle();
		// クリックされた要素以外の active クラスを除去し、その dd を閉じる
		$('.faq dt').not(this).removeClass('active').next().slideUp();
	});
});


//===============================================================
// コンテンツが終了するまで見出しをstickyで固定
//===============================================================
    $(window).on('scroll', function() {
      $('.box').each(function() {
        var $box = $(this);
        // text の下端がビューの上端を越えたらフェードアウト
        var textBottom = $box.find('.text')[0].getBoundingClientRect().bottom;
        if (textBottom <= 0) {
          $box.find('.title').addClass('fade');
        } else {
          $box.find('.title').removeClass('fade');
        }
      });
    });


//===============================================================
// 背景画像が少しずつ上に移動する
//===============================================================
$(document).ready(function() {
    // 初期設定：背景画像の位置を設定
    updateParallax();

    // スクロール時にパララックス効果を更新
    $(window).on('scroll', function() {
        updateParallax();
    });

    function updateParallax() {
        var scrollTop = $(window).scrollTop();
        var windowHeight = $(window).height();

        $('.bg-slideup').each(function() {
            var $this = $(this);
            var offsetTop = $this.offset().top;
            var height = $this.outerHeight();

            // 要素がビューポート内にあるか確認
            if (offsetTop + height > scrollTop && offsetTop < scrollTop + windowHeight) {
                // 要素のビューポート内での位置を計算
                var percentScrolled = (scrollTop + windowHeight - offsetTop) / (windowHeight + height);
                percentScrolled = percentScrolled > 1 ? 1 : percentScrolled < 0 ? 0 : percentScrolled;

                // 背景位置を調整（0%から100%へ）
                var yPos = (percentScrolled * 100);
                $this.css('background-position', 'center ' + yPos + '%');
            }
        });
    }
});


//===============================================================
// テキストのフェードイン効果
//===============================================================

// jQuery部分：フェードインテキスト
$(function() {
  $('.fade-in-text').on('inview', function(event, isInView) {
    if (isInView && !$(this).data('animated')) {
      let innerHTML = '';
      const text = $(this).text();
      $(this).text('');
      for (let i = 0; i < text.length; i++) {
        innerHTML += `<span class="char" style="animation-delay: ${i * 0.1}s;">${text[i]}</span>`;
      }
      $(this).html(innerHTML).css('visibility', 'visible');
      $(this).data('animated', true);
    }
  });
});

var swiper = new Swiper(".mySwiper", {
  effect: "coverflow",
  grabCursor: true,
  centeredSlides: true,
  slidesPerView: 3,
  loop: true,
  coverflowEffect: {
    rotate: 50,
    stretch: 0,
    depth: 100,
    modifier: 1,
    slideShadows: true,
  },
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    0: {
      slidesPerView: 1,
      centeredSlides: true,
    },
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
  },
});

//===============================================================
// もっと見る
//===============================================================


// 中央スライド以外のボタンは非表示にし、展開は閉じる処理
function updateSlides() {
  const slides = document.querySelectorAll('.swiper-slide');
  const activeIndex = swiper.activeIndex;

  slides.forEach((slide, index) => {
    const btn = slide.querySelector('.btn-toggle');
    const container = slide.querySelector('.text-collapse');

    if (!btn || !container) return;

    if (index === activeIndex) {
      btn.style.display = 'inline-block'; // 中央だけボタン表示
    } else {
      btn.style.display = 'none';          // その他非表示
      if (container.classList.contains('expanded')) {
        container.classList.remove('expanded'); // 開いていれば閉じる
        btn.textContent = 'もっと見る';        // ボタン文言リセット
      }
    }
  });
}

// 初期表示時も呼ぶ
updateSlides();

// スライド切り替え開始時に処理
swiper.on('slideChangeTransitionStart', () => {
  updateSlides();
});

// ボタンのクリックイベント登録（展開・折りたたみ）
document.querySelectorAll('.btn-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const container = btn.previousElementSibling; // 直前のテキストコンテナ
    container.classList.toggle('expanded');
    btn.textContent = container.classList.contains('expanded') ? '閉じる' : 'もっと見る';
  });
});










