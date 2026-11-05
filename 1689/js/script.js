// ============================================================================
// 1689.VN — LOGIC BẢNG SẢN PHẨM REUP (+20%), AFFILIATE CONFIG & ZELLY TRACKER
// Chú thích 100% bằng tiếng Việt theo chuẩn của Agent Zelly (.claude)
// ============================================================================

// 1. CẤU HÌNH AFFILIATE & ZALO B2B TẬP TRUNG (Chỉ cần sửa ID tại đây là áp dụng toàn trang)
const AFFILIATE_CONFIG = {
    shopeeAffiliateId: "1689vn_hoangthinh",         // Điền Affiliate ID Shopee của bạn vào đây
    accesstradeDeepLinkPrefix: "",                  // Nếu dùng Accesstrade, điền: "https://go.isclix.com/deep_link/..."
    zaloB2BUrl: "https://zalo.me/0826828131",       // Link Zalo nhận đơn sỉ trực tiếp Kho Hoàng Thịnh
    hotlinePhone: "0826828131",
    n8nWebhookUrl: ""                               // Tùy chọn: URL Webhook n8n để bắn thông báo click theo thời gian thực
};

// Hàm tự động gắn mã Affiliate & UTM chuẩn xác cho từng sản phẩm
function buildAffiliateLink(item) {
    let rawUrl = item.affiliateUrl || `https://shopee.vn/search?keyword=${encodeURIComponent(item.name)}`;
    if (AFFILIATE_CONFIG.shopeeAffiliateId && !rawUrl.includes("aff_sid=")) {
        const sep = rawUrl.includes("?") ? "&" : "?";
        rawUrl = `${rawUrl}${sep}aff_sid=${encodeURIComponent(AFFILIATE_CONFIG.shopeeAffiliateId)}`;
    }
    if (AFFILIATE_CONFIG.accesstradeDeepLinkPrefix) {
        return `${AFFILIATE_CONFIG.accesstradeDeepLinkPrefix}?url=${encodeURIComponent(rawUrl)}&utm_source=1689vn&utm_campaign=reup_${item.id}`;
    }
    return rawUrl;
}

// 2. BỘ ĐO LƯỜNG CHUYỂN ĐỔI THÔNG MINH (ZELLY SMART CLICK TRACKER)
const ZellyTracker = {
    storageKey: "zelly_click_metrics",
    getMetrics() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : {
                affiliateClicks: 0,
                zaloLeads: 0,
                calculatorUses: 0,
                events: []
            };
        } catch (e) {
            return { affiliateClicks: 0, zaloLeads: 0, calculatorUses: 0, events: [] };
        }
    },
    track(eventType, label, targetUrl = "") {
        const data = this.getMetrics();
        if (eventType === "affiliate_click") data.affiliateClicks = (data.affiliateClicks || 0) + 1;
        if (eventType === "zalo_b2b_lead") data.zaloLeads = (data.zaloLeads || 0) + 1;
        if (eventType === "calculator_use") data.calculatorUses = (data.calculatorUses || 0) + 1;

        const entry = {
            site: "1689.vn",
            type: eventType,
            label: label,
            url: targetUrl,
            timestamp: new Date().toISOString()
        };
        data.events = [entry, ...(data.events || [])].slice(0, 50);

        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (e) {
            // Bỏ qua nếu trình duyệt chặn localStorage ở chế độ ẩn danh
        }

        // Gửi tín hiệu không chặn (non-blocking) về Webhook n8n nếu đã cấu hình
        if (AFFILIATE_CONFIG.n8nWebhookUrl && navigator.sendBeacon) {
            try {
                navigator.sendBeacon(AFFILIATE_CONFIG.n8nWebhookUrl, JSON.stringify(entry));
            } catch (e) {}
        }
    }
};
window.ZellyTracker = ZellyTracker;

const PRODUCTS_DATA = [
    {
        id: 1,
        name: "Đèn LED Cảm Ứng Từ Tính Không Dây Luxury (3 Chế Độ Màu)",
        category: "decor",
        categoryLabel: "Đèn & Decor Luxury",
        priceCny: 12.5,
        costVnd: "53.000đ",
        retailVnd: "149.000đ",
        profitPercent: "+64% Lợi Nhuận",
        desc: "Tự động bật sáng khi có người đi qua, gắn nam châm từ tính không cần khoan tường, sạc Type-C tiện lợi.",
        affiliateUrl: "https://shopee.vn/search?keyword=den%20led%20cam%20ung%20tu%20tinh&utm_source=1689vn&utm_medium=product_card&utm_campaign=reup_1688"
    },
    {
        id: 2,
        name: "Giá Đỡ Điện Thoại Hợp Kim Xoay 360° Trục Cơ Khí",
        category: "tech",
        categoryLabel: "Phụ Kiện Công Nghệ",
        priceCny: 8.8,
        costVnd: "38.000đ",
        retailVnd: "119.000đ",
        profitPercent: "+68% Lợi Nhuận",
        desc: "Hợp kim nhôm CNC nguyên khối, xoay 360 độ phát âm thanh cơ học cực cuốn, gấp gọn bỏ túi.",
        affiliateUrl: "https://shopee.vn/search?keyword=gia%20do%20dien%20thoai%20xoay%20360&utm_source=1689vn&utm_medium=product_card&utm_campaign=reup_1688"
    },
    {
        id: 3,
        name: "Quạt Phun Sương Tích Điện Cầm Tay Động Cơ Không Chổi Than",
        category: "tech",
        categoryLabel: "Phụ Kiện Công Nghệ",
        priceCny: 19.0,
        costVnd: "81.000đ",
        retailVnd: "195.000đ",
        profitPercent: "+58% Lợi Nhuận",
        desc: "Màn hình LED hiển thị phần trăm pin, 100 cấp độ gió siêu mạnh, pin 4000mAh dùng liên tục 12 giờ.",
        affiliateUrl: "https://shopee.vn/search?keyword=quat%20cam%20tay%20100%20cap%20do%20gio&utm_source=1689vn&utm_medium=product_card&utm_campaign=reup_1688"
    },
    {
        id: 4,
        name: "Máy Hút Bụi Cầm Tay Mini Không Dây Cho Ô Tô & Bàn Làm Việc",
        category: "home",
        categoryLabel: "Gia Dụng Thông Minh",
        priceCny: 24.5,
        costVnd: "105.000đ",
        retailVnd: "259.000đ",
        profitPercent: "+59% Lợi Nhuận",
        desc: "Lực hút 16.000Pa kết hợp đầu thổi bụi 2 trong 1, lõi lọc HEPA giặt tái sử dụng nhiều lần.",
        affiliateUrl: "https://shopee.vn/search?keyword=may%20hut%20bui%20cam%20tay%20mini&utm_source=1689vn&utm_medium=product_card&utm_campaign=reup_1688"
    },
    {
        id: 5,
        name: "Máy Ép Chậm Mini Đa Năng Tách Bã Kiệt 98% Nội Địa Trung",
        category: "home",
        categoryLabel: "Gia Dụng Thông Minh",
        priceCny: 68.0,
        costVnd: "292.000đ",
        retailVnd: "650.000đ",
        profitPercent: "+55% Lợi Nhuận",
        desc: "Thiết kế nhỏ gọn dễ tháo rửa trong 10 giây, giữ nguyên dưỡng chất và enzyme tự nhiên.",
        affiliateUrl: "https://shopee.vn/search?keyword=may%20ep%20cham%20mini&utm_source=1689vn&utm_medium=product_card&utm_campaign=reup_1688"
    },
    {
        id: 6,
        name: "Đèn Ngủ Pha Lê Ánh Hoàng Hôn & Bắc Cực Quang 16 Màu Cảm Ứng",
        category: "decor",
        categoryLabel: "Đèn & Decor Luxury",
        priceCny: 11.2,
        costVnd: "48.000đ",
        retailVnd: "135.000đ",
        profitPercent: "+64% Lợi Nhuận",
        desc: "Hiệu ứng khúc xạ pha lê kim cương sang trọng, điều khiển từ xa 16 màu và chạm cảm ứng đỉnh đèn.",
        affiliateUrl: "https://shopee.vn/search?keyword=den%20ngu%20pha%20le%2016%20mau&utm_source=1689vn&utm_medium=product_card&utm_campaign=reup_1688"
    }
    ,
    {
        id: 7,
        name: "Tai Nghe Bluetooth Trong Suốt ENC Chống Ồn Nội Địa Trung",
        category: "tech",
        categoryLabel: "Phụ Kiện Công Nghệ",
        priceCny: 18.5,
        costVnd: "94.000đ",
        retailVnd: "199.000đ",
        profitPercent: "+53% Lợi Nhuận",
        desc: "Thiết kế vỏ Mecha trong suốt lộ mạch cực chất, chống ồn đàm thoại ENC kép, pin nghe liên tục 30 giờ.",
        affiliateUrl: "https://shopee.vn/search?keyword=Tai%20Nghe%20Bluetooth%20Trong%20Su%E1%BB%91t%20ENC%20Ch%E1%BB%91ng%20%E1%BB%92n%20N%E1%BB%99i%20%C4%90%E1%BB%8Ba%20Trung&utm_source=1689vn&utm_medium=product_card&utm_campaign=reup_1688"
    }
];

// Hàm hiển thị danh sách sản phẩm theo bộ lọc ngành hàng
function renderProducts(filterCategory = "all") {
    const grid = document.getElementById("productGrid");
    if (!grid) return;

    const filtered = filterCategory === "all"
        ? PRODUCTS_DATA
        : PRODUCTS_DATA.filter(item => item.category === filterCategory);

    grid.innerHTML = filtered.map(item => `
        <div class="product-card">
            <div>
                <div class="product-top">
                    <span class="category-tag"><i class="fas fa-tag"></i> ${item.categoryLabel}</span>
                    <span class="profit-badge">${item.profitPercent}</span>
                </div>
                <h3>${item.name}</h3>
                <p class="product-desc">${item.desc}</p>
            </div>
            <div>
                <div class="price-compare">
                    <div class="price-col">
                        <div class="lbl">Giá Gốc 1688</div>
                        <div class="val" style="color: var(--accent-cyan);">¥${item.priceCny}</div>
                    </div>
                    <div class="price-col">
                        <div class="lbl">Giá Vốn (+20%)</div>
                        <div class="val" style="color: var(--primary);">${item.costVnd}</div>
                    </div>
                    <div class="price-col">
                        <div class="lbl">Giá Bán Lẻ</div>
                        <div class="val" style="color: var(--accent-green);">${item.retailVnd}</div>
                    </div>
                </div>
                <div class="dual-cta">
                    <a href="${buildAffiliateLink(item)}" data-track-type="affiliate_click" data-track-label="${item.name}" rel="sponsored nofollow noopener" target="_blank" class="btn btn-gold">
                        <i class="fas fa-cart-plus"></i> Mua Lẻ Ưu Đãi
                    </a>
                    <a href="${AFFILIATE_CONFIG.zaloB2BUrl}" data-track-type="zalo_b2b_lead" data-track-label="Đặt sỉ: ${item.name}" target="_blank" class="btn btn-outline-gold">
                        <i class="fas fa-truck-loading"></i> Đặt Sỉ Xưởng
                    </a>
                </div>
            </div>
        </div>
    `).join("");

    // Gắn sự kiện đo lường chuyển đổi cho các nút CTA trong danh sách sản phẩm
    grid.querySelectorAll("[data-track-type]").forEach(btn => {
        btn.addEventListener("click", () => {
            ZellyTracker.track(
                btn.getAttribute("data-track-type"),
                btn.getAttribute("data-track-label"),
                btn.getAttribute("href")
            );
        });
    });
}

// Hàm tính toán giá vốn nhập hàng 1688 và giá bán đề xuất (+20%)
function calculateImportCost() {
    const priceCny = parseFloat(document.getElementById("calcPriceCny")?.value) || 0;
    const qty = parseInt(document.getElementById("calcQty")?.value) || 1;
    const weightKg = parseFloat(document.getElementById("calcWeight")?.value) || 1;
    const marginPercent = parseFloat(document.getElementById("calcMargin")?.value) || 20;

    const exchangeRate = 3580;
    const shippingRatePerKg = 25000;

    const goodsVnd = priceCny * qty * exchangeRate;
    const serviceFee = Math.max(goodsVnd * 0.01, 10000);
    const shipFee = weightKg * shippingRatePerKg;
    const totalLandedCost = goodsVnd + serviceFee + shipFee;
    const unitCost = Math.round(totalLandedCost / qty);
    const suggestPrice = Math.round((unitCost * (1 + marginPercent / 100)) / 1000) * 1000;

    const fmt = (n) => n.toLocaleString("vi-VN") + " đ";

    document.getElementById("resGoodsVnd").textContent = fmt(Math.round(goodsVnd));
    document.getElementById("resServiceFee").textContent = fmt(Math.round(serviceFee));
    document.getElementById("resShipFee").textContent = fmt(Math.round(shipFee));
    document.getElementById("resUnitCost").textContent = fmt(unitCost) + " / cái";
    document.getElementById("resSuggestPrice").textContent = fmt(suggestPrice) + " / cái";
}

document.addEventListener("DOMContentLoaded", () => {
    renderProducts("all");
    calculateImportCost();

    // Lắng nghe sự kiện bấm nút lọc ngành hàng
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderProducts(btn.getAttribute("data-filter"));
        });
    });

    // Lắng nghe sự kiện thay đổi ô nhập máy tính giá vốn
    ["calcPriceCny", "calcQty", "calcWeight", "calcMargin"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", calculateImportCost);
            el.addEventListener("change", () => ZellyTracker.track("calculator_use", `Máy tính giá vốn: ${id}`));
        }
    });

    // Theo dõi các nút Zalo / Hotline tĩnh trên toàn trang 1689
    document.querySelectorAll('a[href*="zalo.me"], a[href^="tel:"]').forEach(link => {
        if (!link.hasAttribute("data-track-type")) {
            link.addEventListener("click", () => {
                ZellyTracker.track("zalo_b2b_lead", link.textContent.trim() || "Liên hệ Zalo/Hotline 1689", link.getAttribute("href"));
            });
        }
    });
});
