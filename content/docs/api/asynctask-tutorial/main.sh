# Shell 示例代码 (注意加入了 X-Bizyair-Task-Async)
# 请确保已设置 BIZYAIR_API_KEY 环境变量，或者直接替换为您的 API Key

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. 发起任务并捕获输出
response=$(bash "${SCRIPT_DIR}/req.sh")

# 2. 提取 requestId (兼容 Linux/Mac)
# 尝试使用 grep 和 sed 提取 JSON 中的 requestId
# 假设返回格式为 {"request_id":"..."} 或 {"requestId":"..."}
request_id=$(echo "$response" | grep -o '"request[^"]*":"[^"]*"' | sed 's/.*":"\([^"]*\)".*/\1/')

echo "任务提交成功，Request ID: $request_id"

if [ -z "$request_id" ]; then
    echo "错误: 未能提取到 Request ID。API 响应: $response"
    exit 1
fi

# 3. 轮询任务状态直到成功
echo "开始轮询任务状态..."

while true; do
    # 调用状态查询接口 (detail)
    detail_cmd=$(cat "${SCRIPT_DIR}/detail.sh" | sed "s/{requestId}/$request_id/" | sed 's/curl/curl -s/')
    detail_response=$(eval "$detail_cmd")
    
    # 使用 Python 提取状态 (确保能够正确解析 JSON)
    status=$(echo "$detail_response" | python3 -c "import sys, json; print(json.load(sys.stdin).get('data', {}).get('status', 'Unknown'))")
    
    echo "当前状态: $status"
    
    if [ "$status" = "Success" ]; then
        break
    elif [ "$status" = "Failed" ] || [ "$status" = "Canceled" ]; then
        echo "任务异常结束，最终状态: $status"
        echo "响应详情: $detail_response"
        exit 1
    fi
    
    # 等待 2 秒后重试
    sleep 2
done

echo "任务执行成功，正在获取结果..."

# 4. 获取最终结果 (outputs)
# 同样读取 outputs.sh 模板并替换执行
outputs_cmd=$(cat "${SCRIPT_DIR}/outputs.sh" | sed "s/{requestId}/$request_id/" | sed 's/curl/curl -s/')
eval "$outputs_cmd"
