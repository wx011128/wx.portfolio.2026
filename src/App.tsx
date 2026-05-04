import { Cake, ChevronLeft, Mail, Phone, School } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type View = 'home' | 'inside' | 'project-01' | 'project-02' | 'project-03' | 'project-04';
type InsidePage = 'about' | 'contents';
type AppHistoryState = {
  portfolioSite?: true;
  portfolioDepth?: number;
};

type Project = {
  id: View;
  label: string;
  title: string;
  image?: string;
  contentsImage?: string;
  pages?: string[];
  pageAspectRatio?: string;
  pageAspectRatios?: string[];
  pageImageHeight?: number;
  pageImageHeights?: number[];
  pageImageWidth?: number;
  pageImageWidths?: number[];
  isReady: boolean;
};

const createProjectPages = (projectId: string, length: number) => Array.from({ length }, (_, index) => {
  const page = String(index + 1).padStart(2, '0');

  return `/assets/${projectId}/pages/page-${page}.webp`;
});

const project01Pages = createProjectPages('project-01', 15);
const project02Pages = createProjectPages('project-02', 13);
const project04Pages = createProjectPages('project-04', 31);

const projects: Project[] = [
  {
    id: 'project-01',
    label: '01',
    title: '松屋银座体验设计',
    image: '/assets/project-01/cover.png',
    contentsImage: '/assets/contents/cards/project-01.png',
    pages: project01Pages,
    isReady: true,
  },
  {
    id: 'project-02',
    label: '02',
    title: '悦享智行多平台设计',
    image: '/assets/project-02/cover.png',
    contentsImage: '/assets/contents/cards/project-02.png',
    pages: project02Pages,
    isReady: true,
  },
  {
    id: 'project-03',
    label: '03',
    title: 'AI项目',
    isReady: false,
  },
  {
    id: 'project-04',
    label: '04',
    title: '日本作品集',
    image: '/assets/project-04/cover.png',
    contentsImage: '/assets/contents/cards/project-04.png',
    pages: project04Pages,
    pageAspectRatio: '3840 / 1382',
    pageAspectRatios: ['16 / 9'],
    pageImageHeight: 1382,
    pageImageHeights: [2160],
    pageImageWidth: 3840,
    isReady: true,
  },
];

const toolLogos = [
  { file: 'photoshop.png', variant: 'image-fill' },
  { file: 'illustrator.png', variant: 'image-fill' },
  { file: 'figma-color.png', variant: 'dark figma' },
  { file: 'gemini-color.png', variant: 'dark gemini' },
  { file: 'jimeng-color.png', variant: 'dark jimeng' },
  { file: 'kimi-color.png', variant: 'dark kimi' },
  { file: 'openai.png', variant: 'light openai' },
  { file: 'codex-color.png', variant: 'light codex' },
  { file: 'claude-color.png', variant: 'light claude' },
  { file: 'cursor.png', variant: 'light cursor' },
  { file: 'trae-color.png', variant: 'dark trae' },
  { file: 'comfyui-color.png', variant: 'blue comfy' },
  { file: 'lovart.png', variant: 'light lovart' },
  { file: 'openclaw-color.png', variant: 'dark openclaw' },
  { file: 'nanobanana-color.png', variant: 'light banana' },
];

const infoItems = [
  {
    icon: School,
    text: '京都艺术大学 交互设计硕士在读',
  },
  {
    icon: Cake,
    text: '2001.11.28',
  },
  {
    icon: Phone,
    text: '13343444202',
  },
  {
    icon: Mail,
    text: '13343444202@163.com',
  },
];

const abilities = [
  '用户研究需求分析',
  '多平台产品设计',
  'AI视觉生成设计',
  '产品信息架构设计',
  '高保真原型设计',
  'AI设计流程构建',
  '用户体验交互设计',
  '产品技术落地',
  'AI辅助设计提效',
  '设计系统规范搭建',
  '多部门协同工作',
  'Vibe Coding',
];

const timeline = [
  {
    date: '2022.6',
    text: '东风汽车  悦享交通部门  人机交互设计师实习生',
  },
  {
    date: '2025.4',
    text: '京都艺术大学  交互设计硕士入学',
  },
  {
    date: '2025.5',
    text: '微信小程序解决方案挑战赛  松屋银座体验设计',
  },
  {
    date: '2027.3',
    text: '京都艺术大学  毕业预定',
  },
];

const projectPaths: Partial<Record<View, string>> = {
  'project-01': '/projects/matsuya-ginza',
  'project-02': '/projects/yuexiang-zhixing',
  'project-04': '/projects/japan-portfolio',
};

const insidePaths: Record<InsidePage, string> = {
  about: '/about',
  contents: '/contents',
};

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

function getRouteState(): { view: View; insidePage: InsidePage } {
  if (window.location.pathname === projectPaths['project-01']) {
    return { view: 'project-01', insidePage: 'contents' };
  }

  if (window.location.pathname === projectPaths['project-02']) {
    return { view: 'project-02', insidePage: 'contents' };
  }

  if (window.location.pathname === projectPaths['project-04']) {
    return { view: 'project-04', insidePage: 'contents' };
  }

  if (window.location.pathname === insidePaths.contents) {
    return { view: 'inside', insidePage: 'contents' };
  }

  if (window.location.pathname === insidePaths.about) {
    return { view: 'inside', insidePage: 'about' };
  }

  return { view: 'home', insidePage: 'about' };
}

function getHistoryDepth() {
  const state = window.history.state as AppHistoryState | null;

  return typeof state?.portfolioDepth === 'number' ? state.portfolioDepth : 0;
}

function createHistoryState(depth: number): AppHistoryState {
  return {
    portfolioSite: true,
    portfolioDepth: depth,
  };
}

function preloadProjectPages(pages: string[], count = 2) {
  pages.slice(0, count).forEach((src) => {
    const image = new Image();
    image.src = src;
    void image.decode?.().catch(() => undefined);
  });
}

function getProjectPages(project: Project) {
  return project.pages ?? (project.image ? [project.image] : []);
}

type ProjectPageImageProps = {
  height: number;
  index: number;
  page: string;
  title: string;
  width: number;
};

function ProjectPageImage({ height, index, page, title, width }: ProjectPageImageProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const image = imageRef.current;

    if (!image) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.18,
      },
    );

    observer.observe(image);

    return () => observer.disconnect();
  }, []);

  return (
    <img
      alt={`${title} 第 ${index + 1} 页`}
      className={`project-page-image ${isInView && isLoaded ? 'is-visible' : ''}`}
      decoding="async"
      height={height}
      loading="eager"
      onLoad={() => setIsLoaded(true)}
      ref={imageRef}
      src={page}
      width={width}
    />
  );
}

function AboutPage() {
  return (
    <section className="about-page" aria-label="个人介绍">
      <div className="about-left">
        <h1>ABOUT ME</h1>
        <header className="about-name">
          <h2>危 箫</h2>
          <p><span>UX</span> Designer</p>
        </header>

        <section className="about-info">
          <h3>基本信息</h3>
          <ul>
            {infoItems.map((item) => {
              const Icon = item.icon;

              return (
                <li key={item.text}>
                  <Icon aria-hidden="true" />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="about-bio">
          <h3>关于我</h3>
          <p>
            我是一名用户体验设计师。相比于只停留在界面层的设计方式，我更关注设计如何真正推动产品落地。除了UI与UX能力之外，我也会持续学习使用AI工具提升设计效率，并通过Vibe Coding的能力更深入地参与产品实现过程。
          </p>
          <p>
            在AI技术快速发展的背景下，我希望成为一名持续探索新工具与新方法的设计师。当设计方法与技术门槛逐渐降低时，真正决定产品质量的将是设计者的审美能力以及对用户需求的敏锐洞察。这就是我想做的。
          </p>
        </section>
      </div>

      <div className="about-center">
        <h3 className="timeline-title">个人经历</h3>
        <section className="timeline" aria-label="个人时间线">
          {timeline.map((item) => (
            <article className="timeline-item" key={item.date}>
              <time>{item.date}</time>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="tools">
          <h3>工具技能</h3>
          <div className="tool-grid">
            {toolLogos.map((logo) => (
              <span className={`tool-tile ${logo.variant}`} key={logo.file}>
                <img
                  alt=""
                  src={`/assets/about/logos/${logo.file}`}
                />
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="about-right">
        <section className="experience">
          <h3>核心能力</h3>
          <div className="ability-grid">
            {abilities.map((ability) => (
              <span key={ability}>{ability}</span>
            ))}
          </div>
        </section>

        <section className="experience">
          <h3>实习经历</h3>
          <h4>东风汽车  悦享交通部门  人机交互设计师实习生</h4>
          <p>
            参与无人驾驶公交车相关产品设计，在团队中负责多平台界面优化工作，包括无人驾驶公交车的小程序、车辆控制台以及运营调度后台系统。在项目中参与用户体验优化与界面设计方案制定，并与开发团队协作推进产品迭代。
          </p>
        </section>

        <section className="experience">
          <h3>项目经历</h3>
          <h4>微信小程序解决方案挑战赛  松屋银座小程序体验设计</h4>
          <p>
            该项目与京都大学博士团队合作，为松屋银座设计面向赴日游客的数字化购物体验方案。项目通过微信朋友圈小游戏引流，将用户引导至小程序AI助手，并结合线下实体机器人服务提升购物体验。我在项目中负责小程序和游戏的界面设计以及机器人外观与相关宣传视觉设计。该方案进入腾讯微信小程序解决方案挑战赛日本赛区32强，并在腾讯的介绍下与松屋银座展开后续合作。
          </p>
        </section>
      </div>
    </section>
  );
}

type ContentsPageProps = {
  onOpenProject: (project: Project) => void;
};

function ContentsPage({ onOpenProject }: ContentsPageProps) {
  return (
    <section className="contents-canvas" aria-label="目录">
      <h2 className="contents-word">CONTENT</h2>
      {projects.map((project) => (
        <article className={`contents-project contents-project-${project.label}`} key={project.id}>
          <div className="contents-number">{project.label}</div>
          <button
            aria-label={`${project.isReady ? '打开' : '即将开放'}${project.title}`}
            className={`contents-photo-button ${project.contentsImage ? '' : 'is-placeholder'}`}
            onClick={() => onOpenProject(project)}
            type="button"
          >
            {project.contentsImage ? (
              <img className="contents-photo" src={project.contentsImage} alt="" />
            ) : (
              <span className="contents-photo" aria-hidden="true" />
            )}
          </button>
          <h3 className="contents-project-title">{project.title}</h3>
        </article>
      ))}
    </section>
  );
}

function App() {
  const [view, setView] = useState<View>(() => getRouteState().view);
  const [notice, setNotice] = useState('');
  const [homeLeaving, setHomeLeaving] = useState(false);
  const [insidePage, setInsidePage] = useState<InsidePage>(() => getRouteState().insidePage);
  const [aboutAnimationKey, setAboutAnimationKey] = useState(0);
  const [contentsAnimationKey, setContentsAnimationKey] = useState(0);
  const historyDepthRef = useRef(getHistoryDepth());
  const activeProject = projects.find((project) => project.id === view);

  useLayoutEffect(() => {
    const resetScroll = () => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ left: 0, top: 0, behavior: 'auto' });
    };

    resetScroll();
    const frame = window.requestAnimationFrame(resetScroll);
    const timeout = window.setTimeout(resetScroll, 80);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [view]);

  useEffect(() => {
    if (view === 'inside' && insidePage === 'contents') {
      preloadProjectPages(project01Pages);
      preloadProjectPages(project02Pages);
      preloadProjectPages(project04Pages);
    }
  }, [insidePage, view]);

  useEffect(() => {
    if (activeProject?.isReady) {
      const pages = getProjectPages(activeProject);
      preloadProjectPages(pages, pages.length);
    }
  }, [activeProject]);

  useEffect(() => {
    window.history.replaceState(createHistoryState(historyDepthRef.current), '', window.location.pathname);

    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as AppHistoryState | null;
      historyDepthRef.current = typeof state?.portfolioDepth === 'number' ? state.portfolioDepth : 0;
      const routeState = getRouteState();
      setInsidePage(routeState.insidePage);
      setView(routeState.view);
    };

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const replacePath = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.replaceState(createHistoryState(historyDepthRef.current), '', path);
    }
  };

  const updatePath = (path: string) => {
    if (window.location.pathname !== path) {
      const nextDepth = historyDepthRef.current + 1;
      historyDepthRef.current = nextDepth;
      window.history.pushState(createHistoryState(nextDepth), '', path);
    }
  };

  const goBackOr = (fallback: () => void) => {
    if (historyDepthRef.current > 0) {
      window.history.back();
      return;
    }

    fallback();
  };

  const enterPortfolio = () => {
    if (homeLeaving) {
      return;
    }

    setHomeLeaving(true);
    window.setTimeout(() => {
      setAboutAnimationKey((key) => key + 1);
      setInsidePage('about');
      updatePath(insidePaths.about);
      setView('inside');
      setHomeLeaving(false);
    }, 460);
  };

  const showAbout = () => {
    if (insidePage !== 'about') {
      setAboutAnimationKey((key) => key + 1);
    }

    updatePath(insidePaths.about);
    setInsidePage('about');
  };

  const showContents = () => {
    if (insidePage !== 'contents') {
      setContentsAnimationKey((key) => key + 1);
    }

    updatePath(insidePaths.contents);
    setInsidePage('contents');
  };

  const returnToContents = () => {
    setContentsAnimationKey((key) => key + 1);
    setInsidePage('contents');
    replacePath(insidePaths.contents);
    setView('inside');
  };

  const returnHome = () => {
    setNotice('');
    setHomeLeaving(false);
    setInsidePage('about');
    replacePath('/');
    setView('home');
  };

  const openProject = (project: Project) => {
    if (!project.isReady) {
      setNotice('项目 03 还没有放入详情页');
      window.setTimeout(() => setNotice(''), 1800);
      return;
    }

    const pages = getProjectPages(project);
    preloadProjectPages(pages, pages.length);
    updatePath(projectPaths[project.id] ?? '/');
    setView(project.id);
  };

  if (activeProject?.isReady) {
    const projectPages = getProjectPages(activeProject);

    return (
      <main className={`project-view ${activeProject.id}`}>
        <button className="home-return-button project-return-button" onClick={returnToContents} type="button" aria-label="返回目录页">
          <ChevronLeft aria-hidden="true" />
        </button>
        <section className="project-pages" aria-label={activeProject.title}>
          {projectPages.map((page, index) => (
            <figure
              className="project-page-frame"
              key={page}
              style={
                activeProject.pageAspectRatios?.[index] || activeProject.pageAspectRatio
                  ? { aspectRatio: activeProject.pageAspectRatios?.[index] ?? activeProject.pageAspectRatio }
                  : undefined
              }
            >
              <ProjectPageImage
                height={activeProject.pageImageHeights?.[index] ?? activeProject.pageImageHeight ?? 2160}
                index={index}
                page={page}
                title={activeProject.title}
                width={activeProject.pageImageWidths?.[index] ?? activeProject.pageImageWidth ?? 3840}
              />
            </figure>
          ))}
        </section>
      </main>
    );
  }

  if (view === 'inside') {
    return (
      <main className={`inside-view is-showing-${insidePage}`}>
        <div className="inside-action-layer">
          <button className="home-return-button" onClick={returnHome} type="button" aria-label="返回首页">
            <ChevronLeft aria-hidden="true" />
          </button>
        </div>

        <section className="stage-page about-stage" id="about">
          <div className="stage-canvas" key={aboutAnimationKey}>
            <AboutPage />
          </div>
        </section>

        <section className="stage-page contents-page" id="contents">
          <div className="stage-canvas" key={contentsAnimationKey}>
            <ContentsPage onOpenProject={openProject} />
          </div>
        </section>

        <nav className="side-pager" aria-label="页面切换">
          <button
            aria-current={insidePage === 'about' ? 'page' : undefined}
            aria-label="切换到个人页"
            className={insidePage === 'about' ? 'is-active' : ''}
            onClick={showAbout}
            type="button"
          />
          <button
            aria-current={insidePage === 'contents' ? 'page' : undefined}
            aria-label="切换到目录页"
            className={insidePage === 'contents' ? 'is-active' : ''}
            onClick={showContents}
            type="button"
          />
        </nav>

        <div className={`notice ${notice ? 'is-visible' : ''}`}>{notice}</div>
      </main>
    );
  }

  return (
    <main className={`home-view ${homeLeaving ? 'is-leaving' : ''}`}>
      <section className="home-composition" aria-label="危箫个人作品集首页">
        <div className="home-scale-frame">
          <div className="home-artboard">
            <div className="home-gray-block" />
            <img className="home-person" src="/assets/home/person.png" alt="" />
            <div className="home-title">
              <h1>PORTFOLIO</h1>
              <p>
                <span>UX DESIGN</span>
                <strong>2026</strong>
              </p>
            </div>
            <button
              aria-label="进入作品集"
              className="enter-hotspot"
              disabled={homeLeaving}
              onClick={enterPortfolio}
              type="button"
            >
              <i aria-hidden="true" />
              <span>进入作品集</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
