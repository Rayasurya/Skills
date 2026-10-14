"""Contact sheets from a folder of screenshots, so a whole walk can be read at once.
Usage: python3 sheet.py <inDir> <outDir> [cols=4] [perSheet=16]   (needs Pillow)"""
import sys, os, glob
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
per = int(sys.argv[4]) if len(sys.argv) > 4 else 16
files = sorted(glob.glob(os.path.join(src, '*.png')))
os.makedirs(out, exist_ok=True)
tw = 480
for s in range(0, len(files), per):
    chunk = files[s:s + per]
    ims = [Image.open(f).convert('RGB') for f in chunk]
    th = int(ims[0].height * tw / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + 26) + 8), (40, 40, 40))
    d = ImageDraw.Draw(sheet)
    for i, (f, im) in enumerate(zip(chunk, ims)):
        x = 8 + (i % cols) * (tw + 8); y = 8 + (i // cols) * (th + 26)
        sheet.paste(im.resize((tw, th)), (x, y + 18)); d.text((x, y + 2), os.path.basename(f), fill=(255, 255, 0))
    sheet.save(os.path.join(out, f'sheet{s // per:02d}.png'))
print(f'{len(files)} images -> {out}')
