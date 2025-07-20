# Deployment Guide

이 문서는 `iohook-macos` 패키지의 GitHub과 npm 배포 과정을 설명합니다.

## 사전 준비사항

### GitHub 설정
1. GitHub 저장소 생성: `https://github.com/hwanyong/iohook-macos`
2. GitHub Actions가 활성화되어 있어야 함

### npm 설정
1. npm 계정: `uhd_kr`
2. npm 로그인 확인:
   ```bash
   npm whoami
   # uhd_kr 이 출력되어야 함
   ```

### GitHub Secrets 설정
1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. 다음 secrets 추가:
   - `NPM_TOKEN`: npm access token
     ```bash
     # npm 토큰 생성
     npm token create
     ```

## 배포 과정

### 1. 초기 설정 (한 번만)

```bash
# 저장소 복제 및 원격 저장소 설정
git remote add origin https://github.com/hwanyong/iohook-macos.git

# 초기 코드 푸시
git add .
git commit -m "Initial commit"
git push -u origin main
```

### 2. 릴리스 배포

#### Patch 릴리스 (0.1.0 → 0.1.1)
```bash
npm run release:patch
```

#### Minor 릴리스 (0.1.0 → 0.2.0)  
```bash
npm run release:minor
```

#### Major 릴리스 (0.1.0 → 1.0.0)
```bash
npm run release:major
```

### 3. 수동 배포

개발 단계에서 수동으로 배포하려면:

```bash
# 테스트 실행
npm test

# 버전 업데이트 (수동)
npm version patch  # 또는 minor, major

# npm 배포
npm publish

# GitHub 릴리스는 자동으로 생성됨 (Actions)
```

### 4. 배포 확인

#### npm 배포 확인
```bash
npm view iohook-macos
```

#### GitHub 릴리스 확인
https://github.com/hwanyong/iohook-macos/releases

## 배포 플로우 설명

### 자동 배포 (권장)
1. `npm run release:patch` (또는 minor, major) 실행
2. 자동으로 다음 작업 수행:
   - 테스트 실행 (`preversion`)
   - 버전 번호 업데이트
   - Git 태그 생성
   - Git 커밋 및 푸시 (`postversion`)
3. GitHub Actions가 태그를 감지하여:
   - CI 테스트 실행
   - npm 자동 배포
   - GitHub 릴리스 생성

### CI/CD 워크플로우
- **CI (Continuous Integration)**: 
  - 모든 push와 PR에 대해 테스트 실행
  - Node.js 16, 18, 20 매트릭스 테스트
  - macOS 환경에서만 실행

- **Release (Continuous Deployment)**:
  - `v*` 태그가 푸시될 때 자동 실행
  - npm 패키지 자동 배포
  - GitHub 릴리스 자동 생성

## 주의사항

### 바이너리 배포
- 네이티브 모듈은 `node-gyp-build`를 사용하여 플랫폼별 바이너리 제공
- `bin/darwin-arm64-118/` 디렉토리에 빌드된 바이너리 포함
- macOS에서만 사용 가능 (`"os": ["darwin"]`)

### 파일 포함/제외
- `.npmignore`로 개발 파일들 제외
- `package.json`의 `files` 필드로 배포 파일 명시적 지정

### 버전 관리
- [Semantic Versioning](https://semver.org/) 준수
- `CHANGELOG.md` 업데이트 필수
- 각 릴리스마다 적절한 태그 생성

## 문제 해결

### npm 배포 실패
```bash
# 권한 확인
npm whoami

# 토큰 재생성
npm token create

# GitHub Secrets 업데이트
```

### GitHub Actions 실패
- Actions 탭에서 로그 확인
- macOS runner에서 빌드 문제 확인
- 의존성 설치 문제 확인

### 테스트 실패
```bash
# 로컬에서 테스트 실행
npm test

# 권한 문제 (macOS Accessibility)
# System Preferences → Security & Privacy → Privacy → Accessibility
``` 