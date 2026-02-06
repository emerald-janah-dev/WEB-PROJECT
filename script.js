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

    /* Mobile menu toggle */
    var menuToggle = document.getElementById('menuToggle');
    var navMenu = document.getElementById('navMenu');
    if (menuToggle && navMenu) {

        // Close menu when a link is clicked
        var navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                navMenu.classList.remove('active');
            });
        });

        // Close menu when screen resizes to 361px or larger
        window.addEventListener('resize', function () {
            if (window.innerWidth > 360) {
                navMenu.classList.remove('active');
            }
        });
        
        // Create overlay element and attach handlers to close when clicking outside
        var navOverlay = document.createElement('div');
        navOverlay.className = 'nav-overlay';
        document.body.appendChild(navOverlay);

        function openMenu() {
            navMenu.classList.add('active');
            navOverlay.classList.add('active');
            // prevent body scroll while menu open
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            navMenu.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Update toggle to use the open/close helpers
        menuToggle.addEventListener('click', function (e) {
            if (navMenu.classList.contains('active')) closeMenu(); else openMenu();
            e.stopPropagation();
        });

        // overlay no longer captures pointer events (non-blocking); provide an explicit close button
        var navClose = document.getElementById('navClose');
        if (navClose) navClose.addEventListener('click', function () { closeMenu(); });

        // Close when clicking outside nav or pressing Escape
        document.addEventListener('click', function (e) {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) closeMenu();
        });
    }

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

    // Pop Up
    const memberCards = document.querySelectorAll('[data-target]');
    const popupClose = document.querySelectorAll('[data-close-popup]');
    const popupBackground = document.getElementById('popup-background');
    const popupFooter = document.getElementById('popup-footer');

    memberCards.forEach(card => {
        card.addEventListener('click', () => {
            const popup = document.querySelector(card.dataset.target);
            openpopup(popup);
        });
    });

    popupClose.forEach(card => {
        card.addEventListener('click', () => {
            const popup = card.closest('.popup');
            closepopup(popup);
        });
    });

    popupFooter.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            const popup = link.closest('.popup');
            closepopup(popup);
        });
    });

    function openpopup(popup){
        if (popup==null) return;
        popup.classList.add('active');
        popupBackground.classList.add('active');
    }

    function closepopup(popup){
        if (popup==null) return;
        popup.classList.remove('active');
        popupBackground.classList.remove('active');
    }

    popupBackground.addEventListener('click', () => {
        const popup=document.querySelectorAll('.popup.active');
        popup.forEach(popup => {
            closepopup(popup);
        })
    });

    //Experience Dropdown Pop Up
    const dropdowns=document.querySelectorAll('.dropdown');

    dropdowns.forEach(dropdown => {
        const select=dropdown.querySelector('.select');
        const caret=dropdown.querySelector('.caret');
        const description=dropdown.querySelector('.experience-description');

        select.addEventListener('click', () => {
            select.classList.toggle('select-clicked');
            caret.classList.toggle('caret-rotate');
            description.classList.toggle('experience-description-open');
        });
    });

    /* Mobile Menu */
    (function () {
        var mobileMenuToggle = document.getElementById('mobileMenuToggle');
        var mobileMenu = document.getElementById('mobileMenu');
        var mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        var mobileThemeToggle = document.getElementById('mobileThemeToggle');

        function toggleMobileMenu() {
            if (mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
            } else {
                mobileMenu.classList.add('active');
            }
        }

        function closeMobileMenu() {
            mobileMenu.classList.remove('active');
        }

        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        }

        // Close menu when clicking on navigation links
        mobileNavLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                // Remove any active states from all links
                mobileNavLinks.forEach(function(navLink) {
                    navLink.classList.remove('active');
                });
                closeMobileMenu();
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileMenu && mobileMenu.classList.contains('active') && 
                !mobileMenu.contains(e.target) && 
                !mobileMenuToggle.contains(e.target) &&
                !mobileThemeToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Sync mobile theme toggle with desktop theme toggle
        if (mobileThemeToggle && themeToggle) {
            mobileThemeToggle.addEventListener('click', function(e) {
                e.stopPropagation(); // Prevent event bubbling to keep dropdown open
                e.preventDefault(); // Prevent any default behavior
                themeToggle.click();
            });
            
            // Also prevent clicks on SVG elements from closing the dropdown
            const svgElements = mobileThemeToggle.querySelectorAll('svg');
            svgElements.forEach(function(svg) {
                svg.addEventListener('click', function(e) {
                    e.stopPropagation();
                    e.preventDefault();
                    themeToggle.click();
                });
            });
        }
    })();

    /* Header scroll effect */
    (function () {
        var header = document.querySelector('header');
        if (!header) return;

        function updateHeaderOnScroll() {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }

        // Update on scroll
        window.addEventListener('scroll', updateHeaderOnScroll);
        
        // Initial check
        updateHeaderOnScroll();
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

        //hello
        
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

    // Carousel scroll controls
    (function() {
        var grid = document.getElementById('projectsGrid');
        var btnLeft = document.getElementById('scrollLeft');
        var btnRight = document.getElementById('scrollRight');

        if (!grid || !btnLeft || !btnRight) return;

        function updateButtons() {
            var hasScrollLeft = grid.scrollLeft > 0;
            var hasScrollRight = grid.scrollLeft < grid.scrollWidth - grid.clientWidth - 10;

            btnLeft.disabled = !hasScrollLeft;
            btnRight.disabled = !hasScrollRight;
        }

        function scroll(direction) {
            var scrollAmount = 350;
            var newScrollLeft = direction === 'left'
                ? grid.scrollLeft - scrollAmount
                : grid.scrollLeft + scrollAmount;

            grid.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
        }

        btnLeft.addEventListener('click', function() { scroll('left'); });
        btnRight.addEventListener('click', function() { scroll('right'); });
        grid.addEventListener('scroll', updateButtons);

        // Initial state
        updateButtons();

        // Throttle helper for smooth performance
        function throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }

        // 3D Tilt effect on cards
        var cards = document.querySelectorAll('.project-card');
        cards.forEach(function(card) {
            const throttledTilt = throttle(function(e) {
                var rect = card.getBoundingClientRect();
                var x = e.clientX - rect.left;
                var y = e.clientY - rect.top;

                var rotateY = ((x / rect.width) - 0.5) * 30;
                var rotateX = -((y / rect.height) - 0.5) * 30;

                card.style.setProperty('--rotateX', rotateX + 'deg');
                card.style.setProperty('--rotateY', rotateY + 'deg');
            }, 16);  // ~60fps throttle

            card.addEventListener('mousemove', throttledTilt, { passive: true });

            card.addEventListener('mouseleave', function() {
                card.style.setProperty('--rotateX', '0deg');
                card.style.setProperty('--rotateY', '0deg');
            });
        });
    })();

    /* Flip card functionality */
    (function() {
        var projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(function(card) {
            card.addEventListener('click', function() {
                this.classList.toggle('flipped');
            });
        });
    })();

})();
