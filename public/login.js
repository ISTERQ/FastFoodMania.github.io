document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("https://fastfoodmania-api.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include" // если сервер работает с cookie
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.userId);
      window.location.href = "https://fastfoodmania-github-io.onrender.com/";
    } else {
      alert(data.message);
    }
  } catch (err) {
    console.error("Ошибка входа:", err);
  }
});
