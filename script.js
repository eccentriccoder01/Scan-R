// QR Code Generator Pro - JavaScript
class QRGenerator {
    constructor() {
        this.init();
        this.bindEvents();
        this.setupTheme();
    }

    init() {
        this.elements = {
            qrText: document.getElementById('qrtext'),
            size: document.getElementById('size'),
            errorLevel: document.getElementById('errorLevel'),
            fgColor: document.getElementById('fgColor'),
            bgColor: document.getElementById('bgColor'),
            generateBtn: document.getElementById('generateBtn'),
            qrResult: document.getElementById('qrResult'),
            qrActions: document.getElementById('qrActions'),
            downloadBtn: document.getElementById('downloadBtn'),
            copyBtn: document.getElementById('copyBtn'),
            shareBtn: document.getElementById('shareBtn'),
            charCount: document.getElementById('charCount'),
            themeBtn: document.getElementById('themeBtn'),
            uploadArea: document.getElementById('uploadArea'),
            qrUpload: document.getElementById('qrUpload'),
            uploadPreview: document.getElementById('uploadPreview'),
            previewImage: document.getElementById('previewImage'),
            clearUpload: document.getElementById('clearUpload'),
            decodeResult: document.getElementById('decodeResult'),
            decodedText: document.getElementById('decodedText'),
            copyDecodedBtn: document.getElementById('copyDecodedBtn'),
            useDecodedBtn: document.getElementById('useDecodedBtn'),
            cameraOption: document.getElementById('cameraOption'),
            uploadOption: document.getElementById('uploadOption')
        };

        this.currentQRCode = null;
        this.currentCanvas = null;
        this.cameraScanner = null;
        
        // Initialize character counter
        this.updateCharCount();
    }

    bindEvents() {
        // Main functionality
        this.elements.generateBtn.addEventListener('click', () => this.generateQR());
        this.elements.qrText.addEventListener('input', () => this.updateCharCount());
        this.elements.qrText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.generateQR();
            }
        });

        // Action buttons
        this.elements.downloadBtn.addEventListener('click', () => this.downloadQR());
        this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.elements.shareBtn.addEventListener('click', () => this.shareQR());

        // Theme toggle
        this.elements.themeBtn.addEventListener('click', () => this.toggleTheme());

        // QR Decoder functionality
        this.elements.qrUpload.addEventListener('change', (e) => this.handleFileUpload(e));
        this.elements.clearUpload.addEventListener('click', () => this.clearUpload());
        this.elements.copyDecodedBtn.addEventListener('click', () => this.copyDecodedText());
        this.elements.useDecodedBtn.addEventListener('click', () => this.useDecodedText());

        // Drag and drop
        this.elements.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.elements.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
this.elements.uploadArea.addEventListener('click', (e) => {
    e.stopPropagation();
    this.toggleUploadMenu(); // New method to toggle menu visibility
});

this.elements.cameraOption.addEventListener('click', () => {
    this.startCameraScan();
});

this.elements.uploadOption.addEventListener('click', () => {
    this.elements.qrUpload.click();
});


        // Template buttons
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                this.openTemplate(template);
            });
        });

        // Modal handling
        this.setupModals();

        // Real-time preview (debounced)
        this.debounceTimer = null;
        ['input', 'change'].forEach(event => {
            this.elements.qrText.addEventListener(event, () => this.debounceGenerate());
            this.elements.size.addEventListener(event, () => this.debounceGenerate());
            this.elements.errorLevel.addEventListener(event, () => this.debounceGenerate());
            this.elements.fgColor.addEventListener(event, () => this.debounceGenerate());
            this.elements.bgColor.addEventListener(event, () => this.debounceGenerate());
        });
    }

    debounceGenerate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            if (this.elements.qrText.value.trim()) {
                this.generateQR();
            }
        }, 500);
    }

    updateCharCount() {
        const count = this.elements.qrText.value.length;
        this.elements.charCount.textContent = count;
        
        // Color coding for character count
        if (count > 800) {
            this.elements.charCount.style.color = '#ef4444';
        } else if (count > 600) {
            this.elements.charCount.style.color = '#f59e0b';
        } else {
            this.elements.charCount.style.color = 'var(--text-light)';
        }
    }
    async generateQR() {
        const text = this.elements.qrText.value.trim();
        
        if (!text) {
            this.showNotification('Please enter some text to generate QR code', 'warning');
            return;
        }

        this.setLoadingState(true);

        try {
            // Clear previous QR code
            this.elements.qrResult.innerHTML = '';

            // Create QR code using qrcode-generator library
            const qr = qrcode(0, this.elements.errorLevel.value);
            qr.addData(text);
            qr.make();

            // Create canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const size = parseInt(this.elements.size.value);
            const moduleCount = qr.getModuleCount();
            const cellSize = size / moduleCount;
            
            canvas.width = size;
            canvas.height = size;

            // Draw QR code
            ctx.fillStyle = this.elements.bgColor.value;
            ctx.fillRect(0, 0, size, size);
            ctx.fillStyle = this.elements.fgColor.value;

            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
                    }
                }
            }

            this.currentCanvas = canvas;
            this.currentQRCode = text;

            // Add to DOM with animation
            canvas.style.opacity = '0';
            canvas.style.transform = 'scale(0.8)';
            this.elements.qrResult.appendChild(canvas);
            
            setTimeout(() => {
                canvas.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                canvas.style.opacity = '1';
                canvas.style.transform = 'scale(1)';
            }, 50);

            // Show action buttons
            this.elements.qrActions.style.display = 'flex';
            this.elements.qrActions.style.opacity = '0';
            setTimeout(() => {
                this.elements.qrActions.style.transition = 'opacity 0.3s ease';
                this.elements.qrActions.style.opacity = '1';
            }, 300);

            this.showNotification('QR code generated successfully!', 'success');

        } catch (error) {
            console.error('Error generating QR code:', error);
            this.showNotification('Error generating QR code. Please try again.', 'error');
            this.showPlaceholder();
        } finally {
            this.setLoadingState(false);
        }
    }

    setLoadingState(loading) {
        if (loading) {
            this.elements.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
            this.elements.generateBtn.disabled = true;
        } else {
            this.elements.generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate QR Code<div class="btn-shimmer"></div>';
            this.elements.generateBtn.disabled = false;
        }
    }

    showPlaceholder() {
        this.elements.qrResult.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-qrcode"></i>
                <p>Your QR code will appear here</p>
            </div>
        `;
        this.elements.qrActions.style.display = 'none';
    }

    async downloadQR() {
        if (!this.currentCanvas) return;

        try {
            // Create download link
            const link = document.createElement('a');
            link.download = `qrcode-${Date.now()}.png`;
            link.href = this.currentCanvas.toDataURL('image/png', 1.0);
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showNotification('QR code downloaded successfully!', 'success');
        } catch (error) {
            this.showNotification('Error downloading QR code', 'error');
        }
    }

    async copyToClipboard() {
        if (!this.currentCanvas) return;

        try {
            // Convert canvas to blob
            this.currentCanvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    this.showNotification('QR code copied to clipboard!', 'success');
                } catch (error) {
                    // Fallback: copy as data URL
                    const dataUrl = this.currentCanvas.toDataURL();
                    await navigator.clipboard.writeText(dataUrl);
                    this.showNotification('QR code data copied to clipboard!', 'success');
                }
            }, 'image/png', 1.0);
        } catch (error) {
            this.showNotification('Error copying QR code', 'error');
        }
    }

    async shareQR() {
        if (!this.currentCanvas) return;

        try {
            this.currentCanvas.toBlob(async (blob) => {
                const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                
                if (navigator.share && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'QR Code',
                        text: 'Check out this QR code!',
                        files: [file]
                    });
                } else {
                    // Fallback: download
                    this.downloadQR();
                }
            }, 'image/png', 1.0);
        } catch (error) {
            this.showNotification('Error sharing QR code', 'error');
        }
    }

    setupTheme() {
        // Check for saved theme or default to light
        const savedTheme = localStorage.getItem('qr-theme') || 'light';
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        // Update theme button icon
        const icon = this.elements.themeBtn.querySelector('i');
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Save theme preference
        localStorage.setItem('qr-theme', theme);
        
        // Add theme transition effect
        document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    setupModals() {
        // Get all modals
        const modals = document.querySelectorAll('.modal');
        
        // Close modal when clicking outside or on close button
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.close');
            
            closeBtn.addEventListener('click', () => this.closeModal(modal));
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Setup specific modal handlers
        this.setupWiFiModal();
        this.setupEmailModal();
    }

    openTemplate(template) {
        const modals = {
            wifi: 'wifiModal',
            email: 'emailModal',
            phone: () => this.openPhoneTemplate(),
            sms: () => this.openSMSTemplate()
        };

        if (typeof modals[template] === 'string') {
            this.openModal(modals[template]);
        } else if (typeof modals[template] === 'function') {
            modals[template]();
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    setupWiFiModal() {
        const createBtn = document.getElementById('createWifiQR');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                const ssid = document.getElementById('wifiSSID').value;
                const password = document.getElementById('wifiPassword').value;
                const security = document.getElementById('wifiSecurity').value;

                if (!ssid) {
                    this.showNotification('Please enter network name', 'warning');
                    return;
                }

                const wifiString = `WIFI:T:${security};S:${ssid};P:${password};;`;
                this.elements.qrText.value = wifiString;
                this.closeModal(document.getElementById('wifiModal'));
                this.generateQR();
            });
        }
    }

    setupEmailModal() {
        const createBtn = document.getElementById('createEmailQR');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                const email = document.getElementById('emailAddress').value;
                const subject = document.getElementById('emailSubject').value;
                const body = document.getElementById('emailBody').value;

                if (!email) {
                    this.showNotification('Please enter email address', 'warning');
                    return;
                }

                const emailString = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                this.elements.qrText.value = emailString;
                this.closeModal(document.getElementById('emailModal'));
                this.generateQR();
            });
        }
    }

    openPhoneTemplate() {
        const phone = prompt('Enter phone number:');
        if (phone) {
            this.elements.qrText.value = `tel:${phone}`;
            this.generateQR();
        }
    }

    openSMSTemplate() {
        const phone = prompt('Enter phone number:');
        if (phone) {
            const message = prompt('Enter SMS message (optional):') || '';
            this.elements.qrText.value = `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
            this.generateQR();
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '3000',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
        });

        // Set background based on type
        const backgrounds = {
            success: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            error: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            warning: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
            info: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        };
        notification.style.background = backgrounds[type];

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        this.processQRImage(file);
    }
}

handleDragOver(event) {
    event.preventDefault();
    this.elements.uploadArea.classList.add('dragover');
}

handleDragLeave(event) {
    event.preventDefault();
    this.elements.uploadArea.classList.remove('dragover');
}

handleDrop(event) {
    event.preventDefault();
    this.elements.uploadArea.classList.remove('dragover');
    const files = event.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
        this.processQRImage(files[0]);
    }
}

async processQRImage(file) {
    try {
        const reader = new FileReader();

        reader.onload = async (e) => {
            const img = new Image();
            img.src = e.target.result;

            // Wait for image to fully load
            await new Promise((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject('Image load error');
            });

            // Show preview
            this.elements.previewImage.src = img.src;
            this.elements.uploadPreview.style.display = 'block';
            this.elements.uploadArea.querySelector('.upload-content').style.display = 'none';

            // ✅ Draw image to canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Decode from canvas
            this.showNotification('Decoding QR code...', 'info');
            const result = await QrScanner.scanImage(canvas, {
                returnDetailedScanResult: true
            });

            if (result && result.data) {
                this.displayDecodedResult(result.data);
                this.showNotification('QR code decoded successfully!', 'success');
            } else {
                throw new Error('No QR code found');
            }
        };

        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error decoding QR:', error);
        this.showNotification('Could not decode QR code. Please try a clearer image.', 'error');
        this.clearUpload();
    }
}

displayDecodedResult(decodedText) {
    this.elements.decodedText.textContent = decodedText.data || decodedText;
    this.elements.decodeResult.style.display = 'block';
    this.currentDecodedText = decodedText;

    // Animate the result
    this.elements.decodeResult.style.opacity = '0';
    this.elements.decodeResult.style.transform = 'translateY(20px)';
    setTimeout(() => {
        this.elements.decodeResult.style.transition = 'all 0.3s ease';
        this.elements.decodeResult.style.opacity = '1';
        this.elements.decodeResult.style.transform = 'translateY(0)';
    }, 100);
}

clearUpload() {
    this.elements.qrUpload.value = '';
    this.elements.uploadPreview.style.display = 'none';
    this.elements.uploadArea.querySelector('.upload-content').style.display = 'block';
    this.elements.decodeResult.style.display = 'none';
    this.currentDecodedText = null;
}

async copyDecodedText() {
    if (this.currentDecodedText) {
        try {
            await navigator.clipboard.writeText(this.currentDecodedText);
            this.showNotification('Decoded text copied to clipboard!', 'success');
        } catch (error) {
            this.showNotification('Error copying text', 'error');
        }
    }
}

useDecodedText() {
    if (this.currentDecodedText) {
        this.elements.qrText.value = this.currentDecodedText;
        this.updateCharCount();
        this.generateQR();
        this.showNotification('Text loaded into generator!', 'success');

        // Scroll to generator section
        this.elements.qrText.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

toggleUploadMenu() {
    const menu = document.getElementById('uploadMenu');
    const isVisible = menu.style.display === 'block';
    menu.style.display = isVisible ? 'none' : 'block';

    // Close it if clicked outside
    document.addEventListener('click', () => {
        menu.style.display = 'none';
    }, { once: true });
}

async startCameraScan() {
    const video = document.getElementById('qrVideo');
    const modal = document.getElementById('cameraModal');

    // Cleanup any previous scanner
    if (this.cameraScanner) {
        this.cameraScanner.destroy();
    }

    // Initialize new scanner
    this.cameraScanner = new QrScanner(video, (result) => {
        this.displayDecodedResult(result);
        this.showNotification('QR code scanned successfully!', 'success');
        this.cameraScanner.stop();
        modal.style.display = 'none';
    }, {
        returnDetailedScanResult: true,
        highlightScanRegion: true,
        highlightCodeOutline: true
    });

    try {
        await this.cameraScanner.start();
        modal.style.display = 'block';
    } catch (err) {
        this.showNotification('Unable to access camera.', 'error');
        console.error(err);
    }

    // Close modal if user clicks ❌
    document.getElementById('closeCamera').addEventListener('click', () => {
        if (this.cameraScanner) {
            this.cameraScanner.stop();
        }
        modal.style.display = 'none';
    }, { once: true });
}

}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QRGenerator();
});

// Add some utility functions for enhanced UX
document.addEventListener('keydown', (e) => {
    // Escape key closes modals
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal[style*="block"]');
        if (openModal) {
            openModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
});

// Add smooth scrolling for any anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add page visibility handling
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh animations when page becomes visible
        const shapes = document.querySelectorAll('.shape');
        shapes.forEach(shape => {
            shape.style.animation = 'none';
            setTimeout(() => {
                shape.style.animation = '';
            }, 10);
        });
    }
});