document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Dynamic Year in Footer
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    /* ----------------------------------------------------
       LIGHT / DARK THEME TOGGLE
       ---------------------------------------------------- */
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;

    // Retrieve saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    
    // Apply theme without transition flash on load
    htmlEl.classList.add('no-transition');
    htmlEl.setAttribute('data-theme', savedTheme);
    // Force reflow
    window.getComputedStyle(htmlEl).opacity;
    htmlEl.classList.remove('no-transition');

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    /* ----------------------------------------------------
       MOBILE NAVIGATION MENU
       ---------------------------------------------------- */
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        mobileToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    };

    mobileToggle.addEventListener('click', toggleMenu);

    // Custom Smooth Scrolling Navigation with Header Offset
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();

                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('open')) {
                    toggleMenu();
                }

                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 72;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    /* ----------------------------------------------------
       ACTIVE LINK ON SCROLL (INTERSECTION OBSERVER)
       ---------------------------------------------------- */
    const sections = document.querySelectorAll('section[id]');
    
    const observerOptions = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Triggers when section occupies central area of viewport
        threshold: 0
    };

    const observerCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sections.forEach(section => observer.observe(section));

    /* ----------------------------------------------------
       SIMULATED TERMINAL TYPING EFFECT
       ---------------------------------------------------- */
    const terminalOutput = document.getElementById('terminal-output');
    const terminalCursorInput = document.getElementById('terminal-cursor-input');

    // Content to type out in JSON-like structure
    const profileLines = [
        ' {',
        '   "full_name": "Nguyễn Văn Đức",',
        '   "university": "VNU-UET (ĐH Công nghệ)",',
        '   "major": "Computer Science (KHMT)",',
        '   "faculty": "Information Technology (CNTT)",',
        '   "passion": "Explore tech & build useful apps",',
        '   "strength": "Active learner, adaptive to change",',
        '   "course": "Intro to Digital Tech & AI",',
        '   "status": "Determined to succeed!"',
        ' }'
    ];

    // Helper command typing simulator
    const firstCommandLine = "python student_info.py";
    let cmdIdx = 0;
    
    const typeCommand = () => {
        if (cmdIdx < firstCommandLine.length) {
            terminalCursorInput.textContent += firstCommandLine.charAt(cmdIdx);
            cmdIdx++;
            setTimeout(typeCommand, 60);
        } else {
            // Finished command typing, execute output simulation after a short delay
            setTimeout(() => {
                terminalOutput.innerHTML = ''; // Clear the "loading" placeholder
                typeProfileLines(0, 0);
            }, 600);
        }
    };

    const typeProfileLines = (lineIndex, charIndex) => {
        if (lineIndex < profileLines.length) {
            const currentLineText = profileLines[lineIndex];
            
            // Create a line element if we just started typing it
            if (charIndex === 0) {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'terminal-output-line';
                lineDiv.style.fontFamily = "'Fira Code', monospace";
                terminalOutput.appendChild(lineDiv);
            }
            
            const currentLineEl = terminalOutput.lastChild;
            const nextChar = currentLineText.charAt(charIndex);
            
            // Syntax highlighting logic for key/value pairs
            if (nextChar === '"' || currentLineEl.innerHTML.includes('"')) {
                // simple styling approach for simulation
                currentLineEl.innerHTML = formatJsonSyntax(currentLineText.substring(0, charIndex + 1));
            } else {
                currentLineEl.textContent = currentLineText.substring(0, charIndex + 1);
            }

            // Scroll terminal body to bottom as text appears
            const terminalBody = document.querySelector('.terminal-body');
            terminalBody.scrollTop = terminalBody.scrollHeight;

            if (charIndex < currentLineText.length - 1) {
                // Next character
                setTimeout(() => typeProfileLines(lineIndex, charIndex + 1), 15);
            } else {
                // Next line
                setTimeout(() => typeProfileLines(lineIndex + 1, 0), 200);
            }
        }
    };

    // Helper to add minor color styling to json strings
    const formatJsonSyntax = (str) => {
        // Highlight keys
        let formatted = str.replace(/"([^"]+)":/g, '<span class="code-output-key">"$1"</span>:');
        // Highlight string values
        formatted = formatted.replace(/: \s*"([^"]+)"/g, ': <span class="code-output-value">"$1"</span>');
        // Highlight booleans/numbers
        formatted = formatted.replace(/: \s*(true|false|\d+)/g, ': <span class="code-keyword">$1</span>');
        return formatted;
    };

    // Trigger terminal typing simulation after a brief initial page-load pause
    setTimeout(typeCommand, 1000);

    /* ----------------------------------------------------
       PROJECT PORTFOLIO FILTERS, SEARCH & VIEW TOGGLE
       ---------------------------------------------------- */
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('project-search-input');
    const viewButtons = document.querySelectorAll('.view-btn');
    const gridContainer = document.getElementById('project-grid-container');

    function updateProjectsList() {
        const activeFilterBtn = document.querySelector('.project-filters .filter-btn.active');
        const filterValue = activeFilterBtn ? activeFilterBtn.getAttribute('data-filter') : 'all';
        const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        const projectCards = document.querySelectorAll('.project-card');
        let visibleCount = 0;

        projectCards.forEach(card => {
            const category = card.getAttribute('data-category');
            const title = card.querySelector('.project-name')?.textContent.toLowerCase() || '';
            const desc = card.querySelector('.project-desc')?.textContent.toLowerCase() || '';
            const tag = card.querySelector('.project-tag')?.textContent.toLowerCase() || '';
            const tech = Array.from(card.querySelectorAll('.project-tech span')).map(t => t.textContent.toLowerCase()).join(' ');

            const matchesFilter = (filterValue === 'all' || category === filterValue);
            const matchesSearch = !query || title.includes(query) || desc.includes(query) || tag.includes(query) || tech.includes(query);

            if (matchesFilter && matchesSearch) {
                visibleCount++;
                card.style.display = 'flex';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 50);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Update result count text
        const resultCountEl = document.getElementById('project-result-count');
        if (resultCountEl) {
            resultCountEl.textContent = `Đang hiển thị ${visibleCount} sản phẩm`;
        }
    }

    // Filter button click handler
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            updateProjectsList();
        });
    });

    // Search input handler
    if (searchInput) {
        searchInput.addEventListener('input', updateProjectsList);

        // Keyboard shortcut: Press '/' to focus search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    // Layout view toggle handler (Grid vs List)
    if (viewButtons.length > 0 && gridContainer) {
        viewButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                viewButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const viewMode = btn.getAttribute('data-view');
                if (viewMode === 'list') {
                    gridContainer.classList.add('list-view');
                } else {
                    gridContainer.classList.remove('list-view');
                }
            });
        });
    }

    /* ----------------------------------------------------
       GLOBAL SCROLL-TO-TOP BUTTON
       ---------------------------------------------------- */
    const globalScrollBtn = document.getElementById('global-scroll-top');
    if (globalScrollBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                globalScrollBtn.classList.add('visible');
            } else {
                globalScrollBtn.classList.remove('visible');
            }
        });
        globalScrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Set up overlay scroll-to-top button once
    setupOverlayScrollTop();
    initLightbox();

    /* ----------------------------------------------------
       SCROLL REVEAL ANIMATION (INTERSECTION OBSERVER)
       ---------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal');
    if (revealElements.length > 0) {
        const revealObserverOptions = {
            root: null,
            rootMargin: '0px 0px -10% 0px',
            threshold: 0.05
        };

        const revealObserverCallback = (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Reveal only once
                }
            });
        };

        const revealObserver = new IntersectionObserver(revealObserverCallback, revealObserverOptions);
        revealElements.forEach(el => revealObserver.observe(el));
    }
});




/* ----------------------------------------------------
   PROJECT DETAILS DIALOG & OVERLAY CODE
   ---------------------------------------------------- */
const reportsData = {
  "bai1": {
    "title": "20260320_BAOCAOQUANLYDULIEU_NGUYENVANDUC.docx",
    "bodyHtml": "<p>Báo cáo</p><p>Tổ chức và quản lí dữ liệu cá nhân</p><h3>1. Đánh giá tình hình hiện tại</h3><p>Trước khi tiến hành tổ chức lại, dữ liệu trên máy tính cá nhân của em đang trong tình trạng khá lộn xộn, phân tán và thiếu tính hệ thống. Cụ thể:</p><p><strong class=\"label-highlight\">Vị trí lưu trữ:</strong> Phần lớn file được tải về đều nằm dồn cục ở thư mục Downloads và ngoài màn hình Desktop.</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai1_image1.png\" alt=\"Minh họa 1\"><p class=\"report-img-caption\">Hình 1: Minh chứng trong file báo cáo</p></div><p><strong class=\"label-highlight\">Tình trạng phân loại:</strong> Các tài liệu học tập trên trường (Giải tích, Đại số tuyến tính, Vật lý đại cương), source code các môn lập trình (Java, Python, C++), tài liệu cá nhân và file giải trí (truyện, nhạc) bị để lẫn lộn với nhau.</p><p><strong class=\"label-highlight\">Vấn đề đặt tên:</strong> Không có quy tắc đặt tên file đồng nhất. Nhiều file có tên mặc định khi tải về như Untitled.docx, document(1).pdf, bai_tap_cuoi_cung.zip, gây mất thời gian khi cần tìm kiếm lại tài liệu cũ hoặc tìm bài tập nhóm (ví dụ: môn Tư duy tính toán).</p><p><strong class=\"label-highlight\">Nguy cơ:</strong> Việc lưu trữ không khoa học trên một ổ cứng duy nhất tiềm ẩn rủi ro mất mát dữ liệu học tập quan trọng nếu máy tính gặp sự cố.</p><h3>2. Thiết kế hệ thống tổ chức dữ liệu</h3><p>Để giải quyết tình trạng trên, em đã thiết kế lại hệ thống thư mục theo nguyên tắc phân cấp từ tổng quan đến chi tiết.</p><p><strong class=\"label-highlight\">Cấu trúc cây thư mục:</strong> </p><div class=\"folder-tree-block\"><pre>📁 C:\\Users\\ducng\\Downloads\n├── 📁 1_TAI_LIEU\n├── 📁 2_PHAN_MEM\n├── 📁 3_LAP_TRINH\n│   ├── 📁 JAVA\n│   ├── 📁 C++\n│   └── 📁 PYTHON\n└── 📁 4_CS6_K70\n    ├── 📁 LAP_TRINH_NANG_CAO\n    ├── 📁 VAT_LI_DAI_CUONG\n    ├── 📁 TOAN_ROI_RAC\n    ├── 📁 GIAI_TICH_2\n    ├── 📁 TU_TUONG_HO_CHI_MINH\n    ├── 📁 TU_DUY_TINH_TOAN\n    ├── 📁 GIAI_TICH_1\n    └── 📁 DAI_SO_TUYEN_TINH\n</pre></div><p>Quy tắc đặt tên file</p><p>Nhằm đảm bảo tính nhất quán và dễ tìm kiếm, em áp dụng quy tắc đặt tên cho toàn bộ thư mục học tập và công việc là: Không dùng tiếng Việt có dấu và khoảng trắng, thay thế bằng dấu gạch dưới và viết hoa toàn bộ chữ cái (Ngoại trừ những thư mục đặc thù cần tiếng việt có dấu để phân biệt).</p><h3>3. Thực hiện tổ chức lại dữ liệu</h3><p><strong class=\"label-highlight\">Quá trình thực hiện được chia làm 3 bước:</strong> </p><p><strong class=\"label-highlight\">Lọc và Xóa:</strong> Xóa bỏ các file rác, file cài đặt (.exe) đã sử dụng, các file trùng lặp trong thư mục Downloads.</p><p><strong class=\"label-highlight\">Di chuyển và Phân loại:</strong> Cắt (Cut) và dán (Paste) hàng loạt tài liệu vào đúng hệ thống cây thư mục đã thiết kế ở phần 2.</p><p><strong class=\"label-highlight\">Đổi tên:</strong> Đổi tên hàng loạt các file quan trọng theo đúng quy tắc Naming Convention đã đề ra.</p><p>Hiện tại, hệ thống mới đã được áp dụng cho toàn bộ dữ liệu trên máy, giúp không gian lưu trữ trở nên cực kì gọn gàng.</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai1_image2.png\" alt=\"Minh họa 2\"><p class=\"report-img-caption\">Hình 2: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai1_image3.png\" alt=\"Minh họa 3\"><p class=\"report-img-caption\">Hình 3: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai1_image4.png\" alt=\"Minh họa 4\"><p class=\"report-img-caption\">Hình 4: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai1_image5.png\" alt=\"Minh họa 5\"><p class=\"report-img-caption\">Hình 5: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai1_image6.png\" alt=\"Minh họa 6\"><p class=\"report-img-caption\">Hình 6: Minh chứng trong file báo cáo</p></div><h3>4. Chiến lược sao lưu dữ liệu</h3><p>Để đảm bảo an toàn tuyệt đối cho dữ liệu học tập và cá nhân, em áp dụng chiến lược sao lưu kết hợp 2 phương pháp:</p><h4><span class=\"method-highlight\">Phương pháp 1</span> Sao lưu Đám mây (Cloud Storage - Google Drive / OneDrive)</h4><p><strong class=\"label-highlight\">Phạm vi áp dụng:</strong> Các tài liệu học tập, file Word/Excel/PDF, và các thư mục source code.</p><p><strong class=\"label-highlight\">Ưu điểm:</strong> Truy cập được ở bất kỳ đâu, chia sẻ dễ dàng khi làm bài tập nhóm, đồng bộ tự động.</p><p><strong class=\"label-highlight\">Nhược điểm:</strong> Phụ thuộc vào kết nối Internet, dung lượng miễn phí có giới hạn.</p><p><strong class=\"label-highlight\">Tần suất sao lưu:</strong> Đồng bộ tự động (Real-time) ngay khi có thay đổi nội dung file.</p><h4><span class=\"method-highlight\">Phương pháp 2</span> Sao lưu Vật lý (Ổ cứng rời / USB dung lượng lớn)</h4><p><strong class=\"label-highlight\">Phạm vi áp dụng:</strong> Toàn bộ hệ thống thư mục gốc C:\\Users\\ducng\\Downloads, bao gồm cả các file nặng như phần mềm, hệ điều hành (file ISO Ubuntu), video, hình ảnh.</p><p><strong class=\"label-highlight\">Ưu điểm:</strong> Không phụ thuộc mạng Internet, dung lượng lớn, an toàn trước các rủi ro bị hack tài khoản mạng.</p><p><strong class=\"label-highlight\">Nhược điểm:</strong> Cần thao tác thủ công, thiết bị có thể bị hỏng hóc vật lý hoặc thất lạc.</p><p><strong class=\"label-highlight\">Tần suất sao lưu:</strong> Định kỳ 1 lần/tuần (vào tối Chủ Nhật).</p><h3>5. Kết luận (Khó khăn và Lợi ích)</h3><p><strong class=\"label-highlight\">Khó khăn gặp phải:</strong> Thách thức lớn nhất là mất khá nhiều thời gian ban đầu để rà soát, đọc lại nội dung các file cũ không có tên rõ ràng để biết nên phân loại chúng vào thư mục nào.</p><p><strong class=\"label-highlight\">Lợi ích đạt được:</strong> </p><p><strong class=\"label-highlight\">Tiết kiệm thời gian:</strong> Gần như ngay lập tức tìm được file tài liệu môn học hay đoạn code cũ khi cần thiết.</p><p><strong class=\"label-highlight\">Tối ưu hệ thống:</strong> Giải phóng được đáng kể dung lượng bộ nhớ SSD do xóa bỏ được nhiều file trùng lặp.</p><p><strong class=\"label-highlight\">An tâm tuyệt đối:</strong> Không còn nỗi lo mất tài liệu quan trọng trước mỗi kỳ thi nhờ chiến lược sao lưu song song 2 lớp.</p>"
  },
  "bai2": {
    "title": "20260321_BAOCAOTIMKIEMTHONGTIN_25021736_NguyenVanDuc.docx",
    "bodyHtml": "<h4>BÁO CÁO</h4><h4>TÌM KIẾM VÀ ĐÁNH GIÁ THÔNG TIN HỌC THUẬT</h4><p><strong class=\"label-highlight\">Họ và tên:</strong> Nguyễn Văn Đức</p><p><strong class=\"label-highlight\">Mã sinh viên:</strong> 25021736</p><h3>I. Lựa chọn chủ đề và phạm vi tìm kiếm</h3><p><strong class=\"label-highlight\">Chủ đề:</strong> Ứng dụng của Trí tuệ Nhân tạo (AI) và Học máy (ML) trong tự động hóa kiểm thử phần mềm.</p><p><strong class=\"label-highlight\">Lý do chọn chủ đề:</strong> Trong bối cảnh các phương pháp Agile và CI/CD yêu cầu rút ngắn chu kỳ phát hành phần mềm, kiểm thử thủ công truyền thống đang bộc lộ nhiều điểm nghẽn. Chủ đề này mang tính thách thức cao, đòi hỏi phân tích sự dịch chuyển từ tự động hóa dựa trên mã lệnh sang tự động hóa thông minh sử dụng AI.</p><p><strong class=\"label-highlight\">Phạm vi tìm kiếm:</strong> Các nghiên cứu tập trung vào AI Tạo sinh (GenAI), Học tăng cường (Reinforcement Learning) trong kiểm thử, và các báo cáo thực chứng công nghiệp từ giai đoạn 2019 đến 2026.</p><h3>II. Tìm kiếm thông tin</h3><p>Hệ thống tài liệu được thu thập từ các nguồn đa dạng, đáp ứng đủ các loại nguồn theo yêu cầu:</p><p><strong class=\"label-highlight\">Cơ sở dữ liệu học thuật:</strong> arXiv (ĐH Cornell).</p><p><strong class=\"label-highlight\">Tạp chí/Hội nghị khoa học:</strong> IEEE Access, IEEE Transactions on Reliability, SciTePress.</p><p><strong class=\"label-highlight\">Các báo cáo phân tích ngành (Nguồn mở/Mở rộng):</strong> Stanford University, Gartner, McKinsey, DORA (Google Cloud), và Capgemini.</p><h3>III. Bảng tổng hợp đánh giá độ tin cậy của tài liệu</h3><div class=\"table-container\"><table class=\"report-table\"><thead><tr><th>STT</th><th>Tài liệu &\nTác giả</th><th>Loại nguồn</th><th>Đánh giá độ\ntin cậy</th><th>Nhận xét</th></tr></thead><tbody><tr><td>1</td><td>Faraji, A. and Pombo, N. (2025). AI-Driven Software Test Automation...</td><td>Tạp chí khoa học</td><td>- Tác giả: Nghiên cứu từ ĐH Beira Interior, tác giả là Senior Member IEEE\n- Cơ quan XB: Tạp chí IEEE Access (chuẩn Q1)\n- PP nghiên cứu: Đánh giá hệ thống PRISMA, lọc mù đôi 76 bài báo\n- Trích dẫn: Chỉ số tác động cao.\n- Cập nhật: Rất mới (2025)</td><td>Độ tin cậy tuyệt đối về mặt học thuật và phương pháp luận</td></tr><tr><td>2</td><td>Singla, T. and Mahmoud, Q.H. (2026). Generative AI in Software Testing...</td><td>CSDL Học thuật</td><td>- Tác giả: Học giả ĐH Công nghệ Ontario\n- Cơ quan XB: arXiv (tiền ấn bản)\n- PP nghiên cứu: Tổng quan kỹ thuật đa diện\n- Trích dẫn: Nguồn tham khảo mở rộng phong phú - Cập nhật: Tiên phong (2026).</td><td>Nội dung mới, tập trung sâu vào AI tạo sinh nhưng đang chờ bình duyệt</td></tr><tr><td>3</td><td>Abu Bakar, N.S. (2025). Machine Learning Implementation...</td><td>Tạp chí khoa học</td><td>- Tác giả: Nhà nghiên cứu từ ĐH IIUM\n- Cơ quan XB: IU Press (ĐH Istanbul)\n- PP nghiên cứu: Phân tích tài liệu và nghiên cứu điển hình (Case studies)\n- Trích dẫn: Tạp chí mới nhưng tuân thủ quy trình chuẩn\n- Cập nhật: Mới xuất bản tháng 1/2025.</td><td>Phân tích chi tiết thuật toán ML, đánh giá cao tính thực tiễn</td></tr><tr><td>4</td><td>Islam, M., et al. (2023). Artificial Intelligence in Software Testing...</td><td>Kỷ yếu Hội nghị</td><td>- Tác giả: Chuyên gia ĐH Độc lập\n- Cơ quan XB: IEEE TENCON\n- PP nghiên cứu: Lọc 40 bài báo, chọn 20 bài để phân tích mô hình Deep Learning\n- Trích dẫn: Chỉ số trích dẫn tốt trên IEEE\n- Cập nhật: Cuối năm 2023.</td><td>Hội nghị uy tín, phương pháp đánh giá định lượng minh bạch</td></tr><tr><td>5</td><td>Durelli, V.H.S., et al. (2019). Machine Learning Applied to Software Testing...</td><td>Tạp chí khoa học</td><td>- Tác giả: Học giả ĐH Liên bang São Carlos\n- Cơ quan XB: IEEE Transactions on Reliability\n- PP nghiên cứu: Nghiên cứu bản đồ hệ thống trên 48 nghiên cứu sơ cấp\n- Trích dẫn: Nền tảng (294 citations)\n- Cập nhật: Xuất bản 2019.</td><td>Công trình nền móng, giá trị tham khảo lịch sử và lý thuyết cực cao</td></tr><tr><td>6</td><td>Trudova, A., et al. (2020). Artificial Intelligence in Software Test Automation...</td><td>Kỷ yếu Hội nghị</td><td>- Tác giả: Chuyên gia Kỹ thuật Phần mềm\n- Cơ quan XB: SciTePress\n- PP nghiên cứu: Đặt ra 4 câu hỏi nghiên cứu để ánh xạ công cụ AI\n- Trích dẫn: Trích dẫn rộng rãi (90 citations)\n- Cập nhật: Xuất bản 2020.</td><td>Khung phân tích vững chắc nhưng chưa bao gồm công nghệ LLMs mới</td></tr><tr><td>7</td><td>Stanford HAI (2025). The 2025 AI Index Report.</td><td>Báo cáo Viện NC</td><td>- Tác giả: Học giả liên ngành ĐH Stanford\n- Cơ quan XB: Stanford University\n- PP nghiên cứu: Hình ảnh hóa dữ liệu và thống kê định lượng\n- Trích dẫn: Nguồn tham chiếu toàn cầu\n- Cập nhật: Báo cáo mới nhất 2025.</td><td>Độ tin cậy dữ liệu thực chứng vĩ mô ở mức cao nhất</td></tr><tr><td>8</td><td>DORA (2025). State of AI-assisted Software Development Report.</td><td>Báo cáo Ngành</td><td>- Tác giả: Nhóm nghiên cứu DORA\n- Cơ quan XB: Google Cloud\n- PP nghiên cứu: Khảo sát năng lực AI và phân cụm 7 hồ sơ nhóm\n- Trích dẫn: Chuẩn mực cho CI/CD tích hợp AI\n- Cập nhật: Mới nhất 2025.</td><td>Kết hợp hoàn hảo giữa lý thuyết quản lý và thực tiễn công nghiệp</td></tr><tr><td>9</td><td>McKinsey & Company (2025). The State of AI in 2025.</td><td>Báo cáo Ngành</td><td>- Tác giả: Nhà phân tích QuantumBlack\n- Cơ quan XB: McKinsey & Company\n- PP nghiên cứu: Khảo sát toàn cầu, mô hình phân tích EBIT\n- Trích dẫn: Trích dẫn rộng rãi trong ngành công nghiệp\n- Cập nhật: Mới nhất 2025.</td><td>Phản ánh chính xác tâm lý thị trường và tác động tài chính của AI</td></tr><tr><td>10</td><td>Rainforest QA (2025). The state of software test automation in the age of AI.</td><td>Báo cáo Nền tảng</td><td>- Tác giả: Đội ngũ sản phẩm Rainforest QA\n- Cơ quan XB: Rainforest QA\n- PP nghiên cứu: Khảo sát 600 kỹ sư phần mềm, so sánh dữ liệu đối chứng\n- Trích dẫn: Nguồn tham khảo về xu hướng nội bộ QA\n- Cập nhật: Cập nhật cuối 2025.</td><td>Dữ liệu cụ thể, hữu ích để đánh giá ROI và xu hướng dân chủ hóa QA</td></tr><tr><td>11</td><td>Capgemini (2025). World Quality Report 2025...</td><td>Báo cáo Ngành</td><td>- Tác giả: Tập đoàn công nghệ Capgemini\n- Cơ quan XB: Capgemini\n- PP nghiên cứu: Khảo sát hệ thống doanh nghiệp về sự thiếu hụt nhân sự\n- Trích dẫn: Nguồn uy tín cho lĩnh vực Quality Engineering\n- Cập nhật: Xuất bản năm 2025.</td><td>Đặc biệt hữu ích trong việc phân tích khoảng trống kỹ năng (Skill Gap) trong ngành</td></tr><tr><td>12</td><td>Géron, A. (2022). Hands-On Machine Learning...</td><td>Sách chuyên khảo</td><td>- Tác giả: Cựu kỹ sư Google\n- Cơ quan XB: O'Reilly Media\n- PP: Hướng dẫn thực hành qua dự án\n- Trích dẫn: Hàng ngàn lượt trích dẫn\n- Cập nhật: Bản 2022.</td><td>Tính ứng dụng thực tiễn cực cao, nền tảng cho lập trình AI</td></tr></tbody></table></div><h3>IV. Danh mục tài liệu tham khảo</h3><p>Faraji, A. and Pombo, N. (2025). 'AI-Driven Software Test Automation: An AI4SE-Oriented Survey of Techniques, Tools, and Challenges', IEEE Access.</p><p>Singla, T. and Mahmoud, Q.H. (2026). 'Generative AI in Software Testing: Current Trends and Future Directions', arXiv preprint arXiv:2603.02141.</p><p>Abu Bakar, N.S. (2025). 'Machine Learning Implementation in Automated Software Testing: A Review', Journal of Data Analytics and Artificial Intelligence Applications, 1(1), pp.110-122.</p><p>Islam, M., Khan, F., Alam, S. and Hasan, M. (2023). 'Artificial Intelligence in Software Testing: A Systematic Review'. In: 2023 IEEE Region 10 Conference (TENCON), pp.524-529.</p><p>Durelli, V.H.S., Durelli, R.S., Borges, S.S. and Endo, A.T. (2019). 'Machine Learning Applied to Software Testing: A Systematic Mapping Study', IEEE Transactions on Reliability, 68(3), pp.1189-1212.</p><p>Trudova, A., Dolezel, M. and Buchalcevova, A. (2020). 'Artificial Intelligence in Software Test Automation: A Systematic Literature Review'. In: Proceedings of the 15th ENASE, pp.181-192.</p><p>Stanford Institute for Human-Centered Artificial Intelligence (HAI) (2025). The 2025 AI Index Report. Stanford University.</p><p>DORA (DevOps Research and Assessment) (2025). State of AI-assisted Software Development Report. Google Cloud.</p><p>McKinsey & Company (2025). The State of AI in 2025. McKinsey Global Survey.</p><p>Rainforest QA (2025). The state of software test automation in the age of AI.</p><p>Capgemini (2025). World Quality Report 2025: AI adoption surges in Quality Engineering, but enterprise-level scaling remains elusive.</p><p>Géron, A. (2022). Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow. 3rd ed. Sebastopol, CA: O'Reilly Media.</p>"
  },
  "bai3": {"title": "Báo cáo thực hành - Viết prompt hiệu quả trong học tập.docx", "bodyHtml": "<h4>BÁO CÁO THỰC HÀNH</h4><h4>KỸ NĂNG VIẾT PROMPT HIỆU QUẢ TRONG HỌC TẬP</h4><h3>I. Lựa chọn và phân tích tác vụ học tập</h3><h4><span class=\"method-highlight\">Tác vụ 1</span> Tóm tắt tài liệu học thuật (Chủ đề: Tổng quan về Deep Learning)</h4><p><strong class=\"label-highlight\">Thách thức:</strong> Tài liệu chuyên ngành thường chứa nhiều thuật ngữ phức tạp. Nếu không có prompt tốt, AI sẽ chỉ cắt ghép câu chữ mà không đơn giản hóa được vấn đề cho người mới bắt đầu.</p><h4><span class=\"method-highlight\">Tác vụ 2</span> Giải thích một khái niệm phức tạp (Chủ đề: Tính Đa hình - Polymorphism trong Java)</h4><p><strong class=\"label-highlight\">Thách thức:</strong> Khái niệm lập trình rất trừu tượng. Cần AI không chỉ giải thích lý thuyết mà phải liên kết được với ví dụ thực tế và code minh họa để người học dễ hình dung.</p><h4><span class=\"method-highlight\">Tác vụ 3</span> Tạo bộ câu hỏi ôn tập (Chủ đề: Phép nhân Ma trận - Đại số tuyến tính)</h4><p><strong class=\"label-highlight\">Thách thức:</strong> AI thường đưa ra các câu hỏi trắc nghiệm quá dễ hoặc sai đáp án toán học nếu không được hướng dẫn tư duy từng bước. Cần có cấu trúc rõ ràng cho cả câu hỏi, đáp án và phần giải thích.</p><h3>II. Xây dựng các phiên bản Prompt và thử nghiệm</h3><h4><span class=\"method-highlight\">Tác vụ 1</span> Tóm tắt tài liệu học thuật</h4><p><strong class=\"label-highlight\">Tài liệu học thuật:</strong> </p><p>Học sâu (Deep Learning) là một lĩnh vực con của học máy (Machine Learning), được xây dựng dựa trên nền tảng của các mạng nơ-ron nhân tạo (Artificial Neural Networks) có cấu trúc nhiều lớp ẩn (hidden layers). Khác biệt cốt lõi của kiến trúc này so với các thuật toán học máy truyền thống nằm ở khả năng tự động trích xuất đặc trưng (automatic feature extraction). Thay vì phụ thuộc vào việc con người thiết kế và tinh chỉnh các đặc trưng đầu vào thủ công, mạng học sâu tự động học cách biểu diễn dữ liệu ở nhiều mức độ trừu tượng khác nhau thông qua các lớp tính toán phi tuyến tính.</p><p>Cơ chế học tập của các mô hình này chủ yếu dựa trên thuật toán lan truyền ngược (Backpropagation) và phương pháp tối ưu hóa giảm dần đạo hàm (Gradient Descent). Quá trình này liên tục cập nhật và tinh chỉnh hàng triệu, thậm chí hàng tỷ trọng số (weights) bên trong mạng lưới nhằm giảm thiểu hàm mất mát (loss function) giữa dự đoán của mô hình và kết quả thực tế.</p><p>Với sự bùng nổ của Dữ liệu lớn (Big Data) và sức mạnh xử lý song song vượt trội của các đơn vị xử lý đồ họa (GPU), Deep Learning đã tạo ra những bước đột phá ngoạn mục. Trong lĩnh vực Thị giác máy tính (Computer Vision), Mạng nơ-ron tích chập (CNN) đã vượt qua khả năng nhận diện của con người. Trong Xử lý ngôn ngữ tự nhiên (NLP), kiến trúc Transformer đã đặt nền móng cho các Mô hình ngôn ngữ lớn (LLMs) hiện đại. Dù sở hữu hiệu năng mạnh mẽ, việc triển khai Deep Learning vẫn gặp phải những rào cản nhất định, bao gồm chi phí tính toán đắt đỏ, tính chất \"hộp đen\" (black-box) khó diễn dịch cơ chế ra quyết định, và rủi ro quá khớp (overfitting) khi mô hình ghi nhớ dữ liệu huấn luyện thay vì tổng quát hóa.</p><ul><li><strong class=\"label-highlight\">Prompt cơ bản:</strong> Tóm tắt bài viết sau về Deep Learning (Nội dung tài liệu học tập bên trên)</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image1.png\" alt=\"Minh họa 1\"><p class=\"report-img-caption\">Hình 1: Minh chứng trong file báo cáo</p></div><ul><li><strong class=\"label-highlight\">Promt cải tiến:</strong> Hãy tóm tắt bài viết về Deep Learning dưới đây thành 3 đoạn văn ngắn: Đoạn 1: Định nghĩa, Đoạn 2: Cách thức hoạt động, Đoạn 3: Ứng dụng thực tế (Nội dung tài liệu học tập bên trên)</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image2.png\" alt=\"Minh họa 2\"><p class=\"report-img-caption\">Hình 2: Minh chứng trong file báo cáo</p></div><ul><li><strong class=\"label-highlight\">Prompt nâng cao:</strong> Đóng vai một Giảng viên Khoa học máy tính. Hãy tóm tắt văn bản dưới đây về Deep Learning cho một sinh viên Đại học chuyên ngành Khoa học máy tính. Yêu cầu: Sử dụng ngôn ngữ truyền cảm hứng, tuyệt đối tránh các phương trình toán học phức tạp. Trình bày dưới dạng Bullet points (gạch đầu dòng) và kết thúc bằng một câu hỏi gợi mở tư duy cho học sinh (Nội dung tài liệu học tập bên trên)</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image3.png\" alt=\"Minh họa 3\"><p class=\"report-img-caption\">Hình 3: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image4.png\" alt=\"Minh họa 4\"><p class=\"report-img-caption\">Hình 4: Minh chứng trong file báo cáo</p></div><h4><span class=\"method-highlight\">Tác vụ 2</span> Giải thích khái niệm phức tạp</h4><ul><li><strong class=\"label-highlight\">Prompt cơ bản:</strong> Giải thích tính đa hình trong lập trình Java</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image5.png\" alt=\"Minh họa 5\"><p class=\"report-img-caption\">Hình 5: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image6.png\" alt=\"Minh họa 6\"><p class=\"report-img-caption\">Hình 6: Minh chứng trong file báo cáo</p></div><ul><li><strong class=\"label-highlight\">Prompt cải tiến:</strong> Giải thích chi tiết tính đa hình (Polymorphism) trong Java. Hãy cung cấp 1 ví dụ bằng code để minh hoạ</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image7.png\" alt=\"Minh họa 7\"><p class=\"report-img-caption\">Hình 7: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image8.png\" alt=\"Minh họa 8\"><p class=\"report-img-caption\">Hình 8: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image9.png\" alt=\"Minh họa 9\"><p class=\"report-img-caption\">Hình 9: Minh chứng trong file báo cáo</p></div><ul><li><strong class=\"label-highlight\">Prompt nâng cao:</strong> Đóng vai một Senior Java Developer đang phỏng vấn thực tập sinh. Hãy giải thích khái niệm \"Tính đa hình\" (Polymorphism). Hãy suy nghĩ và trả lời theo từng bước sau: Bước 1: Bắt đầu bằng một phép ẩn dụ trong đời sống thực (ví dụ: Một người đàn ông vừa là 'Bố' ở nhà, vừa là 'Nhân viên' ở công ty). Bước 2: Phân biệt rõ sự khác nhau giữa Compile-time (Overloading) và Run-time (Overriding). Bước 3: Viết một đoạn code Java ngắn, chuẩn Clean Code minh họa cho Bước 2 và có chú thích (comment) giải thích luồng thực thi</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image10.png\" alt=\"Minh họa 10\"><p class=\"report-img-caption\">Hình 10: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image11.png\" alt=\"Minh họa 11\"><p class=\"report-img-caption\">Hình 11: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image12.png\" alt=\"Minh họa 12\"><p class=\"report-img-caption\">Hình 12: Minh chứng trong file báo cáo</p></div><h4><span class=\"method-highlight\">Tác vụ 3</span> Tạo bộ câu hỏi ôn tập</h4><ul><li><strong class=\"label-highlight\">Prompt cơ bản:</strong> Tạo câu hỏi trắc nghiệm về phép nhân ma trận</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image13.png\" alt=\"Minh họa 13\"><p class=\"report-img-caption\">Hình 13: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image14.png\" alt=\"Minh họa 14\"><p class=\"report-img-caption\">Hình 14: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image15.png\" alt=\"Minh họa 15\"><p class=\"report-img-caption\">Hình 15: Minh chứng trong file báo cáo</p></div><ul><li><strong class=\"label-highlight\">Prompt cải tiến:</strong> Tạo 5 câu hỏi trắc nghiệm về điều kiện và cách tính phép nhân 2 ma trận. Mỗi câu có 4 đáp án A, B, C, D và chỉ ra đáp án đúng</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image16.png\" alt=\"Minh họa 16\"><p class=\"report-img-caption\">Hình 16: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image17.png\" alt=\"Minh họa 17\"><p class=\"report-img-caption\">Hình 17: Minh chứng trong file báo cáo</p></div><ul><li><strong class=\"label-highlight\">Prompt nâng cao:</strong> Đóng vai một giáo viên Toán. Hãy tạo một bài kiểm tra ngắn gồm 3 câu hỏi trắc nghiệm về \"Phép nhân ma trận\" cho sinh viên năm nhất. Quy tắc bắt buộc cho mỗi câu hỏi: Chỉ ra rõ kích thước ma trận (ví dụ: ma trận 2x3 nhân ma trận 3x2). Cung cấp 4 đáp án (A, B, C, D). Đưa ra đáp án đúng và PHẢI có phần \"Giải thích chi tiết\": giải thích từng bước tính toán tại sao ra kết quả đó, và tại sao các phương án nhiễu lại sai</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image18.png\" alt=\"Minh họa 18\"><p class=\"report-img-caption\">Hình 18: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image19.png\" alt=\"Minh họa 19\"><p class=\"report-img-caption\">Hình 19: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image20.png\" alt=\"Minh họa 20\"><p class=\"report-img-caption\">Hình 20: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai3_image21.png\" alt=\"Minh họa 21\"><p class=\"report-img-caption\">Hình 21: Minh chứng trong file báo cáo</p></div><h3>III. Phân tích hiệu quả Prompt</h3><ul><li>Bảng so sánh chất lượng đầu ra giữa các phiên bản Prompt</li></ul><div class=\"table-container\"><table class=\"report-table\"><thead><tr><th>Cấp độ Prompt</th><th>Đặc điểm cấu trúc câu lệnh</th><th>Chất lượng thông tin & Độ chính xác</th><th>Bố cục & Giọng văn đầu ra</th></tr></thead><tbody><tr><td>Cơ bản (Basic)</td><td>Chỉ có 1 câu lệnh trần trụi, không có ngữ cảnh (VD: \"Giải thích tính đa hình\").</td><td>Thông tin chung chung, bề mặt. Thường đưa ra lý thuyết khô khan (Tác vụ 1, 2) hoặc các câu hỏi quá đơn giản/dễ sai logic (Tác vụ 3).</td><td>Trình bày ngẫu nhiên, lộn xộn (thường là 1 cục văn bản dài). Giọng văn mặc định, máy móc.</td></tr><tr><td>Cải tiến (Improved)</td><td>Thêm các yêu cầu cụ thể về cấu trúc và định dạng (VD: \"3 đoạn\", \"cung cấp ví dụ code\").</td><td>Đầy đủ ý chính, trả lời đúng trọng tâm. Cung cấp được ví dụ thực tế và đáp án rõ ràng, ít bị lan man.</td><td>Bố cục rõ ràng, có chia đoạn, đánh số thứ tự dễ theo dõi. Giọng văn trung lập, rành mạch.</td></tr><tr><td>Nâng cao (Advanced)</td><td>Kết hợp đa kỹ thuật: Gán vai (Role-prompting), Tư duy từng bước (Chain-of-Thought), Cung cấp bối cảnh mục tiêu.</td><td>Rất sâu sắc và chính xác. Khái niệm phức tạp được làm rõ qua phép ẩn dụ thực tế; code minh họa chuẩn Clean Code; đáp án toán học có giải thích từng bước (Step-by-step), loại bỏ hoàn toàn \"ảo giác\".</td><td>Trình bày cực kỳ chuyên nghiệp (dùng Bullet points, Code blocks chuẩn). Giọng văn truyền cảm hứng, đúng chuẩn chuyên gia/giảng viên.</td></tr></tbody></table></div><ul><li><strong class=\"label-highlight\">Phân tích:</strong> Các Mô hình ngôn ngữ lớn (LLMs) hoạt động dựa trên cơ chế dự đoán từ tiếp theo (next-token prediction) dựa trên xác suất thống kê</li></ul><p>Tại sao Basic prompt kém hiệu quả? Không gian xác suất quá rộng. Khái niệm \"giải thích\" có thể là dành cho tiến sĩ, cũng có thể là cho trẻ em. Điều này khiến AI đưa ra câu trả lời chung chung, trung bình (average)</p><p><strong class=\"label-highlight\">Sức mạnh của Role-prompting:</strong> Khi \"gán vai\" (ví dụ: Senior Java Developer), chúng ta ép mô hình thu hẹp không gian tìm kiếm ngôn ngữ vào tệp dữ liệu liên quan đến lập trình viên chuyên nghiệp, từ đó từ vựng và văn phong trở nên sắc bén, chính xác hơn</p><p><strong class=\"label-highlight\">Sức mạnh của Chain-of-Thought (Tư duy từng bước):</strong> Bằng cách ép AI phân tách vấn đề (Bước 1, Bước 2...), chúng ta cung cấp cho AI nhiều \"không gian tính toán\" (compute tokens) hơn trước khi đưa ra kết luận cuối cùng. Điều này đặc biệt giảm thiểu \"ảo giác\" (hallucination) trong các bài toán logic hoặc lập trình</p><h3>IV. Tổng hợp nguyên tắc và mẹo viết Prompt hiệu quả</h3><ul><li>Dựa trên thực nghiệm, để làm chủ AI trong học tập, người dùng cần tuân thủ Khung C.R.E.A.T.E:</li></ul><p><strong class=\"label-highlight\">C - Context (Ngữ cảnh):</strong> Luôn cho AI biết bạn là ai, bạn đang cần giải quyết bài toán ở mức độ nào (Đại học hay Cấp 3).</p><p><strong class=\"label-highlight\">R - Role (Vai trò):</strong> Gán một chuyên gia cụ thể để định hình chất lượng kiến thức (Giáo sư Toán học, Lập trình viên cấp cao).</p><p><strong class=\"label-highlight\">E - Explicit Instructions (Hướng dẫn tường minh):</strong> Đừng nói \"Hãy tóm tắt hay\", hãy nói \"Tóm tắt trong 3 đoạn, mỗi đoạn 50 từ\".</p><p><strong class=\"label-highlight\">A - Analogy & Examples (Ví dụ & Ẩn dụ):</strong> Cung cấp cấu trúc mẫu (Few-shot) để AI bắt chước đúng form bạn muốn (như form câu hỏi trắc nghiệm).</p><p><strong class=\"label-highlight\">T - Tone & Format (Giọng điệu & Định dạng):</strong> Chỉ định rõ cần văn bản nghiêm túc hay hài hước, trả lời bằng bảng biểu, bullet points hay code block.</p><p><strong class=\"label-highlight\">E - Evaluate & Iterate (Đánh giá và Tinh chỉnh):</strong> Prompting là quá trình lặp. Nếu AI trả lời sai, hãy phân tích xem mình đã thiếu ràng buộc nào trong câu lệnh và bổ sung ngay lập tức.</p>"},
  "bai4": {"title": "20260318_BAOCAOKYNANGGIAOTIEPVAHOPTACSO_25021736_NGUYENVANDUC.pdf", "bodyHtml": "<div class=\"pdf-page-block\" data-page=\"0\"><h4>BÁO CÁO CÁ NHÂN</h4><h4>KỸ NĂNG GIAO TIẾP VÀ HỢP TÁC SỐ</h4><p>Thông tin chung</p><ul><li><strong class=\"label-highlight\">Dự án:</strong> Xây dựng Hệ thống đấu giá (Client-Server, MVC)</li><li><strong class=\"label-highlight\">Vai trò:</strong> Lập trình viên Client & Server Controller</li></ul><h3>I. Kỹ năng thiết lập & Sử dụng công cụ</h3><p>Trong dự án này, nhóm chúng em chọn hướng tiếp cận “Tinh gọn”, không lạm dụng quá nhiều phần mềm mà tập trung khai thác tối đa 3 công cụ cốt lõi để duy trì hiệu suất:</p><h4>1. Discord – Messenger (Giao tiếp, Điều phối và Quản lý tác vụ)</h4><ul><li><strong class=\"label-highlight\">Thiết lập:</strong> Tạo 1 server Discord nội bộ để quản lý các công việc theo tiến độ, sử dụng Messenger và tạo nhóm để giao tiếp với các thành viên khác về các vấn đề khi triển khai công việc và cần tính nhanh chóng và tiện dụng.</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image1.png\" alt=\"Minh họa 1\"><p class=\"report-img-caption\">Hình 1: Minh chứng trong file báo cáo</p></div></div><div class=\"pdf-page-block\" data-page=\"1\"><ul><li><strong class=\"label-highlight\">Tối ưu hoá:</strong> Nhóm em đã sử dụng tính năng Ghim tin nhắn của Discord như một bảng quản lý Task. Những quyết định chốt tính năng hay phân công nhiệm vụ đều được ghim lại, giúp các thành viên có thể đọc ngay lập tức mà không phải lướt tìm lại.</li></ul><h4>2. Github (Quản lý mã nguồn và phiên bản)</h4><ul><li><strong class=\"label-highlight\">Thiết lập:</strong> Khởi tạo Repository dùng chung Online-Auction-system-Group7-CS6 với cấu trúc đa module (Auction_client, Auction_server).</li><li><strong class=\"label-highlight\">Tối ưu hoá không gian:</strong> Chúng em tổ chức luồng công việc thông qua nhánh (Branch).</li></ul><p><strong class=\"label-highlight\">Quy tắc lưu trữ:</strong> Toàn bộ mã nguồn được đặt tên chuẩn CamelCase của Java (VD: LoginController.java). Các giao diện FXML được gom chung vào thư mục resources/com/auction/client giúp hệ thống thư mục gọn gàng, dễ truy xuất. Mỗi thành viên có nhánh riêng (Ví dụ em có nhánh riêng VanDuc). Mã nguồn chỉ được phép đẩy lên nhánh cá nhân, sau đó em sẽ kiểm tra logic trước khi gộp vào nhánh main.</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image2.png\" alt=\"Minh họa 2\"><p class=\"report-img-caption\">Hình 2: Minh chứng trong file báo cáo</p></div></div><div class=\"pdf-page-block\" data-page=\"2\"><h4>3. Google Docs (Tài liệu hoá dự án)</h4><ul><li><strong class=\"label-highlight\">Thiết lập:</strong> Chuyển đổi các trao đổi thành Bảng phân công tiến độ trên Google Docs, các thông tin về dự án, tiến độ dự án và phân công công việc tuần tới sẽ được cập nhật trên Google Docs với tần suất 1 lần mỗi tuần.</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image3.png\" alt=\"Minh họa 3\"><p class=\"report-img-caption\">Hình 3: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image4.png\" alt=\"Minh họa 4\"><p class=\"report-img-caption\">Hình 4: Minh chứng trong file báo cáo</p></div></div><div class=\"pdf-page-block\" data-page=\"3\"><p>Ảnh tiến độ công việc của nhóm trên Google Docs</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image5.png\" alt=\"Minh họa 5\"><p class=\"report-img-caption\">Hình 5: Minh chứng trong file báo cáo</p></div></div><div class=\"pdf-page-block\" data-page=\"4\"><p>Ảnh tiến độ công việc của nhóm trên Google Docs</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image6.png\" alt=\"Minh họa 6\"><p class=\"report-img-caption\">Hình 6: Minh chứng trong file báo cáo</p></div></div><div class=\"pdf-page-block\" data-page=\"5\"><h3>II. Quản lý tác vụ & Tương tác cá nhân</h3><ul><li>Trong quá trình thực hiện dự án, em luôn phản hồi tin nhắn về công việc và thông báo tiến độ công việc nhanh nhất có thể để dây chuyền công việc không bị gián đoạn.</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image7.png\" alt=\"Minh họa 7\"><p class=\"report-img-caption\">Hình 7: Minh chứng trong file báo cáo</p></div></div><div class=\"pdf-page-block\" data-page=\"6\"><h3>III. Phân tích Thách thức & Giải pháp</h3><h4>1. Thách thức 1: Rủi ro hỏng cấu trúc hệ thống (Conflict code) do làm việc đồng thời</h4><ul><li><strong class=\"label-highlight\">Phân tích:</strong> Khi em (viết Controller) và Kế Đức (viết Model) cùng sửa chung một file cấu hình hoặc file liên kết, nếu tải code đè lên nhau sẽ làm hỏng toàn bộ luồng chạy của chương trình (Merge Conflict).</li><li><strong class=\"label-highlight\">Giải pháp:</strong> Áp dụng nghiêm ngặt quy tắc Branching trên GitHub. Chúng em không bao giờ code trực tiếp trên nhánh main. Khi cần ghép nối giao diện FXML của Đạt với Controller của em, em luôn Pull nhánh DatGB về máy cục bộ (local), gắn logic, chạy thử thành công rồi mới đẩy ngược lên.</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image8.png\" alt=\"Minh họa 8\"><p class=\"report-img-caption\">Hình 8: Minh chứng trong file báo cáo</p></div></div><div class=\"pdf-page-block\" data-page=\"7\"><h4>2. Thách thức 2: Khó tra cứu quyết định cũ trên ứng dụng chat</h4><ul><li><strong class=\"label-highlight\">Phân tích:</strong> Thói quen chat liên tục trên Discord khiến những thông tin kỹ thuật quan trọng (như thống nhất dùng kiểu dữ liệu gì cho balance, quy tắc đặt tên biến) thường bị chìm nghỉm sau các tin nhắn giao tiếp thông thường.</li><li><strong class=\"label-highlight\">Giải pháp:</strong> Định hình lại văn hóa giao tiếp. Những thông tin cần thiết cho dự án và tiến độ công việc (Code đã push) sẽ được nhắn tại Discord, bất kì chốt hạ nào về biến hay cấu trúc database đều phải được ghim lại ngay lập tức, còn những vấn đề và thắc mắc trong khi làm dự án thì có thể dùng Messenger để giải quyết tức thì, không để ảnh hưởng tới tiến độ công việc.</li></ul><h4>3. Thách thức 3: Bất đồng bộ môi trường chạy Java</h4><ul><li><strong class=\"label-highlight\">Phân tích:</strong> Môi trường máy tính của mỗi người khác nhau, đôi lúc dự án chạy mượt trên máy tính của em nhưng khi thành viên khác Clone từ GitHub về lại báo lỗi thiếu thư viện Maven.</li><li><strong class=\"label-highlight\">Giải pháp:</strong> Cấu trúc lại file pom.xml một cách hệ thống cho cả 3 module (client, server, shared) và viết một file README.md ngắn gọn ngay trên GitHub hướng dẫn các bước đồng bộ thư viện chung.</li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image9.png\" alt=\"Minh họa 9\"><p class=\"report-img-caption\">Hình 9: Minh chứng trong file báo cáo</p></div></div><div class=\"pdf-page-block\" data-page=\"8\"><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai4_image10.png\" alt=\"Minh họa 10\"><p class=\"report-img-caption\">Hình 10: Minh chứng trong file báo cáo</p></div></div>"},
  "bai5": {
    "title": "20260501_BAOCAODUANSANGTAONOIDUNGSO_25021736_NGUYENVANDUC.docx",
    "bodyHtml": "<h4>BÁO CÁO</h4><h4>DỰ ÁN SÁNG TẠO NỘI DUNG SỐ</h4><p><strong class=\"label-highlight\">Họ tên:</strong> Nguyễn Văn Đức – MSV: 25021736</p><p><strong class=\"label-highlight\">Chủ đề:</strong> Ứng dụng của AI trong lĩnh vực nghiên cứu Khoa học tự nhiên & Kỹ thuật - Công nghệ.</p><p><strong class=\"label-highlight\">Hình thức:</strong> Video thuyết trình trên nền tảng YouTube.</p><h3>I. MỤC TIÊU VÀ TỔNG QUAN DỰ ÁN</h3><p><strong class=\"label-highlight\">Mục tiêu:</strong> Ứng dụng thành thạo đa dạng các công cụ AI tạo sinh nhằm tối ưu hóa quy trình sản xuất một video thuyết trình giáo dục chuyên sâu, từ khâu nghiên cứu, lên kịch bản, thiết kế hình ảnh cho đến hậu kỳ âm thanh.</p><p><strong class=\"label-highlight\">Công cụ AI sử dụng:</strong> </p><p><strong class=\"label-highlight\">Google Gemini:</strong> Nghiên cứu, tìm kiếm và tổng hợp tài liệu chuyên ngành.</p><p><strong class=\"label-highlight\">ChatGPT (GPT-4o/DALL-E):</strong> Mở rộng nghiên cứu, lập kịch bản chi tiết, trau chuốt ngôn từ và tạo hình ảnh Thumbnail (ảnh thu nhỏ) cho video.</p><p><strong class=\"label-highlight\">Canva (tích hợp AI):</strong> Thiết kế slide và các thành phần đồ họa chuyển cảnh.</p><p><strong class=\"label-highlight\">CapCut (AI Video/Audio):</strong> Chỉnh sửa video, lọc tiếng ồn thông minh và tối ưu hóa chất lượng âm thanh.</p><h3>II. QUÁ TRÌNH SỬ DỤNG AI VÀ TÍCH HỢP SÁNG TẠO</h3><h3>1. Giai đoạn 1: Nghiên cứu và Xây dựng kịch bản (Gemini & ChatGPT)</h3><h4><span class=\"method-highlight\">Bước 1</span> Tìm kiếm thông tin với Gemini</h4><p><strong class=\"label-highlight\">Prompt đã sử dụng:</strong> \"Hãy tổng hợp 5 ứng dụng đột phá nhất của Trí tuệ nhân tạo (AI) trong lĩnh vực nghiên cứu Khoa học tự nhiên và Kỹ thuật phần mềm trong 2 năm trở lại đây. Cung cấp số liệu hoặc ví dụ thực tế ngắn gọn.\"</p><p><strong class=\"label-highlight\">Kết quả AI đưa ra:</strong> Gemini cung cấp một danh sách tốt, cập nhật nhanh các xu hướng như AI trong dự đoán cấu trúc protein, tối ưu hóa vật liệu mới, và hỗ trợ viết mã tự động.</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image1.png\" alt=\"Minh họa 1\"><p class=\"report-img-caption\">Hình 1: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image2.png\" alt=\"Minh họa 2\"><p class=\"report-img-caption\">Hình 2: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image3.png\" alt=\"Minh họa 3\"><p class=\"report-img-caption\">Hình 3: Minh chứng trong file báo cáo</p></div><h4><span class=\"method-highlight\">Bước 2</span> Phát triển kịch bản với ChatGPT</h4><p><strong class=\"label-highlight\">Prompt đã sử dụng:</strong> \"Đóng vai một người làm nội dung giáo dục trên YouTube. Dựa trên các thông tin sau (thông tin từ phần hỏi đáp với Gemini), hãy lập một kịch bản video dài 5 phút. Phân chia rõ phần Introduction, Body (3 luận điểm chính) và Conclusion. Giọng điệu chuyên nghiệp, truyền cảm hứng và dễ hiểu.\"</p><p><strong class=\"label-highlight\">Kết quả AI đưa ra:</strong> Khung kịch bản rõ ràng, phân bổ thời gian hợp lý, lời thoại được viết sẵn. Tuy nhiên, ngôn từ còn khá \"máy móc\" và thiếu điểm nhấn cá nhân.</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image4.png\" alt=\"Minh họa 4\"><p class=\"report-img-caption\">Hình 4: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image5.png\" alt=\"Minh họa 5\"><p class=\"report-img-caption\">Hình 5: Minh chứng trong file báo cáo</p></div><p><strong class=\"label-highlight\">Tích hợp và Chỉnh sửa (Sáng tạo cá nhân):</strong> Thay vì đọc y nguyên kịch bản của AI, em đã viết lại lời thoại. Em tinh chỉnh các thuật ngữ kỹ thuật cho chính xác hơn, lồng ghép thêm các ví dụ cụ thể về tư duy logic thuật toán, thiết kế hệ thống và trải nghiệm thực tế để tạo sự gần gũi.</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image6.png\" alt=\"Minh họa 6\"><p class=\"report-img-caption\">Hình 6: Minh chứng trong file báo cáo</p></div><p>Kịch bản do AI tạo</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image7.png\" alt=\"Minh họa 7\"><p class=\"report-img-caption\">Hình 7: Minh chứng trong file báo cáo</p></div><p>Kịch bản sau khi được em đọc và chỉnh sửa</p><h3>2. Giai đoạn 2: Thiết kế hình ảnh và Trực quan hóa (ChatGPT & Canva)</h3><p><strong class=\"label-highlight\">Tạo Thumbnail với ChatGPT (DALL-E):</strong> </p><p><strong class=\"label-highlight\">Prompt đã sử dụng:</strong> \"Tạo một hình ảnh tỷ lệ 16:9 phong cách digital art, viễn tưởng. Hình ảnh thể hiện sự giao thoa giữa con người và AI trong phòng thí nghiệm khoa học và công nghệ. Bối cảnh bên ngoài vũ trụ, có các vi mạch điện tử, chiếc laptop đang sử dụng để lập trình.\"</p><p><strong class=\"label-highlight\">Kết quả:</strong> Bức ảnh có màu sắc bắt mắt, đúng tinh thần công nghệ.</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image8.jpeg\" alt=\"Minh họa 8\"><p class=\"report-img-caption\">Hình 8: Minh chứng trong file báo cáo</p></div><p><strong class=\"label-highlight\">Thiết kế Slide chuyển cảnh với Canva AI:</strong> </p><p>Em sử dụng tính năng Magic Design của Canva để tạo nhanh các template slide dựa trên từ khóa \"Technology Research\".</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image9.png\" alt=\"Minh họa 9\"><p class=\"report-img-caption\">Hình 9: Minh chứng trong file báo cáo</p></div><h3>3. Giai đoạn 3: Hậu kỳ với CapCut AI</h3><p>Trong quá trình thu âm, file gốc bị lẫn nhiều tạp âm từ môi trường. Em đã sử dụng tính năng Lọc tiếng ồn AI của CapCut.</p><p><strong class=\"label-highlight\">Kết quả:</strong> Âm thanh trở nên trong trẻo, đạt chuẩn studio mà không cần phải mua thiết bị thu âm đắt tiền hay phần mềm lọc âm chuyên dụng có phí như trước kia.</p><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai5_image10.png\" alt=\"Minh họa 10\"><p class=\"report-img-caption\">Hình 10: Minh chứng trong file báo cáo</p></div><h3>III. SO SÁNH VÀ PHÂN TÍCH HIỆU QUẢ CỦA CÁC CÔNG CỤ AI</h3><p>Việc phối hợp nhiều công cụ giúp em tận dụng được thế mạnh riêng biệt của từng nền tảng:</p><p>ChatGPT vs. Google Gemini (Xử lý văn bản & Dữ liệu):</p><p><strong class=\"label-highlight\">Điểm mạnh:</strong> Gemini thể hiện sự vượt trội trong việc truy xuất dữ liệu thời gian thực, rất hữu ích khi tìm kiếm các nghiên cứu khoa học mới nhất. Trong khi đó, ChatGPT lại có khả năng xử lý ngôn ngữ tự nhiên, trau chuốt câu từ và tư duy logic theo kịch bản xuất sắc hơn.</p><p><strong class=\"label-highlight\">Điểm yếu:</strong> Cả hai đôi khi mắc lỗi “Ảo giác AI”, tự bịa ra một số nguồn tài liệu không có thật. Điều này đòi hỏi người dùng phải có kiến thức nền tảng vững để xác minh.</p><p>Canva AI vs. CapCut AI (Thiết kế đồ họa & Video):</p><p><strong class=\"label-highlight\">Đánh giá:</strong> Cả hai công cụ này đã đơn giản hoá quá trình sáng tạo. Canva biến một người không chuyên thiết kế có thể tạo ra các khung hình đẹp mắt chỉ trong vài phút. CapCut giải quyết triệt để vấn đề kỹ thuật phần cứng như âm thanh kém bằng thuật toán. Tuy nhiên, sự tiện lợi này dễ dẫn đến rập khuôn nếu người dùng không chịu khó tùy biến thủ công.</p><h3>IV. PHÂN TÍCH VAI TRÒ CỦA AI TRONG QUY TRÌNH SÁNG TẠO</h3><p>Qua dự án, em nhận thấy AI đóng vai trò như một \"trợ lý nghiên cứu và kỹ thuật\", làm thay đổi hoàn toàn cách thức sản xuất nội dung:</p><p><strong class=\"label-highlight\">Sự thay đổi trong quy trình sáng tạo:</strong> Trước đây, em phải mất hàng giờ, thậm chí hàng ngày để đọc tài liệu, đối chiếu thông tin và loay hoay với các phần mềm hậu kỳ phức tạp. Giờ đây, chỉ cần những câu lệnh (prompt) chuẩn chỉnh, tư duy rành mạch, AI có thể giúp em vượt qua giai đoạn tìm kiếm ý tưởng nhanh chóng. AI giúp em tiếp cận được những tính năng cao cấp (như lọc âm, tạo ảnh nghệ thuật) mà trước kia phải trả mức phí rất cao hoặc mất nhiều năm học hỏi mới làm được.</p><p><strong class=\"label-highlight\">Mặt hạn chế (Cần kiểm chứng):</strong> Dù tốc độ xử lý nhanh, nhưng AI vẫn chỉ là một cỗ máy xác suất. Những kết quả AI đưa ra đôi lúc còn hời hợt, chưa đáng tin cậy hoàn toàn. Nếu đặt sai câu lệnh hoặc lười tư duy, sản phẩm cuối cùng sẽ rất ngô nghê và thiếu chiều sâu. Các dữ kiện về khoa học kỹ thuật do AI cung cấp luôn phải được đối chiếu với các nguồn uy tín.</p><p><strong class=\"label-highlight\">Vấn đề đạo đức cần cân nhắc:</strong> </p><p><strong class=\"label-highlight\">Bản quyền và Liêm chính học thuật:</strong> Việc sử dụng AI tạo sinh đặt ra câu hỏi lớn về quyền tác giả. Do đó, ta xác định rõ ranh giới: AI chỉ là công cụ hỗ trợ tư duy, không phải là tác giả. Bất kỳ số liệu hay trích dẫn nào xuất phát từ AI đều phải tự tìm lại nguồn gốc gốc để trích dẫn minh bạch.</p><p><strong class=\"label-highlight\">Tính minh bạch:</strong> Là một người làm nội dung giáo dục, việc cung cấp thông tin sai lệch do phụ thuộc vào AI là vô trách nhiệm với cộng đồng. Do đó, việc làm chủ công cụ, có trách nhiệm với những gì mình xuất bản quan trọng hơn việc tạo ra nội dung nhanh nhưng sáo rỗng.</p><h3>V. KẾT LUẬN</h3><p>Dự án đã chứng minh rằng, khi được định hướng bởi tư duy đúng đắn và kỹ năng prompt chuẩn xác, AI là một đòn bẩy khổng lồ. Việc kết hợp sức mạnh tổng hợp của Gemini, ChatGPT, Canva và CapCut không những giúp tối ưu hóa thời gian, nguồn lực mà còn nâng tầm chất lượng dự án. Tuy nhiên, cốt lõi của một sản phẩm sáng tạo có giá trị vẫn phải xuất phát từ tư duy độc bản, tính chuyên môn và trách nhiệm của con người.</p><p><strong class=\"label-highlight\">Video thành phẩm:</strong> <a href=\"https://youtu.be/hKGJkNWui8I\" target=\"_blank\" style=\"color: var(--primary); text-decoration: underline; font-weight: 600;\">https://youtu.be/hKGJkNWui8I</a></p><a href=\"https://youtu.be/hKGJkNWui8I\" target=\"_blank\" class=\"video-preview-card\" aria-label=\"Xem video thành phẩm trên YouTube\"><div class=\"video-preview-thumbnail\" style=\"background-image: url('assets/extracted_media/bai5_image8.jpeg');\"></div><div class=\"video-preview-overlay\"><div class=\"video-play-btn\"><svg viewBox=\"0 0 24 24\"><path d=\"M8 5v14l11-7z\"/></svg></div></div></a>"
  },
  "bai6": {
    "title": "20260517_BAOCAOSUDUNGAITRONGHOCTAPVANGHIENCUU_25021736_NguyenVanDuc.docx",
    "bodyHtml": "<h4>BÁO CÁO</h4><h4>PHÁT TRIỂN KỸ NĂNG SỬ DỤNG AI</h4><p><strong class=\"label-highlight\">Chủ đề:</strong> Phát triển kỹ năng sử dụng AI có trách nhiệm và đạo đức trrong học học tập và nghiên cứu.</p><p><strong class=\"label-highlight\">Họ và tên:</strong> Nguyễn Văn Đức – MSV: 25021736</p><p><strong class=\"label-highlight\">Ngành học:</strong> Khoa học Máy tính.</p><h3>I. Chính sách và định hướng sử dụng AI tại một số trường đại học</h3><ul><li>Tại Đại học Quốc gia Hà Nội (VNU), trí tuệ nhân tạo đang được ứng dụng mạnh mẽ vào giảng dạy và học tập, tiêu biểu là việc đưa môn học Nhập môn công nghệ số và ứng dụng trí tuệ nhân tạo (VNU1001) vào chương trình đào tạo. Dù nhà trường khuyến khích sinh viên tiếp cận công nghệ mới, các quy định về liêm chính học thuật vẫn được đặt lên hàng đầu: AI chỉ được coi là công cụ hỗ trợ tư duy, tuyệt đối không được sử dụng để thay thế năng lực tự học và gian lận trong các bài kiểm tra, đồ án.</li><li>Tại Đại học Bách Khoa Hà Nội (HUST), sinh viên kỹ thuật được phép sử dụng AI để tìm lỗi mã nguồn (debug) hoặc tìm kiếm tài liệu, nhưng phải chịu trách nhiệm 100% về độ chính xác của sản phẩm cuối cùng. Bất kỳ đoạn mã hay báo cáo nào do AI tạo ra hoàn toàn mà không có sự đóng góp cá nhân và trích dẫn rõ ràng đều bị coi là vi phạm quy chế đạo văn.</li><li>Tại Đại học Kinh tế Quốc dân (NEU), AI được xem là công cụ hỗ trợ phân tích và tìm kiếm thông tin trong đào tạo kinh tế - xã hội. Việc đánh giá thường gắn với thuyết trình và phản biện nhằm đảm bảo sinh viên thực sự hiểu nội dung, đồng thời các quy định học vụ hiện hành được áp dụng để kiểm soát việc sử dụng công nghệ.</li></ul><h3>II. Thực hiện nhiệm vụ học tập với sự hỗ trợ của AI</h3><h3>1. Các Prompt đã sử dụng</h3><ul><li><strong class=\"label-highlight\">Prompt 1(Giải thích khái niệm):</strong> “Phân tích sự khác biệt giữa Design Pattern ‘Observer’ và ‘Abstract Factory’ trong Java. Gợi ý pattern nào phù hợp hơn để cập nhật giá đấu thầu theo thời gian thực cho nhiều người dùng cùng lúc.”</li><li><strong class=\"label-highlight\">Prompt 2(Hỗ trợ DeBug):</strong> “Sau khi tôi tinh chỉnh lại UI của ứng dụng đấu giá của tôi thì phần controller của tôi bị lỗi với mã lỗi như này. Hãy kiểm tra hệ thống và tìm ra lỗi giúp tôi.”</li><li><strong class=\"label-highlight\">Prompt 3(Hỗ trợ ôn tập):</strong> “Sắp tới tôi có bài kiểm tra hết môn Lập trình nâng cao, dựa vào tài liệu tham khảo mà tôi đã gửi bạn và những nguồn tài liệu uy tín trên Internet, bạn hãy tổng hợp những kiến thức cần thiết cho bài kiểm tra sắp tới của tôi, hãy trích dẫn nguồn đầy đủ và minh bạch.”</li></ul><h3>2. Đầu ra của AI</h3><ul><li><strong class=\"label-highlight\">Với Prompt 1:</strong> </li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image1.png\" alt=\"Minh họa 1\"><p class=\"report-img-caption\">Hình 1: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image2.png\" alt=\"Minh họa 2\"><p class=\"report-img-caption\">Hình 2: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image3.png\" alt=\"Minh họa 3\"><p class=\"report-img-caption\">Hình 3: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image4.png\" alt=\"Minh họa 4\"><p class=\"report-img-caption\">Hình 4: Minh chứng trong file báo cáo</p></div><ul><li><strong class=\"label-highlight\">Với Prompt 2:</strong> </li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image5.png\" alt=\"Minh họa 5\"><p class=\"report-img-caption\">Hình 5: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image6.png\" alt=\"Minh họa 6\"><p class=\"report-img-caption\">Hình 6: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image7.png\" alt=\"Minh họa 7\"><p class=\"report-img-caption\">Hình 7: Minh chứng trong file báo cáo</p></div><ul><li><strong class=\"label-highlight\">Với Prompt 3:</strong> </li></ul><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image8.png\" alt=\"Minh họa 8\"><p class=\"report-img-caption\">Hình 8: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image9.png\" alt=\"Minh họa 9\"><p class=\"report-img-caption\">Hình 9: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image10.png\" alt=\"Minh họa 10\"><p class=\"report-img-caption\">Hình 10: Minh chứng trong file báo cáo</p></div><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image11.png\" alt=\"Minh họa 11\"><p class=\"report-img-caption\">Hình 11: Minh chứng trong file báo cáo</p></div><h3>3. Cách đánh giá, chỉnh sửa và tích hợp đầu ra của AI</h3><ul><li>Đối với phần kiến trúc Observer, em đã mở tài liệu giáo trình Lập trình Hướng đối tượng và Oracle Java Docs để đối chiếu cơ chế hoạt động, đảm bảo AI không sinh ra thông tin ảo (hallucination).</li><li>Đối với phần sửa lỗi khi chỉnh sửa UI, em nhận thấy rằng AI chỉ phát hiện ra được lỗi nhưng chưa đề xuất giải pháp quá thuyết phục, vì vậy em đã tham khảo các nguồn khác nhau về vấn đề sửa lỗi này, rồi cuối cùng tích hợp vào hệ thống và nhờ AI kiểm tra lại giúp phát hiện lỗi sai.</li><li>Đối với phần tổng hợp kiến thức trước kì thi, em thấy AI đã tổng hợp và xây dựng lộ trình ôn tập tương đối đầy đủ và đúng trọng tâm, tuy nhiên em vẫn cần phải tham khảo thêm các nguồn tài liệu khác và các đề thi từ các khoá trước để có thể chuẩn bị được tốt nội dung kiến thức cho kì thi.</li></ul><h3>4. Trích dẫn việc sử dụng AI một cách minh bạch</h3><ul><li>Trong hệ thống Bài tập lớn về Hệ thống đấu giá của nhóm em, những phần nào cần AI trợ giúp em đều review lại mã nguồn và xác thực tính đúng đắn của mã nguồn và thay đổi theo suy nghĩ của bản thân rồi mới sửa đổi vào hệ thống và ghi lại comment vào phần đó, không giấu việc mình sử dụng AI nhưng cần phải hiểu được mục đích phía sau và vai trò của phần mã nguồn đó khi AI viết ra.</li></ul><h3>III. Các vấn đề đạo đức liên quan đến việc sử dụng AI</h3><h3>1. Ranh giới giữa hỗ trợ hợp lý và gian lận học thuật</h3><ul><li><strong class=\"label-highlight\">Hỗ trợ hợp lý:</strong> Sử dụng AI như một người hướng dẫn (tutor) để giải thích các thông báo lỗi (stack trace) phức tạp, gợi ý ý tưởng thuật toán, hoặc tóm tắt tài liệu API. Người học vẫn là người trực tiếp gõ phím, xây dựng cấu trúc và hiểu rõ từng dòng code.</li><li><strong class=\"label-highlight\">Gian lận:</strong> Yêu cầu AI viết từ A đến Z một bài tập hoặc chức năng cốt lõi của dự án, sau đó sao chép (copy-paste) nguyên bản và nộp dưới tên mình mà không hề hiểu cơ chế hoạt động phía sau.</li></ul><h3>2. Vấn đề sở hữu trí tuệ và trích dẫn</h3><p>Các mô hình AI như GitHub Copilot hay ChatGPT được huấn luyện dựa trên hàng triệu kho lưu trữ mã nguồn mở (open-source repositories). Việc yêu cầu AI sinh ra những đoạn code quá dài có thể vô tình sao chép nguyên bản mã nguồn có bản quyền của một tác giả khác. Do đó, việc trích dẫn nguồn AI không chỉ là liêm chính học thuật mà còn là sự tôn trọng đối với cộng đồng phát triển phần mềm.</p><h3>3. Tác động đến quán trình học tập và phát triển kỹ năng</h3><ul><li><strong class=\"label-highlight\">Rủi ro:</strong> Sự ỷ lại vào AI có thể làm thui chột khả năng tư duy logic và kỹ năng giải quyết vấn đề (problem-solving) - những cốt lõi quan trọng nhất của một kỹ sư công nghệ. Nếu luôn dùng AI để gỡ lỗi thay vì tự đọc log, sinh viên sẽ hoàn toàn bị động khi đối mặt với các hệ thống phức tạp không có trên internet.</li><li><strong class=\"label-highlight\">Cơ hội:</strong> Nếu dùng đúng cách, AI giúp rút ngắn thời gian tìm kiếm tài liệu, vượt qua những bế tắc (blockers) nhỏ nhanh chóng, từ đó có nhiều không gian hơn để rèn luyện tư duy thiết kế hệ thống ở tầm vĩ mô.</li></ul><h3>IV. Bộ nguyên tắc cá nhân về cách sử dụng AI có trách nhiệm</h3><ul><li><strong class=\"label-highlight\">Tư duy đi trước, AI theo sau:</strong> Chỉ sử dụng AI sau khi bản thân đã tự nỗ lực suy nghĩ phác thảo kiến trúc giải pháp hoặc cố gắng tự debug ít nhất 30 phút.</li><li><strong class=\"label-highlight\">Kiểm chứng chéo mọi dữ liệu:</strong> Không bao giờ đưa thẳng mã nguồn do AI viết vào dự án chính mà chưa chạy thử (run test) trong môi trường biệt lập (sandbox) và đối chiếu với tài liệu chuyên ngành chính thống.</li><li><strong class=\"label-highlight\">Học để hiểu, không học vẹt:</strong> Khi nhờ AI sửa một đoạn code lỗi, bắt buộc phải đọc và hiểu chính xác tại sao mã cũ bị lỗi và cơ chế của đoạn mã mới, không nhắm mắt sao chép.</li><li><strong class=\"label-highlight\">Minh bạch trong báo cáo:</strong> Luôn có phụ lục đính kèm các câu lệnh (prompts) chính đã sử dụng và ghi nhận sự hỗ trợ của AI trong phần lời cảm ơn hoặc nhận xét mã nguồn.</li><li><strong class=\"label-highlight\">Bảo mật dữ liệu:</strong> Tuyệt đối không đưa các mã nguồn độc quyền, khóa bảo mật (API keys), mật khẩu cơ sở dữ liệu hay thông tin cá nhân lên các cửa sổ chat của AI.</li></ul><h3>V. Infographic minh hoạ</h3><div class=\"report-img-wrapper\"><img src=\"assets/extracted_media/bai6_image12.jpeg\" alt=\"Minh họa 12\"><p class=\"report-img-caption\">Hình 12: Minh chứng trong file báo cáo</p></div><p>Infographic có sử dụng công cụ tạo ảnh Chat GPT</p><p><strong class=\"label-highlight\">Prompt đã sử dụng:</strong> </p><p>Hãy thiết kế 1 Infographic tuyên truyền có nội dung sau đây:</p><h3>1. Phong cách thiết kế tổng thể (Gợi ý)</h3><p><strong class=\"label-highlight\">Tiêu đề chính:</strong> Sử dụng font chữ đậm, hiện đại, dễ đọc.</p><p><strong class=\"label-highlight\">Bố cục:</strong> Thiết kế theo dạng \"Đèn Giao Thông\"</p><p><strong class=\"label-highlight\">Hệ màu:</strong> Xanh dương (chuyên nghiệp), Xanh lá (tích cực/khuyến khích), Vàng (cảnh báo/kiểm soát), Đỏ (nghiêm cấm).</p><p><strong class=\"label-highlight\">Biểu tượng:</strong> Sử dụng các biểu tượng (icons) minh họa theo phong cách phẳng (flat design) hoặc line art hiện đại.</p><h3>2. Tiêu đề Infographic</h3><p><strong class=\"label-highlight\">Văn bản:</strong> \"5 NGUYÊN TẮC VÀNG: SỬ DỤNG AI CÓ TRÁCH NHIỆM TRONG HỌC THUẬT\"</p><p><strong class=\"label-highlight\">Phụ đề:</strong> \"Biến AI thành trợ thủ, không phải người làm thay\"</p><p><strong class=\"label-highlight\">Gợi ý Biểu tượng:</strong> Một sinh viên cầm một quả cầu tri thức, một con robot nhỏ đang cung cấp các công cụ hỗ trợ (như kính lúp, cờ lê).</p><h3>3. Nội dung Chi tiết (5 Bước)</h3><h4><span class=\"method-highlight\">Phần 1</span> TƯ DUY ĐI TRƯỚC (🟡 Màu Vàng - Cảnh báo trước khi làm)</h4><p><strong class=\"label-highlight\">Tiêu đề phụ:</strong> \"1. TỰ MÌNH ĐỘNG NÃO, ĐỪNG 'GÕ CỬA' AI NGAY\"</p><p><strong class=\"label-highlight\">Nội dung ngắn gọn:</strong> \"Phác thảo ý tưởng, dàn ý bài viết, hoặc tự mình debug mã nguồn ít nhất 30 phút. Chỉ dùng AI để tối ưu hóa, không dùng để khởi tạo.\"</p><p><strong class=\"label-highlight\">Gợi ý Biểu tượng:</strong> Một bóng đèn sáng (tư duy chủ động) dẫn đầu, một con robot nhỏ (AI) đi theo sau. Mũi tên chỉ sự chủ động.</p><h4><span class=\"method-highlight\">Phần 2</span> KIỂM CHỨNG & PHẢN BIỆN (🟢 Màu Xanh lá - Khuyến khích thực hiện)</h4><p><strong class=\"label-highlight\">Tiêu đề phụ:</strong> \"2. ĐỐI CHIẾU DỮ LIỆU, KHÔNG TIN AI HOÀN TOÀN\"</p><p><strong class=\"label-highlight\">Nội dung ngắn gọn:</strong> \"Kiểm tra chéo mọi đoạn mã, số liệu, hoặc khái niệm complex do AI cung cấp bằng giáo trình chính thống hoặc tài liệu API đáng tin cậy. Sẵn sàng sửa chữa AI.\"</p><p><strong class=\"label-highlight\">Gợi ý Biểu tượng:</strong> Một kính lúp (kiểm chứng) đang soi vào một tờ giấy có biểu tượng AI và sách giáo khoa. Dấu tích (✅) và dấu chéo (❌).</p><h4><span class=\"method-highlight\">Phần 3</span> HIỂU BẢN CHẤT (🟢 Màu Xanh lá - Khuyến khích thực hiện)</h4><p><strong class=\"label-highlight\">Tiêu đề phụ:</strong> \"3. ĐỌC ĐỂ HIỂU, KHÔNG 'COPY-PASTE' MÙ QUÁNG\"</p><p><strong class=\"label-highlight\">Nội dung ngắn gọn:</strong> \"Yêu cầu AI giải thích 'tại sao' đoạn code đó lỗi, hoặc cơ chế hoạt động của thuật toán mới. Đảm bảo bạn có thể tự mình giải thích lại nội dung đó.\"</p><p><strong class=\"label-highlight\">Gợi ý Biểu tượng:</strong> Một sinh viên nhìn màn hình code lỗi ➡️ Một sinh viên cầm sách và giải thích cho người khác. Một cuốn sách có biểu tượng AI và dấu hỏi (❓).</p><h4><span class=\"method-highlight\">Phần 4</span> MINH BẠCH & TRÍCH DẪN (🟢 Màu Xanh lá - Khuyến khích thực hiện)</h4><p><strong class=\"label-highlight\">Tiêu đề phụ:</strong> \"4. CÔNG KHAI CÔNG CỤ & PROMPTS CHÍNH\"</p><p><strong class=\"label-highlight\">Nội dung ngắn gọn:</strong> \"Sử dụng AI là một kỹ năng, hãy tự hào và minh bạch về nó. Luôn ghi rõ tên công cụ AI đã dùng, cách thức hỗ trợ và trích dẫn prompts chính trong báo cáo.\"</p><p><strong class=\"label-highlight\">Gợi ý Biểu tượng:</strong> Một văn bản báo cáo có mục \"Trích dẫn\" (Citation) ➡️ Nguồn: ChatGPT, GitHub Copilot. Một loa phát thanh hoặc huy hiệu liêm chính.</p><h4><span class=\"method-highlight\">Phần 5</span> BẢO MẬT DỮ LIỆU (🔴 Màu Đỏ - Nghiêm cấm)</h4><p><strong class=\"label-highlight\">Tiêu đề phụ:</strong> \"5. BẢO VỆ DỮ LIỆU NHẠY CẢM CỦA BẠN & TRƯỜNG\"</p><p><strong class=\"label-highlight\">Nội dung ngắn gọn:</strong> \"Tuyệt đối không đưa mã nguồn độc quyền, mật khẩu, khóa API, dữ liệu nghiên cứu chưa công bố hoặc thông tin cá nhân vào các AI công cộng.\"</p><p><strong class=\"label-highlight\">Gợi ý Biểu tượng:</strong> Một cái ổ khóa lớn (bảo mật) đang bảo vệ máy tính chứa dữ liệu quan trọng. Dấu hiệu cảnh báo (⚠️) và \"Nghiêm cấm\".</p><h3>4. Tổng kết Infographic</h3><p><strong class=\"label-highlight\">Thông điệp cuối cùng:</strong> \"DÙNG AI THÔNG MINH, LIÊM CHÍNH HỌC THUẬT VỮNG BỀN\"</p><p><strong class=\"label-highlight\">Lời kêu gọi hành động:</strong> \"Hãy cam kết sử dụng AI có trách nhiệm để trở thành một nhà khoa học/kỹ sư chân chính.\"</p><p><strong class=\"label-highlight\">Chân trang (Footer):</strong> </p><p><strong class=\"label-highlight\">Ghi chú:</strong> “Nguyễn Văn Đức – 25021736”</p>"
  },
  "giuaki": {
    "title": "Hồ sơ làm việc nhóm.docx",
    "bodyHtml": "<h4>HỌC PHẦN: NHẬP MÔN CÔNG NGHỆ SỐ VÀ ỨNG DỤNG TRÍ TUỆ NHÂN TẠO</h4><h4>HỒ SƠ LÀM VIỆC NHÓM</h4><p><strong class=\"label-highlight\">Tên nhóm:</strong> Nhóm 35</p><p><strong class=\"label-highlight\">Mã lớp:</strong> VNU1001_E252012</p><p><strong class=\"label-highlight\">Video sản phẩm:</strong> <a href=\"https://youtu.be/hKGJkNWui8I?si=xsYI3jvOH9Vo2VXP\" target=\"_blank\" style=\"color: var(--primary); text-decoration: underline; font-weight: 600;\">https://youtu.be/hKGJkNWui8I?si=xsYI3jvOH9Vo2VXP</a></p><a href=\"https://youtu.be/hKGJkNWui8I?si=xsYI3jvOH9Vo2VXP\" target=\"_blank\" class=\"video-preview-card\" aria-label=\"Xem video làm việc nhóm trên YouTube\"><div class=\"video-preview-thumbnail\" style=\"background-image: url('assets/extracted_media/giuaki_video_thumbnail.jpg');\"></div><div class=\"video-preview-overlay\"><div class=\"video-play-btn\"><svg viewBox=\"0 0 24 24\"><path d=\"M8 5v14l11-7z\"/></svg></div></div></a><h3>I. THÔNG TIN CHUNG VÀ PHÂN CÔNG</h3><h3>1. Danh sách thành viên nhóm</h3><div class=\"table-container\"><table class=\"report-table\"><thead><tr><th>STT</th><th>Mã sinh viên</th><th>Họ và tên</th><th>Vai trò</th><th>Ghi chú</th></tr></thead><tbody><tr><td>1</td><td>25021736</td><td>Nguyễn Văn Đức</td><td>Trưởng nhóm</td><td></td></tr><tr><td>2</td><td>25021744</td><td>Vũ Trường Giang</td><td>Thành viên</td><td></td></tr><tr><td>3</td><td>25021752</td><td>Rần Thị Ngọc Hân</td><td>Thành viên</td><td></td></tr><tr><td>4</td><td>25021759</td><td>Hoàng Minh Hiếu</td><td>Thành viên</td><td></td></tr><tr><td>5</td><td>25021766</td><td>Phạm Trung Hiếu</td><td>Thành viên</td><td></td></tr></tbody></table></div><h3>2. Phân công nhiệm vụ</h3><div class=\"table-container\"><table class=\"report-table\"><thead><tr><th>Tên công việc</th><th>Mô tả công việc</th><th>Người thực hiện</th><th>Thời hạn hoàn thành</th></tr></thead><tbody><tr><td>Lên ý tưởng và kịch bản</td><td>Tìm kiếm ý tưởng và nội dung phù hợp với chủ đề\nTổng hợp thành một kịch bản thuyết trình cụ thể</td><td>Nguyễn Văn Đức</td><td>22/04/2026</td></tr><tr><td>Tìm kiếm tài liệu</td><td>Tìm kiếm hình ảnh, video về 3 ứng dụng của AI đã chọn</td><td>Rần Thị Ngọc Hân</td><td>25/04/2026</td></tr><tr><td>Quay video</td><td>Quay video phần thuyết trình của các thành viên trong nhóm</td><td>Vũ Trường Giang\nPhạm Trung Hiếu</td><td>25/04/2026</td></tr><tr><td>Chỉnh sửa âm thanh</td><td>Ghép âm thanh và cắt bỏ nội dung sao cho phù hợp</td><td>Nguyễn Văn Đức</td><td>27/04/2026</td></tr><tr><td>Dựng video</td><td>Chuyển cảnh, bảng tên và phụ đề</td><td>Nguyễn Văn Đức\nVũ Trường Giang\nHoàng Minh Hiếu</td><td>28/04/2026</td></tr><tr><td>Viết báo cáo</td><td>Viết tài liệu báo cáo cho bài tập của nhóm</td><td>Nguyễn Văn Đức</td><td>29/04/2026</td></tr></tbody></table></div><h3>II. NHẬT KÍ HOẠT ĐỘNG</h3><div class=\"table-container\"><table class=\"report-table\"><thead><tr><th>Buổi làm việc</th><th>Mục tiêu/Nội dung chính của buổi làm việc</th><th>Ý kiến thảo luận của các thành viên</th><th>Kết luận/Nhiệm vụ tiếp theo</th><th>Thành viên tham gia</th><th>Thành viên vắng mặt</th></tr></thead><tbody><tr><td>Buổi 1 ngày 22/04/2026\nBắt đầu: 21h\nKết thúc: 22h30</td><td>Xác định chủ đề thuyết trình của cả nhóm</td><td>Các thành viên đóng góp sôi nổi</td><td>Chọn ra được chủ đề thuyết trình của nhóm: Ứng dụng của AI trong nghiên cứu Khoa học tự nhiên & Kỹ thuật – Công nghệ\nNhiệm vụ tiếp theo là tìm kiếm thông tin và các chủ đề liên quan</td><td>Nguyễn Văn Đức\nVũ Trường Giang\nRần Thị Ngọc Hân\nPhạm Trung Hiếu\nHoàng Minh Hiếu</td><td></td></tr><tr><td>Buổi 2 ngày 24/04/2026\nBắt đầu: 21h\nKết thúc 22h</td><td>Phân công thuyết trình cho từng thành viên của nhóm\nPhân công nhiêm vụ cụ thể của từng thành viên</td><td>Các thành viên chủ động nhận công việc</td><td>Phân chia được công việc cụ thể cho từng thành viên\nNhiệm vụ tiếp theo là quay video thuyết trình của cả nhóm</td><td>Nguyễn Văn Đức\nVũ Trường Giang\nRần Thị Ngọc Hân\nPhạm Trung Hiếu\nHoàng Minh Hiếu</td><td></td></tr><tr><td>Buổi 3 ngày 25/04/2026\nBắt đầu: 8h\nKết thúc 11h</td><td>Quay video thuyết trình cho cả nhóm</td><td>Các thành viên đã có mặt đầy đủ, chủ động hoàn thành công việc thuyết trình</td><td>Hoàn thành việc thuyết trình\nNhiệm vụ tiếp theo là chỉnh sửa và hoàn thiện video nhóm</td><td>Nguyễn Văn Đức\nVũ Trường Giang\nRần Thị Ngọc Hân\nPhạm Trung Hiếu\nHoàng Minh Hiếu</td><td></td></tr><tr><td>Buổi 4 ngày 29/04/2026\nBắt đầu: 20h\nKết thúc 21h30</td><td>Hoàn thiện video thuyết trình của cả nhóm</td><td>Các thành viên đã đóng góp sôi nổi để hoàn thiện video</td><td>Hoàn thiện video thuyết trình của cả nhóm</td><td>Nguyễn Văn Đức\nVũ Trường Giang\nRần Thị Ngọc Hân\nPhạm Trung Hiếu\nHoàng Minh Hiếu</td><td></td></tr></tbody></table></div><h3>III. CÔNG CỤ CÔNG NGHỆ SỐ & AI ĐÃ SỬ DỤNG</h3><div class=\"table-container\"><table class=\"report-table\"><thead><tr><th>Tên công cụ</th><th>Mục đích sử dụng</th><th>Cách thức triển khai\n(Các prompts đã dùng)</th><th>Đánh giá hiệu quả</th></tr></thead><tbody><tr><td>ChatGPT/Gemini</td><td>Lên ý tưởng, viết kịch bản, hướng dẫn quay video, chia công việc</td><td>Sử dụng các câu lệnh: “Đóng vai chuyên gia trong lĩnh vực nghiên cứu Khoa học tự nhiên & Kỹ thuật – Công nghệ, hãy nêu cho tôi 3 ứng dụng nổi bật của trí tuệ nhân tạo trong lĩnh vực này”,…</td><td>Tiết kiệm rất nhiều thời gian lên ý tưởng.</td></tr><tr><td>Canva/CapCut</td><td>Thiết kế video</td><td>Sử dụng các mẫu thiết kế công nghệ để làm phần chuyển cảnh cho các phần nói khác nhau</td><td>Video chuyên nghiệp, hình ảnh bắt mắt.</td></tr><tr><td>Youtube</td><td>Đăng tải video và tạo phụ đề</td><td>Sử dụng tính năng tạo phụ đề tự động của Youtube, sau đó sửa lại cho phù hợp với video</td><td>Tiết kiệm được thời gian làm phụ đề</td></tr></tbody></table></div><h3>IV. TỔNG KẾT VÀ ĐÁNH GIÁ</h3><p><strong class=\"label-highlight\">Điểm mạnh của nhóm:</strong> (Sự đoàn kết, kỹ năng công nghệ, quản lý thời gian...)</p><ul><li>Đoàn kết tốt, tuy bắt đầu công việc muộn thế nhưng cả nhóm đã đồng lòng để hoàn thiện bài tập trong thời gian cho phép.</li><li>Tự giác phân chia và lựa chọn công việc dựa trên điểm mạnh của cá nhân, đóng góp tích cực cho bài tập chung.</li><li>Biết cách sử dụng các công cụ AI để tìm kiếm thông tin và tổng hợp thông tin. Sử dụng AI để định hướng nội dung thuyết trình của nhóm và tự chuẩn bị nội dung thuyết trình của từng cá nhân.</li></ul><p><strong class=\"label-highlight\">Khó khăn và cách khắc phục:</strong> </p><ul><li>Bắt đầu công việc muộn, trùng với thời điểm chuẩn bị kỳ nghỉ lễ dài ngày. Cả nhóm đã khắc phục bằng cách đoàn kết để hoàn thiện bài tập trong thời gian trước khi nghỉ lễ.</li><li>Khó khăn khi quay video tại trường vào ngày cuối tuần, khắc phục bằng cách từng thành viên chủ động chuẩn bị phần nói của bản thân tốt nhất, hoàn thiện phần thuyết trình trước khi trường đóng cửa.</li></ul><p><strong class=\"label-highlight\">Bài học kinh nghiệm rút ra:</strong> (Những gì nhóm đã học được về AI và kỹ năng làm việc nhóm sau bài tập này).</p><ul><li>Chủ động chuẩn bị bài tập và phân chia công việc dựa trên tinh thần tự giác và trách  nhiệm sẽ giúp hoàn thành công việc nhanh hơn rất nhiều.</li><li>Các công cụ AI đóng vai trò quan trọng trong việc định hướng nội dung thuyết trình, tối ưu hoá thời gian chuẩn bị nội dung và hướng dẫn cách làm bài tập sao cho chuyên nghiệp.</li></ul><p>Bảng tự đánh giá mức độ đóng góp (Sinh viên đánh giá ngang hàng trên thang điểm 10 và cộng chia trung bình. Nhóm trưởng/thư ký nhóm tổng hợp kết quả. Cột tô vàng là cả nhóm cùng đánh giá.)</p><div class=\"table-container\"><table class=\"report-table\"><thead><tr><th>Mã sinh viên</th><th>Tên thành viên</th><th>Chất lượng ý kiến/bài làm</th><th>Tinh thần/Thái độ làm việc nhóm</th><th>SV tự đánh giá (trên thang điểm 10)</th><th>Đánh giá của các thành viên trong nhóm (Trên thang điểm 10)</th><th>Điểm đánh giá TB (điểm TB của các thành viên đánh giá)</th></tr></thead><tbody><tr><td>25021736</td><td>Nguyễn Văn Đức</td><td>Tốt</td><td>Làm việc tốt, có trách nhiệm, gương mẫu</td><td>10</td><td>10, 9, 10, 9</td><td>9.5</td></tr><tr><td>25021744</td><td>Vũ Trường Giang</td><td>Tốt</td><td>Sáng tạo, linh hoạt, quay video tốt</td><td>10</td><td>9.5, 10, 9. 9</td><td>9.4</td></tr><tr><td>25021752</td><td>Rần Thị Ngọc Hân</td><td>Tốt</td><td>Chăm chỉ, tốt bụng, có trách nhiệm với nhóm</td><td>9.5</td><td>10, 9.5, 9, 9</td><td>9.4</td></tr><tr><td>25021759</td><td>Hoàng Minh Hiếu</td><td>Tốt</td><td>Hoạt động nhóm năng nổ, đóng góp</td><td>10</td><td>10, 9, 9, 9</td><td>9.3</td></tr><tr><td>25021766</td><td>Phạm Trung Hiếu</td><td>Tốt</td><td>Hoà đồng, hết mình với công việc tập thể</td><td>10</td><td>9.9, 9.5, 9. 9</td><td>9.4</td></tr></tbody></table></div>"
  }
};

const overlay = document.getElementById('project-detail-overlay');
const closeBtn = document.getElementById('detail-close-btn');
const dynamicContent = document.getElementById('detail-dynamic-content');

if (overlay && closeBtn && dynamicContent) {
    // Add click listeners to cards
    document.querySelectorAll('.project-card.clickable-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.getAttribute('data-project-id');
            openOverlay(id);
        });
    });

    // Close button click listener triggers history.back()
    closeBtn.addEventListener('click', () => {
        if (window.location.hash.startsWith('#project-')) {
            history.back(); // Triggers popstate to close
        } else {
            closeOverlay();
        }
    });

    // Listen to popstate event (browser back/forward button)
    window.addEventListener('popstate', (event) => {
        if (window.location.hash.startsWith('#project-')) {
            const id = window.location.hash.replace('#project-', '');
            openOverlay(id);
        } else {
            closeOverlay();
        }
    });

    // Support opening project directly on page load if hash exists
    if (window.location.hash.startsWith('#project-')) {
        const id = window.location.hash.replace('#project-', '');
        setTimeout(() => openOverlay(id), 100);
    }
}

// Function to close the overlay cleanly and reset history hash
function closeOverlay() {
    if (overlay && overlay.classList.contains('show')) {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        dynamicContent.innerHTML = '';
        overlay.scrollTop = 0; // reset scroll position
        
        // Hide overlay scroll-to-top button
        const overlayScrollBtn = document.getElementById('overlay-scroll-top');
        if (overlayScrollBtn) {
            overlayScrollBtn.classList.remove('visible');
        }
        
        // Remove hash from URL if it was a project hash
        if (window.location.hash.startsWith('#project-')) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }
}

// Function to open overlay cleanly and set history hash
function openOverlay(id) {
    const data = reportsData[id];
    if (data) {
        renderProjectDetail(id, data);
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        overlay.scrollTop = 0; // ensure scroll position starts at top
        
        // Push state if not already matching hash
        if (window.location.hash !== `#project-${id}`) {
            history.pushState({ projectId: id }, "", `#project-${id}`);
        }
    }
}

function renderProjectDetail(id, data) {
    let categoryText = "Bài thực hành";
    if (id === "giuaki") categoryText = "Bài tập giữa kỳ";

    const driveLinks = {
        "bai1": "https://drive.google.com/file/d/1eObSegXYfAHwRP9AbR65hpz7vXQfdR3A/view?usp=sharing",
        "bai2": "https://drive.google.com/file/d/1PPeqqkBWo-QARp-_XorWRe4I1lQQMrxf/view?usp=sharing",
        "bai3": "https://drive.google.com/file/d/1Mfl7mEsfLs5ysjO-sg-LqtD_QjjU80P7/view?usp=sharing",
        "bai4": "https://drive.google.com/file/d/1Hq7u5lA-4VC3z8d6Qcats63Rb2lodaYu/view?usp=sharing",
        "bai5": "https://drive.google.com/file/d/1ToJtjfS4Sqv00-PeeVh4eVXmlbGClaj-/view?usp=sharing",
        "bai6": "https://drive.google.com/file/d/1dktXbIpK7FGVgbReS7Omjxzwp2Ed7eE4/view?usp=sharing",
        "giuaki": "https://drive.google.com/file/d/1Nb2qQNspUpA1CA2AXU6Fks5a8A167qS2/view?usp=sharing"
    };

    const viewUrl = driveLinks[id] || "#";
    const downloadLink = `<a href="${viewUrl}" target="_blank" class="btn btn-outline" style="margin-top: 1rem;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0z"/><circle cx="12" cy="12" r="3"/></svg> Xem file báo cáo (PDF)</a>`;

    let titleText = data.title;
    if (id === "bai1") titleText = "Bài 1: Tổ Chức và Quản Lí Dữ Liệu Cá Nhân";
    if (id === "bai2") titleText = "Bài 2: Tìm Kiếm & Đánh Giá Thông Tin Học Thuật";
    if (id === "bai3") titleText = "Bài 3: Viết Prompt Hiệu Quả Trong Học Tập";
    if (id === "bai4") titleText = "Bài 4: Kỹ Năng Giao Tiếp và Hợp Tác Số";
    if (id === "bai5") titleText = "Bài 5: Dự Án Sáng Tạo Nội Dung Số";
    if (id === "bai6") titleText = "Bài 6: Sử Dụng AI Có Trách Nhiệm & Đạo Đức";
    if (id === "giuaki") titleText = "Bài Giữa Kỳ: Hồ Sơ Làm Việc Nhóm & Video Thuyết Trình";

    // Clean duplicate titles and redundant info from bodyHtml
    let cleanedBody = cleanBodyHtml(data.bodyHtml);

    // Generate Table of Contents from h3 headings for both inline (mobile) and sidebar (desktop)
    const tocHtml = generateTOC(cleanedBody, false);
    const sidebarTocHtml = generateTOC(cleanedBody, true);

    const contentHtml = `
        <div class="detail-header">
            <span class="detail-badge">${categoryText}</span>
            <h1 class="detail-title">${titleText}</h1>
            ${downloadLink ? `<div class="detail-header-actions">${downloadLink}</div>` : ''}
        </div>
        
        <div class="detail-layout-grid">
            <!-- Main Content Area -->
            <div class="detail-main-content">
                ${tocHtml ? `<nav class="detail-toc collapsible collapsed" id="mobile-toc">
                    <button class="detail-toc-header-btn" id="mobile-toc-toggle" aria-expanded="false" type="button">
                        <span class="detail-toc-title" style="margin-bottom:0; padding-bottom:0; border:none; font-size:0.9rem;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary); margin-right:0.5rem; display:inline-block; vertical-align:middle;" class="lucide lucide-list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                            Mục lục
                        </span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="detail-toc-body">
                        <ol class="detail-toc-list">${tocHtml}</ol>
                    </div>
                </nav>` : ''}
                
                <div class="detail-body">
                    ${cleanedBody}
                </div>
                
                <div class="detail-action-bar">
                    ${downloadLink}
                </div>
            </div>
            
            <!-- Sticky Sidebar for Desktop Viewports -->
            <div class="detail-sidebar">
                ${sidebarTocHtml ? `
                <div class="sidebar-toc">
                    <div class="sidebar-toc-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
                        Mục lục
                    </div>
                    <ol class="sidebar-toc-list">${sidebarTocHtml}</ol>
                </div>` : ''}
            </div>
        </div>
    `;
    
    dynamicContent.innerHTML = contentHtml;
    
    // Apply all rich interactive components (tabs, lightbox, folder tree, video player, golden cards)
    enhanceReportContent(dynamicContent, id);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Setup TOC smooth scrolling
    setupTOCLinks();
    
    // Setup mobile TOC collapsible event
    const mobileTOC = document.getElementById('mobile-toc');
    const mobileTOCToggle = document.getElementById('mobile-toc-toggle');
    if (mobileTOC && mobileTOCToggle) {
        mobileTOCToggle.addEventListener('click', () => {
            const isCollapsed = mobileTOC.classList.contains('collapsed');
            if (isCollapsed) {
                mobileTOC.classList.remove('collapsed');
                mobileTOCToggle.setAttribute('aria-expanded', 'true');
            } else {
                mobileTOC.classList.add('collapsed');
                mobileTOCToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/**
 * Generate a Table of Contents from h3 elements in the body HTML.
 */
function generateTOC(bodyHtml, isSidebar = false) {
    const temp = document.createElement('div');
    temp.innerHTML = bodyHtml;
    const headings = temp.querySelectorAll('h3');
    
    if (headings.length < 2) return ''; // Not enough headings for TOC

    let tocItems = '';
    headings.forEach((h, index) => {
        const text = h.textContent.trim();
        const linkClass = isSidebar ? 'sidebar-toc-link' : 'toc-link';
        tocItems += `<li><a href="#" class="${linkClass}" data-toc-index="${index}">${text}</a></li>`;
    });
    return tocItems;
}

/**
 * Setup TOC link click handlers for smooth scrolling to sections.
 */
function setupTOCLinks() {
    const tocLinks = document.querySelectorAll('.toc-link, .sidebar-toc-link');
    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const index = parseInt(link.getAttribute('data-toc-index'));
            const headings = document.querySelectorAll('.detail-body h3');
            if (headings[index]) {
                const offset = 40; 
                const elementPosition = headings[index].getBoundingClientRect().top;
                const offsetPosition = elementPosition + overlay.scrollTop - offset;
                
                overlay.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Setup the scroll actions inside the project detail overlay (scroll-to-top, reading progress, active TOC links).
 */
function setupOverlayScrollTop() {
    const scrollBtn = document.getElementById('overlay-scroll-top');
    if (!overlay) return;

    const progressBar = document.getElementById('overlay-progress');
    const showThreshold = 400;

    const handleScroll = () => {
        // 1. Scroll-to-top button visibility
        if (scrollBtn) {
            if (overlay.scrollTop > showThreshold) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        }
        
        // 2. Reading progress bar width
        if (progressBar) {
            const scrollTop = overlay.scrollTop;
            const scrollHeight = overlay.scrollHeight - overlay.clientHeight;
            const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            progressBar.style.width = scrollPercent + '%';
        }
        
        // 3. Dynamic active TOC item highlight
        const headings = document.querySelectorAll('.detail-body h3');
        const tocLinks = document.querySelectorAll('.sidebar-toc-link');
        if (headings.length > 0 && tocLinks.length > 0) {
            let activeIndex = -1;
            
            // Check if user has scrolled to the bottom of the article
            const isAtBottom = overlay.scrollTop + overlay.clientHeight >= overlay.scrollHeight - 15;
            
            if (isAtBottom) {
                activeIndex = headings.length - 1;
            } else {
                // Find headings relative to the screen viewport top
                headings.forEach((heading, index) => {
                    const rect = heading.getBoundingClientRect();
                    if (rect.top <= 150) {
                        activeIndex = index;
                    }
                });
            }
            
            tocLinks.forEach((link, index) => {
                if (index === activeIndex) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }
    };

    overlay.addEventListener('scroll', handleScroll);

    if (scrollBtn) {
        scrollBtn.addEventListener('click', () => {
            overlay.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}


/**
 * Strips leading duplicate title elements from bodyHtml.
 * The overlay header already shows the assignment title, so we remove:
 * - Leading <h4>BÁO CÁO</h4>, <h4>BÁO CÁO THỰC HÀNH</h4> etc.
 * - Leading subject-name <h4> tags
 * - Leading <p>Báo cáo</p>, <p>Thông tin chung</p> etc.
 * - Leading student info lines (Họ và tên, Mã sinh viên)
 * - PDF page-block wrapper divs (preserving inner content)
 */
function cleanBodyHtml(html) {
    // Use a temporary DOM element for safe HTML manipulation
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Title patterns to remove from the start of the content
    const titlePatterns = [
        /^báo\s*c\s*áo/i,
        /^báo cáo thực hành/i,
        /^báo c áo c á nh ân/i,
        /^tổ chức và quản lí dữ liệu/i,
        /^tìm kiếm và đánh giá thông tin/i,
        /^kỹ năng viết prompt/i,
        /^kỹ năng giao ti/i,
        /^dự án sáng tạo nội dung/i,
        /^sử dụng ai có trách nhiệm/i,
        /^thông tin chung$/i,
        /^học phần:/i,
        /^hồ sơ làm việc nhóm/i,
    ];

    // Student info patterns (already shown in detail-meta)
    const infoPatterns = [
        /^họ và tên:/i,
        /^họ tên:/i,
        /^mã sinh viên:/i,
        /^ngành học:/i,
    ];

    // Strip student info paragraphs from anywhere in the document
    const paragraphs = temp.querySelectorAll('p');
    paragraphs.forEach(p => {
        const text = p.textContent.trim();
        for (const pat of infoPatterns) {
            if (pat.test(text)) {
                p.parentNode.removeChild(p);
                break;
            }
        }
    });

    // Remove leading elements that match title or info patterns
    let removedCount = 0;
    const maxRemove = 8; // safety limit

    while (temp.firstElementChild && removedCount < maxRemove) {
        const el = temp.firstElementChild;
        const text = (el.textContent || '').trim();
        const tag = el.tagName.toLowerCase();

        let shouldRemove = false;

        // Check if it's a title h4 or p at the very start
        if (tag === 'h4' || tag === 'p') {
            for (const pat of titlePatterns) {
                if (pat.test(text)) {
                    shouldRemove = true;
                    break;
                }
            }
        }

        // Check for student info paragraphs
        if (tag === 'p' && !shouldRemove) {
            for (const pat of infoPatterns) {
                if (pat.test(text)) {
                    shouldRemove = true;
                    break;
                }
            }
        }

        if (shouldRemove) {
            temp.removeChild(el);
            removedCount++;
        } else {
            break; // Stop at first non-matching element
        }
    }

    // Unwrap pdf-page-block divs (preserve inner content)
    const pageBlocks = temp.querySelectorAll('.pdf-page-block');
    pageBlocks.forEach(block => {
        while (block.firstChild) {
            block.parentNode.insertBefore(block.firstChild, block);
        }
        block.parentNode.removeChild(block);
    });

    // After unwrapping, clean any leading title elements again
    // (some were inside pdf-page-block wrappers)
    removedCount = 0;
    while (temp.firstElementChild && removedCount < maxRemove) {
        const el = temp.firstElementChild;
        const text = (el.textContent || '').trim();
        const tag = el.tagName.toLowerCase();

        let shouldRemove = false;

        if (tag === 'h4' || tag === 'p') {
            for (const pat of titlePatterns) {
                if (pat.test(text)) {
                    shouldRemove = true;
                    break;
                }
            }
        }

        if (tag === 'p' && !shouldRemove) {
            for (const pat of infoPatterns) {
                if (pat.test(text)) {
                    shouldRemove = true;
                    break;
                }
            }
        }

        if (shouldRemove) {
            temp.removeChild(el);
            removedCount++;
        } else {
            break;
        }
    }

    return temp.innerHTML;
}


/* ==========================================================================
   NEW INTERACTIVE PORTFOLIO ENHANCEMENTS AND HELPERS
   ========================================================================== */

// 1. DATA FOR INTERACTIVE PROMPT ENGINEERING COMPARISON (LAB 3)
const promptEngineeringData = {
  "task1": {
    "title": "Tác vụ 1: Tóm tắt tài liệu học thuật",
    "desc": "Tóm tắt tổng quan về Deep Learning cho người mới bắt đầu.",
    "levels": {
      "basic": {
        "prompt": "Tóm tắt bài viết sau về Deep Learning\n\n(Nội dung bài viết về Deep Learning...)",
        "images": [
          { "src": "assets/extracted_media/bai3_image1.png", "caption": "Hình 1: Kết quả tóm tắt từ Prompt Cơ bản" }
        ]
      },
      "improved": {
        "prompt": "Hãy tóm tắt bài viết về Deep Learning dưới đây thành 3 đoạn văn ngắn:\n- Đoạn 1: Định nghĩa\n- Đoạn 2: Cách thức hoạt động\n- Đoạn 3: Ứng dụng thực tế\n\n(Nội dung bài viết về Deep Learning...)",
        "images": [
          { "src": "assets/extracted_media/bai3_image2.png", "caption": "Hình 2: Kết quả tóm tắt phân tách 3 đoạn từ Prompt Cải tiến" }
        ]
      },
      "advanced": {
        "prompt": "Đóng vai một Giảng viên Khoa học máy tính. Hãy tóm tắt văn bản dưới đây về Deep Learning cho một sinh viên Đại học chuyên ngành Khoa học máy tính.\n\nYêu cầu:\n- Sử dụng ngôn ngữ truyền cảm hứng, dễ hiểu.\n- Tuyệt đối tránh các phương trình toán học phức tạp.\n- Trình bày dưới dạng Bullet points (gạch đầu dòng).\n- Kết thúc bằng một câu hỏi gợi mở tư duy cho học sinh.\n\n(Nội dung bài viết về Deep Learning...)",
        "images": [
          { "src": "assets/extracted_media/bai3_image3.png", "caption": "Hình 3: Kết quả tóm tắt dạng giảng viên từ Prompt Nâng cao (Phần 1)" },
          { "src": "assets/extracted_media/bai3_image4.png", "caption": "Hình 4: Kết quả tóm tắt dạng giảng viên từ Prompt Nâng cao (Phần 2)" }
        ]
      }
    }
  },
  "task2": {
    "title": "Tác vụ 2: Giải thích khái niệm phức tạp",
    "desc": "Giải thích khái niệm Tính đa hình (Polymorphism) trong lập trình Java.",
    "levels": {
      "basic": {
        "prompt": "Giải thích tính đa hình trong lập trình Java",
        "images": [
          { "src": "assets/extracted_media/bai3_image5.png", "caption": "Hình 5: Kết quả giải thích khô khan từ Prompt Cơ bản" },
          { "src": "assets/extracted_media/bai3_image6.png", "caption": "Hình 6: Lý thuyết đa hình cơ bản không có ví dụ trực quan" }
        ]
      },
      "improved": {
        "prompt": "Giải thích chi tiết tính đa hình (Polymorphism) trong Java. Hãy cung cấp 1 ví dụ bằng code để minh hoạ",
        "images": [
          { "src": "assets/extracted_media/bai3_image7.png", "caption": "Hình 7: Đưa ra lý thuyết đa hình chi tiết kèm code mẫu" },
          { "src": "assets/extracted_media/bai3_image8.png", "caption": "Hình 8: Code ví dụ Java từ Prompt Cải tiến (Phần 1)" },
          { "src": "assets/extracted_media/bai3_image9.png", "caption": "Hình 9: Code ví dụ Java từ Prompt Cải tiến (Phần 2)" }
        ]
      },
      "advanced": {
        "prompt": "Đóng vai một Senior Java Developer đang phỏng vấn thực tập sinh. Hãy giải thích khái niệm \"Tính đa hình\" (Polymorphism).\n\nHãy suy nghĩ và trả lời theo từng bước sau:\n- Bước 1: Bắt đầu bằng một phép ẩn dụ trong đời sống thực (ví dụ: Một người đàn ông vừa là 'Bố' ở nhà, vừa là 'Nhân viên' ở công ty).\n- Bước 2: Phân biệt rõ sự khác nhau giữa Compile-time (Overloading) và Run-time (Overriding).\n- Bước 3: Viết một đoạn code Java ngắn, chuẩn Clean Code minh họa cho Bước 2 và có chú thích (comment) giải thích luồng thực thi.",
        "images": [
          { "src": "assets/extracted_media/bai3_image10.png", "caption": "Hình 10: Ẩn dụ thực tế sinh động từ Prompt Nâng cao" },
          { "src": "assets/extracted_media/bai3_image11.png", "caption": "Hình 11: So sánh Overloading vs Overriding chi tiết" },
          { "src": "assets/extracted_media/bai3_image12.png", "caption": "Hình 12: Code ví dụ Java chuẩn Clean Code kèm giải thích luồng" }
        ]
      }
    }
  },
  "task3": {
    "title": "Tác vụ 3: Tạo bộ câu hỏi ôn tập",
    "desc": "Tạo câu hỏi trắc nghiệm ôn tập về phép nhân ma trận - Đại số tuyến tính.",
    "levels": {
      "basic": {
        "prompt": "Tạo câu hỏi trắc nghiệm về phép nhân ma trận",
        "images": [
          { "src": "assets/extracted_media/bai3_image13.png", "caption": "Hình 13: Kết quả câu hỏi ngẫu nhiên từ Prompt Cơ bản" },
          { "src": "assets/extracted_media/bai3_image14.png", "caption": "Hình 14: Thiếu đáp án đúng hoặc giải thích chi tiết" },
          { "src": "assets/extracted_media/bai3_image15.png", "caption": "Hình 15: Câu hỏi quá đơn giản không bám sát chương trình" }
        ]
      },
      "improved": {
        "prompt": "Tạo 5 câu hỏi trắc nghiệm về điều kiện và cách tính phép nhân 2 ma trận. Mỗi câu có 4 đáp án A, B, C, D và chỉ ra đáp án đúng",
        "images": [
          { "src": "assets/extracted_media/bai3_image16.png", "caption": "Hình 16: Câu hỏi có cấu trúc A, B, C, D từ Prompt Cải tiến" },
          { "src": "assets/extracted_media/bai3_image17.png", "caption": "Hình 17: Đã có chỉ thị đáp án đúng nhưng chưa giải thích" }
        ]
      },
      "advanced": {
        "prompt": "Đóng vai một giáo viên Toán. Hãy tạo một bài kiểm tra ngắn gồm 3 câu hỏi trắc nghiệm về \"Phép nhân ma trận\" cho sinh viên năm nhất.\n\nQuy tắc bắt buộc cho mỗi câu hỏi:\n- Chỉ ra rõ kích thước ma trận (ví dụ: ma trận 2x3 nhân ma trận 3x2).\n- Cung cấp 4 đáp án (A, B, C, D).\n- Đưa ra đáp án đúng và PHẢI có phần \"Giải thích chi tiết\": giải thích từng bước tính toán tại sao ra kết quả đó, và tại sao các phương án nhiễu lại sai.",
        "images": [
          { "src": "assets/extracted_media/bai3_image18.png", "caption": "Hình 18: Đề bài chỉ rõ kích thước ma trận từ Prompt Nâng cao" },
          { "src": "assets/extracted_media/bai3_image19.png", "caption": "Hình 19: Đáp án đúng và phần giải thích chi tiết từng bước" },
          { "src": "assets/extracted_media/bai3_image20.png", "caption": "Hình 20: Giải thích vì sao các đáp án nhiễu khác lại sai" },
          { "src": "assets/extracted_media/bai3_image21.png", "caption": "Hình 21: Kết quả học thuật chất lượng cao của AI" }
        ]
      }
    }
  }
};

// 2. MAIN REPORT ENHANCER DISPATCHER
function enhanceReportContent(container, id) {
    // Lightbox attachment for images
    const images = container.querySelectorAll('.detail-body img, .prompt-img-card img');
    images.forEach(img => {
        img.addEventListener('click', () => {
            openLightbox(img.src, img.alt);
        });
    });

    // Lab 1 specific features
    if (id === 'bai1') {
        enhanceFolderTree(container);
        enhanceBackupCards(container);
    }

    // Lab 3 specific features
    if (id === 'bai3') {
        const h3Elements = container.querySelectorAll('.detail-body h3');
        let targetH3 = null;
        h3Elements.forEach(h => {
            if (h.textContent.includes('II. Xây dựng các phiên bản Prompt')) {
                targetH3 = h;
            }
        });

        if (targetH3) {
            let sibling = targetH3.nextElementSibling;
            while (sibling && sibling.tagName.toLowerCase() !== 'h3') {
                const next = sibling.nextElementSibling;
                sibling.parentNode.removeChild(sibling);
                sibling = next;
            }
            
            const widget = createPromptWidget();
            targetH3.parentNode.insertBefore(widget, sibling);
        }
    }

    // Lab 6 specific features
    if (id === 'bai6') {
        enhancePrinciplesGrid(container);
    }

    // Video player specific features (Midterm & Lab 5)
    if (id === 'giuaki' || id === 'bai5') {
        enhanceVideoPlayer(container);
    }

    // General callout boxes styling
    enhanceCallouts(container);
}

// 3. FOLDER TREE PARSER & BUILDER (LAB 1)
function enhanceFolderTree(container) {
    const treeBlocks = container.querySelectorAll('.folder-tree-block');
    treeBlocks.forEach(block => {
        const pre = block.querySelector('pre');
        if (!pre) return;
        const rawText = pre.textContent;
        const nodes = parseFolderTreeText(rawText);
        
        // Convert block to styleable tree
        block.className = 'folder-tree';
        block.innerHTML = '';
        
        // Tree header
        const header = document.createElement('div');
        header.className = 'folder-tree-header';
        
        const title = document.createElement('div');
        title.className = 'folder-tree-title';
        title.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--primary);" class="lucide lucide-folder-open"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg> Cây thư mục`;
        header.appendChild(title);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-tree-btn';
        copyBtn.type = 'button';
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> Copy`;
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(rawText).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg> Đã Copy`;
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            });
        });
        header.appendChild(copyBtn);
        block.appendChild(header);
        
        // Tree contents
        const treeDOM = buildTreeDOM(nodes);
        block.appendChild(treeDOM);
    });
}

function parseFolderTreeText(text) {
    const lines = text.split('\n');
    const nodes = [];
    
    lines.forEach(line => {
        if (!line.trim()) return;
        
        let iconIdx = line.indexOf('📁');
        let isFolder = true;
        
        if (iconIdx === -1) {
            iconIdx = line.indexOf('📄');
            isFolder = false;
        }
        
        if (iconIdx === -1) {
            // Fallback for non-emoji tree nodes
            const cleanLine = line.replace(/[├──└──│\s]+/g, '');
            if (cleanLine) {
                isFolder = false;
                iconIdx = line.indexOf(cleanLine);
            }
        }
        
        if (iconIdx !== -1) {
            const prefix = line.substring(0, iconIdx);
            const depth = Math.floor(prefix.length / 4);
            
            let name = line.substring(iconIdx).replace(/[📁📄]/g, '').trim();
            let comment = '';
            
            // Check for inline descriptions/comments
            const commentIdx = name.indexOf('//');
            if (commentIdx !== -1) {
                comment = name.substring(commentIdx).trim();
                name = name.substring(0, commentIdx).trim();
            }
            
            nodes.push({ depth, name, isFolder, comment });
        }
    });
    
    return nodes;
}

function buildTreeDOM(nodes) {
    const rootUl = document.createElement('ul');
    rootUl.className = 'tree-root';
    
    const stack = [rootUl];
    
    nodes.forEach(node => {
        const li = document.createElement('li');
        li.className = 'tree-node';
        li.classList.add(node.isFolder ? 'tree-folder' : 'tree-file');
        
        const row = document.createElement('div');
        row.className = 'tree-row';
        
        const arrow = document.createElement('span');
        arrow.className = 'tree-arrow';
        if (node.isFolder) {
            arrow.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon"><polyline points="9 18 15 12 9 6"/></svg>`;
            arrow.classList.add('rotated');
        }
        row.appendChild(arrow);
        
        const icon = document.createElement('span');
        icon.className = 'tree-icon';
        if (node.isFolder) {
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;
        } else {
            icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>`;
        }
        row.appendChild(icon);
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'tree-name';
        nameSpan.textContent = node.name;
        row.appendChild(nameSpan);
        
        if (node.comment) {
            const commentSpan = document.createElement('span');
            commentSpan.className = 'tree-comment';
            commentSpan.textContent = node.comment;
            row.appendChild(commentSpan);
        }
        
        li.appendChild(row);
        
        if (node.isFolder) {
            row.addEventListener('click', (e) => {
                e.stopPropagation();
                const parentLi = row.closest('.tree-node');
                const chevron = row.querySelector('.tree-arrow');
                if (parentLi) {
                    const isCollapsed = parentLi.classList.toggle('collapsed');
                    if (isCollapsed) {
                        chevron.classList.remove('rotated');
                    } else {
                        chevron.classList.add('rotated');
                    }
                }
            });
        }
        
        while (stack.length - 1 > node.depth) {
            stack.pop();
        }
        
        const parentUl = stack[stack.length - 1];
        parentUl.appendChild(li);
        
        if (node.isFolder) {
            const childUl = document.createElement('ul');
            li.appendChild(childUl);
            stack.push(childUl);
        }
    });
    
    return rootUl;
}

// 4. BACKUP CARD GRID FORMATTER (LAB 1)
function enhanceBackupCards(container) {
    const headings = container.querySelectorAll('.detail-body h4');
    let m1Head = null;
    let m2Head = null;
    
    headings.forEach(h => {
        if (h.textContent.includes('Phương pháp 1')) m1Head = h;
        if (h.textContent.includes('Phương pháp 2')) m2Head = h;
    });
    
    if (m1Head && m2Head) {
        const m1Elements = [];
        let curr = m1Head.nextElementSibling;
        while (curr && curr !== m2Head) {
            m1Elements.push(curr);
            curr = curr.nextElementSibling;
        }
        
        const m2Elements = [];
        let curr2 = m2Head.nextElementSibling;
        while (curr2 && curr2.tagName.toLowerCase() !== 'h3') {
            m2Elements.push(curr2);
            curr2 = curr2.nextElementSibling;
        }
        
        const grid = document.createElement('div');
        grid.className = 'backup-card-grid';
        
        const card1 = document.createElement('div');
        card1.className = 'backup-card';
        card1.innerHTML = `
            <div class="backup-card-header">
                <div class="backup-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud"><path d="M17.5 19A3.5 3.5 0 0 0 21 15.5c0-2.79-2.54-4.5-5-4.5-.42-1.89-1.74-3.5-3.5-4.22A5 5 0 0 0 3 10c0 2.2.8 4.2 2.1 5.7M7 15l5-5 5 5M12 10v12"/></svg>
                </div>
                <h4 class="backup-card-title">Sao lưu Đám mây (Cloud)</h4>
            </div>
        `;
        const card1Content = document.createElement('div');
        card1Content.className = 'backup-card-content';
        m1Elements.forEach(el => card1Content.appendChild(el.cloneNode(true)));
        card1.appendChild(card1Content);
        
        const card2 = document.createElement('div');
        card2.className = 'backup-card';
        card2.innerHTML = `
            <div class="backup-card-header">
                <div class="backup-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hard-drive"><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6 18h.01M10 18h.01"/><path d="M2 14c.2-3.1 1.7-6.2 4.4-8.2C9.2 3.7 12 3 15 3c2.7 0 5.3.7 7.6 2.1 2.3 1.4 3.9 3.8 4.4 6.9"/></svg>
                </div>
                <h4 class="backup-card-title">Sao lưu Vật lý (Hardware)</h4>
            </div>
        `;
        const card2Content = document.createElement('div');
        card2Content.className = 'backup-card-content';
        m2Elements.forEach(el => card2Content.appendChild(el.cloneNode(true)));
        card2.appendChild(card2Content);
        
        grid.appendChild(card1);
        grid.appendChild(card2);
        
        m1Head.parentNode.replaceChild(grid, m1Head);
        
        m1Elements.forEach(el => el.parentNode.removeChild(el));
        m2Head.parentNode.removeChild(m2Head);
        m2Elements.forEach(el => el.parentNode.removeChild(el));
    }
}

// 5. INTERACTIVE TABS BUILDER FOR PROMPT COMPARING (LAB 3)
function createPromptWidget() {
    const widget = document.createElement('div');
    widget.className = 'prompt-widget';

    const header = document.createElement('div');
    header.className = 'prompt-widget-header';
    
    const levelBar = document.createElement('div');
    levelBar.className = 'prompt-level-bar';

    const body = document.createElement('div');
    body.className = 'prompt-widget-body';

    let activeTask = 'task1';
    let activeLevel = 'advanced';

    const tasks = [
        { id: 'task1', label: 'Tác vụ 1: Tóm tắt' },
        { id: 'task2', label: 'Tác vụ 2: Giải thích code' },
        { id: 'task3', label: 'Tác vụ 3: Tạo câu hỏi' }
    ];

    const levels = [
        { id: 'basic', label: 'Cơ bản (Basic)' },
        { id: 'improved', label: 'Cải tiến (Improved)' },
        { id: 'advanced', label: 'Nâng cao (Advanced) 🔥' }
    ];

    tasks.forEach(t => {
        const btn = document.createElement('button');
        btn.className = `task-tab-btn ${t.id === activeTask ? 'active' : ''}`;
        btn.textContent = t.label;
        btn.type = 'button';
        btn.addEventListener('click', () => {
            activeTask = t.id;
            updateWidget();
        });
        header.appendChild(btn);
    });

    levels.forEach(l => {
        const btn = document.createElement('button');
        btn.className = `level-tab-btn ${l.id === activeLevel ? 'active' : ''}`;
        btn.textContent = l.label;
        btn.type = 'button';
        btn.addEventListener('click', () => {
            activeLevel = l.id;
            updateWidget();
        });
        levelBar.appendChild(btn);
    });

    function updateWidget() {
        header.querySelectorAll('.task-tab-btn').forEach((btn, idx) => {
            btn.classList.toggle('active', tasks[idx].id === activeTask);
        });

        levelBar.querySelectorAll('.level-tab-btn').forEach((btn, idx) => {
            btn.classList.toggle('active', levels[idx].id === activeLevel);
        });

        body.innerHTML = '';
        const taskData = promptEngineeringData[activeTask];
        const levelData = taskData.levels[activeLevel];

        const panel = document.createElement('div');
        panel.className = 'prompt-panel active';

        const textBox = document.createElement('div');
        textBox.className = 'prompt-text-box';
        
        const labelTag = document.createElement('span');
        labelTag.className = 'prompt-label-tag';
        labelTag.textContent = `Prompt ${activeLevel === 'basic' ? 'Cơ bản' : activeLevel === 'improved' ? 'Cải tiến' : 'Nâng cao'}`;
        textBox.appendChild(labelTag);

        const pre = document.createElement('p');
        pre.textContent = levelData.prompt;
        textBox.appendChild(pre);
        panel.appendChild(textBox);

        const imgsContainer = document.createElement('div');
        imgsContainer.className = 'prompt-images-container';
        if (levelData.images.length > 1) {
            imgsContainer.classList.add('grid-2');
        }

        levelData.images.forEach(imgData => {
            const imgCard = document.createElement('div');
            imgCard.className = 'prompt-img-card';

            const img = document.createElement('img');
            img.src = imgData.src;
            img.alt = imgData.caption;
            img.addEventListener('click', () => {
                openLightbox(img.src, img.alt);
            });

            const caption = document.createElement('div');
            caption.className = 'prompt-img-caption';
            caption.textContent = imgData.caption;

            imgCard.appendChild(img);
            imgCard.appendChild(caption);
            imgsContainer.appendChild(imgCard);
        });

        panel.appendChild(imgsContainer);
        body.appendChild(panel);
    }

    widget.appendChild(header);
    widget.appendChild(levelBar);
    widget.appendChild(body);

    updateWidget();
    return widget;
}

// 6. GOLDEN ETHICS PRINCIPLES CARDS FORMATTER (LAB 6)
function enhancePrinciplesGrid(container) {
    let principlesUl = null;
    const headings = container.querySelectorAll('.detail-body h3');
    headings.forEach(h => {
        if (h.textContent.includes('IV. Bộ nguyên tắc cá nhân')) {
            let next = h.nextElementSibling;
            while (next && next.tagName.toLowerCase() !== 'h3') {
                if (next.tagName.toLowerCase() === 'ul') {
                    principlesUl = next;
                    break;
                }
                next = next.nextElementSibling;
            }
        }
    });
    
    if (principlesUl) {
        const lis = principlesUl.querySelectorAll('li');
        if (lis.length >= 4) {
            const manifestoGrid = document.createElement('div');
            manifestoGrid.className = 'manifesto-grid';
            
            const icons = [
                `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-brain"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1 0-3.12 3.014 3.014 0 0 1 0-4.88 2.5 2.5 0 0 1 0-3.12A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 0-3.12 3.014 3.014 0 0 0 0-4.88 2.5 2.5 0 0 0 0-3.12A2.5 2.5 0 0 0 14.5 2Z"/></svg>`,
                `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6v7z"/><path d="m9 12 2 2 4-4"/></svg>`,
                `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
                `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkles"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
                `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
            ];
            
            lis.forEach((li, idx) => {
                const card = document.createElement('div');
                card.className = 'manifesto-card';
                
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    card.style.setProperty('--x', `${x}px`);
                    card.style.setProperty('--y', `${y}px`);
                });
                
                const header = document.createElement('div');
                header.className = 'manifesto-card-header';
                
                const iconBox = document.createElement('div');
                iconBox.className = 'manifesto-icon-box';
                iconBox.innerHTML = icons[idx % icons.length];
                header.appendChild(iconBox);
                
                const strong = li.querySelector('strong');
                const titleText = strong ? strong.textContent.replace(':', '').trim() : `Nguyên tắc ${idx + 1}`;
                
                const titleEl = document.createElement('h4');
                titleEl.className = 'manifesto-card-title';
                titleEl.textContent = titleText;
                header.appendChild(titleEl);
                
                card.appendChild(header);
                
                const body = document.createElement('div');
                body.className = 'manifesto-card-body';
                
                const clonedLi = li.cloneNode(true);
                const strTag = clonedLi.querySelector('strong');
                if (strTag) clonedLi.removeChild(strTag);
                
                body.innerHTML = `<p>${clonedLi.innerHTML.replace(/^[:\s-]+/, '').trim()}</p>`;
                card.appendChild(body);
                
                manifestoGrid.appendChild(card);
            });
            
            principlesUl.parentNode.replaceChild(manifestoGrid, principlesUl);
        }
    }
}

// 7. INLINE YOUTUBE VIDEO LOADER (MIDTERM PROJECT)
function enhanceVideoPlayer(container) {
    const videoCard = container.querySelector('.video-preview-card');
    if (videoCard) {
        videoCard.addEventListener('click', (e) => {
            e.preventDefault();
            
            const videoUrl = videoCard.getAttribute('href');
            let videoId = 'hKGJkNWui8I';
            if (videoUrl.includes('youtu.be/')) {
                videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            } else if (videoUrl.includes('youtube.com/watch')) {
                const urlParams = new URLSearchParams(new URL(videoUrl).search);
                videoId = urlParams.get('v') || 'hKGJkNWui8I';
            }
            
            const wrapper = document.createElement('div');
            wrapper.className = 'video-wrapper';
            wrapper.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" 
                        title="YouTube video player" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowfullscreen></iframe>
            `;
            
            videoCard.parentNode.replaceChild(wrapper, videoCard);
        });
    }
}

// 8. DYNAMIC CALLOUT BOX FORMATTER
function enhanceCallouts(container) {
    const lis = container.querySelectorAll('.detail-body li');
    lis.forEach(li => {
        const strong = li.querySelector('strong.label-highlight');
        if (strong) {
            const text = strong.textContent.trim();
            let calloutType = '';
            let icon = '';
            
            if (text.includes('Hỗ trợ hợp lý') || text.includes('Cơ hội') || text.includes('Lợi ích') || text.includes('Ưu điểm')) {
                calloutType = 'tip';
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
            } else if (text.includes('Gian lận') || text.includes('Rủi ro') || text.includes('Nguy cơ') || text.includes('Hạn chế') || text.includes('Nhược điểm')) {
                calloutType = 'warning';
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-triangle"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>`;
            } else if (text.includes('Lưu ý') || text.includes('Chú ý') || text.includes('Vấn đề') || text.includes('Thách thức')) {
                calloutType = 'note';
                icon = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>`;
            }
            
            if (calloutType) {
                const callout = document.createElement('div');
                callout.className = `callout-box ${calloutType}`;
                
                const iconSpan = document.createElement('span');
                iconSpan.className = 'callout-icon';
                iconSpan.innerHTML = icon;
                callout.appendChild(iconSpan);
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'callout-content';
                
                const clonedLi = li.cloneNode(true);
                const strongInCloned = clonedLi.querySelector('strong');
                if (strongInCloned) clonedLi.removeChild(strongInCloned);
                
                contentDiv.innerHTML = `<strong>${text}</strong> ${clonedLi.innerHTML.replace(/^[:\s-]+/, '').trim()}`;
                callout.appendChild(contentDiv);
                
                li.parentNode.replaceChild(callout, li);
            }
        }
    });
}

// 9. LIGHTBOX IMAGE VIEWER INITIALIZATION
function initLightbox() {
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    if (!lightbox || !lightboxImg || !lightboxClose) return;

    // Close lightbox on clicking close button
    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('show');
    });

    // Close lightbox on clicking outside the content image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content-wrapper') || e.target.id === 'lightbox-modal') {
            lightbox.classList.remove('show');
        }
    });

    // Close lightbox on pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('show')) {
            lightbox.classList.remove('show');
        }
    });
}

function openLightbox(src, alt) {
    const lightbox = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    if (lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightboxImg.alt = alt || 'Minh họa';
        if (lightboxCaption) {
            lightboxCaption.textContent = alt || 'Minh chứng';
        }
        lightbox.classList.add('show');
    }
}

