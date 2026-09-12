#!/usr/bin/env python3
"""Generate small synthetic media files for ChainGuard demos and QA.

Outputs (into demo-data/):
  photo_original.jpg   A synthetic photo with camera EXIF metadata.
  photo_tampered.jpg   Same photo with one pixel changed (different bytes).
  scene_original.mp4   A short synthetic video.
  scene_tampered.mp4   A re-encoded copy with adjusted brightness (different bytes).

These are synthetic test artifacts only. They must not be used as real evidence.
"""

from __future__ import annotations

import hashlib
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "demo-data"
FONT = "Arial"


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def make_photo() -> None:
    """A synthetic street scene with EXIF camera + GPS metadata."""
    w, h = 1280, 720
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)

    # Sky gradient
    for y in range(int(h * 0.55)):
        shade = int(120 + 100 * (1 - y / (h * 0.55)))
        draw.line([(0, y), (w, y)], fill=(shade, shade + 20, 200))
    # Ground
    for y in range(int(h * 0.55), h):
        draw.line([(0, y), (w, y)], fill=(60, 60, 65))
    # Building silhouettes
    draw.rectangle([60, 180, 240, 430], fill=(40, 40, 45))
    draw.rectangle([300, 120, 480, 430], fill=(55, 55, 60))
    draw.rectangle([560, 220, 760, 430], fill=(48, 48, 52))
    # Road + markings
    draw.rectangle([0, 560, w, h], fill=(50, 50, 55))
    for x in range(40, w, 90):
        draw.rectangle([x, 630, x + 40, 640], fill=(230, 220, 90))
    # Text label so it is clearly synthetic
    draw.rectangle([840, 600, 1250, 680], fill=(0, 0, 0))
    draw.text((870, 615), "SYNTHETIC DEMO SCENE", fill=(255, 255, 255))

    exif = Image.Exif()
    exif[0x010F] = "Canon"  # Make
    exif[0x0110] = "EOS R5"  # Model
    exif[0x0132] = "2026:08:21 14:32:05"  # DateTime
    exif[0x9003] = "2026:08:21 14:32:05"  # DateTimeOriginal
    exif[0x9004] = "2026:08:21 14:32:05"  # DateTimeDigitized
    gps = exif.get_ifd(0x8825)
    gps[1] = "N"  # GPSLatitudeRef
    gps[2] = (6.0, 31.0, 0.0)  # GPSLatitude deg, min, sec
    gps[3] = "E"  # GPSLongitudeRef
    gps[4] = (3.0, 21.0, 0.0)  # GPSLongitude deg, min, sec

    img.save(OUT / "photo_original.jpg", "JPEG", quality=92, exif=exif)

    # Tampered copy: change a single pixel and re-save.
    tampered = img.copy()
    tampered.putpixel((10, 10), (255, 0, 0))
    tampered.save(OUT / "photo_tampered.jpg", "JPEG", quality=92, exif=exif)


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True, capture_output=True)


def make_video() -> None:
    out_o = str(OUT / "scene_original.mp4")
    out_t = str(OUT / "scene_tampered.mp4")
    run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-f", "lavfi", "-i", "testsrc2=duration=3:size=640x360:rate=24",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart",
            "-metadata", "creation_time=2026-08-21T14:32:05Z",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
            out_o,
        ]
    )
    # Tampered copy: brighter, visibly different frames -> different bytes.
    run(
        [
            "ffmpeg", "-y", "-loglevel", "error",
            "-i", out_o,
            "-vf", "eq=brightness=0.2:contrast=1.1",
            "-c:v", "libx264", "-preset", "veryfast", "-crf", "28",
            "-metadata", "comment=TAMPERED_COPY",
            out_t,
        ]
    )


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    make_photo()
    make_video()
    print(f"Generated files in {OUT}")
    for name in ["photo_original.jpg", "photo_tampered.jpg", "scene_original.mp4", "scene_tampered.mp4"]:
        p = OUT / name
        print(f"  {name:<22} {p.stat().st_size:>6} bytes  sha256={sha256(p)}")


if __name__ == "__main__":
    sys.exit(main())