# sheet.py: contact sheets of screenshots, so a whole walk fits in one look.
#   python3 sheet.py <in-dir> <out-dir> [cols=4] [per-sheet=12] [thumb-width=420]
import sys, os, glob
from PIL import Image, ImageDraw
src, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 4
per = int(sys.argv[4]) if len(sys.argv) > 4 else 12
tw = int(sys.argv[5]) if len(sys.argv) > 5 else 420
files = sorted(glob.glob(os.path.join(src, '*.png')))
os.makedirs(out, exist_ok=True)
for s in range(0, len(files), per):
    chunk = files[s:s + per]
    ims = [Image.open(f).convert('RGB') for f in chunk]
    th = int(ims[0].height * tw / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + 24) + 8), (40, 40, 40))
    d = ImageDraw.Draw(sheet)
    for i, (f, im) in enumerate(zip(chunk, ims)):
        x, y = 8 + (i % cols) * (tw + 8), 8 + (i // cols) * (th + 24)
        sheet.paste(im.resize((tw, th)), (x, y + 16)); d.text((x, y + 2), os.path.basename(f), fill=(255, 220, 0))
    sheet.save(os.path.join(out, f'sheet{s // per:02d}.png'))
print(len(files), 'screens ->', out)
