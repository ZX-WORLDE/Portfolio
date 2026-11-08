"""Process downloaded images into optimized web assets for the landing page."""
from PIL import Image, ImageEnhance
import os

SRC = "/home/z/my-project/scripts/img/dl"
DST = "/home/z/my-project/public/images"
os.makedirs(DST, exist_ok=True)

def load(name):
    return Image.open(os.path.join(SRC, name)).convert("RGB")

def crop_edges(img, frac):
    """Crop a fraction off every edge (removes corner watermarks)."""
    w, h = img.size
    dx, dy = int(w * frac), int(h * frac)
    return img.crop((dx, dy, w - dx, h - dy))

def resize_max(img, max_w):
    w, h = img.size
    if w <= max_w:
        return img
    nh = int(h * max_w / w)
    return img.resize((max_w, nh), Image.LANCZOS)

def save(img, name, q=82):
    path = os.path.join(DST, name)
    img.save(path, "JPEG", quality=q, optimize=True, progressive=True)
    print(f"{name:26s} {img.size[0]}x{img.size[1]}  {os.path.getsize(path)//1024} KB")

def center_square(img, size):
    w, h = img.size
    s = min(w, h)
    img = img.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))
    return img.resize((size, size), Image.LANCZOS)

# Hero: silhouette at desk (keep 16:9-ish, slight punch-up)
img = load("hsil1.jpg")
img = resize_max(img, 1400)
save(img, "hero.jpg", 84)

# Editor portrait: crop edges to drop the star watermark, keep portrait ratio
img = load("port1.jpg")
img = crop_edges(img, 0.06)
img = resize_max(img, 900)
save(img, "editor-portrait.jpg", 84)

# Services — strictly post-production / editing imagery
save(resize_max(load("tl3.jpg"), 1100), "svc-commercial.jpg")
save(resize_max(load("mus1.jpg"), 1000), "svc-music.jpg")
save(resize_max(load("h1.jpg"), 800), "svc-doc.jpg")
save(resize_max(load("suite1.jpg"), 1100), "svc-social.jpg")

# Texture strip: color grading control surface
save(resize_max(load("panel1.jpg"), 1500), "panel-texture.jpg", 80)

# CTA background: misty silhouette
save(resize_max(load("set1.jpg"), 1500), "cta-bg.jpg", 80)

# Community accent: raised fist against light rays
save(resize_max(load("mus3.jpg"), 1200), "fist.jpg", 80)

# Avatars (square crops)
save(center_square(load("ava1.jpg"), 320), "avatar-1.jpg", 82)
save(center_square(load("port3.jpg"), 320), "avatar-2.jpg", 82)
save(center_square(load("port2.jpg"), 320), "avatar-3.jpg", 82)

print("\nDone.")
