
# Reprocesses/renames source WhatsApp photos into the site's assets/images
# structure (full + thumb). Run from anywhere — paths resolve relative to
# the project root (one level up from this scripts/ folder). Requires
# ImageMagick (magick.exe) on PATH or at the path below.
$root = Split-Path -Parent $PSScriptRoot
$magick = "C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe"
$src = Join-Path $root "assets\images"
$fullDir = Join-Path $root "assets\images"
$thumbDir = Join-Path $root "assets\images\thumbs"

$map = @{
  "WhatsApp Image 2026-09-17 at 13.21.27.jpeg"     = "hero-training-session"
  "WhatsApp Image 2026-09-17 at 13.21.24.jpeg"     = "graduation-group"
  "WhatsApp Image 2026-09-17 at 13.21.26.jpeg"     = "mobile-training-hub"
  "WhatsApp Image 2026-09-17 at 13.21.20 (3).jpeg" = "office-team"
  "WhatsApp Image 2026-09-17 at 13.21.21 (1).jpeg" = "classroom-empty"
  "WhatsApp Image 2026-09-17 at 13.21.28.jpeg"     = "signage-board"
  "WhatsApp Image 2026-09-17 at 13.21.29 (2).jpeg" = "course-banner-accreditation"
  "WhatsApp Image 2026-09-17 at 13.21.27 (2).jpeg" = "workplace-training"
  "WhatsApp Image 2026-09-17 at 13.21.29 (1).jpeg" = "learners-signing-forms"
  "WhatsApp Image 2026-09-17 at 13.21.20 (2).jpeg" = "stakeholder-visit"
  "WhatsApp Image 2026-09-17 at 13.21.28 (2).jpeg" = "trainees-team-huddle"
  "WhatsApp Image 2026-09-17 at 13.21.20 (1).jpeg" = "computer-lab"
  "WhatsApp Image 2026-09-17 at 13.21.23 (2).jpeg" = "boardroom-session"
  "WhatsApp Image 2026-09-17 at 13.21.23 (3).jpeg" = "graduate-with-family"
  "WhatsApp Image 2026-09-17 at 13.21.22.jpeg"     = "certificate-award"
  "WhatsApp Image 2026-09-17 at 13.21.24 (1).jpeg" = "team-festive-1"
  "WhatsApp Image 2026-09-17 at 13.21.24 (2).jpeg" = "team-festive-2"
  "WhatsApp Image 2026-09-17 at 13.21.23.jpeg"     = "team-celebration-cake"
  "WhatsApp Image 2026-09-17 at 13.21.26 (1).jpeg" = "branded-merchandise"
  "WhatsApp Image 2026-09-17 at 13.21.25 (2).jpeg" = "event-setup"
  "WhatsApp Image 2026-09-17 at 13.21.25 (4).jpeg" = "community-hall-session"
  "WhatsApp Image 2026-09-17 at 13.21.29 (3).jpeg" = "certificate-presentation"
  "WhatsApp Image 2026-09-17 at 13.21.22 (3).jpeg" = "staff-portrait"
}

$results = @()
foreach ($key in $map.Keys) {
  $srcPath = Join-Path $src $key
  $destName = $map[$key]
  if (-not (Test-Path $srcPath)) {
    $results += "MISSING: $srcPath"
    continue
  }
  $fullOut = Join-Path $fullDir "$destName.jpg"
  $thumbOut = Join-Path $thumbDir "$destName.jpg"
  & $magick $srcPath -auto-orient -resize "1400x1400>" -quality 78 -strip $fullOut
  & $magick $srcPath -auto-orient -resize "520x520>" -quality 78 -strip $thumbOut
  $results += "OK: $destName"
}
$results
