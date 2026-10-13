"""
Vygeneruje PNG ikony aplikace (hlava maskota Bajtíka) pro PWA a iOS.

Použití (ve složce projektu, potřebuje Pillow: pip install pillow):
    python tools/make-icons.py

Výstup: assets/icons/icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
Kreslí se ve 4× rozlišení a zmenšuje (vyhlazené hrany).
"""
import os
from PIL import Image, ImageDraw, ImageFilter

BG = (5, 9, 12, 255)
BG_2 = (11, 23, 22, 255)
GREEN = (57, 255, 159, 255)
GREEN_DIM = (31, 174, 106, 255)
BODY = (15, 35, 33, 255)
SCREEN = (3, 20, 15, 255)
CYAN = (46, 230, 255, 255)

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "assets", "icons")


def draw_icon(size, *, maskable=False, rounded=True):
    s = size * 4  # supersampling
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # pozadí: maskable = celá plocha, jinak zaoblený čtverec
    if maskable or not rounded:
        d.rectangle([0, 0, s, s], fill=BG_2)
    else:
        d.rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=BG_2)

    # obsah v bezpečné zóně (maskable ikony se ořezávají do kruhu ~80 %)
    scale = 0.62 if maskable else 0.78
    w = s * scale
    ox = (s - w) / 2
    oy = (s - w) / 2 + s * 0.04

    def X(v):  # souřadnice v rámci 0–100
        return ox + v / 100 * w

    def Y(v):
        return oy + v / 100 * w

    line = max(2, int(w * 0.035))

    # anténa + LED (se září)
    d.line([X(50), Y(14), X(50), Y(2)], fill=GREEN, width=line)
    glow = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([X(43), Y(-6), X(57), Y(8)], fill=CYAN)
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(s * 0.02)))
    d.ellipse([X(45), Y(-4), X(55), Y(6)], fill=CYAN)

    # hlava (CRT monitor)
    d.rounded_rectangle([X(4), Y(14), X(96), Y(90)], radius=int(w * 0.18), fill=BODY, outline=GREEN, width=line)
    # obrazovka
    d.rounded_rectangle([X(14), Y(24), X(86), Y(78)], radius=int(w * 0.09), fill=SCREEN, outline=GREEN_DIM, width=max(2, line // 2))

    # oči se září
    eyes = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    ed = ImageDraw.Draw(eyes)
    for x0 in (30, 60):
        ed.rounded_rectangle([X(x0), Y(36), X(x0 + 10), Y(54)], radius=int(w * 0.04), fill=GREEN)
    ed.line([X(44), Y(66), X(56), Y(66)], fill=GREEN, width=line)
    img.alpha_composite(eyes.filter(ImageFilter.GaussianBlur(s * 0.012)))
    img.alpha_composite(eyes)

    return img.resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    draw_icon(192).save(os.path.join(OUT, "icon-192.png"))
    draw_icon(512).save(os.path.join(OUT, "icon-512.png"))
    draw_icon(512, maskable=True).save(os.path.join(OUT, "maskable-512.png"))
    # iOS si roh zaobluje sám → plné pozadí
    draw_icon(180, rounded=False).save(os.path.join(OUT, "apple-touch-icon.png"))
    print("Ikony uloženy do", OUT)


if __name__ == "__main__":
    main()
