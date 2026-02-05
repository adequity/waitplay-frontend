# 백엔드 오디오 업로드 엔드포인트 구현 가이드

## 현재 상황

프론트엔드에서 BGM(배경음악) 업로드 기능을 구현했으나, 백엔드에 오디오 파일 업로드 엔드포인트가 없어 405 Method Not Allowed 에러가 발생합니다.

### 에러 로그
```
POST /api/FileUpload/audio 405 (Method Not Allowed)
POST /api/FileUpload/file 405 (Method Not Allowed)
```

## 해결 방안

### 방안 1: 오디오 전용 엔드포인트 추가 (권장)

#### 엔드포인트 스펙
```
POST /api/FileUpload/audio
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}

Request Body:
- file: 오디오 파일 (multipart)

Response (200 OK):
{
  "success": true,
  "fileUrl": "https://storage.example.com/audio/filename.mp3",
  "fileName": "filename.mp3",
  "fileSize": 1234567
}

Response (400 Bad Request):
{
  "success": false,
  "message": "지원하지 않는 파일 형식입니다."
}
```

#### 허용 파일 형식
- `audio/mpeg` (MP3)
- `audio/mp3`
- `audio/wav`
- `audio/ogg`
- `audio/x-m4a`
- `audio/mp4` (M4A)

#### 파일 크기 제한
- 최대 10MB

#### C# ASP.NET Core 예제
```csharp
[HttpPost("audio")]
[Authorize]
public async Task<IActionResult> UploadAudio(IFormFile file)
{
    if (file == null || file.Length == 0)
        return BadRequest(new { success = false, message = "파일이 없습니다." });

    // 파일 크기 체크 (10MB)
    if (file.Length > 10 * 1024 * 1024)
        return BadRequest(new { success = false, message = "파일 크기는 10MB 이하만 가능합니다." });

    // MIME 타입 체크
    var allowedTypes = new[] {
        "audio/mpeg", "audio/mp3", "audio/wav",
        "audio/ogg", "audio/x-m4a", "audio/mp4"
    };

    if (!allowedTypes.Contains(file.ContentType.ToLower()))
        return BadRequest(new { success = false, message = "지원하지 않는 파일 형식입니다." });

    // 파일 확장자 체크
    var allowedExtensions = new[] { ".mp3", ".wav", ".ogg", ".m4a" };
    var extension = Path.GetExtension(file.FileName).ToLower();

    if (!allowedExtensions.Contains(extension))
        return BadRequest(new { success = false, message = "지원하지 않는 파일 확장자입니다." });

    try
    {
        // 고유 파일명 생성
        var fileName = $"{Guid.NewGuid()}{extension}";

        // 클라우드 스토리지 또는 로컬 저장소에 업로드
        var fileUrl = await _storageService.UploadAsync(file.OpenReadStream(), fileName, "audio");

        return Ok(new {
            success = true,
            fileUrl = fileUrl,
            fileName = file.FileName,
            fileSize = file.Length
        });
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Audio upload failed");
        return StatusCode(500, new { success = false, message = "파일 업로드에 실패했습니다." });
    }
}
```

---

### 방안 2: 기존 이미지 엔드포인트 확장

기존 `/api/FileUpload/image` 엔드포인트를 수정하여 오디오 파일도 처리할 수 있도록 확장합니다.

#### 수정 사항
```csharp
[HttpPost("image")]
[Authorize]
public async Task<IActionResult> UploadFile(IFormFile file)
{
    // 기존 이미지 타입
    var imageTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };

    // 오디오 타입 추가
    var audioTypes = new[] {
        "audio/mpeg", "audio/mp3", "audio/wav",
        "audio/ogg", "audio/x-m4a", "audio/mp4"
    };

    var allAllowedTypes = imageTypes.Concat(audioTypes).ToArray();

    if (!allAllowedTypes.Contains(file.ContentType.ToLower()))
        return BadRequest(new { success = false, message = "지원하지 않는 파일 형식입니다." });

    // 파일 타입에 따라 다른 폴더에 저장
    var folder = imageTypes.Contains(file.ContentType.ToLower()) ? "images" : "audio";

    // ... 나머지 업로드 로직
}
```

---

### 방안 3: 범용 파일 업로드 엔드포인트 추가

#### 엔드포인트 스펙
```
POST /api/FileUpload/file
Content-Type: multipart/form-data
Authorization: Bearer {accessToken}

Request Body:
- file: 파일 (multipart)
- type: 파일 타입 (optional, "image" | "audio" | "document")
```

#### C# 예제
```csharp
[HttpPost("file")]
[Authorize]
public async Task<IActionResult> UploadFile(IFormFile file, [FromQuery] string type = null)
{
    var allowedTypes = new Dictionary<string, string[]>
    {
        ["image"] = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" },
        ["audio"] = new[] { "audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/x-m4a", "audio/mp4" }
    };

    // 타입이 지정되지 않으면 Content-Type으로 자동 감지
    if (string.IsNullOrEmpty(type))
    {
        type = file.ContentType.StartsWith("image/") ? "image" :
               file.ContentType.StartsWith("audio/") ? "audio" : "other";
    }

    if (!allowedTypes.ContainsKey(type) || !allowedTypes[type].Contains(file.ContentType.ToLower()))
        return BadRequest(new { success = false, message = "지원하지 않는 파일 형식입니다." });

    // ... 업로드 로직
}
```

---

## 프론트엔드 현재 구현 상태

프론트엔드는 다음 순서로 엔드포인트를 시도합니다:
1. `/api/FileUpload/audio` (오디오 전용)
2. `/api/FileUpload/file` (범용)
3. `/api/FileUpload/image` (임시 폴백)

```typescript
const endpoints = [
  '/api/FileUpload/audio',
  '/api/FileUpload/file',
  '/api/FileUpload/image'
]

for (const endpoint of endpoints) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  })

  if (response.ok) {
    return (await response.json()).fileUrl
  }

  // 405, 400은 다음 엔드포인트 시도
  if (response.status === 405 || response.status === 400) continue
}
```

---

## 권장 구현 순서

1. **즉시**: 방안 2 (이미지 엔드포인트 확장) - 빠른 해결
2. **단기**: 방안 1 (오디오 전용 엔드포인트) - 깔끔한 분리
3. **장기**: 방안 3 (범용 파일 엔드포인트) - 확장성

## 보안 고려사항

1. **파일 검증**: Content-Type과 파일 헤더(magic bytes) 모두 검증
2. **파일명 새니타이징**: 업로드된 파일명 대신 UUID 사용
3. **크기 제한**: 오디오 10MB, 이미지 5MB 등 타입별 제한
4. **저장 경로**: 실행 불가능한 경로에 저장
5. **바이러스 스캔**: 가능하면 업로드 후 스캔
