(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rootEl = document.documentElement;

  /* ---------- тема: день / ночь ---------- */
  var toggleBtn = document.getElementById('themeToggle');
  var icon = document.getElementById('themeIcon');
  function applyIcon() {
    icon.textContent = rootEl.getAttribute('data-theme') === 'dark' ? '○' : '◐';
  }
  function setTheme(t) {
    rootEl.setAttribute('data-theme', t);
    try { localStorage.setItem('qyotta-theme', t); } catch (e) {}
    icon.classList.remove('spin'); void icon.offsetWidth; icon.classList.add('spin');
    applyIcon();
  }
  toggleBtn.addEventListener('click', function () {
    setTheme(rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });
  applyIcon();

  /* ---------- появление при скролле ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- печать тега ---------- */
  function type(el, speed, delay) {
    var text = el.getAttribute('data-text') || el.textContent;
    if (reduced) { el.textContent = text; return; }
    el.textContent = '';
    var i = 0;
    function tick() {
      i += 1;
      el.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(tick, speed + Math.random() * 45);
    }
    setTimeout(tick, delay);
  }
  var typed = document.getElementById('typed');
  if (typed) type(typed, 75, 600);

  /* ---------- scramble-декод имени ---------- */
  var nameEl = document.getElementById('name');
  function scramble(el) {
    if (reduced || el._busy) return;
    var text = el.getAttribute('data-text');
    var chars = '#01<>/_—+*';
    var frame = 0;
    el._busy = true;
    (function step() {
      var out = '';
      for (var i = 0; i < text.length; i++) {
        if (text[i] === ' ') { out += ' '; continue; }
        out += (frame >= i * 3 + 6) ? text[i] : chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;
      frame++;
      if (frame <= text.length * 3 + 8) requestAnimationFrame(step);
      else { el.textContent = text; el._busy = false; }
    })();
  }
  if (nameEl) {
    nameEl.addEventListener('mouseenter', function () { scramble(nameEl); });
    nameEl.addEventListener('click', function () { scramble(nameEl); });
  }

  /* ---------- минималистичные смайлики ---------- */
  var faces = ['^_^', ':)', ';)', ':D', '¬_¬', '◕‿◕', '☾_☾', '¯\\_(ツ)_/¯'];
  var fi = 0;
  var smileyBtn = document.getElementById('smiley');
  function cycleSmiley() {
    fi = (fi + 1) % faces.length;
    smileyBtn.textContent = faces[fi];
    smileyBtn.classList.remove('pop'); void smileyBtn.offsetWidth; smileyBtn.classList.add('pop');
  }
  smileyBtn.addEventListener('click', cycleSmiley);

  /* ---------- терминал ---------- */
  var termBody = document.getElementById('termBody');
  var termForm = document.getElementById('termForm');
  var termInput = document.getElementById('termInput');
  termBody.addEventListener('click', function () { termInput.focus(); });

  function line(text, cls) {
    var div = document.createElement('div');
    div.className = 'term-line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    termBody.insertBefore(div, termForm);
    return div;
  }
  function scrollTerm() { termBody.scrollTop = termBody.scrollHeight; }
  function print(lines) {
    lines.forEach(function (t, i) {
      setTimeout(function () { line(t); scrollTerm(); }, i * 70);
    });
  }

  termForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var cmd = termInput.value.trim();
    termInput.value = '';
    if (!cmd) return;
    line('qyotta@dev:~$ ' + cmd, 'echo');
    run(cmd);
    scrollTerm();
  });

  function run(raw) {
    var c = raw.toLowerCase();
    if (c === 'help') {
      print([
        'доступные команды:',
        '  about     — кто такой qyotta',
        '  contacts  — все контакты',
        '  theme     — сменить тему (день/ночь)',
        '  smile     — случайная минимал-улыбка',
        '  moon      — полу-месяц',
        '  clear     — очистить терминал',
        '  sudo …    — не советую :)'
      ]);
    } else if (c === 'about' || c === 'whoami' || c === 'обо мне') {
      print(['qyotta — python fullstuck', 'пишу на python: от ботов и api до веб-интерфейсов']);
    } else if (c === 'contacts' || c === 'контакты') {
      print([
        'telegram : @qyotta',
        'github   : qyotta-dev',
        'discord  : ok.python',
        'channel  : t.me/qyottadev'
      ]);
    } else if (c === 'theme' || c === 'тема') {
      var next = rootEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
      print(['тема переключена на: ' + next + ' ' + (next === 'dark' ? '☾' : '○')]);
    } else if (c === 'smile' || c === 'улыбка') {
      cycleSmiley();
      print([faces[fi] + '   — как тебе?']);
    } else if (c === 'moon' || c === 'луна' || c === 'месяц') {
      print(['☾  — полу-месяц на месте']);
    } else if (c === 'clear' || c === 'cls') {
      Array.prototype.slice.call(termBody.querySelectorAll('.term-line')).forEach(function (n) {
        if (!n.classList.contains('form')) n.remove();
      });
    } else if (c.indexOf('sudo') === 0) {
      print(['[sudo] password for guest: ********', 'Permission denied: nicely tried :)']);
    } else if (c === 'привет' || c === 'hello' || c === 'hi') {
      print(['привет, человек ^_^']);
    } else if (c === 'python' || c === 'import this') {
      print(['import this  # заценю как-нибудь :)']);
    } else if (c === 'exit' || c === 'quit' || c === 'выход') {
      print(['выхода нет ☾']);
    } else if (c === 'rm -rf /') {
      print(['ага, конечно :)']);
    } else {
      print(['команда не найдена: ' + raw + ' — введи help']);
    }
  }

  /* ---------- копирование discord + toast ---------- */
  var toast = document.getElementById('toast');
  var toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 2200);
  }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      ta.remove();
    });
  }
  var discord = document.getElementById('discord-card');
  discord.addEventListener('click', function () {
    copyText('ok.python').then(function () {
      showToast('ok.python — скопировано ✓');
    }).catch(function () {
      showToast('Discord: ok.python');
    });
  });

  console.log('%cqyotta', 'font-size:20px;font-weight:800;letter-spacing:-1px', '— python fullstuck ☾');
})();