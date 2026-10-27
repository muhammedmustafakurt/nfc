# Şifre özeti üretir (uygulamanın kullandığı yöntemle: rastgele tuz + scrypt).
# Şifreyi siz yazarsınız (ekranda görünmez); betik özeti ve kullanım biçimlerini verir.
#
#   .\scripts\hash-password.ps1
#
# Gereksinim: Node.js (zaten projeyi çalıştırmak için kurulu).

$ErrorActionPreference = 'Stop'

function ConvertTo-PlainText([System.Security.SecureString]$Secure) {
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($Secure)
    try { [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr) }
    finally { [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Node.js bulunamadı. Node.js kurulu ve PATH içinde olmalı.'
}

$p1 = ConvertTo-PlainText (Read-Host 'Şifre' -AsSecureString)
$p2 = ConvertTo-PlainText (Read-Host 'Şifre (tekrar)' -AsSecureString)
if ($p1 -ne $p2) { throw 'Şifreler aynı değil.' }
if ($p1.Length -lt 8) { throw 'Şifre en az 8 karakter olmalı.' }

# Şifre komut satırına değil, yalnızca bu işlemin ortam değişkenine yazılır.
$env:NFC_PW = $p1
try {
    $js = "const c=require('crypto');const s=c.randomBytes(16).toString('hex');process.stdout.write(s+':'+c.scryptSync(process.env.NFC_PW,s,32).toString('hex'))"
    $out = & node -e $js
} finally {
    Remove-Item Env:NFC_PW -ErrorAction SilentlyContinue
    $p1 = $null; $p2 = $null
}
if ($LASTEXITCODE -ne 0 -or $out -notmatch '^[0-9a-f]{32}:[0-9a-f]{64}$') { throw 'Özet üretilemedi.' }

$salt, $hash = $out -split ':'
$now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

Write-Host ''
Write-Host '--- Ana admin için (.env.local ya da Vercel ortam değişkeni) ---' -ForegroundColor Cyan
Write-Host "ADMIN_PASSWORD_HASH=$salt`:$hash"
Write-Host ''
Write-Host '--- Ek yönetici için (Neon SQL Editor). KULLANICI_ADI yerine kullanıcı adını yazın, küçük harfle ---' -ForegroundColor Cyan
Write-Host "INSERT INTO admins (username, pass_hash, pass_salt, created_at) VALUES ('KULLANICI_ADI', '$hash', '$salt', $now);"
Write-Host ''
Write-Host '--- Var olan yöneticinin şifresini değiştirmek için ---' -ForegroundColor Cyan
Write-Host "UPDATE admins SET pass_hash = '$hash', pass_salt = '$salt' WHERE username = 'KULLANICI_ADI';"
Write-Host ''
