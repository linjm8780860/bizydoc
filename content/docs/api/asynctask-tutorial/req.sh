# Shell 示例代码 (注意加入了 X-Bizyair-Task-Async)
# 请确保已设置 BIZYAIR_API_KEY 环境变量，或者直接替换为您的 API Key
curl -s -X POST "https://api.bizyair.cn/w/v1/webapp/task/openapi/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${BIZYAIR_API_KEY}" \
  -H "X-Bizyair-Task-Async: enable" \
  -d '{
  "web_app_id": 38214,
  "suppress_preview_output": false,
  "input_values": {
    "84:CLIPTextEncode.text": "A hyper-realistic environmental portrait of a forest ranger standing deep within an ...",
    "88:KSampler.seed": 354884000907176,
    "81:EmptySD3LatentImage.width": 1280,
    "81:EmptySD3LatentImage.height": 1280
  }
}'
