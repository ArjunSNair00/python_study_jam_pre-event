# TinkerHub CE Karunagappally - Day 3 Offline Session Video Renderer
# Generates 1920x1080 visual scene cards for "Day 3: Function Junction - The Offline Session"
# Compiles a cinematic MP4 video with high quality audio synthesis and smooth crossfades

Add-Type -AssemblyName System.Drawing

$projectDir = "C:\Users\sathi\.gemini\antigravity-ide\scratch\tinkerhub-python-studyjam"
$framesDir = Join-Path $projectDir "video_frames_day3"
$posterImgPath = Join-Path $projectDir "assets\poster.png"
$day3ImgPath = Join-Path $projectDir "assets\day3_offline.jpg"
$badgeImgPath = Join-Path $projectDir "assets\community_badge.jpg"
$ffmpegPath = "C:\Users\sathi\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe"
$outputVideo = Join-Path $projectDir "day3_offline_session.mp4"

if (-not (Test-Path $framesDir)) {
    New-Item -ItemType Directory -Path $framesDir -Force | Out-Null
}

$W = 1920
$H = 1080

function New-Day3Canvas {
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Deep cyber-blue gradient background
    $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(255, 10, 16, 28),
        [System.Drawing.Color]::FromArgb(255, 24, 48, 80),
        45.0
    )
    $g.FillRectangle($bgBrush, $rect)
    $bgBrush.Dispose()

    # Ambient golden-yellow glow orb (top right)
    $path1 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path1.AddEllipse(1300, -150, 750, 750)
    $glow1 = New-Object System.Drawing.Drawing2D.PathGradientBrush($path1)
    $glow1.CenterColor = [System.Drawing.Color]::FromArgb(60, 253, 216, 72)
    $glow1.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $g.FillPath($glow1, $path1)
    $path1.Dispose(); $glow1.Dispose()

    # Ambient royal blue glow orb (bottom left)
    $path2 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path2.AddEllipse(-150, 550, 800, 800)
    $glow2 = New-Object System.Drawing.Drawing2D.PathGradientBrush($path2)
    $glow2.CenterColor = [System.Drawing.Color]::FromArgb(70, 43, 104, 156)
    $glow2.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
    $g.FillPath($glow2, $path2)
    $path2.Dispose(); $glow2.Dispose()

    # Subtle tech dot grid
    $gridPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(20, 255, 255, 255), 1)
    for ($x = 0; $x -lt $W; $x += 100) {
        $g.DrawLine($gridPen, $x, 0, $x, $H)
    }
    for ($y = 0; $y -lt $H; $y += 100) {
        $g.DrawLine($gridPen, 0, $y, $W, $y)
    }
    $gridPen.Dispose()

    return @{ Bitmap = $bmp; Graphics = $g }
}

function Draw-BrutalistCard($g, $x, $y, $w, $h, $bgColor, $borderColor, $shadowOffset = 8) {
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
$bMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 180, 195, 215))

$sfCenter = New-Object System.Drawing.StringFormat
$sfCenter.Alignment = [System.Drawing.StringAlignment]::Center
$sfCenter.LineAlignment = [System.Drawing.StringAlignment]::Center

$sfLeft = New-Object System.Drawing.StringFormat
$sfLeft.Alignment = [System.Drawing.StringAlignment]::Near
$sfLeft.LineAlignment = [System.Drawing.StringAlignment]::Center

# =========================================================================
# SCENE 1: DAY 03 ANNOUNCEMENT - THE OFFLINE CLIMAX
# =========================================================================
Write-Output "--- Rendering Day 3 Frame 1: The Offline Climax ---"
$c1 = New-Day3Canvas
$g1 = $c1.Graphics

Draw-BrutalistCard $g1 560 80 800 56 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 6
$fPill = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Bold)
$g1.DrawString("TINKERHUB CE KARUNAGAPPALLY PRESENTS", $fPill, $bInk, (New-Object System.Drawing.RectangleF(560, 80, 800, 56)), $sfCenter)

$fKicker = New-Object System.Drawing.Font("Consolas", 24, [System.Drawing.FontStyle]::Bold)
$g1.DrawString("// DAY 03 OF 03 : THE GRAND OFFLINE FINALE", $fKicker, $bYellow, (New-Object System.Drawing.RectangleF(200, 175, 1520, 45)), $sfCenter)

$fHero = New-Object System.Drawing.Font("Arial Black", 72, [System.Drawing.FontStyle]::Bold)
$g1.DrawString("FUNCTION JUNCTION", $fHero, $bWhite, (New-Object System.Drawing.RectangleF(200, 230, 1520, 110)), $sfCenter)

Draw-BrutalistCard $g1 360 360 1200 70 ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) ([System.Drawing.Color]::Black) 6
$fSub = New-Object System.Drawing.Font("Arial", 25, [System.Drawing.FontStyle]::Bold)
$g1.DrawString("BUILD AND COLLABORATE - IN-PERSON MAKER SESSION", $fSub, $bWhite, (New-Object System.Drawing.RectangleF(360, 360, 1200, 70)), $sfCenter)

# 3 Stat Cards
Draw-BrutalistCard $g1 220 480 440 380 ([System.Drawing.Color]::FromArgb(240, 22, 32, 54)) ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) 8
$fCardHead = New-Object System.Drawing.Font("Arial Black", 24, [System.Drawing.FontStyle]::Bold)
$fCardBody = New-Object System.Drawing.Font("Consolas", 18, [System.Drawing.FontStyle]::Regular)
$g1.DrawString("DATE AND VENUE", $fCardHead, $bYellow, (New-Object System.Drawing.RectangleF(250, 510, 380, 45)), $sfLeft)
$textCard1 = "OCTOBER 22`n`nIn-Person Campus Lab`nCE Karunagappally`n`nNo Google Meet link!`nReal peers side-by-side."
$g1.DrawString($textCard1, $fCardBody, $bWhite, (New-Object System.Drawing.RectangleF(250, 570, 380, 260)), $sfLeft)

Draw-BrutalistCard $g1 740 480 440 380 ([System.Drawing.Color]::FromArgb(240, 22, 32, 54)) ([System.Drawing.Color]::White) 8
$g1.DrawString("THE MISSION", $fCardHead, $bWhite, (New-Object System.Drawing.RectangleF(770, 510, 380, 45)), $sfLeft)
$textCard2 = "From isolated syntax`nto collaborative power.`n`nWrite modular functions,`nswap code with peers,`nbuild one unified app!"
$g1.DrawString($textCard2, $fCardBody, $bCream, (New-Object System.Drawing.RectangleF(770, 570, 380, 260)), $sfLeft)

Draw-BrutalistCard $g1 1260 480 440 380 ([System.Drawing.Color]::FromArgb(240, 22, 32, 54)) ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) 8
$g1.DrawString("WHAT TO BRING", $fCardHead, $bYellow, (New-Object System.Drawing.RectangleF(1290, 510, 380, 45)), $sfLeft)
$textCard3 = "1. Charged Laptop`n2. Notebook and Pen`n3. One Idea To Build`n`nZero prior experience?`nAll students welcome!"
$g1.DrawString($textCard3, $fCardBody, $bWhite, (New-Object System.Drawing.RectangleF(1290, 570, 380, 260)), $sfLeft)

$fFoot = New-Object System.Drawing.Font("Consolas", 20, [System.Drawing.FontStyle]::Bold)
$g1.DrawString("SYNTAX TO SOLUTIONS // TINKERHUB CEK OFFLINE DAY 3", $fFoot, $bYellow, (New-Object System.Drawing.RectangleF(200, 930, 1520, 50)), $sfCenter)

$s1Path = Join-Path $framesDir "day3_scene1.png"
$c1.Bitmap.Save($s1Path, [System.Drawing.Imaging.ImageFormat]::Png)
$c1.Graphics.Dispose(); $c1.Bitmap.Dispose()


# =========================================================================
# SCENE 2: STEP AWAY FROM SCREENS // REAL COLLABORATION LAB
# =========================================================================
Write-Output "--- Rendering Day 3 Frame 2: Real Collaboration Lab ---"
$c2 = New-Day3Canvas
$g2 = $c2.Graphics

if (Test-Path $day3ImgPath) {
    $img2 = [System.Drawing.Image]::FromFile($day3ImgPath)
    $imgRect = New-Object System.Drawing.Rectangle(100, 150, 960, 680)
    
    $shBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 0, 0, 0))
    $g2.FillRectangle($shBrush, 112, 162, 960, 680)
    $shBrush.Dispose()

    $g2.DrawImage($img2, $imgRect)
    $img2.Dispose()

    $pBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 253, 216, 72), 5)
    $g2.DrawRectangle($pBorder, $imgRect)
    $pBorder.Dispose()

    Draw-BrutalistCard $g2 130 180 340 50 ([System.Drawing.Color]::Black) ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) 4
    $fStamp = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
    $g2.DrawString("LIVE OFFLINE LAB", $fStamp, $bYellow, (New-Object System.Drawing.RectangleF(130, 180, 340, 50)), $sfCenter)
}

Draw-BrutalistCard $g2 1120 150 700 680 ([System.Drawing.Color]::FromArgb(245, 16, 24, 42)) ([System.Drawing.Color]::White) 10

$fSecBadge = New-Object System.Drawing.Font("Consolas", 16, [System.Drawing.FontStyle]::Bold)
$g2.DrawString("// THE IN-PERSON VIBE", $fSecBadge, $bYellow, (New-Object System.Drawing.RectangleF(1160, 190, 620, 30)), $sfLeft)

$fSecTitle = New-Object System.Drawing.Font("Arial Black", 38, [System.Drawing.FontStyle]::Bold)
$g2.DrawString("NO MORE CODING`nIN ISOLATION.", $fSecTitle, $bWhite, (New-Object System.Drawing.RectangleF(1160, 230, 620, 110)), $sfLeft)

$fDesc = New-Object System.Drawing.Font("Arial", 19, [System.Drawing.FontStyle]::Regular)
$bodyText = "After 2 nights of virtual fundamentals, we gather physically at College of Engineering Karunagappally.`n`n" +
            "* Sit side-by-side with peer programmers`n" +
            "* Immediate unblocking - mentors right beside you`n" +
            "* Whiteboarding logic before writing syntax`n" +
            "* Share laughs over syntax errors and celebrate working code together!"

$g2.DrawString($bodyText, $fDesc, $bCream, (New-Object System.Drawing.RectangleF(1160, 370, 620, 350)), $sfLeft)

Draw-BrutalistCard $g2 100 870 1720 90 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 6
$fMantra = New-Object System.Drawing.Font("Arial Black", 21, [System.Drawing.FontStyle]::Bold)
$g2.DrawString("The best way to learn programming is laughing with peers while fixing broken code.", $fMantra, $bInk, (New-Object System.Drawing.RectangleF(100, 870, 1720, 90)), $sfCenter)

$s2Path = Join-Path $framesDir "day3_scene2.png"
$c2.Bitmap.Save($s2Path, [System.Drawing.Imaging.ImageFormat]::Png)
$c2.Graphics.Dispose(); $c2.Bitmap.Dispose()


# =========================================================================
# SCENE 3: THE MECHANICS — THE CODE SWAP CHALLENGE
# =========================================================================
Write-Output "--- Rendering Day 3 Frame 3: The Code Swap Challenge ---"
$c3 = New-Day3Canvas
$g3 = $c3.Graphics

Draw-BrutalistCard $g3 480 60 960 60 ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) ([System.Drawing.Color]::Black) 6
$g3.DrawString("DAY 3 EXCLUSIVE ACTIVITY : THE CODE SWAP", $fPill, $bWhite, (New-Object System.Drawing.RectangleF(480, 60, 960, 60)), $sfCenter)

$fBigHead = New-Object System.Drawing.Font("Arial Black", 50, [System.Drawing.FontStyle]::Bold)
$g3.DrawString("HOW FUNCTION JUNCTION WORKS", $fBigHead, $bWhite, (New-Object System.Drawing.RectangleF(100, 140, 1720, 75)), $sfCenter)

$steps = @(
    @{ Num = "STEP 01"; Title = "BUILD FUNCTIONS"; Desc = "Each team builds 1 clean, focused Python function (validator, parser, or transformer)."; Color = [System.Drawing.Color]::FromArgb(255, 43, 104, 156) },
    @{ Num = "STEP 02"; Title = "THE SWAP PASS"; Desc = "Hands off keyboards! Pass your code to the neighboring team with zero verbal hints."; Color = [System.Drawing.Color]::FromArgb(255, 253, 216, 72) },
    @{ Num = "STEP 03"; Title = "READ AND TEST"; Desc = "Decipher foreign code, run docstrings, test boundary cases, and identify inputs and outputs."; Color = [System.Drawing.Color]::FromArgb(255, 255, 223, 90) },
    @{ Num = "STEP 04"; Title = "ASSEMBLE APP"; Desc = "Plug all swapped functions together like Lego bricks to run one collaborative live project!"; Color = [System.Drawing.Color]::FromArgb(255, 255, 0, 0) }
)

$cardW = 390
$startX = 100
$gap = 50

for ($i = 0; $i -lt 4; $i++) {
    $st = $steps[$i]
    $x = $startX + ($i * ($cardW + $gap))
    $y = 260
    
    Draw-BrutalistCard $g3 $x $y $cardW 520 ([System.Drawing.Color]::FromArgb(245, 14, 22, 38)) ([System.Drawing.Color]::White) 8

    Draw-BrutalistCard $g3 ($x + 30) ($y + 35) 150 42 $st.Color ([System.Drawing.Color]::Black) 4
    $fStNum = New-Object System.Drawing.Font("Arial Black", 16, [System.Drawing.FontStyle]::Bold)
    $pillBrush = if ($st.Color.R -gt 200 -and $st.Color.G -gt 200) { $bInk } else { $bWhite }
    $g3.DrawString($st.Num, $fStNum, $pillBrush, (New-Object System.Drawing.RectangleF(($x + 30), ($y + 35), 150, 42)), $sfCenter)

    $fStTitle = New-Object System.Drawing.Font("Arial Black", 22, [System.Drawing.FontStyle]::Bold)
    $g3.DrawString($st.Title, $fStTitle, $bWhite, (New-Object System.Drawing.RectangleF(($x + 30), ($y + 110), ($cardW - 60), 90)), $sfLeft)

    $pDiv = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(100, 255, 255, 255), 2)
    $g3.DrawLine($pDiv, ($x + 30), ($y + 220), ($x + $cardW - 30), ($y + 220))
    $pDiv.Dispose()

    $fStDesc = New-Object System.Drawing.Font("Arial", 18, [System.Drawing.FontStyle]::Regular)
    $g3.DrawString($st.Desc, $fStDesc, $bCream, (New-Object System.Drawing.RectangleF(($x + 30), ($y + 250), ($cardW - 60), 220)), $sfLeft)
}

Draw-BrutalistCard $g3 100 830 1720 100 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 6
$fLesson = New-Object System.Drawing.Font("Arial Black", 23, [System.Drawing.FontStyle]::Bold)
$g3.DrawString("INDUSTRY REALITY: Reading other developers code is 80% of software engineering!", $fLesson, $bInk, (New-Object System.Drawing.RectangleF(100, 830, 1720, 100)), $sfCenter)

$s3Path = Join-Path $framesDir "day3_scene3.png"
$c3.Bitmap.Save($s3Path, [System.Drawing.Imaging.ImageFormat]::Png)
$c3.Graphics.Dispose(); $c3.Bitmap.Dispose()


# =========================================================================
# SCENE 4: MENTOR ARJUN S NAIR & THE TINKERHUB WAY
# =========================================================================
Write-Output "--- Rendering Day 3 Frame 4: Mentor and Community Guidance ---"
$c4 = New-Day3Canvas
$g4 = $c4.Graphics

Draw-BrutalistCard $g4 120 150 780 720 ([System.Drawing.Color]::FromArgb(245, 18, 28, 50)) ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) 10

Draw-BrutalistCard $g4 160 190 260 48 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 4
$fMentorTag = New-Object System.Drawing.Font("Arial Black", 16, [System.Drawing.FontStyle]::Bold)
$g4.DrawString("STUDY JAM MENTOR", $fMentorTag, $bInk, (New-Object System.Drawing.RectangleF(160, 190, 260, 48)), $sfCenter)

$fMentorName = New-Object System.Drawing.Font("Arial Black", 46, [System.Drawing.FontStyle]::Bold)
$g4.DrawString("ARJUN S NAIR", $fMentorName, $bWhite, (New-Object System.Drawing.RectangleF(160, 260, 700, 65)), $sfLeft)

$fMentorRole = New-Object System.Drawing.Font("Consolas", 22, [System.Drawing.FontStyle]::Bold)
$g4.DrawString("Learning Coordinator - CE Karunagappally", $fMentorRole, $bYellow, (New-Object System.Drawing.RectangleF(160, 335, 700, 40)), $sfLeft)

$pDivM = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 255, 255, 255), 2)
$g4.DrawLine($pDivM, 160, 400, 840, 400)
$pDivM.Dispose()

$fMentorPoints = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Regular)
$mPoints = "Python is easy. Until it is not.`n`n" +
           "When you hit syntax walls or logical dead-ends, you do not need another generic tutorial video.`n`n" +
           "You need peers who share your excitement, senior mentors to demystify stack traces, and a real space to experiment freely without judgment."

$g4.DrawString($mPoints, $fMentorPoints, $bCream, (New-Object System.Drawing.RectangleF(160, 430, 700, 390)), $sfLeft)

if (Test-Path $posterImgPath) {
    $imgPost = [System.Drawing.Image]::FromFile($posterImgPath)
    $pRect = New-Object System.Drawing.Rectangle(960, 150, 520, 720)
    
    $pSh = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220, 0, 0, 0))
    $g4.FillRectangle($pSh, 972, 162, 520, 720)
    $pSh.Dispose()

    $g4.DrawImage($imgPost, $pRect)
    $imgPost.Dispose()

    $pPosterBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 4)
    $g4.DrawRectangle($pPosterBorder, $pRect)
    $pPosterBorder.Dispose()
}

Draw-BrutalistCard $g4 1520 150 300 720 ([System.Drawing.Color]::FromArgb(245, 12, 18, 32)) ([System.Drawing.Color]::White) 8

$fStatN = New-Object System.Drawing.Font("Arial Black", 44, [System.Drawing.FontStyle]::Bold)
$fStatL = New-Object System.Drawing.Font("Consolas", 15, [System.Drawing.FontStyle]::Bold)

$g4.DrawString("DAY", $fStatL, $bYellow, (New-Object System.Drawing.RectangleF(1540, 190, 260, 30)), $sfCenter)
$g4.DrawString("03", $fStatN, $bWhite, (New-Object System.Drawing.RectangleF(1540, 220, 260, 65)), $sfCenter)

$g4.DrawString("DATE", $fStatL, $bYellow, (New-Object System.Drawing.RectangleF(1540, 330, 260, 30)), $sfCenter)
$g4.DrawString("OCT 22", $fStatN, $bWhite, (New-Object System.Drawing.RectangleF(1540, 360, 260, 65)), $sfCenter)

$g4.DrawString("VENUE", $fStatL, $bYellow, (New-Object System.Drawing.RectangleF(1540, 470, 260, 30)), $sfCenter)
$fVenueMini = New-Object System.Drawing.Font("Arial Black", 24, [System.Drawing.FontStyle]::Bold)
$g4.DrawString("CEK`nCAMPUS", $fVenueMini, $bCream, (New-Object System.Drawing.RectangleF(1540, 500, 260, 80)), $sfCenter)

$g4.DrawString("ENTRY", $fStatL, $bYellow, (New-Object System.Drawing.RectangleF(1540, 640, 260, 30)), $sfCenter)
$bGreen = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 157, 255, 32))
$g4.DrawString("FREE", $fStatN, $bGreen, (New-Object System.Drawing.RectangleF(1540, 670, 260, 65)), $sfCenter)
$bGreen.Dispose()

$s4Path = Join-Path $framesDir "day3_scene4.png"
$c4.Bitmap.Save($s4Path, [System.Drawing.Imaging.ImageFormat]::Png)
$c4.Graphics.Dispose(); $c4.Bitmap.Dispose()


# =========================================================================
# SCENE 5: FINALE & CALL TO ACTION - SEE YOU OFFLINE!
# =========================================================================
Write-Output "--- Rendering Day 3 Frame 5: Offline Climax and Action Call ---"
$c5 = New-Day3Canvas
$g5 = $c5.Graphics

Draw-BrutalistCard $g5 260 100 1400 90 ([System.Drawing.Color]::FromArgb(255, 253, 216, 72)) ([System.Drawing.Color]::Black) 8
$fFinTop = New-Object System.Drawing.Font("Arial Black", 30, [System.Drawing.FontStyle]::Bold)
$g5.DrawString("OCTOBER 22 : OFFLINE BUILD AND COLLABORATE", $fFinTop, $bInk, (New-Object System.Drawing.RectangleF(260, 100, 1400, 90)), $sfCenter)

$fFinTitle = New-Object System.Drawing.Font("Arial Black", 66, [System.Drawing.FontStyle]::Bold)
$g5.DrawString("SYNTAX TO SOLUTIONS", $fFinTitle, $bWhite, (New-Object System.Drawing.RectangleF(100, 220, 1720, 95)), $sfCenter)

$fFinSub = New-Object System.Drawing.Font("Consolas", 26, [System.Drawing.FontStyle]::Bold)
$g5.DrawString("DAY 3: FUNCTION JUNCTION - TINKERHUB CE KARUNAGAPPALLY", $fFinSub, $bYellow, (New-Object System.Drawing.RectangleF(100, 320, 1720, 45)), $sfCenter)

# Checklist Box
Draw-BrutalistCard $g5 360 400 1200 360 ([System.Drawing.Color]::FromArgb(245, 14, 22, 38)) ([System.Drawing.Color]::White) 10

$fBoxHead = New-Object System.Drawing.Font("Arial Black", 26, [System.Drawing.FontStyle]::Bold)
$g5.DrawString("CHECKLIST FOR OCTOBER 22 OFFLINE SESSION:", $fBoxHead, $bCream, (New-Object System.Drawing.RectangleF(410, 435, 1100, 45)), $sfLeft)

$fList = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Regular)
$items = "[+] Fully charged laptop with Python 3.x installed`n" +
         "[+] Notebook and pen for logic wireframing`n" +
         "[+] One problem or creative idea you are curious about`n" +
         "[+] Completed Day 1 (Snake Bytes) and Day 2 (Logic Unlocked) concepts"

$g5.DrawString($items, $fList, $bWhite, (New-Object System.Drawing.RectangleF(410, 500, 1100, 220)), $sfLeft)

Draw-BrutalistCard $g5 460 800 1000 95 ([System.Drawing.Color]::FromArgb(255, 255, 0, 0)) ([System.Drawing.Color]::Black) 8
$fBtnText = New-Object System.Drawing.Font("Arial Black", 30, [System.Drawing.FontStyle]::Bold)
$g5.DrawString("BE READY TO JAM IN-PERSON ->", $fBtnText, $bWhite, (New-Object System.Drawing.RectangleF(460, 800, 1000, 95)), $sfCenter)

$fUrl = New-Object System.Drawing.Font("Consolas", 18, [System.Drawing.FontStyle]::Bold)
$g5.DrawString("tinkerhubceknpy-syntax-to-solution-python.vercel.app  |  Share Projects: forms.gle/W92BEYkN2sBf7R88A", $fUrl, $bMuted, (New-Object System.Drawing.RectangleF(100, 930, 1720, 40)), $sfCenter)

$s5Path = Join-Path $framesDir "day3_scene5.png"
$c5.Bitmap.Save($s5Path, [System.Drawing.Imaging.ImageFormat]::Png)
$c5.Graphics.Dispose(); $c5.Bitmap.Dispose()

Write-Output "--- All 5 Day 3 Scene Frames Rendered Successfully ---"
$audioFile = Join-Path $projectDir "assets\soundtrack.mp3"

$filterComplex = '[0:v][1:v]xfade=transition=fade:duration=0.8:offset=5.0[v01];[v01][2:v]xfade=transition=slideleft:duration=0.8:offset=10.0[v12];[v12][3:v]xfade=transition=circleopen:duration=0.8:offset=15.0[v23];[v23][4:v]xfade=transition=fade:duration=0.8:offset=20.0[vfinal];[5:a]afade=t=in:st=0:d=1,afade=t=out:st=23:d=3[afinal]'

$ffArgs = @(
    "-y",
    "-loop", "1", "-t", "5.8", "-i", $s1Path,
    "-loop", "1", "-t", "5.8", "-i", $s2Path,
    "-loop", "1", "-t", "5.8", "-i", $s3Path,
    "-loop", "1", "-t", "5.8", "-i", $s4Path,
    "-loop", "1", "-t", "7.0", "-i", $s5Path,
    "-ss", "0", "-t", "26.5", "-i", $audioFile,
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

Write-Output "Executing FFmpeg encoding for Day 3 Video..."
& $ffmpegPath $ffArgs

if (Test-Path $outputVideo) {
    $fileInfo = Get-Item $outputVideo
    $sizeMB = [Math]::Round(($fileInfo.Length / 1MB), 2)
    Write-Output "SUCCESS: Created Day 3 Video $outputVideo ($sizeMB MB)"

    $artifactDir = "C:\Users\sathi\.gemini\antigravity-ide\brain\a88dc9bd-5da1-429a-82b7-42ab12384759"
    Copy-Item $outputVideo (Join-Path $artifactDir "day3_offline_session.mp4") -Force
    Write-Output "Copied to current artifact directory for user review."
} else {
    Write-Error "Failed to generate Day 3 video output."
}
