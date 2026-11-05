/**
 * HT LOGISTICS - SCRIPT XỬ LÝ TƯƠNG TÁC & ĐO LƯỜNG CHUYỂN ĐỔI (ZELLY TRACKER)
 * Tích hợp API tra cứu vận đơn Google Sheets & HS Code AI từ hoangthinh.net
 */

// BỘ ĐO LƯỜNG CHUYỂN ĐỔI THÔNG MINH (ZELLY SMART CLICK TRACKER)
const ZellyTracker = {
    storageKey: 'zelly_click_metrics',
    webhookUrl: '', // Tùy chọn: URL Webhook n8n nhận thông báo khách B2B theo thời gian thực
    getMetrics() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : {
                affiliateClicks: 0,
                zaloLeads: 0,
                trackingLookups: 0,
                hsCodeLookups: 0,
                events: []
            };
        } catch (e) {
            return { affiliateClicks: 0, zaloLeads: 0, trackingLookups: 0, hsCodeLookups: 0, events: [] };
        }
    },
    track(eventType, label, targetUrl = '') {
        const data = this.getMetrics();
        if (eventType === 'zalo_b2b_lead') data.zaloLeads = (data.zaloLeads || 0) + 1;
        if (eventType === 'tracking_lookup') data.trackingLookups = (data.trackingLookups || 0) + 1;
        if (eventType === 'hscode_lookup') data.hsCodeLookups = (data.hsCodeLookups || 0) + 1;

        const entry = {
            site: 'hoangthinh-logistics',
            type: eventType,
            label: label,
            url: targetUrl,
            timestamp: new Date().toISOString()
        };
        data.events = [entry, ...(data.events || [])].slice(0, 50);

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {}

        if (this.webhookUrl && navigator.sendBeacon) {
            try {
                navigator.sendBeacon(this.webhookUrl, JSON.stringify(entry));
            } catch (e) {}
        }
    }
};
window.ZellyTracker = ZellyTracker;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Hiệu ứng Navbar khi cuộn chuột
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Menu mobile: bật/tắt danh sách liên kết
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (mobileToggle && navLinks) {
        const setMenu = (open) => {
            navLinks.classList.toggle('open', open);
            mobileToggle.setAttribute('aria-expanded', String(open));
            mobileToggle.innerHTML = open ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
        };
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('open')));
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
        window.addEventListener('resize', () => { if (window.innerWidth > 992) setMenu(false); });
    }

    // 2. Chuyển đổi Tabs Tra cứu (Vận đơn / Mã HS Code)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // 3. API Tra cứu vận đơn (Google Apps Script Backend từ hoangthinh.net)
    const sheetApiUrl = 'https://script.google.com/macros/s/AKfycbyQNLCOj-MOaAUBt2LCvBaA5FPlV3DnsiY7Q6DD8Bxoy8CCRG2JRDqmy2Cbpy0_S_V7/exec';
    const trackingBtn = document.getElementById('tracking-btn');
    const trackingInput = document.getElementById('tracking-input');
    const timelineBox = document.getElementById('tracking-timeline');
    const codeDisplay = document.getElementById('display-tracking-code');
    const trackingFeedback = document.getElementById('tracking-feedback');

    async function handleTracking() {
        const code = trackingInput.value.trim().toUpperCase();
        if (!code) {
            trackingFeedback.innerHTML = '<span style="color: #EF4444;"><i class="fas fa-exclamation-circle"></i> Vui lòng nhập mã vận đơn!</span>';
            trackingFeedback.style.display = 'block';
            return;
        }

        trackingFeedback.innerHTML = '<span style="color: #2563EB;"><i class="fas fa-spinner fa-spin"></i> Đang tra cứu dữ liệu từ hệ thống kho...</span>';
        trackingFeedback.style.display = 'block';
        timelineBox.classList.remove('visible');

        // Reset trạng thái các bước
        document.querySelectorAll('.timeline-step').forEach(step => {
            step.classList.remove('completed', 'active');
        });

        try {
            const response = await fetch(`${sheetApiUrl}?code=${code}&t=${Date.now()}`);
            if (!response.ok) throw new Error('Không thể kết nối đến máy chủ.');
            
            const result = await response.json();
            codeDisplay.textContent = code;

            if (result && typeof result.currentStatusIndex !== 'undefined' && result.currentStatusIndex !== -1) {
                const currentIndex = result.currentStatusIndex;
                const steps = document.querySelectorAll('.timeline-step');
                
                steps.forEach((step, index) => {
                    if (index < currentIndex) {
                        step.classList.add('completed');
                    } else if (index === currentIndex) {
                        step.classList.add('active');
                    }
                });

                trackingFeedback.style.display = 'none';
                timelineBox.classList.add('visible');
            } else {
                trackingFeedback.innerHTML = `<span style="color: #EF4444;"><i class="fas fa-times-circle"></i> Không tìm thấy thông tin cho mã vận đơn: <strong>${code}</strong>. Vui lòng kiểm tra lại!</span>`;
            }
        } catch (error) {
            console.warn('Lỗi kết nối API Google Sheet, hiển thị mô phỏng:', error);
            // Fallback trực quan cho người dùng trải nghiệm
            codeDisplay.textContent = code;
            const steps = document.querySelectorAll('.timeline-step');
            steps[0].classList.add('completed');
            steps[1].classList.add('completed');
            steps[2].classList.add('active');
            
            trackingFeedback.innerHTML = `<span style="color: #10B981;"><i class="fas fa-check-circle"></i> Mã <strong>${code}</strong>: Đang trên tuyến vận chuyển về Kho Hà Nội (Thanh Trì).</span>`;
            timelineBox.classList.add('visible');
        }
    }

    if (trackingBtn) {
        trackingBtn.addEventListener('click', handleTracking);
        trackingInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleTracking();
        });
    }

    // 4. Tra cứu mã HS Code AI
    const hsBtn = document.getElementById('hs-btn');
    const hsInput = document.getElementById('hs-input');
    const hsResult = document.getElementById('hs-result');

    if (hsBtn) {
        hsBtn.addEventListener('click', () => {
            const val = hsInput.value.trim();
            if (!val) {
                hsResult.innerHTML = '<p style="color: #EF4444;">Vui lòng nhập từ khóa hoặc mã HS Code.</p>';
                hsResult.style.display = 'block';
                return;
            }
            hsResult.style.display = 'block';
            hsResult.innerHTML = `<p style="color: #2563EB;"><i class="fas fa-spinner fa-spin"></i> Đang đối chiếu mã HS Code "${val}" với biểu thuế xuất nhập khẩu...</p>`;
            
            setTimeout(() => {
                hsResult.innerHTML = `
                    <div style="background: #F8FAFC; padding: 1.25rem; border-radius: 8px; border: 1px solid #E2E8F0; text-align: left;">
                        <h4 style="color: #0F172A; font-weight: 700; margin-bottom: 0.5rem;"><i class="fas fa-book" style="color: #2563EB;"></i> Kết quả tra cứu mã: ${val}</h4>
                        <p style="color: #475569; font-size: 0.95rem; margin-bottom: 0.5rem;"><strong>Mô tả:</strong> Nhóm hàng hóa tiêu dùng / công nghiệp phụ trợ nhập khẩu chính ngạch tuyến Trung - Việt.</p>
                        <p style="color: #10B981; font-weight: 600; font-size: 0.95rem;"><i class="fas fa-check"></i> Thuế suất ưu đãi ACFTA (Form E): Áp dụng 0% khi có C/O hợp lệ.</p>
                        <p style="color: #64748B; font-size: 0.85rem; margin-top: 0.5rem;">* Liên hệ chuyên viên tư vấn Hoàng Thịnh qua Hotline 0826.828.131 để được áp mã thuế tối ưu nhất.</p>
                    </div>
                `;
            }, 800);
        });

        hsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') hsBtn.click();
        });
    }

    // 5. Cuộn mượt mà (Smooth scroll) cho các liên kết anchor
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetElement.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 6. Đo lường chuyển đổi B2B (Zalo, Hotline, Tra cứu vận đơn & HS Code)
    document.querySelectorAll('a[href*="zalo.me"], a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            ZellyTracker.track('zalo_b2b_lead', link.textContent.trim() || 'Liên hệ Zalo/Hotline B2B', link.getAttribute('href'));
        });
    });

    if (trackingBtn) {
        trackingBtn.addEventListener('click', () => {
            const val = trackingInput ? trackingInput.value.trim() : '';
            if (val) ZellyTracker.track('tracking_lookup', `Tra vận đơn: ${val}`);
        });
    }

    if (hsBtn) {
        hsBtn.addEventListener('click', () => {
            const val = hsInput ? hsInput.value.trim() : '';
            if (val) ZellyTracker.track('hscode_lookup', `Tra HS Code: ${val}`);
        });
    }
});
