function signup(e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const mobile = document.getElementById("mobile").value;
  const birthday = document.getElementById("birthday").value;

  // 🔢 Auto-calculate age
  const birthDate = new Date(birthday);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const btn = e.target.querySelector("button");
setButtonLoading(btn, true);


  fetch("http://localhost:4000/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name,
      email,
      password,
      mobile,
      birthday,
      age
    })
  })
  

    .then(res => res.json())
    .then(data => {
      setButtonLoading(btn, false);
      if (data.error || data.msg) {
        alert(data.error || data.msg);
        return;
      }

      alert("Account created successfully!");
      window.location.href = "/login.html";
    })
    

    .catch(err => {
      console.error(err);
      setButtonLoading(btn, false);
      alert("Signup failed");
    });
}


function login(e) {
  e.preventDefault();

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  const btn = e.target.querySelector("button");
setButtonLoading(btn, true);


  fetch("http://localhost:4000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      email: emailInput.value,
      password: passwordInput.value
    })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("Invalid email or password");
      }
      return res.json();
    })
    .then(() => {
  window.location.href = "/index.html";
})

    .catch(err => {
      alert(err.message);
    });
}
function requestReset(e) {
  e.preventDefault();

  const email = document.getElementById("email").value;

  const btn = e.target.querySelector("button");
setButtonLoading(btn, true);


  fetch("/api/auth/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed");
      return res.json();
    })
    .then(() => {
      showToast("Reset link sent to your email 📧");
    })
    .catch(() => {
      showToast("If the email exists, a reset link was sent.");
    });
}

