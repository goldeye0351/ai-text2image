// worker.ts
//单一文件式, ai文字生成图片, cloudflare 中新建一worker, 把代码粘过去, 新增一变量, AI=ai目录//https://pichub.51xmi.com/file/744a0b0a2c98ef043b632.jpg
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta property="og:title" content="免费AI文字生成图片" />
    <meta property="og:image" content="https://51xmi.com/favicon.ico" />
    <link rel="icon" href="https://51xmi.com/favicon.ico">
    <title>免费AI Image Generator || 51xmi </title>
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
            }
            .aiimage{
              width: 380px;
              max-width: 380px;
              height: 380px;
              max-height: 380px;
            }
            .aiimage img {
              max-width: 100%;
              max-height: 100%;
            }
            .aibutton{
              width: 0px;
              height: 0px;
            }
        </style>
  </head>
  <body>

      <div class="container" style="text-align: center;" >
        <h2>免费AI Image Generator</h2>
        <input class="textinput" type="text" id="prompt" value="cat astronaut on Mars" />
        <hr>
        <button type="button" id="submit-button"  class="btn-wrapper" >AI生成</button>
        <hr>
        <div class="aiimage"  id="image-container" style="text-align: center;" ></div>

        <hr>
        <p>GitHub: <a style="color: springgreen;"  href="https://github.com/goldeye0351/ai-text2image">FREE AI TEXT2IMG </a></p>
        <p>51xMI: <a style="color: springgreen;"  href="https://51xmi.com">51xMI.com </a></p>
      </div>

    <script>
      const promptInput = document.getElementById("prompt");
      const submitButton = document.getElementById("submit-button");
      const imageContainer = document.getElementById("image-container");

      submitButton.addEventListener("click", async () => {
        const prompt = promptInput.value;

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

          const image = document.createElement("img");
          image.src = imageUrl;

          imageContainer.appendChild(image);
        } else {
          alert("Error generating image");
        }
      });
    </script>
  </body>
</html>
`;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    } else if (request.method === "POST") {
      try {
        const { pathname } = new URL(request.url);
        const content = pathname.substring(1) || (await request.json()).content;

        const inputs = {
          prompt: content,
        };

        const response = await env.AI.run(
          "@cf/stabilityai/stable-diffusion-xl-base-1.0",
          inputs
        );

        return new Response(response, {
          headers: {
            "content-type": "image/png",
            ...corsHeaders,
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
    } else {
      return new Response(htmlContent, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }
  },
};
