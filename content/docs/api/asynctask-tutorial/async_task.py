import time
import requests

API_KEY = "BIZYAIR_API_KEY" #从BizyAir官网获取的api-key
BASE_URL = "https://api.bizyair.cn/w/v1/webapp/task/openapi"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def create_task():
    url = f"{BASE_URL}/create"
    # 启用异步模式
    headers["X-Bizyair-Task-Async"] = "enable"

    payload = {
        "web_app_id": 38214,
        "input_values": {
            "84:CLIPTextEncode.text": "A hyper-realistic environmental portrait of a forest ranger standing deep within an ancient old-growth forest at early morning. The subject is framed from the waist up, surrounded by towering moss-covered trees with thick trunks and intricate bark textures rendered in extreme detail. Soft mist drifts between the trees, catching beams of golden sunrise light that filter through the dense canopy above. The ranger’s face shows natural skin texture, light freckles, and subtle lines shaped by years spent outdoors, with calm, observant eyes that reflect a deep connection to the wilderness. They wear a practical field jacket with visible fabric weave, weather stains, reinforced seams, and a slightly faded color from prolonged sun exposure. A leather strap from binoculars crosses their chest, showing creases, scratches, and age. Ferns, fallen leaves, and damp soil fill the foreground with rich micro-details, including dew droplets and tiny insects. Shot on an 85mm lens with shallow depth of field, sharp focus on facial features, natural color grading emphasizing greens and earth tones. The mood is serene, grounded, and respectful, portraying quiet guardianship and harmony between human presence and untouched nature.\n",
            "88:KSampler.seed": 354884000907176,
            "81:EmptySD3LatentImage.width": 1280,
            "81:EmptySD3LatentImage.height": 1280
        }
    }

    resp = requests.post(url, json=payload, headers=headers)
    
    response_data = resp.json()

    if isinstance(response_data, dict):
        # 成功情况
        request_id = response_data.get("requestId") or response_data.get("request_id")
        if not request_id:
             print(f"Error: No requestId in response: {response_data}")
        return request_id
    else:
        # 失败情况
        print(f"API Error: {response_data}")
        return None

def poll_status(request_id):
    url = f"{BASE_URL}/detail"
    # 查询状态不需要 Async Header
    if "X-Bizyair-Task-Async" in headers:
        del headers["X-Bizyair-Task-Async"]

    while True:
        resp = requests.get(url, params={"requestId": request_id}, headers=headers)
        print(resp.json())
        data = resp.json().get("data", {})
        status = data.get("status")

        print(f"当前状态: {status}")

        if status == "Success":
            return True
        elif status in ["Failed", "Canceled"]:
            print("任务失败或取消")
            return False

        time.sleep(2)  # 等待2秒后再次查询

def get_results(request_id):
    url = f"{BASE_URL}/outputs"
    resp = requests.get(url, params={"requestId": request_id}, headers=headers)
    outputs = resp.json().get("data", {}).get("outputs", [])

    for idx, out in enumerate(outputs):
        print(f"结果 {idx+1}: {out.get('object_url')}")

# 主流程
if __name__ == "__main__":
    req_id = create_task()
    if req_id:
        print(f"任务已提交，ID: {req_id}")
        if poll_status(req_id):
            get_results(req_id)