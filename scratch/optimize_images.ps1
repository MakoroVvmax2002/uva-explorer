Add-Type -AssemblyName System.Drawing

$dir = "d:\uva-explorer\client\public\images\places"
$files = Get-ChildItem -Path $dir -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png)$" }

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 78L)

$maxWidth = 1600
$maxHeight = 1200

$count = 0
$savedBytes = 0

foreach ($file in $files) {
    try {
        $origSize = $file.Length
        if ($origSize -lt 300000) { continue } # Skip already small files (< 300KB)

        $img = [System.Drawing.Image]::FromFile($file.FullName)
        $width = $img.Width
        $height = $img.Height

        if ($width -gt $maxWidth -or $height -gt $maxHeight) {
            $ratioX = $maxWidth / $width
            $ratioY = $maxHeight / $height
            $ratio = [Math]::Min($ratioX, $ratioY)

            $newWidth = [int]($width * $ratio)
            $newHeight = [int]($height * $ratio)
        } else {
            $newWidth = $width
            $newHeight = $height
        }

        $canvas = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $graph = [System.Drawing.Graphics]::FromImage($canvas)
        $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)

        $img.Dispose()
        $graph.Dispose()

        $tempPath = $file.FullName + ".tmp.jpg"
        $canvas.Save($tempPath, $jpegEncoder, $encoderParams)
        $canvas.Dispose()

        $newSize = (Get-Item $tempPath).Length
        if ($newSize -lt $origSize) {
            Remove-Item $file.FullName -Force
            Move-Item $tempPath $file.FullName -Force
            $count++
            $savedBytes += ($origSize - $newSize)
            Write-Host "Optimized $($file.Name): $([math]::Round($origSize/1MB, 2))MB -> $([math]::Round($newSize/1KB, 0))KB"
        } else {
            Remove-Item $tempPath -Force
        }
    } catch {
        Write-Host "Failed to optimize $($file.Name): $_"
    }
}

$savedMB = [math]::Round($savedBytes / 1MB, 2)
Write-Host "Done! Successfully compressed $count images. Total space saved: $savedMB MB"
