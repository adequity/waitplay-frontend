# Card hover effect
s/box-shadow: 0 8px 32px rgba(0, 0, 0, 0\.08);/transform: translateY(-2px);\n  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);/

# QR frame border
/\.qr-frame {/,/}/ {
  /border-radius: 16px;/a\
  border: 2px solid #e5e5ea;
}

# Button hover effects
/\.btn-qr-download:hover,/,/}/ {
  s/color: #0071e3;/color: #0071e3;\n  transform: translateY(-1px);/
}

# Layout manager hover
/\.btn-layout-manager:hover {/,/}/ {
  s/box-shadow: 0 6px 16px rgba(0, 0, 0, 0\.2);/transform: translateY(-2px);\n  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);/
}
