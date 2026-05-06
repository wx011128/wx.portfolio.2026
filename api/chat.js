/* global console, fetch, process, setTimeout, TextDecoder */

const portfolioInstructions = `
你是危箫本人在个人作品集网站右侧的数字分身。请用第一人称“我”回答访客问题，语气自然、专业、真诚。

已知网站信息：
- 我是危箫，UX Designer，京都艺术大学交互设计硕士在读，预计 2027 年 3 月毕业。
- 我的生日是 2001.11.28。
- 我的联系方式是电话 13343444202，邮箱 13343444202@163.com。
- 我的核心能力包括：用户研究需求分析、多平台产品设计、AI 视觉生成设计、产品信息架构设计、高保真原型设计、AI 设计流程构建、用户体验交互设计、产品技术落地、AI 辅助设计提效、设计系统规范搭建、多部门协同工作、Vibe Coding。
- 我的实习经历：2022 年 6 月，东风汽车悦享交通部门人机交互设计师实习生，参与无人驾驶公交车相关产品设计，包括小程序、车辆控制台和运营调度后台系统。
- 我的项目 01：松屋银座用户体验设计。项目为腾讯微信小程序解决方案挑战赛日本赛区 32 强项目，由包括我在内的四人团队共同完成。作为唯一入围的学生团队，我们以提升赴日游客在松屋银座的购物体验为目标，提出结合数字化服务与线下体验的用户体验设计方案。我主要负责整体用户体验设计与视觉设计，包括小程序信息架构与界面设计、用户交互流程梳理、引流小游戏设计，以及基于团队智能机器人能力构建 AI 驱动的视觉表达体系。
- 我的项目 02：悦享智行多平台体验设计。项目围绕无人驾驶接驳场景，构建覆盖用户端小程序、车载控制端与后台调度端的多平台出行服务系统。我作为人机交互设计实习生主要负责用户端核心流程设计，并参与控制端与调度端体验优化。
- 我的 AI 项目目前详情页尚未开放。
- 我的交互艺术装置日本方向作品集收录三个以多感官交互为核心的探索性作品，涵盖嗅觉装置、社交行为重构及无障碍体验设计，均由我独立完成，覆盖用户研究、体验建模、原型落地、装置结构设计与技术实现。

回答规则：
- 优先回答作品集、项目、经历、能力和联系方式相关问题。
- 如果用户问到网站没有提供的事实，不要编造；请只回复“我没有理解你的问题，你是否想问：”，推荐问题会由界面按钮提供。
- 回答尽量控制在 2 到 5 句话，需要列表时使用短列表。
- 不要用“危箫他/她”这类第三人称称呼我。
`.trim();

const allowedRoles = new Set(['assistant', 'user']);

const localAnswers = [
  {
    questions: ['你擅长什么？'],
    keywords: ['擅长', '能力', '技能', '会什么', '优势', '强项', 'skill'],
    answer:
      '我主要擅长用户研究需求分析、多平台产品设计、信息架构、高保真原型、交互体验设计和设计系统搭建。我也会持续使用 AI 工具优化设计流程，具备 AI 视觉生成、AI 辅助设计提效和 Vibe Coding 参与产品落地的能力。',
  },
  {
    questions: ['介绍一下松屋银座项目'],
    keywords: ['松屋', '银座', 'matsuya', 'ginza', '项目01', '项目 01', '项目一', '松屋银座用户体验'],
    answer:
      '我的松屋银座用户体验设计项目，是腾讯微信小程序解决方案挑战赛日本赛区 32 强项目，由包括我在内的四人团队共同完成。作为唯一入围的学生团队，我们以提升赴日游客在松屋银座的购物体验为目标，提出了一套结合数字化服务与线下体验的用户体验设计方案。这个项目探索了从线上入口到线下服务的完整体验链路。',
  },
  {
    questions: ['你在松屋银座项目负责什么？'],
    keywords: [
      '我在松屋银座项目负责',
      '松屋银座项目负责',
      '松屋银座职责',
      '松屋职责',
      '银座职责',
      '松屋负责',
      '银座负责',
      '松屋ai',
      '银座ai',
      '视觉表达体系',
      '引流小游戏',
    ],
    answer:
      '在松屋银座项目中，我主要负责整体用户体验设计与视觉设计，包括小程序的信息架构与界面设计、用户交互流程梳理，以及提升用户参与度的引流小游戏设计。同时我基于团队已有的智能机器人能力，构建了一套 AI 驱动的视觉表达体系，并应用在界面、品牌传播和线下场景中，让整体体验更一致、更有识别度。',
  },
  {
    questions: ['松屋银座项目有什么成果？'],
    keywords: ['松屋成果', '银座成果', '松屋比赛', '银座比赛', '唯一入围', '学生团队', '32强', '日本赛区'],
    answer:
      '松屋银座项目进入了腾讯微信小程序解决方案挑战赛日本赛区 32 强，我们也是唯一入围的学生团队。对我来说，这个项目的重要性在于它不是单一界面设计，而是把 AI 视觉系统、交互设计、小游戏引流、小程序服务和线下机器人体验串成了一条完整的用户体验链路。',
  },
  {
    questions: ['怎么联系你？'],
    keywords: ['联系', '电话', '邮箱', '邮件', '手机号', 'contact', 'email'],
    answer: '你可以通过电话 13343444202 或邮箱 13343444202@163.com 联系我。',
  },
  {
    questions: ['你什么时候毕业？'],
    keywords: ['学校', '学历', '京都', '毕业', '硕士', '大学', '研究生', '教育'],
    answer: '我目前是京都艺术大学交互设计硕士在读，预计 2027 年 3 月毕业。我的学习方向和作品集都围绕交互设计、用户体验和 AI 辅助设计展开。',
  },
  {
    questions: ['你有什么实习经历？'],
    keywords: ['实习', '东风', '悦享', '无人驾驶', '公交车', '工作经历', '经历'],
    answer:
      '我曾在东风汽车悦享交通部门担任人机交互设计师实习生，参与无人驾驶接驳场景相关产品设计。我的工作重点是用户端核心流程设计，同时参与车载控制端与后台调度端的体验优化，通过统一信息结构与交互逻辑，提升多端协作效率和体验一致性。',
  },
  {
    questions: ['介绍一下悦享智行项目'],
    keywords: ['介绍一下悦享智行', '悦享智行项目', '悦享智行', '项目02', '项目 02', '项目二', '多平台', '调度后台', '车辆控制台'],
    answer:
      '我的悦享智行多平台体验设计围绕无人驾驶接驳场景，构建了一套覆盖用户端小程序、车载控制端与后台调度端的多平台出行服务系统。项目通过梳理完整服务链路，打通用户乘车、车辆执行、后台调度之间的信息流与操作流，实现多端协同联动。',
  },
  {
    questions: ['你在悦享智行项目里负责什么？'],
    keywords: ['悦享负责', '智行负责', '用户端核心流程', '多端协同', '信息流', '操作流', '接驳场景'],
    answer:
      '在悦享智行项目中，我作为人机交互设计实习生，主要负责用户端核心流程设计，并参与控制端与调度端的体验优化。我的设计重点是把用户乘车、车辆执行、后台调度的信息流和操作流统一起来，让不同端之间的协作更清晰、更高效。',
  },
  {
    questions: ['你的 AI 项目是什么？'],
    keywords: ['ai项目', '项目03', '项目 03', '项目三', '人工智能项目'],
    answer: '我的 AI 项目目前详情页还没有开放，所以网站里暂时没有展示完整内容。等内容完善后，它会补充我在 AI 工具、设计流程和生成式视觉方向上的探索。',
  },
  {
    questions: ['作品集中包含什么项目？'],
    keywords: ['作品集中包含', '作品集包含', '作品集有哪些', '作品集有什么', '包含什么项目', '有哪些项目', '什么项目'],
    answer:
      '我的作品集目前主要包含松屋银座用户体验设计、悦享智行多平台体验设计、AI 方向探索，以及交互艺术装置日本方向作品集。它们分别覆盖商业体验设计、多端出行服务系统、AI 辅助设计探索和多感官交互装置实践。',
  },
  {
    questions: ['日本作品集是什么？'],
    keywords: ['日本作品集', '项目04', '项目 04', '项目四', '日本', '交互艺术装置', '多感官'],
    answer:
      '我的交互艺术装置日本方向作品集收录了三个以多感官交互为核心的探索性作品，涵盖嗅觉装置、社交行为重构及无障碍体验设计。作品从用户感知与行为出发，把气味、触觉与声音等非视觉信息转化为可交互体验，并通过实体装置与界面设计结合，构建完整交互流程。',
  },
  {
    questions: ['交互艺术装置作品集你负责什么？'],
    keywords: ['嗅觉装置', '社交行为', '无障碍', '气味', '触觉', '声音', '实体装置', '结构设计', '硬件', '编程'],
    answer:
      '日本方向作品集里的三个作品均由我独立完成，覆盖从用户研究、体验建模到原型落地的完整设计流程。除了交互与界面设计，我还负责装置结构设计与技术实现，通过编程和硬件搭建，把设计方案转化为可运行的交互体验。',
  },
  {
    questions: ['介绍一下你自己'],
    keywords: ['你是谁', '你自己', '介绍自己', '介绍一下你自己', '自我介绍', '个人背景', '关于你', 'about', '本人'],
    answer:
      '我是危箫，一名 UX Designer，目前在京都艺术大学读交互设计硕士。我关注的不只是界面视觉，也包括用户需求、产品结构、交互体验和设计落地，同时我也在探索 AI 工具如何提升设计效率。',
  },
  {
    questions: ['你的设计理念是什么？'],
    keywords: ['设计理念', '怎么看', 'ux', '用户体验', '关注点', '设计方法', '方法论'],
    answer:
      '我的设计理念是让设计真正推动产品落地，而不只是停留在界面层。我会关注用户需求、信息结构、使用场景和技术实现之间的关系，也希望通过 AI 与 Vibe Coding 让设计更快进入可验证的产品状态。',
  },
  {
    questions: ['你会哪些工具和 AI 技能？'],
    keywords: ['工具', '软件', 'figma', 'photoshop', 'illustrator', 'openai', 'claude', 'cursor', 'codex', 'ai工具'],
    answer:
      '我常用的工具包括 Photoshop、Illustrator、Figma，也会使用 OpenAI、Codex、Claude、Cursor、Kimi、Gemini、即梦、ComfyUI 等 AI 或开发辅助工具。我更看重的是把工具整合进设计流程，用它们提升调研、生成、原型和落地效率。',
  },
  {
    questions: ['你为什么学习 AI？'],
    keywords: ['为什么学习ai', 'ai帮助', 'ai设计', '生成式', 'ai流程', 'ai辅助', '提效'],
    answer:
      '我学习 AI 是因为它正在改变设计的工作方式。对我来说，AI 不只是生成图片的工具，也可以帮助我进行灵感探索、流程搭建、原型验证和代码实现，让设计师更深入地参与产品从概念到落地的过程。',
  },
  {
    questions: ['你的比赛经历是什么？'],
    keywords: ['比赛', '挑战赛', '获奖', '成果', '32强', '腾讯', '赛区'],
    answer:
      '我参与的松屋银座项目进入了腾讯微信小程序解决方案挑战赛日本赛区 32 强。这个项目后来也在腾讯的介绍下与松屋银座展开后续合作，对我来说是一次从设计方案走向真实商业场景的经历。',
  },
  {
    questions: ['你的基本信息是什么？'],
    keywords: ['生日', '出生', '年龄', '基本信息'],
    answer: '我的生日是 2001 年 11 月 28 日。目前我在京都艺术大学读交互设计硕士，方向主要围绕 UX 设计、AI 辅助设计和产品落地。',
  },
  {
    questions: ['你未来规划是什么？'],
    keywords: ['未来', '规划', '目标', '毕业预定', '职业', '想成为'],
    answer:
      '我预计 2027 年 3 月从京都艺术大学毕业。未来我希望成为一名能把审美、用户洞察、AI 工具和产品实现结合起来的 UX 设计师，而不是只停留在静态界面输出上。',
  },
];

function parseMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((message) => message && allowedRoles.has(message.role) && typeof message.content === 'string')
    .map((message) => ({
      content: message.content.slice(0, 1200),
      role: message.role,
    }))
    .slice(-8);
}

function sendJson(response, status, payload) {
  response.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload));
}

function getLocalAnswer(question) {
  const normalizedQuestion = question.toLowerCase();
  const matchedAnswer = localAnswers
    .map((item) => ({
      ...item,
      score: item.keywords.reduce((score, keyword) => (
        normalizedQuestion.includes(keyword.toLowerCase()) ? score + keyword.length : score
      ), 0),
    }))
    .sort((first, second) => second.score - first.score)[0];

  if (matchedAnswer?.score > 0) {
    return matchedAnswer.answer;
  }

  return '我没有理解你的问题，你是否想问：';
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function streamText(response, text) {
  response.status(200);
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('X-Accel-Buffering', 'no');
  response.flushHeaders?.();

  const initialDelay = Math.min(1200, Math.max(620, text.length * 4));
  await wait(initialDelay);

  for (let index = 0; index < text.length; index += 3) {
    response.write(text.slice(index, index + 3));
    await wait(index % 18 === 0 ? 42 : 22);
  }

  response.end();
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    sendJson(response, 405, { error: 'Method not allowed' });
    return;
  }

  const messages = parseMessages(request.body?.messages);
  const latestUserMessage = messages.findLast((message) => message.role === 'user');

  if (!latestUserMessage?.content.trim()) {
    sendJson(response, 400, { error: 'Missing user message' });
    return;
  }

  if (!process.env.OPENAI_API_KEY) {
    await streamText(response, getLocalAnswer(latestUserMessage.content));
    return;
  }

  const openaiResponse = await fetch('https://api.openai.com/v1/responses', {
    body: JSON.stringify({
      input: messages,
      instructions: portfolioInstructions,
      max_output_tokens: 700,
      model: process.env.OPENAI_MODEL || 'gpt-5.4-mini',
      stream: true,
    }),
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!openaiResponse.ok || !openaiResponse.body) {
    const errorText = await openaiResponse.text().catch(() => '');
    sendJson(response, openaiResponse.status || 502, {
      error: 'OpenAI request failed',
      detail: errorText.slice(0, 500),
    });
    return;
  }

  response.status(200);
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.setHeader('X-Accel-Buffering', 'no');
  response.flushHeaders?.();

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    for await (const chunk of openaiResponse.body) {
      buffer += decoder.decode(chunk, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) {
          continue;
        }

        const data = line.slice(6).trim();

        if (!data || data === '[DONE]') {
          continue;
        }

        const event = JSON.parse(data);

        if (event.type === 'response.output_text.delta' && typeof event.delta === 'string') {
          response.write(event.delta);
        }

        if (event.type === 'response.refusal.delta' && typeof event.delta === 'string') {
          response.write(event.delta);
        }
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    response.end();
  }
}
