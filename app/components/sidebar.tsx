import { useEffect, useRef, useState } from "react";

import styles from "./home.module.scss";

import { IconButton } from "./button";
import SettingsIcon from "../icons/settings.svg";
import SendWhiteIcon from "../icons/plugin.svg";
import GithubIcon from "../icons/github.svg";
import ChatGptIcon from "../icons/brain.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/pause.svg";
import MaskIcon from "../icons/mask.svg";
import PluginIcon from "../icons/github.svg";

import Locale from "../locales";

import { useAppConfig, useChatStore } from "../store";

import {
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  NARROW_SIDEBAR_WIDTH,
  Path,
  REPO_URL,
} from "../constant";

import { Link, useNavigate } from "react-router-dom";
import { useMobileScreen } from "../utils";
import dynamic from "next/dynamic";
import { showToast } from "./ui-lib";
import { TRUE } from "sass";

const ChatList = dynamic(async () => (await import("./chat-list")).ChatList, {
  loading: () => null,
});

function useHotKey() {
  const chatStore = useChatStore();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        const n = chatStore.sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = chatStore.currentSessionIndex;
        if (e.key === "ArrowUp") {
          chatStore.selectSession(limit(i - 1));
        } else if (e.key === "ArrowDown") {
          chatStore.selectSession(limit(i + 1));
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
}

function useDragSideBar() {
  const limit = (x: number) => Math.min(MAX_SIDEBAR_WIDTH, x);

  const config = useAppConfig();
  const startX = useRef(0);
  const startDragWidth = useRef(config.sidebarWidth ?? 300);
  const lastUpdateTime = useRef(Date.now());

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (Date.now() < lastUpdateTime.current + 50) {
      return;
    }
    lastUpdateTime.current = Date.now();
    const d = e.clientX - startX.current;
    const nextWidth = limit(startDragWidth.current + d);
    config.update((config) => (config.sidebarWidth = nextWidth));
  });

  const handleMouseUp = useRef(() => {
    startDragWidth.current = config.sidebarWidth ?? 300;
    window.removeEventListener("mousemove", handleMouseMove.current);
    window.removeEventListener("mouseup", handleMouseUp.current);
  });

  const onDragMouseDown = (e: MouseEvent) => {
    startX.current = e.clientX;

    window.addEventListener("mousemove", handleMouseMove.current);
    window.addEventListener("mouseup", handleMouseUp.current);
  };
  const isMobileScreen = useMobileScreen();
  const shouldNarrow =
    !isMobileScreen && config.sidebarWidth < MIN_SIDEBAR_WIDTH;

  useEffect(() => {
    const barWidth = shouldNarrow
      ? NARROW_SIDEBAR_WIDTH
      : limit(config.sidebarWidth ?? 300);
    const sideBarWidth = isMobileScreen ? "100vw" : `${barWidth}px`;
    document.documentElement.style.setProperty("--sidebar-width", sideBarWidth);
  }, [config.sidebarWidth, isMobileScreen, shouldNarrow]);

  return {
    onDragMouseDown,
    shouldNarrow,
  };
}

export function SideBar(props: { className?: string,name?:any }) {
  const chatStore = useChatStore();
  const [isLoginText,setLogin]= useState('初始值')

  // drag side bar
  const { onDragMouseDown, shouldNarrow } = useDragSideBar();
  const navigate = useNavigate();
  const config = useAppConfig();

  const exit = ()=>{
    if(confirm('是否确认退出登录？')){
      alert('已退出登录！')
      setTimeout(()=>{
        localStorage.clear()
      pupLogin()
      setLogin(''+localStorage.getItem('loginInfo'))
      },500)
    }
  }

  const pupLogin = ()=>{
    chatStore.changePupType('login')
    props.name(true)
  }
  const pupBuy = ()=>{
    if(!localStorage.getItem("loginInfo")){
      alert('请先登录账号再充值')
      chatStore.changePupType('login')
    }
    else{
      chatStore.changePupType('buy')
    }
    props.name(true)
  }

  const FeedBack = (index:number)=>{
    location.href=index?"https://yunwoooo.feishu.cn/share/base/form/shrcn3DPSvAIomT34VHSMs5Atff":"https://yunwoooo.feishu.cn/share/base/form/shrcnohDkxJQfdagJNnXYRBd1If"
  }

  useHotKey();

  return (
    <div
      className={`${styles.sidebar} ${props.className} ${
        shouldNarrow && styles["narrow-sidebar"]
      }`}
    >
      <div className={styles["sidebar-logo"] + " no-dark"}></div>
      <div className={styles["sidebar-header"]}>
        <div className={styles["sidebar-title"]}>地主家的傻儿子</div>
        <div className={styles["sidebar-sub-title"]}>
          与傻儿子畅聊的快乐时光
        </div>
      </div>
      <div
        className={styles["sidebar-body"]}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            navigate(Path.Home);
          }
        }}
      >
        {/* 聊天列表 */}
        <ChatList narrow={shouldNarrow} />
        {/* 新的聊天 */}
        <div className={styles["sidebar-header-bar"]}>
          <IconButton
            lang={true}
            icon={<AddIcon />}
            className={styles["sidebar-bar-button"]}
            text={shouldNarrow ? undefined : Locale.Home.NewChat}
            onClick={() => {
              if (config.dontShowMaskSplashScreen) {
                chatStore.newSession();
                navigate(Path.Chat);
              } else {
                navigate(Path.NewChat);
              }
            }}
            shadow
          />
        </div>
      </div>
      <div className={styles["sidebar-top"]}>
        <div className={styles["sidebar-box"]} >
        {/* 问题反馈 */}
          <div className={styles["sidebar-header-bars"]} onClick={()=>FeedBack(0)}>
            <IconButton
              icon={<SendWhiteIcon />}
              text={shouldNarrow ? undefined : '问题反馈'}
              className={styles["sidebar-bar-button"]}
              shadow
            />
          </div>
        {/* 产品改进 */}
          <div className={styles["sidebar-header-bars"]} onClick={()=>FeedBack(1)}>
            <IconButton
              icon={<PluginIcon />}
              text={shouldNarrow ? undefined : '产品改进'}
              className={styles["sidebar-bar-button"]}
              shadow
            />
          </div>
          </div>
        {/* 面具按钮 */}
        <div className={styles["sidebar-header-bar"]}>
          <IconButton
            icon={<MaskIcon />}
            text={shouldNarrow ? undefined : Locale.Mask.Name}
            className={styles["sidebar-bar-button"]}
            onClick={() =>
              navigate(Path.NewChat, { state: { fromHome: true } })
            }
            shadow
          />
        </div>
        {/* 删除对话
        <div className={styles["sidebar-header-bar"]}>
          <IconButton
            icon={<CloseIcon />}
            className={styles["sidebar-bar-button"]}
            text="删除"
            onClick={() => {
              if (confirm(Locale.Home.DeleteChat)) {
                chatStore.deleteSession(chatStore.currentSessionIndex);
              }
            }}1
          />
        </div> */}
        {/* 设置按钮 */}
        {/* <Link to={Path.Settings} style={{ textDecoration: "none" }}>
          <div className={styles["sidebar-header-bar"]}>
            <IconButton
              icon={<SettingsIcon />}
              className={styles["sidebar-bar-button"]}
              lang={true}
              text={shouldNarrow ? undefined : Locale.Home.Set}
              shadow
            />
          </div>
        </Link> */}
        {/* 设置按钮 */}
        <Link to={Path.Settings} style={{ textDecoration: "none" }}>
          <div className={styles["sidebar-header-bar"]}>
            <IconButton
              icon={<SettingsIcon />}
              text={shouldNarrow ? undefined : Locale.Home.Set}
              className={styles["sidebar-bar-button"]}
              shadow
            />
          </div>
        </Link>
        {/* 充值按钮 */}
        <div className={styles["sidebar-header-bar"]} onClick={pupBuy}>
            <IconButton
              icon={<ChatGptIcon />}
              text={shouldNarrow ? undefined : "充值"}
              className={styles["sidebar-bar-button"]}
              shadow
            />
          </div>
        {/* 登录/退出登录 */}
        {
          chatStore.login!=='false'&&isLoginText&&!localStorage.getItem('loginInfo')?(
            <div className={styles["sidebar-header-bar"]} onClick={pupLogin}>
            <IconButton
              icon={<CloseIcon />}
              text={shouldNarrow ? undefined : "登录"}
              className={styles["sidebar-bar-button"]}
              shadow
            />
          </div>
          ):(
            <div className={styles["sidebar-header-bar"]} onClick={exit}>
            <IconButton
              icon={<CloseIcon />}
              text={shouldNarrow ? undefined : "退出登录"}
              className={styles["sidebar-bar-button"]}
              shadow
            />
          </div>
          )
        }
          
      </div>
      <div
        className={styles["sidebar-drag"]}
        onMouseDown={(e) => onDragMouseDown(e as any)}
      ></div>
    </div>
  );
}
