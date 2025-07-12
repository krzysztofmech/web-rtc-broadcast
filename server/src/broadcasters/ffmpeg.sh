ffmpeg \
	-re \
	-v info \
	-stream_loop -1 \
	-i ""$(cd "$(dirname "$0")" && pwd)"/src/static/soback.mp3" \
	-map 0:a:0 \
	-acodec libopus -ab 128k -ac 2 -ar 48000 \
	-f rtp \
	"rtp://127.0.0.1:46794?rtcpport=44447"
