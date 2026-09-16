"""Generate PWA icons (PNG) and favicon (SVG) without external libraries."""
import struct, zlib, os

GREEN = (15, 81, 50); WHITE = (255, 253, 247); GOLD = (232, 167, 44)

def inside_rrect(x, y, x0, y0, x1, y1, r):
    if x < x0 or x > x1 or y < y0 or y > y1: return False
    cx = min(max(x, x0 + r), x1 - r); cy = min(max(y, y0 + r), y1 - r)
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r

def shade(u, v, maskable):
    # u, v in 0..1
    pad = 0.0 if maskable else 0.0
    bg_r = 0.0 if maskable else 0.22
    if not maskable and not inside_rrect(u, v, 0, 0, 1, 1, bg_r):
        return None
    s = 0.72 if maskable else 1.0  # keep content inside the maskable safe zone
    x = (u - 0.5) / s + 0.5; y = (v - 0.5) / s + 0.5
    col = GREEN
    # bus body
    if inside_rrect(x, y, 0.20, 0.20, 0.80, 0.74, 0.08): col = WHITE
    # windscreen
    if inside_rrect(x, y, 0.27, 0.28, 0.73, 0.48, 0.04): col = GREEN
    # route stripe
    if 0.53 <= y <= 0.58 and 0.20 <= x <= 0.80: col = GOLD
    # headlights
    for hx in (0.31, 0.69):
        if (x - hx) ** 2 + (y - 0.65) ** 2 <= 0.035 ** 2: col = GREEN
    # wheels
    for wx in (0.32, 0.68):
        if inside_rrect(x, y, wx - 0.06, 0.72, wx + 0.06, 0.82, 0.03): col = WHITE
    # mirror bar
    if inside_rrect(x, y, 0.40, 0.22, 0.60, 0.25, 0.01): col = GREEN
    return col

def render(size, maskable=False, ss=4):
    rows = []
    for py in range(size):
        row = bytearray([0])
        for px in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    c = shade((px + (sx + 0.5) / ss) / size, (py + (sy + 0.5) / ss) / size, maskable)
                    if c:
                        acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; acc[3] += 255
            n = ss * ss
            a = acc[3] / n
            if a:
                row += bytes([int(acc[0] * 255 / acc[3]), int(acc[1] * 255 / acc[3]), int(acc[2] * 255 / acc[3]), int(a)])
            else:
                row += bytes([0, 0, 0, 0])
        rows.append(bytes(row))
    raw = b''.join(rows)
    def chunk(t, d): return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')

out = os.path.join(os.path.dirname(__file__), '..', '..', 'public', 'icons')
os.makedirs(out, exist_ok=True)
for name, size, mask in [('icon-192.png', 192, False), ('icon-512.png', 512, False), ('icon-512-maskable.png', 512, True)]:
    open(os.path.join(out, name), 'wb').write(render(size, mask, 3 if size > 200 else 4))
svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<rect width="100" height="100" rx="22" fill="#0f5132"/>
<rect x="20" y="20" width="60" height="54" rx="8" fill="#fffdf7"/>
<rect x="27" y="28" width="46" height="20" rx="4" fill="#0f5132"/>
<rect x="20" y="53" width="60" height="5" fill="#e8a72c"/>
<circle cx="31" cy="65" r="3.5" fill="#0f5132"/><circle cx="69" cy="65" r="3.5" fill="#0f5132"/>
<rect x="26" y="72" width="12" height="10" rx="3" fill="#fffdf7"/><rect x="62" y="72" width="12" height="10" rx="3" fill="#fffdf7"/>
<rect x="40" y="22" width="20" height="3" rx="1" fill="#0f5132"/>
</svg>
'''
open(os.path.join(out, 'favicon.svg'), 'w').write(svg)
print('icons written to', os.path.abspath(out))
