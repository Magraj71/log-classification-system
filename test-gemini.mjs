async function listModels() {
  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDHWn5oLj27mOFpnU7m6WRprdBmdGSXyjs");
    const data = await response.json();
    console.log(JSON.stringify(data.models?.map(m => m.name) || data, null, 2));
  } catch (e) {
    console.error(e);
  }
}

listModels();
