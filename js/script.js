/* ==========================================================================
   Gaming Hub — script.js
   All interactivity for the site: auth (localStorage-based demo), favorites,
   search/filter, toasts, header, mobile menu, scroll reveal, hero spotlight,
   animated counters, countdown timer, card tilt, and the trending carousel.
   ========================================================================== */

(function () {
    'use strict';

    // Small helper to build an inline icon that references the sprite in index.html
    function iconMarkup(id, extraClass) {
        return `<svg class="icon${extraClass ? ' ' + extraClass : ''}" aria-hidden="true"><use href="#icon-${id}"></use></svg>`;
    }

    // ============ Local DB & Auth Variables ============
    let users = JSON.parse(localStorage.getItem('gh_users')) || [];
    let currentUser = JSON.parse(localStorage.getItem('gh_currentUser')) || null;

    // ============ Toast Functionality ============
    const TOAST_ICON_MAP = { info: 'info', success: 'check-circle', error: 'alert', favorite: 'heart-filled' };

    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');

        let accentClass = 'toast--info';
        if (type === 'success') accentClass = 'toast--success';
        else if (type === 'error') accentClass = 'toast--error';
        else if (type === 'favorite') accentClass = 'toast--favorite';

        toast.className = `toast ${accentClass}`;
        const iconId = TOAST_ICON_MAP[type] || 'info';

        toast.innerHTML = `
            ${iconMarkup(iconId, 'toast__icon')}
            <div class="toast__message">${message}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
    }

    // ============ Modal Control ============
    const loginModal = document.getElementById('login-modal');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const modalSubtitle = document.getElementById('modal-subtitle');
    let triggerSourceBtn = null;

    function openModal(defaultTab, sourceBtn) {
        defaultTab = defaultTab || 'login';
        sourceBtn = sourceBtn || null;
        triggerSourceBtn = sourceBtn;
        loginModal.classList.remove('hidden');
        setTimeout(() => {
            loginModal.classList.add('modal-active');
            switchTab(defaultTab);
        }, 10);
    }

    function closeModal() {
        loginModal.classList.remove('modal-active');
        setTimeout(() => {
            loginModal.classList.add('hidden');
        }, 300);
    }

    function switchTab(tab) {
        if (tab === 'login') {
            tabLogin.className = 'auth-tab auth-tab--active';
            tabRegister.className = 'auth-tab';
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
            modalSubtitle.innerText = 'Join the ultimate gaming platform';
        } else {
            tabRegister.className = 'auth-tab auth-tab--active';
            tabLogin.className = 'auth-tab';
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            modalSubtitle.innerText = 'Create a free account to track favorites';
        }
    }

    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    tabLogin.addEventListener('click', () => switchTab('login'));
    tabRegister.addEventListener('click', () => switchTab('register'));

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ident = document.getElementById('login-identifier').value.trim();
        const pass = document.getElementById('login-password').value;

        const user = users.find(u => (u.username === ident || u.email === ident) && u.password === pass);
        if (user) {
            currentUser = { username: user.username, email: user.email, favorites: user.favorites || [] };
            localStorage.setItem('gh_currentUser', JSON.stringify(currentUser));
            showToast(`Welcome back, ${user.username}!`, 'success');
            closeModal();
            updateHeader();
            updateFavoritesUI();

            if (triggerSourceBtn) {
                const gameId = triggerSourceBtn.getAttribute('data-game-id');
                if (gameId) {
                    setTimeout(() => toggleFavorite(gameId, triggerSourceBtn), 400);
                }
                triggerSourceBtn = null;
            }
        } else {
            showToast('Invalid credentials. Try again or Register!', 'error');
        }
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;

        if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            showToast('Username already registered!', 'error');
            return;
        }
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            showToast('Email address already registered!', 'error');
            return;
        }

        const newUser = { username, email, password, favorites: [] };
        users.push(newUser);
        localStorage.setItem('gh_users', JSON.stringify(users));

        currentUser = { username, email, favorites: [] };
        localStorage.setItem('gh_currentUser', JSON.stringify(currentUser));

        showToast('Registration successful! Welcome aboard.', 'success');
        closeModal();
        updateHeader();
        updateFavoritesUI();

        if (triggerSourceBtn) {
            const gameId = triggerSourceBtn.getAttribute('data-game-id');
            if (gameId) {
                setTimeout(() => toggleFavorite(gameId, triggerSourceBtn), 400);
            }
            triggerSourceBtn = null;
        }
    });

    // ============ Header (desktop + mobile) ============
    function authHTML() {
        if (currentUser) {
            return `
                <button class="icon-chip" id="header-bell-btn">
                    ${iconMarkup('bell')}
                    <span class="ping-dot"></span>
                    <span class="ping-dot ping-dot--static"></span>
                </button>
                <div class="header-divider"></div>
                <div class="user-trigger" id="user-menu-trigger">
                    <span class="user-trigger__name">${currentUser.username}</span>
                    <div class="user-trigger__avatar" style="background-image: url('./images/default-avatar.png');"></div>
                </div>
                <div id="user-dropdown" class="user-dropdown hidden">
                    <div class="user-dropdown__label">Logged in as</div>
                    <div class="user-dropdown__username">${currentUser.username}</div>
                    <div class="user-dropdown__email">${currentUser.email}</div>
                    <div class="user-dropdown__divider"></div>
                    <button id="dropdown-favs-btn" class="user-dropdown__item">
                        ${iconMarkup('heart-filled', 'user-dropdown__icon')}
                        My Favorites
                    </button>
                    <button id="logout-btn" class="user-dropdown__item user-dropdown__item--danger">
                        ${iconMarkup('logout')}
                        Log Out
                    </button>
                </div>`;
        }
        return `
            <button id="login-trigger-btn" class="btn btn--gradient">
                ${iconMarkup('login')}
                Log In
            </button>`;
    }

    function updateHeader() {
        const container = document.getElementById('header-auth-container');
        if (!container) return;
        container.innerHTML = authHTML();

        if (currentUser) {
            const menuTrigger = document.getElementById('user-menu-trigger');
            const dropdown = document.getElementById('user-dropdown');

            menuTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
            });
            document.addEventListener('click', () => dropdown.classList.add('hidden'));
            dropdown.addEventListener('click', (e) => e.stopPropagation());

            document.getElementById('dropdown-favs-btn').addEventListener('click', () => {
                dropdown.classList.add('hidden');
                document.getElementById('filter-fav-btn').click();
                document.getElementById('games-section-title').scrollIntoView({ behavior: 'smooth' });
            });

            document.getElementById('logout-btn').addEventListener('click', () => {
                currentUser = null;
                localStorage.removeItem('gh_currentUser');
                showToast('Logged out successfully.', 'info');
                updateHeader();
                updateFavoritesUI();
                document.getElementById('filter-all-btn').click();
            });

            document.getElementById('filter-fav-btn').classList.remove('hidden');
        } else {
            const loginBtn = document.getElementById('login-trigger-btn');
            if (loginBtn) loginBtn.addEventListener('click', () => openModal('login'));
            document.getElementById('filter-fav-btn').classList.add('hidden');
        }
    }

    // ============ Toggle Favorites ============
    function toggleFavorite(gameId, buttonElement) {
        if (!currentUser) {
            showToast('Log in or register to add games to favorites!', 'error');
            openModal('register', buttonElement);
            return;
        }

        const index = currentUser.favorites.indexOf(gameId);
        let activeUser = users.find(u => u.username === currentUser.username);

        if (index > -1) {
            currentUser.favorites.splice(index, 1);
            showToast('Removed from Favorites!', 'info');
        } else {
            currentUser.favorites.push(gameId);
            showToast('Added to Favorites!', 'favorite');

            const icon = buttonElement.querySelector('.icon');
            if (icon) {
                icon.classList.add('animate-heart-pulse');
                icon.addEventListener('animationend', () => {
                    icon.classList.remove('animate-heart-pulse');
                }, { once: true });
            }
        }

        if (activeUser) {
            activeUser.favorites = currentUser.favorites;
            localStorage.setItem('gh_users', JSON.stringify(users));
        }
        localStorage.setItem('gh_currentUser', JSON.stringify(currentUser));

        updateFavoritesUI();
        syncFavFilterCounts();

        if (document.getElementById('filter-fav-btn').classList.contains('btn-filter--active')) {
            applyFavoritesFilter();
        }
    }

    function updateFavoritesUI() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const gameId = btn.getAttribute('data-game-id');
            const use = btn.querySelector('svg.icon use');
            if (!use) return;

            if (currentUser && currentUser.favorites.includes(gameId)) {
                use.setAttribute('href', '#icon-heart-filled');
                btn.classList.add('is-favorited');
            } else {
                use.setAttribute('href', '#icon-heart');
                btn.classList.remove('is-favorited');
            }
        });
        syncFavFilterCounts();
    }

    function syncFavFilterCounts() {
        const countSpan = document.getElementById('fav-count');
        if (countSpan) {
            countSpan.innerText = currentUser ? currentUser.favorites.length : 0;
        }
    }

    // ============ Favorites / All Games Filter ============
    const filterAllBtn = document.getElementById('filter-all-btn');
    const filterFavBtn = document.getElementById('filter-fav-btn');
    const exploreGamesBtn = document.getElementById('explore-games-btn');

    function applyFavoritesFilter() {
        filterFavBtn.className = 'btn-filter btn-filter--active';
        filterAllBtn.className = 'btn-filter';

        let hasFavorites = false;

        document.querySelectorAll('.game-card').forEach(card => {
            const gameId = card.getAttribute('data-game-id');
            if (currentUser && currentUser.favorites.includes(gameId)) {
                card.classList.remove('hidden');
                hasFavorites = true;
            } else {
                card.classList.add('hidden');
            }
        });

        const emptyState = document.getElementById('favorites-empty-state');
        if (!hasFavorites) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
        document.getElementById('search-empty-state').classList.add('hidden');
    }

    function applyAllGamesFilter() {
        filterAllBtn.className = 'btn-filter btn-filter--active';
        filterFavBtn.className = currentUser ? 'btn-filter' : 'btn-filter hidden';

        document.querySelectorAll('.game-card').forEach(card => {
            const isExtra = card.getAttribute('data-extra-card') === 'true';
            if (isExtra) {
                card.classList.add('hidden');
            } else {
                card.classList.remove('hidden');
            }
        });
        document.getElementById('favorites-empty-state').classList.add('hidden');
        document.getElementById('search-empty-state').classList.add('hidden');
    }

    filterAllBtn.addEventListener('click', applyAllGamesFilter);
    filterFavBtn.addEventListener('click', applyFavoritesFilter);
    exploreGamesBtn.addEventListener('click', () => filterAllBtn.click());

    // ============ Search ============
    const searchInput = document.getElementById('game-search-input');
    const searchBtn = document.getElementById('game-search-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            applyAllGamesFilter();
            return;
        }

        filterAllBtn.className = 'btn-filter btn-filter--active';
        filterFavBtn.className = currentUser ? 'btn-filter' : 'btn-filter hidden';
        document.getElementById('favorites-empty-state').classList.add('hidden');

        let matchesFound = false;

        document.querySelectorAll('.game-card').forEach(card => {
            const isExtra = card.getAttribute('data-extra-card') === 'true';
            if (isExtra) {
                card.classList.add('hidden');
                return;
            }

            const title = card.getAttribute('data-game-title').toLowerCase();
            const genre = card.getAttribute('data-game-genre').toLowerCase();

            if (title.includes(query) || genre.includes(query)) {
                card.classList.remove('hidden');
                matchesFound = true;
            } else {
                card.classList.add('hidden');
            }
        });

        const emptyState = document.getElementById('search-empty-state');
        if (!matchesFound) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

        document.getElementById('games-section-title').scrollIntoView({ behavior: 'smooth' });
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        applyAllGamesFilter();
    });

    document.querySelectorAll('header a').forEach(link => {
        if (link.innerText.trim() === 'Library') {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                if (currentUser) {
                    filterFavBtn.click();
                } else {
                    filterAllBtn.click();
                }
                document.getElementById('games-section-title').scrollIntoView({ behavior: 'smooth' });
            });
        }
    });

    document.querySelectorAll('.neon-border').forEach(button => {
        button.addEventListener('mouseenter', () => {
            const icon = button.querySelector('.icon');
            if (icon) {
                icon.style.transform = 'scale(1.2) rotate(-5deg)';
                icon.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }
        });
        button.addEventListener('mouseleave', () => {
            const icon = button.querySelector('.icon');
            if (icon) icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    searchInput.addEventListener('focus', () => {
        const icon = searchInput.parentElement.querySelector('.icon');
        if (icon) icon.classList.add('animate-bounce');
    });
    searchInput.addEventListener('blur', () => {
        const icon = searchInput.parentElement.querySelector('.icon');
        if (icon) icon.classList.remove('animate-bounce');
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.favorite-btn');
        if (btn) {
            e.preventDefault();
            e.stopPropagation();
            const gameId = btn.getAttribute('data-game-id');
            toggleFavorite(gameId, btn);
        }
    });

    // ============ Mobile Menu ============
    const mobileMenu = document.getElementById('mobile-menu');
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        mobileMenu.classList.remove('hidden');
        document.getElementById('mobile-auth-container').innerHTML = authHTML();
    });
    document.getElementById('mobile-menu-close').addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));

    // ============ Newsletter button ============
    const newsletterBtn = document.getElementById('newsletter-btn');
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', () => {
            const emailInput = document.getElementById('newsletter-email');
            const email = emailInput.value.trim();
            if (!email || !email.includes('@')) {
                showToast('Enter a valid email address.', 'error');
                return;
            }
            showToast('Subscribed! Watch your inbox for new listings.', 'success');
            emailInput.value = '';
        });
    }

    // ============ Preloader ============
    window.addEventListener('load', () => {
        const pre = document.getElementById('preloader');
        if (pre) setTimeout(() => pre.classList.add('hide'), 250);
    });

    // ============ Scroll progress + header shrink + back to top ============
    const scrollProgress = document.getElementById('scroll-progress');
    const siteHeader = document.getElementById('site-header');
    const backToTop = document.getElementById('back-to-top');

    function onScrollUpdate() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = pct + '%';

        if (scrollTop > 40) {
            siteHeader.classList.add('scrolled');
        } else {
            siteHeader.classList.remove('scrolled');
        }

        if (scrollTop > 500) {
            backToTop.classList.add('is-visible');
        } else {
            backToTop.classList.remove('is-visible');
        }
    }
    window.addEventListener('scroll', onScrollUpdate, { passive: true });
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // ============ Scroll reveal (IntersectionObserver) ============
    const revealEls = document.querySelectorAll('.reveal, .reveal-scale');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => revealObserver.observe(el));

    // ============ Hero spotlight follows cursor ============
    const hero = document.getElementById('hero');
    const heroSpotlight = document.getElementById('hero-spotlight');
    if (hero && heroSpotlight) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            heroSpotlight.style.setProperty('--x', x + '%');
            heroSpotlight.style.setProperty('--y', y + '%');
        });
    }

    // ============ Animated stat counters ============
    const statEls = document.querySelectorAll('.stat-counter');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'), 10);
            const duration = 1200;
            const start = performance.now();
            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target);
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = target;
            }
            requestAnimationFrame(tick);
            statObserver.unobserve(el);
        });
    }, { threshold: 0.5 });
    statEls.forEach(el => statObserver.observe(el));

    // ============ Hot deals countdown ============
    function startCountdown() {
        const el = document.getElementById('deal-countdown');
        if (!el) return;
        let target = localStorage.getItem('gh_deal_deadline');
        const now = Date.now();
        if (!target || parseInt(target, 10) < now) {
            target = now + (1000 * 60 * 60 * 26) + (1000 * 60 * 14) + (1000 * 33); // ~26h from now
            localStorage.setItem('gh_deal_deadline', target);
        }
        target = parseInt(target, 10);

        function update() {
            const diff = Math.max(0, target - Date.now());
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            el.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            if (diff <= 0) {
                localStorage.removeItem('gh_deal_deadline');
            }
        }
        update();
        setInterval(update, 1000);
    }
    startCountdown();

    // ============ Tilt effect on game cards ============
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const rotateX = ((y / rect.height) - 0.5) * -8;
            const rotateY = ((x / rect.width) - 0.5) * 8;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ============ Trending carousel nav ============
    const trendTrack = document.getElementById('trend-track');
    const trendPrev = document.getElementById('trend-prev');
    const trendNext = document.getElementById('trend-next');
    if (trendPrev && trendNext && trendTrack) {
        trendPrev.addEventListener('click', () => trendTrack.scrollBy({ left: -320, behavior: 'smooth' }));
        trendNext.addEventListener('click', () => trendTrack.scrollBy({ left: 320, behavior: 'smooth' }));
    }

    // ============ Initialize App ============
    updateHeader();
    updateFavoritesUI();
    onScrollUpdate();
})();
