# =====================================================
# NEXUS 프론트엔드 - 멀티 스테이지 Dockerfile
# Vue 3 + Vite + Tailwind CSS
# AWS ECS/ECR 배포 최적화 (ARM64/AMD64 호환)
# =====================================================

# -----------------------------------------------------
# 1단계: 빌드
# -----------------------------------------------------
FROM node:20 AS builder

WORKDIR /app

# 의존성 먼저 설치 (레이어 캐싱 최적화)
COPY package*.json ./
RUN npm ci --only=production=false

# 소스 복사 및 빌드
COPY . .

# 빌드 시 환경변수 설정
ARG VITE_API_URL=http://localhost:3000/api
ARG VITE_PYTHON_API_URL=http://localhost:8000/api
ARG VITE_WS_URL=ws://localhost:3000/ws

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_PYTHON_API_URL=$VITE_PYTHON_API_URL
ENV VITE_WS_URL=$VITE_WS_URL

# 프로덕션 빌드
RUN npm run build

# -----------------------------------------------------
# 2단계: 프로덕션 (Nginx)
# -----------------------------------------------------
FROM nginx:latest AS production

# 헬스체크용 curl 설치
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 정적 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 80 포트 노출
EXPOSE 80

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
