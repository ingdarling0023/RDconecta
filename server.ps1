$port = 8080
$path = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Prefixes.Add("http://127.0.0.1:$port/")
try {
    $listener.Start()
    Write-Host "Development server running at: http://localhost:$port/"
    Write-Host "Press Ctrl+C to stop."
} catch {
    Write-Host "Error starting server on port $port. It may be in use."
    exit 1
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $reqPath = $request.Url.LocalPath
        if ($reqPath -eq "/") {
            $reqPath = "/index.html"
        }
        
        # Prevent directory traversal
        $reqPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($path, $reqPath.TrimStart('/')))
        if (!$reqPath.StartsWith($path)) {
            $response.StatusCode = 403
            $response.Close()
            continue
        }

        if (Test-Path $reqPath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($reqPath)
            $response.ContentLength64 = $content.Length
            
            # Simple MIME types
            if ($reqPath -match "\.html$") { $response.ContentType = "text/html; charset=utf-8" }
            elseif ($reqPath -match "\.css$") { $response.ContentType = "text/css; charset=utf-8" }
            elseif ($reqPath -match "\.js$") { $response.ContentType = "application/javascript; charset=utf-8" }
            elseif ($reqPath -match "\.ico$") { $response.ContentType = "image/x-icon" }
            else { $response.ContentType = "application/octet-stream" }
            
            try {
                $response.OutputStream.Write($content, 0, $content.Length)
            } catch {
                # Ignore client disconnects
            }
        } else {
            $response.StatusCode = 404
            $errContent = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.ContentLength64 = $errContent.Length
            $response.OutputStream.Write($errContent, 0, $errContent.Length)
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
