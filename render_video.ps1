# TinkerHub CE Karunagappally - Syntax to Solutions 31s Hype Trailer Renderer
# Generates 1920x1080 visual scene cards strictly sticking to the deployed study jam details
# Each slide shows for ~5.2 seconds with 0.8s smooth crossfades (total duration ~31.5 seconds)

Add-Type -AssemblyName System.Drawing

$projectDir = "C:\Users\sathi\.gemini\antigravity-ide\scratch\tinkerhub-python-studyjam"
$framesDir = Join-Path $projectDir "video_frames"
$posterImgPath = Join-Path $projectDir "assets\poster.png"
$day3ImgPath = Join-Path $projectDir "assets\day3_offline.jpg"
$heroImgPath = Join-Path $projectDir "assets\hero_python.jpg"
$ffmpegPath = "C:\Users\sathi\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
$outputVideo = Join-Path $projectDir "tinkerhub_python_studyjam.mp4"

if (-not (Test-Path $framesDir)) {
    New-Item -ItemType Directory -Path $framesDir -Force | Out-Null
}

$W = 1920
$H = 1080

function New-BrutalistCanvas {
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Deep dark cosmic blue background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 8, 12, 22),
        [System.Drawing.Color]::FromArgb(255, 18, 32, 58),
        45.0
    )
    $g.FillRectangle($bgBrush, $rect)
    $bgBrush.Dispose()

    # Ambient yellow glow orb
    $path1 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path1.AddEllipse(1350, -150, 700, 700)
    $glow1 = New-Object System.Drawing.Drawing2D.PathGradientBrush($path1)
    $glow1.CenterColor = [System.Drawing.Color]::FromArgb(55, 253, 216, 72)
    $glow1.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $g.FillPath($glow1, $path1)
    $path1.Dispose(); $glow1.Dispose()

    # Ambient deep blue glow orb
    $path2 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path2.AddEllipse(-150, 600, 750, 750)
    $glow2 = New-Object System.Drawing.Drawing2D.PathGradientBrush($path2)
    $glow2.CenterColor = [System.Drawing.Color]::FromArgb(65, 43, 104, 156)
    $glow2.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $g.FillPath($glow2, $path2)
    $path2.Dispose(); $glow2.Dispose()

    # Grid
    $gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(18, 255, 255, 255), 1)
    for ($x = 0; $x -lt $W; $x += 120) {
        $g.DrawLine($gridPen, $x, 0, $x, $H)
    }
    for ($y = 0; $y -lt $H; $y += 120) {
        $g.DrawLine($gridPen, 0, $y, $W, $y)
    }
    $gridPen.Dispose()

    return @{ Bitmap = $bmp; Graphics = $g }
}

function Draw-BrutalistBox($g, $x, $y, $w, $h, $bgColor, $borderColor, $shadowOffset = 8) {
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 0, 0, 0))
    $g.FillRectangle($shadowBrush, ($x + $shadowOffset), ($y + $shadowOffset), $w, $h)
    $shadowBrush.Dispose()

    $fillBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $g.FillRectangle($fillBrush, $x, $y, $w, $h)
    $fillBrush.Dispose()

    $pen = New-Object System.Drawing.Pen($borderColor, 3)
    $g.DrawRectangle($pen, $x, $y, $w, $h)
    $pen.Dispose()
}

$bWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$bInk = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 10))
$bYellow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 216, 72))
$bCream = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 223, 90))
$bBlue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 43, 104, 156))
$bRed = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 0, 0))
$bGreen = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 157, 255, 32))
$bMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 180, 195, 215))

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

$sfLeft = New-Object System.Drawing.StringFormat
$sfLeft.Alignment = [System.Drawing.StringAlignment]::Near
$sfLeft.LineAlignment = [System.Drawing.StringAlignment]::Center

# =========================================================================
# SCENE 1: THE SYNTAX WALL & THE RELATABLE HOOK
# =========================================================================
Write-Output "--- Rendering Scene 1: The Syntax Wall ---"
$c1 = New-BrutalistCanvas
$g1 = $c1.Graphics

# Error pill
Draw-BrutalistBox $g1 560 70 800 56 ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) ([System.Drawing.Color]::Black) 6
$fPill = New-Object System.Drawing.Font("Consolas", 18, [System.Drawing.FontStyle]::Bold)
$g1.DrawString("SyntaxError: invalid syntax (line 42)", $fPill, $bWhite, (New-Object System.Drawing.RectangleF(560, 70, 800, 56)), $sfCenter)

$fHero = New-Object System.Drawing.Font("Arial Black", 68, [System.Drawing.FontStyle]::Bold)
$g1.DrawString("PYTHON IS EASY.", $fHero, $bWhite, (New-Object System.Drawing.RectangleF(100, 160, 1720, 95)), $sfCenter)
$g1.DrawString("UNTIL IT IS NOT.", $fHero, $bYellow, (New-Object System.Drawing.RectangleF(100, 260, 1720, 95)), $sfCenter)

# 3 Pain points cards
$pains = @(
    @{ Title = "TUTORIAL HELL"; Desc = "Watching 40 hours of YouTube videos, but freezing on a blank VS Code editor."; Color = [System.Drawing.Color]::FromArgb(255, 255, 0, 0) },
    @{ Title = "CRYPTIC ERRORS"; Desc = "One missing colon, tab, or bracket crashes your whole college assignment."; Color = [System.Drawing.Color]::FromArgb(255, 253, 216, 72) },
    @{ Title = "2 AM ISOLATION"; Desc = "Debugging alone late at night without peers to bounce ideas or explain why."; Color = [System.Drawing.Color]::FromArgb(255, 43, 104, 156) }
)

$cardW = 520
$startX = 120
$gap = 60

for ($i = 0; $i -lt 3; $i++) {
    $p = $pains[$i]
    $x = $startX + ($i * ($cardW + $gap))
    $y = 400
    Draw-BrutalistBox $g1 $x $y $cardW 360 ([System.Drawing.Color]::FromArgb(245, 16, 24, 40)) ([System.Drawing.Color]::White) 8

    Draw-BrutalistBox $g1 ($x + 30) ($y + 35) 240 45 $p.Color ([System.Drawing.Color]::Black) 4
    $fPTitle = New-Object System.Drawing.Font("Arial Black", 16, [System.Drawing.FontStyle]::Bold)
    $pBrush = if ($p.Color.R -gt 200 -and $p.Color.G -gt 200) { $bInk } else { $bWhite }
    $g1.DrawString($p.Title, $fPTitle, $pBrush, (New-Object System.Drawing.RectangleF(($x + 30), ($y + 35), 240, 45)), $sfCenter)

    $fPDesc = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
    $g1.DrawString($p.Desc, $fPDesc, $bCream, (New-Object System.Drawing.RectangleF(($x + 30), ($y + 110), ($cardW - 60), 210)), $sfLeft)
}

# Bottom takeaway
Draw-BrutalistBox $g1 120 830 1680 90 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 6
$fBottom = New-Object System.Drawing.Font("Arial Black", 24, [System.Drawing.FontStyle]::Bold)
$g1.DrawString("SPOILER: You do not need more lectures. You need peer problem-solving!", $fBottom, $bInk, (New-Object System.Drawing.RectangleF(120, 830, 1680, 90)), $sfCenter)

$s1File = Join-Path $framesDir "scene1.png"
$c1.Bitmap.Save($s1File, [System.Drawing.Imaging.ImageFormat]::Png)
$c1.Graphics.Dispose(); $c1.Bitmap.Dispose()


# =========================================================================
# SCENE 2: SYNTAX TO SOLUTIONS — 3 DAYS, ONE ARC
# =========================================================================
Write-Output "--- Rendering Scene 2: 3 Days, One Arc ---"
$c2 = New-BrutalistCanvas
$g2 = $c2.Graphics

# Top badge
Draw-BrutalistBox $g2 560 70 800 56 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 6
$g2.DrawString("TINKERHUB CE KARUNAGAPPALLY PRESENTS", $fPill, $bInk, (New-Object System.Drawing.RectangleF(560, 70, 800, 56)), $sfCenter)

$g2.DrawString("SYNTAX TO SOLUTIONS", $fHero, $bWhite, (New-Object System.Drawing.RectangleF(100, 150, 1720, 95)), $sfCenter)

$fSubArc = New-Object System.Drawing.Font("Consolas", 24, [System.Drawing.FontStyle]::Bold)
$g2.DrawString("// THREE DAYS, ONE ARC : FUNDAMENTALS -> LOGIC -> BUILD", $fSubArc, $bYellow, (New-Object System.Drawing.RectangleF(100, 250, 1720, 45)), $sfCenter)

# 3 Days Horizontal Showcase
$days = @(
    @{ Day = "DAY 01"; Sub = "SNAKE BYTES"; Date = "OCT 16 - 8 PM (ONLINE)"; Desc = "The Fundamentals: Syntax, variables, data types, strings, input/output, and conditionals."; Color = [System.Drawing.Color]::FromArgb(255, 43, 104, 156) },
    @{ Day = "DAY 02"; Sub = "LOGIC UNLOCKED"; Date = "OCT 17 - 8 PM (ONLINE)"; Desc = "Problem-Solving Arc: Loops, functions, scope, recursion, and AI as a learning companion."; Color = [System.Drawing.Color]::FromArgb(255, 253, 216, 72) },
    @{ Day = "DAY 03"; Sub = "FUNCTION JUNCTION"; Date = "OCT 22 (OFFLINE LAB)"; Desc = "Build & Collaborate: Modular functions, team code swaps, and assembling a live project!"; Color = [System.Drawing.Color]::FromArgb(255, 255, 0, 0) }
)

for ($i = 0; $i -lt 3; $i++) {
    $d = $days[$i]
    $x = $startX + ($i * ($cardW + $gap))
    $y = 330
    Draw-BrutalistBox $g2 $x $y $cardW 450 ([System.Drawing.Color]::FromArgb(245, 14, 22, 38)) ([System.Drawing.Color]::White) 8

    # Day number pill
    Draw-BrutalistBox $g2 ($x + 30) ($y + 30) 180 44 $d.Color ([System.Drawing.Color]::Black) 4
    $fDNum = New-Object System.Drawing.Font("Arial Black", 18, [System.Drawing.FontStyle]::Bold)
    $dBrush = if ($d.Color.R -gt 200 -and $d.Color.G -gt 200) { $bInk } else { $bWhite }
    $g2.DrawString($d.Day, $fDNum, $dBrush, (New-Object System.Drawing.RectangleF(($x + 30), ($y + 30), 180, 44)), $sfCenter)

    # Subtitle
    $fDSub = New-Object System.Drawing.Font("Arial Black", 26, [System.Drawing.FontStyle]::Bold)
    $g2.DrawString($d.Sub, $fDSub, $bWhite, (New-Object System.Drawing.RectangleF(($x + 30), ($y + 90), ($cardW - 60), 45)), $sfLeft)

    # Date
    $fDDate = New-Object System.Drawing.Font("Consolas", 16, [System.Drawing.FontStyle]::Bold)
    $g2.DrawString($d.Date, $fDDate, $bYellow, (New-Object System.Drawing.RectangleF(($x + 30), ($y + 140), ($cardW - 60), 30)), $sfLeft)

    # Divider
    $pDiv2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 255, 255, 255), 2)
    $g2.DrawLine($pDiv2, ($x + 30), ($y + 185), ($x + $cardW - 30), ($y + 185))
    $pDiv2.Dispose()

    # Desc
    $fDDesc = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Regular)
    $g2.DrawString($d.Desc, $fDDesc, $bCream, (New-Object System.Drawing.RectangleF(($x + 30), ($y + 205), ($cardW - 60), 220)), $sfLeft)
}

# Bottom Callout
Draw-BrutalistBox $g2 120 830 1680 90 ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) ([System.Drawing.Color]::Black) 6
$fCallout = New-Object System.Drawing.Font("Arial Black", 23, [System.Drawing.FontStyle]::Bold)
$g2.DrawString("NO PRIOR EXPERIENCE REQUIRED  -  100% FREE FOR ALL STUDENTS", $fCallout, $bWhite, (New-Object System.Drawing.RectangleF(120, 830, 1680, 90)), $sfCenter)

$s2File = Join-Path $framesDir "scene2.png"
$c2.Bitmap.Save($s2File, [System.Drawing.Imaging.ImageFormat]::Png)
$c2.Graphics.Dispose(); $c2.Bitmap.Dispose()


# =========================================================================
# SCENE 3: THE ONLINE TRACKS (DAYS 1 & 2)
# =========================================================================
Write-Output "--- Rendering Scene 3: Online Tracks ---"
$c3 = New-BrutalistCanvas
$g3 = $c3.Graphics

Draw-BrutalistBox $g3 480 60 960 60 ([System.Drawing.Color]::FromArgb(255, 43, 104, 156)) ([System.Drawing.Color]::White) 6
$g3.DrawString("ONLINE FOUNDATION TRACK : OCT 16 & 17 AT 8:00 PM", $fPill, $bWhite, (New-Object System.Drawing.RectangleF(480, 60, 960, 60)), $sfCenter)

$fTrackTitle = New-Object System.Drawing.Font("Arial Black", 50, [System.Drawing.FontStyle]::Bold)
$g3.DrawString("BUILDING LOGIC THAT ACTUALLY CLICKS", $fTrackTitle, $bWhite, (New-Object System.Drawing.RectangleF(100, 140, 1720, 75)), $sfCenter)

# Day 1 Box (Left)
Draw-BrutalistBox $g3 120 240 800 550 ([System.Drawing.Color]::FromArgb(245, 16, 24, 42)) ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) 10
Draw-BrutalistBox $g3 160 275 320 48 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 4
$fD1Head = New-Object System.Drawing.Font("Arial Black", 18, [System.Drawing.FontStyle]::Bold)
$g3.DrawString("DAY 01 : SNAKE BYTES", $fD1Head, $bInk, (New-Object System.Drawing.RectangleF(160, 275, 320, 48)), $sfCenter)

$fD1Sub = New-Object System.Drawing.Font("Arial Black", 30, [System.Drawing.FontStyle]::Bold)
$g3.DrawString("The Fundamentals", $fD1Sub, $bWhite, (New-Object System.Drawing.RectangleF(160, 340, 720, 45)), $sfLeft)

$fD1Points = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
$d1Text = "• Python syntax & core data types`n" +
          "• Dynamic variables, strings & I/O`n" +
          "• Decision branching with if / else`n" +
          "• Iteration loops without headaches`n" +
          "• Hands-on mini scripts right away"
$g3.DrawString($d1Text, $fD1Points, $bCream, (New-Object System.Drawing.RectangleF(160, 410, 720, 340)), $sfLeft)

# Day 2 Box (Right)
Draw-BrutalistBox $g3 1000 240 800 550 ([System.Drawing.Color]::FromArgb(245, 16, 24, 42)) ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) 10
Draw-BrutalistBox $g3 1040 275 340 48 ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) ([System.Drawing.Color]::Black) 4
$g3.DrawString("DAY 02 : LOGIC UNLOCKED", $fD1Head, $bWhite, (New-Object System.Drawing.RectangleF(1040, 275, 340, 48)), $sfCenter)

$g3.DrawString("The Problem-Solving Arc", $fD1Sub, $bWhite, (New-Object System.Drawing.RectangleF(1040, 340, 720, 45)), $sfLeft)

$d2Text = "• Control flow mastery & range()`n" +
          "• Writing reusable functions & scope`n" +
          "• Algorithmic thinking & recursion`n" +
          "• Breaking hard problems into steps`n" +
          "• AI as a learning companion - NOT a shortcut!"
$g3.DrawString($d2Text, $fD1Points, $bCream, (New-Object System.Drawing.RectangleF(1040, 410, 720, 340)), $sfLeft)

# Bottom Google Meet reminder
Draw-BrutalistBox $g3 120 830 1680 90 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 6
$g3.DrawString("OCT 16 & 17  -  8:00 PM LIVE ON GOOGLE MEET  -  INTERACTIVE DECKS PROVIDED", $fBottom, $bInk, (New-Object System.Drawing.RectangleF(120, 830, 1680, 90)), $sfCenter)

$s3File = Join-Path $framesDir "scene3.png"
$c3.Bitmap.Save($s3File, [System.Drawing.Imaging.ImageFormat]::Png)
$c3.Graphics.Dispose(); $c3.Bitmap.Dispose()


# =========================================================================
# SCENE 4: DAY 03 OFFLINE // FUNCTION JUNCTION
# =========================================================================
Write-Output "--- Rendering Scene 4: Day 3 Offline Function Junction ---"
$c4 = New-BrutalistCanvas
$g4 = $c4.Graphics

Draw-BrutalistBox $g4 480 60 960 60 ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) ([System.Drawing.Color]::Black) 6
$g4.DrawString("DAY 03 GRAND FINALE : OCTOBER 22 (IN-PERSON)", $fPill, $bWhite, (New-Object System.Drawing.RectangleF(480, 60, 960, 60)), $sfCenter)

$fOffTitle = New-Object System.Drawing.Font("Arial Black", 52, [System.Drawing.FontStyle]::Bold)
$g4.DrawString("FUNCTION JUNCTION // OFFLINE SESSION", $fOffTitle, $bWhite, (New-Object System.Drawing.RectangleF(100, 140, 1720, 75)), $sfCenter)

# Left: Day 3 Photo Embed
if (Test-Path $day3ImgPath) {
    $imgD3 = [System.Drawing.Image]::FromFile($day3ImgPath)
    $d3Rect = New-Object System.Drawing.Rectangle(120, 240, 780, 550)
    
    $shD3 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 0, 0, 0))
    $g4.FillRectangle($shD3, 132, 252, 780, 550)
    $shD3.Dispose()

    $g4.DrawImage($imgD3, $d3Rect)
    $imgD3.Dispose()

    $pBorderD3 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 253, 216, 72), 4)
    $g4.DrawRectangle($pBorderD3, $d3Rect)
    $pBorderD3.Dispose()

    Draw-BrutalistBox $g4 150 270 320 45 ([System.Drawing.Color]::Black) ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) 4
    $g4.DrawString("CEK CAMPUS MAKER LAB", $fPTitle, $bYellow, (New-Object System.Drawing.RectangleF(150, 270, 320, 45)), $sfCenter)
}

# Right: The Code Swap Blueprint
Draw-BrutalistBox $g4 940 240 860 550 ([System.Drawing.Color]::FromArgb(245, 14, 22, 38)) ([System.Drawing.Color]::White) 10

$fSwapHead = New-Object System.Drawing.Font("Arial Black", 28, [System.Drawing.FontStyle]::Bold)
$g4.DrawString("THE TEAM CODE SWAP CHALLENGE", $fSwapHead, $bYellow, (New-Object System.Drawing.RectangleF(980, 275, 780, 45)), $sfLeft)

$fSwapDesc = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
$swapPoints = "1. Put your skills to work offline at CE Karunagappally!`n`n" +
              "2. Build modular functions with your team.`n`n" +
              "3. Swap code with neighboring tables - figure out how unfamiliar code works!`n`n" +
              "4. Assemble all pieces into one live collaborative app.`n`n" +
              "5. Experience real developer teamwork in action!"

$g4.DrawString($swapPoints, $fSwapDesc, $bCream, (New-Object System.Drawing.RectangleF(980, 345, 780, 420)), $sfLeft)

# Bottom Quote
Draw-BrutalistBox $g4 120 830 1680 90 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 6
$g4.DrawString("Collaboration turns individual ideas into something bigger.", $fBottom, $bInk, (New-Object System.Drawing.RectangleF(120, 830, 1680, 90)), $sfCenter)

$s4File = Join-Path $framesDir "scene4.png"
$c4.Bitmap.Save($s4File, [System.Drawing.Imaging.ImageFormat]::Png)
$c4.Graphics.Dispose(); $c4.Bitmap.Dispose()


# =========================================================================
# SCENE 5: MENTOR ARJUN S NAIR & WHAT TO BRING
# =========================================================================
Write-Output "--- Rendering Scene 5: Mentor & What To Bring ---"
$c5 = New-BrutalistCanvas
$g5 = $c5.Graphics

# Left: Mentor Profile
Draw-BrutalistBox $g5 120 120 820 680 ([System.Drawing.Color]::FromArgb(245, 16, 26, 46)) ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) 10

Draw-BrutalistBox $g5 160 160 260 46 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 4
$g5.DrawString("STUDY JAM MENTOR", $fPTitle, $bInk, (New-Object System.Drawing.RectangleF(160, 160, 260, 46)), $sfCenter)

$fMName = New-Object System.Drawing.Font("Arial Black", 44, [System.Drawing.FontStyle]::Bold)
$g5.DrawString("ARJUN S NAIR", $fMName, $bWhite, (New-Object System.Drawing.RectangleF(160, 230, 740, 65)), $sfLeft)

$fMRole = New-Object System.Drawing.Font("Consolas", 22, [System.Drawing.FontStyle]::Bold)
$g5.DrawString("Learning Coordinator - CE Karunagappally", $fMRole, $bYellow, (New-Object System.Drawing.RectangleF(160, 305, 740, 35)), $sfLeft)

$pDivM5 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 255, 255, 255), 2)
$g5.DrawLine($pDivM5, 160, 365, 880, 365)
$pDivM5.Dispose()

$fMQuote = New-Object System.Drawing.Font("Arial", 21, [System.Drawing.FontStyle]::Regular)
$qText = "“Bring your laptop, a notebook, and one idea you want to build.`n`n" +
         "In-person peer mentoring is where breakthroughs happen. We will unblock every bug, review your logic, and make sure everyone builds something they are proud of.”"
$g5.DrawString($qText, $fMQuote, $bCream, (New-Object System.Drawing.RectangleF(160, 400, 740, 360)), $sfLeft)

# Right: The 3 Essentials Checklist
Draw-BrutalistBox $g5 980 120 820 680 ([System.Drawing.Color]::FromArgb(245, 16, 26, 46)) ([System.Drawing.Color]::White) 10

Draw-BrutalistBox $g5 1020 160 300 46 ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) ([System.Drawing.Color]::Black) 4
$g5.DrawString("WHAT TO BRING", $fPTitle, $bWhite, (New-Object System.Drawing.RectangleF(1020, 160, 300, 46)), $sfCenter)

$fChkHead = New-Object System.Drawing.Font("Arial Black", 34, [System.Drawing.FontStyle]::Bold)
$g5.DrawString("YOUR TOOLKIT FOR DAY 3", $fChkHead, $bWhite, (New-Object System.Drawing.RectangleF(1020, 230, 740, 50)), $sfLeft)

$fItems = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Regular)
$itemsText = "[+] 1. CHARGED LAPTOP`n" +
             "    With Python 3 installed & ready to code.`n`n" +
             "[+] 2. NOTEBOOK & PEN`n" +
             "    For logic diagrams & sketching function pipelines.`n`n" +
             "[+] 3. ONE IDEA YOU WANT TO BUILD`n" +
             "    Automation, web tool, or game - bring your curiosity!`n`n" +
             "[+] 4. ZERO EGO & PURE ENTHUSIASM`n" +
             "    We learn, fail, and succeed together as a community."

$g5.DrawString($itemsText, $fItems, $bCream, (New-Object System.Drawing.RectangleF(1020, 310, 740, 460)), $sfLeft)

# Bottom strip
Draw-BrutalistBox $g5 120 830 1680 90 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 6
$g5.DrawString("OCTOBER 22  -  CE KARUNAGAPPALLY CAMPUS  -  FREE COMMUNITY EVENT", $fBottom, $bInk, (New-Object System.Drawing.RectangleF(120, 830, 1680, 90)), $sfCenter)

$s5File = Join-Path $framesDir "scene5.png"
$c5.Bitmap.Save($s5File, [System.Drawing.Imaging.ImageFormat]::Png)
$c5.Graphics.Dispose(); $c5.Bitmap.Dispose()


# =========================================================================
# SCENE 6: GRAND FINALE / CALL TO ACTION
# =========================================================================
Write-Output "--- Rendering Scene 6: Finale / Call To Action ---"
$c6 = New-BrutalistCanvas
$g6 = $c6.Graphics

# Embed Poster image if available
if (Test-Path $posterImgPath) {
    $imgP6 = [System.Drawing.Image]::FromFile($posterImgPath)
    $pRect6 = New-Object System.Drawing.Rectangle(120, 150, 560, 760)

    $shP6 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 0, 0, 0))
    $g6.FillRectangle($shP6, 132, 162, 560, 760)
    $shP6.Dispose()

    $g6.DrawImage($imgP6, $pRect6)
    $imgP6.Dispose()

    $pBorderP6 = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 4)
    $g6.DrawRectangle($pBorderP6, $pRect6)
    $pBorderP6.Dispose()
}

# Right side details
Draw-BrutalistBox $g6 730 150 1070 760 ([System.Drawing.Color]::FromArgb(245, 14, 22, 38)) ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) 10

Draw-BrutalistBox $g6 770 190 450 48 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 4
$g6.DrawString("TINKERHUB CE KARUNAGAPPALLY", $fPTitle, $bInk, (New-Object System.Drawing.RectangleF(770, 190, 450, 48)), $sfCenter)

$fFinBig = New-Object System.Drawing.Font("Arial Black", 56, [System.Drawing.FontStyle]::Bold)
$g6.DrawString("SYNTAX TO SOLUTIONS", $fFinBig, $bWhite, (New-Object System.Drawing.RectangleF(770, 260, 990, 75)), $sfLeft)

$fFinDate = New-Object System.Drawing.Font("Consolas", 24, [System.Drawing.FontStyle]::Bold)
$g6.DrawString("OCTOBER 16, 17 (ONLINE 8 PM) & 22 (OFFLINE)", $fFinDate, $bYellow, (New-Object System.Drawing.RectangleF(770, 345, 990, 35)), $sfLeft)

# Summary list
$fFinList = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
$sumText = "• Day 01: Snake Bytes (Oct 16 Online, 8 PM - Fundamentals)`n" +
           "• Day 02: Logic Unlocked (Oct 17 Online, 8 PM - Problem Solving)`n" +
           "• Day 03: Function Junction (Oct 22 Offline - Hands-on Team Build)`n`n" +
           "Mentor: Arjun S Nair (Learning Coordinator)`n" +
           "Open to all departments and all batches. 100% Free."

$g6.DrawString($sumText, $fFinList, $bCream, (New-Object System.Drawing.RectangleF(770, 400, 990, 210)), $sfLeft)

# Big CTA Button
Draw-BrutalistBox $g6 770 640 990 90 ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) ([System.Drawing.Color]::Black) 6
$fBtnFin = New-Object System.Drawing.Font("Arial Black", 30, [System.Drawing.FontStyle]::Bold)
$g6.DrawString("CLAIM YOUR SPOT & START BUILDING ->", $fBtnFin, $bWhite, (New-Object System.Drawing.RectangleF(770, 640, 990, 90)), $sfCenter)

# Footnote
$fFinFoot = New-Object System.Drawing.Font("Consolas", 17, [System.Drawing.FontStyle]::Bold)
$g6.DrawString("tinkerhubceknpy-syntax-to-solution-python.vercel.app  •  Feedback/Share: forms.gle/W92BEYkN2sBf7R88A", $fFinFoot, $bMuted, (New-Object System.Drawing.RectangleF(770, 760, 990, 40)), $sfLeft)

$s6File = Join-Path $framesDir "scene6.png"
$c6.Bitmap.Save($s6File, [System.Drawing.Imaging.ImageFormat]::Png)
$c6.Graphics.Dispose(); $c6.Bitmap.Dispose()

Write-Output "--- All 6 Scene Frames Rendered Successfully ---"
Write-Output "--- Compiling 31-Second 1080p MP4 Video with FFmpeg and Sound Track ---"

$audioFile = Join-Path $projectDir "assets\soundtrack.mp3"

# 6 scenes with 0.8s smooth crossfades at 5.2s intervals -> Total 31.2 seconds!
$filterComplex = '[0:v][1:v]xfade=transition=fade:duration=0.8:offset=5.2[v01];[v01][2:v]xfade=transition=slideleft:duration=0.8:offset=10.4[v12];[v12][3:v]xfade=transition=circleopen:duration=0.8:offset=15.6[v23];[v23][4:v]xfade=transition=slideright:duration=0.8:offset=20.8[v34];[v34][5:v]xfade=transition=fade:duration=0.8:offset=26.0[vfinal];[6:a]afade=t=in:st=0:d=1,afade=t=out:st=28:d=3[afinal]'

$ffArgs = @(
    "-y",
    "-loop", "1", "-t", "6.0", "-i", $s1File,
    "-loop", "1", "-t", "6.0", "-i", $s2File,
    "-loop", "1", "-t", "6.0", "-i", $s3File,
    "-loop", "1", "-t", "6.0", "-i", $s4File,
    "-loop", "1", "-t", "6.0", "-i", $s5File,
    "-loop", "1", "-t", "7.0", "-i", $s6File,
    "-ss", "0", "-t", "31.5", "-i", $audioFile,
    "-filter_complex", $filterComplex,
    "-map", "[vfinal]",
    "-map", "[afinal]",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "19",
    "-pix_fmt", "yuv420p",
    "-r", "30",
    "-c:a", "aac",
    "-b:a", "192k",
    "-shortest",
    $outputVideo
)

Write-Output "Executing FFmpeg encoding for 31s Hype Trailer..."
& $ffmpegPath $ffArgs

if (Test-Path $outputVideo) {
    $fileInfo = Get-Item $outputVideo
    $sizeMB = [Math]::Round(($fileInfo.Length / 1MB), 2)
    Write-Output "SUCCESS: Created $outputVideo ($sizeMB MB)"

    $artifactDir = "C:\Users\sathi\.gemini\antigravity-ide\brain\a88dc9bd-5da1-429a-82b7-42ab12384759"
    Copy-Item $outputVideo (Join-Path $artifactDir "tinkerhub_python_studyjam.mp4") -Force
    Write-Output "Copied to artifact directory."
} else {
    Write-Error "Failed to generate video output."
}
