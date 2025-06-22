# 1. Node.jsがインストールされた公式イメージを使用
FROM node:20-alpine

# 2. コンテナ内で作業するディレクトリを設定
WORKDIR /app

# 3. package.jsonを先にコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# 4. その他のソースコードをコピー
COPY . .

# 5. Next.jsの開発サーバーを実行
CMD ["npm", "run", "dev"]