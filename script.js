(function () {
    var themeKey = 'codewave-theme';
    var html = document.documentElement;
    var themeToggle = document.getElementById('themeToggle');
    var iconSun = document.getElementById('iconSun');
    var iconMoon = document.getElementById('iconMoon');

    function setTheme(dark) {
        if (dark) {
            html.setAttribute('data-theme', 'dark');
            if (iconSun) iconSun.style.display = 'none';
            if (iconMoon) iconMoon.style.display = 'block';
        } else {
            html.removeAttribute('data-theme');
            if (iconSun) iconSun.style.display = 'block';
            if (iconMoon) iconMoon.style.display = 'none';
        }
        try { localStorage.setItem(themeKey, dark ? 'dark' : 'light'); } catch (e) {}
    }

    var saved = null;
    try { saved = localStorage.getItem(themeKey); } catch (e) {}
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || (!saved && prefersDark);
    setTheme(isDark);

    if (themeToggle) themeToggle.addEventListener('click', function () {
        isDark = html.getAttribute('data-theme') === 'dark';
        setTheme(!isDark);
    });

    var backToTop = document.getElementById('backToTop');
    if (backToTop) backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    var form = document.getElementById('contactForm');
    if (form) form.addEventListener('submit', function (e) {
        e.preventDefault();
        alert('Thanks! We\'ll get back to you soon.');
        form.reset();
    });

    /* Scroll reveal: animate in when entering viewport (scroll down or up) */
    var revealEls = document.querySelectorAll('.reveal-on-scroll');
    if (revealEls.length && 'IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                } else {
                    entry.target.classList.remove('revealed');
                }
            });
        }, { rootMargin: '-80px 0px 0px 0px', threshold: 0.01 });
        revealEls.forEach(function (el) { observer.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('revealed'); });
    }

    /* Team hover: apply a per-card color scheme to the page when hovering a member card.
       Each .member-card may define data-accent-*, data-blue-*, data-bg-*, data-text-* for light/dark variants. */
    (function () {
        var root = document.documentElement;
        var cards = document.querySelectorAll('.team-grid .member-card');
        if (!cards || !cards.length) return;

        var varNames = ['--accent', '--blue', '--bg', '--text', '--photo-text'];
        var original = {};
        var comp = getComputedStyle(root);
        varNames.forEach(function (v) { original[v] = comp.getPropertyValue(v) || ''; });

        cards.forEach(function (card) {
            var attrs = {};
            ['accent', 'blue', 'bg', 'text', 'photo'].forEach(function (name) {
                attrs[name] = {
                    light: card.getAttribute('data-' + (name === 'photo' ? 'photo' : name) + '-light'),
                    dark: card.getAttribute('data-' + (name === 'photo' ? 'photo' : name) + '-dark')
                };
            });

            function applyScheme(isDark) {
                varNames.forEach(function (varName) {
                    var key = varName === '--photo-text' ? 'photo' : varName.replace('--', '');
                    var val = attrs[key] && (isDark ? attrs[key].dark : attrs[key].light);
                    if (val != null && val !== '') root.style.setProperty(varName, val);
                });
            }

            card.addEventListener('mouseenter', function () {
                var isDarkMode = root.getAttribute('data-theme') === 'dark';
                applyScheme(isDarkMode);
                root.classList.add('card-scheme-active');
            });

            card.addEventListener('mouseleave', function () {
                // remove inline overrides so CSS theme rules take effect again
                varNames.forEach(function (varName) { root.style.removeProperty(varName); });
                root.classList.remove('card-scheme-active');
            });
        });
    })();

    /* Navigation active state on scroll */
    (function () {
        var navLinks = document.querySelectorAll('nav a[href^="#"]');
        var sections = Array.from(navLinks).map(function (link) {
            var id = link.getAttribute('href').substring(1);
            return document.getElementById(id);
        }).filter(Boolean);

        function updateActiveNav() {
            var scrollY = window.pageYOffset;
            var viewportHeight = window.innerHeight;
            var activeSection = null;

            sections.forEach(function (section) {
                var rect = section.getBoundingClientRect();
                var sectionTop = rect.top + scrollY;
                var sectionBottom = sectionTop + rect.height;

                // Consider section active if it's in the middle of viewport or takes up significant space
                if (sectionTop <= scrollY + viewportHeight * 0.5 && sectionBottom > scrollY + viewportHeight * 0.3) {
                    activeSection = section;
                }
            });

            // If no section is in the middle, use the section at the top of viewport
            if (!activeSection && sections.length > 0) {
                var topSection = sections.reduce(function (closest, section) {
                    var rect = section.getBoundingClientRect();
                    var sectionTop = rect.top + scrollY;
                    return Math.abs(sectionTop - scrollY) < Math.abs(closest.top - scrollY) 
                        ? { top: sectionTop, section: section } 
                        : closest;
                }, { top: Infinity, section: null }).section;
                activeSection = topSection;
            }

            // Update active states
            navLinks.forEach(function (link) {
                var id = link.getAttribute('href').substring(1);
                var section = document.getElementById(id);
                if (section === activeSection) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        // Update on scroll and resize
        window.addEventListener('scroll', updateActiveNav);
        window.addEventListener('resize', updateActiveNav);
        
        // Initial update
        updateActiveNav();

        // Smooth scroll for navigation links
        navLinks.forEach(function (link) {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                var id = link.getAttribute('href').substring(1);
                var section = document.getElementById(id);
                if (section) {
                    var headerHeight = document.querySelector('header').offsetHeight;
                    var sectionTop = section.offsetTop - headerHeight - 20;
                    window.scrollTo({ top: sectionTop, behavior: 'smooth' });
                }
            });
        });
    })();

})();
