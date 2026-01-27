/* ===================================
   AutoDrive Premium - JavaScript
   =================================== */

// DOM Elements
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');
const bookingModal = document.getElementById('bookingModal');
const backToTop = document.getElementById('backToTop');
const filterBtns = document.querySelectorAll('.filter-btn');
const carCards = document.querySelectorAll('.car-card');
const imageLightbox = document.getElementById('imageLightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxClose = document.getElementById('lightboxClose');
const transactionCards = document.querySelectorAll('.trans-card');

// ===================================
// Initialize AOS (Animate On Scroll)
// ===================================
AOS.init({
    duration: 800,
    easing: 'ease-out',
    once: true,
    offset: 100
});

// ===================================
// Initialize Flatpickr Date Pickers
// ===================================
let pickupDatePicker;

function initDatePickers() {
    const pickupInput = document.getElementById('pickupDate');
    if (!pickupInput) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Common config
    const baseConfig = {
        locale: 'vn',
        dateFormat: 'd/m/Y',
        minDate: today,
        disableMobile: true,
        animate: true,
        monthSelectorType: 'dropdown',
        prevArrow: '<i class="fas fa-chevron-left"></i>',
        nextArrow: '<i class="fas fa-chevron-right"></i>',
    };

    // Pickup date picker
    pickupDatePicker = flatpickr(pickupInput, {
        ...baseConfig,
        onChange: function () {
            updateBookingTotal();
        }
    });
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initDatePickers);

function formatVndShort(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/[^0-9]/g, ''), 10);
    if (!Number.isFinite(num) || num < 0) return '';

    return num.toLocaleString('vi-VN');
}

function initMoneyValues() {
    document.querySelectorAll('.money-value[data-amount]').forEach(el => {
        const raw = el.getAttribute('data-amount');
        const formatted = formatVndShort(raw);
        if (formatted) el.textContent = formatted;
    });
}

document.addEventListener('DOMContentLoaded', initMoneyValues);

function maskPhoneLast4(phone) {
    const digits = String(phone).replace(/[^0-9]/g, '');
    const last4 = digits.slice(-4);
    return last4 ? `****${last4}` : '****';
}

function getRankMetaByAmount(amount) {
    const num = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/[^0-9]/g, ''), 10);
    const safe = Number.isFinite(num) ? num : 0;

    if (safe >= 20000000) {
        return { label: 'Thách Đấu', icon: 'image/thachdau.png', tierClass: 'tier-conqueror' };
    }
    if (safe >= 10000000) {
        return { label: 'Cao Thủ', icon: 'image/caothu.png', tierClass: 'tier-master' };
    }
    if (safe >= 5000000) {
        return { label: 'Kim Cương', icon: 'image/kimcuong.png', tierClass: 'tier-diamond' };
    }
    if (safe >= 3000000) {
        return { label: 'Bạch Kim', icon: 'image/bachkim.png', tierClass: 'tier-platinum' };
    }
    if (safe >= 1000000) {
        return { label: 'Vàng', icon: 'image/vang.png', tierClass: 'tier-gold' };
    }
    return { label: 'Bạc', icon: 'image/bac.png', tierClass: 'tier-silver' };
}

function createDemoCustomer(index) {
    const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Võ', 'Phan', 'Đặng', 'Bùi', 'Đỗ'];
    const middleNames = ['Minh', 'Quốc', 'Thảo', 'Hải', 'Gia', 'Anh', 'Tuấn', 'Ngọc', 'Khánh', 'Thanh'];
    const lastNames = ['An', 'Vy', 'Huy', 'Linh', 'Nam', 'Khang', 'My', 'Hà', 'Sơn', 'Trang'];

    const name = `${firstNames[index % firstNames.length]} ${middleNames[index % middleNames.length]} ${lastNames[index % lastNames.length]}`;

    const phoneBase = 900000000 + (index * 7919) % 99999999;
    const phone = '0' + String(phoneBase).padStart(9, '0');

    const trips = 2 + (index % 18);
    const days = 3 + (index % 27);

    const pricePerDay = 600000 + ((index * 137) % 1900000);
    const amount = days * pricePerDay;

    return { name, phone, trips, days, amount };
}

let customerRankingData = [];

const CUSTOMER_TABLE_START_TOP = 1;
const CUSTOMER_TABLE_MAX_ROWS = 20;
const CUSTOMER_TABLE_END_TOP = CUSTOMER_TABLE_START_TOP + CUSTOMER_TABLE_MAX_ROWS - 1;

let currentCustomerSort = 'money';

function renderCustomerRankingTable(data) {
    const tbody = document.getElementById('customerRankingTableBody');
    if (!tbody) return;

    const rows = data.map((c, idx) => {
        const rank = getRankMetaByAmount(c.amount);
        const moneyText = formatVndShort(c.amount);
        const displayTop = idx + 1;
        return `
            <tr>
                <td class="col-top">${displayTop}</td>
                <td class="col-name">${c.name}</td>
                <td class="col-phone">${maskPhoneLast4(c.phone)}</td>
                <td class="col-trips">${c.trips}</td>
                <td class="col-days">${c.days}</td>
                <td class="col-money">${moneyText}</td>
                <td class="col-rank">
                    <div class="rank-cell">
                        <img class="rank-icon" src="${rank.icon}" alt="${rank.label}">
                        <span class="rank-text">${rank.label}</span>
                    </div>
                </td>
            </tr>
        `;
    });

    tbody.innerHTML = rows.join('');
}

function updateVipCards(sortedData) {
    const cards = [
        document.querySelector('.ranking-card.rank-1'),
        document.querySelector('.ranking-card.rank-2'),
        document.querySelector('.ranking-card.rank-3'),
    ];

    cards.forEach((card, i) => {
        const c = sortedData[i];
        if (!card || !c) return;

        const nameEl = card.querySelector('.ranking-info h3');
        if (nameEl) nameEl.textContent = c.name;

        const phoneEl = card.querySelector('.ranking-rating span');
        if (phoneEl) phoneEl.textContent = `SDT: ${maskPhoneLast4(c.phone)}`;

        const statValues = card.querySelectorAll('.ranking-stat .stat-value');
        if (statValues.length >= 3) {
            statValues[0].textContent = String(c.trips);
            statValues[1].textContent = String(c.days);

            statValues[2].classList.add('money-value');
            statValues[2].setAttribute('data-amount', String(c.amount));
            statValues[2].textContent = formatVndShort(c.amount);
        }

        const tierBadge = card.querySelector('.ranking-medal .tier-badge');
        const rank = getRankMetaByAmount(c.amount);
        if (tierBadge) {
            tierBadge.className = `tier-badge ${rank.tierClass}`;
            tierBadge.textContent = rank.label;
        }

        const corner = card.querySelector('.corner-rank');
        if (corner) {
            corner.style.setProperty('--corner-rank-icon', `url('${rank.icon}')`);
        }
    });
}

function applyCustomerRankingTable() {
    const searchInput = document.getElementById('customerSearch');

    const q = (searchInput?.value || '').trim().toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    const sort = currentCustomerSort;

    let data = customerRankingData;

    if (q) {
        data = data.filter(c => {
            const nameMatch = c.name.toLowerCase().includes(q);

            const phoneDigits = String(c.phone || '').replace(/\D/g, '');
            const phoneMatch = qDigits ? phoneDigits.includes(qDigits) : false;

            return nameMatch || phoneMatch;
        });
    }

    data = [...data];
    if (sort === 'trips') {
        data.sort((a, b) => b.trips - a.trips);
    } else if (sort === 'days') {
        data.sort((a, b) => b.days - a.days);
    } else {
        data.sort((a, b) => b.amount - a.amount);
    }

    data = data.slice(0, CUSTOMER_TABLE_MAX_ROWS);

    renderCustomerRankingTable(data);
    updateVipCards(data);
}

function initCustomerRankingTable() {
    const tbody = document.getElementById('customerRankingTableBody');
    if (!tbody) return;

    customerRankingData = [];
    for (let top = CUSTOMER_TABLE_START_TOP; top <= CUSTOMER_TABLE_END_TOP; top += 1) {
        const c = createDemoCustomer(top);
        customerRankingData.push({
            top,
            name: c.name,
            phone: c.phone,
            trips: c.trips,
            days: c.days,
            amount: c.amount,
        });
    }

    const searchInput = document.getElementById('customerSearch');
    if (searchInput) searchInput.addEventListener('input', applyCustomerRankingTable);

    const sortButtons = document.querySelectorAll('.sort-btn[data-sort]');
    sortButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentCustomerSort = btn.getAttribute('data-sort') || 'money';
            sortButtons.forEach(b => b.classList.remove('is-active'));
            btn.classList.add('is-active');
            applyCustomerRankingTable();
        });
    });

    applyCustomerRankingTable();
}

document.addEventListener('DOMContentLoaded', initCustomerRankingTable);

// ===================================
// Initialize Hero Banner Swiper
// ===================================
const heroSwiper = new Swiper('.hero-swiper', {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },
    speed: 600,
    watchSlidesProgress: true,
    pagination: {
        el: '.hero-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.hero-btn-next',
        prevEl: '.hero-btn-prev',
    },
});

// ===================================
// Initialize Swiper
// ===================================
const testimonialsSwiper = new Swiper('.testimonials-swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: true,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    breakpoints: {
        640: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    }
});

// ===================================
// Initialize Featured Cars Swiper
// ===================================
const featuredSwiper = new Swiper('.featured-swiper', {
    slidesPerView: 1,
    spaceBetween: 25,
    loop: true,
    centeredSlides: false,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
    },
    pagination: {
        el: '.swiper-pagination-featured',
        clickable: true,
        dynamicBullets: true,
    },
    navigation: {
        nextEl: '.swiper-button-next-featured',
        prevEl: '.swiper-button-prev-featured',
    },
    grabCursor: true,
    breakpoints: {
        480: {
            slidesPerView: 1,
        },
        640: {
            slidesPerView: 2,
        },
        900: {
            slidesPerView: 3,
        },
        1200: {
            slidesPerView: 3,
            spaceBetween: 25,
        },
    }
});

// ===================================
// Initialize Types Swiper
// ===================================
const typesSwiper = new Swiper('.types-swiper', {
    slidesPerView: 2,
    spaceBetween: 15,
    loop: true,
    grid: {
        rows: 2,
        fill: 'row',
    },
    pagination: {
        el: '.swiper-pagination-types',
        clickable: true,
    },
    breakpoints: {
        480: {
            slidesPerView: 2,
            grid: {
                rows: 2,
            },
            spaceBetween: 15,
        },
        640: {
            slidesPerView: 3,
            grid: {
                rows: 2,
            },
            spaceBetween: 20,
        },
        900: {
            slidesPerView: 4,
            grid: {
                rows: 2,
            },
            spaceBetween: 20,
        },
    }
});

// ===================================
// Initialize Brands Swiper
// ===================================
const brandsSwiper = new Swiper('.brands-swiper', {
    slidesPerView: 3,
    spaceBetween: 15,
    loop: true,
    navigation: {
        nextEl: '.swiper-button-next-brands',
        prevEl: '.swiper-button-prev-brands',
    },
    breakpoints: {
        480: {
            slidesPerView: 4,
        },
        640: {
            slidesPerView: 5,
        },
        900: {
            slidesPerView: 7,
        },
        1200: {
            slidesPerView: 9,
        },
    }
});

// ===================================
// Contact Swiper (Mobile)
// ===================================
let contactSwiper;
let faqSwiper;

function setupContactSwiperDom(container) {
    if (container.dataset.swiperReady === '1') return;

    const items = [...container.querySelectorAll('.c-col-item')];
    if (items.length === 0) return;

    container.classList.add('swiper', 'contact-swiper');

    const wrapper = document.createElement('div');
    wrapper.className = 'swiper-wrapper';

    items.forEach(item => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.appendChild(item);
        wrapper.appendChild(slide);
    });

    container.appendChild(wrapper);

    const pagination = document.createElement('div');
    pagination.className = 'swiper-pagination contact-pagination';
    container.appendChild(pagination);

    container.dataset.swiperReady = '1';
}

function teardownContactSwiperDom(container) {
    if (container.dataset.swiperReady !== '1') return;

    const slides = [...container.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide')];
    const items = slides.map(s => s.querySelector('.c-col-item')).filter(Boolean);

    const wrapper = container.querySelector(':scope > .swiper-wrapper');
    const pagination = container.querySelector(':scope > .swiper-pagination');
    if (pagination) pagination.remove();
    if (wrapper) wrapper.remove();

    items.forEach(item => container.appendChild(item));

    container.classList.remove('swiper', 'contact-swiper');
    delete container.dataset.swiperReady;
}

function initOrUpdateContactSwiper() {
    const container = document.querySelector('.contact-3-cols-wrapper');
    if (!container) return;

    const isMobile = window.matchMedia('(max-width: 900px)').matches;

    if (isMobile) {
        setupContactSwiperDom(container);
        if (!contactSwiper) {
            contactSwiper = new Swiper('.contact-swiper', {
                slidesPerView: 1.1,
                spaceBetween: 16,
                centeredSlides: false,
                loop: false,
                pagination: {
                    el: '.contact-pagination',
                    clickable: true,
                },
                breakpoints: {
                    480: {
                        slidesPerView: 1,
                    },
                    640: {
                        slidesPerView: 1,
                    },
                },
            });
        }
    } else {
        if (contactSwiper) {
            contactSwiper.destroy(true, true);
            contactSwiper = undefined;
        }
        teardownContactSwiperDom(container);
    }
}

window.addEventListener('resize', initOrUpdateContactSwiper);
initOrUpdateContactSwiper();

// ===================================
// FAQ Swiper (Mobile)
// ===================================
function setupFaqSwiperDom(container) {
    if (container.dataset.swiperReady === '1') return;

    const items = [...container.querySelectorAll('.faq-item')];
    if (items.length === 0) return;

    container.classList.add('swiper', 'faq-swiper');

    const wrapper = document.createElement('div');
    wrapper.className = 'swiper-wrapper';

    const groupSize = 4;
    for (let i = 0; i < items.length; i += groupSize) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';

        const chunk = items.slice(i, i + groupSize);
        chunk.forEach(item => slide.appendChild(item));

        wrapper.appendChild(slide);
    }

    container.appendChild(wrapper);

    container.dataset.swiperReady = '1';
}

function teardownFaqSwiperDom(container) {
    if (container.dataset.swiperReady !== '1') return;

    const slides = [...container.querySelectorAll(':scope > .swiper-wrapper > .swiper-slide')];
    const items = slides.flatMap(s => [...s.querySelectorAll('.faq-item')]).filter(Boolean);

    const wrapper = container.querySelector(':scope > .swiper-wrapper');
    const pagination = container.querySelector(':scope > .swiper-pagination');
    if (pagination) pagination.remove();
    if (wrapper) wrapper.remove();

    items.forEach(item => container.appendChild(item));

    container.classList.remove('swiper', 'faq-swiper');
    delete container.dataset.swiperReady;
}

function initOrUpdateFaqSwiper() {
    const container = document.querySelector('.faq-accordion');
    if (!container) return;

    const isMobile = window.matchMedia('(max-width: 900px)').matches;

    if (isMobile) {
        setupFaqSwiperDom(container);
        if (!faqSwiper) {
            faqSwiper = new Swiper('.faq-swiper', {
                slidesPerView: 1,
                spaceBetween: 16,
                centeredSlides: false,
                loop: false,
                autoHeight: true,
            });
        } else {
            faqSwiper.update();
            faqSwiper.updateAutoHeight(0);
        }
    } else {
        if (faqSwiper) {
            faqSwiper.destroy(true, true);
            faqSwiper = undefined;
        }
        teardownFaqSwiperDom(container);
    }
}

window.addEventListener('resize', initOrUpdateFaqSwiper);
initOrUpdateFaqSwiper();

// ===================================
// Image Lightbox for Transactions
// ===================================
transactionCards.forEach(card => {
    card.addEventListener('click', () => {
        const img = card.querySelector('img');
        if (img) {
            lightboxImage.src = img.src;
            imageLightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    });
});

lightboxClose.addEventListener('click', () => {
    imageLightbox.classList.remove('active');
    document.body.style.overflow = '';
});

imageLightbox.addEventListener('click', (e) => {
    if (e.target === imageLightbox) {
        imageLightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && imageLightbox.classList.contains('active')) {
        imageLightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ===================================
// Navbar Scroll Effect
// ===================================
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    // Add/remove scrolled class
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Show/hide back to top button
    if (currentScroll > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }

    lastScroll = currentScroll;
});

// ===================================
// Mobile Menu Toggle
// ===================================
mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===================================
// Active Navigation Link
// ===================================
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollPos = window.scrollY + 200;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// ===================================
// Smooth Scroll
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Back to top button
backToTop.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ===================================
// Car Filter
// ===================================
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        // Filter cars with animation
        carCards.forEach((card, index) => {
            const category = card.dataset.category;

            if (filter === 'all' || category === filter) {
                card.classList.remove('hidden');
                card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s forwards`;
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// Add fadeInUp animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// ===================================
// Booking Modal
// ===================================
function openBookingModal(carName = '') {
    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const selectedCarName = document.getElementById('selectedCarName');
    if (selectedCarName) {
        if (carName) {
            selectedCarName.textContent = `Xe đã chọn: ${carName}`;
        } else {
            selectedCarName.textContent = 'Điền thông tin để đặt xe nhanh chóng';
        }
    }

    const carSelect = document.getElementById('carSelect');
    if (carSelect && carName) {
        const optionToSelect = [...carSelect.options].find(o => o.value === carName);
        if (optionToSelect) carSelect.value = carName;
    }

    updateBookingTotal();
}

function closeBookingModal() {
    bookingModal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookingModal.classList.contains('active')) {
        closeBookingModal();
    }
});

// ===================================
// Form Handling
// ===================================
// Booking Form
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Simple validation
        if (!data.fullname || !data.phone || !data.pickup_date || !data.rentalDays || !data.carSelect) {
            showNotification('Vui lòng điền đầy đủ thông tin bắt buộc!', 'error');
            return;
        }

        const days = parseInt(String(data.rentalDays), 10);
        if (!Number.isFinite(days) || days < 1) {
            showNotification('Số ngày thuê không hợp lệ!', 'error');
            return;
        }

        // Phone validation
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(data.phone.replace(/\s/g, ''))) {
            showNotification('Số điện thoại không hợp lệ!', 'error');
            return;
        }

        // Success - In real app, send to server
        console.log('Booking Data:', data);
        showNotification('Đặt xe thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.', 'success');
        closeBookingModal();
        this.reset();
        updateBookingTotal();
    });
}

function parseNumber(value) {
    const num = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(num) ? num : 0;
}

function formatVnd(amount) {
    const n = parseNumber(amount);
    return n.toLocaleString('vi-VN') + 'đ';
}

function getSelectedCarPricePerDay() {
    const carSelect = document.getElementById('carSelect');
    if (!carSelect) return 0;

    const opt = carSelect.options[carSelect.selectedIndex];
    if (!opt) return 0;
    return parseNumber(opt.getAttribute('data-price'));
}

function getSelectedCarName() {
    const carSelect = document.getElementById('carSelect');
    if (!carSelect) return '';
    const v = carSelect.value || '';
    return String(v).trim();
}

function getBookingFee() {
    return 0;
}

function updateBookingTotal() {
    const totalEl = document.getElementById('bookingTotalAmount');
    if (!totalEl) return;

    const daysInput = document.getElementById('rentalDays');
    const days = parseInt(daysInput?.value || '0', 10);
    const pricePerDay = getSelectedCarPricePerDay();

    const carTextEl = document.getElementById('bookingCarText');
    const priceTextEl = document.getElementById('bookingPricePerDayText');
    const daysTextEl = document.getElementById('bookingDaysText');
    const feeTextEl = document.getElementById('bookingFeeText');

    const carName = getSelectedCarName();
    const fee = getBookingFee();

    if (carTextEl) carTextEl.textContent = carName || 'Chưa chọn';
    if (daysTextEl) daysTextEl.textContent = Number.isFinite(days) && days > 0 ? String(days) : '0';
    if (feeTextEl) feeTextEl.textContent = fee > 0 ? `${formatVnd(fee)} (có)` : '0đ (không)';

    if (!pricePerDay) {
        if (priceTextEl) priceTextEl.textContent = 'Liên hệ';
        totalEl.textContent = 'Liên hệ';
        return;
    }

    if (priceTextEl) priceTextEl.textContent = formatVnd(pricePerDay);

    if (!Number.isFinite(days) || days <= 0) {
        totalEl.textContent = '0đ';
        return;
    }

    totalEl.textContent = formatVnd(pricePerDay * days + fee);
}

document.addEventListener('DOMContentLoaded', () => {
    const daysInput = document.getElementById('rentalDays');
    const carSelect = document.getElementById('carSelect');
    if (daysInput) daysInput.addEventListener('input', updateBookingTotal);
    if (carSelect) carSelect.addEventListener('change', updateBookingTotal);
});

// Contact Form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (!name || !phone || !email || !message) {
            showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }

        // Success
        showNotification('Gửi tin nhắn thành công! Cảm ơn bạn đã liên hệ.', 'success');
        this.reset();
    });
}

// ===================================
// Notification System
// ===================================
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotif = document.querySelector('.notification');
    if (existingNotif) {
        existingNotif.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
        <button class="notif-close"><i class="fas fa-times"></i></button>
    `;

    // Add styles
    const notifStyle = document.createElement('style');
    notifStyle.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 18px 25px;
            background: rgba(26, 26, 46, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 3000;
            animation: slideIn 0.5s ease;
            backdrop-filter: blur(10px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }
        .notification.success {
            border-left: 4px solid #2ed573;
        }
        .notification.success i:first-child {
            color: #2ed573;
            font-size: 1.3rem;
        }
        .notification.error {
            border-left: 4px solid #ff4757;
        }
        .notification.error i:first-child {
            color: #ff4757;
            font-size: 1.3rem;
        }
        .notification span {
            color: #fff;
            font-size: 0.95rem;
        }
        .notif-close {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.5);
            cursor: pointer;
            padding: 5px;
            margin-left: 10px;
        }
        .notif-close:hover {
            color: #fff;
        }
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(notifStyle);

    document.body.appendChild(notification);

    // Close button
    notification.querySelector('.notif-close').addEventListener('click', () => {
        notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===================================
// Stats Counter Animation
// ===================================
function animateCounter(element, target) {
    let current = 0;
    const increment = target / 50;
    const duration = 2000;
    const stepTime = duration / 50;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, stepTime);
}

// Intersection Observer for stats
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(stat => {
                const target = parseInt(stat.dataset.count);
                animateCounter(stat, target);
            });
            statsObserver.disconnect();
        }
    });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    statsObserver.observe(heroStats);
}

// ===================================
// Car Detail Modal (Quick View)
// ===================================
function openCarDetail(carId) {
    // In a real app, fetch car details from server
    const carDetails = {
        vf3: {
            name: 'VinFast VF 3',
            price: '600.000đ/ngày',
            image: 'https://vinfast-daklak.com.vn/wp-content/uploads/2023/10/icon-san-pham-vinfast-vf-3-nhuanads.com_.jpg',
            specs: {
                seats: '4 chỗ',
                transmission: 'Tự động',
                fuel: 'Điện',
                engine: 'Môtơ điện'
            },
            features: ['Nhỏ gọn', 'Dễ di chuyển', 'Tiết kiệm', 'Màn hình cảm ứng', 'Sạc nhanh']
        },
        vf5: {
            name: 'VinFast VF 5',
            price: '800.000đ/ngày',
            image: 'https://vinfast-daklak.com.vn/wp-content/uploads/2023/10/icon-san-pham-vinfast-nhuanads.com-1.jpg',
            specs: {
                seats: '5 chỗ',
                transmission: 'Tự động',
                fuel: 'Điện',
                engine: '100 kW'
            },
            features: ['Trợ lý ảo', 'Cảnh báo điểm mù', 'Camera lùi', 'Kiểm soát hành trình', '6 túi khí']
        },
        vf6: {
            name: 'VinFast VF 6',
            price: '1.000.000đ/ngày',
            image: 'https://vinfast-daklak.com.vn/wp-content/uploads/2023/10/icon-san-pham-vinfast-nhuanads.com-6.jpg',
            specs: {
                seats: '5 chỗ',
                transmission: 'Tự động',
                fuel: 'Điện',
                engine: '130-150 kW'
            },
            features: ['Nội thất cao cấp', 'Màn hình 12.9 inch', 'ADAS cấp 2', 'Cửa sổ trời', 'Lọc không khí']
        },
        vf7: {
            name: 'VinFast VF 7',
            price: '1.200.000đ/ngày',
            image: 'https://vinfast-daklak.com.vn/wp-content/uploads/2023/10/icon-san-pham-vinfast-nhuanads.com-6.jpg',
            specs: {
                seats: '5 chỗ',
                transmission: 'Tự động',
                fuel: 'Điện',
                engine: '130-260 kW'
            },
            features: ['Thiết kế tương lai', 'HUD', 'Ghế da Nappa', 'Tự lái cấp 2', 'Âm thanh vòm']
        },
        vf8: {
            name: 'VinFast VF 8',
            price: '1.500.000đ/ngày',
            image: 'https://vinfast-daklak.com.vn/wp-content/uploads/2023/10/icon-san-pham-vinfast-nhuanads.com-3.jpg',
            specs: {
                seats: '5 chỗ',
                transmission: 'Tự động',
                fuel: 'Điện',
                engine: '300 kW'
            },
            features: ['Smart Services', 'Màn hình 15.6 inch', 'Kết nối thông minh', 'Ghế sưởi/làm mát', 'Cửa sổ trời toàn cảnh']
        },
        vf9: {
            name: 'VinFast VF 9',
            price: '2.500.000đ/ngày',
            image: 'https://vinfast-daklak.com.vn/wp-content/uploads/2023/10/icon-san-pham-vinfast-nhuanads.com-4.jpg',
            specs: {
                seats: '7 chỗ',
                transmission: 'Tự động',
                fuel: 'Điện',
                engine: '300 kW'
            },
            features: ['Ghế thương gia', 'Massage', 'Màn hình giải trí sau', 'Tủ lạnh mini', 'Không gian rộng rãi']
        },
        limogreen: {
            name: 'Limo Green',
            price: 'Liên hệ',
            image: 'https://vinfast-daklak.com.vn/wp-content/uploads/2025/04/limo-green-icon-nhuanads.com_.jpg',
            specs: {
                seats: '5/7 chỗ',
                transmission: 'Tự động',
                fuel: 'Điện',
                engine: 'Vận hành êm'
            },
            features: ['Đưa đón tận nơi', 'Tài xế chuyên nghiệp', 'Wifi miễn phí', 'Nước uống', 'Dịch vụ VIP']
        }
    };

    // For demo, just open booking modal with car name
    const car = carDetails[carId];
    if (car) {
        openBookingModal(car.name);
    } else {
        showNotification('Đang cập nhật thông tin xe...', 'success');
    }
}

// ===================================
// Particles Effect (Hero Background)
// ===================================
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;

    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255, 215, 0, ${Math.random() * 0.5 + 0.2});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }

    // Add float animation
    const floatStyle = document.createElement('style');
    floatStyle.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0) translateX(0);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(floatStyle);
}

createParticles();

// ===================================
// Newsletter Form
// ===================================
const newsletterForm = document.querySelector('.newsletter-form');
if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = this.querySelector('input').value;

        if (!email || !email.includes('@')) {
            showNotification('Vui lòng nhập email hợp lệ!', 'error');
            return;
        }

        showNotification('Đăng ký nhận tin thành công!', 'success');
        this.reset();
    });
}

// ===================================
// FAQ Accordion Functionality
// ===================================
const faqItems = document.querySelectorAll('.faq-item');

if (faqItems.length > 0) {
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        header.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    const otherContent = otherItem.querySelector('.faq-content');
                    otherContent.style.maxHeight = null;
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            const content = item.querySelector('.faq-content');
            if (item.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
            } else {
                content.style.maxHeight = null;
            }

            if (faqSwiper) {
                const isOpening = item.classList.contains('active');

                requestAnimationFrame(() => {
                    faqSwiper.update();
                    faqSwiper.updateAutoHeight(0);
                });

                setTimeout(() => {
                    if (!faqSwiper) return;
                    faqSwiper.update();
                    faqSwiper.updateAutoHeight(0);

                    if (isOpening) {
                        item.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                            inline: 'nearest'
                        });
                    }
                }, 350);
            }
        });
    });
}

// ===================================
// Expose functions globally
// ===================================
window.openBookingModal = openBookingModal;
window.closeBookingModal = closeBookingModal;
window.openCarDetail = openCarDetail;
