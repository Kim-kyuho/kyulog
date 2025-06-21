# 1. Node.js가 설치된 공식 이미지 사용
FROM node:20-alpine

# 2. 컨테이너 안에서 작업할 디렉토리 설정
WORKDIR /app

# 3. package.json만 먼저 복사해서 의존성 설치
COPY package*.json ./
RUN npm install

# 4. 나머지 소스코드 복사
COPY . .

# 5. Next.js 개발 서버 실행
CMD ["npm", "run", "dev"]