# 使用官方Node.js作為基底映像
FROM node:18


# 創建工作目錄
WORKDIR /usr/src/app

# 複製package.json和package-lock.json到工作目錄
COPY package*.json ./

# 安裝應用的依賴項
RUN npm install

# 複製應用的其他檔案到工作目錄
COPY . .

# 指定容器中的應用執行時所監聽的端口
# （此步驟是可選的，因為Discord機器人可能不需要公開任何端口）
# EXPOSE 3000

# 創建SQLite數據庫的目錄
RUN mkdir -p /usr/src/app/data
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# 設定容器啟動時執行的命令
CMD [ "node", "index.js" ]