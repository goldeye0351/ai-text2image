//Text2pic/index.js 
//单一文件式, ai文字生成图片, cloudflare 中新建一worker, 把代码粘过去, 新增一变量, AI=ai目录//https://pichub.51xmi.com/file/744a0b0a2c98ef043b632.jpg
// 调整样式, 增加d1绑定,增加R2绑定, 直接把生成的图片存到R2或电报 和 d1数据库. R2,AI,myd1,myd1
//增加api get 获取 所有生成的数据
//增加提示词优化功能  2024.7.21  //https://img.buxiantang.top

var corsHeaders = {
  "Access-Control-Allow-Origin": "*",//这里会限制哪些域名能访问
  "Access-Control-Allow-Methods": "POST, OPTIONS,GET",
  "Access-Control-Allow-Headers": "Content-Type"
};
var htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:title" content="\u514D\u8D39AI\u6587\u5B57\u751F\u6210\u56FE\u7247" />
    <meta property="og:image" content="https://51xmi.com/favicon.ico" />
    <link rel="icon" href="https://51xmi.com/favicon.ico">
    <title>\u514D\u8D39AI Image Generator || 51xmi </title>
    <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #000000;
                color:white;
            }

            .container {
              max-width: 380px;
              background-color: #111111;    
              margin: 100px auto;
              padding: 50px;
              border-radius: 30px;
              box-shadow: 0 0 15px rgb(0, 255, 0);  
            }

            .btn-wrapper {
                margin-top: 10px;
                margin-bottom: 10px;
                position: relative;                
                overflow: hidden;
                display: inline-block;
                background-color: #007BFF;
                color: #FFF;
                border-radius: 10px;
                padding: 10px 25px;
                cursor: pointer;
                transition: background-color 0.3s;
            }

            .btn-wrapper:hover {
                background-color: #0056b3;
            }
            .textinput{
                width: 300px;
                height: 50px;
                border-radius: 10px;
                background-color: #181818;
                color: springgreen;
            }
            .aiimage{
              width: 380px;
              max-width: 380px;
            }
            .aiimage img {
              max-width: 100%;
              max-height: 100%;
            }
            .aibutton{
              width: 0px;
              height: 0px;
            }
            .progress-bar {
              width: 380px;
              max-width: 380px;
              height: 380px;
              max-height: 380px;
              border-radius: 5px;
              overflow: hidden;
            }


        </style>
  </head>
  <body>

      <div class="container" style="text-align: center;" >
        <h2>\u514D\u8D39AI Image Generator</h2>
        <input class="textinput" type="text" id="prompt" value="cat astronaut on Mars" rows="3" />

        <button type="button" id="optimize-prompt-button" class="btn-wrapper" title="建议使用提示词优化功能，中英文均可！" data-umami-event="t2p提示词优化">提示词优化</button>
        <button type="button" id="submit-button"  class="btn-wrapper" title="使用的是sd文生图模型！" data-umami-event="t2p生成图片">AI生成图片</button>


        <div class="aiimage"  id="image-container" style="text-align: center;" >
          <div class="progress-bar" style="display: none;">
            <img src="https://pichub.51xmi.com/file/00f4a925c08532773723c.gif">
          </div>
        </div>
        <hr>
        <p> 往期查看: <a style="color: springgreen;"  href="https://51xmi.com/tools/t2p" data-umami-event="t2p往期查看">https://51xmi.com/tools/t2p </a>  </p>
        <p> GitHub: <a style="color: springgreen;"  href="https://github.com/goldeye0351/ai-text2image">FREE AI TEXT2IMG </a> </p>
        <p>51xMI: <a style="color: springgreen;"  href="https://51xmi.com">51xMI.com </a></p>
      </div>



    <script>
      const promptInput = document.getElementById("prompt");
      const submitButton = document.getElementById("submit-button");
      const imageContainer = document.getElementById("image-container");
      const progressBar = document.querySelector(".progress-bar");
      const progressBarInner = progressBar.querySelector(".progress-bar-inner");
      const optimizePromptButton = document.getElementById("optimize-prompt-button");

      optimizePromptButton.addEventListener("click", async () => {
        const prompt = promptInput.value;
        promptInput.value = "正在优化提示词，请稍等...Optimizing prompt, please wait...プロンプトを最適化しています。少々お待ちください...";
        const optimizedPrompt = await optimizePromptAI(prompt);
      });

      async function optimizePromptAI(content) {
        const promptTemplate = "您是一位专业的提示词工程师,负责优化用户输入的绘画提示词。您的任务是根据输入的绘画提示词创建一个详细的Stable Diffusion绘图提示词,包括具体的绘画风格、主题、色彩要求、画质、其他细节,并按照以下格式的英文语言输出:Prompt: [风格][主题][色彩][其他细节]...。Negative Prompt: [残缺的][畸形的]...举个例子：我输入的绘画提示词为：“一个长发蓝色眼睛的女孩”，你创建的Stable Diffusion绘图提示词为：“Prompt: Long-haired girl with blue eyes, beautiful detailed eyes and lips, flowing blonde hair, serene expression, standing in a field of wildflowers. (best quality,4k,8k,highres,masterpiece:1.2), ultra-detailed, (realistic,photorealistic,photo-realistic:1.37), HDR, UHD, studio lighting, physically-based rendering, extreme detail description, professional, vivid colors, bokeh, portraits, impressionist painting style, warm color temperature, soft natural light.Negative Prompt: nsfw, (low quality,normal quality,worst quality,jpeg artifacts), cropped, monochrome, lowres, low saturation, watermark, white letters, skin spots, acnes, skin blemishes, age spot, mutated hands, mutated fingers, deformed, bad anatomy, disfigured, poorly drawn face, extra limb, ugly, poorly drawn hands, missing limb, floating limbs, disconnected limbs, out of focus, long neck, long body, extra fingers, fewer fingers, multi nipples, bad hands, signature, username, bad feet, blurry, bad body.”请你直接输出创建的Stable Diffusion绘图提示词，不要包含其他内容。我的绘画提示词为：";
        const prompt = \`\${promptTemplate}"\${content}"\`;
        try {
          const response = await fetch("/aitext", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: prompt }),
          });

          if (response.ok) {
            const result = await response.json();
            promptInput.value = result.response;
            return result.response;
          } else {
            throw new Error("Error optimizing prompt");
          }
        } catch (error) {
          console.error("Optimization error:", error);
          promptInput.value = "无法优化提示词，请重试。";
          return null;
        }
      }

      submitButton.addEventListener("click", async () => {
        const prompt = promptInput.value;
        progressBar.style.display = "block";

        const requestBody = {
          content: prompt,
        };

        const response = await fetch("/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const imageBlob = await response.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          //const data = await response.json();
          //const imageUrl = data.response;

          const image = document.createElement("img");
          image.src = imageUrl;

          //imageContainer.appendChild(image);
          // Insert the new image after the second child of the image container
          imageContainer.insertBefore(image, imageContainer.children[1]);
          

          progressBar.style.display = "none";
        } else {
          alert("Error generating image");
        }
      });
    <\/script>
    <script defer src="https://umami.51xmi.com/script.js" data-website-id="6a873ef2-259b-4e69-a63c-1306d6695bd2">
    <\/script>
  </body>
</html>
`;
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);  
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS,GET",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    } 
    else if (request.method === "POST"  && url.pathname === "/aitext") {
      try {

        const { content } = await request.json();
        const inputs = {prompt: content};
        const response = await env.AI.run("@hf/meta-llama/meta-llama-3-8b-instruct",inputs);
        return new Response(JSON.stringify(response), { headers: { "Content-Type": "application/json",...corsHeaders, }});
     
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
    } 
    else if (request.method === "POST") {
      try {
        const { pathname } = new URL(request.url);
        const content = pathname.substring(1) || (await request.json()).content;
        const inputs = {prompt: content};        

        //const response = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", inputs);
        const response = await env.AI.run("@cf/bytedance/stable-diffusion-xl-lightning",inputs);

        const responseObject = new Response(response, { headers: { 'content-type': 'image/png', ...corsHeaders}});
        const responseCopy = responseObject.clone();
        const fileData = await responseCopy.arrayBuffer();
        const file = new Blob([fileData], { type: 'image/png' });
        //下面这五行是电报图床
        const formData = new FormData();
        formData.append('file', file);
        const telegraPhResponse = await fetch('https://telegra.ph/upload', { method: 'POST', body: formData, });
        const telegraPhData = await telegraPhResponse.json();
        const imageUrl = "https://pichub.51xmi.com"+telegraPhData[0].src;   
        //下面这三行是R2图床
        //const fileName =`${content}/${Date.now()}.png`;//这几行是R2图床
        //const fileHandle = await env.R2.put(fileName, file);
        //const imageUrl = `https://r2.51xmi.com/${fileName}`;
        //下面一行是把存入D1数据库
        await env.myd1.prepare(`INSERT INTO myd1 (url, pmt, c_time) VALUES (?1, ?2, ?3)`).bind(imageUrl, content, Date.now()).run();
        return responseObject
        //return new Response(JSON.stringify({ response: imageUrl }), {headers: {'Content-Type': 'application/json'}});
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }
    } 
    else if (request.method.toLowerCase() === "get" && url.pathname === "/api") {      
      const result = await env.myd1.prepare("select id, url, pmt, c_time from myd1 ORDER BY id DESC").all();
      if (result?.success && result.results) {
        return new Response(JSON.stringify({
          data: result.results
        }), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            ...corsHeaders
          }
        });
      } else {
        return new Response(JSON.stringify({
          data: "fail"
        }), {
          headers: {
            "content-type": "application/json;charset=UTF-8",
            ...corsHeaders
          }
        });
      }
    }  
    else {
      return new Response(htmlContent, {
        headers: {
          "Content-Type": "text/html"
        }
      });
    }
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
