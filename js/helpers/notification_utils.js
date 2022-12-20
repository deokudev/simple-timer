// import chrome_extension_utils.js

const playSound = (msg) => {
  if (!msg) return;
  chrome.tts.speak(
    msg,
    {
      lang: "ko-KR",
      rate: 2.0, // 2 배속
      volume: 1, // 0 ~ 1
      enqueue: false, // false일 경우, 겹칠 때 인터럽트됨
      onEvent: (event) => {
        if (event.type == "error") {
          console.log("Error: " + event.errorMessage);
        }
      },
    },
    () => {
      if (chrome.runtime.lastError) {
        console.log("Error: " + chrome.runtime.lastError.message);
      }
    }
  );
};

const sendTelegramMsg = async (msg) => {
  if (!msg) return;
  const botToken = await getStorageItem("telegram_token");
  const chatId = await getStorageItem("telegram_chatId");

  if (!botToken || !chatId) {
    return;
  }

  const encodedMsg = encodeURIComponent(msg);
  const url = `https://api.telegram.org/bot${botToken}/sendmessage?chat_id=${chatId}&text=${encodedMsg}`;

  await fetch(url);
};
