#!/bin/bash
# start the webui from the frontend
# depends on: npm, git
cd "$(dirname $0)"
FRONTEND_DIR="./frontend"

# install if not exist
if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "Installing Frontend"
  git clone --depth 1 "https://github.com/parakeyt/parakeyt-frontend" "$FRONTEND_DIR"
  cd "$FRONTEND_DIR"
  # deps 1
  cd frontend
  npm install
  cd ..
  # deps 2
  cd backend
  npm install
  cd ..
else
  echo "Frontend Exists!"
  cd "$FRONTEND_DIR"
fi

# launch frontend+backend
echo "Starting Servers"
cd backend
nohup npm start | cat &
BPID=$?
cd ..

cd frontend
nohup npm start | cat &
FPID=$?
cd ..

# ctrl-c handler
quitall() {
  kill $FPID
  kill $BPID
  echo "byebye!"
}

trap quitall SIGINT SIGHUP SIGQUIT SIGABRT

echo "Press CTRL+C to exit!"
while true; do
  sleep 1
done
