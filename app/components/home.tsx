"use client";

require("../polyfill");

import { useState, useEffect } from "react";
import Login from '../login'
import styles from "./home.module.scss";
import BotIcon from "../icons/bot.png";
import LoadingIcon from "../icons/three-dots.svg";
import NextImage from "next/image";

import { getCSSVar, useMobileScreen } from "../utils";

import dynamic from "next/dynamic";
import { Path, SlotID } from "../constant";
import { ErrorBoundary } from "./error";

import {
  HashRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { SideBar } from "./sidebar";
import { useAppConfig } from "../store/config";
import { useChatStore } from "../store/chat";

export function Loading(props: { noLogo?: boolean }) {
  return (
    <div className={styles["loading-content"] + " no-dark"}>
      {/* {!props.noLogo && <BotIcon />} */}
      {!props.noLogo && <NextImage
              src={BotIcon.src}
              alt="logo"
              width={50}
              height={50}
            />}
      <LoadingIcon />
    </div>
  );
}

const Settings = dynamic(async () => (await import("./settings")).Settings, {
  loading: () => <Loading noLogo />,
});

const Chat = dynamic(async () => (await import("./chat")).Chat, {
  loading: () => <Loading noLogo />,
});

const NewChat = dynamic(async () => (await import("./new-chat")).NewChat, {
  loading: () => <Loading noLogo />,
});

const MaskPage = dynamic(async () => (await import("./mask")).MaskPage, {
  loading: () => <Loading noLogo />,
});

export function useSwitchTheme() {
  const config = useAppConfig();

  useEffect(() => {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");

    if (config.theme === "dark") {
      document.body.classList.add("dark");
    } else if (config.theme === "light") {
      document.body.classList.add("light");
    }

    const metaDescriptionDark = document.querySelector(
      'meta[name="theme-color"][media*="dark"]',
    );
    const metaDescriptionLight = document.querySelector(
      'meta[name="theme-color"][media*="light"]',
    );

    if (config.theme === "auto") {
      metaDescriptionDark?.setAttribute("content", "#151515");
      metaDescriptionLight?.setAttribute("content", "#fafafa");
    } else {
      const themeColor = getCSSVar("--theme-color");
      metaDescriptionDark?.setAttribute("content", themeColor);
      metaDescriptionLight?.setAttribute("content", themeColor);
    }
  }, [config.theme]);
}

const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState<boolean>(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  return hasHydrated;
};

const loadAsyncGoogleFont = () => {
  const linkEl = document.createElement("link");
  linkEl.rel = "stylesheet";
  linkEl.href =
    "/google-fonts/css2?family=Noto+Sans+SC:wght@300;400;700;900&display=swap";
  document.head.appendChild(linkEl);
};

function Screen() {
  const chatStore = useChatStore();
  const config = useAppConfig();
  const location = useLocation();
  const isHome = location.pathname === Path.Home;
  const isMobileScreen = useMobileScreen();
  const [code,setCode]= useState(chatStore.type)
  
  useEffect(() => {
    loadAsyncGoogleFont();
  }, []);
  useEffect(() => {
    setCode(chatStore.type)
  }, [chatStore,chatStore.type]);

  const changeType = ()=>{
    chatStore.backType(0)
    setCode(0)
  }
  const changePupType = (text:string)=>{
    chatStore.changePupType(text)
  }
  const changeLogin = (text:boolean,code?:number)=>{
    if(!code){
      chatStore.changeLogin(String(text))
    }
    if(!text){
      setCode(0)
    }
    else{
      if(code===402){
        chatStore.changePupType('buy')
      }
      setCode(401)
    }
  }

  return (
    <div>
      {code===401?(<Login name={[chatStore.pupType,changeType,changePupType,changeLogin]} />):(<div />)}
        <div
          className={
            styles.container +
            ` ${
              config.tightBorder && !isMobileScreen
                ? styles["tight-container"]
                : styles.container
            }`
          }
        >
          <SideBar name={changeLogin} className={isHome ? styles["sidebar-show"] : ""} />

          <div className={styles["window-content"]} id={SlotID.AppBody}>
            <Routes>
              <Route path={Path.Home} element={<Chat/>} />
              <Route path={Path.NewChat} element={<NewChat />} />
              <Route path={Path.Masks} element={<MaskPage />} />
              <Route path={Path.Chat} element={<Chat name={changeLogin} />} />
              <Route path={Path.Settings} element={<Settings />} />
            </Routes>
          </div>
        </div>
    </div>
  );
}

export function Home() {
  useSwitchTheme();

  if (!useHasHydrated()) {
    return <Loading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Screen />
      </Router>
    </ErrorBoundary>
  );
}
