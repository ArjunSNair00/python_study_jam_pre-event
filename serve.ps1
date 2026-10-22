# Simple static web server for local presentation & video playback.
# Supports GET/HEAD, byte-range requests (for seeking MP4s), suffix ranges and
# no-cache headers so a refresh always picks up the latest build.
#
# Media elements change `src` and cancel in-flight range requests all the time.
# Those aborted writes used to surface in Chrome as net::ERR_INVALID_HTTP_RESPONSE
# (the response was cut off mid-body), so files are streamed in chunks and
# IgnoreWriteExceptions lets the listener drop writes to disconnected clients.
param(
    [int]$Port = 5500
)

$root = [System.IO.Path]::GetFullPath($PSScriptRoot)
$listener = New-Object System.Net.HttpListener
$listener.IgnoreWriteExceptions = $true
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Output "Server running at $prefix"
} catch {
    $Port = 5501
    $prefix = "http://localhost:$Port/"
    $listener = New-Object System.Net.HttpListener
    $listener.IgnoreWriteExceptions = $true
    $listener.Prefixes.Add($prefix)
    try {
        $listener.Start()
        Write-Output "Server running at $prefix"
    } catch {
        Write-Error "Could not start a server on port 5500 or 5501."
        exit 1
    }
}

$mimeTypes = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".webp" = "image/webp"
    ".mp3"  = "audio/mpeg"
    ".mp4"  = "video/mp4"
    ".webm" = "video/webm"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
    ".woff2" = "font/woff2"
}

$chunkSize = 64KB

while ($listener.IsListening) {
    $context = $null
    $stream = $null
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $method = $request.HttpMethod
        if ($method -ne "GET" -and $method -ne "HEAD") {
            $response.StatusCode = 405
            $response.AddHeader("Allow", "GET, HEAD")
            $response.Close()
            continue
        }

        $urlPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath).TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($urlPath)) {
            $urlPath = "index.html"
        }

        $filePath = [System.IO.Path]::GetFullPath((Join-Path $root $urlPath))
        if (-not $filePath.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        if (-not (Test-Path $filePath -PathType Leaf)) {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("File Not Found")
            $response.ContentType = "text/plain; charset=utf-8"
            $response.ContentLength64 = $errBytes.Length
            if ($method -eq "GET") {
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            }
            $response.Close()
            continue
        }

        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { "application/octet-stream" }

        $response.ContentType = $mime
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Cache-Control", "no-store, must-revalidate")
        $response.AddHeader("Accept-Ranges", "bytes")

        $stream = [System.IO.File]::Open($filePath, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::ReadWrite)
        $total = $stream.Length
        $start = 0
        $end = $total - 1
        $partial = $false

        $rangeHeader = $request.Headers["Range"]
        if ($rangeHeader -and $total -gt 0 -and $rangeHeader -match 'bytes=(\d*)-(\d*)') {
            $rangeStart = $matches[1]
            $rangeEnd = $matches[2]

            if ([string]::IsNullOrWhiteSpace($rangeStart)) {
                # Suffix range: bytes=-500 means the last 500 bytes.
                if (-not [string]::IsNullOrWhiteSpace($rangeEnd)) {
                    $suffix = [int64]$rangeEnd
                    if ($suffix -gt 0) {
                        $start = [Math]::Max(0, $total - $suffix)
                    }
                }
            } else {
                $start = [int64]$rangeStart
                if (-not [string]::IsNullOrWhiteSpace($rangeEnd)) {
                    $end = [int64]$rangeEnd
                }
            }

            if ($start -lt 0) { $start = 0 }
            if ($end -ge $total) { $end = $total - 1 }
            if ($start -gt $end -or $start -ge $total) {
                $response.StatusCode = 416
                $response.AddHeader("Content-Range", "bytes */$total")
                $response.Close()
                continue
            }

            $partial = $true
            $response.StatusCode = 206
            $response.AddHeader("Content-Range", "bytes $start-$end/$total")
        }

        $length = $end - $start + 1
        $response.ContentLength64 = $length

        if ($method -eq "GET" -and $length -gt 0) {
            $stream.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
            $out = $response.OutputStream
            $buffer = New-Object byte[] $chunkSize
            $remaining = $length
            while ($remaining -gt 0) {
                $toRead = [int][Math]::Min($chunkSize, $remaining)
                $read = $stream.Read($buffer, 0, $toRead)
                if ($read -le 0) { break }
                $out.Write($buffer, 0, $read)
                $remaining -= $read
            }
            $out.Flush()
        }

        $response.Close()
    } catch {
        # Client disconnects and aborted range requests are expected; keep serving.
        if ($context) {
            try { $context.Response.Close() } catch { }
        }
    } finally {
        if ($stream) {
            try { $stream.Dispose() } catch { }
        }
    }
}
